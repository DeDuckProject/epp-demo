/**
 * Color utilities for density matrix visualization
 */

/**
 * Interpolate between two RGB colors based on a value from 0 to 1
 */
function interpolateRGB(color1: [number, number, number], color2: [number, number, number], factor: number): string {
  // Clamp factor between 0 and 1
  const t = Math.max(0, Math.min(1, factor));
  
  const r = Math.round(color1[0] + (color2[0] - color1[0]) * t);
  const g = Math.round(color1[1] + (color2[1] - color1[1]) * t);
  const b = Math.round(color1[2] + (color2[2] - color1[2]) * t);
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Get background color for diagonal density matrix elements based on absolute value
 * Interpolates from white to deep green
 */
export function getDiagonalColor(absValue: number): string {
  // White to deep green (matching --highlight-green #10B981)
  const white: [number, number, number] = [255, 255, 255];
  const deepGreen: [number, number, number] = [16, 185, 129]; // #10B981
  
  return interpolateRGB(white, deepGreen, absValue);
}

/**
 * Get background color for off-diagonal density matrix elements based on absolute value
 * Interpolates from white to deep red
 */
export function getOffDiagonalColor(absValue: number): string {
  // White to deep red (matching current #fff5f5 theme)
  const white: [number, number, number] = [255, 255, 255];
  const deepRed: [number, number, number] = [220, 38, 38]; // #dc2626
  
  return interpolateRGB(white, deepRed, absValue);
}

/**
 * Calculate the absolute value of a complex number
 */
export function calculateComplexAbsValue(re: number, im: number): number {
  return Math.sqrt(re * re + im * im);
} 