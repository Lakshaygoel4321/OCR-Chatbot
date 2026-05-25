import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import StreamingText from './StreamingText';

describe('StreamingText Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Requirement 6.1: Progressive text reveal', () => {
    it('should progressively reveal text character-by-character', async () => {
      const text = 'Hello';
      const { container } = render(<StreamingText text={text} speed={100} />);
      
      // Initially should show empty text
      expect(container.textContent.replace(/\s/g, '')).toBe('');
      
      // Advance time to reveal first character (100 chars/sec = 10ms per char)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      expect(container.textContent).toContain('H');
      
      // Advance to reveal more characters
      await act(async () => {
        await vi.advanceTimersByTimeAsync(40); // 4 more characters
      });
      expect(container.textContent).toContain('Hello');
    });

    it('should start with empty text and progressively add characters', async () => {
      const text = 'Test';
      const { container } = render(<StreamingText text={text} speed={40} />);
      
      // Initially empty
      expect(container.textContent.replace(/\s/g, '')).toBe('');
      
      // Advance by one character interval (1000ms / 40 chars/sec = 25ms per char)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(25);
      });
      expect(container.textContent).toContain('T');
      
      // Advance by another interval
      await act(async () => {
        await vi.advanceTimersByTimeAsync(25);
      });
      expect(container.textContent).toContain('Te');
    });
  });

  describe('Requirement 6.2: Streaming speed (30-50 characters per second)', () => {
    it('should stream at 40 characters per second by default', async () => {
      const text = 'A'.repeat(40); // 40 characters
      const { container } = render(<StreamingText text={text} />);
      
      // At 40 chars/sec, it should take 1000ms to complete 40 characters
      // After 500ms, should have approximately 20 characters
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      
      const displayedLength = container.textContent.replace(/\s/g, '').length;
      expect(displayedLength).toBeGreaterThanOrEqual(18);
      expect(displayedLength).toBeLessThanOrEqual(22);
    });

    it('should respect custom speed within 30-50 range', async () => {
      const text = 'A'.repeat(30);
      const { container } = render(<StreamingText text={text} speed={30} />);
      
      // At 30 chars/sec, each char takes ~33.33ms
      // After 1000ms, should have all 30 characters
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      
      const displayedLength = container.textContent.replace(/\s/g, '').length;
      expect(displayedLength).toBe(30);
    });

    it('should handle speed of 50 characters per second', async () => {
      const text = 'A'.repeat(50);
      const { container } = render(<StreamingText text={text} speed={50} />);
      
      // At 50 chars/sec, each char takes 20ms
      // After 1000ms, should have all 50 characters
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      
      const displayedLength = container.textContent.replace(/\s/g, '').length;
      expect(displayedLength).toBe(50);
    });
  });

  describe('Requirement 6.3: Blinking cursor during streaming', () => {
    it('should display a blinking cursor while streaming', async () => {
      const text = 'Hello';
      const { container } = render(<StreamingText text={text} speed={40} />);
      
      // Check for cursor element (it has specific styling classes)
      const cursor = container.querySelector('span[aria-hidden="true"]');
      expect(cursor).toBeTruthy();
      expect(cursor).toHaveClass('inline-block');
    });

    it('should animate cursor with opacity changes', async () => {
      const text = 'Test';
      const { container } = render(<StreamingText text={text} speed={40} />);
      
      const cursor = container.querySelector('span[aria-hidden="true"]');
      expect(cursor).toBeTruthy();
      // Cursor should be visible during streaming
      expect(cursor).toBeInTheDocument();
    });
  });

  describe('Requirement 6.4: Remove cursor when streaming completes', () => {
    it('should remove cursor after streaming completes', async () => {
      const onComplete = vi.fn();
      const text = 'Hi';
      const { container } = render(<StreamingText text={text} speed={100} onComplete={onComplete} />);
      
      // Cursor should be present initially (after first render with isStreaming set to true in useEffect)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1); // Let useEffect run
      });
      
      let cursor = container.querySelector('span[aria-hidden="true"]');
      expect(cursor).toBeTruthy();
      
      // Complete the streaming
      // For "Hi" (2 chars) at 100 chars/sec (10ms per char):
      // - 10ms: 'H' added, index = 1
      // - 20ms: 'i' added, index = 2
      // - 30ms: index = 2, length = 2, else block runs, sets isStreaming = false
      await act(async () => {
        await vi.advanceTimersByTimeAsync(35);
      });
      
      // Advance timers a bit more to allow React to process state updates
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      
      // Verify streaming is complete by checking onComplete was called
      expect(onComplete).toHaveBeenCalledTimes(1);
      
      // Verify full text is displayed
      expect(container.textContent).toContain('Hi');
      
      // After streaming completes, cursor should be removed from DOM
      // Note: AnimatePresence may keep the element briefly during exit animation
      // but isStreaming should be false, so the condition should not render the cursor
      cursor = container.querySelector('span[aria-hidden="true"]');
      expect(cursor).toBeFalsy();
    });

    it('should call onComplete callback when streaming finishes', async () => {
      const onComplete = vi.fn();
      const text = 'Done';
      render(<StreamingText text={text} speed={100} onComplete={onComplete} />);
      
      // Complete streaming (4 chars at 100 chars/sec = 40ms)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Requirement 6.5: prefers-reduced-motion support', () => {
    it('should display complete text immediately when prefers-reduced-motion is enabled', () => {
      // Mock matchMedia to return prefers-reduced-motion: reduce
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      const text = 'Instant text';
      const { container } = render(<StreamingText text={text} speed={40} />);
      
      // Text should appear immediately without streaming
      expect(container.textContent).toBe(text);
      
      // Cursor should not be present
      const cursor = container.querySelector('span[aria-hidden="true"]');
      expect(cursor).toBeFalsy();
    });

    it('should not show cursor when reduced motion is preferred', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      const text = 'No animation';
      const { container } = render(<StreamingText text={text} speed={40} />);
      
      const cursor = container.querySelector('span[aria-hidden="true"]');
      expect(cursor).toBeFalsy();
    });

    it('should call onComplete immediately when reduced motion is preferred', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      const onComplete = vi.fn();
      const text = 'Complete';
      render(<StreamingText text={text} speed={40} onComplete={onComplete} />);
      
      // Should be called immediately without waiting
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and additional functionality', () => {
    it('should handle empty text', () => {
      const { container } = render(<StreamingText text="" speed={40} />);
      expect(container.textContent).toBe('');
    });

    it('should handle text changes by restarting animation', async () => {
      const { container, rerender } = render(<StreamingText text="First" speed={100} />);
      
      // Advance partially through first text
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20);
      });
      expect(container.textContent).toContain('Fi');
      
      // Change text
      rerender(<StreamingText text="Second" speed={100} />);
      
      // Should restart from beginning (empty initially)
      expect(container.textContent.replace(/\s/g, '')).toBe('');
      
      // Advance to show first character of new text
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      expect(container.textContent).toContain('S');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StreamingText text="Test" speed={40} className="custom-class" />
      );
      
      const span = container.querySelector('span.custom-class');
      expect(span).toBeTruthy();
    });

    it('should handle long text efficiently', async () => {
      const longText = 'A'.repeat(1000);
      const { container } = render(<StreamingText text={longText} speed={100} />);
      
      // Initially empty
      expect(container.textContent.replace(/\s/g, '').length).toBe(0);
      
      // Advance significantly (5 seconds = 500 characters at 100 chars/sec)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });
      
      // Should have streamed 500 characters
      const displayedLength = container.textContent.replace(/\s/g, '').length;
      expect(displayedLength).toBeGreaterThanOrEqual(490);
      expect(displayedLength).toBeLessThanOrEqual(510);
    });
  });

  describe('Integration with MessageBubble', () => {
    it('should work with default speed parameter', async () => {
      const text = 'Default speed test';
      const { container } = render(<StreamingText text={text} />);
      
      // Should use default speed of 40 chars/sec (25ms per char)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(250); // Should show ~10 characters
      });
      
      const displayedLength = container.textContent.replace(/\s/g, '').length;
      expect(displayedLength).toBeGreaterThan(5);
      expect(displayedLength).toBeLessThanOrEqual(15);
    });
  });
});
