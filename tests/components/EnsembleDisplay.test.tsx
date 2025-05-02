import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import EnsembleDisplay from '../../src/components/EnsembleDisplay';
import {Basis} from "../../src/engine/types.ts";

// Mock the QubitPair component to simplify testing
vi.mock('../../src/components/QubitPair', () => ({
  default: vi.fn(({ pair, location, willBeDiscarded, pairRole, partnerId, purificationStep }) => (
    <div 
      data-testid="qubit-pair-mock" 
      data-pair-id={pair.id}
      data-location={location}
      data-will-be-discarded={willBeDiscarded ? 'true' : 'false'}
      data-pair-role={pairRole}
      data-partner-id={partnerId}
      data-step={purificationStep}
    >
      {pair.fidelity.toFixed(3)}
    </div>
  ))
}));

describe('EnsembleDisplay', () => {
  // Test data
  const createTestPairs = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      fidelity: 0.7 + (i * 0.05),
      densityMatrix: {} as any,
      basis: Basis.Bell
    }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders each pair for both Alice and Bob in the initial step', () => {
    const testPairs = createTestPairs(2);
    
    const { container } = render(
      <EnsembleDisplay 
        pairs={testPairs} 
        purificationStep="initial" 
      />
    );
    
    // Check that we rendered the correct number of QubitPair components
    const qubitPairs = screen.getAllByTestId('qubit-pair-mock');
    expect(qubitPairs).toHaveLength(4); // 2 pairs, each rendered for Alice and Bob
    
    // Check Alice's pairs
    const aliceRow = container.querySelector('.alice-row');
    expect(aliceRow).not.toBeNull();
    expect(aliceRow?.querySelectorAll('[data-testid="qubit-pair-mock"]')).toHaveLength(2);
    
    // Check Bob's pairs
    const bobRow = container.querySelector('.bob-row');
    expect(bobRow).not.toBeNull();
    expect(bobRow?.querySelectorAll('[data-testid="qubit-pair-mock"]')).toHaveLength(2);
    
    // Check that entanglement lines are rendered
    const entanglementLines = container.querySelectorAll('.entanglement-line');
    expect(entanglementLines).toHaveLength(2);
    
    // Check that no lines are marked for discard in the initial step
    const discardedLines = container.querySelectorAll('.entanglement-line.will-be-discarded');
    expect(discardedLines).toHaveLength(0);
  });

  test('identifies control and target pairs correctly in CNOT step', () => {
    const testPairs = createTestPairs(3);
    const pendingPairs = {
      controlPairs: [testPairs[0]],
      targetPairs: [testPairs[1]],
    };
    
    render(
      <EnsembleDisplay 
        pairs={testPairs} 
        pendingPairs={pendingPairs}
        purificationStep="cnot" 
      />
    );
    
    // Get all QubitPair mocks
    const qubitPairs = screen.getAllByTestId('qubit-pair-mock');
    
    // Find control pairs - should be marked for both Alice and Bob sides
    const controlPairs = qubitPairs.filter(el => el.getAttribute('data-pair-role') === 'control');
    expect(controlPairs).toHaveLength(2);
    expect(controlPairs[0].getAttribute('data-pair-id')).toBe('1');
    expect(controlPairs[1].getAttribute('data-pair-id')).toBe('1');
    
    // Find target pairs - should be marked for both Alice and Bob sides
    const targetPairs = qubitPairs.filter(el => el.getAttribute('data-pair-role') === 'target');
    expect(targetPairs).toHaveLength(2);
    expect(targetPairs[0].getAttribute('data-pair-id')).toBe('2');
    expect(targetPairs[1].getAttribute('data-pair-id')).toBe('2');
    
    // For pairs that are neither control nor target, role should not be set
    const neutralPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '3');
    expect(neutralPairs).toHaveLength(2);
    expect(neutralPairs[0].getAttribute('data-pair-role')).toBeNull();
    expect(neutralPairs[1].getAttribute('data-pair-role')).toBeNull();
    
    // Check that partner IDs are correctly set
    controlPairs.forEach(el => {
      expect(el.getAttribute('data-partner-id')).toBe('2');
    });
    
    targetPairs.forEach(el => {
      expect(el.getAttribute('data-partner-id')).toBe('1');
    });
  });

  test('marks pairs correctly for discard in the measured step', () => {
    const testPairs = createTestPairs(3);
    const pendingPairs = {
      controlPairs: [testPairs[0], testPairs[2]],
      targetPairs: [testPairs[1]],
      results: [
        { control: testPairs[0], successful: true },
        { control: testPairs[2], successful: false }
      ]
    };
    
    const { container } = render(
      <EnsembleDisplay 
        pairs={testPairs} 
        pendingPairs={pendingPairs}
        purificationStep="measured" 
      />
    );
    
    // Get all QubitPair mocks
    const qubitPairs = screen.getAllByTestId('qubit-pair-mock');
    
    // Target pairs should always be marked for discard
    const targetPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '2');
    expect(targetPairs).toHaveLength(2); // One for Alice, one for Bob
    targetPairs.forEach(el => {
      expect(el.getAttribute('data-will-be-discarded')).toBe('true');
    });
    
    // Successful control pair should not be marked for discard
    const successfulPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '1');
    expect(successfulPairs).toHaveLength(2);
    successfulPairs.forEach(el => {
      expect(el.getAttribute('data-will-be-discarded')).toBe('false');
    });
    
    // Failed control pair should be marked for discard
    const failedPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '3');
    expect(failedPairs).toHaveLength(2);
    failedPairs.forEach(el => {
      expect(el.getAttribute('data-will-be-discarded')).toBe('true');
    });
    
    // Check entanglement lines - the ones for discarded pairs should have the class
    const entanglementLines = container.querySelectorAll('.entanglement-line');
    expect(entanglementLines).toHaveLength(3);
    
    const discardedLines = container.querySelectorAll('.entanglement-line.will-be-discarded');
    expect(discardedLines).toHaveLength(2); // For pairs 2 and 3
  });

  test('handles unbalanced pendingPairs arrays gracefully', () => {
    const testPairs = createTestPairs(3);
    const unbalancedPendingPairs = {
      controlPairs: [testPairs[0], testPairs[1]],
      targetPairs: [testPairs[2]] // Only one target for two controls
    };
    
    render(
      <EnsembleDisplay 
        pairs={testPairs} 
        pendingPairs={unbalancedPendingPairs}
        purificationStep="cnot" 
      />
    );
    
    // Get all QubitPair mocks
    const qubitPairs = screen.getAllByTestId('qubit-pair-mock');
    
    // Partner ID for the first control pair should be 3
    const firstControlPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '1');
    expect(firstControlPairs).toHaveLength(2);
    firstControlPairs.forEach(el => {
      expect(el.getAttribute('data-partner-id')).toBe('3');
    });
    
    // Partner ID for the second control pair should be undefined (no target)
    const secondControlPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '2');
    expect(secondControlPairs).toHaveLength(2);
    secondControlPairs.forEach(el => {
      expect(el.getAttribute('data-partner-id')).toBeNull();
    });
  });

  test('handles missing results in the measured step gracefully', () => {
    const testPairs = createTestPairs(2);
    const pendingPairsNoResults = {
      controlPairs: [testPairs[0]],
      targetPairs: [testPairs[1]],
      // No results provided
    };
    
    render(
      <EnsembleDisplay 
        pairs={testPairs} 
        pendingPairs={pendingPairsNoResults}
        purificationStep="measured" 
      />
    );
    
    // Get all QubitPair mocks
    const qubitPairs = screen.getAllByTestId('qubit-pair-mock');
    
    // Target pairs should still be marked for discard even without results
    const targetPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '2');
    targetPairs.forEach(el => {
      expect(el.getAttribute('data-will-be-discarded')).toBe('true');
    });
    
    // Control pairs should not be marked for discard when results are missing
    const controlPairs = qubitPairs.filter(el => el.getAttribute('data-pair-id') === '1');
    controlPairs.forEach(el => {
      expect(el.getAttribute('data-will-be-discarded')).toBe('false');
    });
  });

  test('creates an SVG container for connection drawings in appropriate steps', () => {
    const testPairs = createTestPairs(2);
    
    // Test with initial step - should not show SVG for connections
    const { rerender, container } = render(
      <EnsembleDisplay 
        pairs={testPairs} 
        purificationStep="initial" 
      />
    );
    
    let svgContainer = container.querySelector('.pair-connections-svg');
    expect(svgContainer).not.toBeNull(); // SVG element is always rendered
    
    // Check that the SVG doesn't contain any connection elements yet
    expect(svgContainer?.children.length).toBe(0);
    
    // Test with CNOT step - should create SVG for connections
    const pendingPairs = {
      controlPairs: [testPairs[0]],
      targetPairs: [testPairs[1]]
    };
    
    rerender(
      <EnsembleDisplay 
        pairs={testPairs} 
        pendingPairs={pendingPairs}
        purificationStep="cnot" 
      />
    );
    
    svgContainer = container.querySelector('.pair-connections-svg');
    expect(svgContainer).not.toBeNull();
    
    // The SVG should have the ref applied but the mock for drawing DOM elements won't be called
    // in the test environment since it relies on getBoundingClientRect() and other DOM APIs
  });
}); 