"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Info } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  // Coupon promo code states
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (promoCode.trim().toUpperCase() === "CRIMSON25") {
      setDiscountPercent(25);
      setCouponSuccess("Promo code CRIMSON25 applied! 25% off your items.");
    } else if (promoCode.trim().toUpperCase() === "WELCOME10") {
      setDiscountPercent(10);
      setCouponSuccess("Promo code WELCOME10 applied! 10% off your items.");
    } else {
      setCouponError("Invalid promo code. Try 'CRIMSON25'.");
    }
  };

  // Calculations
  const discountAmount = (cartTotal * discountPercent) / 100;
  const shippingFee = cartTotal > 99 || cartTotal === 0 ? 0 : 9.99;
  const estimatedTax = (cartTotal - discountAmount) * 0.08;
  const orderTotal = cartTotal - discountAmount + shippingFee + estimatedTax;

  if (cart.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyCard} className="card">
          <ShoppingBag size={80} color="var(--primary)" style={{ marginBottom: 24 }} />
          <h1 style={{ marginBottom: 12, fontWeight: 800 }}>Your Shopping Cart is Empty</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 32, maxWidth: "450px" }}>
            Add products to your cart and they will appear here. Find premium running shoes, electronic accessories, and sleek watches in our catalog.
          </p>
          <Link href="/shop" className="btn btn-primary pulse-primary">
            Browse Our Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div className="container">
        <h1 style={styles.pageTitle}>Shopping Cart</h1>
        <p style={styles.pageSubtitle}>Manage your selected items and apply checkout discount coupons</p>

        <div style={styles.layout}>
          {/* 1. ITEMS LIST COLUMN */}
          <div style={styles.listCol}>
            <div style={styles.cardHeader}>
              <span>Product Details</span>
              <button onClick={clearCart} style={styles.clearBtn}>
                Clear Cart
              </button>
            </div>

            <div style={styles.itemsWrapper}>
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} style={styles.itemRow} className="card">
                  <div style={styles.itemImageContainer}>
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={90}
                      height={90}
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                  </div>
                  
                  <div style={styles.itemMainInfo}>
                    <Link href={`/product/${item.product.id}`} style={styles.itemName}>
                      {item.product.name}
                    </Link>
                    <p style={styles.itemMeta}>
                      Size: <strong style={{ color: "var(--text-primary)" }}>{item.selectedSize}</strong> | Color: <strong style={{ color: "var(--text-primary)" }}>{item.selectedColor}</strong>
                    </p>
                    <span style={styles.mobilePrice}>${item.product.price.toFixed(2)} each</span>
                  </div>

                  <div style={styles.itemActions}>
                    {/* Quantity Controller */}
                    <div style={styles.quantityController}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span style={styles.qtyVal}>{item.quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price and Subtotal */}
                    <div style={styles.priceColumn}>
                      <span style={styles.itemTotal}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <span style={styles.itemUnit}>
                        ${item.product.price.toFixed(2)} each
                      </span>
                    </div>

                    {/* Delete item button */}
                    <button
                      style={styles.deleteBtn}
                      onClick={() =>
                        removeFromCart(
                          item.product.id,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                      title="Remove product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/shop" style={styles.continueShop}>
              <ArrowRight size={16} style={{ transform: "rotate(180deg)", marginRight: 8 }} />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* 2. ORDER SUMMARY COLUMN */}
          <div style={styles.summaryCol}>
            {/* Promo Code Card */}
            <div style={styles.summaryCard} className="card">
              <h3 style={styles.summaryTitle}>Have a Coupon?</h3>
              <form onSubmit={handleApplyCoupon} style={styles.promoForm}>
                <input
                  type="text"
                  placeholder="Promo Code (CRIMSON25)"
                  className="form-input"
                  style={styles.promoInput}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={styles.promoBtn}>
                  <Tag size={16} />
                  Apply
                </button>
              </form>
              {couponError && <p style={styles.errorMsg}>{couponError}</p>}
              {couponSuccess && <p style={styles.successMsg}>{couponSuccess}</p>}
            </div>

            {/* Price Calculations Summary */}
            <div style={styles.summaryCard} className="card">
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div style={{ ...styles.summaryRow, color: "var(--primary)" }}>
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              
              <div style={styles.summaryRow}>
                <span>Estimated Tax (8%)</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>

              {shippingFee > 0 && (
                <div style={styles.shippingAlert}>
                  <Info size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <span>Add <strong>${(99 - cartTotal).toFixed(2)}</strong> more to unlock <strong>FREE Express Shipping</strong>!</span>
                </div>
              )}

              <div style={styles.totalRow}>
                <span>Estimated Total</span>
                <span style={styles.totalVal}>${orderTotal.toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                className="btn btn-primary pulse-primary"
                style={styles.checkoutBtn}
              >
                Proceed to Secure Checkout
                <ArrowRight size={18} />
              </Link>

              <div style={styles.payments}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 8, display: "block" }}>
                  WE SECURELY ACCEPT:
                </span>
                <div style={styles.payBadges}>
                  <span style={styles.payBadge}>Visa</span>
                  <span style={styles.payBadge}>Mastercard</span>
                  <span style={styles.payBadge}>Apple Pay</span>
                  <span style={styles.payBadge}>Google Pay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "60px 0 100px 0",
  },
  pageTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "var(--text-primary)",
    textAlign: "center",
  },
  pageSubtitle: {
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "1.05rem",
    marginBottom: "48px",
  },
  emptyContainer: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  emptyCard: {
    maxWidth: "600px",
    padding: "60px 40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  layout: {
    display: "flex",
    flexDirection: "row",
    gap: "36px",
    flexWrap: "wrap",
  },
  listCol: {
    flex: "3 1 650px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "700",
    fontSize: "1.1rem",
    paddingBottom: "12px",
    borderBottom: "2px solid var(--border)",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "var(--primary)",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  itemsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "24px",
    padding: "20px",
    flexWrap: "wrap",
  },
  itemImageContainer: {
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "4px",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  itemMainInfo: {
    flex: 2,
    minWidth: "150px",
  },
  itemName: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    display: "block",
    marginBottom: "6px",
  },
  itemNameHover: {
    color: "var(--primary)",
  },
  itemMeta: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  mobilePrice: {
    display: "none",
    fontSize: "0.85rem",
    color: "var(--primary)",
    fontWeight: "600",
    marginTop: "4px",
    "@media (max-width: 600px)": {
      display: "block",
    },
  },
  itemActions: {
    flex: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    minWidth: "260px",
  },
  quantityController: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    backgroundColor: "var(--bg-main)",
  },
  qtyBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "8px 12px",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: {
    padding: "0 10px",
    fontSize: "0.95rem",
    fontWeight: "700",
  },
  priceColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
  },
  itemTotal: {
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "var(--primary)",
  },
  itemUnit: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "color 0.2s",
    padding: "8px",
  },
  continueShop: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: "700",
    color: "var(--primary)",
    fontSize: "0.95rem",
    marginTop: "12px",
  },
  summaryCol: {
    flex: "1 1 350px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  summaryCard: {
    padding: "30px",
  },
  summaryTitle: {
    fontSize: "1.25rem",
    fontWeight: "800",
    marginBottom: "20px",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "10px",
  },
  promoForm: {
    display: "flex",
    gap: "8px",
  },
  promoInput: {
    flex: 1,
  },
  promoBtn: {
    padding: "0 18px",
  },
  errorMsg: {
    fontSize: "0.85rem",
    color: "#ef4444",
    marginTop: "8px",
    fontWeight: "600",
  },
  successMsg: {
    fontSize: "0.85rem",
    color: "var(--success)",
    marginTop: "8px",
    fontWeight: "600",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.95rem",
    fontWeight: "600",
    marginBottom: "16px",
  },
  shippingAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "var(--primary-light)",
    color: "var(--primary-dark)",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    lineHeight: "1.4",
    marginBottom: "20px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1.15rem",
    fontWeight: "700",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid var(--border)",
    marginBottom: "28px",
  },
  totalVal: {
    fontSize: "1.6rem",
    fontWeight: "800",
    color: "var(--primary)",
  },
  checkoutBtn: {
    width: "100%",
    padding: "16px",
    fontSize: "1rem",
  },
  payments: {
    marginTop: "24px",
    textAlign: "center",
  },
  payBadges: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  payBadge: {
    backgroundColor: "var(--bg-main)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--text-muted)",
  },
};
