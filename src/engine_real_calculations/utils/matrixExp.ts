import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';

/**
 * Compute matrix exponential using series expansion: exp(A) = I + A + A²/2! + A³/3! + ...
 * This is a simplified implementation for small matrices
 */
export function matrixExp(matrix: Matrix): Matrix {
  if (matrix.rows !== matrix.cols) {
    throw new Error('Matrix must be square for exponentiation');
  }
  
  const n = matrix.rows;
  let result = Matrix.identity(n);
  let term = Matrix.identity(n);
  
  // Series expansion with limited terms for numerical stability
  const maxTerms = 20;
  
  for (let k = 1; k <= maxTerms; k++) {
    term = term.mul(matrix).scale(ComplexNum.fromReal(1 / k));
    const oldResult = result;
    result = result.add(term);
    
    // Check for convergence (simplified)
    if (isConverged(oldResult, result, 1e-12)) {
      break;
    }
  }
  
  return result;
}

/**
 * Compute matrix logarithm using element-wise logarithm
 * Note: This is an approximation. True matrix logarithm requires eigenvalue decomposition
 */
export function matrixLog(matrix: Matrix): Matrix {
  return matrix.map((val) => {
    const magnitude = Math.sqrt(val.re * val.re + val.im * val.im);
    const phase = Math.atan2(val.im, val.re);
    return {
      re: Math.log(magnitude),
      im: phase
    };
  });
}

/**
 * Check if two matrices are close enough (convergence test)
 */
function isConverged(m1: Matrix, m2: Matrix, tolerance: number): boolean {
  if (m1.rows !== m2.rows || m1.cols !== m2.cols) return false;
  
  for (let i = 0; i < m1.rows; i++) {
    for (let j = 0; j < m1.cols; j++) {
      const diff1 = Math.abs(m1.get(i, j).re - m2.get(i, j).re);
      const diff2 = Math.abs(m1.get(i, j).im - m2.get(i, j).im);
      if (diff1 > tolerance || diff2 > tolerance) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check if a matrix is unitary (U * U† = I) within tolerance
 */
export function isUnitary(matrix: Matrix, tolerance: number = 1e-10): boolean {
  if (matrix.rows !== matrix.cols) return false;
  
  const product = matrix.mul(matrix.dagger());
  const identity = Matrix.identity(matrix.rows);
  return product.equals(identity, tolerance);
} 