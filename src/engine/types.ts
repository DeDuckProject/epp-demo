export type ComplexNumber = {
  real: number;
  imag: number;
};

export type DensityMatrix = ComplexNumber[][];

export type QubitPair = {
  id: number;
  densityMatrix: DensityMatrix;
  fidelity: number;
};

export type SimulationParameters = {
  initialPairs: number;
  noiseParameter: number;  // Controls the amount of noise in initial pairs
  targetFidelity: number;  // Purification target
};

export type SimulationState = {
  pairs: QubitPair[];
  round: number;
  complete: boolean;
}; 