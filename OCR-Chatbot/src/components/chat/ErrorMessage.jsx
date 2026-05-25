import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { shake } from "../../config/animations";

/**
 * ErrorMessage Component
 * Displays error messages with glassmorphism effects, shake animation, and action buttons
 * 
 * @param {Object} props
 * @param {string} props.message - Error message text to display
 * @param {Function} props.onRetry - Callback function when retry button is clicked
 * @param {Function} props.onDismiss - Callback function when dismiss button is clicked
 * @param {string} props.errorType - Type of error (e.g., 'network', 'validation', 'server')
 */
export default function ErrorMessage({ message, onRetry, onDismiss, errorType = 'general' }) {
  return (
    <motion.div
      variants={shake}
      initial="initial"
      animate="animate"
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="flex gap-3 my-3 justify-start"
    >
      {/* Error Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
        <AlertTriangle className="w-5 h-5 text-white" />
      </div>

      {/* Error bubble container */}
      <div className="flex flex-col max-w-[80%]">
        {/* Error bubble */}
        <div
          className="rounded-2xl px-4 py-3 shadow-xl backdrop-blur-lg border border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-700/20"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="text-sm font-medium text-red-200 mb-1">
                Error
              </div>
              <div className="text-sm text-red-100 leading-6">
                {message}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-red-100 text-xs font-medium transition-colors duration-150 backdrop-blur-md border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </motion.button>
            )}
            {onDismiss && (
              <motion.button
                onClick={onDismiss}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-red-100 text-xs font-medium transition-colors duration-150 backdrop-blur-md border border-white/10"
              >
                <X className="w-3.5 h-3.5" />
                Dismiss
              </motion.button>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-1 px-1 text-left">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
}
