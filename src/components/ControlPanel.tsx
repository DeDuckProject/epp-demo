import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SimulationParameters, PurificationStep, EngineType, Basis } from '../engine/types';
import './ControlPanel.css';
import HelpPanel from './HelpPanel';

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
  engineType: EngineType;
  viewBasis: Basis;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onNextStep,
  onCompleteRound,
  onRunAll,
  onReset,
  onParametersChanged,
  onEngineTypeChanged,
  onViewBasisChanged,
  isComplete,
  currentRound,
  currentStep,
  pairsRemaining,
  engineType,
  viewBasis
}) => {
  const [initialPairs, setInitialPairs] = useState(10);
  const [noiseParameter, setNoiseParameter] = useState(0.3);
  const [targetFidelity, setTargetFidelity] = useState(0.95);
  const [showHelp, setShowHelp] = useState(false);
  
  const handleParameterChange = () => {
    onParametersChanged({
      initialPairs,
      noiseParameter,
      targetFidelity
    });
  };
  
  // Register keyboard shortcuts
  useHotkeys('n', () => !isComplete && onNextStep(), { enabled: !isComplete });
  useHotkeys('c', () => !isComplete && onCompleteRound(), { enabled: !isComplete });
  useHotkeys('a', () => !isComplete && onRunAll(), { enabled: !isComplete });
  useHotkeys('r', onReset);
  useHotkeys('p', handleParameterChange);
  useHotkeys('?', () => setShowHelp(prev => !prev));
  
  // Helper function to get the name of the current/next step
  const getStepName = (step: PurificationStep): string => {
    switch(step) {
      case 'initial': return 'Twirl';
      case 'twirled': return 'Exchange States';
      case 'exchanged': return 'Apply CNOT';
      case 'cnot': return 'Measure';
      case 'measured': return 'Discard Failures';
      case 'discard': return 'Twirl + Exchange';
      case 'twirlExchange': return 'Start Next Round';
      case 'completed': return 'Start Next Round';
      default: return `Unknown step: ${step}`;
    }
  };
  
  // Get next step button text
  const nextStepText = isComplete 
    ? 'Complete' 
    : `Next Step: ${getStepName(currentStep)} [N]`;
  
  return (
    <div className="control-panel">
      <div className="header">
        <h2>Simulation Controls</h2>
        <button 
          className="help-button" 
          onClick={() => setShowHelp(prev => !prev)}
          title="Show keyboard shortcuts"
        >
          ?
        </button>
      </div>
      
      {showHelp && <HelpPanel />}
      
      <div className="parameter-section">
        <h3>Parameters</h3>
        <div className="parameter-input">
          <label htmlFor="engineType">Engine Type:</label>
          <select
            id="engineType"
            value={engineType}
            onChange={(e) => onEngineTypeChanged(e.target.value as EngineType)}
          >
            <option value={EngineType.Average}>Average</option>
            <option value={EngineType.MonteCarlo}>Monte Carlo</option>
          </select>
        </div>
        
        <div className="parameter-input">
          <label htmlFor="viewBasis">View Basis:</label>
          <select
            id="viewBasis"
            value={viewBasis}
            onChange={(e) => onViewBasisChanged(e.target.value as Basis)}
          >
            <option value={Basis.Bell}>Bell</option>
            <option value={Basis.Computational}>Computational</option>
          </select>
        </div>
        
        <div className="parameter-input">
          <label htmlFor="initialPairs">Initial Pairs:</label>
          <input
            id="initialPairs"
            type="number"
            min="2"
            max="50"
            value={initialPairs}
            onChange={(e) => setInitialPairs(parseInt(e.target.value))}
          />
        </div>
        
        <div className="parameter-input">
          <label htmlFor="noiseParameter">Noise Parameter:</label>
          <input
            id="noiseParameter"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={noiseParameter}
            onChange={(e) => setNoiseParameter(parseFloat(e.target.value))}
          />
          <span>{noiseParameter.toFixed(2)}</span>
        </div>
        
        <div className="parameter-input">
          <label htmlFor="targetFidelity">Target Fidelity:</label>
          <input
            id="targetFidelity"
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={targetFidelity}
            onChange={(e) => setTargetFidelity(parseFloat(e.target.value))}
          />
          <span>{targetFidelity.toFixed(2)}</span>
        </div>
        
        <button onClick={handleParameterChange}>Apply Parameters [P]</button>
      </div>
      
      <div className="simulation-controls">
        <h3>Simulation</h3>
        <button onClick={onNextStep} disabled={isComplete}>
          {nextStepText}
        </button>
        <button onClick={onCompleteRound} disabled={isComplete}>
          Complete Round [C]
        </button>
        <button onClick={onRunAll} disabled={isComplete}>
          Run All [A]
        </button>
        <button onClick={onReset}>
          Reset [R]
        </button>
      </div>
      
      <div className="status-section">
        <h3>Status</h3>
        <p>Distillation Round: {currentRound}</p>
        <p>Current Step: {currentStep}</p>
        <p>Pairs Remaining: {pairsRemaining}</p>
        <p>Status: {isComplete ? 'Complete' : 'In Progress'}</p>
      </div>
    </div>
  );
};

export default ControlPanel; 