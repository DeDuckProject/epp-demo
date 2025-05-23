import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix'; // Import class
import { NoiseChannel } from './types';
import { 
  applyDepolarizing, 
  applyDephasing, 
  applyAmplitudeDamping, 
  applyUniformNoise 
} from '../engine_real_calculations/channels/noise';

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