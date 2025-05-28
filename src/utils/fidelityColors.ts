/**
 * Utility functions for mapping fidelity values to colors
 */

/**
 * Maps fidelity to a vibrant color gradient
 * @param fidelity - Value between 0 and 1
 * @param willBeDiscarded - Whether the item will be discarded (affects opacity)
 * @returns HSL color string
 */
export const getFidelityColor = (fidelity: number, willBeDiscarded: boolean = false): string => {
  if (willBeDiscarded) {
    return 'rgba(180, 180, 180, 0.5)'; // Grey color for items to be discarded
  }
  // Clamp fidelity between 0 and 1
  const clampedFidelity = Math.max(0, Math.min(1, fidelity));
  const hue = Math.floor(120 * clampedFidelity); // 0 is red, 120 is green
  return `hsla(${hue}, 80%, 60%, 0.8)`;
};

/**
 * Gets border glow effect based on fidelity
 * @param fidelity - Value between 0 and 1
 * @param willBeDiscarded - Whether the item will be discarded
 * @returns CSS box-shadow string
 */
export const getBorderGlow = (fidelity: number, willBeDiscarded: boolean = false): string => {
  if (willBeDiscarded) {
    return 'none'; // No glow for items to be discarded
  }
  return `0 0 ${Math.floor(fidelity * 15)}px rgba(46, 204, 113, ${fidelity.toFixed(1)})`;
};

/**
 * Gets a pure color value for fidelity (without alpha)
 * @param fidelity - Value between 0 and 1
 * @returns RGB color string
 */
export const getFidelityColorRGB = (fidelity: number): string => {
  // Clamp fidelity between 0 and 1
  const clampedFidelity = Math.max(0, Math.min(1, fidelity));
  const hue = Math.floor(120 * clampedFidelity); // 0 is red, 120 is green
  // Convert HSL to RGB for better gradient support
  const saturation = 80;
  const lightness = 60;
  
  const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness / 100 - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (hue >= 0 && hue < 60) {
    r = c; g = x; b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x; g = c; b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0; g = c; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `rgb(${r}, ${g}, ${b})`;
}; 