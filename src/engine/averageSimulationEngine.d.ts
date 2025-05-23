import { ISimulationEngine, SimulationParameters, SimulationState } from './types';
export declare class AverageSimulationEngine implements ISimulationEngine {
    private params;
    private state;
    constructor(params: SimulationParameters);
    private initialize;
    private depolarizeAllPairs;
    private exchangePsiPhiComponents;
    private applyBilateralCNOT;
    private performMeasurement;
    private discardFailed;
    private twirlExchange;
    nextStep(): SimulationState;
    step(): SimulationState;
    reset(): SimulationState;
    getCurrentState(): SimulationState;
    updateParams(params: SimulationParameters): void;
}
