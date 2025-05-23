import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';

// Module-level variable to store spare Gaussian random number
let gaussianSpare: number | undefined;

/**
 * Generate a random unitary matrix using the Haar measure
 * This implementation uses the QR decomposition of a random Ginibre matrix
 */
export function randomUnitary(size: number): Matrix {
  // Step 1: Generate a random complex matrix with Gaussian entries
  const gaussianMatrix = generateGaussianMatrix(size, size);
  
  // Step 2: Perform QR decomposition to get a unitary matrix
  const { Q } = qrDecomposition(gaussianMatrix);
  
  return Q;
}

/**
 * Generate a matrix with entries from complex Gaussian distribution
 */
function generateGaussianMatrix(rows: number, cols: number): Matrix {
  const data: ComplexNum[][] = [];
  
  for (let i = 0; i < rows; i++) {
    data[i] = [];
    for (let j = 0; j < cols; j++) {
      // Generate complex Gaussian: (N(0,1) + i*N(0,1)) / sqrt(2)
      const realPart = gaussianRandom() / Math.sqrt(2);
      const imagPart = gaussianRandom() / Math.sqrt(2);
      data[i][j] = { re: realPart, im: imagPart };
    }
  }
  
  return new Matrix(data);
}

/**
 * Generate a random number from standard normal distribution using Box-Muller transform
 */
function gaussianRandom(): number {
  // Use Box-Muller transform to generate Gaussian random numbers
  if (gaussianSpare !== undefined) {
    const spare = gaussianSpare;
    gaussianSpare = undefined;
    return spare;
  }
  
  const u1 = Math.random();
  const u2 = Math.random();
  const mag = Math.sqrt(-2 * Math.log(u1));
  const z0 = mag * Math.cos(2 * Math.PI * u2);
  const z1 = mag * Math.sin(2 * Math.PI * u2);
  
  gaussianSpare = z1;
  return z0;
}

/**
 * QR decomposition using Gram-Schmidt process
 * Returns Q (unitary) and R (upper triangular)
 */
function qrDecomposition(matrix: Matrix): { Q: Matrix; R: Matrix } {
  const m = matrix.rows;
  const n = matrix.cols;
  
  const Q = Matrix.zeros(m, n);
  const R = Matrix.zeros(n, n);
  
  for (let j = 0; j < n; j++) {
    // Get column j
    let v = getColumn(matrix, j);
    
    // Orthogonalize against previous columns
    for (let i = 0; i < j; i++) {
      const qi = getColumn(Q, i);
      const projection = vectorDot(qi, v);
      R.set(i, j, projection);
      v = vectorSubtract(v, vectorScale(qi, projection));
    }
    
    // Normalize
    const norm = vectorNorm(v);
    R.set(j, j, ComplexNum.fromReal(norm));
    
    if (norm > 1e-14) {
      v = vectorScale(v, ComplexNum.fromReal(1 / norm));
    }
    
    // Set column j of Q
    setColumn(Q, j, v);
  }
  
  return { Q, R };
}

/**
 * Extract a column from matrix as a vector
 */
function getColumn(matrix: Matrix, col: number): ComplexNum[] {
  const result: ComplexNum[] = [];
  for (let i = 0; i < matrix.rows; i++) {
    result[i] = matrix.get(i, col);
  }
  return result;
}

/**
 * Set a column in matrix from a vector
 */
function setColumn(matrix: Matrix, col: number, vector: ComplexNum[]): void {
  for (let i = 0; i < vector.length; i++) {
    matrix.set(i, col, vector[i]);
  }
}

/**
 * Compute dot product of two complex vectors
 */
function vectorDot(v1: ComplexNum[], v2: ComplexNum[]): ComplexNum {
  let sum = ComplexNum.zero();
  for (let i = 0; i < v1.length; i++) {
    const conj_v1 = ComplexNum.conj(v1[i]);
    sum = ComplexNum.add(sum, ComplexNum.mul(conj_v1, v2[i]));
  }
  return sum;
}

/**
 * Subtract two complex vectors
 */
function vectorSubtract(v1: ComplexNum[], v2: ComplexNum[]): ComplexNum[] {
  const result: ComplexNum[] = [];
  for (let i = 0; i < v1.length; i++) {
    result[i] = ComplexNum.sub(v1[i], v2[i]);
  }
  return result;
}

/**
 * Scale a complex vector by a complex scalar
 */
function vectorScale(vector: ComplexNum[], scalar: ComplexNum): ComplexNum[] {
  return vector.map(v => ComplexNum.mul(v, scalar));
}

/**
 * Compute the norm of a complex vector
 */
function vectorNorm(vector: ComplexNum[]): number {
  let sum = 0;
  for (const v of vector) {
    sum += v.re * v.re + v.im * v.im;
  }
  return Math.sqrt(sum);
} 