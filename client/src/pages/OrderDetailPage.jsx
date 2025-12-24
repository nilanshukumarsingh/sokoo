import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Package, MapPin, Clock, ArrowLeft, AlertTriangle, HelpCircle, CreditCard } from 'lucide-react';
import Footer from '../components/Footer';
import ConfirmationModal from '../components/ConfirmationModal';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { showToast } = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    
    // Polling ref
    const pollInterval = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        // Initial fetch
        fetchOrder();

        // Start polling every 5 seconds for "live" updates
        pollInterval.current = setInterval(() => {
            fetchOrder({ silent: true });
        }, 5000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [id, isAuthenticated]);

    const fetchOrder = async (options = {}) => {
        try {
            const response = await ordersAPI.getMyOrders();
            const foundOrder = response.data.data.find(o => o._id === id);
            
            if (foundOrder) {
                setOrder(foundOrder);
            }
        } catch (err) {
            console.error('Failed to fetch order:', err);
        } finally {
            if (!options.silent) setLoading(false);
        }
    };

    const handleCancelClick = () => {
        setShowCancelModal(true);
    };

    const handleConfirmCancel = async () => {
        setShowCancelModal(false);
        setCancelling(true);
        try {
            await ordersAPI.cancel(id);
            showToast('Order cancelled successfully');
            fetchOrder(); // Update immediate
        } catch (err) {
            console.error('Failed to cancel:', err);
            showToast(err.response?.data?.error || 'Failed to cancel order', 'error');
        } finally {
            setCancelling(false);
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
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg)',
            }}>
                <div style={{
                    width: '36px', height: '36px',
                    border: '2px solid var(--border)', borderTopColor: 'var(--fg)',
                    borderRadius: '50%', animation: 'spin 1s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '100px 20px', textAlign: 'center' }}>
                <h1>Order not found</h1>
                <Link to="/orders" style={{ color: 'var(--fg)', textDecoration: 'underline' }}>Back to Orders</Link>
            </div>
        );
    }

    // Determine if cancellable (Pending or Processing)
    const isCancellable = ['pending', 'processing'].includes(order.status);

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
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/orders" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px',
                            background: 'var(--bg-alt)', borderRadius: '50%',
                            color: 'var(--fg)', textDecoration: 'none'
                        }}>
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                            fontWeight: 700,
                            margin: 0,
                            lineHeight: 1,
                        }}>
                            Order Details
                        </h1>
                    </div>

                    {/* Content Grid */}
                    <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        
                        {/* Left Column: Items */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{
                                background: 'var(--bg-alt)',
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</p>
                                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>#{order._id}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.4rem 0.8rem', background: getStatusColor(order.status),
                                            color: '#fff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                                            borderRadius: '4px'
                                        }}>
                                            {order.status === 'processing' && <span className="pulse-dot"></span>}
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                                
                                <style>{`
                                    .pulse-dot {
                                        width: 8px; height: 8px; background: #fff; borderRadius: 50%;
                                        animation: pulse 1.5s infinite;
                                    }
                                    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
                                `}</style>

                                {/* Items List */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {order.products.map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem 0', borderBottom: '1px dashed var(--border)'
                                        }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '48px', height: '48px',
                                                    background: '#000', borderRadius: '4px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <Package size={20} color="#fff" />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600 }}>{item.product?.name || 'Product Details Unavailable'}</p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Qty: {item.quantity} × ${item.product?.price}</p>
                                                </div>
                                            </div>
                                            <p style={{ fontWeight: 600 }}>${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                                    <p style={{ fontSize: '1rem', fontWeight: 600 }}>Total Amount</p>
                                    <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>${order.totalAmount?.toFixed(2)}</p>
                                </div>

                                {/* Cancellation Section */}
                                {isCancellable && (
                                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                                                <AlertTriangle size={16} />
                                                <span>Need to change something?</span>
                                            </div>
                                            <button
                                                onClick={handleCancelClick}
                                                disabled={cancelling}
                                                style={{
                                                    padding: '0.6rem 1.2rem',
                                                    background: 'transparent',
                                                    border: '1px solid #ef4444',
                                                    color: '#ef4444',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem',
                                                    textTransform: 'uppercase',
                                                    cursor: cancelling ? 'wait' : 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
                                                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ef4444'; }}
                                            >
                                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Info */}
                        <div style={{
                            gridColumn: '1 / -1',
                            background: 'var(--bg-alt)',
                            padding: '1.5rem',
                            border: '1px solid var(--border)',
                        }}>
                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                {/* Shipping & Timeline */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--muted)' }}>
                                        <MapPin size={18} />
                                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600 }}>Shipping Address</span>
                                    </div>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{order.shippingAddress?.city}</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                                            {order.shippingAddress?.address}<br/>
                                            {order.shippingAddress?.state}, {order.shippingAddress?.postalCode}<br/>
                                            {order.shippingAddress?.country}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--muted)' }}>
                                        <Clock size={18} />
                                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600 }}>Timeline</span>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            <span style={{ color: 'var(--muted)' }}>Placed on: </span>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                        {order.status === 'cancelled' && (
                                            <p style={{ fontSize: '0.9rem', color: '#ef4444' }}>
                                                Order Cancelled
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Payment Info */}
                                    <div style={{ marginTop: '2rem' }}>
                                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--muted)' }}>
                                            <CreditCard size={18} />
                                            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600 }}>Payment Info</span>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                <span style={{ color: 'var(--muted)' }}>Method: </span>
                                                <span style={{ fontWeight: 600 }}>{order.paymentMethod || 'Not specified'}</span>
                                            </p>
                                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                <span style={{ color: 'var(--muted)' }}>Status: </span>
                                                <span style={{ 
                                                    fontWeight: 600, 
                                                    color: order.isPaid ? '#10b981' : '#f59e0b' 
                                                }}>
                                                    {order.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </p>
                                            {order.paymentResult && order.paymentResult.receipt_url && (
                                                <a 
                                                    href={order.paymentResult.receipt_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        marginTop: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        color: '#635bff',
                                                        textDecoration: 'none',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    View Official Receipt &rarr;
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Help & Info */}
                                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--muted)' }}>
                                        <HelpCircle size={18} />
                                        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem', fontWeight: 600 }}>Help & Info</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Can I modify my order?</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                                Changes can be made while the order is in 'Pending' or 'Processing' state. Once shipped, modifications are not possible.
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>How do I track my package?</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                                Once your order is shipped, you will receive an email with a tracking number and a link to track your delivery in real-time.
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>When will I receive my refund?</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                                For cancelled orders, refunds are processed within 3-5 business days to your original payment method.
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Return Policy</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                                Items can be returned within 30 days of delivery. Ensure the product is unused and in original packaging.
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Customer Support</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                                Available Mon-Fri, 9am - 6pm EST. We typically respond to inquiries within 24 hours.
                                            </p>
                                        </div>
                                        <div style={{ paddingTop: '0.5rem' }}>
                                            <Link to="/contact" style={{ fontSize: '0.8rem', color: 'var(--fg)', textDecoration: 'underline' }}>
                                                Contact Support
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Order?"
                message="Are you sure you want to cancel this order? This action cannot be undone."
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep Order"
                isDangerous={true}
            />

            <Footer />
        </div>
    );
};

export default OrderDetailPage;
