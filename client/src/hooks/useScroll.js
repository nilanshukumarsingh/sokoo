/**
 * Lenis Scroll Hooks
 * Custom hooks for scroll-based interactions
 * Separated from LenisContext for fast refresh compatibility
 */

import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Hook for scroll-based animations
 * Returns scroll progress (0 to 1) for a given element
 */
export const useScrollProgress = (ref, options = {}) => {
  const [progress, setProgress] = useState(0);
  const { start = "top bottom", end = "bottom top" } = options;

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start,
        end,
        onUpdate: (self) => {
          setProgress(self.progress);
        },
      });
    });

    return () => ctx.revert();
  }, [ref, start, end]);

  return progress;
};

/**
 * Hook for detecting scroll direction
 */
export const useScrollDirection = () => {
  const [direction, setDirection] = useState("down");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 50);

      if (currentScroll > lastScroll && currentScroll > 100) {
        setDirection("down");
      } else if (currentScroll < lastScroll) {
        setDirection("up");
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { direction, isScrolled };
};

export default {
  useScrollProgress,
  useScrollDirection,
};
