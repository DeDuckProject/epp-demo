import { ComplexNum } from '../engine_real_calculations/types/complex';
import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix';
import { QubitPair } from './types';

// Depolarize/Twirl a pair to convert to Werner form
export const depolarize = (rho: DensityMatrix): DensityMatrix => {
  // In Bell basis, depolarizing means keeping the diagonal elements
  // and setting all off-diagonal elements to zero
  const result = new DensityMatrix(Array(4).fill(0).map(() => 
    Array(4).fill(0).map(() => ComplexNum.zero())
  ));
  
  // Copy only the diagonal elements using set()
  for (let i = 0; i < 4; i++) {
    result.set(i, i, rho.get(i, i));
  }
  
  // Normalize the non-target components to balance them
  const targetIdx = 3; // |Ψ⁻⟩ is our target state
  const targetFidelity = rho.get(targetIdx, targetIdx).re;
  
  // Sum of non-target diagonal elements
  // let sumNonTarget = 0;
  // for (let i = 0; i < 4; i++) {
  //   if (i !== targetIdx) {
  //     // sumNonTarget += rho[i][i].re;
  //   }
  // }
  
  // Balance the non-target elements using set()
  const balancedNonTargetValue = (1 - targetFidelity) / 3;
  for (let i = 0; i < 4; i++) {
    if (i !== targetIdx) {
      result.set(i, i, new ComplexNum(balancedNonTargetValue, 0));
    }
  }
  
  return result;
};

// Exchange |Ψ⁻⟩ and |Φ⁺⟩ components (Step 2 of BBPSSW)
export const exchangePsiMinusPhiPlus = (rho: DensityMatrix): DensityMatrix => {
  // Create a copy of the input density matrix data
  // NOTE: DensityMatrix constructor likely performs a deep copy if Matrix does
  const result = new DensityMatrix(rho.data);
  
  // Exchange the |Ψ⁻⟩ and |Φ⁺⟩ components
  // In Bell basis, |Ψ⁻⟩ is at index 3 and |Φ⁺⟩ is at index 0
  
  // Swap diagonal elements using get() and set()
  const temp = result.get(3, 3);
  result.set(3, 3, result.get(0, 0));
  result.set(0, 0, temp);
  
  // Swap off-diagonal elements related to these states using get() and set()
  for (let i = 0; i < 4; i++) {
    if (i !== 0 && i !== 3) {
      const temp0i = result.get(0, i);
      const temp3i = result.get(3, i);
      const tempi0 = result.get(i, 0);
      const tempi3 = result.get(i, 3);

      result.set(0, i, temp3i);
      result.set(3, i, temp0i);
      
      result.set(i, 0, tempi3);
      result.set(i, 3, tempi0);
    }
  }
  
  // Swap the 0,3 and 3,0 elements using get() and set()
  const temp03 = result.get(0, 3);
  const temp30 = result.get(3, 0);
  result.set(0, 3, temp30);
  result.set(3, 0, temp03);
  
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
  // const jointState = tensorProduct(control, target);
  const jointState = DensityMatrix.tensor(control, target); // Use static method
  
  // Represent the bilateral CNOT in the computational basis
  // This is a simplified representation - in a real implementation, 
  // you would construct the full 16x16 CNOT matrix
  
  // Apply the CNOT operations to transform the state
  // For simplicity, we'll compute the probabilities directly
  
  // In the BBPSSW protocol with |Φ⁺⟩ as the target state after exchange,
  // the success probability depends on the fidelity F
  const f = control.get(0, 0).re;
  
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
    // Handle potential division by zero or NaN
    const fPrime = denominator === 0 ? 0 : numerator / denominator;
    
    // Create new density matrix directly and set elements
    const controlPairResult = new DensityMatrix(Array(4).fill(0).map(() => Array(4).fill(0).map(() => ComplexNum.zero())));
    controlPairResult.set(0, 0, new ComplexNum(fPrime, 0));
    const nonTargetVal = (1 - fPrime) / 3;
    controlPairResult.set(1, 1, new ComplexNum(nonTargetVal, 0));
    controlPairResult.set(2, 2, new ComplexNum(nonTargetVal, 0));
    controlPairResult.set(3, 3, new ComplexNum(nonTargetVal, 0));
    controlPair = controlPairResult;

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

// Utility function to prepare control and target pairs for CNOT operation
export const preparePairsForCNOT = (pairs: QubitPair[]): { 
  controlPairs: QubitPair[], 
  targetPairs: QubitPair[],
  hasUnpairedPair: boolean
} => {
  const controlPairs: QubitPair[] = [];
  const targetPairs: QubitPair[] = [];
  
  // Group pairs for purification, ensuring we only group complete pairs
  const numPairsToProcess = Math.floor(pairs.length / 2) * 2;
  for (let i = 0; i < numPairsToProcess; i++) {
    if (i % 2 === 0) {
      controlPairs.push(pairs[i]);
    } else {
      targetPairs.push(pairs[i]);
    }
  }
  
  // Check if we have an odd number of pairs
  const hasUnpairedPair = pairs.length % 2 !== 0;
  
  return {
    controlPairs,
    targetPairs,
    hasUnpairedPair
  };
}; 