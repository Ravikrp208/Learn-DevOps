"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
  } = useCart();
  const drawerRef = useRef(null);

  // Close drawer if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isCartOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !event.target.closest(".cart-toggle-btn")
      ) {
        setIsCartOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen, setIsCartOpen]);

  // Disable body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div style={styles.overlay}>
      <div ref={drawerRef} style={styles.drawer}>
        {/* Drawer Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
              Your Cart ({cartCount})
            </h3>
          </div>
          <button style={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={styles.body}>
          {cart.length === 0 ? (
            <div style={styles.emptyCart}>
              <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "1.1rem" }}>
                Your shopping cart is empty
              </p>
              <Link
                href="/shop"
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={styles.itemList}>
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`} style={styles.itemRow}>
                  <div style={styles.itemImageWrapper}>
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={70}
                      height={70}
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                  </div>
                  <div style={styles.itemDetails}>
                    <h4 style={styles.itemName}>{item.product.name}</h4>
                    <p style={styles.itemMeta}>
                      Size: {item.selectedSize} | Color: {item.selectedColor}
                    </p>
                    <div style={styles.priceAndQty}>
                      <span style={styles.itemPrice}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
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
                          <Minus size={12} />
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
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() =>
                      removeFromCart(
                        item.product.id,
                        item.selectedSize,
                        item.selectedColor
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.summaryRow}>
              <span>Subtotal:</span>
              <span style={styles.totalPrice}>${cartTotal.toFixed(2)}</span>
            </div>
            <p style={styles.footerNote}>
              Shipping, taxes, and discounts calculated at checkout.
            </p>
            <div style={styles.actions}>
              <Link
                href="/cart"
                style={{ ...styles.actionBtn, ...styles.viewCartBtn }}
                onClick={() => setIsCartOpen(false)}
              >
                View Full Cart
              </Link>
              <Link
                href="/checkout"
                style={{ ...styles.actionBtn, ...styles.checkoutBtn }}
                className="pulse-primary"
                onClick={() => setIsCartOpen(false)}
              >
                Checkout Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
    animation: "fadeIn 0.2s ease-out",
  },
  drawer: {
    width: "100%",
    maxWidth: "450px",
    height: "100%",
    backgroundColor: "var(--bg-card)",
    boxShadow: "var(--shadow-lg)",
    display: "flex",
    flexDirection: "column",
    animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    borderLeft: "1px solid var(--border)",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    borderRadius: "50%",
    transition: "background-color 0.2s",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
  },
  emptyCart: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    paddingBottom: "20px",
    borderBottom: "1px solid var(--border)",
    position: "relative",
  },
  itemImageWrapper: {
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "4px",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    margin: "0 0 4px 0",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    paddingRight: "24px",
  },
  itemMeta: {
    margin: "0 0 8px 0",
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  priceAndQty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemPrice: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "var(--primary)",
  },
  quantityController: {
    display: "flex",
    alignItems: "center",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    backgroundColor: "var(--bg-main)",
  },
  qtyBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "6px 8px",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyVal: {
    padding: "0 8px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  deleteBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    transition: "color 0.2s",
  },
  footer: {
    padding: "24px",
    borderTop: "1px solid var(--border)",
    backgroundColor: "var(--bg-main)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  totalPrice: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "var(--primary)",
  },
  footerNote: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    marginBottom: "20px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  actionBtn: {
    display: "block",
    textAlign: "center",
    padding: "14px",
    borderRadius: "var(--border-radius)",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "var(--transition)",
  },
  viewCartBtn: {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  },
  checkoutBtn: {
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(217, 4, 41, 0.25)",
  },
};
