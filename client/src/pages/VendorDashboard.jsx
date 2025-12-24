/**
 * Vendor Dashboard
 * Main vendor page with stats overview and quick links
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, productsAPI, ordersAPI } from '../utils/api';
import { DollarSign, Package, Tag, Clock, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import RevenueChart from '../components/RevenueChart';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

const VendorDashboard = () => {
    const { user, isVendor, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Container ref for GSAP scope
    const dashboardRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!isVendor) {
            navigate('/');
            return;
        }
        fetchData();
    }, [isAuthenticated, isVendor]);

    const fetchData = async () => {
        try {
            const [analyticsRes, ordersRes, productsRes] = await Promise.all([
                analyticsAPI.getVendor().catch(() => ({ data: { data: {} } })),
                ordersAPI.getVendorOrders().catch(() => ({ data: { data: [] } })),
                productsAPI.getVendorProducts().catch(() => ({ data: { data: [] } })),
            ]);

            setStats(analyticsRes.data.data);
            setRecentOrders(ordersRes.data.data?.slice(0, 5) || []);
            setProducts(productsRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    // GSAP Animations
    useGSAP(() => {
        // Skip animations if loading or if user prefers reduced motion
        if (loading) return;

        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReduced) return;

        // Animate metric cards entry - REMOVED TO FIX VISIBILITY
        // gsap.from('.metric-card', {
        //     y: 20,
        //     opacity: 0,
        //     duration: 0.6,
        //     stagger: 0.15,
        //     ease: 'power2.out',
        // });
        
        // Ensure they are visible
        gsap.set('.metric-card', { opacity: 1, y: 0 });

        // Animate counters
        const counters = document.querySelectorAll('.metric-value');
        counters.forEach(counter => {
            const rawValue = counter.getAttribute('data-value');
            if (!rawValue) return;
            
            // Clean value to get number
            const isCurrency = rawValue.includes('$');
            const endValue = parseFloat(rawValue.replace(/[^0-9.-]+/g, ''));
            
            if (isNaN(endValue)) return;

            const proxy = { val: 0 };
            
            gsap.to(proxy, {
                val: endValue,
                duration: 1,
                ease: 'power2.out',
                onUpdate: () => {
                    const formatted = isCurrency 
                        ? `$${proxy.val.toFixed(2)}` 
                        : Math.floor(proxy.val).toString();
                    counter.innerText = formatted;
                }
            });
        });

    }, { scope: dashboardRef, dependencies: [loading, stats] });

    // Hover effects using contextSafe
    const { contextSafe } = useGSAP({ scope: dashboardRef });

    const handleMouseEnter = contextSafe((e) => {
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReduced) return;
        
        gsap.to(e.currentTarget, {
            scale: 1.02,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    const handleMouseLeave = contextSafe((e) => {
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReduced) return;

        gsap.to(e.currentTarget, {
            scale: 1,
            boxShadow: 'none', 
            clearProps: 'boxShadow',
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    const displayStats = {
        totalRevenue: stats?.totalRevenue || 0,
        totalItemsSold: stats?.totalItemsSold || 0,
        productsCount: products.length,
        pendingOrders: recentOrders.filter(o => o.status === 'pending' || o.status === 'processing').length
    };

    const statCards = [
        { label: 'Total Revenue', value: `$${displayStats.totalRevenue.toFixed(2)}`, raw: displayStats.totalRevenue, isCurrency: true, icon: <DollarSign size={24} /> },
        { label: 'Items Sold', value: displayStats.totalItemsSold, raw: displayStats.totalItemsSold, isCurrency: false, icon: <Package size={24} /> },
        { label: 'Products', value: displayStats.productsCount, raw: displayStats.productsCount, isCurrency: false, icon: <Tag size={24} /> },
        { label: 'Pending Orders', value: displayStats.pendingOrders, raw: displayStats.pendingOrders, isCurrency: false, icon: <Clock size={24} /> },
    ];

    const revenueData = React.useMemo(() => {
        return stats?.salesHistory || [];
    }, [stats]);

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
                    width: '40px',
                    height: '40px',
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
            <div ref={dashboardRef} style={{
                flex: 1,
                padding: 'var(--space-lg)',
                paddingTop: '0',
            }}>
                <div style={{ maxWidth: '1260px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '3rem' }}>
                        <p style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: 'var(--muted)',
                            marginBottom: '0.5rem',
                        }}>
                            Vendor Dashboard
                        </p>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 700,
                            letterSpacing: '-0.04em',
                            color: 'var(--fg)',
                        }}>
                            Welcome back, <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>{user?.name}</span>
                        </h1>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem',
                    }}>
                        {statCards.map((stat, i) => (
                            <div
                                key={i}
                                className="metric-card"
                                style={{
                                    padding: '2rem',
                                    background: 'var(--bg-alt)',
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'block' }}>{stat.icon}</span>
                                <p style={{
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-display)',
                                    marginBottom: '0.5rem',
                                }}>
                                    <span 
                                        className="metric-value" 
                                        data-value={stat.isCurrency ? `$${stat.raw.toFixed(2)}` : stat.raw}
                                    >
                                        {stat.isCurrency ? '$0.00' : '0'}
                                    </span>
                                </p>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Revenue Chart */}
                    <RevenueChart dataPoints={revenueData} />

                    {/* Quick Links */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
                        gap: '2rem',
                        marginBottom: '4rem',
                    }}>
                        <Link
                            to="/vendor/products"
                            style={{
                                padding: '2rem',
                                background: '#ffffff',
                                color: '#000000',
                                textDecoration: 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'none',
                            }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '0.5rem',
                                    color: '#000000',
                                }}>
                                    Manage Products
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#333333' }}>
                                    Add, edit, or remove your products
                                </p>
                            </div>
                            <ArrowRight size={24} color="#000000" />
                        </Link>

                        <Link
                            to="/vendor/orders"
                            style={{
                                padding: '2rem',
                                background: 'var(--bg-alt)',
                                color: 'var(--fg)',
                                textDecoration: 'none',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'none',
                            }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '0.5rem',
                                }}>
                                    View Orders
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                                    Track and manage customer orders
                                </p>
                            </div>
                            <ArrowRight size={24} />
                        </Link>
                    </div>

                    {/* Recent Orders */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.5rem',
                                fontWeight: 600,
                            }}>
                                Recent Orders
                            </h2>
                            <Link to="/vendor/orders" style={{
                                color: 'var(--muted)',
                                fontSize: '0.9rem',
                            }}>
                                View all →
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <p style={{ color: 'var(--muted)', padding: '2rem', background: 'var(--bg-alt)', textAlign: 'center' }}>
                                No orders yet. Products you sell will appear here.
                            </p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '0.9rem',
                                }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Order ID</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Customer</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Total</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    {order._id.slice(-8).toUpperCase()}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {order.parentOrder?.user?.name || 'Customer'}
                                                </td>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                                    ${order.totalAmount?.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: order.status === 'delivered' ? '#10b981' :
                                                            order.status === 'shipped' ? '#3b82f6' :
                                                                order.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                                                        color: '#fff',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VendorDashboard;
