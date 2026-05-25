import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * LazyImage Component
 * Implements lazy loading for images using Intersection Observer
 * Only loads images when they enter the viewport
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Fade-in animation when image loads
 * - Placeholder while loading
 * - Error handling
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.placeholderClassName - Placeholder CSS classes
 */
export default function LazyImage({ 
  src, 
  alt = '', 
  className = '', 
  placeholderClassName = '',
  ...rest 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load image immediately
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Stop observing once image is in view
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Load image when it's 200px away from viewport
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className={`absolute inset-0 bg-white/5 backdrop-blur-sm animate-pulse ${placeholderClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Actual image - only load when in view */}
      {isInView && !hasError && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={className}
          loading="lazy"
          {...rest}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className={`flex items-center justify-center bg-white/5 text-white/40 text-xs ${placeholderClassName}`}>
          Failed to load image
        </div>
      )}
    </div>
  );
}
