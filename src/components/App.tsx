import React, { useState, useEffect } from 'react';
import { SimulationParameters, SimulationState } from '../engine/types';
import { SimulationController } from '../controller/simulationController';
import ControlPanel from './ControlPanel';
import EnsembleDisplay from './EnsembleDisplay';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState | null>(null);
  const [controller, setController] = useState<SimulationController | null>(null);
  
  // Initialize the simulation controller
  useEffect(() => {
    const initialParams: SimulationParameters = {
      initialPairs: 10,
      noiseParameter: 0.3,
      targetFidelity: 0.95
    };
    
    const newController = new SimulationController(
      initialParams,
      (newState) => setState(newState)
    );
    
    setController(newController);
    
    // Cleanup function
    return () => {
      // No cleanup needed for now
    };
  }, []);
  
  // Handler functions
  const handleRunStep = () => {
    controller?.step();
  };
  
  const handleRunAll = () => {
    controller?.runUntilComplete();
  };
  
  const handleReset = () => {
    controller?.reset();
  };
  
  const handleParametersChanged = (params: SimulationParameters) => {
    controller?.updateParameters(params);
  };
  
  // If controller or state is not yet initialized, show loading
  if (!controller || !state) {
    return <div>Loading simulation...</div>;
  }
  
  return (
    <div className="quantum-purification-app">
      <header>
        <h1>Quantum Purification Simulator</h1>
        <h2>BBPSSW Protocol</h2>
      </header>
      
      <div className="main-container">
        <ControlPanel
          onRunStep={handleRunStep}
          onRunAll={handleRunAll}
          onReset={handleReset}
          onParametersChanged={handleParametersChanged}
          isComplete={state.complete}
          currentRound={state.round}
          pairsRemaining={state.pairs.length}
        />
        
        <div className="simulation-display">
          <h2>EPR Pairs ({state.pairs.length})</h2>
          <EnsembleDisplay pairs={state.pairs} />
          
          {state.pairs.length > 0 && (
            <div className="fidelity-info">
              <h3>Current Best Fidelity: {state.pairs[0].fidelity.toFixed(4)}</h3>
              {state.complete && (
                <div className="completion-message">
                  Purification complete! Final fidelity: {state.pairs[0].fidelity.toFixed(4)}
                </div>
              )}
            </div>
          )}
          
          {state.pairs.length === 0 && (
            <div className="completion-message error">
              All pairs were discarded during purification. Try again with more initial pairs or less noise.
            </div>
          )}
        </div>
      </div>
      
      <footer>
        <p>BBPSSW Protocol: Bennett, Brassard, Popescu, Schumacher, Smolin, Wootters (1996)</p>
      </footer>
    </div>
  );
};

export default App; 