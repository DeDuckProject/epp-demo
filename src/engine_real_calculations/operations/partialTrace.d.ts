import { DensityMatrix } from '../matrix/densityMatrix';
/**
 * Trace out the specified qubits, returning a reduced density matrix on remaining qubits.
 * Uses little-endian convention.
 */
export declare function partialTrace(rho: DensityMatrix, traceOut: number[]): DensityMatrix;
