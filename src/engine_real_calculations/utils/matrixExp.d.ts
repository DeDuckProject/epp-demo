import { Matrix } from '../matrix/matrix';
/**
 * Compute matrix exponential using series expansion: exp(A) = I + A + A²/2! + A³/3! + ...
 * This is a simplified implementation for small matrices
 */
export declare function matrixExp(matrix: Matrix): Matrix;
/**
 * Compute matrix logarithm using element-wise logarithm
 * Note: This is an approximation. True matrix logarithm requires eigenvalue decomposition
 */
export declare function matrixLog(matrix: Matrix): Matrix;
/**
 * Check if a matrix is unitary (U * U† = I) within tolerance
 */
export declare function isUnitary(matrix: Matrix, tolerance?: number): boolean;
