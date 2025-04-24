import { ComplexNum, Complex } from '../types/complex';

/**
 * Compute the Kronecker (tensor) product of two matrices.
 * @param a First matrix as a 2D array of Complex
 * @param b Second matrix as a 2D array of Complex
 * @returns Kronecker product a ⊗ b as a new Complex[][]
 */
export function kroneckerMatrix(a: Complex[][], b: Complex[][]): Complex[][] {
  const aRows = a.length;
  const aCols = a[0].length;
  const bRows = b.length;
  const bCols = b[0].length;
  const result: Complex[][] = [];
  for (let i = 0; i < aRows; i++) {
    for (let ib = 0; ib < bRows; ib++) {
      const row: Complex[] = [];
      for (let j = 0; j < aCols; j++) {
        for (let jb = 0; jb < bCols; jb++) {
          // element = a[i][j] * b[ib][jb]
          row.push(ComplexNum.mul(a[i][j], b[ib][jb]));
        }
      }
      result.push(row);
    }
  }
  return result;
} 