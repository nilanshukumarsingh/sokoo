import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productsAPI, shopsAPI } from '../utils/api';
import { Plus, Edit2, Trash2, Store } from 'lucide-react';
import Footer from '../components/Footer';

const VendorProducts = () => {
    const { isVendor, isAuthenticated, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);
    const [shopMissing, setShopMissing] = useState(false);
    
    // Shop Creation State
    const [shopData, setShopData] = useState({ name: '', description: '' });
    const [creatingShop, setCreatingShop] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!isVendor) {
            navigate('/');
            return;
        }
        fetchProducts();
    }, [isAuthenticated, isVendor]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productsAPI.getVendorProducts();
            setProducts(response.data.data || []);
            setShopMissing(false);
        } catch (err) {
            // If 404, it means the vendor has no shop created yet
            if (err.response && err.response.status === 404) {
                setShopMissing(true);
            } else {
                console.error('Failed to fetch products:', err);
                showToast('Failed to load products', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShop = async (e) => {
        e.preventDefault();
        setCreatingShop(true);
        try {
            await shopsAPI.create(shopData);
            showToast('Shop created successfully!', 'success');
            setShopMissing(false);
            // After shop creation, user has 0 products, so valid empty list
            setProducts([]); 
        } catch (err) {
            console.error('Failed to create shop:', err);
            showToast(err.response?.data?.error || 'Failed to create shop', 'error');
        } finally {
            setCreatingShop(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        setDeleting(productId);
        try {
            await productsAPI.delete(productId);
            setProducts(products.filter(p => p._id !== productId));
            showToast('Product deleted successfully');
        } catch (err) {
            console.error('Failed to delete product:', err);
            showToast('Failed to delete product', 'error');
        } finally {
            setDeleting(null);
        }
    };

    const getImageUrl = (product) => {
        if (!product?.images?.[0]) return 'https://placehold.co/72x72/1a1a1a/666?text=No+Image';
        return product.images[0].startsWith('http')
            ? product.images[0]
            : `http://localhost:5000${product.images[0]}`;
    };

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

    // --- RENDER: SHOP CREATION FORM ---
    if (shopMissing) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, padding: 'var(--space-lg)', paddingTop: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ maxWidth: '500px', width: '100%', padding: '3rem', background: 'var(--bg-alt)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--fg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--bg)' }}>
                                <Store size={32} />
                            </div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>Setup Your Shop</h1>
                            <p style={{ color: 'var(--muted)' }}>You need to create a shop before adding products.</p>
                        </div>

                        <form onSubmit={handleCreateShop}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Shop Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={shopData.name}
                                    onChange={(e) => setShopData({...shopData, name: e.target.value})}
                                    placeholder="e.g. My Awesome Store"
                                    style={{ width: '100%', padding: '0.9rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: '6px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
                                <textarea 
                                    rows="3"
                                    value={shopData.description}
                                    onChange={(e) => setShopData({...shopData, description: e.target.value})}
                                    placeholder="Tell us about your shop..."
                                    style={{ width: '100%', padding: '0.9rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: '6px', resize: 'vertical' }}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={creatingShop}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--fg)',
                                    color: 'var(--bg)',
                                    border: 'none',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    borderRadius: '6px',
                                    cursor: creatingShop ? 'not-allowed' : 'pointer',
                                    opacity: creatingShop ? 0.7 : 1
                                }}
                            >
                                {creatingShop ? 'Creating Shop...' : 'Create Shop'}
                            </button>
                        </form>
                    </div>
                </div>
                <Footer />
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
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.8rem',
                        flexWrap: 'wrap',
                        gap: '0.9rem',
                    }}>
                        <div>
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
                                Your Products
                            </h1>
                        </div>
                        <Link
                            to="/vendor/products/new"
                            style={{
                                padding: '0.81rem 1.35rem',
                                background: 'var(--fg)',
                                color: 'var(--bg)',
                                border: 'none',
                                fontSize: '0.765rem',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.36rem',
                            }}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Add Product
                        </Link>
                    </div>

                    {/* Products List */}
                    {products.length === 0 ? (
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
                                No products yet
                            </h3>
                            <p style={{ color: 'var(--muted)', marginBottom: '1.35rem', fontSize: '0.81rem' }}>
                                Add your first product to start selling.
                            </p>
                            <Link
                                to="/vendor/products/new"
                                style={{
                                    padding: '0.81rem 1.35rem',
                                    background: 'var(--fg)',
                                    color: 'var(--bg)',
                                    border: 'none',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    fontSize: '0.81rem',
                                }}
                            >
                                Add Product
                            </Link>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.81rem',
                            }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '0.9rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.675rem' }}>Product</th>
                                        <th style={{ textAlign: 'left', padding: '0.9rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.675rem' }}>Price</th>
                                        <th style={{ textAlign: 'left', padding: '0.9rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.675rem' }}>Stock</th>
                                        <th style={{ textAlign: 'left', padding: '0.9rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.675rem' }}>Category</th>
                                        <th style={{ textAlign: 'right', padding: '0.9rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.675rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.9rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                                    <img
                                                        src={getImageUrl(product)}
                                                        alt={product.name}
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover', background: 'var(--bg-alt)' }}
                                                    />
                                                    <span style={{ fontWeight: 500 }}>{product.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.9rem', fontWeight: 600 }}>${product.price?.toFixed(2)}</td>
                                            <td style={{ padding: '0.9rem' }}>
                                                <span style={{
                                                    color: product.stock === 0 ? '#ef4444' : product.stock <= 5 ? '#f59e0b' : 'var(--fg)',
                                                }}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.9rem', color: 'var(--muted)' }}>{product.category || '—'}</td>
                                            <td style={{ padding: '0.9rem', textAlign: 'right' }}>
                                                <Link
                                                    to={`/vendor/products/${product._id}/edit`}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--border)',
                                                        color: 'var(--fg)',
                                                        padding: '0.45rem 0.9rem',
                                                        marginRight: '0.45rem',
                                                        fontSize: '0.72rem',
                                                        textDecoration: 'none',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.27rem',
                                                    }}
                                                >
                                                    <Edit2 size={12} strokeWidth={2} />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={deleting === product._id}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #ef4444',
                                                        color: '#ef4444',
                                                        padding: '0.45rem 0.9rem',
                                                        cursor: deleting === product._id ? 'not-allowed' : 'pointer',
                                                        fontSize: '0.72rem',
                                                        opacity: deleting === product._id ? 0.5 : 1,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.27rem',
                                                    }}
                                                >
                                                    <Trash2 size={12} strokeWidth={2} />
                                                    {deleting === product._id ? '...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VendorProducts;
