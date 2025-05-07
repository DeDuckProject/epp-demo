import { describe, expect, test } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import HelpPanel from '../../src/components/HelpPanel';

describe('HelpPanel', () => {
  test('renders keyboard shortcuts section', () => {
    render(<HelpPanel />);
    
    // Check that the keyboard shortcuts header is displayed
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    
    // Test for all keyboard shortcuts
    expect(screen.getByText('N')).toBeInTheDocument();
    expect(screen.getByText('Execute next step in the simulation')).toBeInTheDocument();
    
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Complete the current round')).toBeInTheDocument();
    
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Run all steps until completion')).toBeInTheDocument();
    
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('Reset the simulation')).toBeInTheDocument();
    
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('Apply parameter changes')).toBeInTheDocument();
    
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('Toggle this help panel')).toBeInTheDocument();
  });
  
  test('renders qubit interactions section', () => {
    render(<HelpPanel />);
    
    // Check that the qubit interactions header is displayed
    expect(screen.getByText('Qubit Interactions')).toBeInTheDocument();
    
    // Test for all qubit interactions
    expect(screen.getByText('Hover')).toBeInTheDocument();
    expect(screen.getByText('Hover on a qubit to view its density matrix')).toBeInTheDocument();
    
    expect(screen.getByText('Click')).toBeInTheDocument();
    expect(screen.getByText('Click on a qubit during CNOT stage to view the full 16x16 density matrix')).toBeInTheDocument();
  });
  
  test('renders with correct styling classes', () => {
    const { container } = render(<HelpPanel />);
    
    // Check for the main classes
    expect(container.querySelector('.help-panel')).toBeInTheDocument();
    expect(container.querySelector('.shortcuts-section')).toBeInTheDocument();
    expect(container.querySelector('.shortcut-item')).toBeInTheDocument();
    expect(container.querySelector('.key-badge')).toBeInTheDocument();
    expect(container.querySelector('.action-badge')).toBeInTheDocument();
    expect(container.querySelector('.key-description')).toBeInTheDocument();
  });
}); 