import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';
/**
 * Apply a set of Kraus operators to the density matrix.
 */
declare function applyKraus(rho: DensityMatrix, ks: Matrix[]): DensityMatrix;
/**
 * Depolarizing channel on a single qubit with probability p. Note: In this implementation, the channel is completely depolarizing when p=0.75.
 */
export declare function applyDepolarizing(rho: DensityMatrix, qubit: number, p: number): DensityMatrix;
/**
 * Dephasing (phase-flip) channel on a single qubit with probability p using 2 Kraus operators
 */
export declare function applyDephasing(rho: DensityMatrix, qubit: number, p: number): DensityMatrix;
export declare function applyAmplitudeDamping(rho: DensityMatrix, qubit: number, gamma: number): DensityMatrix;
/**
 * Uniform noise channel that applies a fractional random unitary to a specific qubit
 * @param rho The density matrix to apply noise to
 * @param qubit The target qubit index to apply noise to
 * @param noiseStrength Parameter from 0 to 1, where 1 applies the full random unitary and 0 applies identity
 */
export declare function applyUniformNoise(rho: DensityMatrix, qubit: number, noiseStrength: number): DensityMatrix;
export declare const _testing: {
    applyKraus: typeof applyKraus;
    applyAmplitudeDamping: typeof applyAmplitudeDamping;
    applyUniformNoise: typeof applyUniformNoise;
};
export {};
