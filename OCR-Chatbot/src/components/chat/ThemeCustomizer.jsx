import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Palette, Check } from 'lucide-react';
import RippleButton from '../ui/RippleButton';

/**
 * Theme Customizer Component
 * Allows users to customize color schemes and accent colors
 * 
 * Features:
 * - Preset color scheme selection (default, ocean, sunset, forest, monochrome)
 * - Accent color picker with live preview
 * - Apply action with color transition animation (500ms)
 * - Persist theme preferences in localStorage
 * - Export/import functionality for theme configurations as JSON
 */

// Preset color schemes
const PRESET_SCHEMES = {
  default: {
    name: 'Default',
    description: 'Purple, teal, and blue gradients',
    colors: {
      accentPurpleStart: '#a855f7',
      accentPurpleMid: '#9333ea',
      accentPurpleEnd: '#7e22ce',
      accentTealStart: '#2dd4bf',
      accentTealMid: '#14b8a6',
      accentTealEnd: '#0d9488',
      accentBlueStart: '#60a5fa',
      accentBlueMid: '#3b82f6',
      accentBlueEnd: '#2563eb',
    },
  },
  ocean: {
    name: 'Ocean',
    description: 'Deep blues and teals',
    colors: {
      accentPurpleStart: '#3b82f6',
      accentPurpleMid: '#2563eb',
      accentPurpleEnd: '#1d4ed8',
      accentTealStart: '#06b6d4',
      accentTealMid: '#0891b2',
      accentTealEnd: '#0e7490',
      accentBlueStart: '#0ea5e9',
      accentBlueMid: '#0284c7',
      accentBlueEnd: '#0369a1',
    },
  },
  sunset: {
    name: 'Sunset',
    description: 'Warm oranges and pinks',
    colors: {
      accentPurpleStart: '#f97316',
      accentPurpleMid: '#ea580c',
      accentPurpleEnd: '#c2410c',
      accentTealStart: '#f59e0b',
      accentTealMid: '#d97706',
      accentTealEnd: '#b45309',
      accentBlueStart: '#ec4899',
      accentBlueMid: '#db2777',
      accentBlueEnd: '#be185d',
    },
  },
  forest: {
    name: 'Forest',
    description: 'Natural greens and earth tones',
    colors: {
      accentPurpleStart: '#22c55e',
      accentPurpleMid: '#16a34a',
      accentPurpleEnd: '#15803d',
      accentTealStart: '#10b981',
      accentTealMid: '#059669',
      accentTealEnd: '#047857',
      accentBlueStart: '#84cc16',
      accentBlueMid: '#65a30d',
      accentBlueEnd: '#4d7c0f',
    },
  },
  monochrome: {
    name: 'Monochrome',
    description: 'Elegant grays and whites',
    colors: {
      accentPurpleStart: '#94a3b8',
      accentPurpleMid: '#64748b',
      accentPurpleEnd: '#475569',
      accentTealStart: '#cbd5e1',
      accentTealMid: '#94a3b8',
      accentTealEnd: '#64748b',
      accentBlueStart: '#e2e8f0',
      accentBlueMid: '#cbd5e1',
      accentBlueEnd: '#94a3b8',
    },
  },
};

export default function ThemeCustomizer({ isOpen, onClose }) {
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [customColors, setCustomColors] = useState(PRESET_SCHEMES.default.colors);
  const [previewColors, setPreviewColors] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeCustomization');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setCustomColors(parsed.colors);
        setSelectedPreset(parsed.preset || 'default');
      } catch (error) {
        console.error('Failed to load saved theme:', error);
      }
    }
  }, []);

  // Handle preset selection
  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey);
    const preset = PRESET_SCHEMES[presetKey];
    setCustomColors(preset.colors);
    setPreviewColors(preset.colors);
  };

  // Handle custom color change
  const handleColorChange = (colorKey, value) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    setPreviewColors(newColors);
  };

  // Apply theme changes
  const handleApply = () => {
    setIsApplying(true);
    
    // Apply colors to CSS variables
    const root = document.documentElement;
    Object.entries(customColors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssVar = `--color-accent-${key.replace(/([A-Z])/g, '-$1').toLowerCase().replace('accent-', '')}`;
      root.style.setProperty(cssVar, value);
    });

    // Save to localStorage
    const themeConfig = {
      preset: selectedPreset,
      colors: customColors,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('themeCustomization', JSON.stringify(themeConfig));

    // Clear preview and show success feedback
    setTimeout(() => {
      setPreviewColors(null);
      setIsApplying(false);
    }, 500);
  };

  // Export theme configuration
  const handleExport = () => {
    const themeConfig = {
      preset: selectedPreset,
      colors: customColors,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(themeConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${selectedPreset}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import theme configuration
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result);
        if (imported.colors) {
          setCustomColors(imported.colors);
          setSelectedPreset(imported.preset || 'custom');
          setPreviewColors(imported.colors);
        }
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Failed to import theme. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Reset preview
  const handleCancelPreview = () => {
    setPreviewColors(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[var(--z-modal)]"
            onClick={onClose}
          />

          {/* Theme Customizer Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-heavy border border-white/20 rounded-2xl shadow-2xl z-[var(--z-modal)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
                  <Palette className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                    Theme Customization
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Personalize your chat experience
                  </p>
                </div>
              </div>
              <RippleButton
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-glass-light)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-glass-medium)]"
                aria-label="Close theme customizer"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </RippleButton>
            </div>

            {/* Preset Schemes */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Preset Color Schemes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(PRESET_SCHEMES).map(([key, preset]) => (
                  <motion.button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`relative p-4 rounded-xl border transition-all ${
                      selectedPreset === key
                        ? 'border-purple-500 bg-[var(--color-glass-medium)]'
                        : 'border-white/10 bg-[var(--color-glass-light)] hover:bg-[var(--color-glass-medium)]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedPreset === key && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        <div
                          className="h-6 w-6 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.accentPurpleStart }}
                        />
                        <div
                          className="h-6 w-6 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.accentTealStart }}
                        />
                        <div
                          className="h-6 w-6 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.colors.accentBlueStart }}
                        />
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] text-left">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] text-left">
                      {preset.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Custom Accent Colors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Purple Gradient */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Purple Gradient
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentPurpleStart}
                        onChange={(e) => handleColorChange('accentPurpleStart', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentPurpleMid}
                        onChange={(e) => handleColorChange('accentPurpleMid', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">Mid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentPurpleEnd}
                        onChange={(e) => handleColorChange('accentPurpleEnd', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">End</span>
                    </div>
                  </div>
                </div>

                {/* Teal Gradient */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Teal Gradient
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentTealStart}
                        onChange={(e) => handleColorChange('accentTealStart', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentTealMid}
                        onChange={(e) => handleColorChange('accentTealMid', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">Mid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentTealEnd}
                        onChange={(e) => handleColorChange('accentTealEnd', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">End</span>
                    </div>
                  </div>
                </div>

                {/* Blue Gradient */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                    Blue Gradient
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentBlueStart}
                        onChange={(e) => handleColorChange('accentBlueStart', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">Start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentBlueMid}
                        onChange={(e) => handleColorChange('accentBlueMid', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">Mid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColors.accentBlueEnd}
                        onChange={(e) => handleColorChange('accentBlueEnd', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border border-white/20"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">End</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            {previewColors && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-[var(--color-glass-light)] border border-white/10"
              >
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                  Live Preview
                </h3>
                <div className="flex gap-2">
                  <div
                    className="h-12 flex-1 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${previewColors.accentPurpleStart}, ${previewColors.accentPurpleMid}, ${previewColors.accentPurpleEnd})`,
                    }}
                  />
                  <div
                    className="h-12 flex-1 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${previewColors.accentTealStart}, ${previewColors.accentTealMid}, ${previewColors.accentTealEnd})`,
                    }}
                  />
                  <div
                    className="h-12 flex-1 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${previewColors.accentBlueStart}, ${previewColors.accentBlueMid}, ${previewColors.accentBlueEnd})`,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={handleApply}
                disabled={isApplying}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isApplying
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg'
                }`}
                whileHover={{ scale: isApplying ? 1 : 1.02 }}
                whileTap={{ scale: isApplying ? 1 : 0.98 }}
              >
                {isApplying ? (
                  <>
                    <Check className="h-5 w-5" strokeWidth={2} />
                    Applied!
                  </>
                ) : (
                  <>
                    <Palette className="h-5 w-5" strokeWidth={2} />
                    Apply Theme
                  </>
                )}
              </motion.button>

              <div className="flex gap-3">
                <motion.button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-glass-light)] text-[var(--color-text-primary)] hover:bg-[var(--color-glass-medium)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="Export theme configuration"
                >
                  <Download className="h-5 w-5" strokeWidth={2} />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>

                <label className="cursor-pointer">
                  <motion.div
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-glass-light)] text-[var(--color-text-primary)] hover:bg-[var(--color-glass-medium)] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Import theme configuration"
                  >
                    <Upload className="h-5 w-5" strokeWidth={2} />
                    <span className="hidden sm:inline">Import</span>
                  </motion.div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {previewColors && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleCancelPreview}
                className="w-full mt-3 px-4 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass-light)] transition-colors"
              >
                Cancel Preview
              </motion.button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
