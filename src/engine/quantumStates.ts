import { DensityMatrix, ComplexNumber } from './types';
import { complex, tensorProduct, transformToBellBasis } from './mathUtils';

// Pauli matrices
export const pauliI = [
  [complex(1), complex(0)],
  [complex(0), complex(1)]
];

export const pauliX = [
  [complex(0), complex(1)],
  [complex(1), complex(0)]
];

export const pauliY = [
  [complex(0), complex(0, -1)],
  [complex(0, 1), complex(0)]
];

export const pauliZ = [
  [complex(1), complex(0)],
  [complex(0), complex(-1)]
];

// Bell state |Φ⁺⟩ in Bell basis - this is just the first basis state
export const bellStatePlus = (): DensityMatrix => {
  return [
    [complex(1), complex(0), complex(0), complex(0)],
    [complex(0), complex(0), complex(0), complex(0)],
    [complex(0), complex(0), complex(0), complex(0)],
    [complex(0), complex(0), complex(0), complex(0)]
  ];
};

// Create a noisy EPR pair in Bell basis
export const createNoisyEPR = (noiseParam: number): DensityMatrix => {
  // Start with a perfect Bell state in the Bell basis
  const bellStateMatrix = bellStatePlus();
  
  // Create the noisy state in Bell basis
  const noisyState: DensityMatrix = Array(4).fill(0).map(() => 
    Array(4).fill(0).map(() => complex(0))
  );
  
  // In Bell basis, a perfect |Φ⁺⟩ is just [1,0,0,0] on diagonal
  // Noise will distribute probability to other Bell states
  noisyState[0][0] = complex(1 - noiseParam); // |Φ⁺⟩⟨Φ⁺|
  noisyState[1][1] = complex(noiseParam / 3); // |Φ⁻⟩⟨Φ⁻|
  noisyState[2][2] = complex(noiseParam / 3); // |Ψ⁺⟩⟨Ψ⁺|
  noisyState[3][3] = complex(noiseParam / 3); // |Ψ⁻⟩⟨Ψ⁻|
  
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