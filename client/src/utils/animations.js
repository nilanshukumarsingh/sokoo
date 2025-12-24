/**
 * GSAP Animation Utilities
 * Standalone animation functions for imperative animations
 * These can be called directly without hooks
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Page transition animations
 */
export const pageTransitions = {
  // Fade out current page
  exit: (element, onComplete) => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }

    gsap.to(element, {
      opacity: 0,
      y: -30,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete,
    });
  },

  // Fade in new page
  enter: (element) => {
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      element,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      }
    );
  },

  // Slide transition
  slideIn: (element, direction = "left") => {
    if (prefersReducedMotion()) return;

    const x = direction === "left" ? -100 : 100;
    gsap.fromTo(
      element,
      { opacity: 0, x },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power3.out",
      }
    );
  },

  slideOut: (element, direction = "left", onComplete) => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }

    const x = direction === "left" ? -100 : 100;
    gsap.to(element, {
      opacity: 0,
      x,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete,
    });
  },
};

/**
 * Modal animations
 */
export const modalAnimations = {
  open: (backdrop, modal) => {
    if (prefersReducedMotion()) {
      gsap.set(backdrop, { opacity: 1 });
      gsap.set(modal, { opacity: 1, scale: 1 });
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 }).fromTo(
      modal,
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power3.out" },
      "-=0.15"
    );
    return tl;
  },

  close: (backdrop, modal, onComplete) => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }

    const tl = gsap.timeline({ onComplete });
    tl.to(modal, {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 0.25,
      ease: "power2.in",
    }).to(backdrop, { opacity: 0, duration: 0.2 }, "-=0.1");
    return tl;
  },
};

/**
 * Toast notification animations
 */
export const toastAnimations = {
  show: (element, position = "top-right") => {
    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1 });
      return;
    }

    const isTop = position.includes("top");
    const isRight = position.includes("right");

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: isRight ? 100 : -100,
        y: isTop ? -20 : 20,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      }
    );
  },

  hide: (element, onComplete) => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }

    gsap.to(element, {
      opacity: 0,
      x: 100,
      duration: 0.3,
      ease: "power2.in",
      onComplete,
    });
  },
};

/**
 * Button animations
 */
export const buttonAnimations = {
  // Click ripple effect
  ripple: (element, event) => {
    if (prefersReducedMotion()) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      transform: scale(0);
      left: ${x}px;
      top: ${y}px;
      width: 100px;
      height: 100px;
      margin-left: -50px;
      margin-top: -50px;
    `;

    element.style.position = "relative";
    element.style.overflow = "hidden";
    element.appendChild(ripple);

    gsap.to(ripple, {
      scale: 4,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    });
  },

  // Hover lift
  hoverLift: {
    enter: (element) => {
      if (prefersReducedMotion()) return;
      gsap.to(element, {
        y: -4,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        duration: 0.3,
        ease: "power2.out",
      });
    },
    leave: (element) => {
      if (prefersReducedMotion()) return;
      gsap.to(element, {
        y: 0,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        duration: 0.3,
        ease: "power2.out",
      });
    },
  },
};

/**
 * Card animations
 */
export const cardAnimations = {
  staggerIn: (cards, options = {}) => {
    if (prefersReducedMotion()) return;

    const {
      duration = 0.8,
      stagger = 0.1,
      y = 60,
      ease = "power3.out",
    } = options;

    gsap.fromTo(
      cards,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
      }
    );
  },

  hover: {
    enter: (card) => {
      if (prefersReducedMotion()) return;
      gsap.to(card, {
        y: -8,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
        duration: 0.3,
        ease: "power2.out",
      });
    },
    leave: (card) => {
      if (prefersReducedMotion()) return;
      gsap.to(card, {
        y: 0,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        duration: 0.3,
        ease: "power2.out",
      });
    },
  },
};

/**
 * Form animations
 */
export const formAnimations = {
  shake: (element) => {
    if (prefersReducedMotion()) return;

    gsap.to(element, {
      x: [-10, 10, -10, 10, 0],
      duration: 0.4,
      ease: "power2.inOut",
    });
  },

  success: (element) => {
    if (prefersReducedMotion()) return;

    const tl = gsap.timeline();
    tl.to(element, {
      scale: 1.02,
      borderColor: "#22c55e",
      duration: 0.2,
    }).to(element, {
      scale: 1,
      duration: 0.2,
    });
    return tl;
  },

  stepTransition: (currentStep, nextStep, direction = "next") => {
    if (prefersReducedMotion()) {
      gsap.set(currentStep, { display: "none" });
      gsap.set(nextStep, { display: "block", opacity: 1 });
      return;
    }

    const x = direction === "next" ? -100 : 100;
    const xFrom = direction === "next" ? 100 : -100;

    const tl = gsap.timeline();
    tl.to(currentStep, {
      opacity: 0,
      x,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        currentStep.style.display = "none";
      },
    })
      .set(nextStep, { display: "block", opacity: 0, x: xFrom })
      .to(nextStep, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: "power3.out",
      });

    return tl;
  },
};

/**
 * Sidebar animations
 */
export const sidebarAnimations = {
  open: (sidebar, items) => {
    if (prefersReducedMotion()) {
      gsap.set(sidebar, { x: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(
      sidebar,
      { x: -280 },
      { x: 0, duration: 0.4, ease: "power3.out" }
    );

    if (items) {
      tl.fromTo(
        items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.3 },
        "-=0.2"
      );
    }

    return tl;
  },

  close: (sidebar, onComplete) => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }

    gsap.to(sidebar, {
      x: -280,
      duration: 0.3,
      ease: "power2.in",
      onComplete,
    });
  },
};

/**
 * Timeline/Progress animations
 */
export const timelineAnimations = {
  progressStep: (element, index) => {
    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1, scale: 1 });
      return;
    }

    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.5 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        delay: index * 0.15,
        ease: "back.out(1.7)",
      }
    );
  },

  statusPulse: (element) => {
    if (prefersReducedMotion()) return;

    gsap.to(element, {
      scale: 1.1,
      duration: 0.3,
      repeat: 2,
      yoyo: true,
      ease: "power2.inOut",
    });
  },

  connectingLine: (line) => {
    if (prefersReducedMotion()) {
      gsap.set(line, { scaleX: 1 });
      return;
    }

    gsap.fromTo(
      line,
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.6, ease: "power2.out" }
    );
  },
};

/**
 * Skeleton/Loading animations
 */
export const loadingAnimations = {
  shimmer: (element) => {
    if (prefersReducedMotion()) return;

    gsap.to(element, {
      backgroundPosition: "200% 0",
      duration: 1.5,
      repeat: -1,
      ease: "linear",
    });
  },

  pulse: (element) => {
    if (prefersReducedMotion()) return;

    gsap.to(element, {
      opacity: 0.5,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
  },
};

/**
 * Counter animation utility
 */
export const animateCounter = (element, endValue, options = {}) => {
  if (prefersReducedMotion()) {
    element.textContent = endValue;
    return;
  }

  const {
    duration = 2,
    prefix = "",
    suffix = "",
    ease = "power2.out",
  } = options;
  const counter = { value: 0 };

  gsap.to(counter, {
    value: endValue,
    duration,
    ease,
    onUpdate: () => {
      element.textContent = `${prefix}${Math.round(counter.value)}${suffix}`;
    },
  });
};

/**
 * Text reveal animation utility
 */
export const revealText = (element, options = {}) => {
  if (prefersReducedMotion()) return;

  const {
    duration = 1,
    stagger = 0.03,
    y = 100,
    ease = "power4.out",
    type = "chars", // 'chars', 'words'
  } = options;

  const text = element.textContent;
  let elements;

  if (type === "chars") {
    element.innerHTML = text
      .split("")
      .map((char) =>
        char === " "
          ? '<span class="char">&nbsp;</span>'
          : `<span class="char" style="display: inline-block; overflow: hidden;"><span style="display: inline-block;">${char}</span></span>`
      )
      .join("");
    elements = element.querySelectorAll(".char > span");
  } else {
    element.innerHTML = text
      .split(" ")
      .map(
        (word) =>
          `<span class="word" style="display: inline-block; overflow: hidden;"><span style="display: inline-block;">${word}</span></span>`
      )
      .join(" ");
    elements = element.querySelectorAll(".word > span");
  }

  gsap.from(elements, {
    y,
    duration,
    stagger,
    ease,
  });
};

/**
 * Horizontal scroll animation
 */
export const horizontalScroll = (container, sections) => {
  if (prefersReducedMotion()) return;

  const totalWidth = sections.scrollWidth - window.innerWidth;

  gsap.to(sections, {
    x: -totalWidth,
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: `+=${totalWidth}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
    },
  });
};

export default {
  prefersReducedMotion,
  pageTransitions,
  modalAnimations,
  toastAnimations,
  buttonAnimations,
  cardAnimations,
  formAnimations,
  sidebarAnimations,
  timelineAnimations,
  loadingAnimations,
  animateCounter,
  revealText,
  horizontalScroll,
};
