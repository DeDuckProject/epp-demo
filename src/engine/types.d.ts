import { DensityMatrix } from "../engine_real_calculations/matrix/densityMatrix";
export declare enum Basis {
    'Bell' = "bell",
    'Computational' = "computational"
}
export declare enum NoiseChannel {
    UniformNoise = "uniform-noise",
    AmplitudeDamping = "amplitude-damping",
    Dephasing = "dephasing",
    Depolarizing = "depolarizing"
}
export type QubitPair = {
    id: number;
    densityMatrix: DensityMatrix;
    basis: Basis;
    fidelity: number;
};
export type SimulationParameters = {
    initialPairs: number;
    noiseParameter: number;
    targetFidelity: number;
    noiseChannel: NoiseChannel;
};
export type PurificationStep = 'initial' | 'twirled' | 'exchanged' | 'cnot' | 'measured' | 'discard' | 'twirlExchange' | 'completed';
export interface SimulationState {
    pairs: QubitPair[];
    round: number;
    complete: boolean;
    purificationStep: PurificationStep;
    averageFidelity: number;
    pendingPairs?: {
        controlPairs: QubitPair[];
        targetPairs: QubitPair[];
        jointStates?: DensityMatrix[];
        results?: {
            control: QubitPair;
            successful: boolean;
        }[];
    };
}
export interface ISimulationEngine {
    nextStep(): SimulationState;
    step(): SimulationState;
    reset(): SimulationState;
    getCurrentState(): SimulationState;
    updateParams(params: SimulationParameters): void;
}
export declare enum EngineType {
    Average = "average",
    MonteCarlo = "monte-carlo"
}
export declare function createEngine(type: EngineType, params: SimulationParameters): ISimulationEngine;
