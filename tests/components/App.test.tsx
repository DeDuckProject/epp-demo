import {beforeEach, describe, expect, test, vi} from 'vitest';
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import App from '../../src/components/App';
import {SimulationController} from '../../src/controller/simulationController';
import {Basis, EngineType, PurificationStep, SimulationParameters, SimulationState} from '../../src/engine/types';
import {NoiseChannel} from '../../src/engine/types';

// Mock the simulation controller
vi.mock('../../src/controller/simulationController', () => {
  return {
    SimulationController: vi.fn()
  };
});

// Mock the EnsembleDisplay component
vi.mock('../../src/components/EnsembleDisplay', () => ({
  default: (props: any) => (
    <div data-testid="ensemble-display" data-view-basis={props.viewBasis}>
      <div className="participants">
        <div>Alice</div>
        <div>Bob</div>
      </div>
      <div className="pairs">
        {props.pairs.map((pair: any) => (
          <div key={pair.id} className="qubit-pair control-pair">
            <span>{pair.fidelity.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}));

describe('App', () => {
  // Create a mock state for testing
  const mockState: SimulationState = {
    pairs: [{ id: 1, fidelity: 0.8, densityMatrix: {} as any, basis: Basis.Bell }],
    round: 2,
    complete: false,
    purificationStep: 'cnot' as PurificationStep,
    pendingPairs: {
      controlPairs: [{ id: 1, fidelity: 0.8, densityMatrix: {} as any, basis: Basis.Bell }],
      targetPairs: []
    }
  };

  // Mock controller methods
  const mockNextStep = vi.fn();
  const mockCompleteRound = vi.fn();
  const mockRunUntilComplete = vi.fn();
  const mockReset = vi.fn();
  const mockUpdateParameters = vi.fn();
  const mockUpdateEngineType = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup the controller mock to provide immediate state
    (SimulationController as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (params: SimulationParameters, callback: (state: SimulationState) => void) => {
        // Immediately call the callback with our mock state
        callback(mockState);
        
        // Return the mock controller object
        return {
          nextStep: mockNextStep,
          completeRound: mockCompleteRound,
          runUntilComplete: mockRunUntilComplete,
          reset: mockReset,
          updateParameters: mockUpdateParameters,
          updateEngineType: mockUpdateEngineType
        };
      }
    );
  });

  test('initially shows loading state', () => {
    // Override the mock for this test to not call the callback immediately
    (SimulationController as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      return {
        nextStep: mockNextStep,
        completeRound: mockCompleteRound,
        runUntilComplete: mockRunUntilComplete,
        reset: mockReset,
        updateParameters: mockUpdateParameters,
        updateEngineType: mockUpdateEngineType
      };
    });
    
    render(<App />);
    expect(screen.getByText('Loading simulation...')).toBeDefined();
  });

  test('renders main UI when controller and state are available', async () => {
    render(<App />);
    
    // Should show the title
    expect(screen.getByText('Quantum Entanglement Purification Simulator')).toBeDefined();
    
    // Should show the ControlPanel component
    expect(screen.getByText('Simulation Controls')).toBeDefined();
    
    // Should show the EnsembleDisplay component (check for participant labels)
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  test('passes correct props to ControlPanel from state', () => {
    render(<App />);
    
    // Check that the ControlPanel shows correct values from the state
    expect(screen.getByText('Distillation Round: 2')).toBeDefined();
    expect(screen.getByText('Current Step: cnot')).toBeDefined();
    expect(screen.getByText('Pairs Remaining: 1')).toBeDefined();
    expect(screen.getByText('Status: In Progress')).toBeDefined();
  });

  test('correctly wires ControlPanel buttons to controller methods', () => {
    render(<App />);
    
    // Click Next Step button and verify controller method was called
    fireEvent.click(screen.getByText(/Next Step/));
    expect(mockNextStep).toHaveBeenCalledTimes(1);
    
    // Click Complete Round button - use regex to match with possible keyboard shortcut
    fireEvent.click(screen.getByText(/Complete Round/));
    expect(mockCompleteRound).toHaveBeenCalledTimes(1);
    
    // Click Run All button - use regex to match with possible keyboard shortcut
    fireEvent.click(screen.getByText(/Run All/));
    expect(mockRunUntilComplete).toHaveBeenCalledTimes(1);
    
    // Click Reset button - use regex to match with possible keyboard shortcut
    fireEvent.click(screen.getByText(/Reset/));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  test('updates parameters through controller when applied', () => {
    render(<App />);
    
    // Find input elements
    const initialPairsInput = screen.getByLabelText('Initial Pairs:');
    const noiseSlider = screen.getByLabelText('Noise Parameter:');
    const fidelitySlider = screen.getByLabelText('Target Fidelity:');
    
    // Change values
    fireEvent.change(initialPairsInput, { target: { value: '20' } });
    fireEvent.change(noiseSlider, { target: { value: '0.5' } });
    fireEvent.change(fidelitySlider, { target: { value: '0.9' } });
    
    // Apply parameters - use regex to match with possible keyboard shortcut
    fireEvent.click(screen.getByText(/Apply Parameters/));
    
    // Verify controller method was called with correct parameters
    expect(mockUpdateParameters).toHaveBeenCalledTimes(1);
    expect(mockUpdateParameters).toHaveBeenCalledWith({
      initialPairs: 20,
      noiseParameter: 0.5,
      targetFidelity: 0.9,
      noiseChannel: NoiseChannel.UniformNoise
    });
  });

  test('passes correct props to EnsembleDisplay from state', () => {
    render(<App />);
    
    // Check that the fidelity value from our mock state is displayed
    expect(screen.getByText('0.800')).toBeDefined();
    
    // Check that the data-view-basis attribute is set correctly on the mock EnsembleDisplay
    const ensembleDisplay = screen.getByTestId('ensemble-display');
    expect(ensembleDisplay.getAttribute('data-view-basis')).toBe(Basis.Bell);
  });
  
  test('updates engine type when changed in control panel', () => {
    render(<App />);
    
    // Find and change the engine type dropdown
    const engineTypeSelect = screen.getByLabelText('Engine Type:');
    fireEvent.change(engineTypeSelect, { target: { value: EngineType.MonteCarlo } });
    
    // Verify controller method was called with the new engine type
    expect(mockUpdateEngineType).toHaveBeenCalledTimes(1);
    expect(mockUpdateEngineType).toHaveBeenCalledWith(EngineType.MonteCarlo);
  });

  test('initializes with Bell basis as default view basis', () => {
    render(<App />);
    
    // Find the view basis dropdown
    const viewBasisSelect = screen.getByLabelText('View Basis:');
    
    // Check default is Bell basis
    expect((viewBasisSelect as HTMLSelectElement).value).toBe(Basis.Bell);
  });
  
  test('updates view basis when changed in control panel', () => {
    render(<App />);
    
    // Find and change the view basis dropdown
    const viewBasisSelect = screen.getByLabelText('View Basis:');
    fireEvent.change(viewBasisSelect, { target: { value: Basis.Computational } });
    
    // Check that the EnsembleDisplay gets the new view basis
    const ensembleDisplay = screen.getByTestId('ensemble-display');
    expect(ensembleDisplay.getAttribute('data-view-basis')).toBe(Basis.Computational);
  });

  test('toggles the control-panel drawer when the mobile toggle button is clicked', () => {
    render(<App />);
    
    // Get the toggle button and control panel
    const toggleButton = screen.getByLabelText('Toggle controls');
    const controlPanel = document.querySelector('.control-panel');
    
    // Initially the panel should not have the open class
    expect(controlPanel).not.toHaveClass('open');
    
    // Click the toggle button
    fireEvent.click(toggleButton);
    
    // Now the panel should have the open class
    expect(controlPanel).toHaveClass('open');
    
    // Click again to close
    fireEvent.click(toggleButton);
    
    // The open class should be removed
    expect(controlPanel).not.toHaveClass('open');
  });
  
  test('closes the drawer when clicking outside on the overlay', () => {
    render(<App />);
    
    // Open the drawer
    const toggleButton = screen.getByLabelText('Toggle controls');
    fireEvent.click(toggleButton);
    
    // Check that drawer is open
    const controlPanel = document.querySelector('.control-panel');
    expect(controlPanel).toHaveClass('open');
    
    // Click the overlay
    const overlay = screen.getByTestId('drawer-overlay');
    fireEvent.click(overlay);
    
    // Check that drawer is closed
    expect(controlPanel).not.toHaveClass('open');
  });
  
  test('closes the drawer when clicking the internal close button', () => {
    render(<App />);
    
    // Open the drawer
    const toggleButton = screen.getByLabelText('Toggle controls');
    fireEvent.click(toggleButton);
    
    // Check that drawer is open
    const controlPanel = document.querySelector('.control-panel');
    expect(controlPanel).toHaveClass('open');
    
    // Click the close button inside the drawer
    const closeBtn = screen.getByLabelText('Close controls');
    fireEvent.click(closeBtn);
    
    // Check that drawer is closed
    expect(controlPanel).not.toHaveClass('open');
  });
}); 