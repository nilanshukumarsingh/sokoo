import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Footer from '../components/Footer';

const NotFoundPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)',
            color: 'var(--fg)',
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem',
            }}>
                <h1 style={{
                    fontSize: 'clamp(6rem, 20vw, 12rem)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    marginBottom: '0',
                    lineHeight: 0.8,
                    letterSpacing: '-0.05em',
                    background: 'linear-gradient(to bottom, var(--fg), #333)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    404
                </h1>
                <h2 style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    fontFamily: 'var(--font-display)',
                    marginBottom: '1.5rem',
                    fontWeight: 600,
                }}>
                    Page Not Found
                </h2>
                <p style={{
                    color: 'var(--muted)',
                    maxWidth: '400px',
                    marginBottom: '3rem',
                    lineHeight: 1.6,
                }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link to="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    background: 'var(--fg)',
                    color: 'var(--bg)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.9rem',
                    transition: 'opacity 0.2s',
                    border: 'none',
                }}>
                    <Home size={18} />
                    Back to Home
                </Link>
            </div>
            <Footer />
        </div>
    );
};

export default NotFoundPage;
