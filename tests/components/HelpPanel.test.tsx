import { describe, expect, test } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import HelpPanel from '../../src/components/HelpPanel';

describe('HelpPanel', () => {
  test('renders keyboard shortcuts section', () => {
    render(<HelpPanel />);
    
    // Check that the keyboard shortcuts header is displayed
    expect(screen.getByText('Keyboard Shortcuts')).toBeDefined();
    
    // Test for all keyboard shortcuts
    expect(screen.getByText('N')).toBeDefined();
    expect(screen.getByText('Execute next step in the simulation')).toBeDefined();
    
    expect(screen.getByText('C')).toBeDefined();
    expect(screen.getByText('Complete the current round')).toBeDefined();
    
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('Run all steps until completion')).toBeDefined();
    
    expect(screen.getByText('R')).toBeDefined();
    expect(screen.getByText('Reset the simulation')).toBeDefined();
    
    expect(screen.getByText('P')).toBeDefined();
    expect(screen.getByText('Apply parameter changes')).toBeDefined();
    
    expect(screen.getByText('?')).toBeDefined();
    expect(screen.getByText('Toggle this help panel')).toBeDefined();
  });
  
  test('renders qubit interactions section', () => {
    render(<HelpPanel />);
    
    // Check that the qubit interactions header is displayed
    expect(screen.getByText('Qubit Interactions')).toBeDefined();
    
    // Test for all qubit interactions
    expect(screen.getByText('Hover')).toBeDefined();
    expect(screen.getByText('Hover on a qubit to view its density matrix')).toBeDefined();
    
    expect(screen.getByText('Click')).toBeDefined();
    expect(screen.getByText('Click on a qubit during CNOT stage to view the full 16x16 density matrix')).toBeDefined();
  });
  
  test('renders with correct styling classes', () => {
    const { container } = render(<HelpPanel />);
    
    // Check for the main classes
    expect(container.querySelector('.help-panel')).toBeDefined();
    expect(container.querySelector('.shortcuts-section')).toBeDefined();
    expect(container.querySelector('.shortcut-item')).toBeDefined();
    expect(container.querySelector('.key-badge')).toBeDefined();
    expect(container.querySelector('.action-badge')).toBeDefined();
    expect(container.querySelector('.key-description')).toBeDefined();
  });
}); 