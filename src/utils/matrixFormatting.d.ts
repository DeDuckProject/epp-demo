/**
 * Utility functions for formatting and analyzing matrix data
 */
import { Basis } from "../engine/types";
import { ComplexNum, Matrix } from "../engine_real_calculations";
/**
 * Format a complex number for display
 * @param c Complex number to format
 * @param threshold Value below which numbers are treated as zero (default 0.001)
 * @returns Formatted string representation
 */
export declare function formatComplex(c: ComplexNum, threshold?: number): string;
/**
 * Determine if a matrix has significant off-diagonal elements
 * @param matrix Matrix-like object to check
 * @param threshold Value below which numbers are treated as zero (default 0.001)
 * @returns True if any off-diagonal element exceeds the threshold
 */
export declare function hasOffDiagonalElements(matrix: Matrix, threshold?: number): boolean;
/**
 * Determines if a matrix is in Werner state form by checking for significant off-diagonal elements
 * in the Bell basis representation.
 *
 * A Werner state is diagonal in the Bell basis.
 *
 * @param matrix The matrix to check
 * @param basis The basis the matrix is currently in: 'bell' or 'computational'
 * @param threshold Value below which numbers are treated as zero (default 0.001)
 * @returns True if the matrix represents a Werner state (no significant off-diagonals in Bell basis)
 */
export declare function isWerner(matrix: Matrix, basis?: Basis, threshold?: number): boolean;
