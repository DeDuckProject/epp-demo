import { Matrix } from '../matrix/matrix';
import { ComplexNum } from '../types/complex';

/**
 * Build an n-qubit CNOT unitary matrix for given control and target qubit indices.
 * Uses little-endian convention (qubit 0 = least significant bit).
 */
export function cnotMatrix(
    numQubits: number,
    control: number,
    target: number,
): Matrix {
  const dim = 1 << numQubits;
  // initialize zero matrix
  const data: import('../types/complex').Complex[][] = Array.from({ length: dim }, () =>
      Array.from({ length: dim }, () => ComplexNum.zero())
  );
  // TODO might be more readable but it works...
  for (let i = 0; i < dim; i++) {
    // check target bit
    const controlBit = (i >> target) & 1;
    let j = i;
    if (controlBit === 1) {
      // flip control bit
      j = i ^ (1 << control);
    }
    data[j][i] = ComplexNum.one();
  }
  return new Matrix(data);
}
