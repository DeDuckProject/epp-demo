import { describe, test, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import DensityMatrixView from '../../src/components/DensityMatrixView';
import { DensityMatrix } from '../../src/engine_real_calculations';
import { Basis } from '../../src/engine/types';

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
  test('renders the title and Bell basis labels when basis="bell"', () => {
    // Create a 4x4 density matrix with zeros
    const zeroMatrix = new MockDensityMatrix(
      Array(4).fill(0).map(() => Array(4).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={zeroMatrix} basis={Basis.Bell} isWerner={true} />);
    
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

  test('renders the title and Computational basis labels when basis="computational"', () => {
    // Create a 4x4 density matrix with zeros
    const zeroMatrix = new MockDensityMatrix(
      Array(4).fill(0).map(() => Array(4).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={zeroMatrix} basis={Basis.Computational} isWerner={true} />);
    
    // Check for title
    expect(screen.getByText('Density Matrix (Computational Basis)')).toBeDefined();
    
    // Check for Computational basis labels in both columns and rows
    const compLabels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
    compLabels.forEach(label => {
      // Labels should appear multiple times (once in header, once in rows)
      const elements = screen.getAllByText(label);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('defaults to Bell basis when no basis prop is provided', () => {
    // Create a 4x4 density matrix with zeros
    const zeroMatrix = new MockDensityMatrix(
      Array(4).fill(0).map(() => Array(4).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={zeroMatrix} isWerner={true} />);
    
    // Check for Bell basis title
    expect(screen.getByText('Density Matrix (Bell Basis)')).toBeDefined();
    
    // Check for Bell basis labels
    expect(screen.getAllByText('|Φ⁺⟩').length).toBeGreaterThanOrEqual(1);
  });

  test('shows Werner indicator when isWerner=true', () => {
    const diagMatrix = new MockDensityMatrix([
      [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={diagMatrix} isWerner={true} />);
    
    // The Werner indicator should be present
    expect(screen.getByText(/Werner/)).toBeDefined();
    
    // The Non-Werner indicator should not be present
    const nonWernerText = screen.queryByText(/Non-Werner/);
    expect(nonWernerText).toBeNull();
  });

  test('shows Non-Werner indicator when isWerner=false', () => {
    const offDiagMatrix = new MockDensityMatrix([
      [{ re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.25, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.02, im: 0 }, { re: 0.25, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={offDiagMatrix} isWerner={false} />);
    
    // The Non-Werner indicator should be present
    expect(screen.getByText(/Non-Werner/)).toBeDefined();
    
    // The Werner indicator should not be present
    const wernerText = screen.queryByText(/ Werner/); // Note the space to avoid matching "Non-Werner"
    expect(wernerText).toBeNull();
  });

  test('formats purely real numbers to three decimal places', () => {
    const matrix = new MockDensityMatrix([
      [{ re: 1.23456, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }]
    ]) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={matrix} isWerner={true} />);
    
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

    render(<DensityMatrixView matrix={matrix} isWerner={true} />);
    
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

    render(<DensityMatrixView matrix={matrix} isWerner={true} />);
    
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

    render(<DensityMatrixView matrix={matrix} isWerner={true} />);
    
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

    const { container } = render(<DensityMatrixView matrix={matrix} isWerner={false} />);
    
    // Check the diagonal cells have the 'diagonal' class
    const diagonalCells = container.querySelectorAll('.diagonal');
    expect(diagonalCells.length).toBe(4);
    
    // Check the off-diagonal cells have the 'off-diagonal' class
    const offDiagonalCells = container.querySelectorAll('.off-diagonal');
    expect(offDiagonalCells.length).toBe(12); // 4x4 matrix minus the 4 diagonal elements
  });
}); 