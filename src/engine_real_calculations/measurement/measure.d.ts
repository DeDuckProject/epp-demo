import { DensityMatrix } from '../matrix/densityMatrix';
/**
 * Measure a single qubit in computational basis, returning outcome, its probability, and the post-measurement state.
 * Uses big-endian convention (qubit 0 = most significant bit).
 */
export declare function measureQubit(rho: DensityMatrix, qubit: number): {
    outcome: 0 | 1;
    probability: number;
    postState: DensityMatrix;
};
