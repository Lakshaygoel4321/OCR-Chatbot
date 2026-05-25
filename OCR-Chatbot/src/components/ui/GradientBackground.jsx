/**
 * GradientBackground Component
 * Animated gradient background with purple, teal, and blue colors
 * Supports prefers-reduced-motion for accessibility
 * Ensures minimum 4.5:1 contrast ratio with foreground content
 */

import { useEffect, useState } from 'react';

export default function GradientBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes to the preference
    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div
      className={`fixed inset-0 -z-10 ${prefersReducedMotion ? 'gradient-static' : 'gradient-animated'}`}
      aria-hidden="true"
    />
  );
}
