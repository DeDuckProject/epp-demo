import React from 'react';
import { DensityMatrix } from '../engine_real_calculations';
import './DensityMatrixView.css';
import { Basis } from '../engine/types';
interface DensityMatrixViewProps {
    /** The raw density matrix to render */
    matrix: DensityMatrix;
    /** Which basis to label: 'bell' (default) or 'computational' */
    basis?: Basis;
    /** True if this is a Werner state (i.e. no significant off-diagonals) */
    isWerner: boolean;
}
declare const DensityMatrixView: React.FC<DensityMatrixViewProps>;
export default DensityMatrixView;
