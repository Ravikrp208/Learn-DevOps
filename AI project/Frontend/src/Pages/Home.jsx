import React, { useContext, useState, useEffect, useRef } from "react";
import { userDataContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiMicrophone,
  HiPaperAirplane,
  HiMagnifyingGlass,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiArrowRightOnRectangle,
  HiPaintBrush,
  HiXMark,
  HiArrowPath,
  HiCpuChip,
  HiUser
} from "react-icons/hi2";

function Home() {
  const { userData, setUserData, serverurl } = useContext(userDataContext) || {};
  const navigate = useNavigate();

  // Assistant Info
  const assistantName = userData?.assistantName || "Shifra";
  const assistantImage = userData?.assistantImage || null;

  // UI & Interaction States
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [aiResponseText, setAiResponseText] = useState("");

  // References
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

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
    if (isMuted || !text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Zira")) && (v.lang.startsWith("en") || v.lang.startsWith("hi")));
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
        targetUrl = cleanQ ? `https://open.spotify.com/search/${cleanQ}` : "https://open.spotify.com";
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
    if (!promptToSend) return;

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

      setAiResponseText(responseText);
      speakResponse(responseText);

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

  return (
    <div className="w-full min-h-screen bg-[#030324] text-white flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-15%] left-[25%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[25%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 px-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300">
            <HiCpuChip className="text-xl" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">{assistantName}</h2>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute/Voice Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setIsMuted(!isMuted);
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                : "bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white"
            }`}
            title={isMuted ? "Unmute Assistant Voice" : "Mute Assistant Voice"}
          >
            {isMuted ? <HiSpeakerXMark className="text-base" /> : <HiSpeakerWave className="text-base text-cyan-400" />}
            <span className="hidden sm:inline">{isMuted ? "Muted" : "Voice On"}</span>
          </button>

          {/* Avatar Settings */}
          <button
            onClick={() => navigate("/customize")}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            title="Change Avatar"
          >
            <HiPaintBrush className="text-cyan-400 text-base inline mr-1" />
            <span className="hidden sm:inline">Avatar</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogOut}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            title="Logout"
          >
            <HiArrowRightOnRectangle className="text-base inline sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Center Console: Search Box Only */}
      <main className="w-full max-w-2xl flex flex-col items-center justify-center my-auto py-6 z-10">
        
        {/* Glowing Assistant Avatar */}
        <div className="relative group flex flex-col items-center mb-6">
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

          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-slate-900 relative">
              {assistantImage ? (
                <img
                  src={assistantImage}
                  alt={assistantName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <HiUser className="text-5xl text-slate-600" />
              )}

              {/* Speaking Visual Wave */}
              {isSpeaking && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-6 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-10 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-6 bg-cyan-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              )}

              {/* Listening Wave */}
              {isListening && !isSpeaking && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center gap-1.5">
                  <span className="w-2 h-6 bg-emerald-400 rounded-full animate-ping" />
                  <span className="w-2 h-8 bg-teal-400 rounded-full animate-bounce" />
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md">
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
            <span className="text-xs font-semibold text-slate-200">
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

        {/* Live Spoken AI Reply (Simple Text) */}
        {aiResponseText && (
          <div className="w-full text-center px-4 py-2 mb-4 animate-fadeIn">
            <p className="text-sm sm:text-base text-cyan-200 font-medium leading-relaxed drop-shadow-sm">
              "{aiResponseText}"
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full mb-3 px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-400 hover:text-white p-1">
              <HiXMark className="text-base" />
            </button>
          </div>
        )}

        {/* The Main Search & Voice Box */}
        <div className="w-full px-2">
          <form onSubmit={handleFormSubmit} className="relative group">
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700 group-focus-within:border-cyan-400 rounded-2xl px-4 py-3 sm:py-3.5 shadow-2xl transition-all">
              {/* Search Icon */}
              <div className="mr-3 text-cyan-400 text-xl flex-shrink-0">
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
                    ? "Listening... bolo kya karna hai" 
                    : "Search web, open app, ask AI, or click mic..."
                }
                disabled={isProcessing}
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none pr-2 disabled:opacity-50"
              />

              {/* Clear Text Button */}
              {searchQuery && !isProcessing && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 mr-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
                className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer mr-2 flex-shrink-0 ${
                  isListening
                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400 hover:text-cyan-300"
                }`}
              >
                <HiMicrophone className={`text-lg sm:text-xl ${isListening ? "animate-bounce" : ""}`} />
                {isListening && <span className="hidden sm:inline text-xs font-bold text-emerald-300">Listening</span>}
              </button>

              {/* Submit / Ask Button */}
              <button
                type="submit"
                disabled={isProcessing || !searchQuery.trim()}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm border border-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
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

      </main>

      {/* Minimal Clean Footer */}
      <footer className="w-full max-w-4xl text-center py-2 text-xs text-slate-500 border-t border-slate-900">
        AI Virtual Assistant
      </footer>
    </div>
  );
}

export default Home;