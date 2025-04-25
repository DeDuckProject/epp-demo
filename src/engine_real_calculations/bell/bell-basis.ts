import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';

export function toBellBasis(rho: Matrix): Matrix {
  const sqrt2 = Math.sqrt(2);
  const Udata = [
    [1/sqrt2, 0,       0,       1/sqrt2],
    [1/sqrt2, 0,       0,      -1/sqrt2],
    [0,       1/sqrt2, 1/sqrt2, 0      ],
    [0,       1/sqrt2, -1/sqrt2, 0      ]
  ].map(row => row.map(val => ComplexNum.fromReal(val)));
  const U = new Matrix(Udata);
  const U_T = U.dagger();
  return U.mul(rho).mul(U_T);
}

export function fidelityBell(rhoBell: Matrix): number {
  // Returns the fidelity with respect to Phi+ (first element of the density matrix in Bell basis)
  return rhoBell.get(0, 0).re;
}

export function fidelityFromComputationalBasis(rho: Matrix): number {
  const rhoBell = toBellBasis(rho);
  return fidelityBell(rhoBell);
} 