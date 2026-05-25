/**
 * Design Tokens
 * Centralized design system tokens for colors, typography, spacing, shadows, and more
 */

export const tokens = {
  // Color Palettes
  colors: {
    dark: {
      background: {
        primary: '#0a0a0f',
        secondary: '#13131a',
        tertiary: '#1a1a24',
      },
      text: {
        primary: '#f5f5f7',
        secondary: '#b4b4b8',
        muted: '#6e6e73',
      },
      accent: {
        purple: {
          start: '#a855f7',
          mid: '#9333ea',
          end: '#7e22ce',
        },
        teal: {
          start: '#2dd4bf',
          mid: '#14b8a6',
          end: '#0d9488',
        },
        blue: {
          start: '#60a5fa',
          mid: '#3b82f6',
          end: '#2563eb',
        },
      },
      glass: {
        light: 'rgba(255, 255, 255, 0.05)',
        medium: 'rgba(255, 255, 255, 0.1)',
        heavy: 'rgba(255, 255, 255, 0.15)',
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.2)',
      },
      error: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '#ef4444',
        text: '#fca5a5',
      },
    },
    light: {
      background: {
        primary: '#ffffff',
        secondary: '#f5f5f7',
        tertiary: '#e5e5ea',
      },
      text: {
        primary: '#1d1d1f',
        secondary: '#6e6e73',
        muted: '#b4b4b8',
      },
      accent: {
        purple: {
          start: '#9333ea',
          mid: '#7e22ce',
          end: '#6b21a8',
        },
        teal: {
          start: '#14b8a6',
          mid: '#0d9488',
          end: '#0f766e',
        },
        blue: {
          start: '#3b82f6',
          mid: '#2563eb',
          end: '#1d4ed8',
        },
      },
      glass: {
        light: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.1)',
        heavy: 'rgba(0, 0, 0, 0.15)',
      },
      border: {
        subtle: 'rgba(0, 0, 0, 0.1)',
        medium: 'rgba(0, 0, 0, 0.2)',
      },
      error: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '#dc2626',
        text: '#991b1b',
      },
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter Variable, system-ui, -apple-system, sans-serif',
      monospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing (following 0.25rem base scale)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
  },

  // Border Radius
  borderRadius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },

  // Shadows (for glassmorphism and depth)
  shadows: {
    sm: {
      blur: '4px',
      opacity: '0.1',
      value: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    },
    md: {
      blur: '8px',
      opacity: '0.15',
      value: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    },
    lg: {
      blur: '16px',
      opacity: '0.2',
      value: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
    xl: {
      blur: '24px',
      opacity: '0.25',
      value: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    },
    '2xl': {
      blur: '40px',
      opacity: '0.3',
      value: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
    },
  },

  // Animation Durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '1000ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  // Z-Index Layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 15,
    modal: 20,
    popover: 25,
    tooltip: 30,
  },

  // Backdrop Blur Values
  backdropBlur: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
  },
};

export default tokens;
