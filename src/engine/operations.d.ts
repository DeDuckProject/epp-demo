import { DensityMatrix } from '../engine_real_calculations/matrix/densityMatrix';
import { QubitPair } from './types';
export declare const depolarize: (rho: DensityMatrix) => DensityMatrix;
export declare const exchangePsiMinusPhiPlus: (rho: DensityMatrix) => DensityMatrix;
export declare const bilateralCNOT: (control: DensityMatrix, target: DensityMatrix) => {
    resultAfterCNOT: DensityMatrix;
    afterMeasurement: {
        controlPair: DensityMatrix;
        successful: boolean;
    };
};
export declare const preparePairsForCNOT: (pairs: QubitPair[]) => {
    controlPairs: QubitPair[];
    targetPairs: QubitPair[];
    hasUnpairedPair: boolean;
};
