"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { Heart, Star, ShoppingBag } from "lucide-react";

export default function ProductCard({ product }) {
  const { addToCart, likedItems, toggleLike } = useCart();
  const isLiked = likedItems.includes(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleLikeToggle = (e) => {
    e.preventDefault();
    toggleLike(product.id);
  };

  return (
    <Link href={`/product/${product.id}`} className="card" style={styles.cardLink}>
      {/* Product Image Section */}
      <div style={styles.imageContainer}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={styles.image}
        />
        
        {/* Hover overlay actions */}
        <div className="hover-actions" style={styles.hoverActions}>
          <button
            onClick={handleLikeToggle}
            style={{
              ...styles.iconButton,
              backgroundColor: isLiked ? "var(--primary)" : "#ffffff",
              color: isLiked ? "#ffffff" : "var(--text-primary)",
            }}
            title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={18} fill={isLiked ? "#ffffff" : "none"} />
          </button>
        </div>

        {/* Stock Badge */}
        {!product.inStock && (
          <span style={styles.outOfStockBadge}>Sold Out</span>
        )}
      </div>

      {/* Product Content Details */}
      <div style={styles.content}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.title}>{product.name}</h3>

        {/* Rating Row */}
        <div style={styles.ratingRow}>
          <div style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(product.rating) ? "var(--rating)" : "none"}
                color={i < Math.floor(product.rating) ? "var(--rating)" : "#d1d5db"}
              />
            ))}
          </div>
          <span style={styles.reviewsCount}>({product.reviewsCount})</span>
        </div>

        {/* Price and Cart Row */}
        <div style={styles.priceRow}>
          <span style={styles.price}>${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            style={styles.addToCartBtn}
            className="btn-primary"
            title="Add to Cart"
          >
            <ShoppingBag size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  cardLink: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    paddingBottom: "100%", // 1:1 Aspect Ratio
    backgroundColor: "#ffffff",
    overflow: "hidden",
    borderBottom: "1px solid var(--border)",
  },
  image: {
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  hoverActions: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: 10,
  },
  iconButton: {
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "var(--transition)",
  },
  outOfStockBadge: {
    position: "absolute",
    bottom: "12px",
    left: "12px",
    backgroundColor: "#3f3f46",
    color: "#ffffff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  category: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "var(--primary)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "6px",
  },
  title: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "8px",
    lineHeight: "1.4",
    flex: 1,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
  },
  stars: {
    display: "flex",
    gap: "2px",
  },
  reviewsCount: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  price: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  addToCartBtn: {
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "var(--transition)",
  },
};
