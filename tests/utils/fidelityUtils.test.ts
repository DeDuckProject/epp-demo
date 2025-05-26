import { describe, test, expect } from 'vitest';
import { calculateAverageFidelity } from '../../src/utils/fidelityUtils';
import { QubitPair, Basis } from '../../src/engine/types';
import { DensityMatrix } from '../../src/engine_real_calculations/matrix/densityMatrix';

describe('FidelityUtils', () => {
  test('calculates average fidelity correctly for multiple pairs', () => {
    const pairs: QubitPair[] = [
      {
        id: 0,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 0.8,
        basis: Basis.Bell
      },
      {
        id: 1,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 0.6,
        basis: Basis.Bell
      },
      {
        id: 2,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 0.9,
        basis: Basis.Bell
      }
    ];

    const averageFidelity = calculateAverageFidelity(pairs);
    expect(averageFidelity).toBeCloseTo((0.8 + 0.6 + 0.9) / 3, 5);
  });

  test('returns 0 for empty pairs array', () => {
    const averageFidelity = calculateAverageFidelity([]);
    expect(averageFidelity).toBe(0);
  });

  test('returns the fidelity value for single pair', () => {
    const pairs: QubitPair[] = [
      {
        id: 0,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 0.75,
        basis: Basis.Bell
      }
    ];

    const averageFidelity = calculateAverageFidelity(pairs);
    expect(averageFidelity).toBe(0.75);
  });

  test('handles pairs with perfect fidelity', () => {
    const pairs: QubitPair[] = [
      {
        id: 0,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 1.0,
        basis: Basis.Bell
      },
      {
        id: 1,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 1.0,
        basis: Basis.Bell
      }
    ];

    const averageFidelity = calculateAverageFidelity(pairs);
    expect(averageFidelity).toBe(1.0);
  });

  test('handles pairs with very low fidelity', () => {
    const pairs: QubitPair[] = [
      {
        id: 0,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 0.1,
        basis: Basis.Bell
      },
      {
        id: 1,
        densityMatrix: DensityMatrix.bellPsiMinus(),
        fidelity: 0.05,
        basis: Basis.Bell
      }
    ];

    const averageFidelity = calculateAverageFidelity(pairs);
    expect(averageFidelity).toBeCloseTo(0.075, 5);
  });
}); 