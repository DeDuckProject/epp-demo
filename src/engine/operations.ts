import { DensityMatrix } from './types';
import { 
  complex, tensorProduct
} from './mathUtils';

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
  
  // Normalize the non-target components to balance them
  const targetIdx = 3; // |Ψ⁻⟩ is our target state
  const targetFidelity = rho[targetIdx][targetIdx].real;
  
  // Sum of non-target diagonal elements
  // let sumNonTarget = 0;
  // for (let i = 0; i < 4; i++) {
  //   if (i !== targetIdx) {
  //     // sumNonTarget += rho[i][i].real;
  //   }
  // }
  
  // Balance the non-target elements
  const balancedNonTargetValue = (1 - targetFidelity) / 3;
  for (let i = 0; i < 4; i++) {
    if (i !== targetIdx) {
      result[i][i] = complex(balancedNonTargetValue);
    }
  }
  
  return result;
};

// Exchange |Ψ⁻⟩ and |Φ⁺⟩ components (Step 2 of BBPSSW)
export const exchangePsiMinusPhiPlus = (rho: DensityMatrix): DensityMatrix => {
  // Create a copy of the input density matrix
  const result: DensityMatrix = rho.map(row => 
    row.map(el => complex(el.real, el.imag))
  );
  
  // Exchange the |Ψ⁻⟩ and |Φ⁺⟩ components
  // In Bell basis, |Ψ⁻⟩ is at index 3 and |Φ⁺⟩ is at index 0
  
  // Swap diagonal elements
  const temp = complex(result[3][3].real, result[3][3].imag);
  result[3][3] = complex(result[0][0].real, result[0][0].imag);
  result[0][0] = temp;
  
  // Swap off-diagonal elements related to these states
  for (let i = 0; i < 4; i++) {
    if (i !== 0 && i !== 3) {
      // complex(result[0][i].real, result[0][i].imag);
      // complex(result[3][i].real, result[3][i].imag);
      result[0][i] = complex(result[3][i].real, result[3][i].imag);
      result[3][i] = complex(result[0][i].real, result[0][i].imag);
      
      // const tempi0 = complex(result[i][0].real, result[i][0].imag);
      // const tempi3 = complex(result[i][3].real, result[i][3].imag);
      result[i][0] = complex(result[i][3].real, result[i][3].imag);
      result[i][3] = complex(result[i][0].real, result[i][0].imag);
    }
  }
  
  // Swap the 0,3 and 3,0 elements
  const temp03 = complex(result[0][3].real, result[0][3].imag);
  result[0][3] = complex(result[3][0].real, result[3][0].imag);
  result[3][0] = temp03;
  
  return result;
};

// Create a bilateral CNOT gate operation on two pairs
export const bilateralCNOT = (control: DensityMatrix, target: DensityMatrix): { 
  resultAfterCNOT: DensityMatrix,
  afterMeasurement: { 
    controlPair: DensityMatrix,
    successful: boolean 
  }
} => {
  // Create the full 16x16 joint state using tensor product
  const jointState = tensorProduct(control, target);
  
  // Represent the bilateral CNOT in the computational basis
  // This is a simplified representation - in a real implementation, 
  // you would construct the full 16x16 CNOT matrix
  
  // Apply the CNOT operations to transform the state
  // For simplicity, we'll compute the probabilities directly
  
  // In the BBPSSW protocol with |Φ⁺⟩ as the target state after exchange,
  // the success probability depends on the fidelity F
  const f = control[0][0].real; // Fidelity with |Φ⁺⟩ after exchange
  
  // Success probability is p_success = f^2 + (1-f)^2/9
  const successProbability = f * f + (1 - f) * (1 - f) / 9;
  
  // Determine success based on probability
  const successful = Math.random() < successProbability;
  
  let controlPair: DensityMatrix;
  
  if (successful) {
    // Calculate improved fidelity after successful purification
    // F' = (f^2 + (1-f)^2/9) / (f^2 + 2f(1-f)/3 + 5(1-f)^2/9)
    const numerator = f * f + Math.pow(1 - f, 2) / 9;
    const denominator = f * f + 2 * f * (1 - f) / 3 + 5 * Math.pow(1 - f, 2) / 9;
    const fPrime = numerator / denominator;
    
    // Create new density matrix with improved fidelity
    controlPair = [
      [complex(fPrime), complex(0), complex(0), complex(0)],
      [complex(0), complex((1-fPrime)/3), complex(0), complex(0)],
      [complex(0), complex(0), complex((1-fPrime)/3), complex(0)],
      [complex(0), complex(0), complex(0), complex((1-fPrime)/3)]
    ];
  } else {
    // Return the original control pair if measurement fails
    // In reality, both pairs would be discarded, but we keep the control
    // for simulation continuity
    controlPair = control;
  }
  
  return {
    resultAfterCNOT: jointState,
    afterMeasurement: {
      controlPair,
      successful
    }
  };
}; 