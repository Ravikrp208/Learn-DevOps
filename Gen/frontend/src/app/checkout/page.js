"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { CreditCard, Truck, ShieldCheck, CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";
import { api } from "../../utils/api";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderItems = cart.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      productId: item.product.id,
    }));

    const orderData = {
      orderItems,
      shippingAddress: {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
      },
      paymentDetails: {
        cardName: formData.cardName,
        cardNumber: formData.cardNumber,
      },
      shippingFee,
      tax: estimatedTax,
      totalPrice: orderTotal,
    };

    try {
      const response = await api.createOrder(orderData);
      setOrderId(response.orderNumber);
      setIsSuccess(true);
      clearCart();
    } catch (err) {
      console.error("Order submission failed:", err);
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const shippingFee = cartTotal > 99 || cartTotal === 0 ? 0 : 9.99;
  const estimatedTax = cartTotal * 0.08;
  const orderTotal = cartTotal + shippingFee + estimatedTax;

  // Checkout Success Screen
  if (isSuccess) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard} className="card">
          <CheckCircle2 size={80} color="var(--success)" style={{ marginBottom: 24 }} />
          <h1 style={styles.successTitle}>Order Placed Successfully!</h1>
          <p style={styles.successText}>
            Thank you for shopping at <strong>ROUGE</strong>. Your payment has been processed and we are preparing your order.
          </p>
          <div style={styles.receipt}>
            <div style={styles.receiptRow}>
              <span>Order Number:</span>
              <strong style={{ color: "var(--primary)" }}>{orderId}</strong>
            </div>
            <div style={styles.receiptRow}>
              <span>Customer:</span>
              <span>{formData.name}</span>
            </div>
            <div style={styles.receiptRow}>
              <span>Ship To:</span>
              <span>{formData.address}, {formData.city}</span>
            </div>
            <div style={styles.receiptRow}>
              <span>Total Charged:</span>
              <strong>${orderTotal.toFixed(2)}</strong>
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 32 }}>
            A confirmation receipt and tracking updates have been sent to <strong>{formData.email}</strong>.
          </p>
          <Link href="/shop" className="btn btn-primary pulse-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Cart Empty Fallback
  if (cart.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyCard} className="card">
          <ShoppingBag size={80} color="var(--primary)" style={{ marginBottom: 24 }} />
          <h1 style={{ marginBottom: 12, fontWeight: 800 }}>Your Cart is Empty</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            You cannot proceed to checkout without adding products to your cart first.
          </p>
          <Link href="/shop" className="btn btn-primary">
            Visit Shop Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div className="container">
        <h1 style={styles.pageTitle}>Secure Checkout</h1>
        <p style={styles.pageSubtitle}>Complete your shipment and secure card payment credentials</p>

        <form onSubmit={handleSubmit} style={styles.layout}>
          {/* LEFT: SHIPPING & PAYMENT FORMS */}
          <div style={styles.formCol}>
            {/* Shipping Card */}
            <div style={styles.formCard} className="card">
              <h3 style={styles.cardTitle}>
                <Truck size={20} color="var(--primary)" />
                <span>Shipping Information</span>
              </h3>
              
              <div style={styles.formGrid}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={styles.label}>Street Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="123 Crimson Street"
                    className="form-input"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={styles.label}>City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="New York"
                    className="form-input"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={styles.label}>ZIP Code</label>
                  <input
                    type="text"
                    name="zip"
                    required
                    placeholder="10001"
                    className="form-input"
                    value={formData.zip}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Payment Card */}
            <div style={styles.formCard} className="card">
              <h3 style={styles.cardTitle}>
                <CreditCard size={20} color="var(--primary)" />
                <span>Payment Details</span>
              </h3>
              
              <div style={styles.formGrid}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={styles.label}>Cardholder Name</label>
                  <input
                    type="text"
                    name="cardName"
                    required
                    placeholder="JOHN DOE"
                    className="form-input"
                    value={formData.cardName}
                    onChange={handleInputChange}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={styles.label}>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    maxLength="19"
                    placeholder="4111 2222 3333 4444"
                    className="form-input"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={styles.label}>Expiration Date</label>
                  <input
                    type="text"
                    name="cardExpiry"
                    required
                    placeholder="MM/YY"
                    className="form-input"
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={styles.label}>CVV / CVC</label>
                  <input
                    type="password"
                    name="cardCvv"
                    required
                    maxLength="4"
                    placeholder="123"
                    className="form-input"
                    value={formData.cardCvv}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY PREVIEW */}
          <div style={styles.summaryCol}>
            <div style={styles.summaryCard} className="card">
              <h3 style={{ ...styles.cardTitle, borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "20px" }}>
                Order Summary
              </h3>

              {/* Items List */}
              <div style={styles.itemsList}>
                {cart.map((item, idx) => (
                  <div key={idx} style={styles.itemRow}>
                    <div>
                      <h5 style={styles.itemName}>{item.product.name}</h5>
                      <span style={styles.itemMeta}>
                        Qty: {item.quantity} | Size: {item.selectedSize}
                      </span>
                    </div>
                    <span style={styles.itemPrice}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Tallies */}
              <div style={styles.calcRows}>
                <div style={styles.calcRow}>
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div style={styles.calcRow}>
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                <div style={styles.calcRow}>
                  <span>Estimated Tax (8%)</span>
                  <span>${estimatedTax.toFixed(2)}</span>
                </div>
              </div>

              <div style={styles.totalRow}>
                <span>Order Total</span>
                <span style={styles.totalVal}>${orderTotal.toFixed(2)}</span>
              </div>

              {/* Security Shield */}
              <div style={styles.security}>
                <ShieldCheck size={18} color="var(--success)" />
                <span>SSL Encrypted & PCI Compliant Transaction</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={styles.submitBtn}
              >
                {isSubmitting ? "Processing Payment..." : `Authorize Payment $${orderTotal.toFixed(2)}`}
              </button>
              
              <Link href="/cart" style={styles.backLink}>
                <ArrowLeft size={16} />
                <span>Modify Cart Items</span>
              </Link>
            </div>
          </div>
        </form>
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
    maxWidth: "500px",
    padding: "50px 30px",
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
  formCol: {
    flex: "2 1 550px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formCard: {
    padding: "30px",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "8px",
    display: "block",
  },
  summaryCol: {
    flex: "1 1 350px",
    display: "flex",
    flexDirection: "column",
  },
  summaryCard: {
    padding: "30px",
    position: "sticky",
    top: "104px", // height of header + offset
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxHeight: "220px",
    overflowY: "auto",
    paddingRight: "6px",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "16px",
    marginBottom: "16px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: "0.9rem",
  },
  itemName: {
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  itemMeta: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  itemPrice: {
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  calcRows: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "16px",
    marginBottom: "16px",
  },
  calcRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "var(--text-muted)",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "700",
    marginBottom: "20px",
  },
  totalVal: {
    fontSize: "1.45rem",
    fontWeight: "800",
    color: "var(--primary)",
  },
  security: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "var(--bg-main)",
    border: "1px solid var(--border)",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "var(--text-muted)",
    marginBottom: "20px",
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    fontSize: "1rem",
    marginBottom: "16px",
  },
  backLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontWeight: "600",
    color: "var(--text-muted)",
    fontSize: "0.9rem",
  },
  successContainer: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
  },
  successCard: {
    maxWidth: "550px",
    width: "100%",
    padding: "50px 40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  successTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    marginBottom: "12px",
    color: "var(--text-primary)",
  },
  successText: {
    fontSize: "1rem",
    color: "var(--text-muted)",
    marginBottom: "24px",
  },
  receipt: {
    width: "100%",
    backgroundColor: "var(--bg-main)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
    textAlign: "left",
  },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
};
