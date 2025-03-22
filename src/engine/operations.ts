import { DensityMatrix, ComplexNumber, QubitPair } from './types';
import { 
  complex, add, multiply, matrixMultiply, tensorProduct, 
  partialTrace, calculateBellBasisFidelity 
} from './mathUtils';
import { pauliI, pauliX, pauliY, pauliZ } from './quantumStates';

// Depolarize/Twirl a pair to convert to Werner form
export const depolarize = (rho: DensityMatrix): DensityMatrix => {
  // In Bell basis, depolarizing means keeping the diagonal elements
  // and setting all off-diagonal elements to zero
  const result: DensityMatrix = Array(4).fill(0).map(() => 
    Array(4).fill(0).map(() => complex(0))
  );
  
  // Copy only the diagonal elements
  for (let i = 0; i < 4; i++) {
    result[i][i] = rho[i][i];
  }
  
  return result;
};

// Create a bilateral CNOT gate in Bell basis
export const bilateralCNOT = (control: DensityMatrix, target: DensityMatrix): { 
  resultAfterCNOT: DensityMatrix,
  afterMeasurement: { 
    controlPair: DensityMatrix,
    successful: boolean 
  }
} => {
  // For simplicity in this implementation, we'll use the known transformation
  // formula for how the Bell state fidelity changes after purification
  
  // In Bell basis, F = ρ₀₀ is the fidelity with |Φ⁺⟩
  const f = control[0][0].real;
  
  // Successful purification probability depends on initial fidelity
  const successProbability = f * f + (1 - f) * (1 - f);
  const successful = Math.random() < successProbability;
  
  let controlPair: DensityMatrix;
  
  if (successful) {
    // Improved fidelity after successful purification
    const f2 = f * f / (f * f + (1 - f) * (1 - f));
    
    // Create Werner state in Bell basis with improved fidelity
    controlPair = [
      [complex(f2), complex(0), complex(0), complex(0)],
      [complex(0), complex((1-f2)/3), complex(0), complex(0)],
      [complex(0), complex(0), complex((1-f2)/3), complex(0)],
      [complex(0), complex(0), complex(0), complex((1-f2)/3)]
    ];
  } else {
    // Return the original control pair if measurement fails
    controlPair = control;
  }
  
  // Return a dummy joint state for now
  const jointState = Array(16).fill(0).map(() => 
    Array(16).fill(0).map(() => complex(0))
  );
  
  return {
    resultAfterCNOT: jointState,
    afterMeasurement: {
      controlPair,
      successful
    }
  };
}; 