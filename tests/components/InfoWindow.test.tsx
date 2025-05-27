import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InfoWindow from '../../src/components/InfoWindow';

describe('InfoWindow Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    cleanup();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  describe('When the info window is closed', () => {
    it('should not render anything', () => {
      render(<InfoWindow isOpen={false} onClose={mockOnClose} />);
      
      expect(screen.queryByTestId('info-window')).not.toBeInTheDocument();
    });
  });

  describe('When the info window is opened', () => {
    beforeEach(() => {
      render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
    });

    it('should display the modal with proper accessibility attributes', () => {
      const modal = screen.getByTestId('info-window');
      
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'info-window-title');
    });

    it('should display the main title', () => {
      const title = screen.getByText('Quantum Entanglement Purification');
      
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('id', 'info-window-title');
    });

    it('should display all main sections', () => {
      expect(screen.getByText('What is Entanglement Purification?')).toBeInTheDocument();
      expect(screen.getByText('Protocol Steps Explained')).toBeInTheDocument();
      expect(screen.getByText('How to Use This Application')).toBeInTheDocument();
      expect(screen.getByText('Credits & References')).toBeInTheDocument();
    });

    describe('Entanglement Purification section', () => {
      it('should explain the basic concept', () => {
        expect(screen.getByText(/Entanglement purification is a/)).toBeInTheDocument();
        expect(screen.getByText(/This simulator implements the BBPSSW/)).toBeInTheDocument();
      });

      it('should list the protocol steps', () => {
        expect(screen.getByText('Starting with multiple noisy entangled pairs')).toBeInTheDocument();
        expect(screen.getByText('Applying quantum operations (twirling, CNOT gates)')).toBeInTheDocument();
        expect(screen.getByText('Performing measurements to test entanglement quality')).toBeInTheDocument();
        expect(screen.getByText('Keeping only the pairs that pass the test')).toBeInTheDocument();
        expect(screen.getByText('Repeating until target fidelity is achieved')).toBeInTheDocument();
      });
    });

    describe('Protocol Steps section', () => {
      it('should explain all protocol steps', () => {
        expect(screen.getByText('0. Initialization (before protocol starts)')).toBeInTheDocument();
        expect(screen.getByText('1. Depolarization/Twirling')).toBeInTheDocument();
        expect(screen.getByText('2. Exchange Operation')).toBeInTheDocument();
        expect(screen.getByText('3. Bilateral CNOT')).toBeInTheDocument();
        expect(screen.getByText('4. Measurement & Post-Selection')).toBeInTheDocument();
        expect(screen.getByText('5. Round Completion')).toBeInTheDocument();
      });

      it('should explain noise channels', () => {
        expect(screen.getByText('Noise Channels')).toBeInTheDocument();
        expect(screen.getByText(/Depolarizing:/)).toBeInTheDocument();
        expect(screen.getByText(/Dephasing:/)).toBeInTheDocument();
        expect(screen.getByText(/Amplitude Damping:/)).toBeInTheDocument();
        expect(screen.getByText(/Uniform Noise:/)).toBeInTheDocument();
      });

      it('should include key insight about pair sacrifice', () => {
        expect(screen.getByText(/Each round sacrifices at least half/)).toBeInTheDocument();
      });
    });

    describe('Application Usage section', () => {
      it('should explain control panel functions', () => {
        expect(screen.getByText(/Next Step \(N\):/)).toBeInTheDocument();
        expect(screen.getByText(/Complete Round \(C\):/)).toBeInTheDocument();
        expect(screen.getByText(/Run All \(A\):/)).toBeInTheDocument();
        expect(screen.getByText(/Reset \(R\):/)).toBeInTheDocument();
      });

      it('should explain parameters', () => {
        expect(screen.getByText(/Initial Pairs:/)).toBeInTheDocument();
        expect(screen.getByText(/Noise Parameter:/)).toBeInTheDocument();
        expect(screen.getByText(/Target Fidelity:/)).toBeInTheDocument();
        expect(screen.getByText(/Noise Channel:/)).toBeInTheDocument();
      });

      it('should explain visualization elements', () => {
        expect(screen.getByText(/Qubit Pairs:/)).toBeInTheDocument();
        expect(screen.getByText(/Colors:/)).toBeInTheDocument();
        expect(screen.getByText(/Density Matrices:/)).toBeInTheDocument();
        expect(screen.getByText(/CNOT Operations:/)).toBeInTheDocument();
      });

      it('should explain simulation engines', () => {
        expect(screen.getByText(/Average Engine:/)).toBeInTheDocument();
        expect(screen.getByText(/Monte Carlo Engine:/)).toBeInTheDocument();
      });
    });

    describe('Credits section', () => {
      it('should reference the original BBPSSW paper', () => {
        expect(screen.getByText(/Bennett, C\. H\., Brassard, G\., Popescu, S\., Schumacher, B\., Smolin, J\. A\., & Wootters, W\. K\./)).toBeInTheDocument();
        expect(screen.getByText(/Physical Review Letters/)).toBeInTheDocument();
      });

      it('should credit the GitHub reference with proper link', () => {
        const link = screen.getByRole('link', { name: /github.com\/a-auer\/qiskit/ });
        
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com/a-auer/qiskit');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
    });

    it('should close when clicking the close button', () => {
      const closeButton = screen.getByRole('button', { name: /close information window/i });
      
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close when clicking the overlay background', () => {
      const overlay = screen.getByTestId('info-window');
      
      fireEvent.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside the modal content', () => {
      const modalContent = screen.getByText('Quantum Entanglement Purification').closest('.modal-content');
      
      fireEvent.click(modalContent!);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should close when pressing Escape key', () => {
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when pressing other keys', () => {
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body overflow management', () => {
    it('should set body overflow to hidden when modal opens', () => {
      render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when modal closes', () => {
      const { rerender } = render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<InfoWindow isOpen={false} onClose={mockOnClose} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Accessibility features', () => {
    beforeEach(() => {
      render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
    });

    it('should have proper ARIA attributes', () => {
      const modal = screen.getByTestId('info-window');
      
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'info-window-title');
    });

    it('should have accessible close button', () => {
      const closeButton = screen.getByRole('button', { name: /close information window/i });
      
      expect(closeButton).toHaveAttribute('aria-label', 'Close information window');
    });

    it('should have proper heading hierarchy', () => {
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });
      const h4s = screen.getAllByRole('heading', { level: 4 });
      
      expect(h2).toBeInTheDocument();
      expect(h3s).toHaveLength(4); // Four main sections
      expect(h4s.length).toBeGreaterThan(0); // Subsections
    });
  });

  describe('Wikipedia links', () => {
    beforeEach(() => {
      render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
    });

    it('should have Wikipedia links for key quantum computing terms', () => {
      // Test main quantum computing concepts
      const entanglementLink = screen.getByRole('link', { name: /Entanglement purification/ });
      expect(entanglementLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Entanglement_distillation');
      expect(entanglementLink).toHaveAttribute('target', '_blank');
      expect(entanglementLink).toHaveAttribute('rel', 'noopener noreferrer');

      const qubitLink = screen.getByRole('link', { name: /qubits/ });
      expect(qubitLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Qubit');

      const eprLink = screen.getByRole('link', { name: /EPR pairs/ });
      expect(eprLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/EPR_paradox');

      const fidelityLink = screen.getByRole('link', { name: /fidelity/ });
      expect(fidelityLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Fidelity_of_quantum_states');
    });

    it('should have Wikipedia links for protocol-specific terms', () => {
      const bbpsswLink = screen.getByRole('link', { name: /BBPSSW/ });
      expect(bbpsswLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Entanglement_distillation#BBPSSW_protocol');

      const bellStatesLink = screen.getByRole('link', { name: /Bell states/ });
      expect(bellStatesLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Bell_state');

      const cnotLink = screen.getByRole('link', { name: /controlled-NOT gates/ });
      expect(cnotLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Controlled_NOT_gate');
    });

    it('should have Wikipedia links for noise channel terms', () => {
      const depolarizingLinks = screen.getAllByRole('link', { name: /Depolarizing/ });
      expect(depolarizingLinks[0]).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Depolarizing_channel');

      const pauliLink = screen.getByRole('link', { name: /Pauli gates/ });
      expect(pauliLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Pauli_matrices');

      const dephasingLink = screen.getByRole('link', { name: /Dephasing/ });
      expect(dephasingLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Dephasing');

      const amplitudeDampingLink = screen.getByRole('link', { name: /Amplitude Damping/ });
      expect(amplitudeDampingLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Amplitude_damping_channel');
    });

    it('should have Wikipedia links for mathematical concepts', () => {
      const wernerLink = screen.getByRole('link', { name: /Werner form/ });
      expect(wernerLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Werner_state');

      const densityMatrixLink = screen.getByRole('link', { name: /density matrix/ });
      expect(densityMatrixLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Density_matrix');

      const monteCarloLink = screen.getByRole('link', { name: /monte-carlo simulation/ });
      expect(monteCarloLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Monte_Carlo_method');

      const haarLink = screen.getByRole('link', { name: /Haar measure/ });
      expect(haarLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Haar_measure');
    });

    it('should ensure all Wikipedia links open in new tabs with proper security attributes', () => {
      const wikipediaLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.includes('wikipedia.org')
      );

      wikipediaLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      // Should have multiple Wikipedia links
      expect(wikipediaLinks.length).toBeGreaterThan(10);
    });
  });
}); 