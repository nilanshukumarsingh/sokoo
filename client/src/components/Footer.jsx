/**
 * Global Footer Component
 * Matches the landing page's premium design with big brand text and gradient
 */

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Footer = ({ isGlowEnabled, onToggleGlow }) => {
    const footerRef = useRef(null);
    const sunriseRef = useRef(null);
    const sunriseTextRef = useRef(null);
    const sunriseGradientRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Sunrise Text Animation - Moved down for clipping
            gsap.fromTo(sunriseTextRef.current,
                { y: '100%', opacity: 0 },
                {
                    y: '28%', // Pushed down for better clipping effect
                    opacity: 1,
                    scrollTrigger: {
                        trigger: sunriseRef.current,
                        start: 'top 95%',
                        end: 'bottom bottom',
                        scrub: 1.2,
                    }
                }
            );

            // Sunrise Gradient Animation
            gsap.fromTo(sunriseGradientRef.current,
                { bottom: '-100%', opacity: 0 },
                {
                    bottom: '-10%',
                    opacity: 0.8,
                    scrollTrigger: {
                        trigger: sunriseRef.current,
                        start: 'top 95%',
                        end: 'bottom bottom',
                        scrub: 1.5,
                    }
                }
            );
        }, footerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={footerRef} style={{ background: '#0a0a0a', overflow: 'hidden' }}>
            <footer style={{
                padding: '4rem var(--space-lg)',
                paddingBottom: '2rem',
                color: '#fff',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: '#0a0a0a',
            }}>
                <div style={{ maxWidth: '1260px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        flexWrap: 'wrap',
                        gap: '2rem',
                    }}>
                        <div>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.8rem',
                                color: '#fff',
                                margin: 0,
                                fontWeight: 800,
                            }}>
                                SOKO
                            </h2>
                            <p
                                onClick={onToggleGlow}
                                style={{
                                    opacity: isGlowEnabled ? 0.8 : 0.4,
                                    marginTop: '0.4rem',
                                    fontSize: '0.81rem',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    transition: 'opacity 0.3s',
                                    userSelect: 'none'
                                }}
                                title="Toggle UI Effects"
                            >
                                © 2025 All Rights Reserved.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem' }}>
                            {['Legal', 'Privacy', 'Terms'].map(link => (
                                <Link
                                    key={link}
                                    to="#"
                                    style={{
                                        color: '#fff',
                                        textDecoration: 'none',
                                        fontSize: '0.85rem',
                                        opacity: 0.5,
                                        transition: 'opacity 0.3s',
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                    onMouseLeave={(e) => e.target.style.opacity = 0.5}
                                >
                                    {link}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer >

            {/* Sunrise Section */}
            < section ref={sunriseRef} style={{
                height: "50vh",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                // Transition from #0a0a0a to #000 for seamless blending
                background: 'linear-gradient(to bottom, #0a0a0a 0%, #000000 30%)',
            }}>
                {/* Gradient Mask for smoother top transition */}
                < div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "30%",
                    background: "linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)",
                    zIndex: 3,
                    pointerEvents: "none"
                }} />

                < div
                    ref={sunriseGradientRef}
                    style={{
                        position: "absolute",
                        bottom: "-40%",
                        left: "-10%",
                        width: "120%",
                        height: "200%",
                        // Smoother transition: teal (#40e0d0) ends at 450%, then a transparent teal spacing before full transparency
                        background: "radial-gradient(ellipse 100% 80% at 50% 100%, #ff0080 0%, #ff8c00 20%, #40e0d0 45%, rgba(64, 224, 208, 0) 70%)",
                        opacity: 0,
                        pointerEvents: "none",
                        zIndex: 1,
                        filter: "blur(80px)" // Increased blur for softer edges
                    }}
                />

                < h1
                    ref={sunriseTextRef}
                    style={{
                        fontSize: "30vw",
                        fontFamily: "var(--font-display)",
                        fontWeight: 900,
                        color: "#fff",
                        margin: 0,
                        lineHeight: 0.7,
                        letterSpacing: "-0.08em",
                        zIndex: 2,
                        textTransform: "uppercase",
                        textAlign: "center",
                        width: "100%",
                        filter: "drop-shadow(0 0 20px rgba(255, 0, 128, 0.4))",
                        opacity: 0
                    }}
                >
                    SOKO
                </h1 >
            </section >
        </div >
    );
};

export default Footer;
