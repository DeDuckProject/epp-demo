import { DensityMatrix, QubitPair, SimulationParameters, SimulationState } from './types';
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
      complete: false
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
  }
  
  // Step 2 & 3: Apply Bilateral CNOT and measurement in parallel
  private applyPurificationRound(): void {
    if (this.state.pairs.length < 2) {
      this.state.complete = true;
      return;
    }
    
    // First round requires depolarization to Werner form
    if (this.state.round === 0) {
      this.depolarizeAllPairs();
    }
    
    // Group pairs for purification
    const newPairs: QubitPair[] = [];
    
    // Process pairs two at a time
    for (let i = 0; i < this.state.pairs.length - 1; i += 2) {
      const controlPair = this.state.pairs[i];
      const targetPair = this.state.pairs[i + 1];
      
      // Apply bilateral CNOT
      const result = bilateralCNOT(controlPair.densityMatrix, targetPair.densityMatrix);
      
      // If measurement successful, keep the improved control pair
      if (result.afterMeasurement.successful) {
        const improvedMatrix = result.afterMeasurement.controlPair;
        const newFidelity = calculateBellBasisFidelity(improvedMatrix);
        
        newPairs.push({
          id: controlPair.id,
          densityMatrix: improvedMatrix,
          fidelity: newFidelity
        });
      }
    }
    
    // If odd number of pairs, the last one doesn't participate
    if (this.state.pairs.length % 2 !== 0) {
      newPairs.push(this.state.pairs[this.state.pairs.length - 1]);
    }
    
    this.state.pairs = newPairs;
    this.state.round++;
    
    // Check if we've reached our target or can't purify further
    if (this.state.pairs.length < 2 || 
        (this.state.pairs.length > 0 && this.state.pairs[0].fidelity >= this.params.targetFidelity)) {
      this.state.complete = true;
    }
  }
  
  // Public methods
  
  public step(): SimulationState {
    if (!this.state.complete) {
      this.applyPurificationRound();
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