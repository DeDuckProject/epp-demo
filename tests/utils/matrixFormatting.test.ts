import {describe, expect, test} from 'vitest';
import {formatComplex, hasOffDiagonalElements, isWerner} from '../../src/utils/matrixFormatting';
import {Matrix} from '../../src/engine_real_calculations/matrix/matrix';
import {toComputationalBasis} from "../../src/engine_real_calculations/bell/bell-basis";
import {Basis} from "../../src/engine/types.ts";

describe('Matrix Formatting Utilities', () => {
  describe('formatComplex', () => {
    test('formats zero values correctly', () => {
      expect(formatComplex({ re: 0, im: 0 })).toBe('0');
      expect(formatComplex({ re: 0.0005, im: 0.0005 })).toBe('0');
    });

    test('formats purely real values correctly', () => {
      expect(formatComplex({ re: 1, im: 0 })).toBe('1');
      expect(formatComplex({ re: -0.5, im: 0 })).toBe('-0.5');
      expect(formatComplex({ re: -0.50, im: 0 })).toBe('-0.5');
    });

    test('formats purely imaginary values correctly', () => {
      expect(formatComplex({ re: 0, im: 1 })).toBe('1i');
      expect(formatComplex({ re: 0, im: -0.5 })).toBe('- 0.5i');
    });

    test('formats complex values correctly', () => {
      expect(formatComplex({ re: 1, im: 1 })).toBe('1 + 1i');
      expect(formatComplex({ re: 1, im: -1 })).toBe('1 - 1i');
      expect(formatComplex({ re: -1, im: 1 })).toBe('-1 + 1i');
      expect(formatComplex({ re: -1, im: -1 })).toBe('-1 - 1i');
    });

    test('respects threshold parameter', () => {
      expect(formatComplex({ re: 0.01, im: 0.02 }, 0.05)).toBe('0');
      expect(formatComplex({ re: 0.1, im: 0.02 }, 0.05)).toBe('0.1');
      expect(formatComplex({ re: 0.01, im: 0.1 }, 0.05)).toBe('0.1i');
    });
  });

  describe('hasOffDiagonalElements', () => {
    test('returns false for diagonal matrices', () => {
      const diag = new Matrix([
        [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.5, im: 0 }]
      ]);
      expect(hasOffDiagonalElements(diag)).toBe(false);
    });

    test('returns true for matrices with off-diagonal elements', () => {
      const nonDiag = new Matrix([
        [{ re: 0.25, im: 0 }, { re: 0.01, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0.01, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.5, im: 0 }]
      ]);
      expect(hasOffDiagonalElements(nonDiag)).toBe(true);
    });

    test('respects threshold parameter', () => {
      const almostDiag = new Matrix([
        [{ re: 0.25, im: 0 }, { re: 0.001, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0.001, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.5, im: 0 }]
      ]);
      expect(hasOffDiagonalElements(almostDiag, 0.0005)).toBe(true);
      expect(hasOffDiagonalElements(almostDiag, 0.002)).toBe(false);
    });
  });

  describe('isWerner', () => {
    test('identifies Werner states correctly in Bell basis', () => {
      // Werner state in Bell basis (diagonal)
      const wernerBell = new Matrix([
        [{ re: 0.7, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0.1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.1, im: 0 }]
      ]);
      
      expect(isWerner(wernerBell, Basis.Bell)).toBe(true);
    });
    
    test('identifies non-Werner states correctly in Bell basis', () => {
      // Non-Werner state in Bell basis (has off-diagonals)
      const nonWernerBell = new Matrix([
        [{ re: 0.7, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.05, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0.1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0.05, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.1, im: 0 }]
      ]);
      
      expect(isWerner(nonWernerBell, Basis.Bell)).toBe(false);
    });
    
    test('correctly transforms computational basis matrices before checking', () => {
      // Create a Werner state in Bell basis (diagonal)
      const wernerBell = new Matrix([
        [{ re: 0.7, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0.1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.1, im: 0 }, { re: 0, im: 0 }],
        [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.1, im: 0 }]
      ]);
      
      // input should be computational basis
      const computationalMatrix = toComputationalBasis(wernerBell);
      
      // Call isWerner with the computational basis flag
      const result = isWerner(computationalMatrix, Basis.Computational);

      expect(result).toBe(true);
    });
  });
}); 