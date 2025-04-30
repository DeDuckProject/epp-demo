/**
 * Utility functions for formatting and analyzing matrix data
 */
import {ComplexNum, Matrix} from "../engine_real_calculations";
import { toBellBasis } from "../engine_real_calculations/bell/bell-basis";

/**
 * Format a complex number for display
 * @param c Complex number to format
 * @param threshold Value below which numbers are treated as zero (default 0.001)
 * @returns Formatted string representation
 */
export function formatComplex(c: ComplexNum, threshold = 0.001): string {
  if (Math.abs(c.re) < threshold && Math.abs(c.im) < threshold) {
    return '0';
  }
  
  let result = '';
  
  if (Math.abs(c.re) >= threshold) {
    result += c.re.toFixed(3);
  }
  
  if (Math.abs(c.im) >= threshold) {
    if (c.im > 0 && result.length > 0) {
      result += '+';
    }
    result += `${c.im.toFixed(3)}i`;
  }
  
  return result || '0';
}

/**
 * Determine if a matrix has significant off-diagonal elements
 * @param matrix Matrix-like object to check
 * @param threshold Value below which numbers are treated as zero (default 0.001)
 * @returns True if any off-diagonal element exceeds the threshold
 */
export function hasOffDiagonalElements(matrix: Matrix, threshold = 0.001): boolean {
  for (let i = 0; i < matrix.rows; i++) {
    for (let j = 0; j < matrix.cols; j++) {
      if (i !== j) {
        const cell = matrix.get(i, j);
        if (Math.abs(cell.re) > threshold || Math.abs(cell.im) > threshold) {
          return true;
        }
      }
    }
  }
  return false;
}

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
export function isWerner(
  matrix: Matrix, 
  basis: 'bell' | 'computational' = 'bell',
  threshold = 0.001
): boolean {
  // If matrix is in computational basis, convert to Bell basis first
  const bellMatrix = basis === 'computational' ? toBellBasis(matrix) : matrix;
  
  // Werner states are diagonal in Bell basis
  return !hasOffDiagonalElements(bellMatrix, threshold);
} 