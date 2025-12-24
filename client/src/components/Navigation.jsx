/**
 * Editorial Navigation Component
 * Award-winning, sharp-edged design with GSAP animations
 * Features: Magnetic hover, text reveal, hamburger menu transformation
 */

import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { Link, useLocation } from "react-router-dom";
import ScrambleChar from "./ScrambleChar";
import { gsap } from "gsap";
import { useScrollDirection } from "../context/LenisContext";
import { useAuth } from "../context/AuthContext";
import { cartAPI } from "../utils/api"; // Added cartAPI
import UserDropdown from "./UserMenu/UserDropdown";

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const Navigation = ({ isPreloaderFinished }) => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef([]);
  const menuRef = useRef(null);
  const menuOverlayRef = useRef(null);
  const menuItemsRef = useRef([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { direction, isScrolled } = useScrollDirection();
  const location = useLocation();
  const prevLocation = useRef(location.pathname);
  const { user, isAuthenticated, isVendor, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // Fetch Cart Count
  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated || isVendor) return;
    try {
      const res = await cartAPI.get();
      const count = res.data?.data?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (err) {
      console.error("Failed to fetch cart count", err);
    }
  }, [isAuthenticated, isVendor]);

  // Listen for cart updates
  useEffect(() => {
    fetchCartCount();
    
    // Listen for custom event from ProductDetailPage or other places
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [fetchCartCount]);

  // Initial navigation animation on mount
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !isPreloaderFinished) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      tl.fromTo(
        logoRef.current,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      tl.fromTo(
        linksRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" },
        "-=0.4"
      );
    }, navRef);

    return () => ctx.revert();
  }, [isPreloaderFinished]);

  // Sticky Nav Logic
  useEffect(() => {
    if (!navRef.current) return;

    gsap.to(navRef.current, {
      y: 0,
      backgroundColor: "transparent",
      backdropFilter: "none",
      borderBottom: "none",
      duration: 0.3,
      ease: "power2.out"
    });
  }, [isScrolled]);

  // Menu open/close animation
  useLayoutEffect(() => {
    if (!menuOverlayRef.current) return;

    const ctx = gsap.context(() => {
      if (isMenuOpen) {
        gsap.set(menuOverlayRef.current, { display: "flex" });

        const tl = gsap.timeline();

        tl.fromTo(
          menuOverlayRef.current,
          { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 0.8,
            ease: "power4.inOut",
          }
        );

        tl.fromTo(
          menuItemsRef.current,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
          "-=0.3"
        );
      } else {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(menuOverlayRef.current, { display: "none" });
          },
        });

        tl.to(menuItemsRef.current, {
          y: -40,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.in",
        });

        tl.to(
          menuOverlayRef.current,
          {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
            duration: 0.6,
            ease: "power4.inOut",
          },
          "-=0.1"
        );


      }
    });

    return () => ctx.revert();
  }, [isMenuOpen]);

  // Close menu on route change
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    if (prevLocation.current !== location.pathname) {
      prevLocation.current = location.pathname;
      if (isMenuOpen) {
        requestAnimationFrame(closeMenu);
      }
    }
  }, [location.pathname, isMenuOpen, closeMenu]);

  // Magnetic link effect
  const handleLinkMouseMove = (e, index) => {
    if (prefersReducedMotion()) return;

    const link = linksRef.current[index];
    if (!link) return;

    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(link, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleLinkMouseLeave = (index) => {
    if (prefersReducedMotion()) return;

    gsap.to(linksRef.current[index], {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  };

  // Navigation links - built dynamically
  const getNavLinks = () => {
    const links = [
      { to: "/products", label: "Products" },
    ];

    if (isAuthenticated) {
      const cartLabel = cartCount > 0 ? `Cart (${cartCount})` : "Cart";
      links.push({ to: "/cart", label: cartLabel });

      if (isVendor) {
        links.push({ to: "/vendor/dashboard", label: "Dashboard" });
      } else {
        links.push({ to: "/orders", label: "Orders" });
      }
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <>
      <nav
        ref={navRef}
        className={`nav ${isScrolled ? "nav--scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          backgroundColor: "transparent",
          borderBottom: "none",
          transition: "background-color 0.8s, border-color 0.8s",
          pointerEvents: "none",
          visibility: isPreloaderFinished ? "visible" : "hidden",
        }}
      >
        {/* Progressive Blur Layers */}
        {/* New Progressive Blur Structure */}
        <div className="gradient-blur" style={{
          position: "absolute",
          zIndex: -1,
          inset: "0 0 auto 0",
          height: "100%",
          pointerEvents: "none",
          opacity: 1,
        }}>
          {/* Top-heavy fade: 64px at top -> 0.5px at bottom */}
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(64px)", zIndex: 8, mask: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,0) 25%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,0) 25%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(32px)", zIndex: 7, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(16px)", zIndex: 6, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,0) 50%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,0) 50%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", zIndex: 5, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 62.5%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 62.5%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(4px)", zIndex: 4, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,0) 75%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,0) 75%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(2px)", zIndex: 3, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 87.5%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 87.5%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(1px)", zIndex: 2, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(0.5px)", zIndex: 1, mask: "linear-gradient(to bottom, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)", WebkitMask: "linear-gradient(to bottom, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)" }} />

        </div>

        <div style={{
          maxWidth: "1260px",
          margin: "0 auto",
          width: "100%",
          padding: "1.5rem var(--space-lg)", // Reduced height as requested
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "none",
          pointerEvents: "auto",
        }}>

          {/* Logo */}
          <Link
            to="/"
            ref={logoRef}
            className="nav__logo"
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              alignItems: "center"
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                fontFamily: 'var(--font-display)',
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center"
              }}
            >
              <span style={{ color: "var(--fg)" }}>SOK</span>
              <span style={{ color: "var(--muted)", margin: "0 1px" }}>[</span>
              <ScrambleChar frequency={12} hueSpeed={45} />
              <span style={{ color: "var(--muted)", margin: "0 1px" }}>]</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div
            className="nav__links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                ref={(el) => (linksRef.current[index] = el)}
                onMouseMove={(e) => handleLinkMouseMove(e, index)}
                onMouseLeave={() => handleLinkMouseLeave(index)}
                className="nav__link"
                style={{
                  textDecoration: "none",
                  color: "var(--fg)",
                  padding: "1rem 1.75rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "0",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span
                  className="nav__link-bubble"
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "var(--fg)",
                    transform: "translateY(100%)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                />
                <span
                  className="nav__link-text"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            ))}


            {/* Auth Links */}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  ref={(el) => (linksRef.current[navLinks.length] = el)}
                  onMouseMove={(e) => handleLinkMouseMove(e, navLinks.length)}
                  onMouseLeave={() => handleLinkMouseLeave(navLinks.length)}
                  className="nav__link"
                  style={{
                    textDecoration: "none",
                    color: "var(--fg)",
                    padding: "1rem 1.75rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    position: "relative",
                    overflow: "hidden",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <span className="nav__link-bubble" style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "var(--fg)", transform: "translateY(100%)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)", zIndex: 0,
                  }} />
                  <span className="nav__link-text" style={{ position: "relative", zIndex: 1, transition: "color 0.4s" }}>
                    Login
                  </span>
                </Link>
                <Link
                  to="/register"
                  ref={(el) => (linksRef.current[navLinks.length + 1] = el)}
                  onMouseMove={(e) => handleLinkMouseMove(e, navLinks.length + 1)}
                  onMouseLeave={() => handleLinkMouseLeave(navLinks.length + 1)}
                  className="nav__link nav__link--register"
                  style={{
                    textDecoration: "none",
                    color: "var(--fg)",
                    background: "transparent",
                    padding: "1rem 1.75rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    position: "relative",
                    overflow: "hidden",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <span className="nav__link-bubble" style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "var(--fg)", transform: "translateY(100%)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)", zIndex: 0,
                  }} />
                  <span className="nav__link-text" style={{ position: "relative", zIndex: 1, transition: "color 0.4s" }}>
                    Register
                  </span>
                </Link>
              </>
            ) : (
              <>
                <UserDropdown>
                  <span 
                    style={{
                      padding: "0.5rem 3rem 0.5rem 1rem",
                      fontSize: "0.85rem",
                      color: "var(--muted)",
                      fontWeight: 500,
                      transition: "color 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => e.target.style.color = "var(--fg)"}
                    onMouseLeave={(e) => e.target.style.color = "var(--muted)"}
                  >
                    {user?.name}
                  </span>
                </UserDropdown>
                <button
                  onClick={logout}
                  style={{
                    textDecoration: "none",
                    color: "var(--fg)",
                    padding: "1rem 1.75rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: "transparent",
                    border: "1px solid var(--fg)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    fontFamily: "var(--font-sans)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--fg)";
                    e.target.style.color = "var(--bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "var(--fg)";
                  }}
                >
                  Logout
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              ref={menuRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="nav__menu-btn"
              aria-label="Toggle menu"
              style={{
                display: "none",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "48px",
                height: "48px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                gap: "6px",
                marginLeft: "1rem",
              }}
            >
              <span style={{
                width: "24px", height: "2px", backgroundColor: "var(--fg)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                transformOrigin: "center",
                transform: isMenuOpen ? "rotate(45deg) translate(5px, 6px)" : "none",
              }} />
              <span style={{
                width: "24px", height: "2px", backgroundColor: "var(--fg)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: isMenuOpen ? 0 : 1,
              }} />
              <span style={{
                width: "24px", height: "2px", backgroundColor: "var(--fg)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                transformOrigin: "center",
                transform: isMenuOpen ? "rotate(-45deg) translate(5px, -6px)" : "none",
              }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Mobile Menu Overlay */}
      <div
        ref={menuOverlayRef}
        className="nav__overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundColor: "var(--bg)",
          zIndex: 999,
          display: "none",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {navLinks.map((link, index) => (
          <Link
            key={link.to}
            to={link.to}
            ref={(el) => (menuItemsRef.current[index] = el)}
            onClick={closeMenu}
            style={{
              textDecoration: "none",
              color: "var(--fg)",
              fontSize: "2rem",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {link.label}
          </Link>
        ))}
        {!isAuthenticated ? (
          <>
            <Link to="/login" onClick={closeMenu} ref={(el) => (menuItemsRef.current[navLinks.length] = el)}
              style={{ textDecoration: "none", color: "var(--fg)", fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
              Login
            </Link>
            <Link to="/register" onClick={closeMenu} ref={(el) => (menuItemsRef.current[navLinks.length + 1] = el)}
              style={{ textDecoration: "none", color: "var(--fg)", fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase" }}>
              Register
            </Link>
          </>
        ) : (
          <button onClick={() => { logout(); closeMenu(); }} ref={(el) => (menuItemsRef.current[navLinks.length] = el)}
            style={{ background: "transparent", border: "none", color: "var(--fg)", fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", textTransform: "uppercase", cursor: "pointer" }}>
            Logout
          </button>
        )}
      </div>

      <style>{`
        .nav__link:hover .nav__link-bubble {
          transform: translateY(0) !important;
        }
        .nav__link:hover .nav__link-text {
          color: var(--bg) !important;
        }

        @media (max-width: 968px) {
          .nav__links > a,
          .nav__links > span,
          .nav__links > button:not(.nav__menu-btn) {
            display: none !important;
          }
          .nav__menu-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navigation;

