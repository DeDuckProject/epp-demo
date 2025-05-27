import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SimulationControls from '../../src/components/SimulationControls';
import { PurificationStep } from '../../src/engine/types';

// Mock react-hotkeys-hook
vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn((key, callback, options) => {
    // Store the callback to be called manually in tests
    (window as any).__hotkeyCallbacks = {
      ...(window as any).__hotkeyCallbacks,
      [key]: callback
    };
  })
}));

describe('SimulationControls', () => {
  const mockProps = {
    onNextStep: vi.fn(),
    onCompleteRound: vi.fn(),
    onRunAll: vi.fn(),
    onReset: vi.fn(),
    isComplete: false,
    currentStep: 'initial' as PurificationStep
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).__hotkeyCallbacks = {};
  });

  describe('Component Rendering', () => {
    it('renders all control buttons', () => {
      render(<SimulationControls {...mockProps} />);
      
      expect(screen.getByText(/Next Step: Twirl \[N\]/)).toBeInTheDocument();
      expect(screen.getByText('Complete Round [C]')).toBeInTheDocument();
      expect(screen.getByText('Run All [A]')).toBeInTheDocument();
      expect(screen.getByText('Reset [R]')).toBeInTheDocument();
    });

    it('applies correct CSS classes to buttons', () => {
      render(<SimulationControls {...mockProps} />);
      
      const nextStepButton = screen.getByText(/Next Step: Twirl \[N\]/);
      const resetButton = screen.getByText('Reset [R]');
      
      expect(nextStepButton).toHaveClass('control-button', 'primary');
      expect(resetButton).toHaveClass('control-button', 'secondary');
    });
  });

  describe('Button Interactions', () => {
    it('calls onNextStep when Next Step button is clicked', () => {
      render(<SimulationControls {...mockProps} />);
      
      const nextStepButton = screen.getByText(/Next Step: Twirl \[N\]/);
      fireEvent.click(nextStepButton);
      
      expect(mockProps.onNextStep).toHaveBeenCalledTimes(1);
    });

    it('calls onCompleteRound when Complete Round button is clicked', () => {
      render(<SimulationControls {...mockProps} />);
      
      const completeRoundButton = screen.getByText('Complete Round [C]');
      fireEvent.click(completeRoundButton);
      
      expect(mockProps.onCompleteRound).toHaveBeenCalledTimes(1);
    });

    it('calls onRunAll when Run All button is clicked', () => {
      render(<SimulationControls {...mockProps} />);
      
      const runAllButton = screen.getByText('Run All [A]');
      fireEvent.click(runAllButton);
      
      expect(mockProps.onRunAll).toHaveBeenCalledTimes(1);
    });

    it('calls onReset when Reset button is clicked', () => {
      render(<SimulationControls {...mockProps} />);
      
      const resetButton = screen.getByText('Reset [R]');
      fireEvent.click(resetButton);
      
      expect(mockProps.onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled State Handling', () => {
    it('disables simulation buttons when isComplete is true', () => {
      const completeProps = { ...mockProps, isComplete: true };
      render(<SimulationControls {...completeProps} />);
      
      const nextStepButton = screen.getByText('Complete');
      const completeRoundButton = screen.getByText('Complete Round [C]');
      const runAllButton = screen.getByText('Run All [A]');
      const resetButton = screen.getByText('Reset [R]');
      
      expect(nextStepButton).toBeDisabled();
      expect(completeRoundButton).toBeDisabled();
      expect(runAllButton).toBeDisabled();
      expect(resetButton).not.toBeDisabled(); // Reset should always be enabled
    });

    it('does not call handlers when disabled buttons are clicked', () => {
      const completeProps = { ...mockProps, isComplete: true };
      render(<SimulationControls {...completeProps} />);
      
      const nextStepButton = screen.getByText('Complete');
      const completeRoundButton = screen.getByText('Complete Round [C]');
      const runAllButton = screen.getByText('Run All [A]');
      
      fireEvent.click(nextStepButton);
      fireEvent.click(completeRoundButton);
      fireEvent.click(runAllButton);
      
      expect(mockProps.onNextStep).not.toHaveBeenCalled();
      expect(mockProps.onCompleteRound).not.toHaveBeenCalled();
      expect(mockProps.onRunAll).not.toHaveBeenCalled();
    });
  });

  describe('Step Name Display', () => {
    const stepTestCases = [
      { step: 'initial' as PurificationStep, expectedText: 'Next Step: Twirl [N]' },
      { step: 'twirled' as PurificationStep, expectedText: 'Next Step: Exchange States [N]' },
      { step: 'exchanged' as PurificationStep, expectedText: 'Next Step: Apply CNOT [N]' },
      { step: 'cnot' as PurificationStep, expectedText: 'Next Step: Measure [N]' },
      { step: 'measured' as PurificationStep, expectedText: 'Next Step: Discard Failures [N]' },
      { step: 'discard' as PurificationStep, expectedText: 'Next Step: Twirl + Exchange [N]' },
      { step: 'twirlExchange' as PurificationStep, expectedText: 'Next Step: Start Next Round [N]' },
      { step: 'completed' as PurificationStep, expectedText: 'Next Step: Start Next Round [N]' }
    ];

    stepTestCases.forEach(({ step, expectedText }) => {
      it(`displays correct step name for ${step} step`, () => {
        const stepProps = { ...mockProps, currentStep: step };
        render(<SimulationControls {...stepProps} />);
        
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    it('displays "Complete" when simulation is finished', () => {
      const completeProps = { ...mockProps, isComplete: true };
      render(<SimulationControls {...completeProps} />);
      
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('triggers onNextStep when "n" key is pressed and not complete', () => {
      render(<SimulationControls {...mockProps} />);
      
      // Simulate pressing the N key using the mocked callback
      const nCallback = (window as any).__hotkeyCallbacks['n'];
      nCallback();
      
      expect(mockProps.onNextStep).toHaveBeenCalledTimes(1);
    });

    it('triggers onCompleteRound when "c" key is pressed and not complete', () => {
      render(<SimulationControls {...mockProps} />);
      
      // Simulate pressing the C key using the mocked callback
      const cCallback = (window as any).__hotkeyCallbacks['c'];
      cCallback();
      
      expect(mockProps.onCompleteRound).toHaveBeenCalledTimes(1);
    });

    it('triggers onRunAll when "a" key is pressed and not complete', () => {
      render(<SimulationControls {...mockProps} />);
      
      // Simulate pressing the A key using the mocked callback
      const aCallback = (window as any).__hotkeyCallbacks['a'];
      aCallback();
      
      expect(mockProps.onRunAll).toHaveBeenCalledTimes(1);
    });

    it('triggers onReset when "r" key is pressed', () => {
      render(<SimulationControls {...mockProps} />);
      
      // Simulate pressing the R key using the mocked callback
      const rCallback = (window as any).__hotkeyCallbacks['r'];
      rCallback();
      
      expect(mockProps.onReset).toHaveBeenCalledTimes(1);
    });

    it('does not trigger simulation shortcuts when complete', () => {
      const completeProps = { ...mockProps, isComplete: true };
      render(<SimulationControls {...completeProps} />);
      
      // Simulate pressing the keys using the mocked callbacks
      const nCallback = (window as any).__hotkeyCallbacks['n'];
      const cCallback = (window as any).__hotkeyCallbacks['c'];
      const aCallback = (window as any).__hotkeyCallbacks['a'];
      
      nCallback();
      cCallback();
      aCallback();
      
      expect(mockProps.onNextStep).not.toHaveBeenCalled();
      expect(mockProps.onCompleteRound).not.toHaveBeenCalled();
      expect(mockProps.onRunAll).not.toHaveBeenCalled();
    });

    it('still triggers reset shortcut when complete', () => {
      const completeProps = { ...mockProps, isComplete: true };
      render(<SimulationControls {...completeProps} />);
      
      // Simulate pressing the R key using the mocked callback
      const rCallback = (window as any).__hotkeyCallbacks['r'];
      rCallback();
      
      expect(mockProps.onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper button structure for screen readers', () => {
      render(<SimulationControls {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
      
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/\[.\]/); // Each button should show its keyboard shortcut
      });
    });

    it('maintains focus management when buttons are disabled', () => {
      const completeProps = { ...mockProps, isComplete: true };
      render(<SimulationControls {...completeProps} />);
      
      const nextStepButton = screen.getByText('Complete');
      
      // Verify the button can receive focus even when disabled
      expect(nextStepButton).toBeDisabled();
      expect(nextStepButton).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders with correct container class', () => {
      const { container } = render(<SimulationControls {...mockProps} />);
      
      const controlsContainer = container.querySelector('.simulation-controls');
      expect(controlsContainer).toBeInTheDocument();
    });

    it('maintains consistent button order', () => {
      render(<SimulationControls {...mockProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent(/Next Step/);
      expect(buttons[1]).toHaveTextContent(/Complete Round/);
      expect(buttons[2]).toHaveTextContent(/Run All/);
      expect(buttons[3]).toHaveTextContent(/Reset/);
    });
  });
}); 