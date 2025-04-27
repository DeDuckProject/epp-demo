import { DensityMatrix } from './types';
import { ComplexNum } from '../engine_real_calculations/types/complex';

// Create a noisy EPR pair in Bell basis
export const createNoisyEPR = (noiseParam: number): DensityMatrix => {
  // Start with a perfect Bell state |Ψ⁻⟩ in the Bell basis

  // Create the noisy state in Bell basis
  const noisyState: DensityMatrix = Array(4).fill(0).map(() => 
    Array(4).fill(0).map(() => ComplexNum.zero())
  );
  
  // In Bell basis, a perfect |Ψ⁻⟩ has 1 in the [3][3] position
  // Noise will distribute probability to other Bell states
  noisyState[0][0] = new ComplexNum(noiseParam / 3, 0); // |Φ⁺⟩⟨Φ⁺|
  noisyState[1][1] = new ComplexNum(noiseParam / 3, 0); // |Φ⁻⟩⟨Φ⁻|
  noisyState[2][2] = new ComplexNum(noiseParam / 3, 0); // |Ψ⁺⟩⟨Ψ⁺|
  noisyState[3][3] = new ComplexNum(1 - noiseParam, 0); // |Ψ⁻⟩⟨Ψ⁻|
  
  // Add off-diagonal elements to create non-Werner state
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i !== j) {
        // Add coherent noise (off-diagonal elements)
        const noiseReal = noiseParam * (Math.random() - 0.5) * 0.1;
        const noiseImag = noiseParam * (Math.random() - 0.5) * 0.1;
        noisyState[i][j] = new ComplexNum(noiseReal, noiseImag);
      }
    }
  }
  
  return noisyState;
}; 