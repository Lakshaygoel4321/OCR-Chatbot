import { motion } from "framer-motion";
import { useState } from "react";
import { hoverScale } from "../../config/animations";

/**
 * RippleButton Component
 * A button with ripple effect on click and hover scale animation
 * 
 * Features:
 * - Ripple effect animation on click
 * - Hover scale animation (1.05, 150ms)
 * - Pointer cursor on hover
 * - Respects prefers-reduced-motion
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disabled state
 * @param {Object} props.rest - Additional props
 */
export default function RippleButton({ 
  children, 
  onClick, 
  className = "", 
  disabled = false,
  ...rest 
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    // Get button dimensions and click position
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create new ripple
    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Call the original onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      variants={disabled ? {} : hoverScale}
      initial="rest"
      whileHover={disabled ? "rest" : "hover"}
      whileTap={disabled ? "rest" : "tap"}
      {...rest}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 40, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
}
