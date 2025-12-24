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

        // Animate in from bottom (since it's positioned at bottom-right)
        gsap.fromTo(toastRef.current,
            { y: 20, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }
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
            y: 20,
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
            onComplete: onClose
        });
    };

    const getColor = () => {
        switch (type) {
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#10b981';
        }
    };

    const color = getColor();

    return (
        <div
            ref={toastRef}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: '#ffffff',
                color: '#1a1a1a',
                fontWeight: 500,
                fontSize: '0.875rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                minWidth: 'auto',
                maxWidth: '320px',
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Accent colored line at the bottom instead of thick left border */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                background: color,
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                {type === 'error' ? (
                    <AlertTriangle size={18} strokeWidth={2.5} />
                ) : type === 'warning' ? (
                    <AlertTriangle size={18} strokeWidth={2.5} />
                ) : (
                    <Check size={18} strokeWidth={2.5} />
                )}
            </div>
            
            <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
            
            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    padding: '4px',
                    marginLeft: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
            >
                <X size={16} strokeWidth={2} />
            </button>
        </div>
    );
};

export default Toast;
