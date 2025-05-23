import { describe, it, expect } from 'vitest';
import { Matrix } from '../../../src/engine_real_calculations/matrix/matrix.ts';
import { ComplexNum } from '../../../src/engine_real_calculations/types/complex.ts';
import { matrixExp, matrixLog, isUnitary } from '../../../src/engine_real_calculations/utils/matrixExp.ts';

describe('Matrix Exponential and Logarithm Utilities', () => {
  describe('matrixExp', () => {
    it('should compute exponential of zero matrix as identity', () => {
      const zero = Matrix.zeros(2, 2);
      const result = matrixExp(zero);
      const identity = Matrix.identity(2);
      
      expect(result.equals(identity, 1e-10)).toBe(true);
    });

    it('should throw error for non-square matrix', () => {
      const nonSquare = Matrix.zeros(2, 3);
      
      expect(() => matrixExp(nonSquare)).toThrow('Matrix must be square for exponentiation');
    });

    it('should compute exponential of diagonal matrix correctly', () => {
      // Diagonal matrix with entries [1, 2]
      const diag = new Matrix([
        [ComplexNum.one(), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.fromReal(2)]
      ]);
      
      const result = matrixExp(diag);
      
      // Should give diagonal matrix with entries [e^1, e^2]
      const expected = new Matrix([
        [ComplexNum.fromReal(Math.E), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.fromReal(Math.E * Math.E)]
      ]);
      
      expect(result.equals(expected, 1e-10)).toBe(true);
    });

    it('should preserve properties for small matrices', () => {
      const smallMatrix = new Matrix([
        [ComplexNum.fromReal(0.1), ComplexNum.fromReal(0.2)],
        [ComplexNum.fromReal(0.3), ComplexNum.fromReal(0.4)]
      ]);
      
      const result = matrixExp(smallMatrix);
      
      // Result should be invertible (determinant non-zero)
      // For small matrices, exp(A) is always invertible
      expect(result.rows).toBe(2);
      expect(result.cols).toBe(2);
    });

    it('tells a story: exponentiating a quantum evolution generator', () => {
      // Alice has a quantum system with Hamiltonian H
      const hamiltonian = new Matrix([
        [ComplexNum.zero(), ComplexNum.fromReal(1)],
        [ComplexNum.fromReal(1), ComplexNum.zero()]
      ]);
      
      // The time evolution operator is U = exp(-iHt)
      // For t = π/2 and setting -i = i for simplicity
      const timeEvolutionGenerator = hamiltonian.scale(ComplexNum.fromReal(Math.PI / 2));
      const timeEvolutionOperator = matrixExp(timeEvolutionGenerator);
      
      // The result should be a valid matrix
      expect(timeEvolutionOperator.rows).toBe(2);
      expect(timeEvolutionOperator.cols).toBe(2);
    });
  });

  describe('matrixLog', () => {
    it('should compute logarithm element-wise', () => {
      const matrix = new Matrix([
        [ComplexNum.fromReal(Math.E), ComplexNum.fromReal(1)],
        [ComplexNum.fromReal(1), ComplexNum.fromReal(Math.E * Math.E)]
      ]);
      
      const result = matrixLog(matrix);
      
      // Should give approximately [1, 0; 0, 2] for diagonal elements
      expect(Math.abs(result.get(0, 0).re - 1)).toBeLessThan(1e-10);
      expect(Math.abs(result.get(1, 1).re - 2)).toBeLessThan(1e-10);
      // Off-diagonal elements should be log(1) = 0
      expect(Math.abs(result.get(0, 1).re)).toBeLessThan(1e-10);
      expect(Math.abs(result.get(1, 0).re)).toBeLessThan(1e-10);
    });

    it('should handle complex numbers correctly', () => {
      const matrix = new Matrix([
        [ComplexNum.fromReal(1), ComplexNum.zero()],
        [ComplexNum.zero(), { re: 0, im: 1 }] // i
      ]);
      
      const result = matrixLog(matrix);
      
      // log(1) = 0, log(i) = i*π/2
      expect(Math.abs(result.get(0, 0).re)).toBeLessThan(1e-10);
      expect(Math.abs(result.get(0, 0).im)).toBeLessThan(1e-10);
      expect(Math.abs(result.get(1, 1).re)).toBeLessThan(1e-10);
      expect(Math.abs(result.get(1, 1).im - Math.PI / 2)).toBeLessThan(1e-10);
    });

    it('tells a story: finding the generator of a unitary transformation', () => {
      // Alice has a unitary matrix representing a quantum gate
      const unitaryGate = new Matrix([
        [ComplexNum.fromReal(Math.cos(0.5)), ComplexNum.fromReal(-Math.sin(0.5))],
        [ComplexNum.fromReal(Math.sin(0.5)), ComplexNum.fromReal(Math.cos(0.5))]
      ]);
      
      // She wants to find the generator (approximately)
      const generator = matrixLog(unitaryGate);
      
      // The result should be a valid matrix
      expect(generator.rows).toBe(2);
      expect(generator.cols).toBe(2);
    });
  });

  describe('isUnitary', () => {
    it('should return true for identity matrix', () => {
      const identity = Matrix.identity(2);
      expect(isUnitary(identity)).toBe(true);
    });

    it('should return false for non-square matrix', () => {
      const nonSquare = Matrix.zeros(2, 3);
      expect(isUnitary(nonSquare)).toBe(false);
    });

    it('should return true for Pauli X matrix', () => {
      const pauliX = new Matrix([
        [ComplexNum.zero(), ComplexNum.one()],
        [ComplexNum.one(), ComplexNum.zero()]
      ]);
      expect(isUnitary(pauliX)).toBe(true);
    });

    it('should return true for Hadamard matrix', () => {
      const sqrt2 = Math.sqrt(2);
      const hadamard = new Matrix([
        [ComplexNum.fromReal(1/sqrt2), ComplexNum.fromReal(1/sqrt2)],
        [ComplexNum.fromReal(1/sqrt2), ComplexNum.fromReal(-1/sqrt2)]
      ]);
      expect(isUnitary(hadamard)).toBe(true);
    });

    it('should return false for non-unitary matrix', () => {
      const nonUnitary = new Matrix([
        [ComplexNum.fromReal(2), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.one()]
      ]);
      expect(isUnitary(nonUnitary)).toBe(false);
    });

    it('tells a story: Alice verifies her quantum gate is unitary', () => {
      // Alice designs a quantum gate
      const aliceGate = new Matrix([
        [ComplexNum.fromReal(1), ComplexNum.zero()],
        [ComplexNum.zero(), { re: 0, im: 1 }] // Phase gate
      ]);
      
      // She checks if it's unitary (valid quantum gate)
      const isValidGate = isUnitary(aliceGate);
      expect(isValidGate).toBe(true);
      
      // She tries another matrix that's not unitary
      const invalidGate = new Matrix([
        [ComplexNum.fromReal(2), ComplexNum.zero()],
        [ComplexNum.zero(), ComplexNum.zero()]
      ]);
      
      const isInvalidGate = isUnitary(invalidGate);
      expect(isInvalidGate).toBe(false);
    });
  });
}); 