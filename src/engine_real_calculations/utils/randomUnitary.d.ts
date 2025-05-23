import { Matrix } from '../matrix/matrix';
/**
 * Generate a random unitary matrix using the Haar measure
 * This implementation uses the QR decomposition of a random Ginibre matrix
 */
export declare function randomUnitary(size: number): Matrix;
