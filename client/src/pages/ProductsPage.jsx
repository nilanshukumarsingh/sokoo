/**
 * Products Page
 * Product listing with search, filters, and grid layout
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { gsap } from 'gsap';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [brokenProducts, setBrokenProducts] = useState(new Set());
    const prevBtnRef = useRef(null);
    const nextBtnRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { showToast } = useToast();
    const { isAuthenticated } = useAuth();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);


    const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty'];

    useEffect(() => {
        // Update local state when URL params change
        setSearch(searchParams.get('search') || '');
        setCategory(searchParams.get('category') || '');
        setSort(searchParams.get('sort') || '-createdAt');
        setPage(parseInt(searchParams.get('page')) || 1);
        fetchProducts();
    }, [searchParams]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            const searchQuery = searchParams.get('search');
            const categoryQuery = searchParams.get('category');
            const sortQuery = searchParams.get('sort');

            if (searchQuery) params.search = searchQuery;
            if (categoryQuery) params.category = categoryQuery;
            if (sortQuery) params.sort = sortQuery;
            params.page = parseInt(searchParams.get('page')) || 1;
            params.limit = 36; // Show 24 products per page, but fetch 36 to have a buffer for broken images

            const response = await productsAPI.getAll(params);
            setProducts(response.data.data || []);
            // Reset broken products on new fetch
            setBrokenProducts(new Set());
            
            // Calculate total pages based on count and limit

            const count = response.data.count || 0;
            // The API response might have pagination metadata directly, or we infer from count if not provided
            setTotalPages(response.data.pagination && response.data.count ? Math.ceil(response.data.count / 24) : (response.data.total ? Math.ceil(response.data.total / 24) : 1));
             // Fallback if backend doesn't send total count but sends pagination object
             if (response.data.pagination && !response.data.total) {
                // If there is a 'next' page, we assume there are at least page + 1 pages
                // This is a bit loose but works if backend doesn't send total count
                if (response.data.pagination.next) {
                     setTotalPages(Math.max(totalPages, page + 1));
                }
             }

             // RE-CHECK: typical API structure from controller.js:
             // { success: true, count: 24, pagination: { next: ... }, data: [...] }
             // Wait, productController.js doesn't seem to return 'total' count of ALL matching documents for proper pagination calculation unless we check it.
             // Looking at productController.js: 
             // const total = await Product.countDocuments(parsedQuery);
             // ... returns count of FETCHED products not TOTAL products in 'count' field usually....
             // Let's re-read productController output.
             // It returns `count: products.length`.
             // It does NOT return the total count of documents matching the query in the top level response, only in internal logic.
             // Wait, line 52: `const total = await Product.countDocuments(parsedQuery);`
             // But line 61 res.json doesn't include `total`. It includes `count` which is `products.length`.
             // AND `pagination` object.
             // We can use `pagination.next` and `pagination.prev` to determine if buttons should be shown, 
             // but we might not know the exact "Total Pages" number without backend change.
             // For now, let's just use Next/Prev buttons based on `pagination` object presence.

        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        if (search) {
            newParams.set('search', search);
        } else {
            newParams.delete('search');
        }
        setSearchParams(newParams);
    };

    const handleCategoryChange = (cat) => {
        const newParams = new URLSearchParams(searchParams);
        if (cat === category) {
            newParams.delete('category');
            setCategory('');
        } else {
            newParams.set('category', cat);
            setCategory(cat);
        }
        setSearchParams(newParams);
    };

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSort(newSort);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sort', newSort);
        setSearchParams(newParams);
    };

    const handleAddToCart = (product) => {
        showToast(`Added ${product.name} to cart`);
    };

    const handleBtnMouseMove = (e, ref) => {
        const btn = ref.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out",
        });
    };

    const handleBtnMouseLeave = (ref) => {
        const btn = ref.current;
        if (!btn) return;
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)",
        });
    };

    const handleImageError = (productId) => {
        setBrokenProducts(prev => {
            const newSet = new Set(prev);
            newSet.add(productId);
            return newSet;
        });
    };

    // Filter broken products and take exactly 24
    const displayProducts = products
        .filter(p => !brokenProducts.has(p._id))
        .slice(0, 24);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Main Content Area */}
            <div style={{
                flex: 1,
                paddingTop: '0', // Keep top padding 0 to pull up
            }}>
                <div style={{
                    maxWidth: '1260px',
                    margin: '0 auto',
                    padding: '0 var(--space-lg)', // Moved padding here to match Navigation alignment
                    width: '100%',
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '3.6rem', padding: 'var(--space-lg) 0' }}>
                        <h1 style={{
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 900,
                            letterSpacing: '-0.03em',
                            margin: 0,
                            lineHeight: 1,
                            textTransform: 'uppercase',
                            color: 'var(--fg)',
                        }}>
                            Products
                        </h1>
                        <p style={{
                            fontSize: '1.2rem',
                            color: 'var(--muted)',
                            marginTop: '1rem',
                            maxWidth: '600px',
                            lineHeight: 1.5,
                        }}>
                            Discover products from the world's most innovative brands.
                        </p>
                    </div>

                    {/* Search & Filters Bar */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.9rem',
                        marginBottom: '2.7rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        {/* Search */}
                        <form onSubmit={handleSearch} style={{ flex: '1 1 270px', maxWidth: '360px' }}>
                            <div style={{ display: 'flex' }}>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products..."
                                    style={{
                                        flex: 1,
                                        padding: '0.81rem 0.9rem',
                                        border: '1px solid var(--border)',
                                        borderRight: 'none',
                                        background: 'transparent',
                                        color: 'var(--fg)',
                                        fontSize: '0.855rem',
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.81rem 1.35rem',
                                        background: 'var(--fg)',
                                        color: 'var(--bg)',
                                        border: 'none',
                                        fontSize: '0.765rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Sort Dropdown */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {/* Wishlist Button */}
                            {isAuthenticated && (
                                <Link
                                    to="/wishlist"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0.81rem 1.2rem',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'var(--fg)',
                                        fontSize: '0.81rem',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'var(--fg)';
                                        e.target.style.color = 'var(--bg)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.color = 'var(--fg)';
                                    }}
                                >
                                    My Wishlist
                                </Link>
                            )}
                            
                            <select
                                value={sort}
                                onChange={handleSortChange}
                                style={{
                                    padding: '0.81rem 0.9rem',
                                    border: '1px solid var(--border)',
                                    background: '#1a1a1a',
                                    color: '#ffffff',
                                    fontSize: '0.81rem',
                                    cursor: 'pointer',
                                    minWidth: '162px',
                                }}
                            >
                                <option value="-createdAt" style={{ background: '#1a1a1a', color: '#fff' }}>Newest First</option>
                                <option value="createdAt" style={{ background: '#1a1a1a', color: '#fff' }}>Oldest First</option>
                                <option value="price" style={{ background: '#1a1a1a', color: '#fff' }}>Price: Low to High</option>
                                <option value="-price" style={{ background: '#1a1a1a', color: '#fff' }}>Price: High to Low</option>
                                <option value="-averageRating" style={{ background: '#1a1a1a', color: '#fff' }}>Top Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.675rem',
                        marginBottom: '2.7rem',
                    }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                style={{
                                    padding: '0.54rem 1.08rem',
                                    background: category === cat ? 'var(--fg)' : 'transparent',
                                    color: category === cat ? 'var(--bg)' : 'var(--fg)',
                                    border: '1px solid var(--fg)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Results Count */}
                    <p style={{
                        marginBottom: '1.8rem',
                        color: 'var(--muted)',
                        fontSize: '0.81rem',
                    }}>
                        {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} found
                    </p>

                    {/* Loading State */}
                    {loading && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '270px',
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                border: '2px solid var(--border)',
                                borderTopColor: 'var(--fg)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }} />
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3.6rem',
                            color: 'var(--muted)',
                        }}>
                            <p style={{ marginBottom: '0.9rem' }}>{error}</p>
                            <button
                                onClick={fetchProducts}
                                style={{
                                    padding: '0.675rem 1.35rem',
                                    background: 'var(--fg)',
                                    color: 'var(--bg)',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && products.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '5.4rem 1.8rem',
                            color: 'var(--muted)',
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '1.35rem',
                                marginBottom: '0.9rem',
                                color: 'var(--fg)',
                            }}>
                                No products found
                            </h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}

                    {/* Product Grid */}
                    {!loading && !error && displayProducts.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(227px, 1fr))',
                            gap: '1.8rem',
                        }}>
                            {displayProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onImageError={handleImageError}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && !error && displayProducts.length > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '2rem',
                            marginTop: '5rem',
                            marginBottom: '4rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid var(--border)',
                        }}>
                            <button
                                ref={prevBtnRef}
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('page', page - 1);
                                    setSearchParams(newParams);
                                    window.scrollTo(0, 0);
                                }}
                                disabled={page <= 1}
                                onMouseMove={(e) => handleBtnMouseMove(e, prevBtnRef)}
                                onMouseLeave={(e) => {
                                    handleBtnMouseLeave(prevBtnRef);
                                    // Also trigger the existing style reset if needed, but styling is mostly handled by CSS class now
                                }}
                                className="nav__link" 
                                style={{
                                    padding: '1rem 2rem', // Matched navbar padding
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    fontFamily: 'var(--font-sans)',
                                    border: 'none',
                                    opacity: page <= 1 ? 0.3 : 1,
                                }}
                            >
                                <span
                                    className="nav__link-bubble"
                                    style={{
                                        position: "absolute",
                                        top: "0",
                                        left: "0",
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: "var(--fg)",
                                        transform: "translateY(100%)",
                                        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                        zIndex: 0,
                                        pointerEvents: "none",
                                    }}
                                />
                                <span
                                    className="nav__link-text"
                                    style={{
                                        position: "relative",
                                        zIndex: 1,
                                        transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                    }}
                                >
                                    Previous
                                </span>
                            </button>
                            
                            <span style={{ 
                                color: 'var(--muted)',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                fontFamily: 'var(--font-display)',
                                letterSpacing: '0.05em'
                            }}>
                                PAGE {page}
                            </span>

                            <button
                                ref={nextBtnRef}
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('page', page + 1);
                                    setSearchParams(newParams);
                                    window.scrollTo(0, 0);
                                }}
                                disabled={displayProducts.length < 24}
                                onMouseMove={(e) => handleBtnMouseMove(e, nextBtnRef)}
                                onMouseLeave={(e) => handleBtnMouseLeave(nextBtnRef)}
                                className="nav__link"
                                style={{
                                    padding: '1rem 2rem',
                                    background: 'transparent',
                                    color: 'var(--fg)',
                                    cursor: displayProducts.length < 24 ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    fontFamily: 'var(--font-sans)',
                                    border: 'none', // Navbar links don't have borders usually
                                    opacity: displayProducts.length < 24 ? 0.3 : 1,
                                }}
                            >
                                <span
                                    className="nav__link-bubble"
                                    style={{
                                        position: "absolute",
                                        top: "0",
                                        left: "0",
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: "var(--fg)",
                                        transform: "translateY(100%)",
                                        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                        zIndex: 0,
                                        pointerEvents: "none",
                                    }}
                                />
                                <span
                                    className="nav__link-text"
                                    style={{
                                        position: "relative",
                                        zIndex: 1,
                                        transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                    }}
                                >
                                    Next
                                </span>
                            </button>
                        </div>
                    )}

                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                        /* Navbar Hover Effect Reuse */
                        .nav__link:hover:not(:disabled) .nav__link-bubble {
                            transform: translateY(0) !important;
                        }
                        .nav__link:hover:not(:disabled) .nav__link-text {
                            color: var(--bg) !important;
                        }
                    `}</style>
                </div>
            </div>

            <Footer />

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ProductsPage;
