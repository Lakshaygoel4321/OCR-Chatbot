import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { animationPresets, bounce, glow } from "../../config/animations";

/**
 * ScrollToBottomButton Component
 * A floating button that appears when user scrolls up, allowing quick return to bottom
 * 
 * Features:
 * - Fade-in animation when shown
 * - Bounce animation on the icon
 * - Glow effect on hover
 * - Glassmorphism styling
 * - Respects prefers-reduced-motion
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the button should be visible
 * @param {Function} props.onClick - Click handler to scroll to bottom
 */
export default function ScrollToBottomButton({ visible, onClick }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          variants={animationPresets.scrollButton}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={onClick}
          className="absolute bottom-20 right-4 z-10 h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
          whileHover={{
            boxShadow: [
              '0 0 0 rgba(168, 85, 247, 0)',
              '0 0 20px rgba(168, 85, 247, 0.5)',
              '0 0 30px rgba(168, 85, 247, 0.5)',
            ],
          }}
          transition={{
            boxShadow: {
              duration: 0.3,
              ease: 'easeOut',
            },
          }}
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          <motion.div
            variants={bounce}
            animate="animate"
          >
            <ChevronDown size={24} strokeWidth={2.5} />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
