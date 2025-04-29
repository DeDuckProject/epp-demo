import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ControlPanel from '../../src/components/ControlPanel';
import { PurificationStep } from '../../src/engine/types';

describe('ControlPanel', () => {
  // Mock functions for all callback props
  const mockOnNextStep = vi.fn();
  const mockOnCompleteRound = vi.fn();
  const mockOnRunAll = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnParametersChanged = vi.fn();

  // Default props for rendering
  const defaultProps = {
    onNextStep: mockOnNextStep,
    onCompleteRound: mockOnCompleteRound,
    onRunAll: mockOnRunAll,
    onReset: mockOnReset,
    onParametersChanged: mockOnParametersChanged,
    isComplete: false,
    currentRound: 1,
    currentStep: 'initial' as PurificationStep,
    pairsRemaining: 10
  };

  // Helper function to render the component with custom props
  const renderControlPanel = (props = {}) => {
    return render(<ControlPanel {...defaultProps} {...props} />);
  };

  // Reset all mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders initial UI correctly', () => {
    const { container } = renderControlPanel();

    // Check headings
    expect(screen.getByText('Simulation Controls')).toBeDefined();
    expect(screen.getByText('Parameters')).toBeDefined();
    expect(screen.getByText('Simulation')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();

    // Get the parameter input containers
    const parameterInputs = container.querySelectorAll('.parameter-input');
    
    // Check first parameter input - Initial Pairs
    const initialPairsContainer = parameterInputs[0] as HTMLElement;
    expect(within(initialPairsContainer).getByText('Initial Pairs:')).toBeDefined();
    const initialPairsInput = within(initialPairsContainer).getByRole('spinbutton') as HTMLInputElement;
    expect(initialPairsInput.value).toBe('10');

    // Check noise parameter
    expect(screen.getByText('0.30')).toBeDefined();
    expect(screen.getByText('0.95')).toBeDefined();

    // Check status information
    expect(screen.getByText('Distillation Round: 1')).toBeDefined();
    expect(screen.getByText('Current Step: initial')).toBeDefined();
    expect(screen.getByText('Pairs Remaining: 10')).toBeDefined();
    expect(screen.getByText('Status: In Progress')).toBeDefined();

    // Check buttons
    const nextStepButton = screen.getByText('Next Step: Twirl') as HTMLButtonElement;
    expect(nextStepButton).toBeDefined();
    expect(nextStepButton.disabled).toBe(false);
    
    const completeRoundButton = screen.getByText('Complete Round') as HTMLButtonElement;
    expect(completeRoundButton).toBeDefined();
    expect(completeRoundButton.disabled).toBe(false);
    
    const runAllButton = screen.getByText('Run All') as HTMLButtonElement;
    expect(runAllButton).toBeDefined();
    expect(runAllButton.disabled).toBe(false);
    
    const resetButton = screen.getByText('Reset') as HTMLButtonElement;
    expect(resetButton).toBeDefined();
    expect(resetButton.disabled).toBe(false);
    
    const applyParamsButton = screen.getByText('Apply Parameters');
    expect(applyParamsButton).toBeDefined();
  });

  test('user can adjust parameters and apply them', async () => {
    const { container } = renderControlPanel();
    
    // Get the parameter input containers
    const parameterInputs = container.querySelectorAll('.parameter-input');
    
    // Change initial pairs
    const initialPairsContainer = parameterInputs[0] as HTMLElement;
    const initialPairsInput = within(initialPairsContainer).getByRole('spinbutton');
    fireEvent.change(initialPairsInput, { target: { value: '20' } });
    
    // Change noise parameter
    const noiseContainer = parameterInputs[1] as HTMLElement;
    const noiseSlider = within(noiseContainer).getByRole('slider');
    fireEvent.change(noiseSlider, { target: { value: '0.42' } });
    
    // Change target fidelity
    const fidelityContainer = parameterInputs[2] as HTMLElement;
    const fidelitySlider = within(fidelityContainer).getByRole('slider');
    fireEvent.change(fidelitySlider, { target: { value: '0.87' } });
    
    // Apply parameters
    const applyButton = screen.getByText('Apply Parameters');
    fireEvent.click(applyButton);
    
    // Verify the callback was called with correct parameters
    expect(mockOnParametersChanged).toHaveBeenCalledTimes(1);
    expect(mockOnParametersChanged).toHaveBeenCalledWith({
      initialPairs: 20,
      noiseParameter: 0.42,
      targetFidelity: 0.87
    });
  });

  test('simulation controls fire callbacks correctly', () => {
    renderControlPanel();
    
    // Click next step button
    fireEvent.click(screen.getByText('Next Step: Twirl'));
    expect(mockOnNextStep).toHaveBeenCalledTimes(1);
    
    // Click complete round button
    fireEvent.click(screen.getByText('Complete Round'));
    expect(mockOnCompleteRound).toHaveBeenCalledTimes(1);
    
    // Click run all button
    fireEvent.click(screen.getByText('Run All'));
    expect(mockOnRunAll).toHaveBeenCalledTimes(1);
    
    // Click reset button
    fireEvent.click(screen.getByText('Reset'));
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  test('complete state disables controls and changes text', () => {
    renderControlPanel({ isComplete: true });
    
    // Check button states
    const completeButton = screen.getByText('Complete') as HTMLButtonElement;
    expect(completeButton.disabled).toBe(true);
    
    const completeRoundButton = screen.getByText('Complete Round') as HTMLButtonElement;
    expect(completeRoundButton.disabled).toBe(true);
    
    const runAllButton = screen.getByText('Run All') as HTMLButtonElement;
    expect(runAllButton.disabled).toBe(true);
    
    const resetButton = screen.getByText('Reset') as HTMLButtonElement;
    expect(resetButton.disabled).toBe(false);
    
    // Clicking disabled buttons shouldn't call handlers
    fireEvent.click(completeButton);
    expect(mockOnNextStep).not.toHaveBeenCalled();
    
    fireEvent.click(completeRoundButton);
    expect(mockOnCompleteRound).not.toHaveBeenCalled();
    
    fireEvent.click(runAllButton);
    expect(mockOnRunAll).not.toHaveBeenCalled();
    
    // Reset should still work
    fireEvent.click(resetButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
    
    // Status should show "Complete"
    expect(screen.getByText('Status: Complete')).toBeDefined();
  });

  test('step-name mapping for all steps', () => {
    const stepNameMap: Record<PurificationStep, string> = {
      'initial': 'Twirl',
      'twirled': 'Exchange States',
      'exchanged': 'Apply CNOT',
      'cnot': 'Measure',
      'measured': 'Process Results',
      'completed': 'Start Next Round'
    };
    
    // Test each step name
    Object.entries(stepNameMap).forEach(([step, expectedName]) => {
      const { unmount } = renderControlPanel({ currentStep: step as PurificationStep });
      expect(screen.getByText(`Next Step: ${expectedName}`)).toBeDefined();
      
      // Cleanup before testing next step
      unmount();
    });
  });
}); 