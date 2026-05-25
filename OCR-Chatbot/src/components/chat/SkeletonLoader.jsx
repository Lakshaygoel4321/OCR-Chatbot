import { motion } from "framer-motion";
import { shimmer } from "../../config/animations";

/**
 * SkeletonLoader Component
 * Displays animated placeholder skeletons for loading states
 * Supports glassmorphism styling and respects prefers-reduced-motion
 */
export default function SkeletonLoader({ variant = "message", count = 3 }) {
  // Check if user prefers reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Shimmer animation for skeleton
  const shimmerAnimation = prefersReducedMotion
    ? {} // No animation if reduced motion is preferred
    : {
        animate: {
          backgroundPosition: ["200% 0", "-200% 0"],
        },
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        },
      };

  // Render message bubble skeleton
  const MessageSkeleton = ({ index }) => {
    const isUser = index % 2 === 0; // Alternate between user and AI

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex gap-3 my-3 ${isUser ? "justify-end" : "justify-start"}`}
      >
        {/* Avatar skeleton for AI messages (left side) */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-lg" />
        )}

        {/* Message bubble skeleton */}
        <div className="flex flex-col max-w-[80%]">
          <motion.div
            {...shimmerAnimation}
            className={`rounded-2xl px-4 py-3 shadow-xl backdrop-blur-lg ${
              isUser
                ? "bg-gradient-to-br from-purple-500/30 to-blue-600/30"
                : "bg-white/10 border border-white/20"
            }`}
            style={
              prefersReducedMotion
                ? {}
                : {
                    background: isUser
                      ? "linear-gradient(90deg, rgba(168, 85, 247, 0.3) 0%, rgba(147, 51, 234, 0.3) 25%, rgba(168, 85, 247, 0.3) 50%, rgba(147, 51, 234, 0.3) 75%, rgba(168, 85, 247, 0.3) 100%)"
                      : "linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.15) 75%, rgba(255, 255, 255, 0.1) 100%)",
                    backgroundSize: "200% 100%",
                  }
            }
          >
            {/* Skeleton text lines */}
            <div className="space-y-2">
              <div
                className={`h-3 rounded ${
                  isUser ? "bg-white/30" : "bg-white/20"
                }`}
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
              <div
                className={`h-3 rounded ${
                  isUser ? "bg-white/30" : "bg-white/20"
                }`}
                style={{ width: `${40 + Math.random() * 40}%` }}
              />
            </div>
          </motion.div>

          {/* Timestamp skeleton */}
          <div
            className={`h-2 w-12 rounded mt-1 ${
              isUser ? "ml-auto bg-white/10" : "bg-white/10"
            }`}
          />
        </div>

        {/* Avatar skeleton for user messages (right side) */}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-lg" />
        )}
      </motion.div>
    );
  };

  // Render typing indicator skeleton
  const TypingIndicatorSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 my-3 justify-start"
    >
      {/* Avatar skeleton */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-lg" />

      {/* Typing indicator skeleton */}
      <motion.div
        {...shimmerAnimation}
        className="rounded-2xl px-4 py-3 shadow-xl backdrop-blur-lg bg-white/10 border border-white/20"
        style={
          prefersReducedMotion
            ? {}
            : {
                background:
                  "linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.15) 75%, rgba(255, 255, 255, 0.1) 100%)",
                backgroundSize: "200% 100%",
              }
        }
      >
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </motion.div>
    </motion.div>
  );

  // Render based on variant
  if (variant === "typing") {
    return <TypingIndicatorSkeleton />;
  }

  // Render multiple message skeletons
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton key={index} index={index} />
      ))}
    </>
  );
}
