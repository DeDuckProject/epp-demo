import React from 'react';
import { QubitPair as QubitPairType, Basis } from '../engine/types';
import './EnsembleDisplay.css';
import { DensityMatrix } from '../engine_real_calculations';
interface EnsembleDisplayProps {
    pairs: QubitPairType[];
    pendingPairs?: {
        controlPairs: QubitPairType[];
        targetPairs: QubitPairType[];
        jointStates?: DensityMatrix[];
        results?: {
            control: QubitPairType;
            successful: boolean;
        }[];
    };
    purificationStep: string;
    viewBasis: Basis;
}
declare const EnsembleDisplay: React.FC<EnsembleDisplayProps>;
export default EnsembleDisplay;
