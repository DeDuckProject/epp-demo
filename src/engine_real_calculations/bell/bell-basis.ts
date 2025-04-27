import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';

/**
 * Transforms a density matrix from the computational basis to the Bell basis.
 * The Bell basis consists of four maximally entangled two-qubit states:
 * Phi+ = (|00> + |11>) / sqrt(2)
 * Phi- = (|00> - |11>) / sqrt(2)
 * Psi+ = (|01> + |10>) / sqrt(2)
 * Psi- = (|01> - |10>) / sqrt(2)
 * This transformation is achieved using the change-of-basis matrix U.
 * @param rho The density matrix in the computational basis.
 * @returns The density matrix in the Bell basis.
 */
export function toBellBasis(rho: Matrix): Matrix {
  const sqrt2 = Math.sqrt(2);
  // Unitary matrix for changing basis from computational to Bell basis
  // Rows correspond to Bell states (Phi+, Phi-, Psi+, Psi-) in that order.
  const Udata = [
    [1/sqrt2, 0,       0,       1/sqrt2], // Phi+
    [1/sqrt2, 0,       0,      -1/sqrt2], // Phi-
    [0,       1/sqrt2, 1/sqrt2, 0      ], // Psi+
    [0,       1/sqrt2, -1/sqrt2, 0      ]  // Psi-
  ].map(row => row.map(val => ComplexNum.fromReal(val)));
  const U = new Matrix(Udata);
  const U_T = U.dagger(); // Conjugate transpose (dagger) for the inverse transformation
  // The transformation is U * rho * U^dagger
  return U.mul(rho).mul(U_T);
}

/**
 * Calculates the fidelity with respect to the Bell state Phi+ (|00> + |11>)/sqrt(2).
 * Assumes the input density matrix is already in the Bell basis.
 * Fidelity is the top-left element (index 0,0) of the density matrix in the Bell basis.
 * @param rhoBell The density matrix in the Bell basis.
 * @returns The fidelity value (real number).
 */
export function fidelityFromBellBasisMatrix(rhoBell: Matrix): number {
  // Returns the fidelity with respect to Phi+ (first element of the density matrix in Bell basis)
  return rhoBell.get(0, 0).re;
}

/**
 * Calculates the fidelity with respect to the Bell state Phi+ starting from a density matrix
 * in the computational basis. It first converts the matrix to the Bell basis.
 * @param rhoComputational The density matrix in the computational basis.
 * @returns The fidelity value (real number).
 */
export function fidelityFromComputationalBasisMatrix(rhoComputational: Matrix): number {
  const rhoBell = toBellBasis(rhoComputational);
  return fidelityFromBellBasisMatrix(rhoBell);
} 