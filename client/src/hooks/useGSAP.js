/**
 * GSAP Animation Hooks
 * Reusable animation hooks for consistent animations across the application
 * All hooks use gsap.context() for proper cleanup and respect reduced motion
 */

import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Check for reduced motion preference
const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Base GSAP hook with context cleanup
 * @param {Function} animation - Animation function receiving (context, contextSafe)
 * @param {Array} deps - Dependency array
 */
export const useGSAPContext = (animation, deps = []) => {
  const containerRef = useRef(null);
  const animationRef = useRef(animation);

  // Update ref when animation changes
  animationRef.current = animation;

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context((self) => {
      animationRef.current(self);
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
};

/**
 * Fade in animation hook
 * @param {Object} options - Animation options
 */
export const useFadeIn = (options = {}) => {
  const {
    duration = 1,
    delay = 0,
    y = 50,
    ease = "power3.out",
    stagger = 0,
    scrollTrigger = false,
  } = options;

  const elementRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !elementRef.current) return;

    const ctx = gsap.context(() => {
      const config = {
        opacity: 0,
        y,
        duration,
        delay,
        ease,
        stagger,
      };

      if (scrollTrigger) {
        config.scrollTrigger = {
          trigger: elementRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        };
      }

      gsap.from(elementRef.current, config);
    });

    return () => ctx.revert();
  }, [duration, delay, y, ease, stagger, scrollTrigger]);

  return elementRef;
};

/**
 * Stagger animation hook for child elements
 * @param {Object} options - Animation options
 */
export const useStagger = (options = {}) => {
  const {
    duration = 0.8,
    stagger = 0.1,
    y = 60,
    ease = "power3.out",
    delay = 0,
    selector = "> *",
    scrollTrigger = true,
  } = options;

  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current.querySelectorAll(selector);

      const config = {
        opacity: 0,
        y,
        duration,
        stagger,
        ease,
        delay,
      };

      if (scrollTrigger) {
        config.scrollTrigger = {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        };
      }

      gsap.from(elements, config);
    }, containerRef);

    return () => ctx.revert();
  }, [duration, stagger, y, ease, delay, selector, scrollTrigger]);

  return containerRef;
};

/**
 * Text split and reveal animation hook
 * @param {Object} options - Animation options
 */
export const useSplitText = (options = {}) => {
  const {
    duration = 1,
    stagger = 0.03,
    y = 100,
    ease = "power4.out",
    delay = 0,
    type = "chars", // 'chars', 'words', 'lines'
  } = options;

  const textRef = useRef(null);
  const splitRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !textRef.current) return;

    const ctx = gsap.context(() => {
      const text = textRef.current;
      const originalText = text.textContent;

      // Manual text splitting (without SplitText plugin)
      if (type === "chars") {
        const chars = originalText.split("");
        text.innerHTML = chars
          .map((char) =>
            char === " "
              ? '<span class="char">&nbsp;</span>'
              : `<span class="char" style="display: inline-block;">${char}</span>`
          )
          .join("");
        splitRef.current = text.querySelectorAll(".char");
      } else if (type === "words") {
        const words = originalText.split(" ");
        text.innerHTML = words
          .map(
            (word) =>
              `<span class="word" style="display: inline-block;">${word}</span>`
          )
          .join(" ");
        splitRef.current = text.querySelectorAll(".word");
      } else {
        // Lines - wrap each line in a span
        text.innerHTML = `<span class="line" style="display: inline-block;">${originalText}</span>`;
        splitRef.current = text.querySelectorAll(".line");
      }

      gsap.from(splitRef.current, {
        y,
        opacity: 0,
        duration,
        stagger,
        ease,
        delay,
      });
    }, textRef);

    return () => ctx.revert();
  }, [duration, stagger, y, ease, delay, type]);

  return textRef;
};

/**
 * Parallax effect hook
 * @param {Object} options - Animation options
 */
export const useParallax = (options = {}) => {
  const { speed = 0.5, direction = "y" } = options;

  const elementRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        [direction]: () => window.innerHeight * speed * -1,
        ease: "none",
        scrollTrigger: {
          trigger: elementRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [speed, direction]);

  return elementRef;
};

/**
 * Magnetic hover effect hook
 */
export const useMagnetic = (strength = 0.3) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !elementRef.current) return;

    const element = elementRef.current;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return elementRef;
};

/**
 * Scroll reveal animation hook
 * @param {Object} options - Animation options
 */
export const useScrollReveal = (options = {}) => {
  const {
    duration = 1,
    y = 80,
    opacity = 0,
    ease = "power3.out",
    start = "top 85%",
    end = "top 20%",
    scrub = false,
    markers = false,
  } = options;

  const elementRef = useRef(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(elementRef.current, {
        y,
        opacity,
        duration,
        ease,
        scrollTrigger: {
          trigger: elementRef.current,
          start,
          end,
          scrub,
          markers,
          toggleActions: scrub ? undefined : "play none none reverse",
        },
      });
    });

    return () => ctx.revert();
  }, [duration, y, opacity, ease, start, end, scrub, markers]);

  return elementRef;
};

/**
 * Counter animation hook
 * @param {Object} options - Animation options
 */
export const useCounter = (options = {}) => {
  const {
    end = 100,
    duration = 2,
    delay = 0,
    ease = "power2.out",
    suffix = "",
    prefix = "",
    scrollTrigger = true,
  } = options;

  const elementRef = useRef(null);
  const counterRef = useRef({ value: 0 });

  useLayoutEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      const config = {
        value: end,
        duration,
        delay,
        ease,
        onUpdate: () => {
          if (elementRef.current) {
            elementRef.current.textContent = `${prefix}${Math.round(
              counterRef.current.value
            )}${suffix}`;
          }
        },
      };

      if (scrollTrigger) {
        config.scrollTrigger = {
          trigger: elementRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        };
      }

      gsap.to(counterRef.current, config);
    });

    return () => ctx.revert();
  }, [end, duration, delay, ease, suffix, prefix, scrollTrigger]);

  return elementRef;
};

/**
 * Timeline hook for complex animations
 */
export const useTimeline = (options = {}) => {
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const optionsRef = useRef(options);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      timelineRef.current = gsap.timeline(optionsRef.current);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const add = useCallback((target, vars, position) => {
    if (timelineRef.current) {
      timelineRef.current.to(target, vars, position);
    }
  }, []);

  const from = useCallback((target, vars, position) => {
    if (timelineRef.current) {
      timelineRef.current.from(target, vars, position);
    }
  }, []);

  const play = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
  }, []);

  const restart = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.restart();
    }
  }, []);

  return {
    containerRef,
    timeline: timelineRef,
    add,
    from,
    play,
    pause,
    restart,
  };
};

/**
 * Hover scale animation hook
 */
export const useHoverScale = (scale = 1.05) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !elementRef.current) return;

    const element = elementRef.current;

    const handleMouseEnter = () => {
      gsap.to(element, {
        scale,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [scale]);

  return elementRef;
};

/**
 * Shake animation hook (for errors)
 */
export const useShake = () => {
  const elementRef = useRef(null);

  const shake = useCallback(() => {
    if (prefersReducedMotion() || !elementRef.current) return;

    gsap.to(elementRef.current, {
      x: [-10, 10, -10, 10, 0],
      duration: 0.4,
      ease: "power2.inOut",
    });
  }, []);

  return { ref: elementRef, shake };
};

export default {
  useGSAPContext,
  useFadeIn,
  useStagger,
  useSplitText,
  useParallax,
  useMagnetic,
  useScrollReveal,
  useCounter,
  useTimeline,
  useHoverScale,
  useShake,
};
