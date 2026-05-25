import { motion } from "framer-motion";
import { Image, Mic } from "lucide-react";
import { useEffect, useRef } from "react";
import RippleButton from "../ui/RippleButton";

export default function AttachmentMenu({ onImage, onAudio, onClose }) {
  const menuRef = useRef(null);
  const firstItemRef = useRef(null);

  const menuItems = [
    {
      id: "image",
      icon: Image,
      label: "Upload Image",
      description: "Share photos or screenshots",
      onClick: onImage,
      ariaLabel: "Upload image - Share photos or screenshots",
    },
    {
      id: "audio",
      icon: Mic,
      label: "Upload Voice",
      description: "Record or upload audio",
      onClick: onAudio,
      ariaLabel: "Upload voice - Record or upload audio",
    },
  ];

  // Focus management: focus first item when menu opens
  useEffect(() => {
    if (firstItemRef.current) {
      firstItemRef.current.focus();
    }
  }, []);

  // Keyboard navigation: Escape to close, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const buttons = menuRef.current?.querySelectorAll('button');
        if (!buttons) return;

        const currentIndex = Array.from(buttons).indexOf(document.activeElement);
        let nextIndex;

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        }

        buttons[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <motion.div
      ref={menuRef}
      initial={{ 
        opacity: 0, 
        scale: isMobile ? 1 : 0.95, 
        y: isMobile ? 100 : 0 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0 
      }}
      exit={{ 
        opacity: 0, 
        scale: isMobile ? 1 : 0.95, 
        y: isMobile ? 100 : 0 
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.2,
      }}
      role="menu"
      aria-label="Attachment options"
      className="absolute bottom-16 left-0 z-20 w-64 md:w-64 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:rounded-t-2xl max-md:rounded-b-none rounded-xl border border-white/10 bg-white/10 dark:bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {menuItems.map((item, index) => (
        <div key={item.id}>
          <RippleButton
            ref={index === 0 ? firstItemRef : null}
            onClick={item.onClick}
            role="menuitem"
            aria-label={item.ariaLabel}
            className="w-full text-left px-4 py-3 md:py-3 py-4 flex items-start gap-3 text-white transition-all duration-150 group relative overflow-hidden touch-target-small"
          >
            {/* Gradient background on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-teal-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              initial={{ opacity: 0 }}
              aria-hidden="true"
            />

            {/* Icon */}
            <div className="relative z-10 mt-0.5" aria-hidden="true">
              <item.icon size={20} className="text-white/80 group-hover:text-white transition-colors duration-150" />
            </div>

            {/* Label and Description */}
            <div className="flex-1 relative z-10">
              <div className="font-medium text-sm text-white/90 group-hover:text-white transition-colors duration-150">
                {item.label}
              </div>
              <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-150 mt-0.5">
                {item.description}
              </div>
            </div>
          </RippleButton>

          {/* Separator with subtle gradient line */}
          {index < menuItems.length - 1 && (
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-2" aria-hidden="true" />
          )}
        </div>
      ))}
    </motion.div>
  );
}