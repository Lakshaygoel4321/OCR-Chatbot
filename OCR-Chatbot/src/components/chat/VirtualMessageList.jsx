import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MessageBubble from "./MessageBubble";
import { debounce } from "../../utils/debounce";

/**
 * VirtualMessageList Component
 * Implements virtual scrolling for large message lists (>100 messages)
 * Only renders messages that are visible in the viewport for optimal performance
 * 
 * Features:
 * - Virtual scrolling with dynamic item heights
 * - Debounced scroll handling (100ms)
 * - Overscan for smooth scrolling
 * - Maintains scroll position
 * 
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {Function} props.onRetryMessage - Retry message handler
 * @param {Function} props.onDismissError - Dismiss error handler
 * @param {number} props.containerHeight - Height of the scroll container
 */
export default function VirtualMessageList({ 
  messages, 
  onRetryMessage, 
  onDismissError,
  containerHeight = 600 
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  // Estimated item height (will be adjusted dynamically)
  const ESTIMATED_ITEM_HEIGHT = 80;
  const OVERSCAN_COUNT = 5; // Render extra items above and below viewport

  // Calculate item positions and heights
  const itemPositions = useMemo(() => {
    const positions = [];
    let currentTop = 0;

    messages.forEach((message, index) => {
      // Estimate height based on message content length
      // This is a simple heuristic; in production, you'd measure actual heights
      const contentLength = message.content?.length || 0;
      const estimatedHeight = Math.max(
        ESTIMATED_ITEM_HEIGHT,
        Math.min(300, 60 + Math.ceil(contentLength / 50) * 20)
      );

      positions.push({
        index,
        top: currentTop,
        height: estimatedHeight,
        bottom: currentTop + estimatedHeight,
      });

      currentTop += estimatedHeight + 8; // 8px gap between messages
    });

    return positions;
  }, [messages]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (itemPositions.length === 0) return 0;
    const lastItem = itemPositions[itemPositions.length - 1];
    return lastItem.bottom;
  }, [itemPositions]);

  // Calculate visible range based on scroll position
  const calculateVisibleRange = useCallback(() => {
    const viewportTop = scrollTop;
    const viewportBottom = scrollTop + containerHeight;

    let start = 0;
    let end = itemPositions.length;

    // Find first visible item
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i].bottom >= viewportTop) {
        start = Math.max(0, i - OVERSCAN_COUNT);
        break;
      }
    }

    // Find last visible item
    for (let i = start; i < itemPositions.length; i++) {
      if (itemPositions[i].top > viewportBottom) {
        end = Math.min(itemPositions.length, i + OVERSCAN_COUNT);
        break;
      }
    }

    return { start, end };
  }, [scrollTop, containerHeight, itemPositions]);

  // Update visible range when scroll position changes
  useEffect(() => {
    const newRange = calculateVisibleRange();
    setVisibleRange(newRange);
  }, [calculateVisibleRange]);

  // Debounced scroll handler (100ms)
  const handleScroll = useCallback(
    debounce((e) => {
      setScrollTop(e.target.scrollTop);
    }, 100),
    []
  );

  // Get visible messages
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.start, visibleRange.end).map((message, index) => {
      const actualIndex = visibleRange.start + index;
      const position = itemPositions[actualIndex];

      return {
        message,
        position,
        key: message.id || actualIndex,
      };
    });
  }, [messages, visibleRange, itemPositions]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto scroll-smooth"
      style={{
        position: 'relative',
      }}
    >
      {/* Spacer to maintain total height */}
      <div
        style={{
          height: `${totalHeight}px`,
          position: 'relative',
        }}
      >
        {/* Render only visible messages */}
        {visibleMessages.map(({ message, position, key }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: `${position.top}px`,
              left: 0,
              right: 0,
              minHeight: `${position.height}px`,
            }}
          >
            <MessageBubble
              message={message}
              onRetry={onRetryMessage}
              onDismiss={onDismissError}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
