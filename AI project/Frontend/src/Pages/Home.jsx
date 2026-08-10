import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/userContext.jsx";
import { 
  HiSparkles, 
  HiPaintBrush, 
  HiArrowRightOnRectangle, 
  HiMicrophone, 
  HiCpuChip, 
  HiUser, 
  HiEnvelope, 
  HiBolt, 
  HiShieldCheck, 
  HiChatBubbleBottomCenterText,
  HiMagnifyingGlass,
  HiPaperAirplane,
  HiXMark,
  HiSpeakerWave,
  HiSpeakerXMark,
  HiArrowTopRightOnSquare,
  HiClipboardDocument,
  HiClipboardDocumentCheck,
  HiArrowPath
} from "react-icons/hi2";

function Home() {
  const { 
    userData, 
    setUserData, 
    serverurl, 
    selectedImage, 
    frontendImage 
  } = useContext(userDataContext) || {};
  const navigate = useNavigate();

  // Search & Voice States
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(null);

  // References
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const assistantImage = userData?.assistantImage || selectedImage || frontendImage;
  const assistantName = userData?.assistantName || "Shifra";
  const userEmail = userData?.email || "user@example.com";
  const userName = userData?.name || "User";

  // Quick Suggestion Prompts
  const quickSuggestions = [
    { label: "Play YouTube Music", prompt: "Play Arijit Singh songs on YouTube", icon: "🎵" },
    { label: "Search Google", prompt: "Search latest tech news on Google", icon: "🔍" },
    { label: "Open WhatsApp", prompt: "Open WhatsApp", icon: "💬" },
    { label: "Open Instagram", prompt: "Open Instagram", icon: "📸" },
    { label: "Current Time", prompt: "What is the current time?", icon: "⏰" },
    { label: "Today's Date", prompt: "What is today's date?", icon: "📅" },
    { label: "Weather Update", prompt: "Show me today's weather", icon: "🌤️" },
    { label: "Open Calculator", prompt: "Open Calculator", icon: "🧮" },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // Seamlessly supports Indian English and Hindi/Hinglish

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage("");
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
          setSearchQuery(currentText);
        }

        if (finalTranscript && finalTranscript.trim().length > 0) {
          handleExecuteQuery(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access denied. Please allow microphone permissions.");
        } else if (event.error !== "no-speech") {
          setErrorMessage(`Voice error: ${event.error}`);
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

  // Text-To-Speech (Speech Synthesis)
  const speakResponse = (text) => {
    if (isMuted || !text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick optimal available voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Zira")) && v.lang.startsWith("en"));
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
      setErrorMessage("Speech recognition is not supported in your browser. Please use Google Chrome or Edge.");
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
        console.warn("Recognition already started or starting:", err);
      }
    }
  };

  // Perform External Intent Actions
  const executeIntentAction = (type, queryParam) => {
    const safeQuery = encodeURIComponent(queryParam || searchQuery || "");
    let targetUrl = "";

    switch (type) {
      case "google_search":
        targetUrl = `https://www.google.com/search?q=${safeQuery}`;
        break;
      case "youtube_search":
      case "youtube_play":
        targetUrl = `https://www.youtube.com/results?search_query=${safeQuery}`;
        break;
      case "whatsapp_open":
        targetUrl = "https://web.whatsapp.com";
        break;
      case "instagram_open":
        targetUrl = "https://www.instagram.com";
        break;
      case "facebook_open":
        targetUrl = "https://www.facebook.com";
        break;
      case "spotify_open":
        targetUrl = (queryParam && queryParam !== "Spotify") ? `https://open.spotify.com/search/${safeQuery}` : "https://open.spotify.com";
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
        targetUrl = `https://www.google.com/maps/search/${safeQuery}`;
        break;
      case "calculator_open":
        targetUrl = "https://www.google.com/search?q=calculator";
        break;
      case "weather_show":
        targetUrl = `https://www.google.com/search?q=weather+${safeQuery}`;
        break;
      default:
        break;
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Main Query Execution Function
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
      const response = await axios.post(
        `${serverurl || "http://localhost:8000"}/api/user/asktoassistant`,
        { prompt: promptToSend },
        { withCredentials: true }
      );

      const data = response.data;
      const formattedResult = {
        prompt: promptToSend,
        response: data.response || "Task completed.",
        type: data.type || "general",
        userInput: data.userInput || promptToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setLastInteraction(formattedResult);
      speakResponse(formattedResult.response);

      // Trigger automatic web action if applicable
      const actionableTypes = [
        "google_search",
        "youtube_search",
        "youtube_play",
        "whatsapp_open",
        "instagram_open",
        "facebook_open",
        "spotify_open",
        "github_open",
        "chatgpt_open",
        "gmail_open",
        "maps_open",
        "calculator_open",
        "weather_show"
      ];

      if (actionableTypes.includes(data.type)) {
        setTimeout(() => {
          executeIntentAction(data.type, data.userInput || promptToSend);
        }, 1000);
      }

    } catch (err) {
      console.error("Ask to assistant error:", err);
      const errMsg = err?.response?.data?.message || "Failed to process request. Please try again.";
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

  const handleCopyResponse = () => {
    if (lastInteraction?.response) {
      navigator.clipboard.writeText(lastInteraction.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Intent badge styling helper
  const getIntentBadge = (type) => {
    switch (type) {
      case "google_search":
        return { label: "Google Search", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "youtube_search":
      case "youtube_play":
        return { label: "YouTube Action", color: "bg-red-500/20 text-red-300 border-red-500/40" };
      case "whatsapp_open":
        return { label: "WhatsApp", color: "bg-green-500/20 text-green-300 border-green-500/40" };
      case "instagram_open":
        return { label: "Instagram", color: "bg-pink-500/20 text-pink-300 border-pink-500/40" };
      case "facebook_open":
        return { label: "Facebook", color: "bg-blue-600/20 text-blue-300 border-blue-600/40" };
      case "spotify_open":
        return { label: "Spotify Music", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "github_open":
        return { label: "GitHub", color: "bg-slate-500/20 text-slate-300 border-slate-500/40" };
      case "chatgpt_open":
        return { label: "ChatGPT", color: "bg-teal-500/20 text-teal-300 border-teal-500/40" };
      case "gmail_open":
        return { label: "Gmail", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
      case "maps_open":
        return { label: "Google Maps", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "get_time":
      case "get_date":
      case "get_day":
      case "get_month":
        return { label: "Time & Date", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
      case "weather_show":
        return { label: "Weather Update", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
      case "calculator_open":
        return { label: "Calculator", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
      default:
        return { label: "AI Response", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
    }
  };

  // Action button label and color helper
  const getActionButtonInfo = (type) => {
    switch (type) {
      case "google_search":
        return { label: "Open Google Search", style: "bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border-blue-500/40" };
      case "youtube_search":
      case "youtube_play":
        return { label: "Play on YouTube", style: "bg-red-600/25 hover:bg-red-600/40 text-red-300 border-red-500/40" };
      case "whatsapp_open":
        return { label: "Open WhatsApp Web", style: "bg-green-600/25 hover:bg-green-600/40 text-green-300 border-green-500/40" };
      case "instagram_open":
        return { label: "Open Instagram", style: "bg-pink-600/25 hover:bg-pink-600/40 text-pink-300 border-pink-500/40" };
      case "facebook_open":
        return { label: "Open Facebook", style: "bg-blue-700/25 hover:bg-blue-700/40 text-blue-300 border-blue-600/40" };
      case "spotify_open":
        return { label: "Open in Spotify", style: "bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border-emerald-500/40" };
      case "github_open":
        return { label: "Open GitHub", style: "bg-slate-700/40 hover:bg-slate-700/60 text-slate-200 border-slate-500/40" };
      case "chatgpt_open":
        return { label: "Open ChatGPT", style: "bg-teal-600/25 hover:bg-teal-600/40 text-teal-300 border-teal-500/40" };
      case "gmail_open":
        return { label: "Open Gmail", style: "bg-rose-600/25 hover:bg-rose-600/40 text-rose-300 border-rose-500/40" };
      case "maps_open":
        return { label: "Open Maps", style: "bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border-amber-500/40" };
      case "calculator_open":
        return { label: "Open Calculator", style: "bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border-purple-500/40" };
      case "weather_show":
        return { label: "View Weather Details", style: "bg-cyan-600/25 hover:bg-cyan-600/40 text-cyan-300 border-cyan-500/40" };
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#020212] text-white flex flex-col justify-between items-center p-3 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans select-none">
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute top-[35%] left-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Cyberpunk Mesh Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="w-full max-w-6xl flex flex-wrap items-center justify-between py-3.5 px-5 sm:px-7 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-30 gap-3">
        {/* Left Side: Brand Logo & Assistant Name */}
        <div className="flex items-center gap-3.5">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-400/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <HiCpuChip className="text-2xl animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-wide">{assistantName}</h2>
              <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Virtual AI Assistant</p>
          </div>
        </div>

        {/* Right Side: Customize, Email, Voice Mute Toggle, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mute/Voice Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setIsMuted(!isMuted);
            }}
            title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
            className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isMuted 
                ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30" 
                : "bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80"
            }`}
          >
            {isMuted ? <HiSpeakerXMark className="text-base" /> : <HiSpeakerWave className="text-base" />}
          </button>

          <button
            onClick={() => navigate("/customize")}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
          >
            <HiPaintBrush className="text-blue-400 text-base" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-300 text-xs sm:text-sm font-medium backdrop-blur-md shadow-inner">
            <HiEnvelope className="text-blue-400 text-base flex-shrink-0" />
            <span className="max-w-[130px] sm:max-w-[210px] truncate">{userEmail}</span>
          </div>

          <button
            onClick={handleLogOut}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.25)]"
          >
            <HiArrowRightOnRectangle className="text-base" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Hero Main Content */}
      <main className="w-full max-w-4xl flex flex-col items-center justify-center my-auto py-6 sm:py-10 z-20">
        
        {/* Assistant Header Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-5 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <HiSparkles className="text-blue-400 text-base animate-spin" style={{ animationDuration: "6s" }} />
          <span>AI Voice & Search System Online</span>
        </div>

        {/* Hero Greeting Text */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-center tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
          Hello {userName}, I am{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            {assistantName}
          </span>
        </h1>

        {/* Interactive Avatar Card Showcase Container */}
        <div className="relative group my-2">
          {/* Dynamic Aura Glow based on State */}
          <div className={`absolute -inset-2 rounded-3xl blur-2xl transition duration-700 ${
            isListening 
              ? "bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 opacity-90 animate-pulse" 
              : isSpeaking 
              ? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-90 animate-pulse" 
              : isProcessing 
              ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-400 opacity-90 animate-spin" 
              : "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 opacity-50 group-hover:opacity-85"
          }`} style={isProcessing ? { animationDuration: "3s" } : {}} />

          {/* Hologram Reticle Corner Accents */}
          <div className="absolute -top-3 -left-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>
          <div className="absolute -top-3 -right-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>
          <div className="absolute -bottom-3 -left-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>
          <div className="absolute -bottom-3 -right-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>

          {/* Avatar Frame */}
          <div className="relative w-[240px] h-[310px] sm:w-[280px] sm:h-[360px] bg-[#020220] border-2 border-cyan-400/40 group-hover:border-cyan-300/80 rounded-2xl overflow-hidden flex justify-center items-center shadow-[0_0_60px_rgba(6,182,212,0.35)] transition-all duration-500 group-hover:scale-[1.02]">
            {/* Live Hologram Tag */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 uppercase tracking-widest z-20 flex items-center gap-1.5 shadow-md">
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? "bg-emerald-400 animate-ping" : isSpeaking ? "bg-pink-400 animate-ping" : "bg-cyan-400 animate-ping"}`} />
              {isListening ? "Listening" : isSpeaking ? "Speaking" : isProcessing ? "Thinking" : "Online"}
            </div>

            {assistantImage ? (
              <img 
                src={assistantImage} 
                alt={assistantName} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <HiUser className="text-7xl text-blue-400 mb-3 animate-bounce" />
                <p className="text-sm font-semibold text-white">No Avatar Selected</p>
                <button
                  onClick={() => navigate("/customize")}
                  className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-full transition-all shadow-lg cursor-pointer"
                >
                  Choose Avatar
                </button>
              </div>
            )}

            {/* Speaking / Listening Overlay Equalizer on Avatar */}
            {(isListening || isSpeaking) && (
              <div className="absolute bottom-3 inset-x-3 py-1.5 px-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 flex items-center justify-center gap-1.5 z-20 shadow-lg">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4" />
                <span className="w-1 bg-blue-400 rounded-full animate-bounce h-6" style={{ animationDelay: "150ms" }} />
                <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3" style={{ animationDelay: "300ms" }} />
                <span className="w-1 bg-pink-400 rounded-full animate-bounce h-5" style={{ animationDelay: "450ms" }} />
                <span className="text-[11px] font-semibold text-cyan-300 ml-2">
                  {isListening ? "Voice Input Active..." : "Speaking Voice..."}
                </span>
              </div>
            )}

            {/* Bottom Gradient overlay on image */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#020220] to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Error Alert Display if any */}
        {errorMessage && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-lg max-w-lg text-center animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping flex-shrink-0" />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="ml-auto text-rose-400 hover:text-rose-200">
              <HiXMark className="text-base" />
            </button>
          </div>
        )}

        {/* Futuristic Search Box & Voice Input Bar */}
        <section className="w-full max-w-2xl mt-7 px-2">
          <form onSubmit={handleFormSubmit} className="relative group">
            {/* Glowing Border Background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-focus-within:opacity-100 group-hover:opacity-75 transition duration-500" />

            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-2xl border-2 border-slate-700/80 group-focus-within:border-cyan-400/90 rounded-2xl px-4 py-3 sm:py-3.5 shadow-2xl transition-all duration-300">
              {/* Left Search Icon */}
              <div className="mr-3 text-cyan-400 text-xl flex-shrink-0">
                <HiMagnifyingGlass />
              </div>

              {/* Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isListening 
                    ? "Listening... speak your question or command" 
                    : "Search web, ask AI, play music, or click mic..."
                }
                disabled={isProcessing}
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none pr-2 disabled:opacity-50"
              />

              {/* Clear Button */}
              {searchQuery && !isProcessing && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 mr-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <HiXMark className="text-lg" />
                </button>
              )}

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={handleToggleListening}
                disabled={isProcessing}
                title={isListening ? "Stop listening" : "Click to speak"}
                className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl border flex items-center gap-1.5 transition-all duration-300 cursor-pointer mr-2 flex-shrink-0 ${
                  isListening
                    ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse"
                    : "bg-slate-800/90 hover:bg-slate-700 border-slate-600/80 text-blue-400 hover:text-cyan-300 shadow-md"
                }`}
              >
                <HiMicrophone className={`text-lg sm:text-xl ${isListening ? "animate-bounce" : ""}`} />
                {isListening && (
                  <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Listening
                  </span>
                )}
              </button>

              {/* Send / Search Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !searchQuery.trim()}
                title="Send query"
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                {isProcessing ? (
                  <HiArrowPath className="text-lg animate-spin" />
                ) : (
                  <>
                    <HiPaperAirplane className="text-lg" />
                    <span className="hidden sm:inline text-xs font-bold">Ask AI</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 mr-1">
              <HiBolt className="text-cyan-400" /> Quick actions:
            </span>
            {quickSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(item.prompt);
                  handleExecuteQuery(item.prompt);
                }}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-400/60 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* AI Live Response Display Box */}
        {lastInteraction && (
          <section className="w-full max-w-2xl mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.6)] animate-fadeIn relative">
            {/* Header: User Query & Intent Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <span className="font-bold text-cyan-400">You:</span>
                <span className="italic font-medium text-slate-200">"{lastInteraction.prompt}"</span>
              </div>

              <div className="flex items-center gap-2">
                {(() => {
                  const badge = getIntentBadge(lastInteraction.type);
                  return (
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  );
                })()}
                <span className="text-[10px] text-slate-500 font-mono">{lastInteraction.timestamp}</span>
              </div>
            </div>

            {/* Body: Assistant Spoken Reply */}
            <div className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal my-2">
              <span className="font-bold text-indigo-400 mr-2">{assistantName}:</span>
              <span>{lastInteraction.response}</span>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                {/* Voice Replay Button */}
                <button
                  onClick={() => speakResponse(lastInteraction.response)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                  title="Replay speech"
                >
                  <HiSpeakerWave className="text-cyan-400" />
                  <span>{isSpeaking ? "Speaking..." : "Replay Voice"}</span>
                </button>

                {/* Copy Text Button */}
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                  title="Copy reply text"
                >
                  {copied ? (
                    <>
                      <HiClipboardDocumentCheck className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <HiClipboardDocument className="text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Open Link for external actions */}
              {(() => {
                const actionInfo = getActionButtonInfo(lastInteraction.type);
                if (!actionInfo) return null;
                return (
                  <button
                    onClick={() => executeIntentAction(lastInteraction.type, lastInteraction.userInput)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md cursor-pointer ml-auto ${actionInfo.style}`}
                  >
                    <span>{actionInfo.label}</span>
                    <HiArrowTopRightOnSquare className="text-sm" />
                  </button>
                );
              })()}
            </div>
          </section>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-8 z-10">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 shadow-lg hover:border-blue-500/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HiBolt className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Search</h4>
              <p className="text-[11px] text-slate-400">Instant AI & Web Search Engine</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 shadow-lg hover:border-purple-500/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HiMicrophone className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Voice Control</h4>
              <p className="text-[11px] text-slate-400">Interactive Speech & Listen</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 shadow-lg hover:border-emerald-500/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HiChatBubbleBottomCenterText className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smart Actions</h4>
              <p className="text-[11px] text-slate-400">Google, YouTube & App Intents</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center py-3 text-xs text-slate-500 border-t border-slate-900/80 z-10">
        Virtual Assistant AI • Voice Control & Intelligent Search Engine
      </footer>
    </div>
  );
}

export default Home;