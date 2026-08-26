"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";
import ScrollReveal from "../../components/ScrollReveal";
import { api } from "../../utils/api";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAlert({ type: "", message: "" });
    // Update query params cleanly
    router.replace(`/login?tab=${tab}`, { scroll: false });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "" });

    // Client-side validations
    if (activeTab === "register") {
      if (!name.trim()) {
        setAlert({ type: "error", message: "Please enter your full name." });
        return;
      }
      if (password !== confirmPassword) {
        setAlert({ type: "error", message: "Passwords do not match." });
        return;
      }
    }

    if (!email.trim() || !password) {
      setAlert({ type: "error", message: "Please fill out all fields." });
      return;
    }

    if (password.length < 6) {
      setAlert({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === "login") {
        const data = await api.login(email, password);
        setAlert({ type: "success", message: "Login successful! Redirecting..." });
        
        // Save auth details in localStorage
        localStorage.setItem("user_logged_in", "true");
        localStorage.setItem("user_token", data.token);
        localStorage.setItem("user_email", data.email);
        localStorage.setItem("user_name", data.name);
        
        // Trigger page refresh to update header state
        setTimeout(() => {
          router.push("/");
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }, 1500);
      } else {
        await api.register(name, email, password);
        setAlert({ type: "success", message: "Account created successfully! Switching to Login..." });
        setTimeout(() => {
          handleTabChange("login");
          setPassword("");
          setConfirmPassword("");
        }, 2000);
      }
    } catch (error) {
      setAlert({ type: "error", message: error.message || "An authentication error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    setIsLoading(true);
    setAlert({ type: "", message: "" });

    setTimeout(() => {
      setIsLoading(false);
      setAlert({ type: "success", message: `Connected with ${platform}! Redirecting...` });
      localStorage.setItem("user_logged_in", "true");
      localStorage.setItem("user_email", `${platform.toLowerCase()}user@genai.com`);
      
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 1200);
  };

  return (
    <div className="auth-page-wrapper">
      {/* Dynamic Glowing background nodes */}
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />

      <ScrollReveal direction="scale" duration={800} style={{ width: "100%", maxWidth: "480px", display: "flex", justifyContent: "center" }}>
        <div className="auth-card">
          {/* Header Branding */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Link href="/" style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "1px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}>
                <defs>
                  <linearGradient id="loginLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef233c" />
                    <stop offset="100%" stopColor="#d90429" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="11" stroke="url(#loginLogoGrad)" strokeWidth="2.5" fill="none" />
                <polygon points="16,10 19.5,16 16,22 12.5,16" fill="url(#loginLogoGrad)" />
                <circle cx="16" cy="16" r="2.5" fill="#ffffff" />
              </svg>
              <span style={{ fontWeight: "900", letterSpacing: "1px" }}>
                <span style={{ color: "var(--primary)" }}>GEN</span>
                <span style={{ color: "var(--text-primary)" }}>AI</span>
              </span>
            </Link>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "8px" }}>
              {activeTab === "login" ? "Welcome back! Enter your details to sign in" : "Create an account to join the elite collection"}
            </p>
          </div>

          {/* Form Tabs */}
          <div className="auth-tabs">
            <button
              onClick={() => handleTabChange("login")}
              className={`auth-tab ${activeTab === "login" ? "auth-tab-active" : ""}`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`auth-tab ${activeTab === "register" ? "auth-tab-active" : ""}`}
            >
              Create Account
            </button>
            <div
              className="auth-tab-indicator"
              style={{
                width: "50%",
                left: activeTab === "login" ? "0%" : "50%",
              }}
            />
          </div>

          {/* Alert Messaging */}
          {alert.message && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: alert.type === "error" ? "rgba(217, 4, 41, 0.1)" : "rgba(46, 196, 182, 0.1)",
                color: alert.type === "error" ? "var(--primary)" : "var(--success)",
                border: `1px solid ${alert.type === "error" ? "rgba(217, 4, 41, 0.2)" : "rgba(46, 196, 182, 0.2)"}`,
                borderRadius: "10px",
                padding: "12px 16px",
                fontSize: "0.9rem",
                marginBottom: "24px",
                lineHeight: "1.4",
              }}
            >
              {alert.type === "error" ? <ShieldAlert size={20} style={{ flexShrink: 0 }} /> : <CheckCircle size={20} style={{ flexShrink: 0 }} />}
              <span>{alert.message}</span>
            </div>
          )}

          {/* Auth Forms */}
          <form onSubmit={handleFormSubmit}>
            {activeTab === "register" && (
              <div className="auth-input-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="auth-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <User className="auth-input-icon" size={18} />
              </div>
            )}

            <div className="auth-input-group">
              <input
                type="email"
                placeholder="Email Address"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
              <Mail className="auth-input-icon" size={18} />
            </div>

            <div className="auth-input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Lock className="auth-input-icon" size={18} />
              <button
                type="button"
                className="auth-pass-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {activeTab === "register" && (
              <div className="auth-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="auth-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Lock className="auth-input-icon" size={18} />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {/* Remember Me / Forgot Password */}
            {activeTab === "login" && (
              <div className="auth-meta-row">
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setAlert({ type: "success", message: "Password reset link sent to your email!" });
                  }}
                  className="auth-forgot"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn pulse-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "18px",
                    height: "18px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "50%",
                    borderTopColor: "#ffffff",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
              ) : (
                <>
                  {activeTab === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="auth-divider">or continue with</div>

          {/* Social Logins */}
          <div className="auth-social-row">
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => handleSocialLogin("Google")}
              disabled={isLoading}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.07-1.4-.19-2.07H12v3.9h6.69a5.73 5.73 0 0 1-2.48 3.77v3.13h4c2.34-2.16 3.68-5.32 3.68-8.73z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4-3.13c-1.11.75-2.53 1.19-3.96 1.19-3.05 0-5.63-2.06-6.55-4.83H1.31v3.23A12 12 0 0 0 12 24z"/>
                <path fill="#FBBC05" d="M5.45 14.32a7.14 7.14 0 0 1 0-4.64V6.45H1.31a12 12 0 0 0 0 11.1l4.14-3.23z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.31 6.45l4.14 3.23c.92-2.77 3.5-4.83 6.55-4.83z"/>
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => handleSocialLogin("GitHub")}
              disabled={isLoading}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Embedded Spin Animation */}
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="auth-page-wrapper" style={{ color: "var(--text-muted)" }}>
        Loading authentication page...
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
