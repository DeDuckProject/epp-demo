import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { PurificationStep } from '../engine/types';
import './SimulationControls.css';

interface SimulationControlsProps {
  onNextStep: () => void;
  onCompleteRound: () => void;
  onRunAll: () => void;
  onReset: () => void;
  isComplete: boolean;
  currentStep: PurificationStep;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  onNextStep,
  onCompleteRound,
  onRunAll,
  onReset,
  isComplete,
  currentStep
}) => {
  // Register keyboard shortcuts with enableOnFormTags to ensure they work when select elements have focus
  useHotkeys('n', () => !isComplete && onNextStep(), { enabled: !isComplete, enableOnFormTags: true });
  useHotkeys('c', () => !isComplete && onCompleteRound(), { enabled: !isComplete, enableOnFormTags: true });
  useHotkeys('a', () => !isComplete && onRunAll(), { enabled: !isComplete, enableOnFormTags: true });
  useHotkeys('r', onReset, { enableOnFormTags: true });
  
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
    <div className="simulation-controls">
      <button onClick={onNextStep} disabled={isComplete} className="control-button primary">
        {nextStepText}
      </button>
      <button onClick={onCompleteRound} disabled={isComplete} className="control-button">
        Complete Round [C]
      </button>
      <button onClick={onRunAll} disabled={isComplete} className="control-button">
        Run All [A]
      </button>
      <button onClick={onReset} className="control-button secondary">
        Reset [R]
      </button>
    </div>
  );
};

export default SimulationControls; 