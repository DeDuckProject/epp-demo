import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import Popup from '../../src/components/Popup';

describe('Popup Component', () => {
  const mockOnClose = vi.fn();
  
  afterEach(() => {
    mockOnClose.mockClear();
  });
  
  it('should not render when isOpen is false', () => {
    render(
      <Popup 
        title="Test Popup" 
        isOpen={false} 
        onClose={mockOnClose}
      >
        <div>Popup content</div>
      </Popup>
    );
    
    expect(screen.queryByText('Test Popup')).not.toBeInTheDocument();
    expect(screen.queryByText('Popup content')).not.toBeInTheDocument();
  });
  
  it('should render when isOpen is true', () => {
    render(
      <Popup 
        title="Test Popup" 
        isOpen={true} 
        onClose={mockOnClose}
      >
        <div>Popup content</div>
      </Popup>
    );
    
    expect(screen.getByText('Test Popup')).toBeInTheDocument();
    expect(screen.getByText('Popup content')).toBeInTheDocument();
  });
  
  it('should display subtitle when provided', () => {
    render(
      <Popup 
        title="Test Popup" 
        subtitle="This is a subtitle"
        isOpen={true} 
        onClose={mockOnClose}
      >
        <div>Popup content</div>
      </Popup>
    );
    
    expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
  });
  
  it('should call onClose when clicking the close button', () => {
    render(
      <Popup 
        title="Test Popup" 
        isOpen={true} 
        onClose={mockOnClose}
      >
        <div>Popup content</div>
      </Popup>
    );
    
    fireEvent.click(screen.getByText('×'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should call onClose when clicking the overlay', () => {
    render(
      <Popup 
        title="Test Popup" 
        isOpen={true} 
        onClose={mockOnClose}
      >
        <div>Popup content</div>
      </Popup>
    );
    
    // Click the overlay (the outer div with popup-overlay class)
    fireEvent.click(screen.getByTestId('popup-overlay'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should not close when clicking inside the popup content', () => {
    render(
      <Popup 
        title="Test Popup" 
        isOpen={true} 
        onClose={mockOnClose}
      >
        <div>Popup content</div>
      </Popup>
    );
    
    fireEvent.click(screen.getByText('Popup content'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });
}); 