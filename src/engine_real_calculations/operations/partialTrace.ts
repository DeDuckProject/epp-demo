import { DensityMatrix } from '../matrix/densityMatrix';
import { ComplexNum } from '../types/complex';

/**
 * Trace out the specified qubits, returning a reduced density matrix on remaining qubits.
 * Uses little-endian convention.
 */
export function partialTrace(
  rho: DensityMatrix,
  traceOut: number[]
): DensityMatrix {
  const dim = rho.rows;
  const n = Math.log2(dim);
  if (!Number.isInteger(n)) {
    throw new Error('Dimension not power of 2');
  }
  const totalQubits = n;
  const remain = [];
  for (let i = 0; i < totalQubits; i++) {
    if (!traceOut.includes(i)) {
      remain.push(i);
    }
  }
  const m = remain.length;
  const newDim = 1 << m;
  // initialize new density data
  const data: import('../types/complex').Complex[][] = [];
  for (let i = 0; i < newDim; i++) {
    data[i] = [];
    for (let j = 0; j < newDim; j++) {
      data[i][j] = ComplexNum.zero();
    }
  }
  // sum over basis states of traced-out qubits
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      let ri = 0;
      let rj = 0;
      // build remaining indices
      let ibit = 0;
      for (let q = 0; q < totalQubits; q++) {
        if (!traceOut.includes(q)) {
          const biti = (i >> q) & 1;
          const bitj = (j >> q) & 1;
          ri |= biti << ibit;
          rj |= bitj << ibit;
          ibit++;
        }
      }
      const elt = rho.get(i, j);
      data[ri][rj] = ComplexNum.add(data[ri][rj], elt);
    }
  }
  return new DensityMatrix(data);
} 