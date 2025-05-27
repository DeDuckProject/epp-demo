import React, { useState, useEffect } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import { SimulationController } from '../controller/simulationController';
import { SimulationState, SimulationParameters, EngineType, Basis, NoiseChannel } from '../engine/types';
import ControlPanel from './ControlPanel';
import EnsembleDisplay from './EnsembleDisplay';
import SimulationControls from './SimulationControls';
import InfoWindow from './InfoWindow';
import Attribution from './Attribution';
import './App.css';

const App: React.FC = () => {
  const [state, setState] = useState<SimulationState | null>(null);
  const [controller, setController] = useState<SimulationController | null>(null);
  const [engineType, setEngineType] = useState<EngineType>(EngineType.MonteCarlo);
  const [viewBasis, setViewBasis] = useState<Basis>(Basis.Bell);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  
  useEffect(() => {
    // Initialize controller with default parameters
    const initialParams: SimulationParameters = {
      initialPairs: 32,
      noiseParameter: 0.3,
      targetFidelity: 0.95,
      noiseChannel: NoiseChannel.UniformNoise
    };
    
    const newController = new SimulationController(
      initialParams,
      (newState: SimulationState) => setState(newState),
      engineType
    );
    
    setController(newController);
  }, []);
  
  if (!controller || !state) {
    return <div>Loading simulation...</div>;
  }

  const handleEngineTypeChange = (type: EngineType) => {
    controller.updateEngineType(type);
    setEngineType(type);
  };
  
  return (
    <div className="app-container">
      <header>
        <button
          className={`drawer-toggle${drawerOpen ? ' open' : ''}`}
          aria-label="Toggle controls"
          onClick={() => setDrawerOpen(o => !o)}
        >
          <HiMenu size={24} />
        </button>
        <h1>Quantum Entanglement Purification Simulator</h1>
      </header>
      
      <main>
        {drawerOpen && (
          <div
            data-testid="drawer-overlay"
            className="drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <div className="simulation-area">
          <SimulationControls
            onNextStep={() => controller.nextStep()}
            onCompleteRound={() => controller.completeRound()}
            onRunAll={() => controller.runUntilComplete()}
            onReset={() => controller.reset()}
            isComplete={state.complete}
            currentStep={state.purificationStep}
          />
          
          <div className="simulation-content">
            <ControlPanel
              className={drawerOpen ? 'open' : ''}
              isDrawerOpen={drawerOpen}
              onDrawerClose={() => setDrawerOpen(false)}
              onParametersChanged={(params) => controller.updateParameters(params)}
              onEngineTypeChanged={handleEngineTypeChange}
              onViewBasisChanged={setViewBasis}
              currentRound={state.round}
              currentStep={state.purificationStep}
              pairsRemaining={state.pairs.length}
              averageFidelity={state.averageFidelity}
              engineType={engineType}
              viewBasis={viewBasis}
            />
            
            <EnsembleDisplay 
              pairs={state.pairs} 
              pendingPairs={state.pendingPairs} 
              purificationStep={state.purificationStep} 
              viewBasis={viewBasis}
            />
          </div>
        </div>
      </main>
      
      <InfoWindow 
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
      
      <Attribution />
      
      <button 
        className="info-button floating"
        onClick={() => setInfoOpen(true)}
        aria-label="Open information window"
        title="Learn about entanglement purification"
      >
        ?
      </button>
    </div>
  );
};

export default App; 