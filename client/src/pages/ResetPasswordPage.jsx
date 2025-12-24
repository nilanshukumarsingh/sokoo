/**
 * Reset Password Page
 * Allows users to set a new password using the token from email
 */

import { useState, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { authAPI } from '../utils/api';
import Footer from '../components/Footer';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    
    const { resetToken } = useParams();
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Entry animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(containerRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await authAPI.resetPassword(resetToken, password);
            setStatus('success');
            setMessage('Password reset successful! Redirecting to login...');
            
            // Redirect after delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'Failed to reset password. Token may be invalid or expired.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)'
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: '4rem 1rem'
            }}>
                <div ref={containerRef} style={{
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                         <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.04em',
                            marginBottom: '0.5rem',
                            color: 'var(--fg)'
                        }}>
                            Reset <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>Password</span>
                        </h1>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                            Create a new password for your account
                        </p>
                    </div>

                    {/* Status Messages */}
                    {status === 'success' && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            fontSize: '0.9rem',
                            borderRadius: '4px'
                        }}>
                            {message}
                        </div>
                    )}
                    
                    {status === 'error' && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            background: 'rgba(220, 38, 38, 0.1)',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            color: '#dc2626',
                            fontSize: '0.9rem',
                            borderRadius: '4px'
                        }}>
                            {message}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.4rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--muted)'
                            }}>
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '0.95rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                placeholder="Min 6 chars"
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.4rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--muted)'
                            }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    fontSize: '0.95rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                background: 'var(--fg)',
                                color: 'var(--bg)',
                                border: 'none',
                                cursor: (status === 'loading' || status === 'success') ? 'not-allowed' : 'pointer',
                                opacity: (status === 'loading' || status === 'success') ? 0.7 : 1,
                                transition: 'opacity 0.3s, transform 0.3s'
                            }}
                            onMouseEnter={(e) => (status !== 'loading' && status !== 'success') && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPasswordPage;
