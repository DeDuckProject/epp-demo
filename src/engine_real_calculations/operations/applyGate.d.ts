import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';
/** Apply a unitary gate to density matrix: rho -> U rho U^dagger */
export declare function applyGate(rho: DensityMatrix, U: Matrix): DensityMatrix;
