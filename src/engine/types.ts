import { DensityMatrix } from "../engine_real_calculations/matrix/densityMatrix";

export type QubitPair = {
  id: number;
  densityMatrix: DensityMatrix; // Placeholder - will be updated later if needed by other files
  fidelity: number;
};

export type SimulationParameters = {
  initialPairs: number;
  noiseParameter: number;  // Controls the amount of noise in initial pairs
  targetFidelity: number;  // Purification target
};

export type PurificationStep = 'initial' | 'twirled' | 'exchanged' | 'cnot' | 'measured' | 'completed';

export interface SimulationState {
  pairs: QubitPair[];
  round: number;
  complete: boolean;
  purificationStep: PurificationStep;  // Track which step we're on within a round
  pendingPairs?: { // Store intermediate state during a round
    controlPairs: QubitPair[];
    targetPairs: QubitPair[];
    results?: {
      control: QubitPair;
      successful: boolean;
    }[];
  };
} 