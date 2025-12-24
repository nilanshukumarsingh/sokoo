/**
 * Orders Page
 * User's order history with status tracking
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../utils/api';
import Footer from '../components/Footer';

const OrdersPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/orders' } } });
            return;
        }

        // Check for order success notification
        if (location.state?.orderPlaced) {
            setNotification('Order placed successfully!');
            setTimeout(() => setNotification(null), 5000);
            // Clear the state
            window.history.replaceState({}, document.title);
        }

        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getMyOrders();
            setOrders(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#10b981';
            case 'shipped': return '#3b82f6';
            case 'processing': return '#8b5cf6';
            case 'cancelled': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--bg)',
            }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '2px solid var(--border)',
                        borderTopColor: 'var(--fg)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)',
        }}>
            {/* Success Notification */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '1rem 2rem',
                    background: '#10b981',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    zIndex: 1000,
                }}>
                    {notification}
                </div>
            )}

            <div style={{
                flex: 1,
                padding: 'var(--space-lg)',
                paddingTop: '108px',
            }}>
                <div style={{ maxWidth: '1260px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.04em',
                            marginBottom: '0.5rem',
                            color: 'var(--fg)',
                        }}>
                            Your Orders
                        </h1>
                        <p style={{ color: 'var(--muted)' }}>
                            Track and manage your orders
                        </p>
                    </div>

                    {orders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '6rem 2rem',
                            background: 'var(--bg-alt)',
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                marginBottom: '1rem',
                                color: 'var(--fg)',
                            }}>
                                No orders yet
                            </h2>
                            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
                                Start shopping to place your first order.
                            </p>
                            <Link
                                to="/products"
                                style={{
                                    display: 'inline-block',
                                    padding: '1rem 2rem',
                                    background: 'var(--fg)',
                                    color: 'var(--bg)',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    style={{
                                        padding: '1.5rem',
                                        background: 'var(--bg-alt)',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    {/* Order Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1.5rem',
                                        flexWrap: 'wrap',
                                        gap: '1rem',
                                    }}>
                                        <div>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                marginBottom: '0.25rem',
                                            }}>
                                                Order
                                            </p>
                                            <p style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '1.2rem',
                                                fontWeight: 600,
                                            }}>
                                                #{order._id.slice(-8).toUpperCase()}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{
                                                padding: '0.35rem 0.75rem',
                                                background: getStatusColor(order.status),
                                                color: '#fff',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div style={{
                                        marginBottom: '1.5rem',
                                        paddingBottom: '1.5rem',
                                        borderBottom: '1px solid var(--border)',
                                    }}>
                                        {order.products?.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '0.75rem',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{ fontSize: '0.95rem' }}>
                                                        {item.product?.name || 'Product'} × {item.quantity}
                                                    </span>
                                                </div>
                                                <span style={{ fontWeight: 500 }}>
                                                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* View Details Link */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        marginBottom: '1rem', 
                                    }}>
                                         <Link 
                                            to={`/orders/${order._id}`}
                                            style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                color: 'var(--fg)',
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            View Order Details
                                        </Link>
                                    </div>

                                    {/* Order Footer */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '1rem',
                                    }}>
                                        {/* Shipping Address */}
                                        <div>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                marginBottom: '0.25rem',
                                            }}>
                                                Ship to
                                            </p>
                                            <p style={{ fontSize: '0.9rem' }}>
                                                {order.shippingAddress?.city}, {order.shippingAddress?.country}
                                            </p>
                                        </div>

                                        {/* Total */}
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                marginBottom: '0.25rem',
                                            }}>
                                                Total
                                            </p>
                                            <p style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '1.25rem',
                                                fontWeight: 700,
                                            }}>
                                                ${order.totalAmount?.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OrdersPage;
