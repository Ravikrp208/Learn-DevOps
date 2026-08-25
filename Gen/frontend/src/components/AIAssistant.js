"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { api } from "../utils/api";
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Settings,
  X,
  Trash2,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  ArrowLeft,
  ChevronDown
} from "lucide-react";

// Inline SVG Avatars
const RubyAura = () => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
    <defs>
      <radialGradient id="rubyGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ef233c" />
        <stop offset="60%" stopColor="#d90429" />
        <stop offset="100%" stopColor="#8d0801" />
      </radialGradient>
      <filter id="rubyGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="50" cy="50" r="38" fill="url(#rubyGrad)" filter="url(#rubyGlow)" />
    <circle cx="50" cy="50" r="28" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="16" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />
  </svg>
);

const NovaCore = () => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="novaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef233c" />
        <stop offset="100%" stopColor="#ffccd5" />
      </linearGradient>
    </defs>
    <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="none" stroke="url(#novaGrad)" strokeWidth="3" />
    <polygon points="50,26 70,38 70,62 50,74 30,62 30,38" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="50" cy="50" r="12" fill="url(#novaGrad)" />
  </svg>
);

const CyberSentinel = () => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
    <defs>
      <linearGradient id="cyberGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8d0801" />
        <stop offset="50%" stopColor="#d90429" />
        <stop offset="100%" stopColor="#ffccd5" />
      </linearGradient>
    </defs>
    <rect x="25" y="25" width="50" height="50" rx="10" fill="#141416" stroke="url(#cyberGrad)" strokeWidth="3" />
    <line x1="30" y1="50" x2="70" y2="50" stroke="#ef233c" strokeWidth="4" strokeLinecap="round" />
    <circle cx="38" cy="62" r="3" fill="#ef233c" />
    <circle cx="62" cy="62" r="3" fill="#ef233c" />
  </svg>
);

const CrimsonPix = () => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
    <path d="M20,20 L80,20 L80,48 C80,68 50,85 50,85 C50,85 20,68 20,48 Z" fill="#d90429" stroke="#ffffff" strokeWidth="3" />
    <path d="M30,30 L70,30 L70,48 C70,60 50,74 50,74 C50,74 30,60 30,48 Z" fill="#8d0801" />
    <polygon points="50,36 58,52 42,52" fill="#ffffff" />
  </svg>
);

const AvatarRenderer = ({ type, customUrl, style }) => {
  const containerStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--border)",
    flexShrink: 0,
    ...style
  };

  if (customUrl && customUrl.startsWith("http")) {
    return (
      <div style={containerStyle}>
        <img src={customUrl} alt="Assistant Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {type === "nova" ? (
        <NovaCore />
      ) : type === "cyber" ? (
        <CyberSentinel />
      ) : type === "crimson" ? (
        <CrimsonPix />
      ) : (
        <RubyAura />
      )}
    </div>
  );
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [assistantName, setAssistantName] = useState("Shifra");
  const [assistantImage, setAssistantImage] = useState("ruby");
  const [history, setHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  
  // Custom Settings Temp State
  const [tempName, setTempName] = useState("");
  const [tempImage, setTempImage] = useState("");
  const [tempCustomUrl, setTempCustomUrl] = useState("");

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Load configuration & history
  useEffect(() => {
    if (typeof window !== "undefined") {
      const logged = localStorage.getItem("user_logged_in") === "true";
      const token = localStorage.getItem("user_token");
      const isUserLoggedIn = logged && !!token;
      setIsLoggedIn(isUserLoggedIn);

      if (isUserLoggedIn) {
        fetchAssistantData();
      }
    }
  }, [isOpen]);

  // Scroll to bottom on history change or loading change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // Speech Recognition Initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          if (transcript) {
            setInputMessage(transcript);
            handleSendMessage(transcript);
          }
        };

        rec.onerror = (e) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const fetchAssistantData = async () => {
    try {
      const data = await api.getAssistant();
      setAssistantName(data.assistantName || "Shifra");
      setAssistantImage(data.assistantImage || "ruby");
      setHistory(data.history || []);
      
      setTempName(data.assistantName || "Shifra");
      if (data.assistantImage && data.assistantImage.startsWith("http")) {
        setTempImage("custom");
        setTempCustomUrl(data.assistantImage);
      } else {
        setTempImage(data.assistantImage || "ruby");
        setTempCustomUrl("");
      }
    } catch (err) {
      console.error("Error fetching assistant data:", err);
      if (err.message && (err.message.includes("authorized") || err.message.includes("token") || err.message.includes("JWT") || err.message.includes("Unauthorized"))) {
        setIsLoggedIn(false);
      }
    }
  };

  const speakText = (text) => {
    if (!isSpeechEnabled || !synthesisRef.current) return;
    synthesisRef.current.cancel(); // Stop any ongoing speech

    // Clean text: strip markdown code blocks and stars
    let cleanText = text
      .replace(/```[\s\S]*?```/g, " [showing code block] ")
      .replace(/\*\*|__/g, "")
      .replace(/[*#`_\-]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Attempt Hinglish/Hindi speech synthesis if text contains Hindi words
    const isHindi = /[\u0900-\u097F]/.test(text) || /kya|karo|tum|hai|aap|bol|rha|rhi|gaya|hu/i.test(text);
    utterance.lang = isHindi ? "hi-IN" : "en-US";
    
    synthesisRef.current.speak(utterance);
  };

  const handleSendMessage = async (customPrompt = "") => {
    const promptToSend = (customPrompt || inputMessage).trim();
    if (!promptToSend) return;

    if (!customPrompt) {
      setInputMessage("");
    }

    // Add prompt immediately to history in local view
    const localUserMsg = {
      prompt: promptToSend,
      response: "",
      type: "general",
      userInput: promptToSend,
      createdAt: new Date(),
      isTemp: true
    };
    setHistory((prev) => [...prev, localUserMsg]);
    setLoading(true);

    try {
      const result = await api.askToAssistant(promptToSend);
      
      // Update history removing temp and adding official DB entry
      setHistory((prev) => {
        const filtered = prev.filter((m) => !m.isTemp);
        return [...filtered, result.historyEntry];
      });

      // Handle custom voice reading
      speakText(result.response);

      // Handle app opening shortcuts
      handleActionTriggers(result);

    } catch (err) {
      console.error("Ask to assistant error:", err);
      setHistory((prev) => {
        const filtered = prev.filter((m) => !m.isTemp);
        return [
          ...filtered,
          {
            prompt: promptToSend,
            response: "Oops! Something went wrong. Make sure you are online.",
            type: "general",
            userInput: promptToSend,
            createdAt: new Date()
          }
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActionTriggers = (result) => {
    const type = result.type;
    const query = result.userInput;

    if (!type || type === "general") return;

    let url = "";
    switch (type) {
      case "youtube_play":
      case "youtube_search":
        url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        break;
      case "google_search":
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case "whatsapp_open":
        url = "https://web.whatsapp.com/";
        break;
      case "instagram_open":
        url = "https://www.instagram.com/";
        break;
      case "facebook_open":
        url = "https://www.facebook.com/";
        break;
      case "spotify_open":
        url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
        break;
      case "github_open":
        url = "https://github.com/";
        break;
      case "chatgpt_open":
        url = "https://chatgpt.com/";
        break;
      case "gmail_open":
        url = "https://mail.google.com/";
        break;
      case "maps_open":
        url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
        break;
      default:
        break;
    }

    if (url) {
      setTimeout(() => {
        window.open(url, "_blank");
      }, 1500);
    }
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (synthesisRef.current) {
        synthesisRef.current.cancel(); // Stop speaking when listening
      }
      recognitionRef.current.start();
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    try {
      const finalImageValue = tempImage === "custom" ? tempCustomUrl : tempImage;
      const res = await api.updateAssistant(tempName.trim(), finalImageValue);
      setAssistantName(res.assistantName);
      setAssistantImage(res.assistantImage);
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("Save assistant settings error:", err);
      alert(err.message || "Failed to save settings");
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your chat history?")) {
      try {
        await api.clearAssistantHistory();
        setHistory([]);
      } catch (err) {
        console.error("Clear history error:", err);
      }
    }
  };

  const renderPresetSelectorCard = (key) => {
    const isSelected = tempImage === key;
    return (
      <button
        type="button"
        key={key}
        onClick={() => setTempImage(key)}
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          padding: "3px",
          border: isSelected ? "3px solid var(--primary)" : "2px solid transparent",
          backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
          cursor: "pointer",
          transition: "var(--transition)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <AvatarRenderer type={key} style={{ width: "100%", height: "100%" }} />
      </button>
    );
  };

  return (
    <>
      {/* 1. FLOATING BUTTON */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsSettingsOpen(false);
          if (synthesisRef.current) synthesisRef.current.cancel();
        }}
        style={styles.floatingButton}
        className="pulse-primary"
        title="Chat with AI Assistant"
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* 2. CHAT DRAWER */}
      {isOpen && (
        <div style={styles.chatDrawer} className="card">
          {/* A. NOT LOGGED IN OVERLAY */}
          {!isLoggedIn ? (
            <div style={styles.notLoggedIn}>
              <Sparkles size={40} color="var(--primary)" style={{ marginBottom: "16px" }} />
              <h3 style={{ marginBottom: "8px", fontWeight: "700" }}>Meet Your AI Partner</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginBottom: "20px", padding: "0 16px" }}>
                Customize your own AI Assistant, chat using voice commands, play YouTube songs, and query details dynamically.
              </p>
              <Link
                href="/login"
                className="btn btn-primary"
                onClick={() => setIsOpen(false)}
                style={{ width: "80%" }}
              >
                Log In To Get Started
              </Link>
            </div>
          ) : (
            <>
              {/* B. LOGGED IN CHAT WINDOW */}
              
              {/* Header */}
              <div style={styles.chatHeader}>
                <div style={styles.headerUser}>
                  <AvatarRenderer type={assistantImage} customUrl={assistantImage} />
                  <div>
                    <h4 style={styles.headerName}>{assistantName}</h4>
                    <span style={styles.headerStatus}>
                      {isListening ? "Listening..." : loading ? "Typing..." : "Online"}
                    </span>
                  </div>
                </div>

                <div style={styles.headerActions}>
                  <button
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    style={styles.actionBtn}
                    title={isSpeechEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
                  >
                    {isSpeechEnabled ? <Volume2 size={18} color="var(--primary)" /> : <VolumeX size={18} />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setTempName(assistantName);
                      if (assistantImage.startsWith("http")) {
                        setTempImage("custom");
                        setTempCustomUrl(assistantImage);
                      } else {
                        setTempImage(assistantImage);
                        setTempCustomUrl("");
                      }
                      setIsSettingsOpen(true);
                    }}
                    style={styles.actionBtn}
                    title="Customize Assistant"
                  >
                    <Settings size={18} />
                  </button>
                  
                  <button
                    onClick={handleClearHistory}
                    style={styles.actionBtn}
                    title="Clear Conversation"
                  >
                    <Trash2 size={18} />
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    style={styles.actionBtn}
                    title="Close Chat"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>

              {/* Settings View */}
              {isSettingsOpen ? (
                <form onSubmit={handleSaveSettings} style={styles.settingsPanel}>
                  <div style={styles.settingsHeading}>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      style={styles.backBtn}
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Customize Companion</h3>
                  </div>

                  <div style={styles.settingsFormGroup}>
                    <label style={styles.settingsLabel}>Assistant Name</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Name (e.g. Shifra)"
                      style={styles.settingsInput}
                      required
                    />
                  </div>

                  <div style={styles.settingsFormGroup}>
                    <label style={styles.settingsLabel}>Select Avatar</label>
                    <div style={styles.presetGrid}>
                      {["ruby", "nova", "cyber", "crimson"].map((key) => renderPresetSelectorCard(key))}
                      <button
                        type="button"
                        onClick={() => setTempImage("custom")}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          border: tempImage === "custom" ? "3px solid var(--primary)" : "1px solid var(--border)",
                          backgroundColor: "var(--bg-main)",
                          color: tempImage === "custom" ? "var(--primary)" : "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: "700"
                        }}
                      >
                        Link
                      </button>
                    </div>
                  </div>

                  {tempImage === "custom" && (
                    <div style={styles.settingsFormGroup}>
                      <label style={styles.settingsLabel}>Custom Avatar Image URL</label>
                      <input
                        type="url"
                        value={tempCustomUrl}
                        onChange={(e) => setTempCustomUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        style={styles.settingsInput}
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }}>
                    Save Customizations
                  </button>
                </form>
              ) : (
                <>
                  {/* Chat Body Messages */}
                  <div style={styles.chatBody}>
                    {history.length === 0 ? (
                      <div style={styles.emptyChat}>
                        <Sparkles size={30} color="var(--primary)" style={{ opacity: 0.6, marginBottom: "8px" }} />
                        <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>Say Hello to {assistantName}!</p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "center", padding: "0 24px" }}>
                          Try saying "What day is today?", "Play Kesariya", or "Open ChatGPT".
                        </p>
                      </div>
                    ) : (
                      history.map((msg, i) => (
                        <div key={i} style={styles.messageRow}>
                          {/* User Message */}
                          <div style={styles.userMsgWrapper}>
                            <div style={styles.userMsgBubble}>
                              {msg.prompt}
                            </div>
                          </div>

                          {/* Assistant Message */}
                          {msg.response && (
                            <div style={styles.assistantMsgWrapper}>
                              <AvatarRenderer
                                type={assistantImage}
                                customUrl={assistantImage}
                                style={{ width: "28px", height: "28px" }}
                              />
                              <div style={styles.assistantMsgBubble}>
                                {msg.response}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {loading && (
                      <div style={styles.assistantMsgWrapper}>
                        <AvatarRenderer
                          type={assistantImage}
                          customUrl={assistantImage}
                          style={{ width: "28px", height: "28px" }}
                        />
                        <div style={styles.typingIndicator}>
                          <span style={styles.dot}></span>
                          <span style={styles.dot}></span>
                          <span style={styles.dot}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Form */}
                  <div style={styles.inputArea}>
                    <input
                      type="text"
                      placeholder={`Ask ${assistantName}...`}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      style={styles.chatInput}
                      disabled={loading || isListening}
                    />

                    <button
                      onClick={handleToggleListening}
                      style={{
                        ...styles.micButton,
                        backgroundColor: isListening ? "var(--primary)" : "transparent",
                        color: isListening ? "#ffffff" : "var(--text-muted)"
                      }}
                      title={isListening ? "Stop listening" : "Start voice command"}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={loading || isListening || !inputMessage.trim()}
                      style={styles.sendButton}
                      title="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

// React styles matching variables
const styles = {
  floatingButton: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(217, 4, 41, 0.4)",
    zIndex: 999,
    transition: "transform 0.2s"
  },
  chatDrawer: {
    position: "fixed",
    bottom: "96px",
    right: "24px",
    width: "370px",
    height: "500px",
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--border)",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    // Custom media query behavior via CSS is preferred, but simple JS-based responsive width handles mobile viewport
    maxWidth: "calc(100vw - 48px)"
  },
  notLoggedIn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center"
  },
  chatHeader: {
    padding: "14px 16px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.4)"
  },
  headerUser: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  headerName: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "var(--text-primary)"
  },
  headerStatus: {
    fontSize: "0.75rem",
    color: "var(--primary)",
    display: "block",
    fontWeight: "600"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "50%",
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition)"
  },
  chatBody: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "rgba(248, 249, 250, 0.4)"
  },
  emptyChat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    paddingTop: "40px"
  },
  messageRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  userMsgWrapper: {
    display: "flex",
    justifyContent: "flex-end"
  },
  userMsgBubble: {
    backgroundColor: "var(--primary)",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: "16px 16px 2px 16px",
    fontSize: "0.85rem",
    maxWidth: "80%",
    boxShadow: "0 2px 5px rgba(217, 4, 41, 0.15)",
    wordBreak: "break-word"
  },
  assistantMsgWrapper: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "4px"
  },
  assistantMsgBubble: {
    backgroundColor: "var(--bg-card)",
    color: "var(--text-primary)",
    padding: "10px 14px",
    borderRadius: "2px 16px 16px 16px",
    fontSize: "0.85rem",
    maxWidth: "80%",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
    whiteSpace: "pre-line",
    wordBreak: "break-word"
  },
  typingIndicator: {
    backgroundColor: "var(--bg-card)",
    padding: "12px 16px",
    borderRadius: "2px 16px 16px 16px",
    border: "1px solid var(--border)",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  },
  dot: {
    width: "6px",
    height: "6px",
    backgroundColor: "var(--text-muted)",
    borderRadius: "50%",
    display: "inline-block",
    animation: "fadeIn 1.2s infinite alternate"
  },
  inputArea: {
    padding: "12px 16px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.4)"
  },
  chatInput: {
    flex: 1,
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "10px 16px",
    fontSize: "0.85rem",
    outline: "none",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    transition: "var(--transition)"
  },
  micButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition)"
  },
  sendButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    color: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition)"
  },
  settingsPanel: {
    flex: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto"
  },
  settingsHeading: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderBottom: "1px solid var(--border)",
    paddingBottom: "12px"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.85rem",
    fontWeight: "600"
  },
  settingsFormGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  settingsLabel: {
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "var(--text-muted)",
    textTransform: "uppercase"
  },
  settingsInput: {
    border: "1px solid var(--border)",
    borderRadius: "var(--border-radius)",
    padding: "10px 12px",
    fontSize: "0.85rem",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    outline: "none"
  },
  presetGrid: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    padding: "8px 0"
  }
};
