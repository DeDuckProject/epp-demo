import { SimulationEngine } from '../engine/simulationEngine';
import { SimulationParameters, SimulationState } from '../engine/types';

export class SimulationController {
  private engine: SimulationEngine;
  private onStateChange: (state: SimulationState) => void;
  
  constructor(initialParams: SimulationParameters, onStateChange: (state: SimulationState) => void) {
    this.engine = new SimulationEngine(initialParams);
    this.onStateChange = onStateChange;
    
    // Initial state notification
    this.onStateChange(this.engine.getCurrentState());
  }
  
  public step(): void {
    const newState = this.engine.step();
    this.onStateChange(newState);
  }
  
  public reset(): void {
    const newState = this.engine.reset();
    this.onStateChange(newState);
  }
  
  public runUntilComplete(): void {
    let state = this.engine.getCurrentState();
    
    // To prevent infinite loops, add a safety exit condition
    const maxRounds = 100;
    let rounds = 0;
    
    while (!state.complete && rounds < maxRounds) {
      state = this.engine.step();
      rounds++;
    }
    
    this.onStateChange(state);
  }
  
  public updateParameters(params: SimulationParameters): void {
    this.engine.updateParams(params);
    this.onStateChange(this.engine.getCurrentState());
  }
} 