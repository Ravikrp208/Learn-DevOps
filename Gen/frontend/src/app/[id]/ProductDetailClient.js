"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../context/CartContext";
import ProductCard from "../../../components/ProductCard";
import { api } from "../../../utils/api";
import { Star, Heart, ShoppingBag, ArrowLeft, Check, Shield, Truck, RotateCcw } from "lucide-react";

export default function ProductDetailClient({ product }) {
  const { addToCart, likedItems, toggleLike } = useCart();
  
  // Interactive Options States
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : "");
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);

  const isLiked = likedItems.includes(product.id);

  // Find related products dynamically via API
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await api.getProducts({ category: product.category });
        setRelatedProducts(data.filter((p) => p.id !== product.id).slice(0, 3));
      } catch (err) {
        console.error("Failed to load related products:", err);
      }
    };
    fetchRelated();
  }, [product.category, product.id]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    setQuantity(val);
  };

  return (
    <div style={styles.container} className="container">
      {/* Breadcrumb link */}
      <div style={styles.breadcrumb}>
        <Link href="/shop" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Details Grid */}
      <div style={styles.mainGrid}>
        {/* Left Side: Product Gallery */}
        <div style={styles.galleryCol}>
          <div style={styles.mainImageWrapper}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              style={{ objectFit: "cover" }}
            />
            {/* Wishlist Button Overlay */}
            <button
              onClick={() => toggleLike(product.id)}
              style={{
                ...styles.likeBtn,
                backgroundColor: isLiked ? "var(--primary)" : "#ffffff",
                color: isLiked ? "#ffffff" : "var(--text-primary)",
              }}
              title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={22} fill={isLiked ? "#ffffff" : "none"} />
            </button>
          </div>
          
          {/* Thumbnails (for visual richness) */}
          <div style={styles.thumbnailRow}>
            <div style={{ ...styles.thumb, border: "2px solid var(--primary)" }}>
              <Image src={product.image} alt="thumbnail" width={80} height={80} style={{ objectFit: "cover", borderRadius: "6px" }} />
            </div>
            <div style={styles.thumb}>
              <div style={styles.thumbPlaceholder}>Detail View 1</div>
            </div>
            <div style={styles.thumb}>
              <div style={styles.thumbPlaceholder}>Detail View 2</div>
            </div>
          </div>
        </div>

        {/* Right Side: Product Customization & Purchase */}
        <div style={styles.infoCol}>
          <span style={styles.category}>{product.category}</span>
          <h1 style={styles.title}>{product.name}</h1>

          {/* Rating Block */}
          <div style={styles.ratingBlock}>
            <div style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating) ? "var(--rating)" : "none"}
                  color={i < Math.floor(product.rating) ? "var(--rating)" : "#d1d5db"}
                />
              ))}
            </div>
            <span style={styles.ratingVal}>{product.rating}</span>
            <span style={styles.reviewsCount}>({product.reviewsCount} customer reviews)</span>
          </div>

          {/* Pricing */}
          <div style={styles.priceRow}>
            <span style={styles.price}>${product.price.toFixed(2)}</span>
            {product.inStock ? (
              <span style={styles.stockStatus}>In Stock</span>
            ) : (
              <span style={{ ...styles.stockStatus, backgroundColor: "#fee2e2", color: "#ef4444" }}>Sold Out</span>
            )}
          </div>

          <p style={styles.description}>{product.description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div style={styles.selectorGroup}>
              <h4 style={styles.selectorTitle}>Select Color: <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>{selectedColor}</span></h4>
              <div style={styles.colorRow}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      ...styles.colorCircle,
                      backgroundColor: color.toLowerCase().includes("red") ? "var(--primary)" : color.toLowerCase().includes("white") ? "#ffffff" : color.toLowerCase().includes("strap") ? "#9f1239" : "#18181b",
                      border: selectedColor === color ? "3px solid var(--text-primary)" : "1px solid var(--border)",
                      outline: selectedColor === color ? "2px solid var(--primary)" : "none",
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={styles.selectorGroup}>
              <h4 style={styles.selectorTitle}>Select Size: <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>{selectedSize}</span></h4>
              <div style={styles.sizeRow}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      ...styles.sizeBtn,
                      backgroundColor: selectedSize === size ? "var(--primary)" : "var(--bg-card)",
                      color: selectedSize === size ? "#ffffff" : "var(--text-primary)",
                      borderColor: selectedSize === size ? "var(--primary)" : "var(--border)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Cart Action */}
          <div style={styles.cartActionRow}>
            <div style={styles.qtyContainer}>
              <button style={styles.qtyBtn} onClick={() => handleQuantityChange(quantity - 1)}>
                -
              </button>
              <span style={styles.qtyVal}>{quantity}</span>
              <button style={styles.qtyBtn} onClick={() => handleQuantityChange(quantity + 1)}>
                +
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              style={styles.addCartBtn}
              className="btn btn-primary pulse-primary"
            >
              <ShoppingBag size={20} />
              <span>{product.inStock ? "Add to Shopping Cart" : "Sold Out"}</span>
            </button>
          </div>

          {/* Shipping/Returns Info Badges */}
          <div style={styles.infoGrid}>
            <div style={styles.infoBadge}>
              <Truck size={20} color="var(--primary)" />
              <div>
                <h5 style={styles.badgeLabel}>Free Shipping</h5>
                <p style={styles.badgeText}>On orders over $99</p>
              </div>
            </div>
            <div style={styles.infoBadge}>
              <RotateCcw size={20} color="var(--primary)" />
              <div>
                <h5 style={styles.badgeLabel}>30-Day Returns</h5>
                <p style={styles.badgeText}>Easy, hassle-free returns</p>
              </div>
            </div>
            <div style={styles.infoBadge}>
              <Shield size={20} color="var(--primary)" />
              <div>
                <h5 style={styles.badgeLabel}>Authentic Quality</h5>
                <p style={styles.badgeText}>100% genuine products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div style={styles.tabsSection}>
        <div style={styles.tabHeaders}>
          <button
            onClick={() => setActiveTab("description")}
            style={{
              ...styles.tabBtn,
              color: activeTab === "description" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "description" ? "3px solid var(--primary)" : "3px solid transparent",
            }}
          >
            Key Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            style={{
              ...styles.tabBtn,
              color: activeTab === "reviews" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: activeTab === "reviews" ? "3px solid var(--primary)" : "3px solid transparent",
            }}
          >
            Reviews ({product.reviewsCount})
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === "description" ? (
            <ul style={styles.detailsList}>
              {product.details ? (
                product.details.map((detail, idx) => (
                  <li key={idx} style={styles.detailItem}>
                    <Check size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 4 }} />
                    <span>{detail}</span>
                  </li>
                ))
              ) : (
                <li style={styles.detailItem}>
                  <Check size={16} color="var(--primary)" />
                  <span>Premium craft styling and high durability colors.</span>
                </li>
              )}
            </ul>
          ) : (
            <div style={styles.reviewsList}>
              <div style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <h4 style={styles.reviewUser}>Jessica S.</h4>
                  <div style={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="var(--rating)" color="var(--rating)" />
                    ))}
                  </div>
                </div>
                <span style={styles.reviewDate}>2 weeks ago</span>
                <p style={styles.reviewText}>
                  Absolute stunner! The packaging was perfect, shipping was incredibly fast (got it in 2 days), and the product looks even better in person. The red accents are extremely eye-catching. Highly recommended!
                </p>
              </div>
              <div style={styles.reviewItem}>
                <div style={styles.reviewHeader}>
                  <h4 style={styles.reviewUser}>David K.</h4>
                  <div style={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < 4 ? "var(--rating)" : "none"} color={i < 4 ? "var(--rating)" : "#d1d5db"} />
                    ))}
                  </div>
                </div>
                <span style={styles.reviewDate}>1 month ago</span>
                <p style={styles.reviewText}>
                  Really high-quality feel. I've been using it daily and it is holding up beautifully. The only minor point is the white parts get dirty easily, but they are simple to wipe clean. Solid purchase.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section style={styles.relatedSection}>
          <h2 style={styles.relatedTitle}>You May Also Like</h2>
          <div style={styles.relatedGrid}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px 24px 80px 24px",
  },
  breadcrumb: {
    marginBottom: "30px",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    color: "var(--text-muted)",
    transition: "color 0.2s",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "48px",
    marginBottom: "60px",
  },
  galleryCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  mainImageWrapper: {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    backgroundColor: "#ffffff",
    borderRadius: "var(--border-radius)",
    border: "1px solid var(--border)",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
  },
  likeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "var(--transition)",
    zIndex: 10,
  },
  thumbnailRow: {
    display: "flex",
    gap: "12px",
  },
  thumb: {
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    overflow: "hidden",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPlaceholder: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    textAlign: "center",
    fontWeight: "600",
    padding: "4px",
  },
  infoCol: {
    display: "flex",
    flexDirection: "column",
  },
  category: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "var(--primary)",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "12px",
    lineHeight: "1.2",
  },
  ratingBlock: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  stars: {
    display: "flex",
    gap: "2px",
  },
  ratingVal: {
    fontWeight: "700",
    fontSize: "0.95rem",
  },
  reviewsCount: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  price: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "var(--primary)",
  },
  stockStatus: {
    backgroundColor: "var(--primary-light)",
    color: "var(--primary-dark)",
    fontSize: "0.8rem",
    fontWeight: "700",
    padding: "6px 12px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },
  description: {
    fontSize: "1.05rem",
    color: "var(--text-primary)",
    lineHeight: "1.6",
    marginBottom: "28px",
  },
  selectorGroup: {
    marginBottom: "24px",
  },
  selectorTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    marginBottom: "12px",
  },
  colorRow: {
    display: "flex",
    gap: "12px",
  },
  colorCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  sizeRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  sizeBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "var(--transition)",
  },
  cartActionRow: {
    display: "flex",
    gap: "16px",
    margin: "32px 0",
    flexWrap: "wrap",
  },
  qtyContainer: {
    display: "flex",
    alignItems: "center",
    border: "2px solid var(--border)",
    borderRadius: "10px",
    backgroundColor: "var(--bg-main)",
    height: "54px",
  },
  qtyBtn: {
    border: "none",
    background: "none",
    width: "48px",
    height: "100%",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  qtyVal: {
    width: "32px",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "1.1rem",
  },
  addCartBtn: {
    flex: 1,
    minWidth: "220px",
    height: "54px",
    fontSize: "1.05rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "16px",
    paddingTop: "24px",
    borderTop: "1px solid var(--border)",
  },
  infoBadge: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  badgeLabel: {
    fontSize: "0.85rem",
    fontWeight: "700",
    marginBottom: "2px",
  },
  badgeText: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  tabsSection: {
    border: "1px solid var(--border)",
    borderRadius: "var(--border-radius)",
    backgroundColor: "var(--bg-card)",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
    marginBottom: "60px",
  },
  tabHeaders: {
    display: "flex",
    borderBottom: "1px solid var(--border)",
    backgroundColor: "var(--bg-main)",
  },
  tabBtn: {
    padding: "20px 30px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "700",
    transition: "var(--transition)",
  },
  tabContent: {
    padding: "30px",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  detailItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "0.95rem",
  },
  reviewsList: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  reviewItem: {
    borderBottom: "1px solid var(--border)",
    paddingBottom: "20px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  reviewUser: {
    fontSize: "0.95rem",
    fontWeight: "700",
  },
  reviewDate: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    display: "block",
    marginBottom: "10px",
  },
  reviewText: {
    fontSize: "0.95rem",
    lineHeight: "1.6",
    color: "var(--text-primary)",
  },
  relatedSection: {
    paddingTop: "40px",
    borderTop: "1px solid var(--border)",
  },
  relatedTitle: {
    fontSize: "1.75rem",
    fontWeight: "800",
    marginBottom: "30px",
    color: "var(--text-primary)",
  },
  relatedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "30px",
  },
};
