# Design System Documentation

This document provides guidance on using the design system foundation created for the Modern Chat UI Enhancement.

## Overview

The design system consists of:
1. **Design Tokens** (`tokens.js`) - Centralized color palettes, typography, spacing, shadows, and more
2. **Theme Context** (`../contexts/ThemeContext.jsx`) - Dark/light mode management with localStorage persistence
3. **Animation Configuration** (`../config/animations.js`) - Framer Motion variants with reduced motion support
4. **Tailwind CSS Extensions** (`globals.css`) - Custom CSS variables and glassmorphism utilities

## Usage Examples

### 1. Using Design Tokens

```javascript
import tokens from './styles/tokens';

// Access color values
const backgroundColor = tokens.colors.dark.background.primary;
const accentColor = tokens.colors.dark.accent.purple.start;

// Access typography
const fontSize = tokens.typography.fontSize.lg;
const fontWeight = tokens.typography.fontWeight.semibold;

// Access spacing
const padding = tokens.spacing[4]; // 1rem

// Access shadows
const shadow = tokens.shadows.xl.value;
```

### 2. Using Theme Context

Wrap your app with the ThemeProvider:

```javascript
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <YourComponents />
    </ThemeProvider>
  );
}
```

Use the theme in components:

```javascript
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Toggle to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

### 3. Using Animation Variants

```javascript
import { motion } from 'framer-motion';
import { fadeIn, slideUp, hoverScale } from './config/animations';

function AnimatedComponent() {
  return (
    <>
      {/* Fade in animation */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        Content
      </motion.div>
      
      {/* Slide up animation */}
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
      >
        Message
      </motion.div>
      
      {/* Hover scale animation */}
      <motion.button
        variants={hoverScale}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        Click me
      </motion.button>
    </>
  );
}
```

### 4. Using Glassmorphism Utilities

```javascript
function GlassCard() {
  return (
    <div className="glass-medium rounded-xl p-6 border border-[var(--color-border-subtle)]">
      <h2>Glassmorphism Card</h2>
      <p>This card has a frosted glass effect</p>
    </div>
  );
}
```

### 5. Using CSS Custom Properties

```javascript
function StyledComponent() {
  return (
    <div 
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--border-radius-lg)',
      }}
    >
      Content with CSS variables
    </div>
  );
}
```

### 6. Using Gradient Utilities

```javascript
function GradientButton() {
  return (
    <button className="gradient-purple-blue text-white px-6 py-3 rounded-xl">
      Gradient Button
    </button>
  );
}
```

## Accessibility Features

### Reduced Motion Support

All animations automatically respect the user's `prefers-reduced-motion` setting:

```javascript
import { createAccessibleVariants } from './config/animations';

const myAnimation = createAccessibleVariants({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
});
```

### Focus Indicators

All interactive elements have visible focus indicators defined in `globals.css`:

```css
*:focus-visible {
  outline: 2px solid var(--color-accent-purple-mid);
  outline-offset: 2px;
}
```

### Color Contrast

All color combinations meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

## Browser Support

### Backdrop Filter

Glassmorphism effects use `backdrop-filter`, which is supported in:
- Chrome 76+
- Safari 9+
- Firefox 103+
- Edge 79+

Fallback styles are provided for unsupported browsers using solid backgrounds with opacity.

## Theme Persistence

Theme preferences are automatically saved to `localStorage` under the key `'theme'`. The system also respects the user's OS-level theme preference on first visit.

## Z-Index Layers

Use the predefined z-index values for consistent layering:

```javascript
import tokens from './styles/tokens';

const zIndex = tokens.zIndex.modal; // 20
```

Or use CSS variables:

```css
.my-modal {
  z-index: var(--z-modal);
}
```

## Animation Durations

Use consistent animation durations:

```javascript
import tokens from './styles/tokens';

const duration = tokens.animation.duration.fast; // 150ms
```

Or use CSS variables:

```css
.my-element {
  transition: all var(--duration-normal) ease-in-out;
}
```

## Next Steps

This design system foundation is ready to be used in:
- Gradient Background component
- Enhanced ChatWindow with glassmorphism
- Modern Header component
- Enhanced MessageBubble component
- And all other UI components in the modernization plan
