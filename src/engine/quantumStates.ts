import { ComplexNum } from '../engine_real_calculations/types/complex';
import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix'; // Import class

// Create a noisy EPR pair in Bell basis
export const createNoisyEPR = (noiseParam: number): DensityMatrix => {
  // Start with a perfect Bell state |Ψ⁻⟩ in the Bell basis

  // Create the noisy state data in Bell basis
  const noisyStateData: ComplexNum[][] = Array(4).fill(0).map(() => 
    Array(4).fill(0).map(() => ComplexNum.zero())
  );
  
  // In Bell basis, a perfect |Ψ⁻⟩ has 1 in the [3][3] position
  // Noise will distribute probability to other Bell states
  noisyStateData[0][0] = new ComplexNum(noiseParam / 3, 0); // |Φ⁺⟩⟨Φ⁺|
  noisyStateData[1][1] = new ComplexNum(noiseParam / 3, 0); // |Φ⁻⟩⟨Φ⁻|
  noisyStateData[2][2] = new ComplexNum(noiseParam / 3, 0); // |Ψ⁺⟩⟨Ψ⁺|
  noisyStateData[3][3] = new ComplexNum(1 - noiseParam, 0); // |Ψ⁻⟩⟨Ψ⁻|
  
  // Add off-diagonal elements to create non-Werner state
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i !== j) {
        // Add coherent noise (off-diagonal elements)
        const noiseReal = noiseParam * (Math.random() - 0.5) * 0.1;
        const noiseImag = noiseParam * (Math.random() - 0.5) * 0.1;
        noisyStateData[i][j] = new ComplexNum(noiseReal, noiseImag);
      }
    }
  }
  
  return new DensityMatrix(noisyStateData); // Return DensityMatrix instance
}; 