import { beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import ControlPanel from '../../src/components/ControlPanel';
import { EngineType, Basis, PurificationStep } from '../../src/engine/types';

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

// Mock the HelpPanel component
vi.mock('../../src/components/HelpPanel', () => ({
  default: () => <div data-testid="help-panel">Help Panel Content</div>
}));

// Mock the Popup component
vi.mock('../../src/components/Popup', () => ({
  default: ({ title, isOpen, onClose, children }: {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => 
    isOpen ? (
      <div data-testid="popup-component" onClick={onClose}>
        <div>{title}</div>
        {children}
      </div>
    ) : null
}));

// Mock the CollapsibleSection component
vi.mock('../../src/components/CollapsibleSection', () => ({
  default: ({ title, children, defaultExpanded = true }: {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
  }) => (
    <div data-testid={`collapsible-section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div data-testid={`section-header-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {title}
      </div>
      <div data-testid={`section-content-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {children}
      </div>
    </div>
  )
}));

describe('ControlPanel', () => {
  const defaultProps = {
    onParametersChanged: vi.fn(),
    onEngineTypeChanged: vi.fn(),
    onViewBasisChanged: vi.fn(),
    currentRound: 1,
    currentStep: 'initial' as PurificationStep,
    pairsRemaining: 10,
    averageFidelity: 0.765,
    engineType: EngineType.Average,
    viewBasis: Basis.Bell
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).__hotkeyCallbacks = {};
  });

  test('renders with parameter controls showing keyboard shortcuts', () => {
    render(<ControlPanel {...defaultProps} />);
    
    expect(screen.getByText(/Apply Parameters \[P\]/)).toBeInTheDocument();
  });

  test('toggles help panel when ? button is clicked', async () => {
    render(<ControlPanel {...defaultProps} />);
    
    // Help panel should not be shown initially
    expect(screen.queryByTestId('popup-component')).not.toBeInTheDocument();
    
    // Click the help button using act
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /\?/ }));
    });
    
    // Popup should now be visible with HelpPanel inside
    expect(screen.getByTestId('popup-component')).toBeInTheDocument();
    expect(screen.getByTestId('help-panel')).toBeInTheDocument();
    
    // Click the help button again to hide
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /\?/ }));
    });
    
    // Popup and HelpPanel should be hidden again
    expect(screen.queryByTestId('popup-component')).not.toBeInTheDocument();
    expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();
  });

  test('header buttons have consistent styling and alignment', () => {
    render(<ControlPanel {...defaultProps} />);
    
    // Help button should have header-button class
    const helpButton = screen.getByRole('button', { name: /\?/ });
    expect(helpButton).toHaveClass('header-button', 'help-button');
    
    // Header should contain the title
    expect(screen.getByText('Simulation Controls')).toBeInTheDocument();
  });

  test('drawer close button appears with proper styling when drawer is open', () => {
    const onDrawerClose = vi.fn();
    render(<ControlPanel {...defaultProps} isDrawerOpen={true} onDrawerClose={onDrawerClose} />);
    
    // Drawer close button should be present and have proper classes
    const closeButton = screen.getByRole('button', { name: /close controls/i });
    expect(closeButton).toHaveClass('header-button', 'drawer-close');
    expect(closeButton).toHaveTextContent('×');
    
    // Click should call onDrawerClose
    fireEvent.click(closeButton);
    expect(onDrawerClose).toHaveBeenCalledTimes(1);
  });

  test('drawer close button is not rendered when drawer is closed', () => {
    render(<ControlPanel {...defaultProps} isDrawerOpen={false} />);
    
    // Drawer close button should not be present
    expect(screen.queryByRole('button', { name: /close controls/i })).not.toBeInTheDocument();
  });

  test('header buttons have consistent circular styling', () => {
    const onDrawerClose = vi.fn();
    render(<ControlPanel {...defaultProps} isDrawerOpen={true} onDrawerClose={onDrawerClose} />);
    
    const helpButton = screen.getByRole('button', { name: /\?/ });
    const closeButton = screen.getByRole('button', { name: /close controls/i });
    
    // Both buttons should have the same base classes
    expect(helpButton).toHaveClass('header-button');
    expect(closeButton).toHaveClass('header-button');
    
    // Both buttons should have the same content styling (× and ? should appear similar)
    expect(helpButton).toHaveTextContent('?');
    expect(closeButton).toHaveTextContent('×');
  });



  test('calls onParametersChanged when P key is pressed', () => {
    render(<ControlPanel {...defaultProps} />);
    
    // Simulate pressing the P key
    const pCallback = (window as any).__hotkeyCallbacks['p'];
    pCallback();
    
    expect(defaultProps.onParametersChanged).toHaveBeenCalledTimes(1);
  });



  test('toggles help panel when ? key is pressed', async () => {
    render(<ControlPanel {...defaultProps} />);
    
    // Help panel should not be shown initially
    expect(screen.queryByTestId('popup-component')).not.toBeInTheDocument();
    expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();
    
    // Simulate pressing the ? key using act for proper state handling
    await act(async () => {
      const questionCallback = (window as any).__hotkeyCallbacks['?'];
      questionCallback();
    });
    
    // Popup should now be visible with HelpPanel inside
    expect(screen.getByTestId('popup-component')).toBeInTheDocument();
    expect(screen.getByTestId('help-panel')).toBeInTheDocument();
    
    // Simulate pressing the ? key again
    await act(async () => {
      const questionCallback = (window as any).__hotkeyCallbacks['?'];
      questionCallback();
    });
    
    // Popup and HelpPanel should be hidden again
    expect(screen.queryByTestId('popup-component')).not.toBeInTheDocument();
    expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();
  });

  test('parameter hotkey works when select elements are in focus', async () => {
    render(<ControlPanel {...defaultProps} />);
    
    // Find the select elements
    const engineTypeSelect = screen.getByLabelText('Engine Type:');
    
    // Focus the select element
    fireEvent.focus(engineTypeSelect);
    
    // Simulate pressing the parameter hotkey while select is focused
    const pCallback = (window as any).__hotkeyCallbacks['p'];
    pCallback();
    
    // Verify that the parameter handler was called
    expect(defaultProps.onParametersChanged).toHaveBeenCalledTimes(1);
  });

  describe('Collapsible Section Structure', () => {
    test('renders collapsible sections with correct titles', () => {
      render(<ControlPanel {...defaultProps} />);
      
      expect(screen.getByTestId('collapsible-section-experiment-setup')).toBeInTheDocument();
      expect(screen.getByTestId('collapsible-section-display-&-status')).toBeInTheDocument();
      
      expect(screen.getByTestId('section-header-experiment-setup')).toHaveTextContent('Experiment Setup');
      expect(screen.getByTestId('section-header-display-&-status')).toHaveTextContent('Display & Status');
    });

    test('experiment setup section contains all parameter controls', () => {
      render(<ControlPanel {...defaultProps} />);
      
      const experimentSection = screen.getByTestId('section-content-experiment-setup');
      
      // Check that all experiment setup controls are in this section
      expect(experimentSection).toContainElement(screen.getByLabelText('Engine Type:'));
      expect(experimentSection).toContainElement(screen.getByLabelText('Initial Pairs:'));
      expect(experimentSection).toContainElement(screen.getByLabelText('Noise Channel:'));
      expect(experimentSection).toContainElement(screen.getByLabelText('Noise Parameter:'));
      expect(experimentSection).toContainElement(screen.getByLabelText('Target Fidelity:'));
      expect(experimentSection).toContainElement(screen.getByText(/Apply Parameters \[P\]/));
    });

    test('display & status section contains view basis and status information', () => {
      render(<ControlPanel {...defaultProps} />);
      
      const displaySection = screen.getByTestId('section-content-display-&-status');
      
      // Check that view basis and status info are in this section
      expect(displaySection).toContainElement(screen.getByLabelText('View Basis:'));
      expect(displaySection).toContainElement(screen.getByText(/Distillation Round:/));
      expect(displaySection).toContainElement(screen.getByText(/Current Step:/));
      expect(displaySection).toContainElement(screen.getByText(/Pairs Remaining:/));
      expect(displaySection).toContainElement(screen.getByText(/Status:/));
    });



    test('parameter changes still work within collapsible sections', () => {
      render(<ControlPanel {...defaultProps} />);
      
      // Change engine type
      const engineTypeSelect = screen.getByLabelText('Engine Type:');
      fireEvent.change(engineTypeSelect, { target: { value: EngineType.MonteCarlo } });
      expect(defaultProps.onEngineTypeChanged).toHaveBeenCalledWith(EngineType.MonteCarlo);
      
      // Change view basis
      const viewBasisSelect = screen.getByLabelText('View Basis:');
      fireEvent.change(viewBasisSelect, { target: { value: Basis.Computational } });
      expect(defaultProps.onViewBasisChanged).toHaveBeenCalledWith(Basis.Computational);
      
      // Change initial pairs
      const initialPairsInput = screen.getByLabelText('Initial Pairs:');
      fireEvent.change(initialPairsInput, { target: { value: '20' } });
      // The value should be updated in the input
      expect(initialPairsInput).toHaveValue(20);
    });

    test('status information updates correctly within display section', () => {
      const { rerender } = render(<ControlPanel {...defaultProps} />);
      
      const displaySection = screen.getByTestId('section-content-display-&-status');
      
      // Initial status - check for the text content within the status section
      expect(screen.getByText('Distillation Round:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Current Step:')).toBeInTheDocument();
      expect(screen.getByText('initial')).toBeInTheDocument();
      expect(screen.getByText('Pairs Remaining:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      
      // Update props and rerender with completed step
      rerender(<ControlPanel 
        {...defaultProps} 
        currentRound={2}
        currentStep={'completed' as PurificationStep}
        pairsRemaining={5}
      />);
      
      // Updated status - check for new values
      expect(screen.getByText('Distillation Round:')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Current Step:')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('Pairs Remaining:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
      
      // Check specifically within the display section to avoid button conflict
      const statusInfo = displaySection.querySelector('.status-info');
      expect(statusInfo).toHaveTextContent('Complete');
    });
  });

  test('displays average fidelity in status section', () => {
    render(<ControlPanel {...defaultProps} />);
    
    expect(screen.getByText('Average Fidelity:')).toBeInTheDocument();
    expect(screen.getByText('0.765')).toBeInTheDocument();
  });

  test('formats average fidelity to 3 decimal places', () => {
    render(<ControlPanel {...defaultProps} averageFidelity={0.123456789} />);
    
    expect(screen.getByText('Average Fidelity:')).toBeInTheDocument();
    expect(screen.getByText('0.123')).toBeInTheDocument();
  });
}); 