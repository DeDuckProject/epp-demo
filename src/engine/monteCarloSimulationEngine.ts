import {QubitPair, SimulationParameters, SimulationState, ISimulationEngine, Basis} from './types';
import {DensityMatrix} from "../engine_real_calculations/matrix/densityMatrix";
import {applyAmplitudeDamping, applyUniformNoise} from "../engine_real_calculations/channels/noise";
import {fidelityFromComputationalBasisMatrix, BellState} from "../engine_real_calculations/bell/bell-basis";
import {pauliTwirl} from "../engine_real_calculations/operations/pauliTwirling";
import {applyPauli, applyCNOT, tensor, measureQubit} from "../engine_real_calculations";
import {partialTrace} from "../engine_real_calculations/operations/partialTrace";
import {preparePairsForCNOT} from "./operations";

/**
 * Monte Carlo Simulation Engine that uses the computational basis for calculations
 * and randomizes operations rather than computing averages.
 */
export class MonteCarloSimulationEngine implements ISimulationEngine {
  private params: SimulationParameters;
  private state: SimulationState;
  
  constructor(params: SimulationParameters) {
    this.params = params;
    this.state = this.initialize();
  }
  
  private initialize(): SimulationState {
    const pairs: QubitPair[] = [];
    
    // Create initial Bell pairs (Psi-minus) and apply noise to Bob's qubit
    for (let i = 0; i < this.params.initialPairs; i++) {
      // Create a perfect Bell state |Ψ-⟩ = (|01⟩ - |10⟩)/√2
      const pureRho = DensityMatrix.bellPsiMinus();
      
      // Apply dephasing noise to Bob's qubit (qubit 1)
      // const noisyRho = applyDephasing(pureRho, /* bobQubit= */ 1, this.params.noiseParameter);
      const noisyRho = applyAmplitudeDamping(pureRho, /* bobQubit= */ 1, this.params.noiseParameter);
      // const noisyRho = applyUniformNoise(pureRho, /* bobQubit= */ 1, this.params.noiseParameter);

      // Calculate fidelity with respect to the Psi-Minus Bell state
      const fidelity = fidelityFromComputationalBasisMatrix(noisyRho, BellState.PSI_MINUS);
      
      pairs.push({
        id: i,
        densityMatrix: noisyRho,
        fidelity,
        basis: Basis.Computational
      });
    }
    
    return {
      pairs,
      round: 0,
      complete: false,
      purificationStep: 'initial'
    };
  }
  
  // Step 1: Apply random twirling operations instead of depolarizing
  private applyRandomTwirling(): void {
    // Apply Pauli twirling to each pair
    this.state.pairs = this.state.pairs.map(pair => {
      // Apply random Pauli twirl to create a Werner state
      const twirledRho = pauliTwirl(pair.densityMatrix);
      
      // Recalculate fidelity with respect to the Psi-Minus Bell state
      const fidelity = fidelityFromComputationalBasisMatrix(twirledRho, BellState.PSI_MINUS);
      
      return {
        ...pair,
        densityMatrix: twirledRho,
        fidelity
      };
    });
    
    this.state.purificationStep = 'twirled';
  }
  
  // Step 2: Exchange |Ψ-⟩ and |Φ+⟩ components by applying Y gate on Alice's qubit
  private exchangePsiPhiComponents(): void {
    // Apply Y gate on Alice's qubit (qubit 0) to exchange Psi-Minus and Phi-Plus
    this.state.pairs = this.state.pairs.map(pair => {
      // Apply Y gate on Alice's qubit to achieve the exchange
      const exchangedRho = applyPauli(pair.densityMatrix, [0], ['Y']);
      
      // Recalculate fidelity with respect to the Phi-Plus Bell state
      const fidelity = fidelityFromComputationalBasisMatrix(exchangedRho, BellState.PHI_PLUS);
      
      return {
        ...pair,
        densityMatrix: exchangedRho,
        fidelity
      };
    });
    
    this.state.purificationStep = 'exchanged';
  }
  
  // Step 3: Apply Bilateral CNOT in computational basis
  private applyBilateralCNOT(): void {
    if (this.state.pairs.length < 2) {
      this.state.complete = true;
      this.state.purificationStep = 'completed';
      return;
    }
    
    const { controlPairs, targetPairs } = preparePairsForCNOT(this.state.pairs);
    const jointStates: DensityMatrix[] = [];
    const updatedControlPairs: QubitPair[] = [];
    const updatedTargetPairs: QubitPair[] = [];
    
    // Create joint states and apply bilateral CNOT for each control-target pair
    for (let i = 0; i < controlPairs.length; i++) {
      const controlPair = controlPairs[i];
      const targetPair = targetPairs[i];
      
      // Create joint 4-qubit state using tensor product 
      // (qubit ordering: Alice's control, Bob's control, Alice's target, Bob's target)
      let jointState = tensor(controlPair.densityMatrix, targetPair.densityMatrix);
      
      // Apply CNOT on Alice's side (qubit 0 controls qubit 2)
      jointState = applyCNOT(jointState, 0, 2);
      
      // Apply CNOT on Bob's side (qubit 1 controls qubit 3)
      jointState = applyCNOT(jointState, 1, 3);
      
      // Store the resulting joint state
      jointStates.push(jointState);
      
      // Update control pair's density matrix by tracing out target qubits (2,3)
      const reducedControlMatrix = partialTrace(jointState, [2, 3]);
      const updatedControlFidelity = fidelityFromComputationalBasisMatrix(
        reducedControlMatrix, 
        BellState.PHI_PLUS // Already in PHI_PLUS basis from the exchange step
      );
      
      // Update target pair's density matrix by tracing out control qubits (0,1)
      const reducedTargetMatrix = partialTrace(jointState, [0, 1]);
      const updatedTargetFidelity = fidelityFromComputationalBasisMatrix(
        reducedTargetMatrix, 
        BellState.PHI_PLUS
      );
      
      // Save updated pairs
      updatedControlPairs.push({
        ...controlPair,
        densityMatrix: reducedControlMatrix,
        fidelity: updatedControlFidelity
      });
      
      updatedTargetPairs.push({
        ...targetPair,
        densityMatrix: reducedTargetMatrix,
        fidelity: updatedTargetFidelity
      });
    }
    
    // Update the state with new pairs and joint states
    this.state.pendingPairs = {
      controlPairs: updatedControlPairs,
      targetPairs: updatedTargetPairs,
      jointStates
    };
    
    // Update the pairs in the main state array
    this.state.pairs = this.state.pairs.map(pair => {
      // Find if this pair is a control or target pair
      const controlIndex = controlPairs.findIndex(p => p.id === pair.id);
      if (controlIndex >= 0) {
        return updatedControlPairs[controlIndex];
      }
      
      const targetIndex = targetPairs.findIndex(p => p.id === pair.id);
      if (targetIndex >= 0) {
        return updatedTargetPairs[targetIndex];
      }
      
      // Otherwise, leave unchanged
      return pair;
    });
    
    this.state.purificationStep = 'cnot';
  }
  
  // Step 4: Perform measurement with Monte Carlo randomization
  private performMeasurement(): void {
    if (!this.state.pendingPairs) {
      console.error("No pending pairs to measure");
      return;
    }
    
    const { controlPairs, jointStates } = this.state.pendingPairs;
    
    if (!jointStates || jointStates.length === 0) {
      console.error("No joint states to measure");
      return;
    }
    
    const results: {
      control: QubitPair;
      successful: boolean;
    }[] = [];
    
    // Process each joint state (4-qubit system after bilateral CNOT)
    for (let i = 0; i < jointStates.length; i++) {
      const controlPair = controlPairs[i];
      const jointState = jointStates[i];
      
      // Measure Alice's target qubit (qubit 2)
      const aliceMeasurement = measureQubit(jointState, 2);
      // console.log('aliceMeasurement', aliceMeasurement);
      // console.log('aliceMeasurement postState', partialTrace(aliceMeasurement.postState, [2]));

      // Measure Bob's target qubit (qubit 3) on the post-measurement state
      const bobMeasurement = measureQubit(aliceMeasurement.postState, 3);
      // console.log('bobMeasurement', bobMeasurement);
      // console.log('bobMeasurement postState', partialTrace(bobMeasurement.postState, [2,3]));
      
      // Success if both measurements yield the same result
      const successful = aliceMeasurement.outcome === bobMeasurement.outcome;
      
      // The post-measurement state is now a 4-qubit state with qubits 2 and 3 measured
      // Trace out qubits 2 and 3 to get the reduced state of the control pair (qubits 0 and 1)
      // const postMeasurementControlState = partialTrace(bobMeasurement.postState, [2, 3]);
      const postMeasurementControlState = partialTrace(bobMeasurement.postState, [0, 1]); // Testing big endian
      // console.log('postMeasurementControlState', postMeasurementControlState);
      
      // Calculate updated fidelity of control pair
      const updatedFidelity = fidelityFromComputationalBasisMatrix(
        postMeasurementControlState,
        BellState.PHI_PLUS
      );
      
      // Create updated control pair with post-measurement state
      const updatedControlPair = {
        ...controlPair,
        densityMatrix: postMeasurementControlState,
        fidelity: updatedFidelity
      };
      
      results.push({
        control: updatedControlPair,
        successful
      });
    }
    
    this.state.pendingPairs.results = results;
    
    // Update the main state.pairs array with post-measurement states for immediate visualization
    this.state.pairs = this.state.pairs.map(pair => {
      // Find if this pair is a control pair that was measured
      const resultIndex = results.findIndex(result => result.control.id === pair.id);
      if (resultIndex >= 0) {
        // Update with post-measurement state
        return results[resultIndex].control;
      }
      // Otherwise, leave unchanged
      return pair;
    });
    
    this.state.purificationStep = 'measured';
  }
  
  // Step 5a: Discard failed pairs (skeleton)
  private discardFailed(): void {
    if (!this.state.pendingPairs || !this.state.pendingPairs.results) {
      console.error("No measurement results to process");
      return;
    }
    
    const newPairs: QubitPair[] = [];
    
    // Keep only successful pairs
    for (const result of this.state.pendingPairs.results) {
      if (result.successful) {
        newPairs.push({
          ...result.control
        });
      }
    }
    
    // If odd number of pairs, the last one doesn't participate
    const { hasUnpairedPair } = preparePairsForCNOT(this.state.pairs);
    if (hasUnpairedPair) {
      newPairs.push(this.state.pairs[this.state.pairs.length - 1]);
    }
    
    this.state.pairs = newPairs;
    this.state.pendingPairs = undefined;
    this.state.purificationStep = 'discard';
  }

  // Step 5b: Twirl and exchange survivors
  private twirlExchange(): void {
    // First check if we've reached our target or can't purify further
    const isComplete = this.state.pairs.length < 2 || 
                     (this.state.pairs.length > 0 && this.state.pairs[0].fidelity >= this.params.targetFidelity);

    // Increment round counter
    this.state.round++;
    
    if (isComplete) {
      this.state.complete = true;
      this.state.purificationStep = 'completed';
    } else {
      // Now apply the operations for the next round
      // First exchange psiPhi components
      this.exchangePsiPhiComponents();
      
      // Then apply random twirling 
      this.applyRandomTwirling();
      
      // Reset to initial state for the next round
      this.state.purificationStep = 'initial';
    }
    
    this.state.pendingPairs = undefined;
  }
  
  // Public methods - same API as AverageSimulationEngine
  
  public nextStep(): SimulationState {
    if (this.state.complete) {
      return this.getCurrentState();
    }
    
    switch (this.state.purificationStep) {
      case 'initial':
        this.applyRandomTwirling();
        break;
      case 'twirled':
        this.exchangePsiPhiComponents();
        break;
      case 'exchanged':
        this.applyBilateralCNOT();
        break;
      case 'cnot':
        this.performMeasurement();
        break;
      case 'measured':
        this.discardFailed();
        break;
      case 'discard':
        this.twirlExchange();
        break;
      case 'twirlExchange':
      case 'completed':
        // Should not happen, but handle it gracefully
        this.state.purificationStep = 'initial';
        break;
    }
    
    return this.getCurrentState();
  }
  
  public step(): SimulationState {
    // Complete a full round of purification
    if (!this.state.complete) {
      if (this.state.purificationStep === 'initial') {
        this.applyRandomTwirling();
      }
      if (this.state.purificationStep === 'twirled') {
        this.exchangePsiPhiComponents();
      }
      if (this.state.purificationStep === 'exchanged') {
        this.applyBilateralCNOT();
      }
      if (this.state.purificationStep === 'cnot') {
        this.performMeasurement();
      }
      if (this.state.purificationStep === 'measured') {
        this.discardFailed();
      }
      if (this.state.purificationStep === 'discard') {
        this.twirlExchange();
      }
    }
    return this.getCurrentState();
  }
  
  public reset(): SimulationState {
    this.state = this.initialize();
    return this.getCurrentState();
  }
  
  public getCurrentState(): SimulationState {
    return { ...this.state };
  }
  
  public updateParams(params: SimulationParameters): void {
    this.params = params;
    this.reset();
  }
} 