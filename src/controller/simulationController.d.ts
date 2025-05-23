import { SimulationParameters, SimulationState, EngineType } from '../engine/types';
export declare class SimulationController {
    private engine;
    private onStateChange;
    private currentParams;
    constructor(initialParams: SimulationParameters, onStateChange: (state: SimulationState) => void, engineType?: EngineType);
    nextStep(): void;
    completeRound(): void;
    step(): void;
    reset(): void;
    runUntilComplete(): void;
    updateParameters(params: SimulationParameters): void;
    updateEngineType(type: EngineType): void;
}
