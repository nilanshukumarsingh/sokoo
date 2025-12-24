import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { cartAPI, ordersAPI, stripeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import ConfirmationModal from '../components/ConfirmationModal';
import { CreditCard, Banknote } from 'lucide-react';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [notification, setNotification] = useState(null);

    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
            return;
        }
        fetchCart();
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const response = await cartAPI.get();
            const cartData = response.data.data;

            if (!cartData?.items?.length) {
                navigate('/cart');
                return;
            }

            setCart(cartData);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const getTotal = () => {
        if (!cart?.items?.length) return 0;
        return cart.items.reduce((sum, item) => {
            const price = item.product?.price || item.price || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleStripePayment = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const { data } = await stripeAPI.createCheckoutSession({ shippingAddress });
            if (data.url) {
                window.location.href = data.url;
            } else {
                setError('Failed to create payment session');
                setSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Payment initialization failed');
            setSubmitting(false);
        }
    };

    const handlePlaceOrderClick = (e) => {
        e.preventDefault();
        setError(null);
        
        // Validate Address
        const required = ['street', 'city', 'state', 'zipCode', 'country'];
        for (const field of required) {
            if (!shippingAddress[field].trim()) {
                setError(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return;
            }
        }

        // Validate Payment Method
        if (!paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        if (paymentMethod === 'card') {
             // Handle Stripe Payment
             handleStripePayment();
             return;
        }
        
        // Show Confirmation Modal for COD
        setShowConfirmModal(true);
    };

    const handleConfirmOrder = async () => {
        setShowConfirmModal(false);
        setSubmitting(true);
        setError(null);

        try {
            // Format products for order
            const products = cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
            }));

            await ordersAPI.create({
                products,
                shippingAddress,
                paymentMethod: 'COD' // Assuming backend handles this or defaults
            });

            // Clear cart
            await cartAPI.clear();

            // Navigate to orders page
            navigate('/orders', { state: { orderPlaced: true } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to place order. Please try again.');
            console.error(err);
            setSubmitting(false);
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

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        fontSize: '1rem',
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--fg)',
        outline: 'none',
        transition: 'border-color 0.3s',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--muted)',
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)',
        }}>
            {/* Notification Toast */}
            {notification && createPortal(
                <div style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '2rem',
                    padding: '1rem 1.5rem',
                    background: 'var(--fg)',
                    color: 'var(--bg)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    pointerEvents: 'none', // Ensure clicks pass through if covered, but it's a toast
                    animation: 'slideIn 0.3s ease-out forwards',
                }}>
                    {notification}
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                </div>,
                document.body
            )}

            <div style={{
                flex: 1,
                padding: 'var(--space-lg)',
                paddingTop: '108px',
            }}>
                <div style={{ maxWidth: '1260px', margin: '0 auto' }}>
                    {/* Breadcrumb */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Link to="/cart" style={{
                            color: 'var(--muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                        }}>
                            ← Back to Cart
                        </Link>
                    </div>

                    {/* Header */}
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.04em',
                        marginBottom: '3rem',
                        color: 'var(--fg)',
                    }}>
                        Checkout
                    </h1>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            marginBottom: '2rem',
                            background: 'rgba(220, 38, 38, 0.1)',
                            border: '1px solid rgba(220, 38, 38, 0.3)',
                            color: '#dc2626',
                            fontSize: '0.9rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 350px',
                        gap: '4rem',
                        alignItems: 'start',
                    }}>
                        {/* Checkout Form */}
                        <form onSubmit={handlePlaceOrderClick}>
                            
                            {/* Shipping Section */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '2rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    Shipping Address
                                </h2>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={labelStyle}>Street Address</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={shippingAddress.street}
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                        placeholder="123 Main Street"
                                        required
                                    />
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1.5rem',
                                    marginBottom: '1.5rem',
                                }}>
                                    <div>
                                        <label style={labelStyle}>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                            placeholder="New York"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>State / Province</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                            placeholder="NY"
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1.5rem',
                                    marginBottom: '2rem',
                                }}>
                                    <div>
                                        <label style={labelStyle}>ZIP / Postal Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                            placeholder="10001"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={shippingAddress.country}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--fg)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                            placeholder="United States"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Payment Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '2rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '1px solid var(--border)'
                                }}>
                                    Payment Method
                                </h2>

                                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                                    {/* COD Option */}
                                    <div 
                                        onClick={() => setPaymentMethod('cod')}
                                        style={{
                                            border: `1px solid ${paymentMethod === 'cod' ? 'var(--fg)' : 'var(--border)'}`,
                                            padding: '1.5rem',
                                            cursor: 'pointer',
                                            background: paymentMethod === 'cod' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            border: '2px solid var(--fg)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {paymentMethod === 'cod' && <div style={{ width: '10px', height: '10px', background: 'var(--fg)', borderRadius: '50%' }} />}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <Banknote size={20} />
                                                <span style={{ fontWeight: 600 }}>Cash on Delivery</span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Pay when you receive your order</p>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setPaymentMethod('card')}
                                        style={{
                                            border: `1px solid ${paymentMethod === 'card' ? 'var(--fg)' : 'var(--border)'}`,
                                            padding: '1.5rem',
                                            cursor: 'pointer',
                                            background: paymentMethod === 'card' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                        }}
                                    >
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            border: '2px solid var(--border)',
                                            borderColor: paymentMethod === 'card' ? 'var(--fg)' : 'var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {paymentMethod === 'card' && <div style={{ width: '10px', height: '10px', background: 'var(--fg)', borderRadius: '50%' }} />}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                <CreditCard size={20} />
                                                <span style={{ fontWeight: 600 }}>Credit / Debit Card</span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Pay securely via Stripe</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    padding: '1.1rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    background: 'var(--fg)',
                                    color: 'var(--bg)',
                                    border: 'none',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    opacity: submitting ? 0.7 : 1,
                                    transition: 'opacity 0.3s, transform 0.3s',
                                }}
                                onMouseEnter={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                {submitting ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </form>

                        {/* Order Summary */}
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

                            {/* Items */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                {cart?.items?.map((item) => (
                                    <div
                                        key={item._id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.75rem',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <span style={{ color: 'var(--muted)' }}>
                                            {item.product?.name} × {item.quantity}
                                        </span>
                                        <span>
                                            ${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid var(--border)',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                            }}>
                                <span>Total</span>
                                <span>${getTotal().toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmOrder}
                title="Confirm Order"
                message="Are you sure you want to place this order? Once placed, you cannot modify the order details, only cancellation will be available."
                confirmText="Place Order"
                cancelText="Review"
            />

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

export default CheckoutPage;
