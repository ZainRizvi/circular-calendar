'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that triggers scroll-based animations using Intersection Observer.
 * Returns a ref to attach to elements that should animate in.
 */
export function useScrollAnimation() {
  const elementRef = useRef<HTMLDivElement>(null);

  const setupObserver = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial hidden state
    element.style.opacity = '0';
    element.style.transform = 'translateY(24px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    return setupObserver();
  }, [setupObserver]);

  return elementRef;
}
