"use client";

import React, { useState } from "react";
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

          <Link href="/checkout" className="header-icon-btn" title="User Profile">
            <User size={20} />
          </Link>
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
