import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';

/** Apply a unitary gate to density matrix: rho -> U rho U^dagger */
export function applyGate(
  rho: DensityMatrix,
  U: Matrix
): DensityMatrix {
  const Urho = U.mul(rho);
  const UrhoUd = Urho.mul(U.dagger());
  return new DensityMatrix(UrhoUd.data);
} 