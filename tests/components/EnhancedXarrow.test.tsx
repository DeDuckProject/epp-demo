import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Xwrapper } from 'react-xarrows';
import EnhancedXarrow from '../../src/components/EnhancedXarrow';

// Mock react-xarrows
vi.mock('react-xarrows', () => ({
  default: vi.fn(({ start, end, lineColor, strokeWidth, divContainerProps, ...props }) => (
    <div 
      data-testid="mock-xarrow"
      data-start={start}
      data-end={end}
      data-line-color={lineColor}
      data-stroke-width={strokeWidth}
      className={divContainerProps?.className}
      style={divContainerProps?.style}
      {...props}
    >
      Mock Xarrow
    </div>
  )),
  Xwrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="xwrapper">{children}</div>
}));

describe('EnhancedXarrow Component', () => {
  beforeEach(() => {
    // Mock SVG methods for testing
    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      value: () => 100,
      writable: true
    });
    
    // Mock document.querySelector for SVG
    const mockSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSVG.setAttribute('data-testid', 'xarrow');
    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === 'svg[data-testid="xarrow"]') {
        return mockSVG;
      }
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.8}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveAttribute('data-start', 'alice-1');
      expect(arrow).toHaveAttribute('data-end', 'bob-1');
    });

    it('should apply default props correctly', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveAttribute('data-stroke-width', '3');
      expect(arrow).toHaveClass('enhanced-xarrow');
      expect(arrow).toHaveClass('animated');
      expect(arrow).toHaveClass('flow');
      expect(arrow).toHaveClass('entanglement'); // Default connectionType
    });
  });

  describe('Fidelity-based Styling', () => {
    it('should apply fidelity-based colors for high fidelity', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.9}
            animated={false}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      // Should have greenish color for high fidelity
      expect(arrow).toHaveAttribute('data-line-color');
      const lineColor = arrow.getAttribute('data-line-color');
      expect(lineColor).toMatch(/rgb\(\d+, \d+, \d+\)/);
    });

    it('should apply grey colors for discarded items', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.8}
            willBeDiscarded={true}
            animated={false}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      const lineColor = arrow.getAttribute('data-line-color');
      expect(lineColor).toBe('rgb(180, 180, 180)');
    });

    it('should include fidelity in CSS custom properties', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.7}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow.style.getPropertyValue('--fidelity')).toBe('0.7');
      expect(arrow.style.getPropertyValue('--base-color')).toMatch(/rgb\(\d+, \d+, \d+\)/);
    });
  });

  describe('Animation Types', () => {
    it('should apply flow animation classes', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
            animationType="flow"
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveClass('flow');
      expect(arrow).toHaveClass('animated');
    });

    it('should apply pulse animation classes', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
            animationType="pulse"
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveClass('pulse');
      expect(arrow).toHaveClass('animated');
    });

    it('should disable animations when animated=false', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
            animated={false}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).not.toHaveClass('animated');
    });
  });

  describe('Path Types', () => {
    it('should handle straight path', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
            path="straight"
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveAttribute('path', 'straight');
    });

    it('should convert sine path to smooth', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
            path="sine"
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveAttribute('path', 'smooth');
    });
  });

  describe('Custom Props', () => {
    it('should merge divContainerProps correctly', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
            divContainerProps={{
              className: 'custom-class',
              style: { zIndex: 10 }
            }}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveClass('custom-class');
      expect(arrow).toHaveClass('enhanced-xarrow');
      expect(arrow.style.zIndex).toBe('10');
    });

    it('should handle labels prop', () => {
      const labels = { start: 'Start', end: 'End' };
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.5}
            labels={labels}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveAttribute('labels', '[object Object]');
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme fidelity values', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={-0.1}
            animated={false}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toBeInTheDocument();
      expect(arrow.style.getPropertyValue('--fidelity')).toBe('-0.1');
    });

    it('should handle fidelity > 1', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={1.5}
            animated={false}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toBeInTheDocument();
      expect(arrow.style.getPropertyValue('--fidelity')).toBe('1.5');
    });
  });

  describe('Integration Story', () => {
    it('tells the story of quantum entanglement visualization', () => {
      // High fidelity entangled pair - should be green and animated
      const { rerender } = render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.95}
            animationType="flow"
          />
        </Xwrapper>
      );

      let arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveClass('flow');
      expect(arrow.style.getPropertyValue('--fidelity')).toBe('0.95');

      // During CNOT operation - should pulse
      rerender(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="alice-2"
            fidelity={0.95}
            animationType="pulse"
            divContainerProps={{ className: 'cnot-connection' }}
          />
        </Xwrapper>
      );

      arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveClass('pulse');
      expect(arrow).toHaveClass('cnot-connection');

      // Failed measurement - should be discarded
      rerender(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="alice-2"
            fidelity={0.1}
            willBeDiscarded={true}
            animated={false}
            divContainerProps={{ className: 'measured-connection failed' }}
          />
        </Xwrapper>
      );

      arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveClass('failed');
      expect(arrow).not.toHaveClass('animated');
      expect(arrow.getAttribute('data-line-color')).toBe('rgb(180, 180, 180)');
    });
  });

  describe('Connection Types', () => {
    it('should use black color for CNOT connections', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="alice-2"
            fidelity={0.8}
            connectionType="cnot"
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveAttribute('data-line-color', 'black');
      expect(arrow).toHaveClass('cnot');
      expect(arrow).not.toHaveClass('animated'); // CNOT should not be animated
    });

    it('should use green color for successful measurements', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="alice-2"
            fidelity={0.8}
            connectionType="measurement"
            measurementSuccess={true}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveAttribute('data-line-color', 'rgb(46, 204, 113)');
      expect(arrow).toHaveClass('measurement');
    });

    it('should use red color for failed measurements', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="alice-2"
            fidelity={0.8}
            connectionType="measurement"
            measurementSuccess={false}
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveAttribute('data-line-color', 'rgb(231, 76, 60)');
      expect(arrow).toHaveClass('measurement');
    });

    it('should use fidelity-based colors for entanglement connections', () => {
      render(
        <Xwrapper>
          <EnhancedXarrow
            start="alice-1"
            end="bob-1"
            fidelity={0.9}
            connectionType="entanglement"
          />
        </Xwrapper>
      );

      const arrow = screen.getByTestId('mock-xarrow');
      expect(arrow).toHaveClass('entanglement');
      // Should have greenish color for high fidelity
      const lineColor = arrow.getAttribute('data-line-color');
      expect(lineColor).toMatch(/rgb\(\d+, \d+, \d+\)/);
      expect(lineColor).not.toBe('black');
    });
  });
}); 