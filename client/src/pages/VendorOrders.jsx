/**
 * Vendor Orders Page
 * Order management for vendors - view sub-orders and update status
 * Improved layout with better organization and 10% size reduction
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI } from '../utils/api';
import { Package, User, MapPin, Clock, ChevronDown } from 'lucide-react';
import Footer from '../components/Footer';

const VendorOrders = () => {
    const { isVendor, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!isVendor) {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, isVendor]);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getVendorOrders();
            setOrders(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            showToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, status: newStatus } : order
            ));
            showToast('Order status updated');
        } catch (err) {
            console.error('Failed to update status:', err);
            showToast('Failed to update status', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#10b981';
            case 'shipped': return '#3b82f6';
            case 'processing': return '#8b5cf6';
            case 'cancelled': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const getStatusCounts = () => {
        const counts = { all: orders.length };
        statusOptions.forEach(status => {
            counts[status] = orders.filter(o => o.status === status).length;
        });
        return counts;
    };

    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--bg)',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    border: '2px solid var(--border)',
                    borderTopColor: 'var(--fg)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                flex: 1,
                padding: 'var(--space-lg)',
                paddingTop: '0',
            }}>
                <div style={{ maxWidth: '1260px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '1.8rem' }}>
                        <Link to="/vendor/dashboard" style={{
                            color: 'var(--muted)',
                            fontSize: '0.765rem',
                            textDecoration: 'none',
                            display: 'block',
                            marginBottom: '0.45rem',
                        }}>
                            ← Back to Dashboard
                        </Link>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(1.8rem, 3.6vw, 2.7rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.04em',
                        }}>
                            Orders
                        </h1>
                    </div>

                    {/* Status Summary Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                        gap: '0.9rem',
                        marginBottom: '1.8rem',
                    }}>
                        {[
                            { key: 'pending', label: 'Pending', color: '#f59e0b' },
                            { key: 'processing', label: 'Processing', color: '#8b5cf6' },
                            { key: 'shipped', label: 'Shipped', color: '#3b82f6' },
                            { key: 'delivered', label: 'Delivered', color: '#10b981' },
                        ].map(({ key, label, color }) => (
                            <div
                                key={key}
                                onClick={() => setFilter(key)}
                                style={{
                                    padding: '0.9rem',
                                    background: filter === key ? 'var(--fg)' : 'var(--bg-alt)',
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <p style={{
                                    fontSize: '0.675rem',
                                    color: filter === key ? 'var(--bg)' : 'var(--muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '0.27rem',
                                }}>
                                    {label}
                                </p>
                                <p style={{
                                    fontSize: '1.35rem',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-display)',
                                    color: filter === key ? 'var(--bg)' : 'var(--fg)',
                                }}>
                                    {statusCounts[key]}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Filter Pills */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.45rem',
                        marginBottom: '1.8rem',
                    }}>
                        {['all', ...statusOptions].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                style={{
                                    padding: '0.45rem 0.9rem',
                                    background: filter === status ? 'var(--fg)' : 'transparent',
                                    color: filter === status ? 'var(--bg)' : 'var(--fg)',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.72rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {status} ({statusCounts[status] || 0})
                            </button>
                        ))}
                    </div>

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3.6rem 1.8rem',
                            background: 'var(--bg-alt)',
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.125rem',
                                marginBottom: '0.675rem',
                            }}>
                                No orders found
                            </h3>
                            <p style={{ color: 'var(--muted)', fontSize: '0.81rem' }}>
                                {filter === 'all'
                                    ? 'Orders for your products will appear here.'
                                    : `No ${filter} orders.`}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.35rem' }}>
                            {filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    style={{
                                        background: 'var(--bg-alt)',
                                        border: '1px solid var(--border)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* Order Header Row */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.9rem 1.35rem',
                                        borderBottom: '1px solid var(--border)',
                                        flexWrap: 'wrap',
                                        gap: '0.9rem',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                            <span style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                            }}>
                                                #{order._id.slice(-8).toUpperCase()}
                                            </span>
                                            <span style={{
                                                padding: '0.27rem 0.54rem',
                                                background: getStatusColor(order.status),
                                                color: '#fff',
                                                fontSize: '0.63rem',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                            }}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--muted)', fontSize: '0.765rem' }}>
                                            <Clock size={12} strokeWidth={2} />
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    {/* Order Content - 3 Column Grid */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: '1.35rem',
                                        padding: '1.35rem',
                                    }}>
                                        {/* Customer Info */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.36rem', marginBottom: '0.54rem' }}>
                                                <User size={12} strokeWidth={2} color="var(--muted)" />
                                                <span style={{ fontSize: '0.675rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    Customer
                                                </span>
                                            </div>
                                            <p style={{ fontWeight: 500, fontSize: '0.81rem', marginBottom: '0.18rem' }}>
                                                {order.parentOrder?.user?.name || 'Customer'}
                                            </p>
                                            <p style={{ fontSize: '0.765rem', color: 'var(--muted)' }}>
                                                {order.parentOrder?.user?.email}
                                            </p>
                                        </div>

                                        {/* Shipping Address */}
                                        {order.parentOrder?.shippingAddress && (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.36rem', marginBottom: '0.54rem' }}>
                                                    <MapPin size={12} strokeWidth={2} color="var(--muted)" />
                                                    <span style={{ fontSize: '0.675rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                        Shipping To
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.765rem', lineHeight: 1.4 }}>
                                                    {order.parentOrder.shippingAddress.address}<br />
                                                    {order.parentOrder.shippingAddress.city}, {order.parentOrder.shippingAddress.postalCode}<br />
                                                    {order.parentOrder.shippingAddress.country}
                                                </p>
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.36rem', marginBottom: '0.54rem' }}>
                                                <Package size={12} strokeWidth={2} color="var(--muted)" />
                                                <span style={{ fontSize: '0.675rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    Items
                                                </span>
                                            </div>
                                            {order.items?.map((item, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '0.765rem',
                                                        marginBottom: '0.27rem',
                                                    }}
                                                >
                                                    <span>{item.name} × {item.quantity}</span>
                                                    <span style={{ fontWeight: 500 }}>${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginTop: '0.54rem',
                                                paddingTop: '0.54rem',
                                                borderTop: '1px dashed var(--border)',
                                                fontWeight: 600,
                                                fontSize: '0.81rem',
                                            }}>
                                                <span>Total</span>
                                                <span>${order.totalAmount?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Actions Footer */}
                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                        <div style={{
                                            padding: '0.9rem 1.35rem',
                                            borderTop: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.02)',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                        }}>
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <select
                                                    value=""
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    disabled={updating === order._id}
                                                    style={{
                                                        padding: '0.45rem 2.25rem 0.45rem 0.9rem',
                                                        border: '1px solid var(--border)',
                                                        background: '#1a1a1a',
                                                        color: '#ffffff',
                                                        fontSize: '0.765rem',
                                                        cursor: updating === order._id ? 'not-allowed' : 'pointer',
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none',
                                                    }}
                                                >
                                                    <option value="" disabled style={{ background: '#1a1a1a', color: '#fff' }}>
                                                        Update status
                                                    </option>
                                                    {statusOptions
                                                        .filter(s => s !== order.status)
                                                        .map(status => (
                                                            <option key={status} value={status} style={{ background: '#1a1a1a', color: '#fff' }}>
                                                                Mark as {status}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                                <ChevronDown
                                                    size={12}
                                                    strokeWidth={2}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '0.63rem',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        pointerEvents: 'none',
                                                        color: 'var(--muted)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
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

export default VendorOrders;
