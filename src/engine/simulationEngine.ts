import { DensityMatrix, QubitPair, SimulationParameters, SimulationState, PurificationStep } from './types';
import { calculateBellBasisFidelity } from './mathUtils';
import { createNoisyEPR } from './quantumStates';
import { depolarize, bilateralCNOT } from './operations';

export class SimulationEngine {
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
      const fidelity = calculateBellBasisFidelity(densityMatrix);
      
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
        fidelity: calculateBellBasisFidelity(wernerMatrix)
      };
    });
    
    this.state.purificationStep = 'twirled';
  }
  
  // Step 2: Apply Bilateral CNOT
  private applyBilateralCNOT(): void {
    if (this.state.pairs.length < 2) {
      this.state.complete = true;
      this.state.purificationStep = 'completed';
      return;
    }
    
    const controlPairs: QubitPair[] = [];
    const targetPairs: QubitPair[] = [];
    
    // Group pairs for purification
    for (let i = 0; i < this.state.pairs.length; i++) {
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
  
  // Step 3: Perform measurement
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
          fidelity: calculateBellBasisFidelity(result.afterMeasurement.controlPair)
        },
        successful: result.afterMeasurement.successful
      });
    }
    
    this.state.pendingPairs.results = results;
    this.state.purificationStep = 'measured';
  }
  
  // Step 4: Discard failed pairs
  private discardFailedPairs(): void {
    if (!this.state.pendingPairs || !this.state.pendingPairs.results) {
      console.error("No measurement results to process");
      return;
    }
    
    const newPairs: QubitPair[] = [];
    
    // Keep only successful pairs
    for (const result of this.state.pendingPairs.results) {
      if (result.successful) {
        newPairs.push(result.control);
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