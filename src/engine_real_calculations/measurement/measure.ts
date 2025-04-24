import { DensityMatrix } from '../matrix/densityMatrix';

/**
 * Measure a single qubit in computational basis, returning outcome and its probability.
 * Uses big-endian convention (qubit 0 = most significant bit).
 */
export function measureQubit(
  rho: DensityMatrix,
  qubit: number
): { outcome: 0 | 1; probability: number } {
  const dim = rho.rows;
  let p0 = 0;
  const n = Math.log2(dim);
  const bitIndex = n - 1 - qubit;
  for (let i = 0; i < dim; i++) {
    if (((i >> bitIndex) & 1) === 0) {
      const diag = rho.get(i, i);
      p0 += diag.re;
    }
  }
  // clamp in [0,1]
  p0 = Math.min(Math.max(p0, 0), 1);
  const p1 = 1 - p0;
  const r = Math.random();
  const outcome = r < p0 ? 0 : 1;
  const probability = outcome === 0 ? p0 : p1;
  return { outcome, probability };
} 