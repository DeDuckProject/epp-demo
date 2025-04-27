import {createNoisyEPR} from '../../src/engine/quantumStates';
import { DensityMatrix } from '../../src/engine/types';
import { ComplexNum } from '../../src/engine_real_calculations/types/complex';

// Re-use helper functions from mathUtils.test.ts or define them here
const expectComplexClose = (a: ComplexNum, b: ComplexNum, tolerance = 1e-9) => {
  expect(a.re).toBeCloseTo(b.re, tolerance);
  expect(a.im).toBeCloseTo(b.im, tolerance);
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

// Helper function to calculate fidelity wrt |Φ⁺⟩ (index 0 in Bell Basis)
const calculateFidelityWrtPhiPlus = (rho: DensityMatrix): number => {
  return rho[0]?.[0]?.re ?? 0;
};

describe('quantumStates', () => {
  describe('Bell state & noisy EPR', () => {
    // Define expected matrices before using them in tests
    const expectedPsiMinus: DensityMatrix = [
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.one()]
      ];
      
    const identity4x4: DensityMatrix = [
      [ComplexNum.one(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.one(), ComplexNum.zero(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.one(), ComplexNum.zero()],
      [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.one()]
    ];
    const fullyMixedState = identity4x4.map(row => 
      row.map(c => ComplexNum.mul(c, new ComplexNum(0.25, 0)))
    );
    
    it('createNoisyEPR(0) should be pure |Ψ⁻⟩ state in Bell basis', () => {
      expectMatrixClose(createNoisyEPR(0), expectedPsiMinus);
    });

    it('createNoisyEPR should produce a Werner-like state for noiseParam > 0', () => {
       const noise = 0.75;
       const state = createNoisyEPR(noise);
       expect(state[0][0].re).toBeCloseTo(noise / 3, 9);
       expect(state[1][1].re).toBeCloseTo(noise / 3, 9);
       expect(state[2][2].re).toBeCloseTo(noise / 3, 9);
       expect(state[3][3].re).toBeCloseTo(1 - noise, 9);
    });

    it('fidelity of createNoisyEPR (w.r.t |Φ⁺⟩) increases with noiseParam', () => {
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