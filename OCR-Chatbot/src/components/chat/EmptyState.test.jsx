import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from './EmptyState';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Helper to render with theme context
const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('EmptyState', () => {
  it('renders welcome message', () => {
    renderWithTheme(<EmptyState />);
    
    expect(screen.getByText('Welcome to AI Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Start a conversation, upload an image for OCR/)).toBeInTheDocument();
  });

  it('renders all suggested prompts', () => {
    renderWithTheme(<EmptyState />);
    
    expect(screen.getByText('Extract text from an image')).toBeInTheDocument();
    expect(screen.getByText('Transcribe audio to text')).toBeInTheDocument();
    expect(screen.getByText('Ask me anything')).toBeInTheDocument();
    expect(screen.getByText('Help me with a task')).toBeInTheDocument();
  });

  it('calls onPromptSelect when a prompt chip is clicked', () => {
    const mockOnPromptSelect = vi.fn();
    renderWithTheme(<EmptyState onPromptSelect={mockOnPromptSelect} />);
    
    const promptButton = screen.getByText('Extract text from an image');
    fireEvent.click(promptButton);
    
    expect(mockOnPromptSelect).toHaveBeenCalledWith('Extract text from an image');
    expect(mockOnPromptSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onPromptSelect with correct text for each prompt', () => {
    const mockOnPromptSelect = vi.fn();
    renderWithTheme(<EmptyState onPromptSelect={mockOnPromptSelect} />);
    
    // Test first prompt
    fireEvent.click(screen.getByText('Extract text from an image'));
    expect(mockOnPromptSelect).toHaveBeenLastCalledWith('Extract text from an image');
    
    // Test second prompt
    fireEvent.click(screen.getByText('Transcribe audio to text'));
    expect(mockOnPromptSelect).toHaveBeenLastCalledWith('Transcribe audio to text');
    
    // Test third prompt
    fireEvent.click(screen.getByText('Ask me anything'));
    expect(mockOnPromptSelect).toHaveBeenLastCalledWith('Ask me anything');
    
    // Test fourth prompt
    fireEvent.click(screen.getByText('Help me with a task'));
    expect(mockOnPromptSelect).toHaveBeenLastCalledWith('Help me with a task');
    
    expect(mockOnPromptSelect).toHaveBeenCalledTimes(4);
  });

  it('renders AI assistant icon', () => {
    const { container } = renderWithTheme(<EmptyState />);
    
    // Check for the Sparkles icon (lucide-react renders as svg)
    const sparklesIcon = container.querySelector('svg');
    expect(sparklesIcon).toBeInTheDocument();
  });

  it('renders prompt descriptions', () => {
    renderWithTheme(<EmptyState />);
    
    expect(screen.getByText('Upload an image to extract text using OCR')).toBeInTheDocument();
    expect(screen.getByText('Upload audio to convert speech to text')).toBeInTheDocument();
    expect(screen.getByText('Start a conversation with the AI assistant')).toBeInTheDocument();
    expect(screen.getByText('Get assistance with your work or questions')).toBeInTheDocument();
  });

  it('renders hint text at the bottom', () => {
    renderWithTheme(<EmptyState />);
    
    expect(screen.getByText(/You can also type your own message/)).toBeInTheDocument();
  });

  it('does not crash when onPromptSelect is not provided', () => {
    renderWithTheme(<EmptyState />);
    
    const promptButton = screen.getByText('Extract text from an image');
    
    // Should not throw error
    expect(() => {
      fireEvent.click(promptButton);
    }).not.toThrow();
  });
});
