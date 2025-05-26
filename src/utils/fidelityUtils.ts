import { QubitPair } from '../engine/types';

/**
 * Calculates the average fidelity from an array of qubit pairs
 * @param pairs Array of qubit pairs
 * @returns Average fidelity value, or 0 if no pairs
 */
export function calculateAverageFidelity(pairs: QubitPair[]): number {
  if (pairs.length === 0) {
    return 0;
  }
  
  const totalFidelity = pairs.reduce((sum, pair) => sum + pair.fidelity, 0);
  return totalFidelity / pairs.length;
} 