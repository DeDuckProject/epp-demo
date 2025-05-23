import { describe, it, expect } from 'vitest';
import { getDiagonalColor, getOffDiagonalColor, calculateComplexAbsValue } from '../../src/utils/colorUtils';

describe('Color Utils', () => {
  describe('calculateComplexAbsValue', () => {
    it('should calculate absolute value of real numbers correctly', () => {
      expect(calculateComplexAbsValue(3, 0)).toBeCloseTo(3);
      expect(calculateComplexAbsValue(-4, 0)).toBeCloseTo(4);
      expect(calculateComplexAbsValue(0, 0)).toBeCloseTo(0);
    });

    it('should calculate absolute value of imaginary numbers correctly', () => {
      expect(calculateComplexAbsValue(0, 3)).toBeCloseTo(3);
      expect(calculateComplexAbsValue(0, -4)).toBeCloseTo(4);
    });

    it('should calculate absolute value of complex numbers correctly', () => {
      expect(calculateComplexAbsValue(3, 4)).toBeCloseTo(5); // 3-4-5 triangle
      expect(calculateComplexAbsValue(1, 1)).toBeCloseTo(Math.sqrt(2));
      expect(calculateComplexAbsValue(-1, -1)).toBeCloseTo(Math.sqrt(2));
    });

    it('should handle edge cases for density matrix values', () => {
      // Maximum probability value
      expect(calculateComplexAbsValue(1, 0)).toBeCloseTo(1);
      // Minimum probability value
      expect(calculateComplexAbsValue(0, 0)).toBeCloseTo(0);
      // Typical coherence values
      expect(calculateComplexAbsValue(0.5, 0.5)).toBeCloseTo(Math.sqrt(0.5));
    });
  });

  describe('getDiagonalColor', () => {
    it('should return white for zero absolute value', () => {
      const color = getDiagonalColor(0);
      expect(color).toBe('rgb(255, 255, 255)');
    });

    it('should return deep green for maximum absolute value', () => {
      const color = getDiagonalColor(1);
      expect(color).toBe('rgb(16, 185, 129)');
    });

    it('should interpolate correctly for middle values', () => {
      const color = getDiagonalColor(0.5);
      // Should be halfway between white (255,255,255) and deep green (16,185,129)
      const expectedR = Math.round(255 + (16 - 255) * 0.5); // 135.5 -> 136
      const expectedG = Math.round(255 + (185 - 255) * 0.5); // 220
      const expectedB = Math.round(255 + (129 - 255) * 0.5); // 192
      expect(color).toBe(`rgb(${expectedR}, ${expectedG}, ${expectedB})`);
    });

    it('should clamp values outside 0-1 range', () => {
      expect(getDiagonalColor(-0.5)).toBe('rgb(255, 255, 255)'); // Clamped to 0
      expect(getDiagonalColor(1.5)).toBe('rgb(16, 185, 129)'); // Clamped to 1
    });
  });

  describe('getOffDiagonalColor', () => {
    it('should return white for zero absolute value', () => {
      const color = getOffDiagonalColor(0);
      expect(color).toBe('rgb(255, 255, 255)');
    });

    it('should return deep red for maximum absolute value', () => {
      const color = getOffDiagonalColor(1);
      expect(color).toBe('rgb(220, 38, 38)');
    });

    it('should interpolate correctly for middle values', () => {
      const color = getOffDiagonalColor(0.5);
      // Should be halfway between white (255,255,255) and deep red (220,38,38)
      const expectedR = Math.round(255 + (220 - 255) * 0.5); // 237.5 -> 238
      const expectedG = Math.round(255 + (38 - 255) * 0.5); // 146.5 -> 147
      const expectedB = Math.round(255 + (38 - 255) * 0.5); // 146.5 -> 147
      expect(color).toBe(`rgb(${expectedR}, ${expectedG}, ${expectedB})`);
    });

    it('should clamp values outside 0-1 range', () => {
      expect(getOffDiagonalColor(-0.5)).toBe('rgb(255, 255, 255)'); // Clamped to 0
      expect(getOffDiagonalColor(1.5)).toBe('rgb(220, 38, 38)'); // Clamped to 1
    });
  });

  describe('Color differentiation story', () => {
    it('should provide visually distinct colors for diagonal vs off-diagonal elements', () => {
      // Same absolute value should produce different colors for diagonal vs off-diagonal
      const diagColor = getDiagonalColor(0.7);
      const offDiagColor = getOffDiagonalColor(0.7);
      
      expect(diagColor).not.toBe(offDiagColor);
      
      // Extract RGB values to verify color trends
      const diagRGB = diagColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      const offDiagRGB = offDiagColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      
      expect(diagRGB).toBeTruthy();
      expect(offDiagRGB).toBeTruthy();
      
      if (diagRGB && offDiagRGB) {
        const [, diagR, diagG, diagB] = diagRGB.map(Number);
        const [, offDiagR, offDiagG, offDiagB] = offDiagRGB.map(Number);
        
        // Diagonal should have more green component (tending toward green)
        expect(diagG).toBeGreaterThan(diagR);
        expect(diagG).toBeGreaterThan(diagB);
        
        // Off-diagonal should have more red component
        expect(offDiagR).toBeGreaterThan(offDiagG);
        expect(offDiagR).toBeGreaterThan(offDiagB);
      }
    });

    it('should show progression from white to target colors across the range', () => {
      // Test progression for diagonal elements (white to green)
      const diag0 = getDiagonalColor(0);
      const diag33 = getDiagonalColor(0.33);
      const diag67 = getDiagonalColor(0.67);
      const diag100 = getDiagonalColor(1);
      
      expect(diag0).toBe('rgb(255, 255, 255)'); // White
      expect(diag100).toBe('rgb(16, 185, 129)'); // Deep green
      
      // Middle values should be between white and deep green
      expect(diag33).not.toBe(diag0);
      expect(diag33).not.toBe(diag100);
      expect(diag67).not.toBe(diag33);
      expect(diag67).not.toBe(diag100);
    });
  });
}); 