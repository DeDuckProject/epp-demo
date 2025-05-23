import { ComplexNum } from '../engine_real_calculations/types/complex';
import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix'; // Import class
import { NoiseChannel } from './types';
import { 
  applyDepolarizing, 
  applyDephasing, 
  applyAmplitudeDamping, 
  applyUniformNoise 
} from '../engine_real_calculations/channels/noise';

// Create a noisy EPR pair in Bell basis
// Deprecated
export const createNoisyEPR = (noiseParam: number): DensityMatrix => {
  // Start with a perfect Bell state |Ψ⁻⟩ in the Bell basis

  // Create the density matrix directly
  const noisyState = new DensityMatrix(Array(4).fill(0).map(() => 
    Array(4).fill(0).map(() => ComplexNum.zero())
  ));
  
  // In Bell basis, a perfect |Ψ⁻⟩ has 1 in the [3][3] position
  // Noise will distribute probability to other Bell states
  // Set diagonal elements using .set()
  noisyState.set(0, 0, new ComplexNum(noiseParam / 3, 0)); // |Φ⁺⟩⟨Φ⁺|
  noisyState.set(1, 1, new ComplexNum(noiseParam / 3, 0)); // |Φ⁻⟩⟨Φ⁻|
  noisyState.set(2, 2, new ComplexNum(noiseParam / 3, 0)); // |Ψ⁺⟩⟨Ψ⁺|
  noisyState.set(3, 3, new ComplexNum(1 - noiseParam, 0)); // |Ψ⁻⟩⟨Ψ⁻|
  
  // Add off-diagonal elements to create non-Werner state
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i !== j) {
        // Add coherent noise (off-diagonal elements)
        const noiseReal = noiseParam * (Math.random() - 0.5) * 0.1;
        const noiseImag = noiseParam * (Math.random() - 0.5) * 0.1;
        noisyState.set(i, j, new ComplexNum(noiseReal, noiseImag)); // Use set()
      }
    }
  }
  
  return noisyState; // Return the DensityMatrix instance
}; 

// Create a noisy EPR pair using selected noise channel
export const createNoisyEPRWithChannel = (noiseParam: number, noiseChannel: NoiseChannel): DensityMatrix => {
  // Start with perfect Bell state |Ψ-⟩ in computational basis
  const pureRho = DensityMatrix.bellPsiMinus();
  
  // Apply selected noise to Bob's qubit (qubit 1)
  switch (noiseChannel) {
    case NoiseChannel.Depolarizing:
      return applyDepolarizing(pureRho, 1, noiseParam);
    case NoiseChannel.Dephasing:
      return applyDephasing(pureRho, 1, noiseParam);
    case NoiseChannel.AmplitudeDamping:
      return applyAmplitudeDamping(pureRho, 1, noiseParam);
    case NoiseChannel.UniformNoise:
      return applyUniformNoise(pureRho, 1, noiseParam);
    default:
      throw new Error(`Unknown noise channel: ${noiseChannel}`);
  }
}; 