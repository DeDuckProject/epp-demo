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
 * @param rhoComputational The density matrix in the computational basis.
 * @returns The density matrix in the Bell basis.
 */
export function toBellBasis(rhoComputational: Matrix): Matrix {
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
  // The transformation is U * rhoComputational * U^dagger
  return U.mul(rhoComputational).mul(U_T);
}

/**
 * Transforms a density matrix from the Bell basis back to the computational basis.
 * This is the inverse operation of toBellBasis.
 * @param rhoBell The density matrix in the Bell basis.
 * @returns The density matrix in the computational basis.
 */
export function toComputationalBasis(rhoBell: Matrix): Matrix {
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
  // The inverse transformation is U^dagger * rhoBell * U
  return U_T.mul(rhoBell).mul(U);
}

/**
 * Bell state enum for identifying which Bell state to use for fidelity calculation.
 */
export enum BellState {
  PHI_PLUS = 0,  // (|00⟩ + |11⟩)/√2
  PHI_MINUS = 1, // (|00⟩ - |11⟩)/√2
  PSI_PLUS = 2,  // (|01⟩ + |10⟩)/√2
  PSI_MINUS = 3  // (|01⟩ - |10⟩)/√2
}

/**
 * Calculates the fidelity with respect to a specific Bell state.
 * Assumes the input density matrix is already in the Bell basis.
 * Uses the quantum fidelity formula F(ρ, |ψ⟩⟨ψ|) = ⟨ψ|ρ|ψ⟩ for pure target states.
 * Since the matrix is in the Bell basis, this is simply the diagonal element
 * corresponding to the Bell state, which correctly handles both diagonal and
 * non-diagonal density matrices.
 * @param rhoBell The density matrix in the Bell basis.
 * @param bellState Which Bell state to calculate fidelity against (default: PHI_PLUS).
 * @returns The fidelity value (real number).
 */
export function fidelityFromBellBasisMatrix(
  rhoBell: Matrix, 
  bellState: BellState = BellState.PHI_PLUS
): number {
  return rhoBell.get(bellState, bellState).re;
}

/**
 * Calculates the fidelity with respect to a specific Bell state starting from a density matrix
 * in the computational basis. It first converts the matrix to the Bell basis.
 * @param rhoComputational The density matrix in the computational basis.
 * @param bellState Which Bell state to calculate fidelity against (default: PHI_PLUS).
 * @returns The fidelity value (real number).
 */
export function fidelityFromComputationalBasisMatrix(
  rhoComputational: Matrix,
  bellState: BellState = BellState.PHI_PLUS
): number {
  const rhoBell = toBellBasis(rhoComputational);
  return fidelityFromBellBasisMatrix(rhoBell, bellState);
} 