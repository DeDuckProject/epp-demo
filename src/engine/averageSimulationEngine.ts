import {ISimulationEngine, QubitPair, SimulationParameters, SimulationState} from './types';
import {createNoisyEPR} from './quantumStates';
import {bilateralCNOT, depolarize, exchangePsiMinusPhiPlus} from './operations';
import {BellState, fidelityFromBellBasisMatrix} from "../engine_real_calculations/bell/bell-basis.ts";

export class AverageSimulationEngine implements ISimulationEngine {
  private params: SimulationParameters;
  private state: SimulationState;

  constructor(params: SimulationParameters) {
    this.params = params;
    this.state = this.initialize();
  }

  private initialize(): SimulationState {
    const pairs: QubitPair[] = [];
    // Create initial noisy EPR pairs in Bell basis
    for (let i = 0; i < this.params.initialPairs; i++) {
      const densityMatrix = createNoisyEPR(this.params.noiseParameter);
      const fidelity = fidelityFromBellBasisMatrix(densityMatrix, BellState.PSI_MINUS);

      pairs.push({
        id: i,
        densityMatrix,
        fidelity
      });
    }

    return {
      pairs,
      round: 0,
      complete: false,
      purificationStep: 'initial'
    };
  }

  // Step 1: Depolarize/Twirl all pairs to convert to Werner form
  private depolarizeAllPairs(): void {
    this.state.pairs = this.state.pairs.map(pair => {
      const wernerMatrix = depolarize(pair.densityMatrix);
      return {
        ...pair,
        densityMatrix: wernerMatrix,
        fidelity: fidelityFromBellBasisMatrix(wernerMatrix, BellState.PSI_MINUS)
      };
    });

    this.state.purificationStep = 'twirled';
  }

  // Step 2: Exchange |Ψ⁻⟩ and |Φ⁺⟩ components
  private exchangePsiPhiComponents(): void {
    this.state.pairs = this.state.pairs.map(pair => {
      const exchangedMatrix = exchangePsiMinusPhiPlus(pair.densityMatrix);
      return {
        ...pair,
        densityMatrix: exchangedMatrix,
        fidelity: fidelityFromBellBasisMatrix(exchangedMatrix, BellState.PHI_PLUS)
      };
    });

    this.state.purificationStep = 'exchanged';
  }

  // Step 3: Apply Bilateral CNOT
  private applyBilateralCNOT(): void {
    if (this.state.pairs.length < 2) {
      this.state.complete = true;
      this.state.purificationStep = 'completed';
      return;
    }

    const controlPairs: QubitPair[] = [];
    const targetPairs: QubitPair[] = [];

    // Group pairs for purification, ensuring we only group complete pairs
    const numPairsToProcess = Math.floor(this.state.pairs.length / 2) * 2;
    for (let i = 0; i < numPairsToProcess; i++) { // Only loop through pairs that will be used
      if (i % 2 === 0) {
        controlPairs.push(this.state.pairs[i]);
      } else {
        targetPairs.push(this.state.pairs[i]);
      }
    }

    this.state.pendingPairs = {
      controlPairs,
      targetPairs
    };

    this.state.purificationStep = 'cnot';
  }

  // Step 4: Perform measurement
  private performMeasurement(): void {
    if (!this.state.pendingPairs) {
      console.error("No pending pairs to measure");
      return;
    }

    const { controlPairs, targetPairs } = this.state.pendingPairs;
    const results = [];

    // Process pairs
    for (let i = 0; i < Math.min(controlPairs.length, targetPairs.length); i++) {
      const controlPair = controlPairs[i];
      const targetPair = targetPairs[i];

      // Apply bilateral CNOT
      const result = bilateralCNOT(controlPair.densityMatrix, targetPair.densityMatrix);

      results.push({
        control: {
          id: controlPair.id,
          densityMatrix: result.afterMeasurement.controlPair,
          fidelity: fidelityFromBellBasisMatrix(result.afterMeasurement.controlPair, BellState.PHI_PLUS)
        },
        successful: result.afterMeasurement.successful
      });
    }

    this.state.pendingPairs.results = results;
    this.state.purificationStep = 'measured';
  }

  // Step 5: Discard failed pairs and prepare for next round
  private discardFailedPairs(): void {
    if (!this.state.pendingPairs || !this.state.pendingPairs.results) {
      console.error("No measurement results to process");
      return;
    }

    const newPairs: QubitPair[] = [];

    // Keep only successful pairs
    for (const result of this.state.pendingPairs.results) {
      if (result.successful) {
        // First swap back |Φ⁺⟩ and |Ψ⁻⟩
        const swappedBack = exchangePsiMinusPhiPlus(result.control.densityMatrix);
        // Then twirl to create Werner state with |Ψ⁻⟩ as target
        const wernerState = depolarize(swappedBack);

        newPairs.push({
          id: result.control.id,
          densityMatrix: wernerState,
          fidelity: fidelityFromBellBasisMatrix(wernerState, BellState.PSI_MINUS)
        });
      }
    }

    // If odd number of pairs, the last one doesn't participate
    if (this.state.pairs.length % 2 !== 0) {
      newPairs.push(this.state.pairs[this.state.pairs.length - 1]);
    }

    this.state.pairs = newPairs;
    this.state.pendingPairs = undefined;
    this.state.purificationStep = 'completed';
    this.state.round++;

    // Check if we've reached our target or can't purify further
    if (this.state.pairs.length < 2 ||
        (this.state.pairs.length > 0 && this.state.pairs[0].fidelity >= this.params.targetFidelity)) {
      this.state.complete = true;
    } else {
      // Reset to initial state for the next round
      this.state.purificationStep = 'initial';
    }
  }

  // Public methods

  public nextStep(): SimulationState {
    if (this.state.complete) {
      return this.getCurrentState();
    }

    switch (this.state.purificationStep) {
      case 'initial':
        this.depolarizeAllPairs();
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
        this.discardFailedPairs();
        break;
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
        this.depolarizeAllPairs();
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
        this.discardFailedPairs();
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