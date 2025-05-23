/**
 * Color utilities for density matrix visualization
 */
/**
 * Get background color for diagonal density matrix elements based on absolute value
 * Interpolates from white to deep green
 */
export declare function getDiagonalColor(absValue: number): string;
/**
 * Get background color for off-diagonal density matrix elements based on absolute value
 * Interpolates from white to deep red
 */
export declare function getOffDiagonalColor(absValue: number): string;
/**
 * Calculate the absolute value of a complex number
 */
export declare function calculateComplexAbsValue(re: number, im: number): number;
