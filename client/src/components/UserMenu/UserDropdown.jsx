import { useRef, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "../../context/AuthContext";

const UserDropdown = ({ children }) => {
    const { isVendor } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const containerRef = useRef(null);
    const itemsRef = useRef([]);

    useLayoutEffect(() => {
        if (!dropdownRef.current) return;

        const ctx = gsap.context(() => {
            if (isOpen) {
                // Set initial state for reveal
                gsap.set(dropdownRef.current, { 
                    display: "block",
                    clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                    opacity: 1
                });
                
                // Stagger items setup
                gsap.set(itemsRef.current, { y: 20, opacity: 0 });

                const tl = gsap.timeline();

                // Reveal dropdown
                tl.to(dropdownRef.current, {
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    duration: 0.5,
                    ease: "power3.inOut"
                });

                // Stagger items in
                tl.to(itemsRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.1,
                    ease: "power2.out"
                }, "-=0.2");

            } else {
                const tl = gsap.timeline({
                    onComplete: () => {
                        gsap.set(dropdownRef.current, { display: "none" });
                    }
                });

                // Fade out items first (faster)
                tl.to(itemsRef.current, {
                    y: -10,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.05,
                    ease: "power2.in"
                });

                // Collapse dropdown
                tl.to(dropdownRef.current, {
                    clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                    duration: 0.4,
                    ease: "power3.inOut"
                }, "-=0.1");
            }
        }, containerRef);

        return () => ctx.revert();
    }, [isOpen]);

    // Use the functions defined later


    const menuItems = [
        ...(isVendor ? [{ to: "/orders", label: "Orders" }] : []),
        { to: "/settings", label: "Settings" }
    ];

    const innerRef = useRef(null);

    useLayoutEffect(() => {
        if (!dropdownRef.current || !innerRef.current) return;

        const ctx = gsap.context(() => {
            if (isOpen) {
                gsap.set(dropdownRef.current, { display: "block" });
                
                // Reset state
                gsap.set(innerRef.current, { 
                    clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                    opacity: 1
                });
                gsap.set(itemsRef.current, { y: 20, opacity: 0 });

                const tl = gsap.timeline();

                // Smooth reveal
                tl.to(innerRef.current, {
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    duration: 0.4,
                    ease: "power2.out"
                });

                tl.to(itemsRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.3,
                    stagger: 0.05,
                    ease: "power2.out"
                }, "-=0.2");

            } else {
                const tl = gsap.timeline({
                    onComplete: () => {
                        gsap.set(dropdownRef.current, { display: "none" });
                    }
                });

                tl.to(itemsRef.current, {
                    y: -10,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.05,
                    ease: "power2.in"
                });

                tl.to(innerRef.current, {
                    clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                    duration: 0.3,
                    ease: "power3.inOut"
                }, "-=0.1");
            }
        }, containerRef);

        return () => ctx.revert();
    }, [isOpen]);

    // Hover animation for individual items
    const handleItemHover = (e, index) => {
        const item = itemsRef.current[index];
        if (!item) return;
        
        gsap.to(item, {
            x: 10,
            color: "#ffffff",
            duration: 0.3,
            ease: "power2.out"
        });
    };

    const handleItemLeave = (index) => {
        const item = itemsRef.current[index];
        if (!item) return;

        gsap.to(item, {
            x: 0,
            color: "var(--fg)",
            duration: 0.3,
            ease: "power2.out"
        });
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            style={{
                position: "relative",
                display: "inline-block",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
            }}
        >
            {children}

            {/* Dropdown Container (Invisible Bridge) */}
            <div
                ref={dropdownRef}
                style={{
                    position: "absolute",
                    top: "100%", 
                    right: "-1rem",
                    minWidth: "200px",
                    paddingTop: "1.5rem", // The bridge gap
                    display: "none",
                    zIndex: 1000,
                }}
            >
                {/* Visible Menu Box */}
                <div
                    ref={innerRef}
                    style={{
                        background: "#000000",
                        padding: "1.5rem",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {menuItems.map((item, index) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                ref={el => itemsRef.current[index] = el}
                                onMouseEnter={(e) => handleItemHover(e, index)}
                                onMouseLeave={() => handleItemLeave(index)}
                                style={{
                                    display: "block",
                                    color: "var(--fg)",
                                    textDecoration: "none",
                                    fontSize: "0.9rem",
                                    fontWeight: 500,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    opacity: 0,
                                    transform: "translateY(20px)"
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDropdown;
