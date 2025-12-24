/**
 * Toast Notification Component
 * Animated toast notifications that appear at top-center of screen
 */

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Check, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    const toastRef = useRef(null);

    useEffect(() => {
        if (!toastRef.current) return;

        // Animate in
        gsap.fromTo(toastRef.current,
            { y: -50, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
        );

        // Auto dismiss after 3 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        if (!toastRef.current) return;

        gsap.to(toastRef.current, {
            y: -20,
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.in",
            onComplete: onClose
        });
    };

    const bgColor = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';

    return (
        <div
            ref={toastRef}
            style={{
                position: 'fixed',
                top: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 1.35rem',
                background: bgColor,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.81rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                maxWidth: '90vw',
                minWidth: '400px',
            }}
        >
            {type === 'error' ? (
                <AlertTriangle size={16} strokeWidth={2.5} />
            ) : type === 'warning' ? (
                <AlertTriangle size={16} strokeWidth={2.5} />
            ) : (
                <Check size={16} strokeWidth={2.5} />
            )}
            <span>{message}</span>
            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    padding: '0.18rem',
                    marginLeft: '0.45rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.8,
                }}
            >
                <X size={14} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default Toast;
