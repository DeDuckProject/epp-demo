import { createNoisyEPR } from '../../src/engine/quantumStates';
import { ComplexNum } from '../../src/engine_real_calculations/types/complex';
import { DensityMatrix } from '../../src/engine_real_calculations/matrix/densityMatrix';

// Helper function for comparing complex numbers with tolerance
const expectComplexClose = (a: ComplexNum, b: ComplexNum, tolerance = 1e-9) => {
  expect(a.re).toBeCloseTo(b.re, tolerance);
  expect(a.im).toBeCloseTo(b.im, tolerance);
};

// Updated helper function for comparing DensityMatrix objects
const expectMatrixClose = (a: DensityMatrix, b: DensityMatrix, tolerance = 1e-9) => {
  expect(a.rows).toBe(b.rows);
  expect(a.cols).toBe(b.cols);
  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < a.cols; j++) {
      expectComplexClose(a.get(i, j), b.get(i, j), tolerance);
    }
  }
};

// Helper function to calculate fidelity wrt |Φ⁺⟩ (index 0 in Bell Basis)
const calculateFidelityWrtPhiPlus = (rho: DensityMatrix): number => {
  return rho.get(0, 0)?.re ?? 0; // Use get()
};

describe('quantumStates', () => {
  describe('Bell state & noisy EPR', () => {
    // Wrap data in new DensityMatrix()
    const expectedPsiMinus = new DensityMatrix([
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.one()]
    ]);
    
    // This will require the Matrix/ComplexNum classes for operations if we keep it
    // Or define the fully mixed state manually
    const fullyMixedState = new DensityMatrix([
        [new ComplexNum(0.25, 0), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), new ComplexNum(0.25, 0), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), new ComplexNum(0.25, 0), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), new ComplexNum(0.25, 0)]
    ]);
    
    it('createNoisyEPR(0) should be pure |Ψ⁻⟩ state in Bell basis', () => {
      expectMatrixClose(createNoisyEPR(0), expectedPsiMinus);
    });

    it('createNoisyEPR should produce a Werner-like state for noiseParam > 0', () => {
       const noise = 0.75;
       const state = createNoisyEPR(noise);
       // Use get() for assertions
       expect(state.get(0, 0).re).toBeCloseTo(noise / 3, 9);
       expect(state.get(1, 1).re).toBeCloseTo(noise / 3, 9);
       expect(state.get(2, 2).re).toBeCloseTo(noise / 3, 9);
       expect(state.get(3, 3).re).toBeCloseTo(1 - noise, 9);
    });

    it('fidelity of createNoisyEPR (w.r.t |Φ⁺⟩) increases with noiseParam', () => {
      // fidelity function already uses get()
      const fidelityWrtPhiPlus = (noise: number) => calculateFidelityWrtPhiPlus(createNoisyEPR(noise));
      
      const f0 = fidelityWrtPhiPlus(0);
      const f01 = fidelityWrtPhiPlus(0.1);
      const f02 = fidelityWrtPhiPlus(0.2);
      const f075 = fidelityWrtPhiPlus(0.75);
      
      expect(f0).toBeCloseTo(0);
      expect(f01).toBeCloseTo(0.1 / 3);
      expect(f02).toBeCloseTo(0.2 / 3);
      expect(f075).toBeCloseTo(0.25);

      expect(f01).toBeGreaterThan(f0);
      expect(f02).toBeGreaterThan(f01);
      expect(f075).toBeGreaterThan(f02);
    });
  });
}); 