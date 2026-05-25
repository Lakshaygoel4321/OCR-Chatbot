import { useEffect, useRef } from 'react';

/**
 * useWillChange Hook
 * Manages will-change CSS property for performance optimization
 * Adds will-change before animation starts and removes it after animation completes
 * 
 * @param {boolean} isAnimating - Whether the element is currently animating
 * @param {string} properties - CSS properties to optimize (e.g., 'transform', 'opacity')
 * @returns {Object} ref - Ref to attach to the animating element
 */
export function useWillChange(isAnimating, properties = 'transform, opacity') {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (isAnimating) {
      // Add will-change before animation
      element.style.willChange = properties;
    } else {
      // Remove will-change after animation completes
      // Use a small delay to ensure animation has finished
      const timeout = setTimeout(() => {
        element.style.willChange = 'auto';
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [isAnimating, properties]);

  return ref;
}

/**
 * withWillChange HOC
 * Higher-order component that adds will-change management to Framer Motion components
 * 
 * @param {Object} motionProps - Framer Motion animation props
 * @param {string} properties - CSS properties to optimize
 * @returns {Object} Enhanced motion props with will-change management
 */
export function withWillChange(motionProps = {}, properties = 'transform, opacity') {
  return {
    ...motionProps,
    onAnimationStart: (definition) => {
      // Add will-change when animation starts
      if (motionProps.onAnimationStart) {
        motionProps.onAnimationStart(definition);
      }
    },
    onAnimationComplete: (definition) => {
      // Remove will-change when animation completes
      if (motionProps.onAnimationComplete) {
        motionProps.onAnimationComplete(definition);
      }
    },
    style: {
      ...motionProps.style,
      // Will be managed dynamically by Framer Motion
    },
  };
}
