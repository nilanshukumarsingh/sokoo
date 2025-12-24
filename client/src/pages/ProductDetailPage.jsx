/**
 * Product Detail Page
 * Single product view with add to cart, quantity selector, and reviews
 */

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productsAPI, cartAPI, authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Star, Heart } from "lucide-react";
import Footer from "../components/Footer";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  // const [notification, setNotification] = useState(null); // Removed local Notification state

  // New States
  const [selectedImage, setSelectedImage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0); // Reset scroll on id change
  }, [id]);

  useEffect(() => {
    if (product && user) {
      setIsWishlisted(user.wishlist?.includes(product._id));
    }
  }, [product, user]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getById(id);
      const fetchedProduct = response.data.data;
      setProduct(fetchedProduct);
      // Default select first image
      if (fetchedProduct.images && fetchedProduct.images.length > 0) {
        setSelectedImage(fetchedProduct.images[0]);
      }
      fetchRelatedProducts(fetchedProduct.category);
    } catch (err) {
      setError("Product not found");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      // Fetch products with same category, limit 4
      // Since getAll supports generic query params, we filter by category
      // We'll fetch 8 to have a buffer and filter locally since API might return current product
      const response = await productsAPI.getAll({
        category: category,
        limit: 8,
      });
      const allRelated = response.data.data || [];

      // Filter out current product and matching category (double check)
      const filtered = allRelated.filter((p) => p._id !== id).slice(0, 4);
      setRelatedProducts(filtered);
    } catch (err) {
      console.error("Failed to fetch related products", err);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.addItem(product._id, quantity);
      showToast(`Added ${product.name} to cart`, "success");
      window.dispatchEvent(new Event("cart-updated")); // Notify Navigation
    } catch (err) {
      console.error("Add to cart error:", err);
      const msg = err.response?.data?.error || "Failed to add to cart";
      showToast(msg, "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const response = await authAPI.toggleWishlist(product._id);
      // The API returns the updated wishlist array
      const updatedWishlist = response.data.data;
      setIsWishlisted(updatedWishlist.includes(product._id));

      // Update user in context to keep wishlist in sync
      if (user) {
        updateUser({ ...user, wishlist: updatedWishlist });
      }

      showToast(
        updatedWishlist.includes(product._id)
          ? "Added to wishlist"
          : "Removed from wishlist",
        "success"
      );
    } catch (err) {
      console.error("Wishlist toggle failed", err);
      showToast("Failed to update wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  const getImageUrl = (img) => {
    return img
      ? img.startsWith("http")
        ? img
        : `http://localhost:5000${img}`
      : "https://placehold.co/600x600/1a1a1a/666?text=No+Image";
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "2px solid var(--border)",
            borderTopColor: "var(--fg)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--bg)",
          padding: "var(--space-lg)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </h1>
        <Link
          to="/products"
          style={{
            color: "var(--fg)",
            textDecoration: "underline",
          }}
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const mainImageUrl = getImageUrl(selectedImage || product?.images?.[0]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "var(--space-lg)",
        paddingTop: "108px",
        background: "var(--bg)",
      }}
    >
      {/* Notification Toast */}
      <div style={{ maxWidth: "1260px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            to="/products"
            style={{
              color: "var(--muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            ← Back to Products
          </Link>
        </div>

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: Images */}
          <div
            style={{
              position: "sticky",
              top: "108px",
            }}
          >
            {/* Main Image */}
            <div
              style={{
                background: "var(--bg-alt)",
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
                marginBottom: "1rem",
              }}
            >
              <img
                src={mainImageUrl}
                alt={product?.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "opacity 0.3s ease",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/600x600/1a1a1a/666?text=No+Image";
                }}
              />
              {product?.stock <= 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  <span
                    style={{
                      color: "#ef4444",
                      border: "4px solid #ef4444",
                      padding: "1rem 2rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      fontSize: "1.5rem",
                      transform: "rotate(-15deg)",
                    }}
                  >
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product?.images?.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "1rem",
                }}
              >
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      aspectRatio: "1",
                      cursor: "pointer",
                      border:
                        selectedImage === img
                          ? "2px solid var(--fg)"
                          : "2px solid transparent",
                      opacity: selectedImage === img ? 1 : 0.6,
                      transition: "all 0.2s",
                      background: "var(--bg-alt)",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity =
                        selectedImage === img ? 1 : 0.6)
                    }
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`View ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/100x100/1a1a1a/666?text=No+Image";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div>
            {/* Shop */}
            {product?.shop?.name && (
              <Link
                to={`/shops/${product.shop._id}`}
                style={{
                  display: "inline-block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "1rem",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--fg)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
              >
                {product.shop.name}
              </Link>
            )}

            {/* Name */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
                color: "var(--fg)",
                lineHeight: 1.1,
              }}
            >
              {product?.name}
            </h1>

            {/* Rating */}
            {product?.averageRating > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontSize: "1rem", color: "var(--muted)" }}>
                  {product.averageRating.toFixed(1)} ({product.numReviews}{" "}
                  reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <p
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                marginBottom: "2rem",
                color: "var(--fg)",
              }}
            >
              ${product?.price?.toFixed(2)}
            </p>

            {/* Description */}
            <div
              style={{
                marginBottom: "2rem",
                paddingBottom: "2rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Description
              </h3>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: "var(--fg)",
                }}
              >
                {product?.description || "No description available."}
              </p>
            </div>

            {/* Stock */}
            <div style={{ marginBottom: "2rem" }}>
              {product?.stock > 0 ? (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: product.stock <= 5 ? "#f59e0b" : "var(--muted)",
                  }}
                >
                  {product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : `${product.stock} in stock`}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  Out of Stock
                </p>
              )}
            </div>

            {/* Quantity & Actions */}
            {product?.stock > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {/* Quantity Selector */}
                <div
                  style={{
                    display: "flex",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "transparent",
                      border: "none",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      color: "var(--fg)",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      width: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "1rem",
                      borderLeft: "1px solid var(--border)",
                      borderRight: "1px solid var(--border)",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "transparent",
                      border: "none",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      color: "var(--fg)",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "1rem 2rem",
                    background: "var(--fg)",
                    color: "var(--bg)",
                    border: "none",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: addingToCart ? "not-allowed" : "pointer",
                    opacity: addingToCart ? 0.7 : 1,
                    transition: "opacity 0.3s, transform 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                  onMouseEnter={(e) =>
                    !addingToCart &&
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlist}
                  disabled={wishlistLoading}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  title={
                    isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                >
                  <Heart
                    size={34}
                    fill={isWishlisted ? "#ff4757" : "none"}
                    stroke={isWishlisted ? "#ff4757" : "#ffffff"}
                    strokeWidth={2}
                    style={{ transition: "all 0.3s" }}
                  />
                </button>
              </div>
            )}

            {/* Tags */}
            {product?.tags?.length > 0 && (
              <div style={{ marginTop: "3rem" }}>
                <h3
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Tags
                </h3>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "var(--bg-alt)",
                        fontSize: "0.8rem",
                        color: "var(--muted)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "6rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              You Might Also Like
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
              }}
            >
              {relatedProducts.map((rp) => (
                <Link
                  key={rp._id}
                  to={`/products/${rp._id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-alt)",
                      marginBottom: "1rem",
                      aspectRatio: "1",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={
                        rp.images?.[0]
                          ? rp.images[0].startsWith("http")
                            ? rp.images[0]
                            : `http://localhost:5000${rp.images[0]}`
                          : "https://placehold.co/400x400"
                      }
                      alt={rp.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x400/1a1a1a/666?text=No+Image";
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {rp.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "var(--muted)",
                    }}
                  >
                    ${rp.price.toFixed(2)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {product?.reviews?.length > 0 && (
          <div
            style={{
              marginTop: "6rem",
              paddingTop: "4rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                marginBottom: "2rem",
              }}
            >
              Reviews ({product.reviews.length})
            </h2>
            <div style={{ display: "grid", gap: "2rem" }}>
              {product.reviews.map((review, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1.5rem",
                    background: "var(--bg-alt)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{review.name}</span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill="#fbbf24"
                          color="#fbbf24"
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
