/**
 * Page Transition Wrapper Component
 * Provides smooth page transitions using GSAP
 * Wraps route components for consistent enter/exit animations
 */

import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useLenis } from "../context/LenisContext";
import ScrambleChar from "./ScrambleChar";

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Page Transition Wrapper
 * Animates page content on route changes
 */
const PageTransition = ({ children }) => {
  const containerRef = useRef(null);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState("enter");
  const prevChildren = useRef(children);
  const isReducedMotion = useRef(prefersReducedMotion());

  // Handle children change - use ref comparison to avoid React 19 warnings
  useLayoutEffect(() => {
    if (children !== prevChildren.current) {
      prevChildren.current = children;

      if (isReducedMotion.current) {
        // For reduced motion, update immediately without animation
        setDisplayChildren(children);
        return;
      }

      // Start exit animation
      setTransitionStage("exit");
    }
  }, [children]);

  // Handle transition stage animations
  useLayoutEffect(() => {
    if (isReducedMotion.current || !containerRef.current) return;

    if (transitionStage === "exit") {
      const currentChildren = children;
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setDisplayChildren(currentChildren);
          setTransitionStage("enter");
        },
      });
    } else if (transitionStage === "enter") {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          clearProps: "all",
        }
      );
    }
  }, [transitionStage, children]);

  return (
    <div ref={containerRef} className="page-transition-wrapper">
      {displayChildren}
    </div>
  );
};

/**
 * Animated Route Component
 * Alternative approach using CSS-based transitions with GSAP enhancement
 */
export const AnimatedOutlet = ({ children }) => {
  const outletRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !outletRef.current) return;

    const ctx = gsap.context(() => {
      // Animate all sections within the outlet
      const sections = outletRef.current.querySelectorAll(
        "section, .animate-section"
      );

      gsap.fromTo(
        sections,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }, outletRef);

    return () => ctx.revert();
  }, [children]);

  return (
    <div ref={outletRef} className="animated-outlet">
      {children}
    </div>
  );
};

/**
 * Curtain Transition Effect
 * Full-screen curtain reveal animation
 */
export const CurtainTransition = ({
  isVisible,
  onComplete,
  color = "#000",
}) => {
  const curtainRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }

    if (!curtainRef.current) return;

    if (isVisible) {
      // Curtain enter
      gsap.fromTo(
        curtainRef.current,
        { scaleY: 0, transformOrigin: "bottom" },
        {
          scaleY: 1,
          duration: 0.5,
          ease: "power3.inOut",
          onComplete: () => {
            // Curtain exit
            gsap.to(curtainRef.current, {
              scaleY: 0,
              transformOrigin: "top",
              duration: 0.5,
              ease: "power3.inOut",
              delay: 0.1,
              onComplete,
            });
          },
        }
      );
    }
  }, [isVisible, onComplete]);

  return (
    <div
      ref={curtainRef}
      className="curtain-transition"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: color,
        zIndex: 9999,
        pointerEvents: "none",
        transform: "scaleY(0)",
      }}
    />
  );
};

/**
 * Preloader Component
 * Initial loading animation before app loads
 * Features: ASCII scramble text reveal, fast animations
 */
/**
 * Preloader Component
 * Initial loading animation before app loads
 * Features: SOKO branding with infinite scramble
 */
export const Preloader = ({ isLoading, onComplete }) => {
  const preloaderRef = useRef(null);
  const contentRef = useRef(null);
  const progressRef = useRef(null);
  const [isExited, setIsExited] = useState(false);
  const { stop, start } = useLenis();

  // Handle scroll lock
  useEffect(() => {
    if (!isExited) {
      stop();
    } else {
      start();
    }
    return () => start();
  }, [isExited, stop, start]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      if (!isLoading) {
        setIsExited(true);
        onComplete?.();
      }
      return;
    }

    if (!isLoading && preloaderRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          delay: 0.5, // Give it a moment to show the branding
          onComplete: () => {
            setIsExited(true);
            onComplete?.();
          }
        });

        // Animate content out
        tl.to(contentRef.current, {
          y: -30,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        })
          // Slide preloader up
          .to(preloaderRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: "power4.inOut",
          }, "-=0.1");
      });

      return () => ctx.revert();
    }
  }, [isLoading, onComplete]);

  if (isExited) return null;

  return (
    <div
      ref={preloaderRef}
      className="preloader"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem"
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: "4rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            fontFamily: "var(--font-display)",
            display: "flex",
            alignItems: "center"
          }}
        >
          <span>SOK</span>
          <span style={{ color: "var(--muted)", margin: "0 2px" }}>[</span>
          <ScrambleChar frequency={15} hueSpeed={50} />
          <span style={{ color: "var(--muted)", margin: "0 2px" }}>]</span>
        </div>

        <div
          style={{
            width: "240px",
            height: "2px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            overflow: "hidden",
          }}
        >
          <div
            ref={progressRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#22c55e", // Green accent for loading
              transformOrigin: "left",
              animation: "loadingProgress 2s ease-in-out infinite"
            }}
          />
        </div>

        <style>{`
          @keyframes loadingProgress {
            0% { transform: scaleX(0); transform-origin: left; }
            50% { transform: scaleX(1); transform-origin: left; }
            51% { transform: scaleX(1); transform-origin: right; }
            100% { transform: scaleX(0); transform-origin: right; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PageTransition;
