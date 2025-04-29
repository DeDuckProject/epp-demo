import React, { useState, useEffect } from 'react';
import { SimulationController } from '../controller/simulationController';
import { SimulationState, SimulationParameters } from '../engine/types';
import ControlPanel from './ControlPanel';
import EnsembleDisplay from './EnsembleDisplay';
import './App.css';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState | null>(null);
  const [controller, setController] = useState<SimulationController | null>(null);
  
  useEffect(() => {
    // Initialize controller with default parameters
    const initialParams: SimulationParameters = {
      initialPairs: 10,
      noiseParameter: 0.3,
      targetFidelity: 0.95
    };
    
    const newController = new SimulationController(
      initialParams,
      (newState: SimulationState) => setState(newState)
    );
    
    setController(newController);
  }, []);
  
  if (!controller || !state) {
    return <div>Loading simulation...</div>;
  }
  
  return (
    <div className="app-container">
      <header>
        <h1>Quantum Entanglement Purification Simulator</h1>
      </header>
      
      <main>
        <div className="simulation-area">
          <ControlPanel
            onNextStep={() => controller.nextStep()}
            onCompleteRound={() => controller.completeRound()}
            onRunAll={() => controller.runUntilComplete()}
            onReset={() => controller.reset()}
            onParametersChanged={(params) => controller.updateParameters(params)}
            isComplete={state.complete}
            currentRound={state.round}
            currentStep={state.purificationStep}
            pairsRemaining={state.pairs.length}
          />
          
          <EnsembleDisplay 
            pairs={state.pairs} 
            pendingPairs={state.pendingPairs} 
            purificationStep={state.purificationStep} 
          />
        </div>
      </main>
    </div>
  );
};

export default App; 