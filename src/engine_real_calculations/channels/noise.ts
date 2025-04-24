import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';
import { pauliOperator } from '../gates/pauli';

/**
 * Apply a set of Kraus operators to the density matrix.
 */
function applyKraus(
  rho: DensityMatrix,
  ks: Matrix[]
): DensityMatrix {
  let result = Matrix.zeros(rho.rows, rho.cols);
  for (const K of ks) {
    const term = K.mul(rho).mul(K.dagger());
    result = result.add(term);
  }
  return new DensityMatrix(result.data);
}

/**
 * Depolarizing channel on a single qubit with probability p.
 */
export function applyDepolarizing(
  rho: DensityMatrix,
  qubit: number,
  p: number
): DensityMatrix {
  const n = Math.log2(rho.rows);
  const dim = rho.rows;
  const sqrt = Math.sqrt;
  const K0 = Matrix.identity(dim).scale(ComplexNum.fromReal(sqrt(1 - p)));
  const factor = sqrt(p / 3);
  const K1 = pauliOperator(n, [qubit], ['X']).scale(ComplexNum.fromReal(factor));
  const K2 = pauliOperator(n, [qubit], ['Y']).scale(ComplexNum.fromReal(factor));
  const K3 = pauliOperator(n, [qubit], ['Z']).scale(ComplexNum.fromReal(factor));
  return applyKraus(rho, [K0, K1, K2, K3]);
}

/**
 * Dephasing (phase-flip) channel on a single qubit with probability p.
 */
export function applyDephasing(
  rho: DensityMatrix,
  qubit: number,
  p: number
): DensityMatrix {
  const n = Math.log2(rho.rows);
  const dim = rho.rows;
  const sqrt = Math.sqrt;
  const K0 = Matrix.identity(dim).scale(ComplexNum.fromReal(sqrt(1 - p)));
  const K1 = pauliOperator(n, [qubit], ['Z']).scale(ComplexNum.fromReal(sqrt(p)));
  return applyKraus(rho, [K0, K1]);
}

export const _testing = { applyKraus }; 