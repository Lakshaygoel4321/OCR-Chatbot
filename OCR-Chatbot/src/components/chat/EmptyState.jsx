import { motion } from 'framer-motion';
import { Sparkles, Image, Mic, MessageSquare, Lightbulb } from 'lucide-react';
import { animationPresets } from '../../config/animations';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * EmptyState Component
 * Displays a welcoming empty state when no messages exist
 * 
 * Features:
 * - Glassmorphism styling with semi-transparent background and backdrop blur
 * - Animated AI assistant icon with pulsing effect
 * - Welcome message with enhanced typography
 * - Suggested prompts as interactive chips with hover effects
 * - Click handler to populate InputBar with selected prompt
 * - Entrance animation (fade-in, scale, 500ms)
 * - Respects prefers-reduced-motion for accessibility
 * 
 * @param {Function} onPromptSelect - Callback when a suggested prompt is clicked
 */
export default function EmptyState({ onPromptSelect }) {
  const { isDark } = useTheme();

  // Suggested prompts for users to get started
  const suggestedPrompts = [
    {
      icon: Image,
      text: "Extract text from an image",
      description: "Upload an image to extract text using OCR"
    },
    {
      icon: Mic,
      text: "Transcribe audio to text",
      description: "Upload audio to convert speech to text"
    },
    {
      icon: MessageSquare,
      text: "Ask me anything",
      description: "Start a conversation with the AI assistant"
    },
    {
      icon: Lightbulb,
      text: "Help me with a task",
      description: "Get assistance with your work or questions"
    }
  ];

  // Handle prompt chip click
  const handlePromptClick = (promptText) => {
    if (onPromptSelect) {
      onPromptSelect(promptText);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full px-4 py-8"
      variants={animationPresets.emptyState}
      initial="initial"
      animate="animate"
    >
      {/* AI Assistant Icon with Pulsing Animation */}
      <motion.div
        className="relative mb-6"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect behind icon */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-teal-500/30 to-blue-500/30 blur-2xl" />
        
        {/* Icon container */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl">
          <Sparkles className="h-12 w-12 text-white" strokeWidth={2} />
        </div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        className="text-center mb-8 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
          Welcome to AI Assistant
        </h2>
        <p className="text-[var(--color-text-secondary)] text-base leading-relaxed">
          Start a conversation, upload an image for OCR, or transcribe audio. 
          I'm here to help with your tasks.
        </p>
      </motion.div>

      {/* Suggested Prompts */}
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <p className="text-sm text-[var(--color-text-muted)] mb-4 text-center">
          Try one of these suggestions:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestedPrompts.map((prompt, index) => {
            const Icon = prompt.icon;
            return (
              <motion.button
                key={index}
                onClick={() => handlePromptClick(prompt.text)}
                className="group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 glass-light border border-white/10 hover:border-white/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                
                {/* Content */}
                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-200">
                    <Icon className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-200" strokeWidth={2} />
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1 group-hover:text-purple-300 transition-colors duration-200">
                      {prompt.text}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                      {prompt.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Additional hint */}
      <motion.p
        className="text-xs text-[var(--color-text-muted)] mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        You can also type your own message or use the attachment button below
      </motion.p>
    </motion.div>
  );
}
