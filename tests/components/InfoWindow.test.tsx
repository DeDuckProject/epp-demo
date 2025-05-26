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

    it('should display all three main sections', () => {
      expect(screen.getByText('What is Entanglement Purification?')).toBeInTheDocument();
      expect(screen.getByText('How to Use This Application')).toBeInTheDocument();
      expect(screen.getByText('Credits & References')).toBeInTheDocument();
    });

    describe('Entanglement Purification section', () => {
      it('should explain the basic concept', () => {
        expect(screen.getByText(/Entanglement purification is a quantum protocol/)).toBeInTheDocument();
        expect(screen.getByText(/BBPSSW.*protocol/)).toBeInTheDocument();
      });

      it('should list the protocol steps', () => {
        expect(screen.getByText('Starting with multiple noisy entangled pairs')).toBeInTheDocument();
        expect(screen.getByText('Applying quantum operations (twirling, CNOT gates)')).toBeInTheDocument();
        expect(screen.getByText('Performing measurements to test entanglement quality')).toBeInTheDocument();
        expect(screen.getByText('Keeping only the pairs that pass the test')).toBeInTheDocument();
        expect(screen.getByText('Repeating until target fidelity is achieved')).toBeInTheDocument();
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
      expect(h3s).toHaveLength(3); // Three main sections
      expect(h4s.length).toBeGreaterThan(0); // Subsections
    });
  });
}); 