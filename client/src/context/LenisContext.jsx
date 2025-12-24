/**
 * Lenis Smooth Scroll Context Provider
 * Provides smooth scrolling throughout the application
 * Integrates with GSAP ScrollTrigger for synchronized animations
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext(null);

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Lenis Provider Component
 * Wraps the application to provide smooth scrolling
 */
export const LenisProvider = ({ children }) => {
  const lenisRef = useRef(null);
  const [isReady, setIsReady] = useState(() => prefersReducedMotion());
  const rafCallbackRef = useRef(null);

  useEffect(() => {
    // Skip smooth scroll if user prefers reduced motion
    if (prefersReducedMotion()) {
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Add Lenis to GSAP ticker for smooth updates
    rafCallbackRef.current = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallbackRef.current);
    gsap.ticker.lagSmoothing(0);

    // Use requestAnimationFrame to set ready state
    requestAnimationFrame(() => {
      setIsReady(true);
    });

    // Cleanup
    return () => {
      if (rafCallbackRef.current) {
        gsap.ticker.remove(rafCallbackRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target, scrollOptions = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, scrollOptions);
    } else {
      if (typeof target === "string") {
        const element = document.querySelector(target);
        element?.scrollIntoView({ behavior: "auto", ...scrollOptions });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "auto" });
      }
    }
  }, []);

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);
  const getLenis = useCallback(() => lenisRef.current, []);

  const contextValue = useMemo(
    () => ({
      getLenis,
      scrollTo,
      stop,
      start,
      isReady,
    }),
    [getLenis, scrollTo, stop, start, isReady]
  );

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
};

/**
 * Hook to access Lenis instance and methods
 */
export const useLenis = () => {
  const context = useContext(LenisContext);
  if (!context) {
    throw new Error("useLenis must be used within a LenisProvider");
  }
  return context;
};

// Re-export scroll hooks from separate file
export { useScrollProgress, useScrollDirection } from "../hooks/useScroll";

export default LenisProvider;
