import { Matrix } from '../matrix/matrix';
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
export declare function toBellBasis(rhoComputational: Matrix): Matrix;
/**
 * Transforms a density matrix from the Bell basis back to the computational basis.
 * This is the inverse operation of toBellBasis.
 * @param rhoBell The density matrix in the Bell basis.
 * @returns The density matrix in the computational basis.
 */
export declare function toComputationalBasis(rhoBell: Matrix): Matrix;
/**
 * Bell state enum for identifying which Bell state to use for fidelity calculation.
 */
export declare enum BellState {
    PHI_PLUS = 0,// (|00⟩ + |11⟩)/√2
    PHI_MINUS = 1,// (|00⟩ - |11⟩)/√2
    PSI_PLUS = 2,// (|01⟩ + |10⟩)/√2
    PSI_MINUS = 3
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
export declare function fidelityFromBellBasisMatrix(rhoBell: Matrix, bellState?: BellState): number;
/**
 * Calculates the fidelity with respect to a specific Bell state starting from a density matrix
 * in the computational basis. It first converts the matrix to the Bell basis.
 * @param rhoComputational The density matrix in the computational basis.
 * @param bellState Which Bell state to calculate fidelity against (default: PHI_PLUS).
 * @returns The fidelity value (real number).
 */
export declare function fidelityFromComputationalBasisMatrix(rhoComputational: Matrix, bellState?: BellState): number;
