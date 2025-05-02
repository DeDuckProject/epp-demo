import { DensityMatrix } from '../matrix/densityMatrix';
import { Matrix } from '../matrix/matrix';
import { rx, ry, rz } from '../gates/rotations';
import { applyGate } from './applyGate';

// Define the 12 bilateral rotation sequences for Pauli twirling
export const PAULI_TWIRL_SEQUENCES: Array<Array<'x'|'y'|'z'>> = [
  [],                // I
  ['x', 'x'],        // Bx Bx
  ['y', 'y'],        // By By
  ['z', 'z'],        // Bz Bz
  ['x', 'y'],        // Bx By
  ['y', 'z'],        // By Bz
  ['z', 'x'],        // Bz Bx
  ['y', 'x'],        // By Bx
  ['x', 'y', 'x', 'y'], // Bx By Bx By
  ['y', 'z', 'y', 'z'], // By Bz By Bz
  ['z', 'x', 'z', 'x'], // Bz Bx Bz Bx
  ['y', 'x', 'y', 'x']  // By Bx By Bx
];

/**
 * Get Pauli twirl operator for a specified rotation sequence.
 * 
 * @param sequence Array of 'x', 'y', 'z' indicating rotation axes
 * @returns Bilateral π/2 rotation operator (U ⊗ U)
 */
export function getPauliTwirlOperator(sequence: Array<'x'|'y'|'z'>): Matrix {
  // If empty sequence, return identity operator on 2 qubits
  if (sequence.length === 0) {
    const I = Matrix.identity(2);
    return I.tensor(I);
  }
  
  // Apply π/2 rotations as specified in sequence
  let U = Matrix.identity(2);
  for (const axis of sequence) {
    const R = axis === 'x' ? rx(Math.PI/2) : 
              axis === 'y' ? ry(Math.PI/2) : 
              rz(Math.PI/2);
    U = R.mul(U);
  }
  
  // Return bilateral operator (U ⊗ U)
  return U.tensor(U);
}

/**
 * Apply random Pauli twirling to a 2-qubit density matrix.
 * 
 * This creates a Werner state by applying one of 12 bilateral rotations randomly.
 * In the Monte Carlo approach, we just need one random rotation rather than the average.
 * 
 * @param rho Two-qubit density matrix
 * @returns Twirled density matrix
 */
export function pauliTwirl(rho: DensityMatrix): DensityMatrix {
  // Select a random rotation sequence from the 12 possibilities
  const randomIndex = Math.floor(Math.random() * PAULI_TWIRL_SEQUENCES.length);
  const sequence = PAULI_TWIRL_SEQUENCES[randomIndex];
  
  // Get the corresponding unitary operator
  const U = getPauliTwirlOperator(sequence);
  
  // Apply the unitary operation: ρ → U ρ U†
  return applyGate(rho, U);
} 