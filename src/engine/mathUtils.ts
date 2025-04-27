import { ComplexNum } from '../engine_real_calculations/types/complex';
import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix';

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