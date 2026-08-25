"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Heart, Search, User, Menu, X } from "lucide-react";

export default function Header() {
  const { cartCount, likedItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const logged = localStorage.getItem("user_logged_in") === "true";
      setIsLoggedIn(logged);
      if (logged) {
        setUserName(localStorage.getItem("user_name") || "User");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_logged_in");
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    setIsLoggedIn(false);
    router.push("/");
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="header-main">
      <div className="container header-container">
        {/* Mobile Menu Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="header-logo">
          <span className="header-logo-red">ROUGE</span>
          <span>.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <Link
            href="/"
            className={isActive("/") ? "nav-link-active" : "nav-link"}
          >
            Home
          </Link>
          <Link
            href="/shop"
            className={isActive("/shop") ? "nav-link-active" : "nav-link"}
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className={isActive("/cart") ? "nav-link-active" : "nav-link"}
          >
            Cart
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <Search size={18} />
          </button>
        </form>

        {/* Icons Actions */}
        <div className="header-actions">
          <Link href="/shop?liked=true" className="header-icon-btn" title="Wishlist">
            <Heart
              size={20}
              fill={likedItems.length > 0 ? "var(--primary)" : "none"}
              color={likedItems.length > 0 ? "var(--primary)" : "currentColor"}
            />
            {likedItems.length > 0 && (
              <span className="header-badge">{likedItems.length}</span>
            )}
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="header-icon-btn cart-toggle-btn"
            title="Open Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
          </button>

          {isLoggedIn ? (
            <button 
              onClick={() => {
                if (confirm("Do you want to log out?")) {
                  handleLogout();
                }
              }}
              className="header-icon-btn" 
              title={`Logged in as ${userName}. Click to Logout.`}
              style={{ display: "flex", alignItems: "center", gap: "4px", border: "none", background: "none", cursor: "pointer", padding: 0 }}
            >
              <User size={20} color="var(--primary)" />
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-primary)" }}>Logout</span>
            </button>
          ) : (
            <Link href="/login" className="header-icon-btn" title="Login / Register">
              <User size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <nav className="mobile-nav">
            <Link
              href="/"
              className={isActive("/") ? "mobile-nav-link-active" : "mobile-nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={isActive("/shop") ? "mobile-nav-link-active" : "mobile-nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/cart"
              className={isActive("/cart") ? "mobile-nav-link-active" : "mobile-nav-link"}
              onClick={() => setMobileMenuOpen(false)}
            >
              Cart
            </Link>
            <form onSubmit={handleSearchSubmit} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search..."
                className="mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="mobile-search-btn" aria-label="Search">
                <Search size={18} />
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
