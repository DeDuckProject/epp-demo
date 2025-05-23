import { Matrix } from '../matrix/matrix';
/** Single-qubit Pauli matrices */
export declare function pauliMatrix(p: 'I' | 'X' | 'Y' | 'Z'): Matrix;
/**
 * Build an n-qubit Pauli operator: tensor of specified Paulis on targets, identity elsewhere.
 * Uses little-endian convention (qubit 0 = least significant).
 */
export declare function pauliOperator(numQubits: number, targets: number[], paulis: ('I' | 'X' | 'Y' | 'Z')[]): Matrix;
