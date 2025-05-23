import { describe, it, expect } from 'vitest';
import { Matrix } from '../../../src/engine_real_calculations/matrix/matrix.ts';
import { ComplexNum } from '../../../src/engine_real_calculations/types/complex.ts';
import { randomUnitary } from '../../../src/engine_real_calculations/utils/randomUnitary.ts';
import { isUnitary } from '../../../src/engine_real_calculations/utils/matrixExp.ts';

describe('Random Unitary Matrix Generation', () => {
  describe('randomUnitary', () => {
    it('should generate unitary matrices of specified size', () => {
      const sizes = [1, 2, 3, 4];
      
      for (const size of sizes) {
        const U = randomUnitary(size);
        
        expect(U.rows).toBe(size);
        expect(U.cols).toBe(size);
        expect(isUnitary(U, 1e-10)).toBe(true);
      }
    });

    it('should generate different matrices on repeated calls', () => {
      const U1 = randomUnitary(2);
      const U2 = randomUnitary(2);
      
      // With very high probability, these should be different
      expect(U1.equals(U2, 1e-10)).toBe(false);
    });

    it('should preserve determinant magnitude for unitary matrices', () => {
      const U = randomUnitary(2);
      
      // Calculate determinant: det([[a,b],[c,d]]) = ad - bc
      const a = U.get(0, 0);
      const b = U.get(0, 1);
      const c = U.get(1, 0);
      const d = U.get(1, 1);
      
      const det = ComplexNum.sub(
        ComplexNum.mul(a, d),
        ComplexNum.mul(b, c)
      );
      
      // |det(U)| should be 1 for unitary matrices
      const detMagnitude = Math.sqrt(det.re * det.re + det.im * det.im);
      expect(Math.abs(detMagnitude - 1)).toBeLessThan(1e-10);
    });

    it('should satisfy U * U† = I', () => {
      const sizes = [2, 3];
      
      for (const size of sizes) {
        const U = randomUnitary(size);
        const Udagger = U.dagger();
        const product = U.mul(Udagger);
        const identity = Matrix.identity(size);
        
        expect(product.equals(identity, 1e-10)).toBe(true);
      }
    });

    it('should satisfy U† * U = I', () => {
      const sizes = [2, 3];
      
      for (const size of sizes) {
        const U = randomUnitary(size);
        const Udagger = U.dagger();
        const product = Udagger.mul(U);
        const identity = Matrix.identity(size);
        
        expect(product.equals(identity, 1e-10)).toBe(true);
      }
    });

    it('should generate matrices with unit column norms', () => {
      const U = randomUnitary(3);
      
      for (let j = 0; j < 3; j++) {
        let norm = 0;
        for (let i = 0; i < 3; i++) {
          const elem = U.get(i, j);
          norm += elem.re * elem.re + elem.im * elem.im;
        }
        norm = Math.sqrt(norm);
        
        expect(Math.abs(norm - 1)).toBeLessThan(1e-10);
      }
    });

    it('should generate matrices with orthogonal columns', () => {
      const U = randomUnitary(3);
      
      // Check orthogonality between different columns
      for (let j1 = 0; j1 < 3; j1++) {
        for (let j2 = j1 + 1; j2 < 3; j2++) {
          let dotProduct = ComplexNum.zero();
          
          for (let i = 0; i < 3; i++) {
            const elem1 = ComplexNum.conj(U.get(i, j1));
            const elem2 = U.get(i, j2);
            dotProduct = ComplexNum.add(dotProduct, ComplexNum.mul(elem1, elem2));
          }
          
          // Dot product should be zero for orthogonal columns
          expect(Math.abs(dotProduct.re)).toBeLessThan(1e-10);
          expect(Math.abs(dotProduct.im)).toBeLessThan(1e-10);
        }
      }
    });

    it('should handle size 1 correctly', () => {
      const U = randomUnitary(1);
      
      expect(U.rows).toBe(1);
      expect(U.cols).toBe(1);
      
      // For 1x1 unitary matrices, |U[0,0]| = 1
      const elem = U.get(0, 0);
      const magnitude = Math.sqrt(elem.re * elem.re + elem.im * elem.im);
      expect(Math.abs(magnitude - 1)).toBeLessThan(1e-10);
    });

    it('tells a story: Alice generates random quantum gates', () => {
      // Alice wants to create random quantum gates for her quantum circuit
      const singleQubitGate = randomUnitary(2);
      const twoQubitGate = randomUnitary(4);
      
      // Both should be valid unitary matrices
      expect(isUnitary(singleQubitGate)).toBe(true);
      expect(isUnitary(twoQubitGate)).toBe(true);
      
      // She verifies they preserve quantum state normalization
      // by checking that applying them to normalized states preserves the trace
      const initialState = new Matrix([
        [ComplexNum.fromReal(0.5), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.fromReal(0.5)]
      ]);
      
      const finalState = singleQubitGate.mul(initialState).mul(singleQubitGate.dagger());
      const trace = finalState.trace();
      
      expect(Math.abs(trace.re - 1)).toBeLessThan(1e-10);
      expect(Math.abs(trace.im)).toBeLessThan(1e-10);
    });

    it('tells a story: Bob tests the randomness of quantum gates', () => {
      // Bob generates multiple random gates and checks they are different
      const gates = [];
      const numGates = 5;
      
      for (let i = 0; i < numGates; i++) {
        gates.push(randomUnitary(2));
      }
      
      // All gates should be different (with very high probability)
      for (let i = 0; i < numGates; i++) {
        for (let j = i + 1; j < numGates; j++) {
          expect(gates[i].equals(gates[j], 1e-10)).toBe(false);
        }
      }
      
      // But all should be unitary
      for (const gate of gates) {
        expect(isUnitary(gate)).toBe(true);
      }
    });

    it('tells a story: Charlie explores Haar random unitaries', () => {
      // Charlie knows that Haar random unitaries should be uniformly distributed
      // over the group of unitary matrices. He tests basic properties.
      
      const U = randomUnitary(2);
      
      // The matrix should be unitary
      expect(isUnitary(U)).toBe(true);
      
      // Charlie applies it to a simple state
      const initialState = new Matrix([
        [ComplexNum.one()],
        [ComplexNum.zero()]
      ]);
      
      const finalState = U.mul(initialState);
      
      // The final state should be normalized
      let norm = 0;
      for (let i = 0; i < 2; i++) {
        const elem = finalState.get(i, 0);
        norm += elem.re * elem.re + elem.im * elem.im;
      }
      
      expect(Math.abs(norm - 1)).toBeLessThan(1e-10);
    });
  });
}); 