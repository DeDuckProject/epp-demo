import { describe, test, expect } from 'vitest';
import { formatComplex, hasOffDiagonalElements } from '../../src/utils/matrixFormatting';
import { Matrix } from '../../src/engine_real_calculations/matrix/matrix';

describe('Matrix Formatting Utilities', () => {
  describe('formatComplex', () => {
    test('formats purely real numbers correctly', () => {
      expect(formatComplex({ re: 1.23456, im: 0 })).toBe('1.235');
    });

    test('formats purely imaginary numbers correctly', () => {
      expect(formatComplex({ re: 0, im: -0.5 })).toBe('-0.500i');
    });

    test('formats complex numbers correctly', () => {
      expect(formatComplex({ re: 0.1, im: 0.2 })).toBe('0.100+0.200i');
    });

    test('formats small numbers below threshold as 0', () => {
      expect(formatComplex({ re: 0.0001, im: 0.0002 })).toBe('0');
    });

    test('uses provided threshold', () => {
      // Should be formatted as 0 with default threshold
      const smallNum = { re: 0.0005, im: 0.0005 };
      expect(formatComplex(smallNum)).toBe('0');
      
      // Should show value with smaller threshold
      expect(formatComplex(smallNum, 0.0001)).toBe('0.001+0.001i');
    });
  });

  describe('hasOffDiagonalElements', () => {
    test('correctly identifies diagonal-only matrices', () => {
      const diagMatrix = new Matrix([
        [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }]
      ]);
      
      expect(hasOffDiagonalElements(diagMatrix)).toBe(false);
    });

    test('correctly identifies matrices with off-diagonal elements', () => {
      const offDiagMatrix = new Matrix([
        [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.02, im: 0 }, { re: 0.25, im: 0 }]
      ]);
      
      expect(hasOffDiagonalElements(offDiagMatrix)).toBe(true);
    });

    test('correctly identifies matrices with imaginary off-diagonal elements', () => {
      const imagOffDiagMatrix = new Matrix([
        [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0.002 }, { re: 0.25, im: 0 }]
      ]);
      
      expect(hasOffDiagonalElements(imagOffDiagMatrix)).toBe(true);
    });

    test('uses provided threshold', () => {
      // Matrix with "small" off-diagonal elements
      const smallOffDiagMatrix = new Matrix([
        [{ re: 0.25, im: 0 }, { re: 0.0005, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0.0005, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }]
      ]);
      
      // With default threshold (0.001), should return false
      expect(hasOffDiagonalElements(smallOffDiagMatrix)).toBe(false);
      
      // With smaller threshold, should return true
      expect(hasOffDiagonalElements(smallOffDiagMatrix, 0.0001)).toBe(true);
    });
  });
}); 