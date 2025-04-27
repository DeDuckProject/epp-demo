import { DensityMatrix } from './types';
import { ComplexNum } from '../engine_real_calculations/types/complex';

export const matrixMultiply = (a: DensityMatrix, b: DensityMatrix): DensityMatrix => {
  const size = a.length;
  const result: DensityMatrix = Array(size).fill(0).map(() => 
    Array(size).fill(0).map(() => ComplexNum.zero())
  );

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        result[i][j] = ComplexNum.add(result[i][j], ComplexNum.mul(a[i][k], b[k][j]));
      }
    }
  }
  
  return result;
};

export const tensorProduct = (a: DensityMatrix, b: DensityMatrix): DensityMatrix => {
  const sizeA = a.length;
  const sizeB = b.length;
  const size = sizeA * sizeB;
  
  const result: DensityMatrix = Array(size).fill(0).map(() => 
    Array(size).fill(0).map(() => ComplexNum.zero())
  );
  
  for (let i1 = 0; i1 < sizeA; i1++) {
    for (let j1 = 0; j1 < sizeA; j1++) {
      for (let i2 = 0; i2 < sizeB; i2++) {
        for (let j2 = 0; j2 < sizeB; j2++) {
          const i = i1 * sizeB + i2;
          const j = j1 * sizeB + j2;
          result[i][j] = ComplexNum.mul(a[i1][j1], b[i2][j2]);
        }
      }
    }
  }
  
  return result;
};

export const partialTrace = (rho: DensityMatrix, subsystemSize: number, traceOutFirst: boolean): DensityMatrix => {
  const totalSize = rho.length;
  const resultSize = totalSize / subsystemSize;
  
  const result: DensityMatrix = Array(resultSize).fill(0).map(() => 
    Array(resultSize).fill(0).map(() => ComplexNum.zero())
  );
  
  for (let i = 0; i < resultSize; i++) {
    for (let j = 0; j < resultSize; j++) {
      for (let k = 0; k < subsystemSize; k++) {
        const idx1 = traceOutFirst ? k * resultSize + i : i * subsystemSize + k;
        const idx2 = traceOutFirst ? k * resultSize + j : j * subsystemSize + k;
        result[i][j] = ComplexNum.add(result[i][j], rho[idx1][idx2]);
      }
    }
  }
  
  return result;
};

// Calculate fidelity in Bell basis - it's the element corresponding to our target state
export const calculateBellBasisFidelity = (rho: DensityMatrix): number => {
  // After exchange, our target state is |Φ⁺⟩ (index 0)
  // Before exchange, our target state is |Ψ⁻⟩ (index 3)
  return rho[0][0].re;
}; 