import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../src/components/App';
import { SimulationController } from '../../src/controller/simulationController';
import { SimulationState, PurificationStep, SimulationParameters } from '../../src/engine/types';

// Mock the simulation controller
vi.mock('../../src/controller/simulationController', () => {
  return {
    SimulationController: vi.fn()
  };
});

describe('App', () => {
  // Create a mock state for testing
  const mockState: SimulationState = {
    pairs: [{ id: 1, fidelity: 0.8, densityMatrix: {} as any }],
    round: 2,
    complete: false,
    purificationStep: 'cnot' as PurificationStep,
    pendingPairs: {
      controlPairs: [{ id: 1, fidelity: 0.8, densityMatrix: {} as any }],
      targetPairs: []
    }
  };

  // Mock controller methods
  const mockNextStep = vi.fn();
  const mockCompleteRound = vi.fn();
  const mockRunUntilComplete = vi.fn();
  const mockReset = vi.fn();
  const mockUpdateParameters = vi.fn();

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
          updateParameters: mockUpdateParameters
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
        updateParameters: mockUpdateParameters
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
    
    // Click Complete Round button
    fireEvent.click(screen.getByText('Complete Round'));
    expect(mockCompleteRound).toHaveBeenCalledTimes(1);
    
    // Click Run All button
    fireEvent.click(screen.getByText('Run All'));
    expect(mockRunUntilComplete).toHaveBeenCalledTimes(1);
    
    // Click Reset button
    fireEvent.click(screen.getByText('Reset'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  test('updates parameters through controller when applied', () => {
    render(<App />);
    
    // Find input elements
    const initialPairsInput = screen.getByRole('spinbutton', { name: /Initial Pairs/ });
    const noiseSlider = screen.getByRole('slider', { name: /Noise Parameter/ });
    const fidelitySlider = screen.getByRole('slider', { name: /Target Fidelity/ });
    
    // Change values
    fireEvent.change(initialPairsInput, { target: { value: '20' } });
    fireEvent.change(noiseSlider, { target: { value: '0.5' } });
    fireEvent.change(fidelitySlider, { target: { value: '0.9' } });
    
    // Apply parameters
    fireEvent.click(screen.getByText('Apply Parameters'));
    
    // Verify controller method was called with correct parameters
    expect(mockUpdateParameters).toHaveBeenCalledTimes(1);
    expect(mockUpdateParameters).toHaveBeenCalledWith({
      initialPairs: 20,
      noiseParameter: 0.5,
      targetFidelity: 0.9
    });
  });

  test('passes correct props to EnsembleDisplay from state', () => {
    render(<App />);
    
    // The EnsembleDisplay should show the pairs from state
    // For this test, check that the QubitPair is rendered with correct fidelity
    // Since we have both Alice and Bob's side showing the same fidelity, 
    // we should get multiple elements with this text
    const pairElements = screen.getAllByText('0.800');
    expect(pairElements).toHaveLength(2); // One for Alice, one for Bob
    
    // Check that they're in qubit-pair elements with the control-pair class
    const firstPairElement = pairElements[0].closest('.qubit-pair');
    expect(firstPairElement?.classList.contains('control-pair')).toBe(true);
  });
}); 