"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard";
import { api } from "../../utils/api";
import { Filter, SlidersHorizontal, Heart, Search, X } from "lucide-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const { likedItems } = useCart();

  // URL State
  const initialCategory = searchParams.get("category") || "All";
  const initialQuery = searchParams.get("q") || "";
  const initialLikedOnly = searchParams.get("liked") === "true";

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedOnly, setLikedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(350);
  const [sortBy, setSortBy] = useState("default");
  
  // Sync URL params to local state on change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setLikedOnly(initialLikedOnly);
  }, [initialLikedOnly]);

  // Products API States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API on filter changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts({
          category: selectedCategory,
          q: searchQuery,
          maxPrice,
          sortBy
        });
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, maxPrice, sortBy]);

  // Categories list
  const categories = ["All", "Sneakers", "Electronics", "Watches", "Bags"];

  // Filter local state (Wishlist Only)
  const filteredProducts = products.filter((product) => {
    return !likedOnly || likedItems.includes(product.id);
  });

  const resetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setLikedOnly(false);
    setMaxPrice(350);
    setSortBy("default");
  };

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>GEN AI Catalog</h1>
            <p style={styles.subtitle}>
              {filteredProducts.length} premium item{filteredProducts.length !== 1 && "s"} found
            </p>
          </div>
          
          {/* Sorting Dropdown */}
          <div style={styles.sortWrapper}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Content Layout */}
        <div style={styles.layout}>
          {/* Left Sidebar Filters */}
          <aside style={styles.sidebar}>
            <div style={styles.filterSection}>
              <h3 style={styles.filterTitle}>
                <Filter size={18} color="var(--primary)" />
                <span>Filters</span>
              </h3>
              <button onClick={resetFilters} style={styles.resetBtn}>
                Reset All
              </button>
            </div>

            {/* Categories */}
            <div style={styles.filterGroup}>
              <h4 style={styles.groupTitle}>Categories</h4>
              <div style={styles.categoryList}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      ...styles.categoryBtn,
                      backgroundColor: selectedCategory === cat ? "var(--primary)" : "transparent",
                      color: selectedCategory === cat ? "#ffffff" : "var(--text-primary)",
                      borderColor: selectedCategory === cat ? "var(--primary)" : "var(--border)",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div style={styles.filterGroup}>
              <div style={styles.priceHeader}>
                <h4 style={styles.groupTitle}>Max Price</h4>
                <span style={styles.priceDisplay}>${maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="350"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={styles.rangeInput}
              />
              <div style={styles.priceLabels}>
                <span>$50</span>
                <span>$350</span>
              </div>
            </div>

            {/* Wishlist Toggle */}
            <div style={styles.filterGroup}>
              <button
                onClick={() => setLikedOnly(!likedOnly)}
                style={{
                  ...styles.wishlistFilterBtn,
                  backgroundColor: likedOnly ? "var(--primary-light)" : "var(--bg-card)",
                  borderColor: likedOnly ? "var(--primary)" : "var(--border)",
                  color: likedOnly ? "var(--primary-dark)" : "var(--text-primary)",
                }}
              >
                <Heart size={16} fill={likedOnly ? "var(--primary-dark)" : "none"} />
                <span>Wishlist Only ({likedItems.length})</span>
              </button>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main style={styles.gridSection}>
            {/* Active search tag */}
            {searchQuery && (
              <div style={styles.searchTag}>
                <span>Search results for: <strong>"{searchQuery}"</strong></span>
                <button onClick={() => setSearchQuery("")} style={styles.clearSearchBtn}>
                  <X size={14} />
                </button>
              </div>
            )}

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
                <p style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--primary)" }}>Loading Products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={styles.noResults}>
                <Search size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                <h3>No Products Found</h3>
                <p style={{ color: "var(--text-muted)", margin: "8px 0 24px 0" }}>
                  Try adjusting your filters, modifying your search, or resetting.
                </p>
                <button onClick={resetFilters} className="btn btn-primary">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--primary)" }}>Loading Catalog...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

const styles = {
  page: {
    padding: "40px 0 80px 0",
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "40px",
    paddingBottom: "20px",
    borderBottom: "1px solid var(--border)",
  },
  title: {
    fontSize: "2.25rem",
    fontWeight: "800",
    color: "var(--text-primary)",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
  sortWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  select: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg-card)",
    color: "var(--text-primary)",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },
  layout: {
    display: "flex",
    flexDirection: "row",
    gap: "36px",
    flexWrap: "wrap",
  },
  sidebar: {
    flex: "1 1 280px",
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--border-radius)",
    padding: "24px",
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxShadow: "var(--shadow-sm)",
  },
  filterSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "12px",
  },
  filterTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "1.1rem",
    fontWeight: "700",
  },
  resetBtn: {
    background: "none",
    border: "none",
    color: "var(--primary)",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  groupTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  categoryBtn: {
    width: "100%",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "0.9rem",
    fontWeight: "600",
    textAlign: "left",
    cursor: "pointer",
    transition: "var(--transition)",
  },
  priceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceDisplay: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--primary)",
  },
  rangeInput: {
    width: "100%",
    accentColor: "var(--primary)",
    cursor: "pointer",
    margin: "8px 0",
  },
  priceLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  wishlistFilterBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px dashed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "var(--transition)",
  },
  gridSection: {
    flex: "3 1 600px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  searchTag: {
    alignSelf: "flex-start",
    backgroundColor: "var(--primary-light)",
    color: "var(--primary-dark)",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  clearSearchBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--primary-dark)",
    display: "flex",
    alignItems: "center",
  },
  noResults: {
    backgroundColor: "var(--bg-card)",
    border: "1px dashed var(--border)",
    borderRadius: "var(--border-radius)",
    padding: "80px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "var(--shadow-sm)",
  },
};
