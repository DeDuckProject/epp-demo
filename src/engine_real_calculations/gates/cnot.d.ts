import { Matrix } from '../matrix/matrix';
/**
 * Build an n-qubit CNOT unitary matrix for given control and target qubit indices.
 * Uses little-endian convention (qubit 0 = least significant bit).
 */
export declare function cnotMatrix(numQubits: number, control: number, target: number): Matrix;
