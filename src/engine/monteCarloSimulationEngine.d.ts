import { SimulationParameters, SimulationState, ISimulationEngine } from './types';
/**
 * Monte Carlo Simulation Engine that uses the computational basis for calculations
 * and randomizes operations rather than computing averages.
 */
export declare class MonteCarloSimulationEngine implements ISimulationEngine {
    private params;
    private state;
    constructor(params: SimulationParameters);
    private initialize;
    private applyRandomTwirling;
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
