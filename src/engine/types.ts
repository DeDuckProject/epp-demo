import { DensityMatrix } from "../engine_real_calculations/matrix/densityMatrix";
import { MonteCarloSimulationEngine } from './monteCarloSimulationEngine';
import { AverageSimulationEngine } from './averageSimulationEngine';

export enum Basis {
  'Bell' = 'bell',
  'Computational' = 'computational'
}

export enum NoiseChannel {
  UniformNoise = 'uniform-noise',
  AmplitudeDamping = 'amplitude-damping',
  Dephasing = 'dephasing',
  Depolarizing = 'depolarizing'
}

export type QubitPair = {
  id: number;
  densityMatrix: DensityMatrix; // Placeholder - will be updated later if needed by other files
  basis: Basis;
  fidelity: number;
};

export type SimulationParameters = {
  initialPairs: number;
  noiseParameter: number;  // Controls the amount of noise in initial pairs
  targetFidelity: number;  // Purification target
  noiseChannel: NoiseChannel; // Type of noise to apply
};

export type PurificationStep = 'initial' | 'twirled' | 'exchanged' | 'cnot' | 'measured' | 'discard' | 'twirlExchange' | 'completed';

export interface SimulationState {
  pairs: QubitPair[];
  round: number;
  complete: boolean;
  purificationStep: PurificationStep;  // Track which step we're on within a round
  averageFidelity: number; // Add average fidelity calculation
  pendingPairs?: { // Store intermediate state during a round
    controlPairs: QubitPair[];
    targetPairs: QubitPair[];
    jointStates?: DensityMatrix[]; // Store the 4-qubit joint states after applying bilateral CNOT
    results?: {
      control: QubitPair;
      successful: boolean;
    }[];
  };
}

// Interface for all simulation engines
export interface ISimulationEngine {
  nextStep(): SimulationState;
  step(): SimulationState;
  reset(): SimulationState;
  getCurrentState(): SimulationState;
  updateParams(params: SimulationParameters): void;
}

// Types of simulation engines available
export enum EngineType {
  /*
    In this simulation type we don't explicitly run the exact quantum operations,
    rather we simulate what should happen in each step. Importantly, in this engine we
    calculate the average result of the twirling operation
   */
  Average = 'average',
  /*
    In the monte-carlo simulation, we run the actual quantum operations in each stage of the protocol.
    When we calculate the twirling procedure we actually randomize the twirling operation and don't calculate the average.
   */
  MonteCarlo = 'monte-carlo',
}

// Factory function to create the appropriate engine
export function createEngine(
  type: EngineType,
  params: SimulationParameters
): ISimulationEngine {
  switch(type) {
    case EngineType.MonteCarlo:
      return new MonteCarloSimulationEngine(params);
    case EngineType.Average:
    default:
      return new AverageSimulationEngine(params);
  }
} 