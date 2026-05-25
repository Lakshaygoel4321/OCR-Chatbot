import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message with warning icon', () => {
    render(
      <ErrorMessage 
        message="Test error message" 
        onRetry={vi.fn()} 
        onDismiss={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(
      <ErrorMessage 
        message="Test error" 
        onRetry={onRetry} 
        onDismiss={vi.fn()} 
      />
    );
    
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorMessage 
        message="Test error" 
        onRetry={vi.fn()} 
        onDismiss={onDismiss} 
      />
    );
    
    const dismissButton = screen.getByText('Dismiss');
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(
      <ErrorMessage 
        message="Test error" 
        onDismiss={vi.fn()} 
      />
    );
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(
      <ErrorMessage 
        message="Test error" 
        onRetry={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument();
  });

  it('displays timestamp', () => {
    render(
      <ErrorMessage 
        message="Test error" 
        onRetry={vi.fn()} 
        onDismiss={vi.fn()} 
      />
    );
    
    // Check that a timestamp is rendered (format: HH:MM)
    const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timestamp).toBeInTheDocument();
  });

  it('applies glassmorphism styling', () => {
    const { container } = render(
      <ErrorMessage 
        message="Test error" 
        onRetry={vi.fn()} 
        onDismiss={vi.fn()} 
      />
    );
    
    const errorBubble = container.querySelector('.backdrop-blur-lg');
    expect(errorBubble).toBeInTheDocument();
  });
});
