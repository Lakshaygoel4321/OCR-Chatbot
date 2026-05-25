import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StreamingText Component
 * Progressively reveals text character-by-character with a blinking cursor
 * Respects prefers-reduced-motion for accessibility
 */
export default function StreamingText({ 
  text, 
  speed = 40, // characters per second (30-50 range)
  onComplete,
  className = ""
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const indexRef = useRef(0);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // If user prefers reduced motion, display complete text immediately
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsStreaming(false);
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // Reset state when text changes
    indexRef.current = 0;
    setDisplayedText("");
    setIsStreaming(true);

    // Calculate delay between characters (in milliseconds)
    const delay = 1000 / speed;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        const char = text.charAt(indexRef.current);
        setDisplayedText((prev) => prev + char);
        indexRef.current += 1;
      } else {
        // Streaming complete
        clearInterval(timer);
        setIsStreaming(false);
        if (onComplete) {
          onComplete();
        }
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, speed, onComplete, prefersReducedMotion]);

  return (
    <span className={className}>
      {displayedText}
      <AnimatePresence mode="wait">
        {isStreaming && (
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: [1, 0, 1],
              transition: {
                duration: 0.8,
                repeat: Infinity,
                ease: "linear",
              }
            }}
            exit={{ 
              opacity: 0,
              transition: {
                duration: 0
              }
            }}
            className="inline-block ml-0.5 w-0.5 h-4 bg-current align-middle"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </span>
  );
}
