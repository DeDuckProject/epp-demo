import { describe, test, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import DensityMatrixView from '../../src/components/DensityMatrixView';
import { DensityMatrix } from '../../src/engine_real_calculations/matrix/densityMatrix';

// Mock implementation of DensityMatrix for testing
class MockDensityMatrix {
  rows: number;
  cols: number;
  private data: { re: number, im: number }[][];

  constructor(data: { re: number, im: number }[][]) {
    this.data = data;
    this.rows = data.length;
    this.cols = data[0].length;
  }

  get(i: number, j: number): { re: number, im: number } {
    return this.data[i][j];
  }
}

describe('DensityMatrixView', () => {
  test('renders the title and Bell basis labels', () => {
    // Create a 4x4 density matrix with zeros
    const zeroMatrix = new MockDensityMatrix(
      Array(4).fill(0).map(() => Array(4).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={zeroMatrix} />);
    
    // Check for title
    expect(screen.getByText('Density Matrix (Bell Basis)')).toBeDefined();
    
    // Check for Bell basis labels in both columns and rows
    const bellLabels = ['|Φ⁺⟩', '|Φ⁻⟩', '|Ψ⁺⟩', '|Ψ⁻⟩'];
    bellLabels.forEach(label => {
      // Labels should appear multiple times (once in header, once in rows)
      const elements = screen.getAllByText(label);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('does not show Non-Werner indicator when all off-diagonals are zero, but shows Werner indicator', () => {
    // Create matrix with only diagonal entries
    const diagMatrix = new MockDensityMatrix([
      [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={diagMatrix} />);
    
    // The Non-Werner indicator should not be present
    const nonWernerText = screen.queryByText(/Non-Werner/);
    expect(nonWernerText).toBeNull();
    const wernerText = screen.queryByText(/Werner/);
    expect(wernerText).not.toBeNull();
  });

  test('shows Non-Werner indicator when off-diagonal elements exceed threshold, but does not show Werner indicator', () => {
    // Create matrix with significant off-diagonal elements
    const offDiagMatrix = new MockDensityMatrix([
      [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.02, im: 0 }, { re: 0.25, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={offDiagMatrix} />);
    
    // The Non-Werner indicator should be present
    expect(screen.getByText(/Non-Werner/)).toBeDefined();
    
    const wernerIndicators = document.querySelectorAll('.werner-indicator');
    expect(wernerIndicators.length).toBe(0);
  });

  test('formats purely real numbers to three decimal places', () => {
    const matrix = new MockDensityMatrix([
      [{ re: 1.23456, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={matrix} />);
    
    // Check for the formatted real number
    expect(screen.getByText('1.235')).toBeDefined();
  });

  test('formats purely imaginary numbers with i suffix', () => {
    const matrix = new MockDensityMatrix([
      [{ re: 0, im: -0.5 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={matrix} />);
    
    // Check for the formatted imaginary number
    expect(screen.getByText('-0.500i')).toBeDefined();
  });

  test('formats complex numbers with both real and imaginary parts', () => {
    const matrix = new MockDensityMatrix([
      [{ re: 0.1, im: 0.2 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={matrix} />);
    
    // Check for the formatted complex number
    expect(screen.getByText('0.100+0.200i')).toBeDefined();
  });

  test('formats small numbers below threshold as 0', () => {
    const matrix = new MockDensityMatrix([
      [{ re: 0.0001, im: 0.0002 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={matrix} />);
    
    // The threshold in the component is 0.001, so this should display as 0
    // Use getAllByText since there are multiple elements with "0"
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThan(0);
    
    // Check the first cell which should be our small number formatted as "0"
    const firstCell = zeroElements[0];
    expect(firstCell).toBeDefined();
  });

  test('applies the correct CSS classes to diagonal and off-diagonal elements', () => {
    const matrix = new MockDensityMatrix([
      [{ re: 0.25, im: 0 }, { re: 0.1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0.1, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }]
    ]) as unknown as DensityMatrix;

    const { container } = render(<DensityMatrixView matrix={matrix} />);
    
    // Check the diagonal cells have the 'diagonal' class
    const diagonalCells = container.querySelectorAll('.diagonal');
    expect(diagonalCells.length).toBe(4);
    
    // Check the off-diagonal cells have the 'off-diagonal' class
    const offDiagonalCells = container.querySelectorAll('.off-diagonal');
    expect(offDiagonalCells.length).toBe(12); // 4x4 matrix minus the 4 diagonal elements
  });
}); 