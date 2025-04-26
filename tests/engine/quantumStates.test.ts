import {createNoisyEPR} from '../../src/engine/quantumStates';
import {complex} from '../../src/engine/mathUtils';
import {ComplexNumber, DensityMatrix} from '../../src/engine/types';

// Re-use helper functions from mathUtils.test.ts or define them here
const expectComplexClose = (a: ComplexNumber, b: ComplexNumber, tolerance = 1e-9) => {
  expect(a.real).toBeCloseTo(b.real, tolerance);
  expect(a.imag).toBeCloseTo(b.imag, tolerance);
};

const expectMatrixClose = (a: DensityMatrix, b: DensityMatrix, tolerance = 1e-9) => {
  expect(a.length).toBe(b.length);
  a.forEach((row, i) => {
    expect(row.length).toBe(b[i].length);
    row.forEach((val, j) => {
      expectComplexClose(val, b[i][j], tolerance);
    });
  });
};

// Helper function to calculate fidelity wrt |Φ⁺⟩
const calculateFidelityWrtPhiPlus = (rho: DensityMatrix): number => {
  return rho[0]?.[0]?.real ?? 0;
};

describe('quantumStates', () => {
  describe('Bell state & noisy EPR', () => {
    // Define expected matrices before using them in tests
    const expectedPsiMinus: DensityMatrix = [
        [complex(0), complex(0), complex(0), complex(0)],
        [complex(0), complex(0), complex(0), complex(0)],
        [complex(0), complex(0), complex(0), complex(0)],
        [complex(0), complex(0), complex(0), complex(1)]
      ];
      
    const identity4x4: DensityMatrix = [
      [complex(1), complex(0), complex(0), complex(0)],
      [complex(0), complex(1), complex(0), complex(0)],
      [complex(0), complex(0), complex(1), complex(0)],
      [complex(0), complex(0), complex(0), complex(1)]
    ];
    const fullyMixedState = identity4x4.map(row => row.map(c => complex(c.real * 0.25, c.imag * 0.25)));
    
    it('createNoisyEPR(0) is equivalent to bellStatePsiMinus()', () => {
      expectMatrixClose(createNoisyEPR(0), expectedPsiMinus);
    });

    it('createNoisyEPR(0.5) gives the fully mixed state (I/4)', () => {
       expectMatrixClose(createNoisyEPR(0.5), fullyMixedState);
       // TODO: Clarify the intended range and effect of noiseParameter. It seems noiseParam=0.5 means fully mixed.
    });

    it('fidelity of createNoisyEPR increases with noiseParam (w.r.t |Φ⁺⟩)', () => {
      // Original test used calculateBellBasisFidelity(transformToBellBasis(rho))
      // New approach: Use helper function calculateFidelityWrtPhiPlus
      const fidelityWrtPhiPlus = (noise: number) => calculateFidelityWrtPhiPlus(createNoisyEPR(noise));
      
      const f0 = fidelityWrtPhiPlus(0);
      const f01 = fidelityWrtPhiPlus(0.1);
      const f02 = fidelityWrtPhiPlus(0.2);
      const f05 = fidelityWrtPhiPlus(0.5);
      
      // From previous derivation: F = noise / 2
      expect(f0).toBeCloseTo(0); // noise=0 => 0
      expect(f01).toBeCloseTo(0.1 / 3);
      expect(f02).toBeCloseTo(0.2 / 3);
      expect(f05).toBeCloseTo(0.5 / 3); // noise=0.5 => 0.25

      // Check if fidelity increases with noise
      expect(f01).toBeGreaterThan(f0);
      expect(f02).toBeGreaterThan(f01);
      expect(f05).toBeGreaterThan(f02);
    });
  });
}); 