import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Footer from '../components/Footer';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const verificationCalled = useRef(false);

    const [order, setOrder] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
             const params = new URLSearchParams(window.location.search);
             const sessionId = params.get('session_id');

             if (!sessionId) {
                 return;
             }

             if (verificationCalled.current) return;
             verificationCalled.current = true;

             try {
                // Call verification API
                const { stripeAPI } = await import('../utils/api');
                const response = await stripeAPI.verifyPayment(sessionId);
                setOrder(response.data.data);
                showToast('Order placed successfully!', 'success');
             } catch (err) {
                 console.error('Payment Verification Failed', err);
                 // Only show toast if it's a real error, not just re-render
                 // But here we rely on the ref to prevent re-calls
                 showToast('Already processed or invalid session.', 'info');
             } finally {
                 // Clean up URL
                 window.history.replaceState({}, document.title, window.location.pathname);
             }
        };

        verifyPayment();
    }, [showToast, navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)',
        }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div style={{
                    marginBottom: '2rem',
                    color: '#22c55e', // Success Green
                    animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    <CheckCircle size={80} />
                </div>
                
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: 'var(--fg)',
                }}>
                    Payment Successful!
                </h1>
                
                <p style={{
                    fontSize: '1.2rem',
                    color: 'var(--muted)',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    lineHeight: 1.6
                }}>
                    Your order has been placed successfully. You will receive a confirmation email shortly.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/orders')}
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            background: 'var(--fg)',
                            color: 'var(--bg)',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        View Orders
                    </button>

                    {order && order.paymentResult && order.paymentResult.receipt_url && (
                        <a
                            href={order.paymentResult.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '8px',
                                background: '#635bff', // Stripe Blurple
                                color: 'white',
                                fontWeight: 600,
                                textDecoration: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            View Receipt
                        </a>
                    )}
                    
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: 'var(--fg)',
                            fontWeight: 600,
                            border: '1px solid var(--border)',
                            cursor: 'pointer'
                        }}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
            
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
            
            <Footer />
        </div>
    );
};

export default PaymentSuccessPage;
