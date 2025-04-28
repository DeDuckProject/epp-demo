/**
 * Utility functions for formatting and analyzing matrix data
 */
import {ComplexNum, Matrix} from "../engine_real_calculations";

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