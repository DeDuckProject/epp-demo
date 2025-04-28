import {createNoisyEPR} from '../../src/engine/quantumStates';
import {ComplexNum} from '../../src/engine_real_calculations/types/complex';
import {DensityMatrix} from '../../src/engine_real_calculations/matrix/densityMatrix';
import {expectMatrixClose} from "../_test_utils.ts";
import {fidelityFromBellBasisMatrix} from "../../src/engine_real_calculations/bell/bell-basis.ts";

// Helper function to calculate fidelity wrt |Φ⁺⟩ (index 0 in Bell Basis)
describe('quantumStates', () => {
  describe('Bell state & noisy EPR', () => {
    // Wrap data in new DensityMatrix()
    const expectedPsiMinus = new DensityMatrix([
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero(), ComplexNum.zero(), ComplexNum.one()]
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
      const fidelityWrtPhiPlus = (noise: number) => fidelityFromBellBasisMatrix(createNoisyEPR(noise));
      
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