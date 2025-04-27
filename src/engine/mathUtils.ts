import { ComplexNum } from '../engine_real_calculations/types/complex';
import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix';

export const matrixMultiply = (a: DensityMatrix, b: DensityMatrix): DensityMatrix => {
  const size = a.rows;
  const resultData: ComplexNum[][] = Array(size).fill(0).map(() => 
    Array(size).fill(0).map(() => ComplexNum.zero())
  );

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        resultData[i][j] = ComplexNum.add(resultData[i][j], ComplexNum.mul(a.get(i, k), b.get(k, j)));
      }
    }
  }
  
  return new DensityMatrix(resultData);
};

export const tensorProduct = (a: DensityMatrix, b: DensityMatrix): DensityMatrix => {
  const sizeA = a.rows;
  const sizeB = b.rows;
  const size = sizeA * sizeB;
  
  const resultData: ComplexNum[][] = Array(size).fill(0).map(() => 
    Array(size).fill(0).map(() => ComplexNum.zero())
  );
  
  for (let i1 = 0; i1 < sizeA; i1++) {
    for (let j1 = 0; j1 < sizeA; j1++) {
      for (let i2 = 0; i2 < sizeB; i2++) {
        for (let j2 = 0; j2 < sizeB; j2++) {
          const i = i1 * sizeB + i2;
          const j = j1 * sizeB + j2;
          resultData[i][j] = ComplexNum.mul(a.get(i1, j1), b.get(i2, j2));
        }
      }
    }
  }
  
  return new DensityMatrix(resultData);
};

export const partialTrace = (rho: DensityMatrix, subsystemSize: number, traceOutFirst: boolean): DensityMatrix => {
  const totalSize = rho.rows;
  const resultSize = totalSize / subsystemSize;
  
  const resultData: ComplexNum[][] = Array(resultSize).fill(0).map(() => 
    Array(resultSize).fill(0).map(() => ComplexNum.zero())
  );
  
  for (let i = 0; i < resultSize; i++) {
    for (let j = 0; j < resultSize; j++) {
      for (let k = 0; k < subsystemSize; k++) {
        const idx1 = traceOutFirst ? k * resultSize + i : i * subsystemSize + k;
        const idx2 = traceOutFirst ? k * resultSize + j : j * subsystemSize + k;
        resultData[i][j] = ComplexNum.add(resultData[i][j], rho.get(idx1, idx2));
      }
    }
  }
  
  return new DensityMatrix(resultData);
};

// Calculate fidelity in Bell basis - it's the element corresponding to our target state
export const calculateBellBasisFidelity = (rho: DensityMatrix): number => {
  // After exchange, our target state is |Φ⁺⟩ (index 0)
  // Before exchange, our target state is |Ψ⁻⟩ (index 3)
  return rho.get(0, 0).re;
}; 