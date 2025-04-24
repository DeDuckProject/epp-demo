import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';

/* TODO we'll need to add this as well:
Bilateral π/2 rotations Bx, By, and Bz of both particles in a pair about the x, y, or z axis respectively.
Each of these operations leaves the singlet state and a different one of the triplets invariant,
interchanging the other two triplets, with Bx mapping Φ+ ↔ Ψ+, By mapping Φ− ↔  Ψ+, and Bz mapping Φ+ ↔ Φ−.
Again we omit phases.
(from BBPSSW paper 10.1103/PhysRevLett.76.722)

 */
/** Single-qubit Pauli matrices */
export function pauliMatrix(p: 'I'|'X'|'Y'|'Z'): Matrix {
  switch (p) {
    case 'I':
      return Matrix.identity(2);
    case 'X':
      return new Matrix([
        [ComplexNum.zero(), ComplexNum.one()],
        [ComplexNum.one(), ComplexNum.zero()]
      ]);
    case 'Y':
      return new Matrix([
        [ComplexNum.zero(), { re: 0, im: -1 }],
        [{ re: 0, im: 1 }, ComplexNum.zero()]
      ]);
    case 'Z':
      return new Matrix([
        [ComplexNum.one(), ComplexNum.zero()],
        [ComplexNum.zero(), { re: -1, im: 0 }]
      ]);
    default:
      throw new Error(`Unknown Pauli: ${p}`);
  }
}

/**
 * Build an n-qubit Pauli operator: tensor of specified Paulis on targets, identity elsewhere.
 * Uses little-endian convention (qubit 0 = least significant).
 */
export function pauliOperator(
  numQubits: number,
  targets: number[],
  paulis: ('I'|'X'|'Y'|'Z')[]
): Matrix {
  if (targets.length !== paulis.length) {
    throw new Error('Targets and Pauli arrays must have same length');
  }
  const pauliMap = new Map<number, 'I'|'X'|'Y'|'Z'>();
  targets.forEach((t, i) => pauliMap.set(t, paulis[i]));

  let op: Matrix | null = null;
  // Tensor order: lowest qubit (0) ⊗ ... ⊗ highest qubit (numQubits-1)
  for (let q = 0; q < numQubits; q++) {
    const type: 'I'|'X'|'Y'|'Z' = pauliMap.has(q) ? pauliMap.get(q)! : 'I';
    const local = pauliMatrix(type);
    op = op ? op.tensor(local) : local;
  }
  return op!;
} 