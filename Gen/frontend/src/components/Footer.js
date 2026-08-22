"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Shield } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.grid}>
        {/* Brand Column */}
        <div style={styles.col}>
          <Link href="/" style={styles.logo}>
            <span style={{ color: "var(--primary)" }}>ROUGE</span>
            <span style={{ color: "#ffffff" }}>.</span>
          </Link>
          <p style={styles.description}>
            Elevating your everyday style with our curated collections of premium apparel, tech accessories, and timepieces. Experience pure craftsmanship.
          </p>
          <div style={styles.socials}>
            <a href="#" style={styles.socialIcon} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" style={styles.socialIcon} aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" style={styles.socialIcon} aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Quick Links</h4>
          <ul style={styles.linksList}>
            <li>
              <Link href="/shop" style={styles.link}>
                Our Catalog
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Sneakers" style={styles.link}>
                Sneakers Collection
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Electronics" style={styles.link}>
                Premium Sound
              </Link>
            </li>
            <li>
              <Link href="/shop?category=Watches" style={styles.link}>
                Luxury Watches
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Contact Us</h4>
          <ul style={styles.linksList}>
            <li style={styles.contactItem}>
              <MapPin size={16} color="var(--primary)" />
              <span>120 Red Crimson Ave, Studio 4B, New York</span>
            </li>
            <li style={styles.contactItem}>
              <Phone size={16} color="var(--primary)" />
              <span>+1 (555) 019-2834</span>
            </li>
            <li style={styles.contactItem}>
              <Mail size={16} color="var(--primary)" />
              <span>support@rougeshop.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Newsletter</h4>
          <p style={styles.newsletterText}>
            Subscribe to get notifications about sales, new releases, and exclusive discount offers.
          </p>
          <form onSubmit={handleSubscribe} style={styles.subscribeForm}>
            <input
              type="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.subscribeInput}
            />
            <button type="submit" style={styles.subscribeBtn} aria-label="Subscribe">
              <Send size={16} color="#ffffff" />
            </button>
          </form>
          {subscribed && (
            <p style={styles.successMsg}>
              Thank you for subscribing! Check your inbox soon.
            </p>
          )}
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={styles.bottom}>
        <div className="container" style={styles.bottomContainer}>
          <p style={styles.copy}>
            &copy; {new Date().getFullYear()} ROUGE Shop. All rights reserved. Made for premium UI experiences.
          </p>
          <div style={styles.bottomLinks}>
            <Link href="#" style={styles.bottomLink}>
              Privacy Policy
            </Link>
            <Link href="#" style={styles.bottomLink}>
              Terms of Service
            </Link>
            <span style={styles.bottomLink}>
              <Shield size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
              Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#111115",
    color: "#e5e5e5",
    paddingTop: "70px",
    marginTop: "auto",
    borderTop: "3px solid var(--primary)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "40px",
    paddingBottom: "50px",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  logo: {
    fontSize: "1.75rem",
    fontWeight: "900",
    letterSpacing: "2px",
    marginBottom: "8px",
    display: "inline-block",
  },
  description: {
    fontSize: "0.9rem",
    lineHeight: "1.6",
    color: "#a0a0ab",
  },
  socials: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  socialIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#1a1a24",
    color: "#e5e5e5",
    transition: "var(--transition)",
  },
  colTitle: {
    color: "#ffffff",
    fontSize: "1.1rem",
    fontWeight: "700",
    marginBottom: "12px",
    position: "relative",
  },
  linksList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  link: {
    color: "#a0a0ab",
    fontSize: "0.9rem",
    transition: "color 0.2s",
  },
  contactItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    color: "#a0a0ab",
    fontSize: "0.9rem",
  },
  newsletterText: {
    fontSize: "0.9rem",
    color: "#a0a0ab",
  },
  subscribeForm: {
    display: "flex",
    position: "relative",
    marginTop: "8px",
  },
  subscribeInput: {
    flex: 1,
    padding: "12px 48px 12px 16px",
    borderRadius: "8px",
    border: "1px solid #27272a",
    backgroundColor: "#18181b",
    color: "#ffffff",
    outline: "none",
    fontSize: "0.9rem",
  },
  subscribeBtn: {
    position: "absolute",
    right: "4px",
    top: "4px",
    bottom: "4px",
    width: "40px",
    backgroundColor: "var(--primary)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  successMsg: {
    fontSize: "0.85rem",
    color: "var(--success)",
    marginTop: "4px",
  },
  bottom: {
    borderTop: "1px solid #1f1f23",
    padding: "24px 0",
    backgroundColor: "#09090b",
  },
  bottomContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  copy: {
    fontSize: "0.85rem",
    color: "#71717a",
  },
  bottomLinks: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  bottomLink: {
    fontSize: "0.85rem",
    color: "#71717a",
    display: "flex",
    alignItems: "center",
  },
};
