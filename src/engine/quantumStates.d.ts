import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix';
import { NoiseChannel } from './types';
export declare const createNoisyEPRWithChannel: (noiseParam: number, noiseChannel: NoiseChannel) => DensityMatrix;
