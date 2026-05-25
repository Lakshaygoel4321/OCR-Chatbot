import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Animation variants for the container
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 },
    },
  };

  // Animation variants for the dots with staggered bounce
  const dotVariants = prefersReducedMotion
    ? {
        // Static dots for reduced motion
        animate: {
          y: 0,
        },
      }
    : {
        // Bouncing animation for normal motion
        animate: {
          y: [0, -8, 0],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      };

  // Pulsing glow animation
  const glowVariants = prefersReducedMotion
    ? {}
    : {
        animate: {
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
      };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex gap-3 my-3"
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Typing indicator bubble */}
      <div className="flex flex-col">
        <div className="rounded-2xl px-4 py-3 shadow-xl backdrop-blur-lg bg-white/10 border border-white/20 flex items-center gap-3">
          {/* "AI is thinking..." text */}
          <span className="text-sm text-gray-400">AI is thinking</span>

          {/* Animated dots container with glow effect */}
          <div className="relative flex items-center gap-1">
            {/* Pulsing glow background */}
            {!prefersReducedMotion && (
              <motion.div
                variants={glowVariants}
                animate="animate"
                className="absolute inset-0 bg-purple-500/30 rounded-full blur-md"
                style={{ transform: "scale(1.5)" }}
              />
            )}

            {/* Animated dots */}
            <motion.span
              variants={dotVariants}
              animate="animate"
              transition={{ delay: 0 }}
              className="relative h-2 w-2 rounded-full bg-purple-400"
            />
            <motion.span
              variants={dotVariants}
              animate="animate"
              transition={{ delay: 0.2 }}
              className="relative h-2 w-2 rounded-full bg-purple-400"
            />
            <motion.span
              variants={dotVariants}
              animate="animate"
              transition={{ delay: 0.4 }}
              className="relative h-2 w-2 rounded-full bg-purple-400"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}