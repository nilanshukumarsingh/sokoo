import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { gsap } from "gsap";

/**
 * Hero Background V3 - Optimized
 * 
 * Performance optimizations:
 * - Throttled mouse parallax (30fps)
 * - Absolute position calculations (no drift)
 * - Memoized constants
 * - Eager image loading
 * - Cleaned up unused refs
 */

// Auto-discover all PNG assets
const assetContext = import.meta.glob('../assets/*.png', { eager: true, import: 'default' });
const allImages = Object.values(assetContext);

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Uniform size for all images (vw units for responsiveness)
const BASE_SIZE = 11;

// Memoized front positions (constant)
const FRONT_POSITIONS = [
    { x: -8, y: 0, sizeMultiplier: 1.15, rotation: -8, depth: 1 },
    { x: 10, y: 3, sizeMultiplier: 1.1, rotation: 6, depth: 0.9 }
];

// Throttle utility
const throttle = (fn, ms) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= ms) {
            lastCall = now;
            fn(...args);
        }
    };
};

const HeroBackgroundV3 = ({ trigger }) => {
    const containerRef = useRef(null);
    const itemsRef = useRef([]);
    const frontRefs = useRef([]);
    const [isAnimated, setIsAnimated] = useState(false);

    // Store final positions for absolute parallax calculation
    const finalPositionsRef = useRef([]);

    const shuffledImages = useMemo(() => shuffle(allImages), []);

    // 2 for foreground, rest for background
    const frontImages = shuffledImages.slice(0, 2);
    const backImages = shuffledImages.slice(2);

    // Orbital positions with UNIFORM sizing
    const backPositions = useMemo(() => {
        const count = backImages.length;
        return backImages.map((_, i) => {
            const baseAngle = (i / count) * 360 - 90;
            const angle = baseAngle + (Math.random() - 0.5) * 20;
            const radiusX = 22 + Math.random() * 12;
            const radiusY = 10 + Math.random() * 6;
            const sizeMultiplier = 0.9 + Math.random() * 0.3;
            const rotation = (Math.random() - 0.5) * 25;
            const depth = 0.3 + Math.random() * 0.7;

            return { angle, radiusX, radiusY, sizeMultiplier, rotation, depth };
        });
    }, [backImages.length]);

    // Throttled mouse parallax handler
    const handleMouseMove = useCallback(
        throttle((e) => {
            if (!isAnimated) return;

            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;

            // Back layer parallax (absolute positions)
            itemsRef.current.forEach((el, i) => {
                if (!el) return;
                const pos = backPositions[i];
                const basePos = finalPositionsRef.current[i];
                if (!basePos) return;

                const parallaxX = mouseX * 30 * pos.depth;
                const parallaxY = mouseY * 20 * pos.depth;

                gsap.to(el, {
                    x: `${basePos.x + parallaxX}vw`,
                    y: `${basePos.y + parallaxY}vw`,
                    rotationY: mouseX * 15 * pos.depth,
                    rotationX: mouseY * -10 * pos.depth,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            // Front layer parallax - ADD parallax to base position
            frontRefs.current.forEach((el, i) => {
                if (!el) return;
                const pos = FRONT_POSITIONS[i];
                const parallaxX = mouseX * 40 * pos.depth;
                const parallaxY = mouseY * 25 * pos.depth;

                gsap.to(el, {
                    x: `${pos.x + parallaxX}vw`,  // Base position + parallax
                    y: `${pos.y + parallaxY}vw`,  // Base position + parallax
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        }, 33), // ~30fps throttle
        [isAnimated, backPositions]
    );

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    // Main animation
    useEffect(() => {
        if (!trigger) return;

        const ctx = gsap.context(() => {
            // Store final positions for parallax calculations
            finalPositionsRef.current = backPositions.map(pos => {
                const angleRad = (pos.angle * Math.PI) / 180;
                return {
                    x: Math.cos(angleRad) * pos.radiusX,
                    y: Math.sin(angleRad) * pos.radiusY
                };
            });

            // Animate back layer items
            itemsRef.current.forEach((el, i) => {
                if (!el) return;
                const pos = backPositions[i];
                const finalPos = finalPositionsRef.current[i];

                gsap.fromTo(el,
                    {
                        x: 0,
                        y: 0,
                        scale: 0,
                        rotation: pos.rotation + 180,
                        opacity: 0,
                        visibility: "visible"
                    },
                    {
                        x: `${finalPos.x}vw`,
                        y: `${finalPos.y}vw`,
                        scale: 1,
                        rotation: pos.rotation,
                        opacity: 1,
                        duration: 1.5,
                        delay: 0.15 + i * 0.06,
                        ease: "back.out(1.4)",
                        onComplete: () => { if (i === 0) setIsAnimated(true); }
                    }
                );

                // Gentle floating
                gsap.to(el, {
                    y: `+=${gsap.utils.random(4, 8)}`,
                    rotation: `+=${gsap.utils.random(-3, 3)}`,
                    duration: gsap.utils.random(4, 6),
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: 2
                });
            });

            // Animate front layer items
            frontRefs.current.forEach((el, i) => {
                if (!el) return;
                const pos = FRONT_POSITIONS[i];

                gsap.fromTo(el,
                    {
                        scale: 0,
                        rotation: pos.rotation - 15,
                        opacity: 0,
                        y: 40,
                        visibility: "visible"
                    },
                    {
                        scale: 1,
                        rotation: pos.rotation,
                        opacity: 1,
                        y: 0,
                        duration: 1.3,
                        delay: 0.4 + i * 0.15,
                        ease: "elastic.out(1, 0.65)"
                    }
                );

                // Gentle floating
                gsap.to(el, {
                    y: "+=8",
                    rotation: `+=${gsap.utils.random(-2, 2)}`,
                    duration: 4 + i,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: 2
                });
            });

        }, containerRef);

        return () => ctx.revert();
    }, [trigger, backPositions]);

    return (
        <>
            {/* BACK LAYER */}
            <div
                ref={containerRef}
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "1px",
                    height: "1px",
                    pointerEvents: "none",
                    zIndex: 1,
                    perspective: "1000px",
                    transformStyle: "preserve-3d"
                }}
            >
                {backImages.map((img, i) => {
                    const pos = backPositions[i];
                    const size = BASE_SIZE * pos.sizeMultiplier;

                    return (
                        <div
                            key={`back-${i}`}
                            ref={el => itemsRef.current[i] = el}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: `${size}vw`,
                                height: `${size}vw`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                visibility: "hidden",
                                willChange: "transform, opacity",
                                transformStyle: "preserve-3d"
                            }}
                        >
                            <img
                                src={img}
                                alt=""
                                loading="eager"
                                draggable={false}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.35))",
                                    userSelect: "none"
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* FRONT LAYER - 2 items on top */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    zIndex: 15,
                    perspective: "800px"
                }}
            >
                {frontImages.map((img, i) => {
                    const pos = FRONT_POSITIONS[i];
                    const size = BASE_SIZE * pos.sizeMultiplier;

                    return (
                        <div
                            key={`front-${i}`}
                            ref={el => frontRefs.current[i] = el}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: `translate(-50%, -50%) translateX(${pos.x}vw) translateY(${pos.y}vw)`,
                                width: `${size}vw`,
                                height: `${size}vw`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                visibility: "hidden",
                                willChange: "transform, opacity"
                            }}
                        >
                            <img
                                src={img}
                                alt=""
                                loading="eager"
                                draggable={false}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.45))",
                                    userSelect: "none"
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default HeroBackgroundV3;
