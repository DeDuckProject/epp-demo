import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CollapsibleSection from '../../src/components/CollapsibleSection';

describe('CollapsibleSection Component', () => {
  const mockContent = (
    <div>
      <p>Test content paragraph</p>
      <button>Test button</button>
    </div>
  );

  describe('Initial Rendering and Default Behavior', () => {
    it('renders expanded by default with title and content visible', () => {
      render(
        <CollapsibleSection title="Test Section">
          {mockContent}
        </CollapsibleSection>
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText('Test content paragraph')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Test button' })).toBeInTheDocument();
      
      const header = screen.getByRole('button', { name: /test section/i });
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('can start collapsed when defaultExpanded is false', () => {
      render(
        <CollapsibleSection title="Collapsed Section" defaultExpanded={false}>
          {mockContent}
        </CollapsibleSection>
      );

      expect(screen.getByText('Collapsed Section')).toBeInTheDocument();
      
      const content = screen.getByText('Test content paragraph').closest('.collapsible-content');
      expect(content).toHaveClass('collapsed');
      
      const header = screen.getByRole('button', { name: /collapsed section/i });
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('User Interactions and State Management', () => {
    it('toggles content visibility when header is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CollapsibleSection title="Clickable Section">
          {mockContent}
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /clickable section/i });
      const content = screen.getByText('Test content paragraph');

      // Initially expanded
      expect(content).toBeVisible();
      expect(header).toHaveAttribute('aria-expanded', 'true');

      // Click to collapse
      await user.click(header);
      expect(header).toHaveAttribute('aria-expanded', 'false');

      // Click to expand again
      await user.click(header);
      expect(content).toBeVisible();
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('responds to keyboard navigation with Enter and Space keys', async () => {
      const user = userEvent.setup();
      
      render(
        <CollapsibleSection title="Keyboard Section">
          {mockContent}
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /keyboard section/i });
      
      // Focus the header
      header.focus();
      expect(header).toHaveFocus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(header).toHaveAttribute('aria-expanded', 'false');

      // Test Space key
      await user.keyboard(' ');
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('ignores non-actionable keyboard events', async () => {
      const user = userEvent.setup();
      
      render(
        <CollapsibleSection title="Keyboard Ignore Section">
          {mockContent}
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /keyboard ignore section/i });
      header.focus();

      // Initially expanded
      expect(header).toHaveAttribute('aria-expanded', 'true');

      // Test non-actionable keys (should not change state)
      await user.keyboard('{Escape}');
      expect(header).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Tab}');
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Accessibility and ARIA Support', () => {
    it('provides proper ARIA attributes for screen readers', () => {
      render(
        <CollapsibleSection title="ARIA Test Section">
          {mockContent}
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /aria test section/i });
      const content = screen.getByText('Test content paragraph').closest('[id]');

      expect(header).toHaveAttribute('tabIndex', '0');
      expect(header).toHaveAttribute('aria-expanded', 'true');
      expect(header).toHaveAttribute('aria-controls');
      expect(content).toHaveAttribute('aria-hidden', 'false');
      expect(content).toHaveAttribute('id');
      
      // Verify the relationship between header and content
      const controlsId = header.getAttribute('aria-controls');
      const contentId = content?.getAttribute('id');
      expect(controlsId).toBe(contentId);
    });

    it('updates ARIA attributes when collapsed', async () => {
      const user = userEvent.setup();
      
      render(
        <CollapsibleSection title="ARIA Collapsed Section">
          {mockContent}
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /aria collapsed section/i });
      const content = screen.getByText('Test content paragraph').closest('[aria-hidden]');

      // Collapse the section
      await user.click(header);

      expect(header).toHaveAttribute('aria-expanded', 'false');
      expect(content).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Visual State and CSS Classes', () => {
    it('applies correct CSS classes based on expansion state', async () => {
      const user = userEvent.setup();
      
      render(
        <CollapsibleSection title="CSS Classes Section">
          {mockContent}
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /css classes section/i });
      const chevron = header.querySelector('.chevron');
      const content = screen.getByText('Test content paragraph').closest('.collapsible-content');

      // Initially expanded
      expect(chevron).toHaveClass('expanded');
      expect(content).toHaveClass('expanded');

      // After collapsing
      await user.click(header);
      expect(chevron).toHaveClass('collapsed');
      expect(content).toHaveClass('collapsed');
    });

    it('accepts custom className prop', () => {
      const { container } = render(
        <CollapsibleSection title="Custom Class Section" className="custom-test-class">
          {mockContent}
        </CollapsibleSection>
      );

      const sectionElement = container.querySelector('.collapsible-section');
      expect(sectionElement).toHaveClass('collapsible-section', 'custom-test-class');
    });
  });

  describe('Content Management and Edge Cases', () => {
    it('handles empty content gracefully', () => {
      render(
        <CollapsibleSection title="Empty Content Section">
          {null}
        </CollapsibleSection>
      );

      expect(screen.getByText('Empty Content Section')).toBeInTheDocument();
      const header = screen.getByRole('button', { name: /empty content section/i });
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('generates unique IDs for multiple sections', () => {
      render(
        <div>
          <CollapsibleSection title="First Section">
            <p>First content</p>
          </CollapsibleSection>
          <CollapsibleSection title="Second Section">
            <p>Second content</p>
          </CollapsibleSection>
        </div>
      );

      const firstHeader = screen.getByRole('button', { name: /first section/i });
      const secondHeader = screen.getByRole('button', { name: /second section/i });
      
      const firstControlsId = firstHeader.getAttribute('aria-controls');
      const secondControlsId = secondHeader.getAttribute('aria-controls');
      
      expect(firstControlsId).not.toBe(secondControlsId);
      expect(firstControlsId).toBe('section-content-first-section');
      expect(secondControlsId).toBe('section-content-second-section');
    });

    it('handles titles with special characters in ID generation', () => {
      render(
        <CollapsibleSection title="Special & Characters! Section">
          {mockContent}
        </CollapsibleSection>
      );

      const header = screen.getByRole('button', { name: /special & characters! section/i });
      const controlsId = header.getAttribute('aria-controls');
      
      expect(controlsId).toBe('section-content-special-&-characters!-section');
    });
  });
}); 