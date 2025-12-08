import { useEffect, useRef, useState } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  onEnter?: () => void;
  onLeave?: () => void;
}

/**
 * Hook that uses Intersection Observer to detect when an element enters/leaves viewport
 * Useful for lazy loading images and triggering animations
 */
export const useIntersectionObserver = <T extends HTMLElement>({
  threshold = 0.1,
  rootMargin = '50px',
  onEnter,
  onLeave,
}: IntersectionOptions = {}) => {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onEnter?.();
        } else {
          setIsVisible(false);
          onLeave?.();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, onEnter, onLeave]);

  return [ref, isVisible] as const;
};
