import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';
import { pauliOperator } from '../gates/pauli';
import { randomUnitary } from '../utils/randomUnitary';
import { matrixExp, matrixLog } from '../utils/matrixExp';

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
 * Depolarizing channel on a single qubit with probability p. Note: In this implementation, the channel is completely depolarizing when p=0.75.
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
 * Dephasing (phase-flip) channel on a single qubit with probability p using 2 Kraus operators
 */
export function applyDephasing(
  rho: DensityMatrix,
  qubit: number,
  p: number
): DensityMatrix {
  const n = Math.log2(rho.rows);
  const dim = rho.rows;
  const I = Matrix.identity(dim);
  const Z = pauliOperator(n, [qubit], ['Z']);
  // Using 2 Kraus operators: K0 = sqrt(1 - p/2)*I, K1 = sqrt(p/2)*Z
  const K0 = I.scale(ComplexNum.fromReal(Math.sqrt(1 - p / 2)));
  const K1 = Z.scale(ComplexNum.fromReal(Math.sqrt(p / 2)));
  return applyKraus(rho, [K0, K1]);
}

// Amplitude-damping channel on a single qubit
export function applyAmplitudeDamping(
  rho: DensityMatrix,
  qubit: number,
  gamma: number
): DensityMatrix {
  const n = Math.log2(rho.rows);
  if (!Number.isInteger(n)) {
    throw new Error('DensityMatrix dimension must be a power of 2');
  }
  const sqrt = Math.sqrt;
  // Local 2×2 Kraus operators
  const K0_local = new Matrix([
    [ComplexNum.one(), ComplexNum.zero()],
    [ComplexNum.zero(), ComplexNum.fromReal(sqrt(1 - gamma))]
  ]);
  const K1_local = new Matrix([
    [ComplexNum.zero(), ComplexNum.fromReal(sqrt(gamma))],
    [ComplexNum.zero(), ComplexNum.zero()]
  ]);
  // Embed onto the full n-qubit space
  function embed(localOp: Matrix): Matrix {
    let op: Matrix | null = null;
    for (let q = 0; q < n; q++) {
      const m = q === qubit ? localOp : Matrix.identity(2);
      op = op ? op.tensor(m) : m;
    }
    return op!;
  }
  const K0 = embed(K0_local);
  const K1 = embed(K1_local);
  return applyKraus(rho, [K0, K1]);
}

/**
 * Uniform noise channel that applies a fractional random unitary to a specific qubit
 * @param rho The density matrix to apply noise to
 * @param qubit The target qubit index to apply noise to
 * @param noiseStrength Parameter from 0 to 1, where 1 applies the full random unitary and 0 applies identity
 */
export function applyUniformNoise(
  rho: DensityMatrix,
  qubit: number,
  noiseStrength: number
): DensityMatrix {
  if (noiseStrength < 0 || noiseStrength > 1) {
    throw new Error('Noise strength must be between 0 and 1');
  }
  
  // If no noise, return original state
  if (noiseStrength === 0) {
    return rho;
  }
  
  const n = Math.log2(rho.rows);
  if (!Number.isInteger(n)) {
    throw new Error('DensityMatrix dimension must be a power of 2');
  }
  
  if (qubit < 0 || qubit >= n) {
    throw new Error(`Qubit index ${qubit} out of range for ${n}-qubit system`);
  }
  
  // Generate a 2x2 random unitary for the single qubit
  const localRandomU = randomUnitary(2);
  
  // Embed the local unitary into the full n-qubit space
  function embedUnitary(localU: Matrix): Matrix {
    let result: Matrix | null = null;
    for (let q = 0; q < n; q++) {
      const op = q === qubit ? localU : Matrix.identity(2);
      result = result ? result.tensor(op) : op;
    }
    return result!;
  }
  
  // For fractional application, we use matrix logarithm and exponential
  // If U = exp(iH), then we want exp(i * noiseStrength * H)
  try {
    const logU = matrixLog(localRandomU);
    const fractionalLogU = logU.scale(ComplexNum.fromReal(noiseStrength));
    const fractionalLocalU = matrixExp(fractionalLogU);
    const fractionalU = embedUnitary(fractionalLocalU);
    
    // Apply the fractional unitary: U * ρ * U†
    const result = fractionalU.mul(rho).mul(fractionalU.dagger());
    return new DensityMatrix(result.data);
  } catch (error) {
    // Fallback: interpolate between identity and the random unitary
    const identity = Matrix.identity(2);
    const interpolatedLocal = identity.scale(ComplexNum.fromReal(1 - noiseStrength))
      .add(localRandomU.scale(ComplexNum.fromReal(noiseStrength)));
    const interpolatedU = embedUnitary(interpolatedLocal);
    
    const result = interpolatedU.mul(rho).mul(interpolatedU.dagger());
    return new DensityMatrix(result.data);
  }
}

export const _testing = { applyKraus, applyAmplitudeDamping, applyUniformNoise }; 