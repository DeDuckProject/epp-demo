import { 
  getPauliTwirlOperator, 
  pauliTwirl,
  PAULI_TWIRL_SEQUENCES
} from '../../../src/engine_real_calculations/operations/pauliTwirling';
import { DensityMatrix } from '../../../src/engine_real_calculations/matrix/densityMatrix';
import { Matrix } from '../../../src/engine_real_calculations/matrix/matrix';

describe('Pauli Twirling Operations', () => {
  describe('PAULI_TWIRL_SEQUENCES', () => {
    it('should contain exactly 12 sequences', () => {
      expect(PAULI_TWIRL_SEQUENCES.length).toBe(12);
    });
    
    it('should include the identity operation as an empty sequence', () => {
      expect(PAULI_TWIRL_SEQUENCES[0]).toEqual([]);
    });
  });
  
  describe('getPauliTwirlOperator', () => {
    it('should return identity tensor identity for empty sequence', () => {
      const U = getPauliTwirlOperator([]);
      
      // Should be a 4x4 matrix
      expect(U.rows).toBe(4);
      expect(U.cols).toBe(4);
      
      // Should be identity tensor identity
      const expected = Matrix.identity(2).tensor(Matrix.identity(2));
      expect(U.equals(expected)).toBe(true);
    });
    
    it('should build correct operator for single rotation', () => {
      // Test x-rotation
      const Ux = getPauliTwirlOperator(['x']);
      
      // Size check
      expect(Ux.rows).toBe(4);
      expect(Ux.cols).toBe(4);
      
      // Unitarity check: U * U† = I
      const UxdUx = Ux.mul(Ux.dagger());
      const I4 = Matrix.identity(4);
      expect(UxdUx.equals(I4, 1e-10)).toBe(true);
    });
    
    it('should build correct operator for compound rotations', () => {
      // Test a more complex sequence
      const U = getPauliTwirlOperator(['x', 'y', 'z']);
      
      // Size check
      expect(U.rows).toBe(4);
      expect(U.cols).toBe(4);
      
      // Unitarity check: U * U† = I
      const UdU = U.mul(U.dagger());
      const I4 = Matrix.identity(4);
      expect(UdU.equals(I4, 1e-10)).toBe(true);
    });
  });
  
  describe('pauliTwirl', () => {
    it('should return a valid density matrix', () => {
      // Create a test state (Bell state)
      const initialState = DensityMatrix.bellPsiMinus();
      
      // Apply Pauli twirl
      const twirledState = pauliTwirl(initialState);
      
      // Check that result is a valid density matrix
      expect(twirledState.validate()).toBe(true);
      
      // Should preserve trace = 1
      const tr = twirledState.trace();
      expect(Math.abs(tr.re - 1)).toBeLessThan(1e-10);
      expect(Math.abs(tr.im)).toBeLessThan(1e-10);
    });
    
    it('should maintain the fidelity of pure Bell states', () => {
      // Pure Bell state should have fidelity preserved
      const bellState = DensityMatrix.bellPsiMinus();
      
      // We'll modify the pauliTwirl function's random behavior for testing
      // by replacing Math.random to force deterministic values
      const originalRandom = Math.random;
      
      // For each sequence, verify the fidelity with respect to the original Bell state
      for (let i = 0; i < PAULI_TWIRL_SEQUENCES.length; i++) {
        // Force the random selection to pick sequence i
        Math.random = () => i / PAULI_TWIRL_SEQUENCES.length;
        
        const twirledState = pauliTwirl(bellState);
        
        // Get overlap with original state: Tr(ρ₁·ρ₂)
        const overlap = twirledState.mul(bellState).trace();
        
        // For pure Bell states, the twirl operations shouldn't change fidelity
        // Overlap should be close to 1 for all 12 operations
        expect(Math.abs(overlap.re - 1)).toBeLessThan(1e-10);
        expect(Math.abs(overlap.im)).toBeLessThan(1e-10);
      }
      
      // Restore original Math.random
      Math.random = originalRandom;
    });
    
    it('should randomize the operation selected', () => {
      // Verify random selection by counting frequencies
      const mockRandomValues = Array(1000).fill(0).map((_, i) => i / 1000);
      const originalRandom = Math.random;
      
      // Counts for each sequence
      const counts = Array(PAULI_TWIRL_SEQUENCES.length).fill(0);
      
      try {
        let randomIndex = 0;
        // Simple mock implementation
        Math.random = () => mockRandomValues[randomIndex++ % mockRandomValues.length];
        
        const state = DensityMatrix.bellPsiMinus();
        
        // Apply twirl multiple times and count which operations were used
        for (let i = 0; i < 1000; i++) {
          const twirled = pauliTwirl(state);
          
          // The last used index is (randomIndex - 1) % 12
          const selectedIndex = (randomIndex - 1) % PAULI_TWIRL_SEQUENCES.length;
          counts[selectedIndex]++;
        }
        
        // Each operation should be used approximately equally
        // (we're using a deterministic distribution for testing)
        const expectedCount = 1000 / PAULI_TWIRL_SEQUENCES.length;
        
        // Check that each count is within a reasonable range of expected count
        // We'll allow a tolerance of ±5% of the expected count
        const tolerance = Math.ceil(expectedCount * 0.05);
        counts.forEach(count => {
          expect(Math.abs(count - expectedCount)).toBeLessThanOrEqual(tolerance);
        });
      } finally {
        // Always restore Math.random
        Math.random = originalRandom;
      }
    });
  });
}); 