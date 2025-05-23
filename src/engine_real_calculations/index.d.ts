import { Complex, ComplexNum } from './types/complex';
import { Matrix } from './matrix/matrix';
import { DensityMatrix } from './matrix/densityMatrix';
import { bitstringToIndex, indexToBitstring } from './utils/indexing';
import { pauliMatrix, pauliOperator } from './gates/pauli';
import { cnotMatrix } from './gates/cnot';
import { applyDepolarizing, applyDephasing, applyAmplitudeDamping } from './channels/noise';
import { measureQubit } from './measurement/measure';
import { applyGate } from './operations/applyGate';
import { partialTrace } from './operations/partialTrace';
export type { Complex };
export { ComplexNum, Matrix, DensityMatrix, bitstringToIndex, indexToBitstring, pauliMatrix, pauliOperator, cnotMatrix, applyDepolarizing, applyDephasing, applyAmplitudeDamping, measureQubit, applyGate, partialTrace };
/**
 * Tensor (Kronecker) product of two density matrices
 */
export declare function tensor(a: DensityMatrix, b: DensityMatrix): DensityMatrix;
/**
 * Apply Pauli operations to a density matrix: ρ → P ρ P†
 */
export declare function applyPauli(rho: DensityMatrix, targets: number[], // array of qubit indices
paulis: ('I' | 'X' | 'Y' | 'Z')[]): DensityMatrix;
/**
 * Apply a CNOT gate to a density matrix
 */
export declare function applyCNOT(rho: DensityMatrix, control: number, target: number): DensityMatrix;
