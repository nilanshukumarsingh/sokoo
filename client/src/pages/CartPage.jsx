    /**
 * Cart Page
 * Shopping cart with quantity controls and checkout CTA
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/cart' } } });
            return;
        }
        fetchCart();
    }, [isAuthenticated]);

    const fetchCart = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const response = await cartAPI.get();
            setCart(response.data.data);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        setUpdating(true);
        try {
            await cartAPI.removeItem(itemId);
            await fetchCart(false);
            window.dispatchEvent(new Event('cart-updated')); // Notify Navigation
        } catch (err) {
            console.error('Failed to remove item:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleClearCart = async () => {
        setUpdating(true);
        try {
            await cartAPI.clear();
            await fetchCart(false);
            window.dispatchEvent(new Event('cart-updated')); // Notify Navigation
        } catch (err) {
            console.error('Failed to clear cart:', err);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateQuantity = async (itemId, newQty) => {
        if (newQty < 1) return;
        setUpdating(true);
        try {
            await cartAPI.updateItem(itemId, newQty);
            await fetchCart(false);
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            console.error('Failed to update quantity:', err);
        } finally {
            setUpdating(false);
        }
    };

    const getTotal = () => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce((sum, item) => {
            const price = item.product?.price || item.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const getImageUrl = (product) => {
        if (!product?.images?.[0]) return 'https://placehold.co/100x100/1a1a1a/666?text=No+Image';
        return product.images[0].startsWith('http')
            ? product.images[0]
            : `http://localhost:5000${product.images[0]}`;
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

    const isEmpty = !cart?.items?.length;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)',
        }}>
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
                            Your Cart
                        </h1>
                        {!isEmpty && (
                            <p style={{ color: 'var(--muted)' }}>
                                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {isEmpty ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '6rem 2rem',
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                marginBottom: '1rem',
                                color: 'var(--fg)',
                            }}>
                                Your cart is empty
                            </h2>
                            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
                                Discover amazing products from our vendors.
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 350px',
                            gap: '4rem',
                            alignItems: 'start',
                        }}>
                            {/* Cart Items */}
                            <div>
                                {cart.items.map((item) => (
                                    <div
                                        key={item._id}
                                        style={{
                                            display: 'flex',
                                            gap: '1.5rem',
                                            padding: '1.5rem 0',
                                            borderBottom: '1px solid var(--border)',
                                            opacity: updating ? 0.5 : 1,
                                            transition: 'opacity 0.3s',
                                        }}
                                    >
                                        {/* Image */}
                                        <Link to={`/products/${item.product?._id}`}>
                                            <img
                                                src={getImageUrl(item.product)}
                                                alt={item.product?.name}
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    background: 'var(--bg-alt)',
                                                }}
                                            />
                                        </Link>

                                        {/* Details */}
                                        <div style={{ flex: 1 }}>
                                            <Link
                                                to={`/products/${item.product?._id}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'var(--fg)',
                                                }}
                                            >
                                                <h3 style={{
                                                    fontFamily: 'var(--font-display)',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    marginBottom: '0.5rem',
                                                }}>
                                                    {item.product?.name || 'Unknown Product'}
                                                </h3>
                                            </Link>

                                            {item.variant?.value && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                                                    {item.variant.value}
                                                </p>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                marginBottom: '1rem',
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '4px',
                                                }}>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                        disabled={updating || item.quantity <= 1}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'var(--fg)',
                                                            cursor: 'pointer',
                                                            fontSize: '1.2rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: item.quantity <= 1 ? 0.3 : 1,
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                    <span style={{
                                                        width: '40px',
                                                        textAlign: 'center',
                                                        fontWeight: 600,
                                                        fontSize: '0.9rem',
                                                    }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                        disabled={updating}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'var(--fg)',
                                                            cursor: 'pointer',
                                                            fontSize: '1.1rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    color: 'var(--muted)',
                                                }}>
                                                    × ${(item.product?.price || item.price || 0).toFixed(2)}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(item._id)}
                                                disabled={updating}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--muted)',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    padding: 0,
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {/* Subtotal */}
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                fontFamily: 'var(--font-display)',
                                            }}>
                                                ${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Clear Cart */}
                                <button
                                    onClick={handleClearCart}
                                    disabled={updating}
                                    style={{
                                        marginTop: '1.5rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'var(--muted)',
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div style={{
                                position: 'sticky',
                                top: '108px',
                                padding: '2rem',
                                background: 'var(--bg-alt)',
                            }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '1.5rem',
                                }}>
                                    Order Summary
                                </h2>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem',
                                    fontSize: '0.95rem',
                                }}>
                                    <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '1rem',
                                    fontSize: '0.95rem',
                                }}>
                                    <span style={{ color: 'var(--muted)' }}>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: '1.5rem',
                                    marginTop: '1.5rem',
                                    borderTop: '1px solid var(--border)',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                }}>
                                    <span>Total</span>
                                    <span>${getTotal().toFixed(2)}</span>
                                </div>

                                <Link
                                    to="/checkout"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        marginTop: '2rem',
                                        padding: '1rem',
                                        background: 'var(--fg)',
                                        color: 'var(--bg)',
                                        textDecoration: 'none',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                        transition: 'transform 0.3s',
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    Proceed to Checkout
                                </Link>

                                <Link
                                    to="/products"
                                    style={{
                                        display: 'block',
                                        marginTop: '1rem',
                                        textAlign: 'center',
                                        color: 'var(--muted)',
                                        fontSize: '0.9rem',
                                        textDecoration: 'underline',
                                    }}
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 1fr 350px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
            <Footer />
        </div>
    );
};

export default CartPage;
