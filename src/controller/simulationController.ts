import { ISimulationEngine, SimulationParameters, SimulationState, EngineType, createEngine } from '../engine/types';

export class SimulationController {
  private engine: ISimulationEngine;
  private onStateChange: (state: SimulationState) => void;
  private currentParams: SimulationParameters;
  
  constructor(
    initialParams: SimulationParameters, 
    onStateChange: (state: SimulationState) => void,
    engineType: EngineType = EngineType.Average
  ) {
    this.currentParams = initialParams;
    this.engine = createEngine(engineType, initialParams);
    this.onStateChange = onStateChange;
    
    // Initial state notification
    this.onStateChange(this.engine.getCurrentState());
  }
  
  public nextStep(): void {
    const newState = this.engine.nextStep();
    this.onStateChange(newState);
  }
  
  public completeRound(): void {
    this.step();
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
    this.currentParams = params;
    this.engine.updateParams(params);
    this.onStateChange(this.engine.getCurrentState());
  }

  public updateEngineType(type: EngineType): void {
    this.engine = createEngine(type, this.currentParams);
    this.onStateChange(this.engine.getCurrentState());
  }
} 