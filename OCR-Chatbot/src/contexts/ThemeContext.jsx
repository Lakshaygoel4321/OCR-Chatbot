import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

/**
 * Theme Provider Component
 * Manages dark/light mode state and persists preferences in localStorage
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored;
    }
    
    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    // Default to dark mode
    return 'dark';
  });

  useEffect(() => {
    // Apply theme class to document root
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Persist to localStorage
    localStorage.setItem('theme', theme);

    // Load and apply custom theme colors if they exist
    const savedTheme = localStorage.getItem('themeCustomization');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.colors) {
          // Apply custom colors to CSS variables
          Object.entries(parsed.colors).forEach(([key, value]) => {
            // Convert camelCase to kebab-case
            const cssVar = `--color-accent-${key.replace(/([A-Z])/g, '-$1').toLowerCase().replace('accent-', '')}`;
            root.style.setProperty(cssVar, value);
          });
        }
      } catch (error) {
        console.error('Failed to load custom theme colors:', error);
      }
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem('theme');
      if (!stored) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @returns {Object} Theme context value with theme, setTheme, toggleTheme, and isDark
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
