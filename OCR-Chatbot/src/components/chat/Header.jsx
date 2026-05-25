import { useState } from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import RippleButton from '../ui/RippleButton';
import ThemeCustomizer from './ThemeCustomizer';

/**
 * Header Component
 * Modern header with glassmorphism effects, AI avatar, status indicator, and action buttons
 * 
 * Features:
 * - Glassmorphism styling with semi-transparent background and backdrop blur
 * - AI avatar icon on the left
 * - Application title with enhanced typography
 * - Status indicator showing "Online" or "Ready"
 * - Theme toggle button with icon switching
 * - Settings button that opens theme customizer
 * - Hover scale animations on buttons (1.05, 150ms)
 * - Shadow-lg for depth separation
 */
export default function Header() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  return (
    <header className="glass-medium relative z-20 border-b border-white/10 shadow-lg flex-shrink-0">
      <div className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
        {/* Left Section: AI Avatar and Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Avatar Icon */}
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-5 w-5 sm:h-6 sm:w-6 text-white"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>

          {/* Title and Status */}
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-semibold leading-tight text-[var(--color-text-primary)]">
              AI Assistant
            </h1>
            <div className="flex items-center gap-1.5">
              {/* Status Indicator Dot */}
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[10px] sm:text-xs text-[var(--color-text-secondary)]">
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          <RippleButton
            onClick={toggleTheme}
            className="flex h-9 w-9 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[var(--color-glass-light)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-glass-medium)] touch-target-small"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
            )}
          </RippleButton>

          {/* Settings Button */}
          <RippleButton
            onClick={() => setIsCustomizerOpen(true)}
            className="flex h-9 w-9 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[var(--color-glass-light)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-glass-medium)] touch-target-small"
            aria-label="Open theme customizer"
            title="Theme Customizer"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
          </RippleButton>
        </div>
      </div>

      {/* Theme Customizer Modal */}
      <ThemeCustomizer 
        isOpen={isCustomizerOpen} 
        onClose={() => setIsCustomizerOpen(false)} 
      />
    </header>
  );
}
