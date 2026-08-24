"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "../components/ProductCard";
import Hero3D from "../components/Hero3D";
import ScrollReveal from "../components/ScrollReveal";
import TextReveal from "../components/TextReveal";
import { api } from "../utils/api";
import { ArrowRight, Flame, ShieldCheck, Truck, RefreshCw, Star } from "lucide-react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [isMobile, setIsMobile] = useState(false);

  // Products API States
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const data = await api.getProducts();
        setFeaturedProducts(data.filter((p) => p.isFeatured));
      } catch (err) {
        console.error("Failed to load featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Responsive state handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (val) => String(val).padStart(2, "0");

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroImageWrapper}>
          <Image
            src="/hero_fashion.png"
            alt="Rouge Fashion Banner"
            fill
            priority
            style={styles.heroImage}
          />
          <div style={styles.heroOverlay(isMobile)} />
        </div>
        
        <div className="container" style={styles.heroContent(isMobile)}>
          <ScrollReveal direction="left" duration={900} style={styles.heroLeft(isMobile)}>
            <span style={styles.heroSubtitle}>
              <Flame size={16} color="var(--primary)" style={{ marginRight: 6, verticalAlign: "middle" }} />
              NEW COLLECTION 2026
            </span>
            <h1 style={styles.heroTitle}>
              <TextReveal text="Unleash the" />{" "}
              <span className="shimmer-text" style={styles.highlightText}>
                <TextReveal text="Crimson" delay={300} />
              </span>{" "}
              <TextReveal text="Inside You." delay={500} />
            </h1>
            <p style={styles.heroDescription}>
              Explore our curated shop featuring premium leather bags, high-performance running sneakers, acoustic noise-canceling headphones, and designer watches in striking red and white designs.
            </p>
            <div style={styles.heroBtns}>
              <Link href="/shop" className="btn btn-primary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link href="/shop?liked=true" className="btn btn-secondary" style={{ borderColor: "#ffffff", color: "#ffffff" }}>
                View Wishlist
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" duration={900} style={styles.heroRight(isMobile)}>
            <Hero3D />
          </ScrollReveal>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section style={styles.values}>
        <div className="container" style={styles.valuesGrid}>
          <ScrollReveal direction="up" delay={0} duration={600} style={styles.valueCard}>
            <Truck size={36} color="var(--primary)" />
            <div>
              <h4 style={styles.valueTitle}>Free Express Shipping</h4>
              <p style={styles.valueDesc}>Complimentary delivery on all orders over $99.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150} duration={600} style={styles.valueCard}>
            <RefreshCw size={36} color="var(--primary)" />
            <div>
              <h4 style={styles.valueTitle}>30-Day Easy Returns</h4>
              <p style={styles.valueDesc}>Return any item for free within 30 days, no questions asked.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={300} duration={600} style={styles.valueCard}>
            <ShieldCheck size={36} color="var(--primary)" />
            <div>
              <h4 style={styles.valueTitle}>Secure Payment</h4>
              <p style={styles.valueDesc}>Your payment details are 100% protected and encrypted.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section style={styles.section}>
        <div className="container">
          <ScrollReveal direction="up" duration={700}>
            <h2 className="section-title">
              <TextReveal text="Shop By Categories" />
            </h2>
            <p className="section-subtitle">
              <TextReveal text="Browse through our beautifully color-curated departments" delay={150} />
            </p>
          </ScrollReveal>
          
          <div style={styles.categoriesGrid}>
            {[
              { name: "Sneakers", count: "3 Products", image: "/product_sneakers.png", path: "/shop?category=Sneakers" },
              { name: "Electronics", count: "2 Products", image: "/product_headphones.png", path: "/shop?category=Electronics" },
              { name: "Watches", count: "2 Products", image: "/product_watch.png", path: "/shop?category=Watches" },
              { name: "Bags", count: "2 Products", image: "/product_bag.png", path: "/shop?category=Bags" }
            ].map((cat, i) => (
              <ScrollReveal direction="up" delay={i * 100} duration={600} key={i} style={styles.categoryCard} className="card">
                <Link href={cat.path} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%" }}>
                  <div style={styles.categoryImgWrapper}>
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={180}
                      height={180}
                      style={styles.categoryImg}
                    />
                  </div>
                  <div style={styles.categoryContent}>
                    <h3 style={styles.categoryName}>{cat.name}</h3>
                    <span style={styles.categoryCount}>{cat.count}</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section style={{ ...styles.section, backgroundColor: "var(--bg-card)" }}>
        <div className="container">
          <ScrollReveal direction="up" duration={700}>
            <h2 className="section-title">
              <TextReveal text="Featured Highlights" />
            </h2>
            <p className="section-subtitle">
              <TextReveal text="Our top recommendations hand-picked for your lifestyle" delay={150} />
            </p>
          </ScrollReveal>
          
          <div className="product-grid">
            {loading ? (
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", padding: "40px 0" }}>
                <p style={{ color: "var(--primary)", fontWeight: "600", fontSize: "1.1rem" }}>Loading featured products...</p>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          
          <ScrollReveal direction="up" delay={200} duration={600} style={{ textAlign: "center", marginTop: "48px" }}>
            <Link href="/shop" className="btn btn-secondary">
              View All Products
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. PROMO & TIMER BANNER */}
      <section style={styles.promoSection}>
        <div className="container" style={styles.promoContainer}>
          <ScrollReveal direction="left" duration={800} style={styles.promoTextCol}>
            <span style={styles.promoBadge}>FLASH SALE</span>
            <h2 style={styles.promoTitle}>
              <TextReveal text="The Crimson Release Deal" />
            </h2>
            <p style={styles.promoDesc}>
              Get an extra <strong>25% OFF</strong> our premium sneakers and watches collection when using the code <strong>CRIMSON25</strong> at checkout.
            </p>
            
            {/* Live Ticking Countdown */}
            <div style={styles.timerRow}>
              <div style={styles.timerBox}>
                <span style={styles.timerNum}>{formatTime(timeLeft.hours)}</span>
                <span style={styles.timerLabel}>Hours</span>
              </div>
              <span style={styles.timerColon}>:</span>
              <div style={styles.timerBox}>
                <span style={styles.timerNum}>{formatTime(timeLeft.minutes)}</span>
                <span style={styles.timerLabel}>Mins</span>
              </div>
              <span style={styles.timerColon}>:</span>
              <div style={styles.timerBox}>
                <span style={styles.timerNum}>{formatTime(timeLeft.seconds)}</span>
                <span style={styles.timerLabel}>Secs</span>
              </div>
            </div>
            
            <Link href="/shop" className="btn btn-white" style={styles.promoBtn}>
              Claim Coupon Now
            </Link>
          </ScrollReveal>
          
          <ScrollReveal direction="scale" duration={800} style={styles.promoImgCol}>
            <Image
              src="/product_sneakers.png"
              alt="Promo Sneakers"
              width={350}
              height={350}
              style={styles.promoImg}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section style={styles.section}>
        <div className="container">
          <ScrollReveal direction="up" duration={700}>
            <h2 className="section-title">
              <TextReveal text="What Our Customers Say" />
            </h2>
            <p className="section-subtitle">
              <TextReveal text="Don't take our word for it—see reviews from worldwide buyers" delay={150} />
            </p>
          </ScrollReveal>
          
          <div style={styles.testimonialsGrid}>
            {[
              {
                name: "Sarah Jenkins",
                role: "Fashion Designer",
                text: "The Crimson Elite sneakers are a work of art. The quality of materials and the vibrant red-and-white accents stand out. They are incredibly comfortable too!",
                rating: 5
              },
              {
                name: "Marcus Aurelius",
                role: "Tech Enthusiast",
                text: "I bought the SoundPro headphones and the sound quality is top-tier. The ANC blocks noise perfectly. A premium headphone in red matte is exactly what I wanted.",
                rating: 5
              },
              {
                name: "Emily Watson",
                role: "Product Manager",
                text: "The minimalist watch looks gorgeous on my wrist. The genuine red leather strap combined with the clean white dial gets compliments every single day.",
                rating: 4
              }
            ].map((t, idx) => (
              <ScrollReveal direction="up" delay={idx * 150} duration={600} key={idx} style={styles.testCard} className="card">
                <div style={styles.testStars}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < t.rating ? "var(--rating)" : "none"}
                      color={i < t.rating ? "var(--rating)" : "#d1d5db"}
                    />
                  ))}
                </div>
                <p style={styles.testText}>"{t.text}"</p>
                <div style={styles.testUser}>
                  <div style={styles.testAvatar}>{t.name[0]}</div>
                  <div>
                    <h4 style={styles.testName}>{t.name}</h4>
                    <span style={styles.testRole}>{t.role}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    height: "calc(100vh - 80px)",
    minHeight: "550px",
    maxHeight: "800px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    color: "#ffffff",
    overflow: "hidden",
  },
  heroImageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  heroImage: {
    objectFit: "cover",
  },
  heroOverlay: (isMobile) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: isMobile 
      ? "linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 60%, rgba(217, 4, 41, 0.4) 100%)"
      : "linear-gradient(to right, rgba(0, 0, 0, 0.8) 30%, rgba(217, 4, 41, 0.2) 70%, rgba(0, 0, 0, 0.1) 100%)",
  }),
  heroContent: (isMobile) => ({
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    width: "100%",
  }),
  heroLeft: (isMobile) => ({
    flex: "1",
    maxWidth: isMobile ? "100%" : "55%",
    textAlign: isMobile ? "center" : "left",
    display: "flex",
    flexDirection: "column",
    alignItems: isMobile ? "center" : "flex-start",
  }),
  heroRight: (isMobile) => ({
    flex: "1",
    maxWidth: isMobile ? "100%" : "42%",
    width: "100%",
    display: isMobile ? "none" : "block",
  }),
  heroSubtitle: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    color: "var(--primary)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "0.8rem",
    letterSpacing: "1.5px",
    marginBottom: "20px",
    boxShadow: "var(--shadow-sm)",
  },
  heroTitle: {
    fontSize: "3.5rem",
    fontWeight: "900",
    lineHeight: "1.1",
    color: "#ffffff",
    marginBottom: "20px",
  },
  highlightText: {
    color: "var(--primary)",
    textShadow: "0 0 10px rgba(217, 4, 41, 0.2)",
  },
  heroDescription: {
    fontSize: "1.1rem",
    lineHeight: "1.6",
    color: "#e4e4e7",
    marginBottom: "36px",
  },
  heroBtns: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  values: {
    padding: "36px 0",
    borderBottom: "1px solid var(--border)",
    backgroundColor: "var(--bg-card)",
  },
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },
  valueCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
  },
  valueTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    marginBottom: "4px",
  },
  valueDesc: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  section: {
    padding: "80px 0",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
  },
  categoryCard: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    cursor: "pointer",
  },
  categoryImgWrapper: {
    width: "180px",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg-main)",
    borderRadius: "50%",
    padding: "12px",
    marginBottom: "20px",
    border: "2px dashed var(--border)",
    transition: "var(--transition)",
  },
  categoryImg: {
    objectFit: "contain",
    transition: "transform 0.3s ease",
  },
  categoryContent: {
    marginTop: "8px",
  },
  categoryName: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "4px",
  },
  categoryCount: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  promoSection: {
    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
    padding: "80px 0",
    color: "#ffffff",
    overflow: "hidden",
  },
  promoContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "48px",
  },
  promoTextCol: {
    flex: "1 1 500px",
  },
  promoBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "1px",
    display: "inline-block",
    marginBottom: "16px",
  },
  promoTitle: {
    fontSize: "2.75rem",
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: "16px",
  },
  promoDesc: {
    fontSize: "1.1rem",
    lineHeight: "1.6",
    color: "#ffe3e6",
    marginBottom: "32px",
  },
  timerRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
  },
  timerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    color: "var(--primary)",
    borderRadius: "10px",
    padding: "12px 18px",
    minWidth: "75px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  timerNum: {
    fontSize: "1.75rem",
    fontWeight: "800",
    lineHeight: "1",
  },
  timerLabel: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    fontWeight: "700",
    marginTop: "4px",
    color: "var(--text-muted)",
  },
  timerColon: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#ffffff",
  },
  promoBtn: {
    padding: "16px 32px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
  },
  promoImgCol: {
    flex: "1 1 350px",
    display: "flex",
    justifyContent: "center",
  },
  promoImg: {
    filter: "drop-shadow(0 15px 30px rgba(0, 0, 0, 0.25))",
    transform: "rotate(-10deg)",
    transition: "transform 0.5s ease",
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
  },
  testCard: {
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  testStars: {
    display: "flex",
  },
  testText: {
    fontSize: "0.95rem",
    color: "var(--text-primary)",
    fontStyle: "italic",
    lineHeight: "1.6",
    flex: 1,
  },
  testUser: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  testAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
  testName: {
    fontSize: "0.95rem",
    fontWeight: "700",
  },
  testRole: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
};
