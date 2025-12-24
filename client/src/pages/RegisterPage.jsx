/**
 * Register Page
 * Premium design with role selection (Customer/Vendor)
 */

import { useState, useRef, useLayoutEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const from = location.state?.from;
        const ctx = gsap.context(() => {
            if (from === 'login') {
                gsap.fromTo(containerRef.current,
                    { x: 50, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
                );
            } else {
                gsap.fromTo(containerRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
                );
            }
        }, containerRef);
        return () => ctx.revert();
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await register(name, email, password, role);

            // Redirect to Login
            navigate('/login', { 
                state: { 
                    message: res.data || 'Registration successful! Please login to verify.' 
                } 
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
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
                    <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.04em',
                            marginBottom: '0.4rem',
                            color: 'var(--fg)'
                        }}>
                            Join <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>us</span>
                        </h1>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                            Create your account to get started
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            background: 'rgba(220, 38, 38, 0.1)',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            color: '#dc2626',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '0.85rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.35rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--muted)'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.65rem',
                                    fontSize: '0.95rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                placeholder="John Doe"
                            />
                        </div>

                        <div style={{ marginBottom: '0.85rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.35rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--muted)'
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.65rem',
                                    fontSize: '0.95rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div style={{ marginBottom: '0.85rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.35rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--muted)'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '0.65rem',
                                    fontSize: '0.95rem',
                                    border: '1px solid var(--border)',
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Role Selection */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--muted)'
                            }}>
                                I want to
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setRole('user')}
                                    style={{
                                        flex: 1,
                                        padding: '0.7rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        background: role === 'user' ? 'var(--fg)' : 'transparent',
                                        color: role === 'user' ? 'var(--bg)' : 'var(--fg)',
                                        border: '1px solid var(--fg)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Shop
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('vendor')}
                                    style={{
                                        flex: 1,
                                        padding: '0.7rem',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        background: role === 'vendor' ? 'var(--fg)' : 'transparent',
                                        color: role === 'vendor' ? 'var(--bg)' : 'var(--fg)',
                                        border: '1px solid var(--fg)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Sell
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
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
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'opacity 0.3s, transform 0.3s'
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p style={{
                        marginTop: '1.25rem',
                        textAlign: 'center',
                        color: 'var(--muted)',
                        fontSize: '0.85rem'
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{
                            color: 'var(--fg)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            borderBottom: '1px solid var(--fg)'
                        }} state={{ from: 'register' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RegisterPage;
