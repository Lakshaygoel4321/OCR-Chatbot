import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ScrollToBottomButton from "./ScrollToBottomButton";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import VirtualMessageList from "./VirtualMessageList";
import { useTheme } from "../../contexts/ThemeContext";
import { debounce } from "../../utils/debounce";

const VIRTUAL_SCROLL_THRESHOLD = 100; // Use virtual scrolling for >100 messages

export default function MessageList({ id, messages, isLoading, onPromptSelect, onRetryMessage, onDismissError }) {
  const { isDark } = useTheme();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollTimeoutRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  // Determine if we should use virtual scrolling
  const useVirtualScroll = messages.length > VIRTUAL_SCROLL_THRESHOLD;

  // Simulate initialization delay (skeleton loaders)
  useEffect(() => {
    // Show skeleton loaders for a brief moment on mount
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800); // 800ms initialization time

    return () => clearTimeout(timer);
  }, []);

  // Check if user has scrolled up from bottom
  // Debounced scroll handler for performance (100ms threshold)
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Show button if user scrolled up more than 200px from bottom
    setShowScrollButton(distanceFromBottom > 200);

    // Mark that user is actively scrolling
    isUserScrollingRef.current = true;
    
    // Clear the flag after scrolling stops
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  }, []);

  // Create debounced version of scroll handler (100ms)
  const debouncedHandleScroll = useCallback(
    debounce(handleScroll, 100),
    [handleScroll]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", debouncedHandleScroll);
    return () => {
      container.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, [debouncedHandleScroll]);

  // Auto-scroll to bottom when new messages appear with easing animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Clear any pending scroll timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Delay slightly to ensure DOM has updated
    scrollTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Auto-scroll if user is near the bottom (within 300px) or if user is not actively scrolling
      if (distanceFromBottom < 300 || !isUserScrollingRef.current) {
        if (prefersReducedMotion) {
          // Instant scroll for reduced motion
          container.scrollTop = container.scrollHeight;
        } else {
          // Smooth scroll with 400ms duration
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      }
    }, 50);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length, isLoading]);

  // Scroll to bottom with smooth animation (400ms ease-out)
  // Uses requestAnimationFrame for optimal performance
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Instant scroll for reduced motion
      container.scrollTop = container.scrollHeight;
    } else {
      // Smooth scroll using requestAnimationFrame for 60 FPS performance
      const startTime = performance.now();
      const startScrollTop = container.scrollTop;
      const targetScrollTop = container.scrollHeight - container.clientHeight;
      const distance = targetScrollTop - startScrollTop;
      const duration = 400; // 400ms

      // Ease-out cubic function
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        container.scrollTop = startScrollTop + distance * easedProgress;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  }, []);

  // Get gradient colors based on theme
  const gradientColor = isDark ? 'rgba(10, 10, 15, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const gradientTransparent = isDark ? 'rgba(10, 10, 15, 0)' : 'rgba(255, 255, 255, 0)';

  return (
    <div className="flex-1 relative overflow-hidden" id={id} role="main" aria-label="Chat messages">
      {/* Gradient fade at top edge */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10 transition-all duration-300"
        style={{
          background: `linear-gradient(to bottom, ${gradientColor} 0%, ${gradientTransparent} 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Scrollable content */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto p-4 space-y-2 scroll-smooth" 
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        <AnimatePresence mode="wait">
          {isInitializing ? (
            // Show skeleton loaders during initialization
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SkeletonLoader count={3} />
            </motion.div>
          ) : messages.length === 0 && !isLoading ? (
            // Show empty state when no messages exist
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <EmptyState onPromptSelect={onPromptSelect} />
            </motion.div>
          ) : (
            // Show actual messages after initialization
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {useVirtualScroll ? (
                // Use virtual scrolling for large message lists (>100 messages)
                <VirtualMessageList
                  messages={messages}
                  onRetryMessage={onRetryMessage}
                  onDismissError={onDismissError}
                  containerHeight={containerRef.current?.clientHeight || 600}
                />
              ) : (
                // Use regular rendering for smaller lists
                <>
                  {messages.map((m) => (
                    <MessageBubble 
                      key={m.id} 
                      message={m}
                      onRetry={onRetryMessage}
                      onDismiss={onDismissError}
                    />
                  ))}
                </>
              )}
              {isLoading && <TypingIndicator />}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Gradient fade at bottom edge */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10 transition-all duration-300"
        style={{
          background: `linear-gradient(to top, ${gradientColor} 0%, ${gradientTransparent} 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Scroll to bottom button */}
      <ScrollToBottomButton 
        visible={showScrollButton} 
        onClick={scrollToBottom}
      />
    </div>
  );
}