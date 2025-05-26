import React from 'react';
import { SimulationParameters, PurificationStep, EngineType, Basis } from '../engine/types';
import './ControlPanel.css';
interface ControlPanelProps {
    onNextStep: () => void;
    onCompleteRound: () => void;
    onRunAll: () => void;
    onReset: () => void;
    onParametersChanged: (params: SimulationParameters) => void;
    onEngineTypeChanged: (type: EngineType) => void;
    onViewBasisChanged: (basis: Basis) => void;
    isComplete: boolean;
    currentRound: number;
    currentStep: PurificationStep;
    pairsRemaining: number;
    averageFidelity: number;
    engineType: EngineType;
    viewBasis: Basis;
    className?: string;
    isDrawerOpen?: boolean;
    onDrawerClose?: () => void;
}
declare const ControlPanel: React.FC<ControlPanelProps>;
export default ControlPanel;
