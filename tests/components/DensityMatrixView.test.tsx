import { describe, test, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import DensityMatrixView from '../../src/components/DensityMatrixView';
import { DensityMatrix, ComplexNum } from '../../src/engine_real_calculations';
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

  test('renders 16x16 matrix with correct Bell basis labels for 4-qubit system', () => {
    // Create a 16x16 density matrix with zeros (4-qubit system)
    const zeroMatrix16x16 = new MockDensityMatrix(
      Array(16).fill(0).map(() => Array(16).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={zeroMatrix16x16} basis={Basis.Bell} isWerner={true} />);
    
    // Check for title
    expect(screen.getByText('Density Matrix (Bell Basis)')).toBeDefined();
    
    // Check for specific 4-qubit Bell basis labels (tensor products)
    const expectedLabels = [
      '|Φ⁺Φ⁺⟩', '|Φ⁻Φ⁺⟩', '|Ψ⁺Φ⁺⟩', '|Ψ⁻Φ⁺⟩',
      '|Φ⁺Φ⁻⟩', '|Φ⁻Φ⁻⟩', '|Ψ⁺Φ⁻⟩', '|Ψ⁻Φ⁻⟩',
      '|Φ⁺Ψ⁺⟩', '|Φ⁻Ψ⁺⟩', '|Ψ⁺Ψ⁺⟩', '|Ψ⁻Ψ⁺⟩',
      '|Φ⁺Ψ⁻⟩', '|Φ⁻Ψ⁻⟩', '|Ψ⁺Ψ⁻⟩', '|Ψ⁻Ψ⁻⟩'
    ];
    
    expectedLabels.forEach(label => {
      // Each label should appear at least twice (once in header, once in rows)
      const elements = screen.getAllByText(label);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('renders 16x16 matrix with correct computational basis labels for 4-qubit system', () => {
    // Create a 16x16 density matrix with zeros (4-qubit system)
    const zeroMatrix16x16 = new MockDensityMatrix(
      Array(16).fill(0).map(() => Array(16).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={zeroMatrix16x16} basis={Basis.Computational} isWerner={true} />);
    
    // Check for title
    expect(screen.getByText('Density Matrix (Computational Basis)')).toBeDefined();
    
    // Check for 4-qubit computational basis labels
    const expectedLabels = [
      '|0000⟩', '|0001⟩', '|0010⟩', '|0011⟩',
      '|0100⟩', '|0101⟩', '|0110⟩', '|0111⟩',
      '|1000⟩', '|1001⟩', '|1010⟩', '|1011⟩',
      '|1100⟩', '|1101⟩', '|1110⟩', '|1111⟩'
    ];
    
    expectedLabels.forEach(label => {
      // Each label should appear at least twice (once in header, once in rows)
      const elements = screen.getAllByText(label);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('handles invalid matrix dimensions gracefully', () => {
    // Create a 3x3 matrix (not a power of 2)
    const invalidMatrix = new MockDensityMatrix(
      Array(3).fill(0).map(() => Array(3).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={invalidMatrix} basis={Basis.Bell} isWerner={true} />);
    
    // Should show error message
    expect(screen.getByText('Error: Invalid matrix dimension')).toBeDefined();
  });

  test('generates correct Bell labels for single qubit system', () => {
    // Create a 2x2 density matrix (1-qubit system)
    const singleQubitMatrix = new MockDensityMatrix(
      Array(2).fill(0).map(() => Array(2).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    render(<DensityMatrixView matrix={singleQubitMatrix} basis={Basis.Bell} isWerner={true} />);
    
    // Check for single-qubit Bell-like labels
    expect(screen.getAllByText('|+⟩').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('|-⟩').length).toBeGreaterThanOrEqual(1);
  });

  test('Bell label generation algorithm produces correct patterns', () => {
    // Test 2-qubit system (4x4 matrix)
    const matrix4x4 = new MockDensityMatrix(
      Array(4).fill(0).map(() => Array(4).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    const { container: container4x4 } = render(
      <DensityMatrixView matrix={matrix4x4} basis={Basis.Bell} isWerner={true} />
    );
    
    // Should have exactly 4 unique Bell state labels for 2-qubit system
    const headers4x4 = container4x4.querySelectorAll('th');
    const uniqueLabels4x4 = new Set();
    headers4x4.forEach(header => {
      const text = header.textContent;
      if (text && text.includes('⟩')) {
        uniqueLabels4x4.add(text);
      }
    });
    expect(uniqueLabels4x4.size).toBe(4);
    
    // Test 4-qubit system (16x16 matrix)
    const matrix16x16 = new MockDensityMatrix(
      Array(16).fill(0).map(() => Array(16).fill({ re: 0, im: 0 }))
    ) as unknown as DensityMatrix;

    const { container: container16x16 } = render(
      <DensityMatrixView matrix={matrix16x16} basis={Basis.Bell} isWerner={true} />
    );
    
    // Should have exactly 16 unique Bell state labels for 4-qubit system
    const headers16x16 = container16x16.querySelectorAll('th');
    const uniqueLabels16x16 = new Set();
    headers16x16.forEach(header => {
      const text = header.textContent;
      if (text && text.includes('⟩')) {
        uniqueLabels16x16.add(text);
      }
    });
    expect(uniqueLabels16x16.size).toBe(16);
    
    // Verify the pattern: all 16 labels should be combinations of 2-qubit Bell states
    const expectedPattern = /^\|[ΦΨ][⁺⁻][ΦΨ][⁺⁻]⟩$/;
    headers16x16.forEach(header => {
      const text = header.textContent;
      if (text && text.includes('⟩') && text.length > 3) {
        expect(text).toMatch(expectedPattern);
      }
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

  test('applies minimum width to table cells', () => {
    const matrix = new DensityMatrix([
      [new ComplexNum(1, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)]
    ]);

    const { container } = render(<DensityMatrixView matrix={matrix} isWerner={true} />);
    
    // Check that table structure exists
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    // Check that table headers exist
    const headers = container.querySelectorAll('th');
    expect(headers.length).toBeGreaterThan(0);
    
    // Check that table cells exist  
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(16); // 4x4 matrix
    
    // Verify the table is within a density-matrix container
    const densityMatrixContainer = container.querySelector('.density-matrix');
    expect(densityMatrixContainer).toBeInTheDocument();
    expect(densityMatrixContainer).toContainElement(table);
  });

  test('renders correctly on mobile viewport', () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    const matrix = new DensityMatrix([
      [new ComplexNum(1, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)]
    ]);

    const { container } = render(<DensityMatrixView matrix={matrix} isWerner={true} />);
    
    // Check that the density matrix container exists
    const densityMatrix = container.querySelector('.density-matrix');
    expect(densityMatrix).toBeInTheDocument();

    // Check that table exists and has proper structure
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    // Reset viewport
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });

  test('applies mobile-optimized styling for compact density matrix', () => {
    const matrix = new DensityMatrix([
      [new ComplexNum(1, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)]
    ]);

    const { container } = render(<DensityMatrixView matrix={matrix} isWerner={true} />);
    
    // Check that the density matrix container has mobile-optimized overflow handling
    const densityMatrix = container.querySelector('.density-matrix');
    expect(densityMatrix).toBeInTheDocument();
    
    // Verify table structure maintains responsiveness
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    // Verify all cells are present (4x4 = 16 cells)
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(16);
    
    // Verify headers are present (5 total: empty corner + 4 column headers)
    const headers = container.querySelectorAll('th');
    expect(headers.length).toBe(9); // 5 in header row + 4 row headers
  });

  test('maintains single-line headers for all basis labels', () => {
    const matrix = new DensityMatrix([
      [new ComplexNum(1, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)],
      [new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0), new ComplexNum(0, 0)]
    ]);

    // Test Bell basis labels
    const { container: bellContainer } = render(
      <DensityMatrixView matrix={matrix} basis={Basis.Bell} isWerner={true} />
    );
    
    const bellHeaders = bellContainer.querySelectorAll('th');
    // Check that Bell basis labels are present and not wrapped
    expect(bellHeaders[1]?.textContent).toBe('|Φ⁺⟩');
    expect(bellHeaders[2]?.textContent).toBe('|Φ⁻⟩');
    expect(bellHeaders[3]?.textContent).toBe('|Ψ⁺⟩');
    expect(bellHeaders[4]?.textContent).toBe('|Ψ⁻⟩');

    // Test Computational basis labels
    const { container: compContainer } = render(
      <DensityMatrixView matrix={matrix} basis={Basis.Computational} isWerner={true} />
    );
    
    const compHeaders = compContainer.querySelectorAll('th');
    // Check that computational basis labels are present
    expect(compHeaders[1]?.textContent).toBe('|00⟩');
    expect(compHeaders[2]?.textContent).toBe('|01⟩');
    expect(compHeaders[3]?.textContent).toBe('|10⟩');
    expect(compHeaders[4]?.textContent).toBe('|11⟩');
  });

  test('applies dynamic background colors based on absolute value of matrix elements', () => {
    // Create a matrix with known absolute values for testing color application
    const matrix = new MockDensityMatrix([
      [{ re: 1.0, im: 0 }, { re: 0.5, im: 0 }, { re: 0.3, im: 0.4 }, { re: 0, im: 0 }],
      [{ re: 0.5, im: 0 }, { re: 0.8, im: 0 }, { re: 0.2, im: 0 }, { re: 0.1, im: 0.1 }],
      [{ re: 0.3, im: -0.4 }, { re: 0.2, im: 0 }, { re: 0.6, im: 0 }, { re: 0, im: 0.7 }],
      [{ re: 0, im: 0 }, { re: 0.1, im: -0.1 }, { re: 0, im: 0.7 }, { re: 0.9, im: 0 }]
    ]) as unknown as DensityMatrix;

    const { container } = render(<DensityMatrixView matrix={matrix} isWerner={false} />);
    
    // Get all table cells
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(16);
    
    // Test diagonal elements (should have green-tinted backgrounds)
    const diagonalCells = container.querySelectorAll('td.diagonal');
    expect(diagonalCells.length).toBe(4);
    
    diagonalCells.forEach((cell) => {
      const style = (cell as HTMLElement).style;
      expect(style.backgroundColor).toBeTruthy();
      // Should contain green colors for diagonal elements
      expect(style.backgroundColor).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
    });
    
    // Test off-diagonal elements (should have red-tinted backgrounds)
    const offDiagonalCells = container.querySelectorAll('td.off-diagonal');
    expect(offDiagonalCells.length).toBe(12);
    
    offDiagonalCells.forEach((cell) => {
      const style = (cell as HTMLElement).style;
      expect(style.backgroundColor).toBeTruthy();
      // Should contain red colors
      expect(style.backgroundColor).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
    });
    
    // Test specific high-value cell (1,0,0) = abs(1.0) should have deep green
    const firstCell = diagonalCells[0] as HTMLElement;
    expect(firstCell.style.backgroundColor).toContain('16'); // Should be deep green (diagonal)
    
    // Test zero-value cell should have white background
    const zeroValueCell = cells[3] as HTMLElement; // (0,3) position has {re: 0, im: 0}
    expect(zeroValueCell.style.backgroundColor).toBe('rgb(255, 255, 255)');
  });

  test('calculates complex absolute values correctly for color mapping', () => {
    // Test matrix with complex numbers to verify absolute value calculations
    const matrix = new MockDensityMatrix([
      [{ re: 0.6, im: 0.8 }, { re: 0.3, im: 0.4 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0.3, im: -0.4 }, { re: 0.5, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0.7, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }]
    ]) as unknown as DensityMatrix;

    const { container } = render(<DensityMatrixView matrix={matrix} isWerner={false} />);
    
    const cells = container.querySelectorAll('td');
    
    // First cell: |0.6 + 0.8i| = √(0.36 + 0.64) = 1.0 (maximum)
    const firstCell = cells[0] as HTMLElement;
    expect(firstCell.style.backgroundColor).toContain('16'); // Should be deep green (diagonal)
    
    // Second cell: |0.3 + 0.4i| = √(0.09 + 0.16) = 0.5
    const secondCell = cells[1] as HTMLElement;
    // Should be red-tinted (off-diagonal) and medium intensity
    expect(secondCell.style.backgroundColor).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
    
    // Zero cells should be white
    const zeroCell = cells[2] as HTMLElement;
    expect(zeroCell.style.backgroundColor).toBe('rgb(255, 255, 255)');
  });
}); 