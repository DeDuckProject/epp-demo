import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';
export declare const PAULI_TWIRL_SEQUENCES: Array<Array<'x' | 'y' | 'z'>>;
/**
 * Get Pauli twirl operator for a specified rotation sequence.
 *
 * @param sequence Array of 'x', 'y', 'z' indicating rotation axes
 * @returns Bilateral π/2 rotation operator (U ⊗ U)
 */
export declare function getPauliTwirlOperator(sequence: Array<'x' | 'y' | 'z'>): Matrix;
/**
 * Apply random Pauli twirling to a 2-qubit density matrix.
 *
 * This creates a Werner state by applying one of 12 bilateral rotations randomly.
 * In the Monte Carlo approach, we just need one random rotation rather than the average.
 *
 * @param rho Two-qubit density matrix
 * @returns Twirled density matrix
 */
export declare function pauliTwirl(rho: DensityMatrix): DensityMatrix;
