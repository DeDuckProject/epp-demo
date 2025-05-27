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
      const title = screen.getByRole('heading', { level: 2 });
      
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('id', 'info-window-title');
    });

    it('should display main sections with headings', () => {
      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      
      // Should have at least 3 main sections
      expect(h3Headings.length).toBeGreaterThanOrEqual(3);
    });

    it('should have subsections with h4 headings', () => {
      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      
      // Should have some subsections
      expect(h4Headings.length).toBeGreaterThan(0);
    });

    it('should contain informational content', () => {
      // Check for presence of content sections without relying on exact text
      const container = screen.getByTestId('info-window');
      const sections = container.querySelectorAll('.info-section');
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });

    it('should contain lists with information', () => {
      const lists = screen.getAllByRole('list');
      
      // Should have multiple lists for different sections
      expect(lists.length).toBeGreaterThan(0);
    });

    it('should contain external links', () => {
      const externalLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('target') === '_blank'
      );
      
      // Should have some external links for references
      expect(externalLinks.length).toBeGreaterThan(0);
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
    });

    it('should close when clicking the close button', () => {
      const closeButton = screen.getByRole('button');
      
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close when clicking the overlay background', () => {
      const overlay = screen.getByTestId('info-window');
      
      fireEvent.click(overlay);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside the modal content', () => {
      const modalContent = screen.getByRole('heading', { level: 2 }).closest('.modal-content');
      
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
      const closeButton = screen.getByRole('button');
      
      expect(closeButton).toHaveAttribute('aria-label');
    });

    it('should have proper heading hierarchy', () => {
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });
      const h4s = screen.getAllByRole('heading', { level: 4 });
      
      expect(h2).toBeInTheDocument();
      expect(h3s.length).toBeGreaterThanOrEqual(3); // At least 3 main sections
      expect(h4s.length).toBeGreaterThan(0); // Some subsections
    });
  });

  describe('External links security', () => {
    beforeEach(() => {
      render(<InfoWindow isOpen={true} onClose={mockOnClose} />);
    });

    it('should ensure external links have proper security attributes', () => {
      const externalLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('target') === '_blank'
      );

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      // Should have some external links
      expect(externalLinks.length).toBeGreaterThan(0);
    });

    it('should have reference links in credits section', () => {
      // Look for links that appear to be references (arxiv, github, etc.)
      const allLinks = screen.getAllByRole('link');
      const referenceLinks = allLinks.filter(link => {
        const href = link.getAttribute('href') || '';
        return href.includes('arxiv.org') || href.includes('github.com') || href.includes('wikipedia.org');
      });
      
      expect(referenceLinks.length).toBeGreaterThan(0);
    });
  });
}); 