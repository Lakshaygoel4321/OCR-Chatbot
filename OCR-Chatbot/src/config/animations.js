/**
 * Animation Configuration
 * Centralized Framer Motion variants and animation utilities
 * Respects prefers-reduced-motion for accessibility
 */

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  // Check if window and matchMedia are available (for test environments)
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Creates animation variants that respect reduced motion preferences
 * @param {Object} normalVariants - Normal animation variants
 * @param {Object} reducedVariants - Reduced motion variants (optional)
 * @returns {Object} Appropriate variants based on user preference
 */
export const createAccessibleVariants = (normalVariants, reducedVariants = {}) => {
  if (prefersReducedMotion()) {
    return {
      initial: reducedVariants.initial || normalVariants.initial,
      animate: reducedVariants.animate || { ...normalVariants.animate, transition: { duration: 0 } },
      exit: reducedVariants.exit || { ...normalVariants.exit, transition: { duration: 0 } },
    };
  }
  return normalVariants;
};

// Fade In Animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

// Slide Up Animation
export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

// Slide Down Animation
export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

// Scale Animation
export const scale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeIn' }
  },
};

// Spring Animation (bouncy entrance)
export const spring = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20,
      duration: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

// Shake Animation (for errors)
// Uses transform: translateX for better performance
export const shake = {
  initial: { x: 0 },
  animate: { 
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4, ease: 'easeInOut' }
  },
};

// Hover Scale Animation (for buttons)
export const hoverScale = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.15, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeIn' }
  },
};

// Ripple Effect Animation (for button clicks)
export const ripple = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 2, 
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

// Pulse Animation (for loading indicators)
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Bounce Animation (for scroll button)
export const bounce = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Shimmer Animation (for skeleton loaders)
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Stagger Children Animation (for lists)
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger Item Animation
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Gradient Border Animation
export const gradientBorder = {
  initial: { backgroundPosition: '0% 50%' },
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Glow Animation (for hover effects)
export const glow = {
  rest: { 
    boxShadow: '0 0 0 rgba(168, 85, 247, 0)' 
  },
  hover: { 
    boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Rotate Animation (for attachment button)
export const rotate = {
  rest: { rotate: 0 },
  hover: { 
    rotate: 90,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Theme Transition Animation
export const themeTransition = {
  duration: 0.3,
  ease: 'easeInOut',
};

/**
 * Animation presets for common use cases
 */
export const animationPresets = {
  messageBubble: createAccessibleVariants(slideUp),
  typingIndicator: createAccessibleVariants(fadeIn),
  attachmentMenu: createAccessibleVariants(spring),
  attachmentPreview: createAccessibleVariants(slideDown),
  emptyState: createAccessibleVariants({
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  }),
  errorMessage: createAccessibleVariants({
    initial: { opacity: 0, x: 0 },
    animate: { 
      opacity: 1,
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
  }),
  scrollButton: createAccessibleVariants({
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.15, ease: 'easeIn' }
    },
  }),
};

export default {
  fadeIn,
  slideUp,
  slideDown,
  scale,
  spring,
  shake,
  hoverScale,
  ripple,
  pulse,
  bounce,
  shimmer,
  staggerContainer,
  staggerItem,
  gradientBorder,
  glow,
  rotate,
  themeTransition,
  animationPresets,
  createAccessibleVariants,
};
