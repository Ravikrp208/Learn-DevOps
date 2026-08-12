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
import defaultAvatar from "../assets/image1.png";

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
  const chatBottomRef = useRef(null);

  // Sync history with userData context
  useEffect(() => {
    if (userData?.history && Array.isArray(userData.history)) {
      setChatHistory(userData.history);
    }
  }, [userData]);

  // Auto-scroll chat history to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // Text-To-Speech
  const speakResponse = (text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
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

  // Open action target URL
  const triggerActionUrl = (type, userInput) => {
    let targetUrl = null;
    const cleanQ = encodeURIComponent((userInput || "").trim());

    switch (type) {
      case "youtube_play":
      case "youtube_search":
      case "YOUTUBE_PLAY":
        targetUrl = `https://www.youtube.com/results?search_query=${cleanQ}`;
        break;
      case "google_search":
      case "GOOGLE_SEARCH":
        targetUrl = `https://www.google.com/search?q=${cleanQ}`;
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
      case "weather_show":
        targetUrl = `https://www.google.com/search?q=weather+${cleanQ || "today"}`;
        break;
      default:
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
      const responseText = data.response || "Task completed.";
      const actionType = data.type || "general";
      const userInput = data.userInput || promptToSend;

      // Automatically open target url
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

  const suggestionChips = [
    "What is the date today?",
    "Play trending songs on YouTube",
    "Open WhatsApp",
    "What's the weather today?",
    "Who are you?",
  ];

  return (
    <div className="w-full h-screen max-h-screen bg-[#030324] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-15%] left-[25%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[25%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Navbar - Fixed at top, Full Width, Logout on Far Right */}
      <header className="w-full flex-shrink-0 flex items-center justify-between py-3 px-4 sm:px-8 lg:px-12 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 shadow-md z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300">
            <HiCpuChip className="text-lg sm:text-xl" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">{assistantName}</h2>
            <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Right Side: Clear Chat & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {chatHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Clear chat history"
            >
              <HiTrash className="text-sm text-slate-400" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <button
            onClick={handleLogOut}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 hover:text-red-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Logout"
          >
            <HiArrowRightOnRectangle className="text-base" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content: Avatar at top, Chat in middle, Message box at bottom */}
      <main className="w-full max-w-3xl mx-auto px-4 flex-1 flex flex-col justify-between py-2 sm:py-3 z-10 min-h-0 overflow-hidden">
        
        {/* Top Assistant Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center py-1 sm:py-2">
          <div className="relative group flex flex-col items-center">
            <div
              className={`absolute -inset-2.5 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
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
              className={`relative rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all ${
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
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-1">
                    <span className="w-1 h-4 sm:w-1.5 sm:h-5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-6 sm:w-1.5 sm:h-8 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-4 sm:w-1.5 sm:h-5 bg-cyan-300 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                )}

                {/* Listening Wave */}
                {isListening && !isSpeaking && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-1">
                    <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-ping" />
                    <span className="w-1.5 h-7 bg-teal-400 rounded-full animate-bounce" />
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking
                    ? "bg-cyan-400 animate-ping"
                    : isListening
                    ? "bg-emerald-400 animate-ping"
                    : isProcessing
                    ? "bg-amber-400 animate-spin"
                    : "bg-emerald-400"
                }`}
              />
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200">
                {isSpeaking
                  ? "Speaking..."
                  : isListening
                  ? "Listening..."
                  : isProcessing
                  ? "Thinking..."
                  : "Ready to assist you"}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Conversation Feed / Chat History */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto space-y-3 px-2 sm:px-4 py-2 my-1.5 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-slate-800/60 shadow-inner scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {chatHistory.length === 0 ? (
            <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 mb-2">
                <HiSparkles className="text-xl sm:text-2xl animate-pulse" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                How can {assistantName} help you today?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mb-3">
                Ask questions, search the web, play music, or open apps by typing or using your voice.
              </p>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-w-lg">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteQuery(chip)}
                    disabled={isProcessing}
                    className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-blue-600/20 border border-slate-700/80 hover:border-blue-500/50 text-[11px] sm:text-xs text-slate-300 hover:text-cyan-200 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((item, index) => (
                <div key={index} className="space-y-2 animate-fadeIn">
                  {/* User Question Bubble (Right Aligned) */}
                  {item.prompt && (
                    <div className="flex justify-end items-end gap-1.5 sm:gap-2">
                      <div className="max-w-[85%] sm:max-w-[75%] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-medium shadow-md">
                        <p className="leading-relaxed">{item.prompt}</p>
                      </div>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-700/40 border border-blue-400/40 flex items-center justify-center text-blue-300 text-[10px] sm:text-xs flex-shrink-0 mb-0.5">
                        <HiUser />
                      </div>
                    </div>
                  )}

                  {/* Assistant Answer Card (Left Aligned) */}
                  {item.response && (
                    <div className="flex justify-start items-start gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-cyan-500/40 flex-shrink-0 mt-0.5 shadow-sm">
                        <img
                          src={assistantImage || defaultAvatar}
                          alt={assistantName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="max-w-[90%] sm:max-w-[85%] p-3 sm:p-3.5 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-700/90 shadow-xl text-slate-100">
                        {/* Header: Name + Action Badge */}
                        <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] sm:text-xs font-bold text-cyan-300">{assistantName}</span>
                            {item.type && item.type !== "general" && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-[9px] sm:text-[10px] font-semibold text-blue-300 tracking-wide uppercase">
                                {item.type.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>

                          {/* Quick Action: Re-speak & Copy */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => speakResponse(item.response)}
                              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                              title="Listen again"
                            >
                              <HiSpeakerWave className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleCopy(item.response, index)}
                              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Copy answer"
                            >
                              {copiedIndex === index ? (
                                <HiCheck className="text-xs text-emerald-400" />
                              ) : (
                                <HiClipboardDocument className="text-xs" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Answer Text */}
                        <p className="text-xs sm:text-sm text-cyan-50 font-normal leading-relaxed whitespace-pre-wrap select-text">
                          {item.response}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Active Thinking / Processing Indicator */}
              {isProcessing && (
                <div className="flex justify-start items-start gap-2 sm:gap-2.5 animate-pulse">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-purple-500/40 flex-shrink-0 mt-0.5">
                    <img
                      src={assistantImage || defaultAvatar}
                      alt={assistantName}
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-700/80 shadow-md flex items-center gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                    <span className="text-[11px] sm:text-xs text-slate-400 ml-1 font-medium">{assistantName} is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full flex-shrink-0 my-1 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-400 hover:text-white p-0.5">
              <HiXMark className="text-base" />
            </button>
          </div>
        )}

        {/* Bottom Message / Search Input Div - Strictly Anchored at Bottom */}
        <div className="w-full flex-shrink-0 pt-1 pb-1">
          <form onSubmit={handleFormSubmit} className="relative group">
            <div className="relative flex items-center bg-slate-900/95 backdrop-blur-xl border-2 border-slate-700 group-focus-within:border-cyan-400 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl transition-all">
              {/* Search Icon */}
              <div className="mr-2 text-cyan-400 text-base sm:text-lg flex-shrink-0">
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
                    ? "Listening... Ask me anything..."
                    : "Ask AI, search web, open YouTube, or click mic..."
                }
                disabled={isProcessing}
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none pr-2 disabled:opacity-50"
              />

              {/* Clear Text Button */}
              {searchQuery && !isProcessing && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 mr-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <HiXMark className="text-base" />
                </button>
              )}

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={handleToggleListening}
                disabled={isProcessing}
                title={isListening ? "Stop listening" : "Speak to assistant"}
                className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer mr-1.5 flex-shrink-0 ${
                  isListening
                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400 hover:text-cyan-300"
                }`}
              >
                <HiMicrophone className={`text-base sm:text-lg ${isListening ? "animate-bounce" : ""}`} />
                {isListening && (
                  <span className="hidden sm:inline text-[11px] font-bold text-emerald-300">Listening</span>
                )}
              </button>

              {/* Submit / Ask Button */}
              <button
                type="submit"
                disabled={isProcessing || !searchQuery.trim()}
                className="p-2 sm:px-4 sm:py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm border border-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1 flex-shrink-0"
              >
                {isProcessing ? (
                  <HiArrowPath className="text-base animate-spin" />
                ) : (
                  <>
                    <HiPaperAirplane className="text-sm" />
                    <span className="hidden sm:inline">Ask</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Minimal Clean Footer */}
      <footer className="w-full flex-shrink-0 text-center py-2 text-[11px] text-slate-500 border-t border-slate-900/80">
        AI Virtual Assistant • Powered by Gemini & Voice
      </footer>
    </div>
  );
}

export default Home;