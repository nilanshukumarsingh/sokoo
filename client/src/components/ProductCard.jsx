/**
 * Product Card Component
 * Premium, minimalist design with hover effects
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onAddToCart }) => {
    const { isAuthenticated } = useAuth();
    const [imageError, setImageError] = useState(false);

    // Filter out products with broken images
    if (imageError) return null;


    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock <= 0) return;

        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        try {
            await cartAPI.addItem(product._id, 1);
            if (onAddToCart) {
                onAddToCart(product);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const imageUrl = product.images?.[0]
        ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`)
        : 'https://placehold.co/400x400/1a1a1a/666?text=No+Image';

    return (
        <Link
            to={`/products/${product._id}`}
            style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--bg-alt)',
                transition: 'transform 0.4s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Image Container */}
            <div style={{
                position: 'relative',
                paddingBottom: '100%',
                overflow: 'hidden',
                background: 'var(--bg-alt)',
            }}>
                <img
                    src={imageUrl}
                    alt={product.name}
                    onError={() => setImageError(true)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />

                {/* Out of Stock Overlay */}
                {product.stock <= 0 && (
                     <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}>
                        <span style={{
                            color: '#ef4444',
                            border: '2px solid #ef4444',
                            padding: '0.5rem 1rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            fontSize: '0.8rem',
                            transform: 'rotate(-15deg)',
                        }}>
                            OUT OF STOCK
                        </span>
                    </div>
                )}

                {/* Add to Cart Button - Appears on Hover */}
                {product.stock > 0 && (
                    <button
                        onClick={handleAddToCart}
                        style={{
                            position: 'absolute',
                            bottom: '1rem',
                            left: '50%',
                            transform: 'translateX(-50%) translateY(20px)',
                            padding: '0.75rem 1.5rem',
                            background: 'var(--fg)',
                            color: 'var(--bg)',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            opacity: 0,
                            transition: 'opacity 0.3s, transform 0.3s',
                            zIndex: 2,
                        }}
                        className="product-card__add-btn"
                    >
                        Add to Cart
                    </button>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem' }}>
                {/* Shop Name */}
                {product.shop?.name && (
                    <p style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        marginBottom: '0.5rem',
                    }}>
                        {product.shop.name}
                    </p>
                )}

                {/* Product Name */}
                <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--fg)',
                    lineHeight: 1.3,
                }}>
                    {product.name}
                </h3>

                {/* Price & Stock */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-display)',
                        color: 'var(--fg)',
                    }}>
                        ${product.price?.toFixed(2)}
                    </span>

                    {product.stock <= 5 && product.stock > 0 && (
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#f59e0b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}>
                            Only {product.stock} left
                        </span>
                    )}

                    {product.stock === 0 && (
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: '#ef4444',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}>
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Rating */}
                {product.averageRating > 0 && (
                    <div style={{
                        marginTop: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>★</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            {product.averageRating.toFixed(1)} ({product.numReviews})
                        </span>
                    </div>
                )}
            </div>

            <style>{`
        .product-card__add-btn:hover {
          opacity: 1 !important;
        }
        a:hover .product-card__add-btn {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(0) !important;
        }
      `}</style>
        </Link>
    );
};

export default ProductCard;
