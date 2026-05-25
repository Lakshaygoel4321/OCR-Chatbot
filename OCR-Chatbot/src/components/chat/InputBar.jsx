import { useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Plus, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AttachmentMenu from "./AttachmentMenu";
import AttachmentPreview from "./AttachmentPreview";
import RippleButton from "../ui/RippleButton";
import { useAttachment } from "../../hooks/useAttachment";
import { rotate } from "../../config/animations";

const InputBar = forwardRef(({ onSend, disabled }, ref) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState("");
  const imageRef = useRef(null);
  const audioRef = useRef(null);
  const textareaRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    setText: (newText) => {
      setText(newText);
      // Focus the textarea after setting text
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    },
    getText: () => text,
    setError: (errorMessage) => {
      setValidationError(errorMessage);
      // Clear error after 5 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setValidationError("");
      }, 5000);
    },
  }));

  const { attachment, handleFile, clearAttachment } = useAttachment();

  // Character limit configuration
  const MAX_CHARS = 2000;
  const SHOW_COUNT_THRESHOLD = 0.8; // Show count at 80%
  const showCharCount = text.length >= MAX_CHARS * SHOW_COUNT_THRESHOLD;
  const isOverLimit = text.length > MAX_CHARS;

  const submit = async () => {
    if (!text.trim() || disabled || isOverLimit) {
      // Show validation error with shake animation
      if (!text.trim()) {
        setValidationError("Please enter a message");
      } else if (isOverLimit) {
        setValidationError(`Message exceeds ${MAX_CHARS} character limit`);
      }
      
      // Clear error after 5 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setValidationError("");
      }, 5000);
      
      return;
    }
    
    // Clear any existing validation errors
    setValidationError("");
    
    const content = text;
    setText("");
    setOpen(false);
    await onSend(content);
  };

  const canSend = text.trim().length > 0 && !disabled && !isOverLimit;

  return (
    <div className="relative p-3 sm:p-4 space-y-3 bg-white/5 dark:bg-white/5 backdrop-blur-xl border-t border-white/10 flex-shrink-0">
      <AttachmentPreview attachment={attachment} onRemove={clearAttachment} />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        {/* Attachment Button with Rotation Animation */}
        <div className="relative sm:flex-shrink-0">
          <motion.button
            onClick={() => setOpen((v) => !v)}
            className="h-11 w-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-200 border border-white/10 touch-target-small"
            variants={rotate}
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            aria-label={open ? "Close attachment menu" : "Open attachment menu"}
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <Plus size={18} aria-hidden="true" />
          </motion.button>

          <AnimatePresence>
            {open && (
              <AttachmentMenu
                onImage={() => {
                  imageRef.current?.click();
                  setOpen(false);
                }}
                onAudio={() => {
                  audioRef.current?.click();
                  setOpen(false);
                }}
                onClose={() => setOpen(false)}
              />
            )}
          </AnimatePresence>

          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <input
            ref={audioRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Textarea with Gradient Focus Ring and Error State */}
        <div className="flex-1 relative">
          <div className="relative">
            {/* Gradient border animation on focus or red border on error */}
            <AnimatePresence>
              {isFocused && !validationError && (
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-teal-500 to-blue-500 opacity-50"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  style={{ padding: '2px', zIndex: 0 }}
                />
              )}
            </AnimatePresence>

            <motion.textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                // Clear validation error when user starts typing
                if (validationError) {
                  setValidationError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your message..."
              maxLength={MAX_CHARS}
              aria-label="Message input"
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "input-error" : showCharCount ? "char-count" : undefined}
              animate={validationError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`
                min-h-11 w-full resize-none rounded-2xl px-4 py-3 
                bg-white/10 backdrop-blur-md 
                text-white placeholder:text-white/40
                border ${
                  validationError 
                    ? 'border-red-500' 
                    : isFocused 
                      ? 'border-transparent' 
                      : 'border-white/10'
                }
                outline-none
                transition-all duration-200
                relative z-10
                ${text.length === 0 ? 'animate-pulse-subtle' : ''}
              `}
              style={{
                background: validationError
                  ? 'rgba(239, 68, 68, 0.1)'
                  : isFocused 
                    ? 'linear-gradient(to right, rgba(255,255,255,0.15), rgba(255,255,255,0.1))' 
                    : 'rgba(255, 255, 255, 0.1)'
              }}
            />
          </div>

          {/* Validation Error Text */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                id="input-error"
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute -bottom-6 left-0 text-xs text-red-400"
              >
                {validationError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character Count Indicator */}
          <AnimatePresence>
            {showCharCount && !validationError && (
              <motion.div
                id="char-count"
                aria-live="polite"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`absolute -top-6 right-0 text-xs ${
                  isOverLimit ? 'text-red-400' : 'text-white/60'
                }`}
              >
                {text.length} / {MAX_CHARS}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send Button with Glow and Scale Animation */}
        <RippleButton
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className={`
            h-11 rounded-2xl px-4 flex items-center justify-center gap-2 font-medium
            transition-all duration-300 touch-target-small
            ${canSend 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
              : 'bg-white/10 text-white/40 cursor-not-allowed'
            }
          `}
          style={{
            animation: canSend ? 'pulse-glow 2s ease-in-out infinite' : 'none',
          }}
        >
          <Send size={16} />
          <span className="hidden sm:inline">Send</span>
        </RippleButton>
      </div>

      {/* Add custom CSS for glow animation */}
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-subtle::placeholder {
          animation: pulse-subtle 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(168, 85, 247, 0);
          }
          50% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
          }
        }

        /* Disable animations for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-subtle::placeholder {
            animation: none;
          }
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: none;
            }
          }
        }
      `}</style>
    </div>
  );
});

InputBar.displayName = 'InputBar';

export default InputBar;