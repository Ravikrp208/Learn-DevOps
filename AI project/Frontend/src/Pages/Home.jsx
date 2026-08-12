import React, { useContext, useState, useEffect, useRef } from "react";
import { userDataContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiMicrophone,
  HiPaperAirplane,
  HiMagnifyingGlass,
  HiArrowRightOnRectangle,
  HiXMark,
  HiArrowPath,
  HiCpuChip,
  HiUser,
  HiTrash,
  HiClipboardDocument,
  HiCheck,
  HiSpeakerWave,
  HiSparkles
} from "react-icons/hi2";
import defaultAvatar from "../assets/image2.png";

function Home() {
  const { userData, setUserData, serverurl } = useContext(userDataContext) || {};
  const navigate = useNavigate();

  // Assistant Info
  const assistantName = userData?.assistantName || "Shifra";
  const assistantImage = userData?.assistantImage || defaultAvatar;

  // UI & Interaction States
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [chatHistory, setChatHistory] = useState(userData?.history || []);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // References
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Sync history with userData context
  useEffect(() => {
    if (userData?.history && Array.isArray(userData.history)) {
      setChatHistory(userData.history);
    }
  }, [userData]);

  // Auto-scroll chat history container to latest message smoothly without scrolling window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatHistory, isProcessing]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage("");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleExecuteQuery(transcript);
      };

      recognition.onerror = (event) => {
        console.warn("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone permission denied.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech with smart summary spoken portion for long explanations
  const speakResponse = (text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Clean formatting characters for speech
    const cleanText = text
      .replace(/[#*_`~>-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // If answer is very long, speak first 2 key sentences or up to 250 characters for clear voice feedback
    let spokenPortion = cleanText;
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 2) {
      spokenPortion = sentences.slice(0, 2).join(" ");
    } else if (cleanText.length > 280) {
      spokenPortion = cleanText.substring(0, 250) + "...";
    }

    const utterance = new SpeechSynthesisUtterance(spokenPortion);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Samantha") ||
          v.name.includes("Zira")) &&
        (v.lang.startsWith("en") || v.lang.startsWith("hi"))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Toggle Voice Listening
  const handleToggleListening = () => {
    if (isSpeaking) {
      stopSpeaking();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
    } else {
      setErrorMessage("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn("Recognition start error:", err);
      }
    }
  };

  // Open action target URL only for explicit external app requests
  const triggerActionUrl = (type, userInput) => {
    let targetUrl = null;
    const cleanQ = encodeURIComponent((userInput || "").trim());

    switch (type) {
      case "youtube_play":
      case "YOUTUBE_PLAY":
        targetUrl = `https://www.youtube.com/results?search_query=${cleanQ}`;
        break;
      case "youtube_search":
        targetUrl = `https://www.youtube.com/results?search_query=${cleanQ}`;
        break;
      case "instagram_open":
        targetUrl = "https://www.instagram.com";
        break;
      case "whatsapp_open":
      case "WHATSAPP_OPEN_CHAT":
        targetUrl = "https://web.whatsapp.com";
        break;
      case "facebook_open":
        targetUrl = "https://www.facebook.com";
        break;
      case "spotify_open":
        targetUrl = cleanQ
          ? `https://open.spotify.com/search/${cleanQ}`
          : "https://open.spotify.com";
        break;
      case "github_open":
        targetUrl = "https://github.com";
        break;
      case "chatgpt_open":
        targetUrl = "https://chatgpt.com";
        break;
      case "gmail_open":
        targetUrl = "https://mail.google.com";
        break;
      case "maps_open":
        targetUrl = `https://www.google.com/maps/search/${cleanQ}`;
        break;
      case "calculator_open":
        targetUrl = "https://www.google.com/search?q=calculator";
        break;
      default:
        // Do not popup tabs for informational / explanation questions
        targetUrl = null;
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
    return targetUrl;
  };

  // Process and Execute Command
  const handleExecuteQuery = async (queryText) => {
    const promptToSend = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!promptToSend || isProcessing) return;

    setSearchQuery("");

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      setIsListening(false);
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const baseUrl = serverurl || "http://localhost:8000";
      const res = await axios.post(
        `${baseUrl}/api/user/asktoassistant`,
        { prompt: promptToSend },
        { withCredentials: true }
      );

      const data = res.data;
      const responseText = data.response || "Here is the explanation for your query.";
      const actionType = data.type || "general";
      const userInput = data.userInput || promptToSend;

      // Trigger app opening if applicable
      triggerActionUrl(actionType, userInput);

      // Voice response
      speakResponse(responseText);

      const newEntry = data.historyEntry || {
        prompt: promptToSend,
        response: responseText,
        type: actionType,
        userInput: userInput,
        createdAt: new Date(),
      };

      setChatHistory((prev) => [...prev, newEntry]);

      if (setUserData) {
        setUserData((prev) => ({
          ...prev,
          history: [...(prev?.history || []), newEntry],
        }));
      }
    } catch (err) {
      console.error("Execute Query Error:", err);
      const errMsg = err?.response?.data?.message || "Failed to process request.";
      setErrorMessage(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleExecuteQuery();
  };

  // Copy answer text
  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Clear chat history
  const handleClearHistory = async () => {
    try {
      setChatHistory([]);
      const baseUrl = serverurl || "http://localhost:8000";
      await axios.post(`${baseUrl}/api/user/clear-history`, {}, { withCredentials: true });
      if (setUserData) {
        setUserData((prev) => ({ ...prev, history: [] }));
      }
    } catch (err) {
      console.error("Clear History Error:", err);
    }
  };

  const handleLogOut = async () => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      await axios.get(`${serverurl || "http://localhost:8000"}/api/auth/logout`, {
        withCredentials: true,
      });
      if (setUserData) setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      if (setUserData) setUserData(null);
      navigate("/signin");
    }
  };

  // Helper for formatting inline markdown (bold & code)
  const formatInlineText = (str) => {
    if (!str) return "";
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={pIdx} className="font-bold text-cyan-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        return (
          <code key={pIdx} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs sm:text-sm border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Rich Multi-line / Structured Explanation Renderer with larger clear typography
  const renderFormattedResponse = (text) => {
    if (!text) return null;
    const lines = text.split("\n");

    return (
      <div className="space-y-2.5 text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lIdx} className="h-1.5" />;
          }

          // Heading ### or ##
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={lIdx} className="text-sm sm:text-base font-bold text-cyan-300 pt-1.5">
                {trimmed.replace(/^###\s+/, "")}
              </h4>
            );
          }
          if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
            return (
              <h3 key={lIdx} className="text-base sm:text-lg font-bold text-cyan-200 pt-2 pb-1 border-b border-slate-800">
                {trimmed.replace(/^#+\s+/, "")}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            const bulletContent = trimmed.replace(/^[\*\-•]\s+/, "");
            return (
              <div key={lIdx} className="flex items-start gap-2.5 pl-2 sm:pl-3 py-0.5">
                <span className="text-cyan-400 text-base leading-tight flex-shrink-0">•</span>
                <div className="text-slate-200 flex-1">{formatInlineText(bulletContent)}</div>
              </div>
            );
          }

          // Numbered list items
          const numMatch = trimmed.match(/^(\d+\.)\s+(.+)$/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start gap-2.5 pl-2 sm:pl-3 py-0.5">
                <span className="text-cyan-400 font-bold text-sm sm:text-base flex-shrink-0">{numMatch[1]}</span>
                <div className="text-slate-200 flex-1">{formatInlineText(numMatch[2])}</div>
              </div>
            );
          }

          // Standard paragraph
          return (
            <p key={lIdx} className="text-slate-200">
              {formatInlineText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  const suggestionChips = [
    "What is the date today?",
    "Explain Java with key features",
    "What is Docker and Kubernetes?",
    "Play trending songs on YouTube",
    "Who created you?",
  ];

  return (
    <div className="w-full h-full min-h-full max-h-screen bg-[#030324] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-15%] left-[25%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[25%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Header Navbar - Permanently at top, Full Width, Logout on Far Right */}
      <header className="w-full flex-shrink-0 flex items-center justify-between py-3.5 px-4 sm:px-8 lg:px-12 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-xl z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300">
            <HiCpuChip className="text-xl sm:text-2xl" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">{assistantName}</h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Right Side: Clear Chat & Logout Button */}
        <div className="flex items-center gap-3">
          {chatHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Clear chat history"
            >
              <HiTrash className="text-base text-slate-400" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <button
            onClick={handleLogOut}
            className="px-4 sm:px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 border border-red-400/40 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-red-500/20"
            title="Logout"
          >
            <HiArrowRightOnRectangle className="text-base sm:text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area: Expanded Width for High Visibility & Readability */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start py-2.5 sm:py-3.5 z-10 min-h-0 overflow-hidden">
        
        {/* 1. Assistant Avatar Preview */}
        <div className="flex-shrink-0 flex flex-col items-center py-1">
          <div className="relative group flex flex-col items-center">
            <div
              className={`absolute -inset-3 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
                isSpeaking
                  ? "bg-gradient-to-r from-cyan-400 to-blue-600 opacity-90 scale-110 animate-pulse"
                  : isListening
                  ? "bg-gradient-to-r from-emerald-400 to-green-600 opacity-90 scale-110 animate-pulse"
                  : isProcessing
                  ? "bg-gradient-to-r from-purple-400 to-pink-500 opacity-80 scale-105 animate-pulse"
                  : "bg-blue-600/30 opacity-40 group-hover:opacity-70"
              }`}
            />

            <div
              className={`relative rounded-full p-1.5 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all ${
                chatHistory.length > 0 ? "w-16 h-16 sm:w-20 sm:h-20" : "w-24 h-24 sm:w-32 sm:h-32"
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-slate-900 relative">
                <img
                  src={assistantImage || defaultAvatar}
                  alt={assistantName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultAvatar;
                  }}
                  className="w-full h-full object-cover rounded-full"
                />

                {/* Speaking Visual Wave */}
                {isSpeaking && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-4 sm:w-2 sm:h-5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-6 sm:w-2 sm:h-8 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-4 sm:w-2 sm:h-5 bg-cyan-300 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                )}

                {/* Listening Wave */}
                {isListening && !isSpeaking && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-1.5">
                    <span className="w-2 h-5 bg-emerald-400 rounded-full animate-ping" />
                    <span className="w-2 h-7 bg-teal-400 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-1.5 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSpeaking
                    ? "bg-cyan-400 animate-ping"
                    : isListening
                    ? "bg-emerald-400 animate-ping"
                    : isProcessing
                    ? "bg-amber-400 animate-spin"
                    : "bg-emerald-400"
                }`}
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-200">
                {isSpeaking
                  ? "Speaking..."
                  : isListening
                  ? "Listening..."
                  : isProcessing
                  ? "Thinking & Explaining..."
                  : "Ready to assist you"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Top Message / Search / Ask Me Section - Above the Chat */}
        <div className="w-full flex-shrink-0 pt-2.5 pb-2.5">
          <form onSubmit={handleFormSubmit} className="relative group">
            <div className="relative flex items-center bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700 group-focus-within:border-cyan-400 rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3.5 shadow-2xl transition-all">
              {/* Search Icon */}
              <div className="mr-3 text-cyan-400 text-lg sm:text-xl flex-shrink-0">
                <HiMagnifyingGlass />
              </div>

              {/* Text Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening... Ask any question or search topic..."
                    : "Ask anything, search topics, explain concepts, open apps, or click mic..."
                }
                disabled={isProcessing}
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none pr-3 disabled:opacity-50"
              />

              {/* Clear Text Button */}
              {searchQuery && !isProcessing && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <HiXMark className="text-lg" />
                </button>
              )}

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={handleToggleListening}
                disabled={isProcessing}
                title={isListening ? "Stop listening" : "Speak to assistant"}
                className={`p-2.5 sm:px-4 sm:py-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer mr-2 flex-shrink-0 ${
                  isListening
                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400 hover:text-cyan-300"
                }`}
              >
                <HiMicrophone className={`text-lg sm:text-xl ${isListening ? "animate-bounce" : ""}`} />
                {isListening && (
                  <span className="hidden sm:inline text-xs font-bold text-emerald-300">Listening</span>
                )}
              </button>

              {/* Submit / Ask Button */}
              <button
                type="submit"
                disabled={isProcessing || !searchQuery.trim()}
                className="p-2.5 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-base border border-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 shadow-md"
              >
                {isProcessing ? (
                  <HiArrowPath className="text-lg animate-spin" />
                ) : (
                  <>
                    <HiPaperAirplane className="text-base" />
                    <span className="hidden sm:inline">Ask</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full flex-shrink-0 my-1.5 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-400 hover:text-white p-0.5">
              <HiXMark className="text-lg" />
            </button>
          </div>
        )}

        {/* 3. Conversation Feed / Chat History - Placed Below Search Box */}
        <div 
          ref={chatContainerRef}
          className="w-full flex-1 min-h-0 overflow-y-auto space-y-4 px-3 sm:px-5 py-3 my-1 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-slate-800/60 shadow-inner scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 mb-2.5">
                <HiSparkles className="text-2xl sm:text-3xl animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                How can {assistantName} help you today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-4">
                Ask any question, search topics, explain concepts, or open apps with full detailed explanations right here.
              </p>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteQuery(chip)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-blue-600/20 border border-slate-700/80 hover:border-blue-500/50 text-xs sm:text-sm text-slate-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((item, index) => (
                <div key={index} className="space-y-2.5 animate-fadeIn">
                  {/* User Question Bubble (Right Aligned) */}
                  {item.prompt && (
                    <div className="flex justify-end items-end gap-2 sm:gap-2.5">
                      <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-medium shadow-md">
                        <p className="leading-relaxed">{item.prompt}</p>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-700/40 border border-blue-400/40 flex items-center justify-center text-blue-300 text-xs sm:text-sm flex-shrink-0 mb-0.5">
                        <HiUser />
                      </div>
                    </div>
                  )}

                  {/* Assistant Full Explanation Card (Left Aligned) */}
                  {item.response && (
                    <div className="flex justify-start items-start gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-cyan-500/40 flex-shrink-0 mt-0.5 shadow-sm">
                        <img
                          src={assistantImage || defaultAvatar}
                          alt={assistantName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="max-w-[94%] sm:max-w-[90%] p-4 sm:p-5 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-700/90 shadow-xl text-slate-100">
                        {/* Header: Name + Action Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-cyan-300">{assistantName}</span>
                            {item.type && item.type !== "general" && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-[10px] sm:text-xs font-semibold text-blue-300 tracking-wide uppercase">
                                {item.type.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>

                          {/* Quick Action: Re-speak & Copy */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => speakResponse(item.response)}
                              className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                              title="Listen to explanation"
                            >
                              <HiSpeakerWave className="text-sm sm:text-base" />
                            </button>
                            <button
                              onClick={() => handleCopy(item.response, index)}
                              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Copy answer"
                            >
                              {copiedIndex === index ? (
                                <HiCheck className="text-sm sm:text-base text-emerald-400" />
                              ) : (
                                <HiClipboardDocument className="text-sm sm:text-base" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Full Formatted Explanation */}
                        {renderFormattedResponse(item.response)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Active Thinking / Processing Indicator */}
              {isProcessing && (
                <div className="flex justify-start items-start gap-2.5 sm:gap-3 animate-pulse">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-purple-500/40 flex-shrink-0 mt-0.5">
                    <img
                      src={assistantImage || defaultAvatar}
                      alt={assistantName}
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                    <span className="text-xs sm:text-sm text-slate-300 ml-1 font-medium">{assistantName} is preparing full explanation...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Minimal Clean Footer */}
      <footer className="w-full flex-shrink-0 text-center py-2 text-xs text-slate-500 border-t border-slate-900/80">
        AI Virtual Assistant • Powered by Gemini & Voice
      </footer>
    </div>
  );
}

export default Home;