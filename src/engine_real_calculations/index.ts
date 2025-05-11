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

// Re-export core types and functions
export type { Complex };
export {
  ComplexNum,
  Matrix,
  DensityMatrix,
  bitstringToIndex,
  indexToBitstring,
  pauliMatrix,
  pauliOperator,
  cnotMatrix,
  applyDepolarizing,
  applyDephasing,
  applyAmplitudeDamping,
  measureQubit,
  applyGate,
  partialTrace
};

/**
 * Tensor (Kronecker) product of two density matrices
 */
export function tensor(a: DensityMatrix, b: DensityMatrix): DensityMatrix {
  return DensityMatrix.tensor(a, b);
}

/**
 * Apply Pauli operations to a density matrix: ρ → P ρ P†
 */
export function applyPauli(
  rho: DensityMatrix,
  targets: number[],                 // array of qubit indices
  paulis: ('I'|'X'|'Y'|'Z')[]
): DensityMatrix {
  const n = Math.log2(rho.rows);
  if (!Number.isInteger(n)) {
    throw new Error('DensityMatrix dimension must be power of 2');
  }
  const U = pauliOperator(n, targets, paulis);
  return applyGate(rho, U);
}

/**
 * Apply a CNOT gate to a density matrix
 */
export function applyCNOT(
  rho: DensityMatrix,
  control: number,
  target: number
): DensityMatrix {
  const n = Math.log2(rho.rows);
  if (!Number.isInteger(n)) {
    throw new Error('DensityMatrix dimension must be power of 2');
  }
  const U = cnotMatrix(n, control, target);
  return applyGate(rho, U);
} 