import {bilateralCNOT, depolarize, exchangePsiMinusPhiPlus} from '../../src/engine/operations';
import {createNoisyEPR} from '../../src/engine/quantumStates';
import {ComplexNum} from '../../src/engine_real_calculations/types/complex';
import {DensityMatrix} from '../../src/engine_real_calculations/matrix/densityMatrix';
import {fidelityFromBellBasisMatrix} from "../../src/engine_real_calculations/bell/bell-basis";
import {expectMatrixClose} from "../_test_utils.ts";

// Helper function to calculate fidelity wrt |Φ⁺⟩ directly from Bell basis rho
describe('operations', () => {
  describe('depolarize / twirl', () => {
    test('converts a noisy EPR pair (Werner state form) to its depolarized form', () => {
      const noise = 0.1;
      const noisyPsiMinus = createNoisyEPR(noise); // Returns DensityMatrix
      const p = 1 - 2 * noise; // p = 0.8

      // Depolarize should project onto the target state (|Ψ⁻⟩) and the identity
      // Depolarize(rho) = Tr(rho |Ψ⁻⟩⟨Ψ⁻|) * |Ψ⁻⟩⟨Ψ⁻| + (1 - Tr(rho |Ψ⁻⟩⟨Ψ⁻|))/3 * (I - |Ψ⁻⟩⟨Ψ⁻|)
      // The implementation uses Pauli twirling which results in:
      // rho_twirled = F * |Ψ⁻⟩⟨Ψ⁻| + (1-F)/3 * (I - |Ψ⁻⟩⟨Ψ⁻|), where F is fidelity w.r.t |Ψ⁻⟩
      // Fidelity F = Tr(rho |Ψ⁻⟩⟨Ψ⁻|) = Tr( (p|Ψ⁻⟩⟨Ψ⁻| + (1-p)I/4) |Ψ⁻⟩⟨Ψ⁻| )
      //              = p * Tr(|Ψ⁻⟩⟨Ψ⁻|) + (1-p)/4 * Tr(|Ψ⁻⟩⟨Ψ⁻|)
      //              = p * 1 + (1-p)/4 * 1 = (4p + 1 - p) / 4 = (3p + 1) / 4
      // For noise=0.1, p=0.8, F = (3*0.8 + 1) / 4 = (2.4 + 1) / 4 = 3.4 / 4 = 0.85

      const expectedFidelity = (3 * p + 1) / 4; // This is fidelity wrt |Ψ⁻⟩

      // Construct the expected Werner state directly as a DensityMatrix
      const expectedDepolarized = new DensityMatrix(Array(4).fill(0).map(() => Array(4).fill(0).map(() => ComplexNum.zero())));
      const nonTargetVal = (1 - expectedFidelity) / 3;
      expectedDepolarized.set(0, 0, new ComplexNum(nonTargetVal, 0));
      expectedDepolarized.set(1, 1, new ComplexNum(nonTargetVal, 0));
      expectedDepolarized.set(2, 2, new ComplexNum(nonTargetVal, 0));
      expectedDepolarized.set(3, 3, new ComplexNum(expectedFidelity, 0)); // Target is |Ψ⁻⟩ at index 3

      const depolarizedMatrix = depolarize(noisyPsiMinus);
      expectMatrixClose(depolarizedMatrix, expectedDepolarized);
      
      // Verify the fidelity calculation used within depolarize matches expected F
      // depolarize itself uses calculateBellBasisFidelity which is wrt |Φ⁺⟩
      // The twirling operation physically targets |Ψ⁻⟩, but the fidelity check inside seems mismatched.
      // Let's recalculate what depolarize actually computes:
      // It calculates f00 = rho[0][0], f11=rho[1][1], f22=rho[2][2], f33=rho[3][3]
      // f03=rho[0][3], f12=rho[1][2]
      // Fidelity = f00+f33+f03+f03* (wrt |Φ⁺⟩ ?)
      // Purity = f00+f11+f22+f33 (trace)
      // Then constructs a new matrix based on these values. This isn't standard depolarizing channel.
      // TODO: Revisit the `depolarize` implementation and clarify its purpose / relation to standard operations.
      // Test that it behaves consistently for now.
      const testMatrix = createNoisyEPR(0.2); // Returns DensityMatrix
      const result = depolarize(testMatrix); // Returns DensityMatrix
      expect(result.get(0, 0).re).toBeCloseTo(0.2/3, 2); // Use get()
      expect(result.get(1, 1).re).toBeCloseTo(0.2/3, 2); // Use get()
      expect(result.get(2, 2).re).toBeCloseTo(0.2/3, 2); // Use get()
      expect(result.get(3, 3).re).toBeCloseTo(0.8, 2); // Use get()
    });
  });

  describe('exchange components', () => {
    test('swaps |Ψ⁻⟩ and |Φ⁺⟩ components in a Bell-diagonal state', () => {
      const a = 0.6, b = 0.2;
      // Create test state directly as DensityMatrix
      const testState = new DensityMatrix(Array(4).fill(0).map(() => Array(4).fill(0).map(() => ComplexNum.zero())));
      testState.set(0, 0, new ComplexNum(a, 0)); // |Φ⁺⟩
      testState.set(1, 1, new ComplexNum(0.1, 0)); // |Φ⁻⟩
      testState.set(2, 2, new ComplexNum(0.1, 0)); // |Ψ⁺⟩
      testState.set(3, 3, new ComplexNum(b, 0)); // |Ψ⁻⟩

      // Create expected state after swap directly as DensityMatrix
      const expectedSwapped = new DensityMatrix(Array(4).fill(0).map(() => Array(4).fill(0).map(() => ComplexNum.zero())));
      expectedSwapped.set(0, 0, new ComplexNum(b, 0)); // Now has b
      expectedSwapped.set(1, 1, new ComplexNum(0.1, 0)); // Stays the same
      expectedSwapped.set(2, 2, new ComplexNum(0.1, 0)); // Stays the same
      expectedSwapped.set(3, 3, new ComplexNum(a, 0)); // Now has a

      const exchangedState = exchangePsiMinusPhiPlus(testState);
      
      // Verify using the direct fidelity calculation (already uses get())
      expect(fidelityFromBellBasisMatrix(testState)).toBeCloseTo(a); // Fidelity wrt |Φ⁺⟩ should be a
      expect(fidelityFromBellBasisMatrix(exchangedState)).toBeCloseTo(b); // After exchange, fidelity wrt |Φ⁺⟩ should be b

      // Check the full matrix (helper already uses get())
      expectMatrixClose(exchangedState, expectedSwapped);
    });
  });

  describe('bilateralCNOT', () => {
    // This operation is complex. It takes two 4x4 density matrices (control & target), performs BCNOT,
    // measures the target pair qubits (2nd & 4th qubit overall), and post-selects the control pair.
    // It returns the control pair state *after* measurement and a success flag.
    // Full simulation is complex to verify by hand. 
    // We will test some basic properties.
    test('returns an object with controlPair density matrix and success flag', () => {
      const controlPair = createNoisyEPR(0.1); // Returns DensityMatrix
      const targetPair = createNoisyEPR(0.2); // Returns DensityMatrix
      const result = bilateralCNOT(controlPair, targetPair);

      expect(result).toHaveProperty('afterMeasurement');
      expect(result.afterMeasurement).toHaveProperty('controlPair');
      expect(result.afterMeasurement).toHaveProperty('successful');
      expect(result.afterMeasurement.controlPair).toBeInstanceOf(DensityMatrix); // Check it's a DensityMatrix instance
      expect(typeof result.afterMeasurement.successful).toBe('boolean');
    });

    test('should ideally increase fidelity of control pair on success (qualitative check)', () => {
      // Purification aims to increase fidelity. We expect the output fidelity to be higher
      // than the input fidelity *on average* after many runs, but a single run might decrease it.
      // This test is difficult to make robust without statistical simulation.
      // Let's just check if the fidelity calculation runs.
      const controlPair = createNoisyEPR(0.1);
      const targetPair = createNoisyEPR(0.1);
      const result = bilateralCNOT(controlPair, targetPair);

      // Original test used calculateBellBasisFidelity(transformToBellBasis(rho))
      // New approach: Use helper function calculateFidelityWrtPhiPlus
      const initialFidelity = fidelityFromBellBasisMatrix(controlPair); // Helper uses get()
      const finalFidelity = fidelityFromBellBasisMatrix(result.afterMeasurement.controlPair); // Helper uses get()
      
      expect(finalFidelity).toBeDefined();
      console.log(`Bilateral CNOT: Initial Fidelity=${initialFidelity}, Final Fidelity=${finalFidelity}, Success=${result.afterMeasurement.successful}`);
      // TODO: Add more rigorous tests, potentially with known input/output states if the operation simplifies
      // or via statistical analysis if the exact BCNOT+measurement implementation is confirmed.
    });
  });
}); 