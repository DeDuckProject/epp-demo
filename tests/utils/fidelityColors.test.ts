import { describe, it, expect } from 'vitest';
import { getFidelityColor, getBorderGlow, getFidelityColorRGB } from '../../src/utils/fidelityColors';

describe('fidelityColors utilities', () => {
  describe('getFidelityColor', () => {
    it('should return grey color for discarded items', () => {
      const color = getFidelityColor(0.8, true);
      expect(color).toBe('rgba(180, 180, 180, 0.5)');
    });

    it('should return red color for low fidelity (0)', () => {
      const color = getFidelityColor(0, false);
      expect(color).toBe('hsla(0, 80%, 60%, 0.8)');
    });

    it('should return green color for high fidelity (1)', () => {
      const color = getFidelityColor(1, false);
      expect(color).toBe('hsla(120, 80%, 60%, 0.8)');
    });

    it('should return yellow-orange color for medium fidelity (0.5)', () => {
      const color = getFidelityColor(0.5, false);
      expect(color).toBe('hsla(60, 80%, 60%, 0.8)');
    });

    it('should handle edge cases gracefully', () => {
      expect(getFidelityColor(-0.1, false)).toBe('hsla(0, 80%, 60%, 0.8)');
      expect(getFidelityColor(1.1, false)).toBe('hsla(120, 80%, 60%, 0.8)');
    });
  });

  describe('getBorderGlow', () => {
    it('should return no glow for discarded items', () => {
      const glow = getBorderGlow(0.8, true);
      expect(glow).toBe('none');
    });

    it('should return no glow for zero fidelity', () => {
      const glow = getBorderGlow(0, false);
      expect(glow).toBe('0 0 0px rgba(46, 204, 113, 0.0)');
    });

    it('should return maximum glow for perfect fidelity', () => {
      const glow = getBorderGlow(1, false);
      expect(glow).toBe('0 0 15px rgba(46, 204, 113, 1.0)');
    });

    it('should scale glow intensity with fidelity', () => {
      const glow = getBorderGlow(0.5, false);
      expect(glow).toBe('0 0 7px rgba(46, 204, 113, 0.5)');
    });
  });

  describe('getFidelityColorRGB', () => {
    it('should return red RGB for low fidelity', () => {
      const color = getFidelityColorRGB(0);
      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      // Should be reddish (high red component)
      const [r, g, b] = color.match(/\d+/g)!.map(Number);
      expect(r).toBeGreaterThan(g);
      expect(r).toBeGreaterThan(b);
    });

    it('should return green RGB for high fidelity', () => {
      const color = getFidelityColorRGB(1);
      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      // Should be greenish (high green component)
      const [r, g, b] = color.match(/\d+/g)!.map(Number);
      expect(g).toBeGreaterThan(r);
      expect(g).toBeGreaterThan(b);
    });

    it('should return yellow-orange RGB for medium fidelity', () => {
      const color = getFidelityColorRGB(0.5);
      expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      // Should be yellowish (high red and green, low blue)
      const [r, g, b] = color.match(/\d+/g)!.map(Number);
      expect(r).toBeGreaterThan(b);
      expect(g).toBeGreaterThan(b);
    });

    it('should handle edge cases', () => {
      expect(() => getFidelityColorRGB(-0.1)).not.toThrow();
      expect(() => getFidelityColorRGB(1.1)).not.toThrow();
      expect(getFidelityColorRGB(-0.1)).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
      expect(getFidelityColorRGB(1.1)).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
  });

  describe('color consistency', () => {
    it('should maintain color relationships across different formats', () => {
      const fidelity = 0.7;
      const hslaColor = getFidelityColor(fidelity, false);
      const rgbColor = getFidelityColorRGB(fidelity);
      
      // Both should represent the same hue (greenish for 0.7)
      expect(hslaColor).toContain('84'); // hue should be 84 (0.7 * 120)
      expect(rgbColor).toMatch(/^rgb\(/);
    });

    it('should show progression from red to green', () => {
      const lowFidelity = getFidelityColorRGB(0.1);
      const midFidelity = getFidelityColorRGB(0.5);
      const highFidelity = getFidelityColorRGB(0.9);
      
      // Extract RGB values
      const lowRGB = lowFidelity.match(/\d+/g)!.map(Number);
      const midRGB = midFidelity.match(/\d+/g)!.map(Number);
      const highRGB = highFidelity.match(/\d+/g)!.map(Number);
      
      // Low fidelity should be more red
      expect(lowRGB[0]).toBeGreaterThan(lowRGB[1]); // R > G
      
      // High fidelity should be more green
      expect(highRGB[1]).toBeGreaterThan(highRGB[0]); // G > R
      
      // Mid fidelity should be balanced (yellowish)
      expect(Math.abs(midRGB[0] - midRGB[1])).toBeLessThan(50); // R ≈ G
    });
  });
}); 