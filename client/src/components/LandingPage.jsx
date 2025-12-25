/**
 * Landing Page Component
 * "Awwwards" quality design with premium GSAP animations.
 * Features: High-contrast typography, shader background, fluid interactions.
 */

import { useRef, useLayoutEffect, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StripeGradientBackground from "./StripeGradientBackground";
import HeroBackgroundV3 from "./HeroBackgroundV3";
import Footer from "./Footer";
import { Instagram, Twitter, Linkedin, Github } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = ({ isPreloaderFinished }) => {
  const containerRef = useRef(null);
  const heroTextRef = useRef([]);
  const scaleThriveRef = useRef(null);
  const joinSectionRef = useRef(null);
  const statsRef = useRef([]);
  const [isGlowEnabled, setIsGlowEnabled] = useState(false); // Toggle for glow effect
  const iconRefs = useRef([]); // Refs for Bento SVGs

  // Master GSAP Context
  useLayoutEffect(() => {
    // Only start hero animation when preloader is finished
    if (!isPreloaderFinished) return;

    const ctx = gsap.context(() => {

      // ===================================
      // 1. HERO TEXT REVEAL (Staggered Chars)
      // ===================================
      const heroTl = gsap.timeline({ delay: 0.2 });

      heroTextRef.current.forEach((el, i) => {
        if (!el) return;

        heroTl.fromTo(el,
          { y: 150, opacity: 0, rotateX: -30 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.4,
            ease: "power4.out",
          },
          i * 0.1 // stagger manually in timeline or use stagger prop
        );
      });

      // Subtext Reveal (Moved to ScrollTrigger below)


      // ===================================
      // 2. SCALE / THRIVE (Parallax Marquee)
      // ===================================
      const scaleTrack = scaleThriveRef.current?.querySelector('.scale-track');
      const thriveTrack = scaleThriveRef.current?.querySelector('.thrive-track');

      if (scaleThriveRef.current) {
        ScrollTrigger.create({
          trigger: scaleThriveRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            // Move Scale Left, Thrive Right
            if (scaleTrack) gsap.set(scaleTrack, { xPercent: -20 + (self.progress * -30) });
            if (thriveTrack) gsap.set(thriveTrack, { xPercent: -50 + (self.progress * 30) });
          }
        });
      }

      // ===================================
      // 3. FEATURE CARDS (Batched ScrollTrigger)
      // ===================================
      ScrollTrigger.batch('.feature-card', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
              overwrite: true
            }
          );
        },
        start: "top 90%"
      });

      // ===================================
      // 4. JOIN TEXT SPLIT REVEAL
      // ===================================
      if (joinSectionRef.current) {
        const joinWords = joinSectionRef.current.querySelectorAll('.join-word span');
        if (joinWords.length > 0) {
          gsap.fromTo(joinWords,
            { y: 100, opacity: 0, rotateX: -45 },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 1,
              stagger: 0.05,
              ease: "power3.out",
              scrollTrigger: {
                trigger: joinSectionRef.current,
                start: "top 75%",
              }
            }
          );
        }
      }

      // ===================================
      // 5. STATS COUNTER ANIMATION
      // ===================================
      statsRef.current.forEach((statEl) => {
        if (!statEl) return;
        const target = parseFloat(statEl.getAttribute('data-target'));
        const suffix = statEl.getAttribute('data-suffix') || "";

        ScrollTrigger.create({
          trigger: statEl,
          start: "top 90%",
          onEnter: () => {
            let obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 2,
              ease: "power2.out",
              onUpdate: () => {
                statEl.innerText = (target % 1 !== 0 ? obj.val.toFixed(1) : Math.floor(obj.val)) + suffix;
              }
            });
          }
        });
      });

      // ===================================
      // 6. MOVED HERO TEXT (Batched)
      // ===================================
      ScrollTrigger.batch('.moved-hero-text', {
        onEnter: (elements) => {
          gsap.to(elements, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            overwrite: true
          });
        },
        start: "top 90%"
      });

      // ===================================
      // 7. BENTO ICON ANIMATIONS (Simplified GSAP)
      // ===================================

      // 1. Global Payments: Card Float + Coin Pulse
      if (iconRefs.current[0]) {
        const card = iconRefs.current[0].querySelector('.svg-card-body');
        const coins = iconRefs.current[0].querySelectorAll('.svg-coin');

        if (card) gsap.to(card, { y: -4, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(coins, { scale: 1.15, duration: 1.2, yoyo: true, repeat: -1, stagger: 0.3, ease: "power1.inOut", transformOrigin: "center" });
      }

      // 2. Analytics: Bars Grow
      if (iconRefs.current[1]) {
        const bars = iconRefs.current[1].querySelectorAll('.svg-bar');
        const trendLine = iconRefs.current[1].querySelector('.svg-trend');

        gsap.to(bars, {
          scaleY: 1.3,
          transformOrigin: "bottom center",
          duration: 1,
          stagger: { each: 0.15, yoyo: true, repeat: -1 },
          ease: "power1.inOut"
        });

        if (trendLine) {
          const length = trendLine.getTotalLength ? trendLine.getTotalLength() : 100;
          gsap.set(trendLine, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(trendLine, { strokeDashoffset: 0, duration: 1.5, repeat: -1, repeatDelay: 1.5, ease: "power2.out" });
        }
      }

      // 3. Edge Scale: Server Pulse + Ring Expand
      if (iconRefs.current[2]) {
        const server = iconRefs.current[2].querySelector('.svg-server');
        const rings = iconRefs.current[2].querySelectorAll('.svg-ring');
        const satellites = iconRefs.current[2].querySelectorAll('.svg-satellite');

        if (server) gsap.to(server, { scale: 1.08, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "center" });
        gsap.to(rings, { scale: 2.5, opacity: 0, duration: 2, stagger: { each: 1, repeat: -1 }, ease: "power1.out", transformOrigin: "center" });
        gsap.to(satellites, { scale: 1.2, duration: 1, yoyo: true, repeat: -1, stagger: 0.25, ease: "power1.inOut", transformOrigin: "center" });
      }

      // 4. Enterprise Security: Shield Pulse + Scan Line
      if (iconRefs.current[3]) {
        const shield = iconRefs.current[3].querySelector('.svg-shield');
        const scanLine = iconRefs.current[3].querySelector('.svg-scan');

        if (shield) gsap.to(shield, { scale: 1.02, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "center 70%" });
        if (scanLine) gsap.to(scanLine, { y: 50, duration: 1.2, repeat: -1, ease: "power1.inOut", yoyo: true });
      }

      // 5. Vendor Dashboard: Shimmer + Element Pulse
      if (iconRefs.current[4]) {
        const shimmer = iconRefs.current[4].querySelector('.svg-shimmer');
        const elements = iconRefs.current[4].querySelectorAll('.svg-ui-el');

        if (shimmer) gsap.to(shimmer, { x: 260, duration: 2.5, repeat: -1, repeatDelay: 1, ease: "power1.inOut" });
        gsap.to(elements, { opacity: 0.7, duration: 0.8, stagger: { each: 0.1, yoyo: true, repeat: -1 }, ease: "power1.inOut" });
      }

      // 6. Support: Typing Dots Bounce
      if (iconRefs.current[5]) {
        const dots = iconRefs.current[5].querySelectorAll('.svg-typing-dot');
        gsap.to(dots, { y: -4, duration: 0.4, stagger: { each: 0.12, yoyo: true, repeat: -1 }, ease: "power1.inOut" });
      }

      // ===================================
      // 6. SUNRISE FOOTER ANIMATION
      // ===================================
      gsap.fromTo('.sunrise-text',
        { y: '100%', opacity: 0 },
        {
          y: '10%', // Half clipped from bottom
          opacity: 1,
          scrollTrigger: {
            trigger: '.sunrise-section',
            start: 'top 90%',
            end: 'bottom bottom',
            scrub: 1.5,
          }
        }
      );

      gsap.fromTo('.sunrise-gradient',
        { bottom: '-100%', opacity: 0 },
        {
          bottom: '-10%',
          opacity: 0.9, // More vibrant/punchy
          scrollTrigger: {
            trigger: '.sunrise-section',
            start: 'top 95%',
            end: 'bottom 10%',
            scrub: 2.5,
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, [isPreloaderFinished]);

  // Hover Effect for Buttons (Magnetic)
  const handleBtnHover = (e) => {
    const btn = e.currentTarget;
    const x = (e.clientX - btn.getBoundingClientRect().left - btn.clientWidth / 2) * 0.4;
    const y = (e.clientY - btn.getBoundingClientRect().top - btn.clientHeight / 2) * 0.4;
    gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
  };

  const handleBtnLeave = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <div ref={containerRef} className="landing-page" style={{ overflow: "hidden" }}>

      {/* BACKGROUND: Premium Shader */}
      <StripeGradientBackground
        intensity={0.4}
        speed={0.15}
        overlayOpacity={0.1} // Darker overlay for contrast
        blur={true}
      />





      {/* ================= HERO SECTION ================= */}
      <section style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 var(--space-lg)",
        position: "relative"
      }}>
        {/* HERO PRODUCT IMAGES - Radial Burst Layout */}
        <HeroBackgroundV3 trigger={isPreloaderFinished} />
        {/* Top Spacer to push text to center */}
        <div style={{ flex: 1 }} />

        <div className="hero-content" style={{
          zIndex: 10,
          maxWidth: "1260px",
          margin: "0 auto",
          width: "100%",
          visibility: isPreloaderFinished ? 'visible' : 'hidden',
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          {/* Main Headline - Broken into lines for animation */}
          <div style={{ overflow: "hidden", lineHeight: 0.9, textAlign: "center", paddingBottom: "50px", marginBottom: "-50px", paddingLeft: "10px", paddingRight: "10px" }}>
            <h1 ref={el => heroTextRef.current[0] = el} style={{
              fontFamily: 'var(--font-display)',
              fontSize: "clamp(4rem, 13.5vw, 12rem)",
              letterSpacing: "-0.04em",
              color: "var(--fg)",
              margin: 0,
              textShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}>
              COMMERCE
            </h1>
          </div>

          <div style={{ overflow: "hidden", lineHeight: 0.9, textAlign: "center", paddingBottom: "50px", marginBottom: "-50px", paddingLeft: "10px", paddingRight: "10px" }}>
            <h1 ref={el => heroTextRef.current[1] = el} style={{
              fontFamily: 'var(--font-display)',
              fontSize: "clamp(4rem, 13.5vw, 12rem)",
              letterSpacing: "-0.04em",
              color: "var(--fg)",
              margin: 0,
              fontStyle: "italic",
              textShadow: "0 10px 30px rgba(0,0,0,0.15)",
              paddingRight: "0.1em" // Prevent clipping of italic characters
            }}>
              REIMAGINED
            </h1>
          </div>
        </div>

        {/* Bottom Spacer with Buttons - This ensures the text above remains centered */}
        <div style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          visibility: isPreloaderFinished ? 'visible' : 'hidden',
          position: "relative",
          zIndex: 20
        }}>
          <div ref={el => heroTextRef.current[3] = el} style={{
            marginTop: "3rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2rem",
            width: "100%"
          }}>
            <Link to="#" onMouseMove={handleBtnHover} onMouseLeave={handleBtnLeave} className="hero-btn hero-btn-primary">
              <span className="hero-btn-bubble"></span>
              <span className="hero-btn-text">Start Selling</span>
            </Link>
            <Link to="#" onMouseMove={handleBtnHover} onMouseLeave={handleBtnLeave} className="hero-btn hero-btn-primary">
              <span className="hero-btn-bubble"></span>
              <span className="hero-btn-text">Explore Shop</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SCALE / THRIVE SECTION ================= */}
      <section ref={scaleThriveRef} style={{
        padding: "12rem 0",
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden",
        position: "relative"
      }}>

        {/* ROW 1: SCALE */}
        <div className="scale-track" style={{
          whiteSpace: "nowrap",
          display: "flex",
          gap: "4rem",
          marginBottom: "2rem",
          willChange: "transform"
        }}>
          {
            [...Array(8)].map((_, i) => (
              <span key={i} style={{
                fontSize: "clamp(6rem, 18vw, 20rem)",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                lineHeight: 0.8,
                color: i % 2 === 0 ? "var(--fg)" : "transparent",
                WebkitTextStroke: i % 2 === 0 ? "none" : "1px var(--fg)", // Outline effect
                opacity: 0.9
              }}>
                SCALE
              </span>
            ))
          }
        </div>

        {/* ROW 2: THRIVE */}
        <div className="thrive-track" style={{
          whiteSpace: "nowrap",
          display: "flex",
          gap: "4rem",
          willChange: "transform"
        }}>
          {
            [...Array(8)].map((_, i) => (
              <span key={i} style={{
                fontSize: "clamp(6rem, 18vw, 20rem)",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontStyle: "italic",
                lineHeight: 0.8,
                color: i % 2 !== 0 ? "var(--fg)" : "transparent",
                WebkitTextStroke: i % 2 !== 0 ? "none" : "1px var(--fg)",
                opacity: 0.9
              }}>
                THRIVE
              </span>
            ))
          }
        </div>

        {/* Overlay Label - Clean Text */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          zIndex: 5
        }}>
          <span style={{
            fontSize: "clamp(0.7rem, 2vw, 1rem)",
            fontWeight: 700,
            whiteSpace: "nowrap",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--fg)",
            textShadow: "0 0 18px var(--bg)"
          }}>
            Unlock Global Potential
          </span>
        </div>
      </section>

      {/* ================= MOVED TEXT SECTION ================= */}
      <section style={{
        padding: "8rem var(--space-lg)",
        background: "var(--bg)",
        display: "flex",
        justifyContent: "center",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "900px" }}>
          {[
            "The definitive platform for modern scaling.",
            "Empowering sellers, delighting customers,",
            "and redefining possibilities."
          ].map((line, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <p className="moved-hero-text" style={{
                fontSize: "clamp(1.5rem, 2.7vw, 2.5rem)",
                color: "var(--fg)",
                margin: 0,
                lineHeight: 1.3,
                fontWeight: 500,
                fontFamily: "var(--font-display)",
                transform: "translateY(50px)", // Start offset for scroll trigger
                opacity: 0
              }}>
                {line}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MARQUEE SECTION ================= */}
      <section style={{
        padding: "6rem 0",
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        overflow: "hidden"
      }}>
        <div className="marquee-container" style={{ display: "flex", whiteSpace: "nowrap" }}>
          <div className="infinite-marquee" style={{ display: "flex", gap: "4rem", animation: "marquee 40s linear infinite" }}>
            {['SYDNEY', 'PARIS', 'TOKYO', 'LONDON', 'NEW YORK', 'BERLIN', 'MILAN', 'NEW DELHI'].map((city, i) => (
              <span key={i} style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                opacity: 0.4
              }}>
                {city}
              </span>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="infinite-marquee" style={{ display: "flex", gap: "4rem", animation: "marquee 40s linear infinite", marginLeft: "4rem" }}>
            {['SYDNEY', 'PARIS', 'TOKYO', 'LONDON', 'NEW YORK', 'BERLIN', 'MILAN', 'NEW DELHI'].map((city, i) => (
              <span key={`dup-${i}`} style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                opacity: 0.4
              }}>
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENTO FEATURES GRID ================= */}
      <section className="bento-section" style={{
        padding: "12rem var(--space-lg)",
        background: "var(--bg)",
        contentVisibility: "auto",
        containIntrinsicSize: "1px 1000px"
      }}>
        <div style={{ maxWidth: "1260px", margin: "0 auto" }}>

          <div style={{ marginBottom: "5.4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", marginBottom: "0.9rem", color: "var(--muted)", fontSize: "1.35rem" }}>Everything you need.</p>
              <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 4rem)", fontFamily: "var(--font-display)", marginBottom: "0.9rem", lineHeight: 1 }}>
                Built for the <br /> <span style={{ fontStyle: "italic", color: "var(--muted)", whiteSpace: "nowrap" }}>Modern Web.</span>
              </h2>
            </div>
            <div style={{ maxWidth: "360px", textAlign: "right", marginTop: "1rem" }}>
              <p>We provide the ultimate toolkit for vendors and shoppers who demand excellence in every interaction.</p>
            </div>
          </div>

          <div className="bento-grid" style={{ gap: "1.8rem" }}>

            {/* ======= GLOBAL PAYMENTS (Large - 2x2) ======= */}
            <div className="bento-item bento-item--large feature-card" style={{ display: "flex", flexDirection: "column", padding: "2.5rem", justifyContent: "space-between", overflow: "visible" }}>
              {/* Text Zone */}
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "2rem", marginBottom: "1rem", fontFamily: "var(--font-display)" }}>Global Payments</h3>
                <p style={{ color: "var(--muted)", maxWidth: "80%" }}>Accept payments from anywhere in the world with automated tax handling.</p>
              </div>
              {/* SVG Zone */}
              <div ref={el => iconRefs.current[0] = el} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", overflow: "visible" }}>
                <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "220px", height: "auto", overflow: "visible" }}>
                  {/* Credit Card */}
                  <g className="svg-card-body">
                    <rect x="10" y="15" width="80" height="50" rx="6" fill="var(--fg)" />
                    <rect className="svg-chip" x="18" y="28" width="16" height="12" rx="2" fill="var(--bg)" opacity="0.6" />
                    <rect className="svg-stripe" x="10" y="48" width="80" height="8" fill="var(--muted)" opacity="0.3" />
                  </g>
                  {/* Coins */}
                  <circle className="svg-coin" cx="100" cy="25" r="10" fill="var(--muted)" stroke="var(--bg)" strokeWidth="2" />
                  <circle className="svg-coin" cx="105" cy="55" r="8" fill="var(--muted)" stroke="var(--bg)" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* ======= ANALYTICS (Small) ======= */}
            <div className="bento-item feature-card" style={{ display: "flex", flexDirection: "column", padding: "2rem", justifyContent: "space-between", overflow: "visible" }}>
              {/* SVG Zone */}
              <div ref={el => iconRefs.current[1] = el} style={{ display: "flex", alignItems: "flex-start", marginBottom: "1.5rem", overflow: "visible" }}>
                <svg viewBox="0 0 95 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "60px", height: "auto", overflow: "visible" }}>
                  {/* Bars */}
                  <rect className="svg-bar" x="10" y="45" width="15" height="20" fill="var(--fg)" />
                  <rect className="svg-bar" x="32" y="30" width="15" height="35" fill="var(--fg)" />
                  <rect className="svg-bar" x="54" y="18" width="15" height="47" fill="var(--fg)" />
                  <rect className="svg-bar" x="76" y="5" width="15" height="60" fill="var(--muted)" />
                  {/* Trend Line */}
                  <path className="svg-trend" d="M17 42 L39 27 L61 15 L83 3" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              {/* Text Zone */}
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", fontFamily: "var(--font-display)" }}>Analytics</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0, lineHeight: 1.4 }}>Real-time insights on your dashboard.</p>
              </div>
            </div>

            {/* ======= EDGE SCALE (Small) ======= */}
            <div className="bento-item feature-card" style={{ display: "flex", flexDirection: "column", padding: "2rem", justifyContent: "space-between", overflow: "visible" }}>
              {/* SVG Zone */}
              <div ref={el => iconRefs.current[2] = el} style={{ display: "flex", alignItems: "flex-start", marginBottom: "1.5rem", overflow: "visible" }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "60px", height: "auto", overflow: "visible" }}>
                  {/* Pulse Rings */}
                  <circle className="svg-ring" cx="50" cy="50" r="15" stroke="var(--muted)" strokeWidth="1" fill="none" opacity="0.5" />
                  <circle className="svg-ring" cx="50" cy="50" r="15" stroke="var(--muted)" strokeWidth="1" fill="none" opacity="0.5" />
                  {/* Server Core */}
                  <rect className="svg-server" x="40" y="40" width="20" height="20" rx="3" fill="var(--fg)" />
                  {/* Satellites */}
                  <circle className="svg-satellite" cx="50" cy="12" r="6" fill="var(--muted)" />
                  <circle className="svg-satellite" cx="88" cy="50" r="5" fill="var(--muted)" />
                  <circle className="svg-satellite" cx="12" cy="50" r="5" fill="var(--muted)" />
                  <circle className="svg-satellite" cx="50" cy="88" r="5" fill="var(--muted)" />
                  {/* Connection Lines */}
                  <line className="svg-connection" x1="50" y1="40" x2="50" y2="18" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
                  <line className="svg-connection" x1="60" y1="50" x2="83" y2="50" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
                  <line className="svg-connection" x1="40" y1="50" x2="17" y2="50" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
                  <line className="svg-connection" x1="50" y1="60" x2="50" y2="83" stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>
              {/* Text Zone */}
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", fontFamily: "var(--font-display)" }}>Edge Scale</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0, lineHeight: 1.4 }}>Instant global distribution.</p>
              </div>
            </div>

            {/* ======= ENTERPRISE SECURITY (Wide - 2x1) ======= */}
            <div className="bento-item bento-item--wide feature-card" style={{ display: "flex", flexDirection: "row", padding: "2.5rem", alignItems: "center", justifyContent: "space-between", overflow: "visible" }}>
              {/* Text Zone */}
              <div style={{ flex: "0 0 55%" }}>
                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", fontFamily: "var(--font-display)" }}>Enterprise Security</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>Military-grade encryption for every transaction.</p>
              </div>
              {/* SVG Zone */}
              <div ref={el => iconRefs.current[3] = el} style={{ flex: "0 0 40%", display: "flex", justifyContent: "center", overflow: "visible" }}>
                <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "80px", height: "auto", overflow: "visible" }}>
                  {/* Shield */}
                  <path className="svg-shield" d="M40 95 C40 95 75 75 75 40 L75 15 L40 5 L5 15 L5 40 C5 75 40 95 40 95 Z" fill="var(--fg)" />
                  {/* Scan Line */}
                  <rect className="svg-scan" x="10" y="20" width="60" height="2" fill="var(--accent)" opacity="0.8" />
                  {/* Check */}
                  <path className="svg-check" d="M28 50 L36 58 L54 40" stroke="var(--bg)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>

            {/* ======= VENDOR DASHBOARD (Large - 2x2) ======= */}
            <div className="bento-item bento-item--large feature-card" style={{ display: "flex", flexDirection: "column", padding: "2.5rem", overflow: "visible" }}>
              {/* Text Zone */}
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "2rem", marginBottom: "1rem", fontFamily: "var(--font-display)" }}>Vendor Dashboard</h3>
                <p style={{ color: "var(--muted)", margin: 0 }}>Manage your entire empire from a single interface.</p>
              </div>
              {/* SVG Zone */}
              <div ref={el => iconRefs.current[4] = el} style={{ flex: "1", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", overflow: "visible" }}>
                <svg viewBox="0 0 210 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "340px", height: "auto", overflow: "visible" }}>
                  {/* Dashboard Frame */}
                  <rect x="0" y="0" width="200" height="100" rx="12" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
                  {/* Header */}
                  <rect className="svg-ui-el" x="0" y="0" width="200" height="16" fill="var(--fg)" opacity="0.08" />
                  <circle cx="10" cy="8" r="3" fill="var(--muted)" opacity="0.5" />
                  <circle cx="20" cy="8" r="3" fill="var(--muted)" opacity="0.5" />
                  <circle cx="30" cy="8" r="3" fill="var(--muted)" opacity="0.5" />
                  {/* Sidebar */}
                  <rect className="svg-ui-el" x="0" y="16" width="40" height="84" fill="var(--fg)" opacity="0.04" />
                  {/* Content */}
                  <rect className="svg-ui-el" x="50" y="26" width="80" height="10" rx="2" fill="var(--fg)" opacity="0.15" />
                  <rect className="svg-ui-el" x="50" y="44" width="120" height="6" rx="1" fill="var(--muted)" opacity="0.1" />
                  <rect className="svg-ui-el" x="50" y="56" width="100" height="6" rx="1" fill="var(--muted)" opacity="0.1" />
                  <rect className="svg-ui-el" x="50" y="72" width="60" height="16" rx="3" fill="var(--fg)" opacity="0.2" />
                  {/* Shimmer */}
                  <defs>
                    <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="transparent" /><stop offset="50%" stopColor="var(--fg)" stopOpacity="0.05" /><stop offset="100%" stopColor="transparent" /></linearGradient>
                    <clipPath id="dashboardClip"><rect x="0" y="0" width="200" height="100" rx="12" /></clipPath>
                  </defs>
                  <rect className="svg-shimmer" x="-60" y="0" width="60" height="100" fill="url(#shimmerGrad)" clipPath="url(#dashboardClip)" />
                </svg>
              </div>
            </div>

            {/* ======= SUPPORT (Large - 2x2) ======= */}
            <div className="bento-item bento-item--large feature-card" style={{ display: "flex", flexDirection: "column", padding: "2.5rem", overflow: "visible" }}>
              {/* Text Zone */}
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "2rem", marginBottom: "1rem", fontFamily: "var(--font-display)" }}>Support</h3>
                <p style={{ color: "var(--muted)", margin: 0 }}>Dedicated enterprise support available 24/7.</p>
              </div>
              {/* SVG Zone */}
              <div ref={el => iconRefs.current[5] = el} style={{ flex: "1", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", overflow: "visible" }}>
                <svg viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "200px", height: "auto", overflow: "visible" }}>
                  {/* Bubble 1 (Left - User) */}
                  <g className="svg-bubble">
                    <rect x="5" y="50" width="60" height="40" rx="8" fill="var(--muted)" opacity="0.25" />
                    <polygon points="20,90 25,90 15,100" fill="var(--muted)" opacity="0.25" />
                  </g>
                  {/* Bubble 2 (Right - Support) */}
                  <g className="svg-bubble">
                    <rect x="75" y="10" width="60" height="45" rx="8" fill="var(--fg)" />
                    <polygon points="120,55 125,55 130,65" fill="var(--fg)" />
                    {/* Lines inside support bubble */}
                    <rect x="85" y="22" width="40" height="4" rx="2" fill="var(--bg)" opacity="0.6" />
                    <rect x="85" y="32" width="30" height="4" rx="2" fill="var(--bg)" opacity="0.4" />
                    <rect x="85" y="42" width="35" height="4" rx="2" fill="var(--bg)" opacity="0.4" />
                  </g>
                  {/* Typing Dots */}
                  <circle className="svg-typing-dot" cx="22" cy="70" r="4" fill="var(--fg)" opacity="0.6" />
                  <circle className="svg-typing-dot" cx="35" cy="70" r="4" fill="var(--fg)" opacity="0.6" />
                  <circle className="svg-typing-dot" cx="48" cy="70" r="4" fill="var(--fg)" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .marquee-container {
          display: flex;
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

       /* Removed old bento css */


      `}</style>

      {/* ================= STATS SECTION ================= */}
      <section style={{
        padding: "4rem var(--space-lg)", // Reduced vertical padding
        background: "linear-gradient(to bottom, var(--bg) 0%, #0a0a0a 40%)", // Seamless fade from light to dark grey
        contentVisibility: "auto",
        containIntrinsicSize: "1px 400px"
      }}>
        <div style={{
          maxWidth: "1260px",
          margin: "0 auto",
          gap: "2rem"
        }}>
          <div className="stats-grid">
            {[
              { number: 49632, suffix: "+", label: "Active Users" },
              { number: 1191, suffix: "+", label: "Vendors" },
              { number: 99, suffix: "%", label: "Uptime" },
              { number: 4.9, suffix: "", label: "on landing" }
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2.7rem 1.8rem",
                transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                cursor: "default",
                borderRight: i !== 3 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                position: "relative"
              }}>
                <h3
                  ref={el => statsRef.current[i] = el}
                  data-target={stat.number}
                  data-suffix={stat.suffix}
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    margin: 0,
                    color: "#fff",
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    fontVariantNumeric: "tabular-nums"
                  }}>
                  0{stat.suffix}
                </h3>
                <p style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "rgba(255, 255, 255, 0.6)",
                  marginTop: "1rem"
                }}>
                  {stat.label}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= JOIN SELLERS SECTION ================= */}
      <section ref={el => joinSectionRef.current = el} style={{
        padding: "12rem var(--space-lg)",
        background: "#0a0a0a",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative Blur - Seamless */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "720px", height: "720px",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)",
          opacity: 0.8, pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "1260px", margin: "0 auto" }}>

          <div style={{ marginBottom: "1rem", overflow: "hidden" }}>
            <p className="join-word" style={{
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.6)",
              fontFamily: "var(--font-display)",
              margin: 0
            }}>
              <span>Ready to transform your business?</span>
            </p>
          </div>

          {/* Main Headline - Split for Animation */}
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 7.2vw, 6rem)", // Decreased size as requested
            lineHeight: 0.9,
            marginBottom: "4rem",
            color: "#fff",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0.1em 0.2em",
            letterSpacing: "-0.04em"
          }}>
            {/* Row 1: Join thousands of */}
            <div style={{ display: "flex", gap: "0.2em", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
              {["Join", "thousands", "of"].map((word, i) => (
                <span key={i} className="join-word" style={{ display: "inline-block", overflow: "hidden", margin: "0 -0.15em" }}>
                  <span style={{ display: "inline-block", padding: "0 0.15em" }}>{word}</span>
                </span>
              ))}
            </div>

            <div style={{ width: "100%", marginTop: "0.5rem" }}>
              <span style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.2em",
                fontStyle: "italic",
                fontFamily: "var(--font-serif)"
              }}>
                {["successful", "sellers."].map((word, i) => (
                  <span key={i} className="join-word" style={{ display: "inline-block", overflow: "hidden", margin: "0 -0.15em" }}>
                    <span style={{ display: "inline-block", padding: "0 0.15em" }}>{word}</span>
                  </span>
                ))}
              </span>
            </div>
          </h2>

          <div style={{ marginBottom: "5rem" }}>
            <p style={{ fontSize: "1.1rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
              Start your journey today. No credit card required.
            </p>
          </div>

          <Link
            to="#"
            onMouseMove={handleBtnHover}
            onMouseLeave={handleBtnLeave}
            className="hero-btn hero-btn-primary"
            style={{ padding: "1.1rem 2.2rem", fontSize: "0.9rem", borderRadius: "0" }}
          >
            <span className="hero-btn-bubble"></span>
            <span className="hero-btn-text">Get Started Now</span>
          </Link>
        </div>
      </section>

      {/* ================= SOCIAL LINKS SECTION ================= */}
      <section style={{
        padding: "12rem var(--space-lg) 4rem",
        background: "#0a0a0a",
        color: "#fff",
        overflow: "hidden"
      }}>
        <div style={{ maxWidth: "1260px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "4rem" }}>
            {[
              { name: 'Instagram', icon: Instagram, color: '#FF306E' },
              { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
              { name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
              { name: 'Github', icon: Github, color: '#FFFFFF' }
            ].map((social, i) => (
              <div key={social.name} className="footer-link-wrapper" style={{ lineHeight: 0.85, position: "relative" }}>
                <a href="#" className="footer-huge-link" style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "clamp(4rem, 10.8vw, 10rem)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                  transformOrigin: "left center",
                  position: "relative",
                  WebkitTextStroke: "0px transparent"
                }}
                  onMouseEnter={(e) => {
                    const icon = e.currentTarget.querySelector('.social-hover-icon');

                    if (isGlowEnabled) {
                      e.currentTarget.style.color = "transparent";
                      e.currentTarget.style.WebkitTextStroke = `1px ${social.color}`;
                      e.currentTarget.style.textShadow = `0 0 25px ${social.color}40`;
                    } else {
                      // Default interactive state: Outline only (no glow)
                      e.currentTarget.style.color = "transparent";
                      e.currentTarget.style.textShadow = "none";
                      e.currentTarget.style.WebkitTextStroke = "1px #fff";
                    }

                    e.currentTarget.style.transform = "translateX(40px)";

                    if (icon) {
                      gsap.to(icon, { opacity: 1, x: -20, duration: 0.4, ease: "power2.out" });
                    }
                  }}
                  onMouseLeave={(e) => {
                    const icon = e.currentTarget.querySelector('.social-hover-icon');
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.WebkitTextStroke = "0px transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.textShadow = "none";
                    if (icon) {
                      gsap.to(icon, { opacity: 0, x: -40, duration: 0.4, ease: "power2.in" });
                    }
                  }}
                >
                  <social.icon
                    className="social-hover-icon"
                    style={{
                      position: "absolute",
                      left: "-60px",
                      width: "clamp(2rem, 6vw, 5rem)",
                      height: "clamp(2rem, 6vw, 5rem)",
                      color: social.color,
                      opacity: 0,
                      pointerEvents: "none"
                    }}
                  />
                  {social.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>



      <Footer
        isGlowEnabled={isGlowEnabled}
        onToggleGlow={() => setIsGlowEnabled(prev => !prev)}
      />
      {/* Scoped Styles for Hero Buttons */}
      <style>{`
        .hero-btn {
            position: relative;
            padding: 1.1rem 2.2rem; /* Slightly more padding to compensate for no border */
            font-size: 0.9rem;
            font-family: var(--font-sans);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            text-decoration: none;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            color: var(--fg);
            border: none; /* Removed border */
            transition: transform 0.4s ease;
        }

        .hero-btn-primary {
            background: transparent;
            border: none;
        }

        .hero-btn-bubble {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--fg); /* Solid fill on hover */
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 0;
        }

        .hero-btn-text {
            position: relative;
            z-index: 1;
            transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-btn:hover .hero-btn-bubble {
            transform: translateY(0);
        }

        .hero-btn:hover .hero-btn-text {
            color: var(--bg); /* Inverted text color on hover */
        }
        
        .stats-grid {
             display: grid;
             grid-template-columns: repeat(4, 1fr);
             width: 100%;
             gap: 2rem;
        }

        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 3rem 1rem;
            }
        }
        
        @media (max-width: 480px) {
             .stats-grid {
                grid-template-columns: 1fr;
            }
        }

      `}</style>

    </div >
  );
};

export default LandingPage;
