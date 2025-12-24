import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { shopsAPI, productsAPI } from "../utils/api";
import ProductCard from "../components/ProductCard";
import { gsap } from "gsap";

const ShopPage = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        // Parallel fetch for speed
        const [shopRes, productsRes] = await Promise.all([
          shopsAPI.getById(id),
          productsAPI.getAll({ shop: id })
        ]);

        setShop(shopRes.data.data);
        setProducts(productsRes.data.data);
      } catch (err) {
        console.error("Failed to fetch shop data:", err);
        setError("Failed to load shop. It may not exist.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopData();
    }
  }, [id]);

  // Animations
  useEffect(() => {
    if (!loading && shop) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        });

        gsap.from(".product-item", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2
        });
      });

      return () => ctx.revert();
    }
  }, [loading, shop]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: "80vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "var(--muted)" 
      }}>
        Loading Shop...
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div style={{ 
        minHeight: "80vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <h2>Shop Not Found</h2>
        <p style={{ color: "var(--muted)" }}>The shop you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      {/* Shop Header */}
      <div 
        ref={headerRef}
        style={{
          background: "var(--card-bg)",
          borderRadius: "1rem",
          padding: "3rem",
          textAlign: "center",
          marginBottom: "3rem",
          border: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "6px",
          background: "linear-gradient(90deg, var(--accent) 0%, #a855f7 100%)"
        }} />
        
        <h1 style={{ 
          fontSize: "3rem", 
          marginBottom: "1rem",
          fontWeight: 700,
          letterSpacing: "-0.03em"
        }}>
          {shop.name}
        </h1>
        
        <p style={{ 
          fontSize: "1.1rem", 
          color: "var(--muted)",
          maxWidth: "600px",
          margin: "0 auto 2rem",
          lineHeight: 1.6
        }}>
          {shop.description || "Welcome to our shop! Browse our collection of unique items."}
        </p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          fontSize: "0.9rem",
          color: "var(--fg)",
          fontWeight: 500
        }}>
          <div>
            <span style={{ color: "var(--muted)", marginRight: "0.5rem" }}>Products</span>
            {products.length}
          </div>
          <div>
            <span style={{ color: "var(--muted)", marginRight: "0.5rem" }}>Owner</span>
            {shop.owner?.name || "Verified Vendor"}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <h2 style={{ 
        fontSize: "1.5rem", 
        marginBottom: "2rem",
        fontWeight: 600 
      }}>
        Latest Products
      </h2>

      {products.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "4rem",
          background: "var(--bg-alt)",
          borderRadius: "1rem",
          color: "var(--muted)"
        }}>
          No products available in this shop yet.
        </div>
      ) : (
        <div 
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem"
          }}
        >
          {products.map((product) => (
            <div key={product._id} className="product-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
