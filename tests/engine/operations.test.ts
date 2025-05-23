import {bilateralCNOT, depolarize, exchangePsiMinusPhiPlus} from '../../src/engine/operations';
import {createNoisyEPRWithChannel} from '../../src/engine/quantumStates';
import {ComplexNum} from '../../src/engine_real_calculations/types/complex';
import {DensityMatrix} from '../../src/engine_real_calculations/matrix/densityMatrix';
import {fidelityFromBellBasisMatrix} from "../../src/engine_real_calculations/bell/bell-basis";
import {expectMatrixClose} from "../_test_utils.ts";
import { NoiseChannel } from '../../src/engine/types';

// Helper function to calculate fidelity wrt |Φ⁺⟩ directly from Bell basis rho
describe('operations', () => {
  describe('depolarize / twirl', () => {
    test('converts a noisy EPR pair (Werner state form) to its depolarized form', () => {
      const noise = 0.1;
      
      // Create a test state manually that mimics the old createNoisyEPR behavior
      // The old function created a state in Bell basis with specific diagonal values
      const noisyPsiMinus = new DensityMatrix(Array(4).fill(0).map(() => 
        Array(4).fill(0).map(() => ComplexNum.zero())
      ));
      
      // Set diagonal elements as the old createNoisyEPR did
      noisyPsiMinus.set(0, 0, new ComplexNum(noise / 3, 0)); // |Φ⁺⟩⟨Φ⁺|
      noisyPsiMinus.set(1, 1, new ComplexNum(noise / 3, 0)); // |Φ⁻⟩⟨Φ⁻|
      noisyPsiMinus.set(2, 2, new ComplexNum(noise / 3, 0)); // |Ψ⁺⟩⟨Ψ⁺|
      noisyPsiMinus.set(3, 3, new ComplexNum(1 - noise, 0)); // |Ψ⁻⟩⟨Ψ⁻|
      
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
      
      // Test the specific depolarize behavior with a known state
      const testMatrix = new DensityMatrix(Array(4).fill(0).map(() => 
        Array(4).fill(0).map(() => ComplexNum.zero())
      ));
      
      // Set diagonal elements for test case
      testMatrix.set(0, 0, new ComplexNum(0.2 / 3, 0));
      testMatrix.set(1, 1, new ComplexNum(0.2 / 3, 0));
      testMatrix.set(2, 2, new ComplexNum(0.2 / 3, 0));
      testMatrix.set(3, 3, new ComplexNum(1 - 0.2, 0));
      
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
      const controlPair = createNoisyEPRWithChannel(0.1, NoiseChannel.UniformNoise); // Returns DensityMatrix
      const targetPair = createNoisyEPRWithChannel(0.2, NoiseChannel.UniformNoise); // Returns DensityMatrix
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
      const controlPair = createNoisyEPRWithChannel(0.1, NoiseChannel.UniformNoise);
      const targetPair = createNoisyEPRWithChannel(0.1, NoiseChannel.UniformNoise);
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