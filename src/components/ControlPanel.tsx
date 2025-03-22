import React, { useState } from 'react';
import { SimulationParameters } from '../engine/types';

interface ControlPanelProps {
  onRunStep: () => void;
  onRunAll: () => void;
  onReset: () => void;
  onParametersChanged: (params: SimulationParameters) => void;
  isComplete: boolean;
  currentRound: number;
  pairsRemaining: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onRunStep,
  onRunAll,
  onReset,
  onParametersChanged,
  isComplete,
  currentRound,
  pairsRemaining
}) => {
  const [initialPairs, setInitialPairs] = useState(10);
  const [noiseParameter, setNoiseParameter] = useState(0.3);
  const [targetFidelity, setTargetFidelity] = useState(0.95);
  
  const handleParameterChange = () => {
    onParametersChanged({
      initialPairs,
      noiseParameter,
      targetFidelity
    });
  };
  
  return (
    <div className="control-panel">
      <h2>Simulation Controls</h2>
      
      <div className="parameter-section">
        <h3>Parameters</h3>
        <div className="parameter-input">
          <label>Initial Pairs:</label>
          <input
            type="number"
            min="2"
            max="50"
            value={initialPairs}
            onChange={(e) => setInitialPairs(parseInt(e.target.value))}
          />
        </div>
        
        <div className="parameter-input">
          <label>Noise Parameter:</label>
          <input
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
          <label>Target Fidelity:</label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={targetFidelity}
            onChange={(e) => setTargetFidelity(parseFloat(e.target.value))}
          />
          <span>{targetFidelity.toFixed(2)}</span>
        </div>
        
        <button onClick={handleParameterChange}>Apply Parameters</button>
      </div>
      
      <div className="simulation-controls">
        <h3>Simulation</h3>
        <button onClick={onRunStep} disabled={isComplete}>Next Step</button>
        <button onClick={onRunAll} disabled={isComplete}>Run All</button>
        <button onClick={onReset}>Reset</button>
      </div>
      
      <div className="status-section">
        <h3>Status</h3>
        <p>Current Round: {currentRound}</p>
        <p>Pairs Remaining: {pairsRemaining}</p>
        <p>Status: {isComplete ? 'Complete' : 'In Progress'}</p>
      </div>
    </div>
  );
};

export default ControlPanel; 