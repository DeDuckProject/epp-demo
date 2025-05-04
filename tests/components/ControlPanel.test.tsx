import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ControlPanel from '../../src/components/ControlPanel';
import { PurificationStep, EngineType, Basis } from '../../src/engine/types';

describe('ControlPanel', () => {
  // Mock functions for all callback props
  const mockOnNextStep = vi.fn();
  const mockOnCompleteRound = vi.fn();
  const mockOnRunAll = vi.fn();
  const mockOnReset = vi.fn();
  const mockOnParametersChanged = vi.fn();
  const mockOnEngineTypeChanged = vi.fn();
  const mockOnViewBasisChanged = vi.fn();

  // Default props for rendering
  const defaultProps = {
    onNextStep: mockOnNextStep,
    onCompleteRound: mockOnCompleteRound,
    onRunAll: mockOnRunAll,
    onReset: mockOnReset,
    onParametersChanged: mockOnParametersChanged,
    onEngineTypeChanged: mockOnEngineTypeChanged,
    onViewBasisChanged: mockOnViewBasisChanged,
    isComplete: false,
    currentRound: 1,
    currentStep: 'twirled' as PurificationStep,
    pairsRemaining: 5,
    engineType: EngineType.Average,
    viewBasis: Basis.Bell
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

    // Check engine type dropdown
    const engineTypeSelect = screen.getByLabelText('Engine Type:') as HTMLSelectElement;
    expect(engineTypeSelect.value).toBe(EngineType.Average);

    // Check view basis dropdown
    const viewBasisSelect = screen.getByLabelText('View Basis:') as HTMLSelectElement;
    expect(viewBasisSelect.value).toBe(Basis.Bell);

    // Check initial pairs input
    const initialPairsInput = screen.getByLabelText('Initial Pairs:') as HTMLInputElement;
    expect(initialPairsInput.value).toBe('10');

    // Check noise parameter slider
    const noiseSlider = screen.getByLabelText('Noise Parameter:') as HTMLInputElement;
    expect(noiseSlider.value).toBe('0.3');

    // Check target fidelity slider
    const fidelitySlider = screen.getByLabelText('Target Fidelity:') as HTMLInputElement;
    expect(fidelitySlider.value).toBe('0.95');

    // Check status information
    expect(screen.getByText('Distillation Round: 1')).toBeDefined();
    expect(screen.getByText('Current Step: twirled')).toBeDefined();
    expect(screen.getByText('Pairs Remaining: 5')).toBeDefined();
    expect(screen.getByText('Status: In Progress')).toBeDefined();

    // Check buttons
    const nextStepButton = screen.getByText('Next Step: Exchange States') as HTMLButtonElement;
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

  test('renders with Monte Carlo engine type selected', () => {
    renderControlPanel({ engineType: EngineType.MonteCarlo });
    
    const engineTypeSelect = screen.getByLabelText('Engine Type:') as HTMLSelectElement;
    expect(engineTypeSelect.value).toBe(EngineType.MonteCarlo);
  });

  test('can switch engine type', () => {
    renderControlPanel();
    
    // Get the engine type select
    const engineTypeSelect = screen.getByLabelText('Engine Type:') as HTMLSelectElement;
    
    // Change to Monte Carlo
    fireEvent.change(engineTypeSelect, { target: { value: EngineType.MonteCarlo } });
    
    // Verify callback called
    expect(mockOnEngineTypeChanged).toHaveBeenCalledTimes(1);
    expect(mockOnEngineTypeChanged).toHaveBeenCalledWith(EngineType.MonteCarlo);
  });

  test('user can adjust parameters and apply them', async () => {
    renderControlPanel();
    
    // Change initial pairs input
    const initialPairsInput = screen.getByLabelText('Initial Pairs:');
    fireEvent.change(initialPairsInput, { target: { value: '20' } });
    
    // Change noise parameter
    const noiseSlider = screen.getByLabelText('Noise Parameter:');
    fireEvent.change(noiseSlider, { target: { value: '0.42' } });
    
    // Change target fidelity
    const fidelitySlider = screen.getByLabelText('Target Fidelity:');
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
    fireEvent.click(screen.getByText('Next Step: Exchange States'));
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

  test('renders with default Bell basis selected', () => {
    render(<ControlPanel {...defaultProps} />);
    
    // Find viewBasis dropdown
    const viewBasisSelect = screen.getByLabelText(/view basis/i);
    expect(viewBasisSelect).toBeDefined();
    expect((viewBasisSelect as HTMLSelectElement).value).toBe(Basis.Bell);
  });

  test('calls onViewBasisChanged when basis is changed', () => {
    render(<ControlPanel {...defaultProps} />);
    
    // Get the select and change to Computational
    const viewBasisSelect = screen.getByLabelText(/view basis/i);
    fireEvent.change(viewBasisSelect, { target: { value: Basis.Computational } });
    
    // Verify the handler was called with Computational basis
    expect(mockOnViewBasisChanged).toHaveBeenCalledWith(Basis.Computational);
  });

  test('displays correct basis when viewBasis prop changes', () => {
    // First render with Bell basis
    const { rerender } = render(<ControlPanel {...defaultProps} />);
    
    // Verify Bell basis is selected
    const viewBasisSelect = screen.getByLabelText(/view basis/i);
    expect((viewBasisSelect as HTMLSelectElement).value).toBe(Basis.Bell);
    
    // Re-render with Computational basis
    rerender(<ControlPanel {...defaultProps} viewBasis={Basis.Computational} />);
    
    // Verify Computational basis is now selected
    expect((viewBasisSelect as HTMLSelectElement).value).toBe(Basis.Computational);
  });
}); 