import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { SimulationParameters, PurificationStep, EngineType, Basis, NoiseChannel } from '../engine/types';
import './ControlPanel.css';
import HelpPanel from './HelpPanel';
import Popup from './Popup';
import CollapsibleSection from './CollapsibleSection';

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
  averageFidelity,
  engineType,
  viewBasis,
  className = '',
  isDrawerOpen = false,
  onDrawerClose
}) => {
  const [initialPairs, setInitialPairs] = useState(32);
  const [noiseParameter, setNoiseParameter] = useState(0.3);
  const [targetFidelity, setTargetFidelity] = useState(0.95);
  const [noiseChannel, setNoiseChannel] = useState<NoiseChannel>(NoiseChannel.UniformNoise);
  const [showHelp, setShowHelp] = useState(false);
  
  const handleParameterChange = () => {
    onParametersChanged({
      initialPairs,
      noiseParameter,
      targetFidelity,
      noiseChannel
    });
  };
  
  // Register keyboard shortcuts with enableOnFormTags to ensure they work when select elements have focus
  useHotkeys('n', () => !isComplete && onNextStep(), { enabled: !isComplete, enableOnFormTags: true });
  useHotkeys('c', () => !isComplete && onCompleteRound(), { enabled: !isComplete, enableOnFormTags: true });
  useHotkeys('a', () => !isComplete && onRunAll(), { enabled: !isComplete, enableOnFormTags: true });
  useHotkeys('r', onReset, { enableOnFormTags: true });
  useHotkeys('p', handleParameterChange, { enableOnFormTags: true });
  useHotkeys('?', () => setShowHelp(prev => !prev), { enableOnFormTags: true });
  
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
    <div className={`control-panel${className ? ` ${className}` : ''}`}>
      <div className="header">
        <h2>Simulation Controls</h2>
        {isDrawerOpen && onDrawerClose && (
          <button
            className="header-button drawer-close"
            aria-label="Close controls"
            onClick={onDrawerClose}
          >
            ×
          </button>
        )}
        <button 
          className="header-button help-button" 
          onClick={() => setShowHelp(prev => !prev)}
          title="Show keyboard shortcuts"
        >
          ?
        </button>
      </div>
      
      {showHelp && (
        <Popup title="Help" isOpen={true} onClose={() => setShowHelp(false)}>
          <HelpPanel />
        </Popup>
      )}
      
      <CollapsibleSection title="Experiment Setup" defaultExpanded={true}>
        <div className="parameter-input">
          <label htmlFor="engineType">Engine Type:</label>
          <select
            id="engineType"
            value={engineType}
            onChange={(e) => onEngineTypeChanged(e.target.value as EngineType)}
          >
            <option value={EngineType.MonteCarlo}>Monte Carlo</option>
            <option value={EngineType.Average}>Average</option>
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
          <label htmlFor="noiseChannel">Noise Channel:</label>
          <select
            id="noiseChannel"
            value={noiseChannel}
            onChange={(e) => setNoiseChannel(e.target.value as NoiseChannel)}
          >
            <option value={NoiseChannel.UniformNoise}>Uniform Noise</option>
            <option value={NoiseChannel.AmplitudeDamping}>Amplitude Damping</option>
            <option value={NoiseChannel.Dephasing}>Dephasing</option>
            <option value={NoiseChannel.Depolarizing}>Depolarizing</option>
          </select>
        </div>
        
        <div className="parameter-input">
          <label htmlFor="noiseParameter">Noise Parameter:</label>
          <div className="parameter-input-row">
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
        </div>
        
        <div className="parameter-input">
          <label htmlFor="targetFidelity">Target Fidelity:</label>
          <div className="parameter-input-row">
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
        </div>
        
        <button onClick={handleParameterChange}>Apply Parameters [P]</button>
      </CollapsibleSection>

      <CollapsibleSection title="Display & Status" defaultExpanded={true}>
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
        
        <div className="status-info">
          <p><strong>Distillation Round:</strong> {currentRound}</p>
          <p><strong>Current Step:</strong> {currentStep}</p>
          <p><strong>Pairs Remaining:</strong> {pairsRemaining}</p>
          <p><strong>Average Fidelity:</strong> {averageFidelity.toFixed(3)}</p>
          <p><strong>Status:</strong> {isComplete ? 'Complete' : 'In Progress'}</p>
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Simulation Control" defaultExpanded={true}>
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
      </CollapsibleSection>
    </div>
  );
};

export default ControlPanel; 