import { Complex } from '../types/complex';
/**
 * Compute the Kronecker (tensor) product of two matrices.
 * @param a First matrix as a 2D array of Complex
 * @param b Second matrix as a 2D array of Complex
 * @returns Kronecker product a ⊗ b as a new Complex[][]
 */
export declare function kroneckerMatrix(a: Complex[][], b: Complex[][]): Complex[][];
