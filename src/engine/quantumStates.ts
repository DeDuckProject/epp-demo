import { DensityMatrix } from './types';
import { complex } from './mathUtils';

// Create a noisy EPR pair in Bell basis
export const createNoisyEPR = (noiseParam: number): DensityMatrix => {
  // Start with a perfect Bell state |Ψ⁻⟩ in the Bell basis

  // Create the noisy state in Bell basis
  const noisyState: DensityMatrix = Array(4).fill(0).map(() => 
    Array(4).fill(0).map(() => complex(0))
  );
  
  // In Bell basis, a perfect |Ψ⁻⟩ has 1 in the [3][3] position
  // Noise will distribute probability to other Bell states
  noisyState[0][0] = complex(noiseParam / 3); // |Φ⁺⟩⟨Φ⁺|
  noisyState[1][1] = complex(noiseParam / 3); // |Φ⁻⟩⟨Φ⁻|
  noisyState[2][2] = complex(noiseParam / 3); // |Ψ⁺⟩⟨Ψ⁺|
  noisyState[3][3] = complex(1 - noiseParam); // |Ψ⁻⟩⟨Ψ⁻|
  
  // Add off-diagonal elements to create non-Werner state
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i !== j) {
        // Add coherent noise (off-diagonal elements)
        noisyState[i][j].real = noiseParam * (Math.random() - 0.5) * 0.1;
        noisyState[i][j].imag = noiseParam * (Math.random() - 0.5) * 0.1;
      }
    }
  }
  
  return noisyState;
}; 