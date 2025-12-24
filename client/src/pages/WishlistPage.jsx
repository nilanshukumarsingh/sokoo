/**
 * Wishlist Page
 * Displays user's wishlisted products
 */

import { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
    const { user, updateUser } = useAuth(); // We might need to update user if we remove from wishlist
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchWishlistProducts();
    }, [user]);

    const fetchWishlistProducts = async () => {
        if (!user || !user.wishlist || user.wishlist.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // We need to fetch details for each product ID
            // Ideally backend should have an endpoint for this, but for now we might have to fetch individually
            // OR checks if getAll supports 'ids' array. existing API seems to be getAll(params).
            // Let's try to fetch all products and filter locally if there's no better way, 
            // OR fetch one by one. Fetching one by one is bad for performance.
            // A better approach if backend supports it: productsAPI.getAll({ ids: user.wishlist })
            // Looking at previous patterns, let's assume we might need to fetch all and filter or add a backend endpoint?
            // The user said "dont change others code" (unless necessary for the task).
            // A common pattern in standard MERN is to have getWishlist logic.
            // Let's try to fetch using Promise.all for now as it's the safest frontend-only solution without new backend endpoints.
            
            const promises = user.wishlist.map(id => productsAPI.getById(id).catch(() => null));
            const responses = await Promise.all(promises);
            const validProducts = responses
                .filter(res => res && res.data && res.data.data)
                .map(res => res.data.data);
            
            setProducts(validProducts);
        } catch (err) {
            console.error("Failed to fetch wishlist", err);
            setError("Failed to load wishlist items");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
         // Logic to remove... 
         // Since ProductCard usually handles toggle, we might need to pass a callback or just let it update context
         // If ProductCard calls handleWishlist internally, it updates auth context.
         // We should listen to user changes to re-render.
         // Effectively `fetchWishlistProducts` depends on `user`, so if `user.wishlist` changes, it re-runs.
         // However, we want to optimistically update or just wait for re-fetch.
    };

    // We can reuse ProductCard. It usually has a heart icon.
    // If we want to remove items, clicking the heart in ProductCard (which is likely red) should toggle it off.

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{
                flex: 1,
                maxWidth: '1260px',
                margin: '0 auto',
                padding: 'var(--space-lg)',
                paddingTop: '120px', // Header space
                width: '100%',
            }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        color: 'var(--fg)',
                        marginBottom: '1rem'
                    }}>
                        My Wishlist
                    </h1>
                    <p style={{ color: 'var(--muted)' }}>
                        {products.length} {products.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
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
                ) : error ? (
                    <div style={{ textAlign: 'center', color: '#ef4444' }}>{error}</div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--fg)' }}>Your wishlist is empty</h2>
                        <Link to="/products" style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            background: 'var(--fg)',
                            color: 'var(--bg)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Slightly larger cards for wishlist
                        gap: '2rem',
                    }}>
                        {products.map(product => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                // We don't need special handlers if ProductCard handles its own logic, 
                                // but we might want to refresh list if item is removed.
                                // Since `user` context updates on toggle, and we listen to `user`, this page should auto-update.
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default WishlistPage;
