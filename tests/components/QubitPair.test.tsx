import { describe, test, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QubitPair from '../../src/components/QubitPair';
import { DensityMatrix } from '../../src/engine_real_calculations/matrix/densityMatrix';
import { ComplexNum } from '../../src/engine_real_calculations/types/complex';
import {Basis} from "../../src/engine/types.ts";
import {toComputationalBasis} from "../../src/engine_real_calculations/bell/bell-basis.ts";

describe('QubitPair', () => {
  // Create a simple density matrix for testing
  const createTestMatrix = () => {
    // Create a 4x4 matrix with zeros
    const data = Array(4).fill(0).map(() => 
      Array(4).fill(0).map(() => ComplexNum.zero())
    );
    
    // Set some values on the diagonal for a valid density matrix
    data[0][0] = ComplexNum.fromReal(0.25);
    data[1][1] = ComplexNum.fromReal(0.25);
    data[2][2] = ComplexNum.fromReal(0.25);
    data[3][3] = ComplexNum.fromReal(0.25);
    
    return new DensityMatrix(data);
  };

  const mockMatrix = createTestMatrix();

  test('renders a qubit pair with correct basic properties', () => {
    const pair = {
      id: 42,
      fidelity: 0.12345,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    const { container } = render(
      <QubitPair pair={pair} location="alice" purificationStep="initial" />
    );

    // Check root element has correct classes
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.classList.contains('qubit-pair')).toBe(true);
    expect(rootElement.classList.contains('alice')).toBe(true);
    expect(rootElement.classList.contains('will-be-discarded')).toBe(false);
    
    // Check data attributes
    expect(rootElement.getAttribute('data-pair-id')).toBe('42');
    expect(rootElement.hasAttribute('data-partner-id')).toBe(false);
    
    // Check fidelity is displayed correctly
    expect(screen.getByText('0.123')).toBeDefined();
  });

  test('applies correct styling when marked as will be discarded', () => {
    const pair = {
      id: 1,
      fidelity: 0.75,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    const { container } = render(
      <QubitPair 
        pair={pair} 
        location="bob" 
        willBeDiscarded={true} 
        purificationStep="initial" 
      />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.classList.contains('will-be-discarded')).toBe(true);
    
    // Check styling - should use grey color for discarded pairs
    expect(rootElement.style.border).toContain('rgba(180, 180, 180, 0.5)');
    expect(rootElement.style.boxShadow).toBe('none');
  });

  test('does not show connection indicator when purification step is not in connection steps', () => {
    const pair = {
      id: 2,
      fidelity: 0.85,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    const { container } = render(
      <QubitPair 
        pair={pair} 
        location="alice" 
        pairRole="control" 
        purificationStep="initial" 
      />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.classList.contains('control-pair')).toBe(false);
    
    // Connection indicator should not be present
    const connectionIndicator = container.querySelector('.pair-role');
    expect(connectionIndicator).toBeNull();
  });

  test('shows connection indicator for control pair during CNOT step', () => {
    const pair = {
      id: 3,
      fidelity: 0.9,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    const { container } = render(
      <QubitPair 
        pair={pair} 
        location="alice" 
        pairRole="control" 
        partnerId={5}
        purificationStep="cnot" 
      />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.classList.contains('control-pair')).toBe(true);
    expect(rootElement.getAttribute('data-partner-id')).toBe('5');
    
    // Connection indicator should be present with control class
    const connectionIndicator = container.querySelector('.pair-role.control');
    expect(connectionIndicator).not.toBeNull();
  });

  test('shows connection indicator for target pair during measured step', () => {
    const pair = {
      id: 4,
      fidelity: 0.8,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    const { container } = render(
      <QubitPair 
        pair={pair} 
        location="bob" 
        pairRole="target" 
        partnerId={7}
        purificationStep="measured" 
      />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.classList.contains('target-pair')).toBe(true);
    expect(rootElement.getAttribute('data-partner-id')).toBe('7');
    
    // Connection indicator should be present with target class
    const connectionIndicator = container.querySelector('.pair-role.target');
    expect(connectionIndicator).not.toBeNull();
  });

  test('matrix popup appears on mouse enter and disappears on mouse leave', () => {
    const pair = {
      id: 6,
      fidelity: 0.95,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    const { container } = render(
      <QubitPair pair={pair} location="alice" purificationStep="initial" />
    );

    const rootElement = container.firstChild as HTMLElement;
    
    // Initially the matrix popup should not be visible
    expect(container.querySelector('.matrix-popup')).toBeNull();
    
    // Trigger mouse enter
    fireEvent.mouseEnter(rootElement);
    
    // Now the matrix popup should be visible
    const popup = container.querySelector('.matrix-popup');
    expect(popup).not.toBeNull();
    
    // Trigger mouse leave
    fireEvent.mouseLeave(rootElement);
    
    // The matrix popup should be hidden again
    expect(container.querySelector('.matrix-popup')).toBeNull();
  });

  test('maps fidelity to appropriate color gradient', () => {
    // Test with perfect fidelity
    const perfectPair = {
      id: 8,
      fidelity: 1.0,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    const { container: perfectContainer, rerender } = render(
      <QubitPair pair={perfectPair} location="alice" purificationStep="initial" />
    );

    // Since we don't know exactly how the browser will represent the hsla in the style attribute,
    // we'll check if the numerical value of hue for perfect fidelity is what we expect 
    // The component uses: hsla(${hue}, 80%, 60%, 0.8) where hue = Math.floor(120 * fidelity)
    
    // For perfect fidelity (1.0), hue should be 120 (green)
    expect(perfectContainer.querySelector('.qubit-pair')!.getAttribute('style'))
      .toContain('3px solid rgba(71, 235, 71, 0.8)');
    
    // Test with moderate fidelity (0.5)
    const moderatePair = {
      id: 9,
      fidelity: 0.5,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    rerender(
      <QubitPair pair={moderatePair} location="alice" purificationStep="initial" />
    );
    
    // For moderate fidelity (0.5), hue should be around 60 (yellow)
    expect(perfectContainer.querySelector('.qubit-pair')!.getAttribute('style'))
      .toContain('box-shadow: 0 0 7px rgba(46, 204, 113, 0.5); border: 3px solid rgba(235, 235, 71, 0.8)');
    
    // Test with low fidelity (0.1)
    const lowPair = {
      id: 10,
      fidelity: 0.1,
      densityMatrix: mockMatrix,
      basis: Basis.Bell
    };

    rerender(
      <QubitPair pair={lowPair} location="alice" purificationStep="initial" />
    );
    
    // For low fidelity (0.1), hue should be around 12 (reddish)
    expect(perfectContainer.querySelector('.qubit-pair')!.getAttribute('style'))
      .toContain('box-shadow: 0 0 1px rgba(46, 204, 113, 0.1); border: 3px solid rgba(235, 104, 71, 0.8)');
  });

  test('correctly handles Werner and non-Werner states based on density matrix', () => {
    // Create a Werner state matrix (diagonal in Bell basis)
    const wernerMatrixData = Array(4).fill(0).map(() => 
      Array(4).fill(0).map(() => ComplexNum.zero())
    );
    wernerMatrixData[0][0] = ComplexNum.fromReal(0.7);
    wernerMatrixData[1][1] = ComplexNum.fromReal(0.1);
    wernerMatrixData[2][2] = ComplexNum.fromReal(0.1);
    wernerMatrixData[3][3] = ComplexNum.fromReal(0.1);
    const wernerMatrix = new DensityMatrix(wernerMatrixData);
    
    // Create a non-Werner state matrix (with off-diagonal elements in Bell basis)
    const nonWernerMatrixData = Array(4).fill(0).map(() => 
      Array(4).fill(0).map(() => ComplexNum.zero())
    );
    nonWernerMatrixData[0][0] = ComplexNum.fromReal(0.7);
    nonWernerMatrixData[1][1] = ComplexNum.fromReal(0.1);
    nonWernerMatrixData[2][2] = ComplexNum.fromReal(0.1);
    nonWernerMatrixData[3][3] = ComplexNum.fromReal(0.1);
    // Add non-zero off-diagonal element
    nonWernerMatrixData[0][3] = ComplexNum.fromReal(0.05);
    nonWernerMatrixData[3][0] = ComplexNum.fromReal(0.05);
    const nonWernerMatrix = new DensityMatrix(nonWernerMatrixData);
    
    // Test with Werner state
    const wernerPair = {
      id: 10,
      fidelity: 0.9,
      densityMatrix: wernerMatrix,
      basis: Basis.Bell
    };
    
    const { container: wernerContainer, rerender } = render(
      <QubitPair pair={wernerPair} location="alice" purificationStep="initial" />
    );
    
    // Trigger mouse enter to show the matrix popup
    const wernerElement = wernerContainer.firstChild as HTMLElement;
    fireEvent.mouseEnter(wernerElement);
    
    // Check Werner indicator is present
    const wernerIndicator = wernerContainer.querySelector('.werner-indicator');
    expect(wernerIndicator).not.toBeNull();
    expect(wernerIndicator?.textContent).toContain('Werner');
    
    // Test with non-Werner state
    const nonWernerPair = {
      id: 11,
      fidelity: 0.85,
      densityMatrix: nonWernerMatrix,
      basis: Basis.Bell
    };
    
    rerender(
      <QubitPair pair={nonWernerPair} location="alice" purificationStep="initial" />
    );
    
    // Trigger mouse enter to show the matrix popup
    const nonWernerElement = wernerContainer.firstChild as HTMLElement;
    fireEvent.mouseEnter(nonWernerElement);
    
    // Check non-Werner indicator is present
    const nonWernerIndicator = wernerContainer.querySelector('.non-werner-indicator');
    expect(nonWernerIndicator).not.toBeNull();
    expect(nonWernerIndicator?.textContent).toContain('Non-Werner');
  });
  
  test('isWerner calculation respects specified basis', () => {
    // Create a Werner state matrix in bell basis
    const wernerMatrixData = Array(4).fill(0).map(() => 
      Array(4).fill(0).map(() => ComplexNum.zero())
    );
    wernerMatrixData[0][0] = ComplexNum.fromReal(0.7);
    wernerMatrixData[1][1] = ComplexNum.fromReal(0.1);
    wernerMatrixData[2][2] = ComplexNum.fromReal(0.1);
    wernerMatrixData[3][3] = ComplexNum.fromReal(0.1);
    const wernerMatrix = new DensityMatrix(wernerMatrixData);
    
    const pair = {
      id: 12,
      fidelity: 0.9,
      densityMatrix: wernerMatrix,
      basis: Basis.Bell
    };
    
    // Render with Bell basis (default)
    const { container: bellContainer, rerender } = render(
      <QubitPair pair={pair} location="alice" purificationStep="initial" />
    );
    
    // Trigger mouse enter to show the matrix popup
    const bellElement = bellContainer.firstChild as HTMLElement;
    fireEvent.mouseEnter(bellElement);
    
    // Check Werner indicator is present when using bell basis
    const wernerIndicatorBell = bellContainer.querySelector('.werner-indicator');
    expect(wernerIndicatorBell).not.toBeNull();

    pair.densityMatrix = new DensityMatrix(toComputationalBasis(pair.densityMatrix));
    pair.basis = Basis.Computational;
    // Render with computational basis explicitly specified
    rerender(
      <QubitPair 
        pair={pair} 
        location="alice" 
        purificationStep="initial"
      />
    );
    
    // Trigger mouse enter to show the matrix popup
    const compElement = bellContainer.firstChild as HTMLElement;
    fireEvent.mouseEnter(compElement);
    
    // Check the basis text in the title is correct
    const matrixTitle = bellContainer.querySelector('.matrix-title');
    expect(matrixTitle?.textContent).toContain('Computational Basis');
    
    // The Werner state check should still work correctly with computational basis specified
    const wernerIndicatorComp = bellContainer.querySelector('.werner-indicator');
    expect(wernerIndicatorComp).not.toBeNull();
  });
}); 