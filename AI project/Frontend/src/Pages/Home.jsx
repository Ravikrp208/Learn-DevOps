import React, { useContext, useState, useEffect, useRef } from "react";
import { userDataContext } from "../context/userContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiMicrophone,
  HiPaperAirplane,
  HiArrowRightOnRectangle,
  HiXMark,
  HiArrowPath,
  HiCpuChip,
  HiUser,
  HiTrash,
  HiClipboardDocument,
  HiCheck,
  HiSpeakerWave,
  HiSparkles,
  HiPlus,
  HiBars3,
  HiChatBubbleLeftRight,
  HiCodeBracket,
  HiAdjustmentsHorizontal
} from "react-icons/hi2";
import defaultAvatar from "../assets/image2.png";

function Home() {
  const { userData, setUserData, serverurl } = useContext(userDataContext) || {};
  const navigate = useNavigate();

  // Assistant & User Info
  const assistantName = userData?.assistantName || "Shifra";
  const assistantImage = userData?.assistantImage || defaultAvatar;
  const userName = userData?.name || "Ravi";

  // UI & Interaction States
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [chatHistory, setChatHistory] = useState(userData?.history || []);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Auto-scroll chat history container to latest message smoothly
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

  // Helper: Select the highest-quality realistic natural female (girl) voice available on the device
  const getBestFemaleVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const allVoices = window.speechSynthesis.getVoices();
    if (!allVoices || allVoices.length === 0) return null;

    // Prioritized list of realistic, sweet, human-like female voices (Edge/Windows, Chrome, Mac)
    const priorityFemalePatterns = [
      "Microsoft Jenny Online (Natural)",
      "Microsoft Aria Online (Natural)",
      "Microsoft Neerja Online (Natural)",
      "Microsoft Swara Online (Natural)",
      "Microsoft Ava Online (Natural)",
      "Microsoft Emma Online (Natural)",
      "Microsoft Jenny",
      "Microsoft Aria",
      "Microsoft Neerja",
      "Google UK English Female",
      "Google US English",
      "Samantha",
      "Karen",
      "Victoria",
      "Microsoft Zira",
      "Microsoft Heera",
      "Microsoft Kalpana",
      "Microsoft Susan",
      "Microsoft Hazel",
      "Google हिन्दी"
    ];

    for (const pattern of priorityFemalePatterns) {
      const match = allVoices.find((v) => v.name.toLowerCase().includes(pattern.toLowerCase()));
      if (match) return match;
    }

    // Secondary search: Any voice with female identifiers
    const femaleMatch = allVoices.find((v) => {
      const vName = v.name.toLowerCase();
      return (
        (vName.includes("female") ||
          vName.includes("girl") ||
          vName.includes("woman") ||
          vName.includes("natural") ||
          vName.includes("zira") ||
          vName.includes("samantha") ||
          vName.includes("aria") ||
          vName.includes("jenny") ||
          vName.includes("neerja") ||
          vName.includes("swara")) &&
        (v.lang.startsWith("en") || v.lang.startsWith("hi"))
      );
    });
    if (femaleMatch) return femaleMatch;

    // Fallback: any English or Hindi voice
    const fallback = allVoices.find((v) => v.lang.startsWith("en") || v.lang.startsWith("hi"));
    return fallback || allVoices[0];
  };

  // Text-To-Speech: Speaks with a natural, realistic female (girl) voice
  const speakResponse = (text) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Clean formatting characters and code blocks for smooth natural speech
    const cleanText = text
      .replace(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/g, " Here is the code snippet. ")
      .replace(/[`#*_~>-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    // Split into sentences so browser speech synthesis never times out on long paragraphs
    const sentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
    const validSentences = sentences.map((s) => s.trim()).filter((s) => s.length > 0);

    if (validSentences.length === 0) return;

    const femaleVoice = getBestFemaleVoice();
    let currentSentenceIdx = 0;
    setIsSpeaking(true);

    const speakNextSentence = () => {
      if (currentSentenceIdx >= validSentences.length) {
        setIsSpeaking(false);
        return;
      }

      const sentenceText = validSentences[currentSentenceIdx++];
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      
      // Sweet, clear, natural female pitch & pleasant speech rate
      utterance.pitch = 1.12;
      utterance.rate = 1.0;
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onend = () => {
        speakNextSentence();
      };

      utterance.onerror = (e) => {
        console.warn("Speech chunk error:", e);
        speakNextSentence();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
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

  // Copy full response text
  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Copy code block snippet
  const handleCopyCode = (codeText, codeId) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId(null), 2000);
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

  // Helper for formatting inline markdown (bold & inline code)
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

  // Rich ChatGPT-style Markdown & Code Block Renderer
  const renderFormattedResponse = (text, itemIndex) => {
    if (!text) return null;

    // Split text by fenced code blocks: ```language ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const elements = [];
    let lastIndex = 0;
    let match;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Text before the code block
      if (matchIndex > lastIndex) {
        const textChunk = text.substring(lastIndex, matchIndex);
        elements.push(
          <div key={`text-${lastIndex}`} className="space-y-2 text-sm sm:text-base text-slate-200 leading-relaxed">
            {renderTextLines(textChunk)}
          </div>
        );
      }

      // Code block itself (ChatGPT-style code card)
      const lang = match[1] || "code";
      const codeContent = match[2];
      const codeId = `${itemIndex}-${blockCount++}`;

      elements.push(
        <div key={`code-${matchIndex}`} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-xl">
          {/* Code Header with language and Copy Button */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-slate-800/80 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5 font-mono">
              <HiCodeBracket className="text-cyan-400 text-sm" />
              <span>{lang || "code"}</span>
            </div>
            <button
              onClick={() => handleCopyCode(codeContent, codeId)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              title="Copy code"
            >
              {copiedCodeId === codeId ? (
                <>
                  <HiCheck className="text-emerald-400 text-sm" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <HiClipboardDocument className="text-sm" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content */}
          <pre className="p-4 text-xs sm:text-sm font-mono text-cyan-200 overflow-x-auto leading-relaxed bg-[#0b0e14]">
            <code>{codeContent}</code>
          </pre>
        </div>
      );

      lastIndex = matchIndex + match[0].length;
    }

    // Remaining text after last code block
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      elements.push(
        <div key={`text-${lastIndex}`} className="space-y-2 text-sm sm:text-base text-slate-200 leading-relaxed">
          {renderTextLines(remainingText)}
        </div>
      );
    }

    return <div className="space-y-2">{elements}</div>;
  };

  // Helper to render lines of text (headings, bullet points, numbered lists)
  const renderTextLines = (chunk) => {
    const lines = chunk.split("\n");
    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lIdx} className="h-1" />;
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
          <h3 key={lIdx} className="text-base sm:text-lg font-bold text-cyan-200 pt-2 pb-1 border-b border-slate-800/80">
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
    });
  };

  const suggestionChips = [
    "Explain Java with key features",
    "What is Docker and Kubernetes?",
    "Play trending songs on YouTube",
    "What is the date today?",
    "Who created you?",
  ];

  return (
    <div className="w-full h-screen h-[100dvh] bg-[#090b10] text-slate-100 flex overflow-hidden font-sans relative selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-15%] right-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Mobile Backdrop Overlay (Closes sidebar when tapped outside) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 sm:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* 1. LEFT SIDEBAR (ChatGPT Style: Responsive drawer on mobile, persistent on desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 sm:static sm:z-auto transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-[85vw] max-w-[320px] sm:w-80 lg:w-84 translate-x-0" : "-translate-x-full sm:translate-x-0 sm:w-0 sm:hidden"
        } bg-[#06080c] border-r border-slate-800/80 flex flex-col justify-between h-full shadow-2xl flex-shrink-0`}
      >
        {/* Sidebar Header: Logo, New Chat & Customize */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/70 flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
                <HiCpuChip className="text-xl" />
              </div>
              <span className="font-bold text-base sm:text-lg tracking-wide text-white">{assistantName} AI</span>
            </div>
            
            {/* Mobile Sidebar Close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
              aria-label="Close sidebar"
            >
              <HiXMark className="text-xl" />
            </button>
          </div>

          {/* New Chat Button (Prominent & Spacious) */}
          <button
            onClick={() => {
              setSearchQuery("");
              setSidebarOpen(false);
              if (inputRef.current) inputRef.current.focus();
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white text-sm font-bold transition-all cursor-pointer shadow-md hover:shadow-cyan-500/10 active:scale-98 group"
          >
            <div className="flex items-center gap-2.5">
              <HiPlus className="text-base sm:text-lg text-cyan-400 group-hover:rotate-90 transition-transform duration-200" />
              <span>New chat</span>
            </div>
            <span className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700/60">⌘K</span>
          </button>

          {/* Customize Assistant Link */}
          <button
            onClick={() => {
              setSidebarOpen(false);
              navigate("/customize");
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-cyan-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer active:scale-98"
          >
            <HiAdjustmentsHorizontal className="text-base text-slate-400" />
            <span>Customize Assistant</span>
          </button>
        </div>

        {/* Sidebar Middle: Recents / Chat History List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Recents</span>
            {chatHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Clear all history"
              >
                <HiTrash className="text-sm" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {chatHistory.length === 0 ? (
            <div className="p-6 text-center text-xs sm:text-sm text-slate-400 flex flex-col items-center justify-center gap-2">
              <HiChatBubbleLeftRight className="text-2xl text-slate-500" />
              <span>No recent chats yet</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {[...chatHistory].reverse().map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSidebarOpen(false);
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/80 transition-all flex items-center gap-2.5 group cursor-pointer truncate shadow-sm active:scale-98"
                  title={item.prompt}
                >
                  <HiChatBubbleLeftRight className="text-sm text-slate-400 group-hover:text-cyan-400 flex-shrink-0" />
                  <span className="truncate flex-1">{item.prompt || "Conversation"}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Bottom: User Profile Card & Logout Button */}
        <div className="p-3 sm:p-3.5 border-t border-slate-800/80 bg-[#040609]/95">
          <div className="flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0 shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-white truncate">{userName}</p>
                <p className="text-[11px] sm:text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Free Plan
                </p>
              </div>
            </div>

            {/* Logout Button in Sidebar */}
            <button
              onClick={handleLogOut}
              className="p-2 sm:p-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer flex-shrink-0 shadow-sm active:scale-95"
              title="Logout"
            >
              <HiArrowRightOnRectangle className="text-base sm:text-lg" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Right Side: Center Voice Avatar + Chat Feed + Bottom Floating Input) */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-[#0a0d14]">
        
        {/* Top Floating Navbar (Mobile Toggle + Assistant Status) */}
        <header className="w-full flex-shrink-0 flex items-center justify-between py-2.5 px-4 sm:px-6 bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/60 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <HiBars3 className="text-lg" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">{assistantName}</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] sm:text-xs font-medium text-cyan-300">
                Voice & AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleListening}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isListening
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                  : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-cyan-300"
              }`}
            >
              <HiMicrophone className={`text-sm ${isListening ? "animate-bounce" : ""}`} />
              <span>{isListening ? "Listening..." : "Voice Mode"}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area (Center Voice Avatar & Full ChatGPT Feed) */}
        <main
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 lg:px-10 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {/* CENTER INTERACTIVE VOICE AVATAR (Matching Screenshot 2!) */}
          <div className="w-full flex flex-col items-center justify-center py-2 flex-shrink-0">
            <div
              onClick={handleToggleListening}
              className="relative group cursor-pointer flex flex-col items-center"
              title="Click avatar to talk or give voice command"
            >
              {/* Outer Ambient Glow Wave */}
              <div
                className={`absolute -inset-3 rounded-full blur-xl transition-all duration-500 pointer-events-none ${
                  isSpeaking
                    ? "bg-gradient-to-r from-cyan-400 to-blue-600 opacity-90 scale-110 animate-pulse"
                    : isListening
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 opacity-90 scale-110 animate-pulse"
                    : isProcessing
                    ? "bg-gradient-to-r from-purple-400 to-pink-500 opacity-80 scale-105 animate-pulse"
                    : "bg-blue-600/30 opacity-40 group-hover:opacity-75 group-hover:scale-105"
                }`}
              />

              {/* Glowing Avatar Frame */}
              <div
                className={`relative rounded-full p-1.5 bg-gradient-to-tr transition-all duration-300 ${
                  isListening
                    ? "from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105"
                    : isSpeaking
                    ? "from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                    : "from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                } ${chatHistory.length > 0 ? "w-20 h-20 sm:w-24 sm:h-24" : "w-28 h-28 sm:w-36 sm:h-36"}`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-slate-900 relative">
                  <img
                    src={assistantImage || defaultAvatar}
                    alt={assistantName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultAvatar;
                    }}
                    className={`w-full h-full object-cover rounded-full transition-transform duration-300 ${
                      isListening ? "scale-105 blur-[0.5px]" : "group-hover:scale-105"
                    }`}
                  />

                  {/* Listening Visual Waves Overlay (Two animated bars matching Screenshot 2) */}
                  {isListening && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center gap-2">
                      <span className="w-2.5 h-7 sm:w-3 sm:h-9 bg-emerald-400 rounded-full animate-bounce [animation-delay:0ms] shadow-md" />
                      <span className="w-2.5 h-10 sm:w-3 sm:h-12 bg-teal-300 rounded-full animate-bounce [animation-delay:150ms] shadow-md" />
                    </div>
                  )}

                  {/* Speaking Sound Waves */}
                  {isSpeaking && !isListening && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-4 sm:w-2 sm:h-6 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-8 sm:w-2 sm:h-10 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-5 sm:w-2 sm:h-7 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge below Avatar (Screenshot 2 style) */}
              <div
                className={`mt-2.5 flex items-center gap-2 px-3.5 py-1 rounded-full border shadow-lg transition-all ${
                  isListening
                    ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : isSpeaking
                    ? "bg-blue-950/80 border-cyan-500/60 text-cyan-300"
                    : isProcessing
                    ? "bg-purple-950/80 border-purple-500/60 text-purple-300"
                    : "bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isListening
                      ? "bg-emerald-400 animate-ping"
                      : isSpeaking
                      ? "bg-cyan-400 animate-ping"
                      : isProcessing
                      ? "bg-purple-400 animate-spin"
                      : "bg-emerald-400"
                  }`}
                />
                <span className="text-xs sm:text-sm font-semibold">
                  {isListening
                    ? "Listening..."
                    : isSpeaking
                    ? "Speaking..."
                    : isProcessing
                    ? "Thinking..."
                    : "Ready to assist you • Click to talk"}
                </span>
              </div>
            </div>
          </div>

          {/* CHAT MESSAGES FEED (ChatGPT Style) */}
          <div className="w-full max-w-4xl mx-auto space-y-5">
            {chatHistory.length === 0 ? (
              <div className="py-6 text-center">
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                  What can I help you with today?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5">
                  Ask coding questions, search topics, play music, or speak hands-free commands anytime.
                </p>

                {/* Suggestion Chips */}
                <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteQuery(chip)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((item, index) => (
                <div key={index} className="space-y-3 animate-fadeIn">
                  {/* User Question (Right Aligned Bubble) */}
                  {item.prompt && (
                    <div className="flex justify-end items-end gap-2.5">
                      <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-medium shadow-md">
                        <p className="leading-relaxed">{item.prompt}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-700/50 border border-blue-400/40 flex items-center justify-center text-blue-200 text-xs flex-shrink-0 mb-0.5">
                        <HiUser />
                      </div>
                    </div>
                  )}

                  {/* Assistant Response Card (Full Width ChatGPT Style) */}
                  {item.response && (
                    <div className="flex justify-start items-start gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-cyan-500/40 flex-shrink-0 mt-0.5 shadow-md">
                        <img
                          src={assistantImage || defaultAvatar}
                          alt={assistantName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 max-w-[94%] p-4 sm:p-5 rounded-2xl rounded-tl-sm bg-[#121620] border border-slate-800 shadow-xl text-slate-100">
                        {/* Header: Name + Action Badge + Listen & Copy Actions */}
                        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-cyan-300">{assistantName}</span>
                            {item.type && item.type !== "general" && (
                              <span className="px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-[10px] sm:text-xs font-semibold text-blue-300 tracking-wide uppercase">
                                {item.type.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => speakResponse(item.response)}
                              className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Listen to response"
                            >
                              <HiSpeakerWave className="text-base" />
                            </button>
                            <button
                              onClick={() => handleCopy(item.response, index)}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Copy answer"
                            >
                              {copiedIndex === index ? (
                                <HiCheck className="text-base text-emerald-400" />
                              ) : (
                                <HiClipboardDocument className="text-base" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Full Formatted Response & Code Blocks */}
                        {renderFormattedResponse(item.response, index)}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Active Thinking Indicator */}
            {isProcessing && (
              <div className="flex justify-start items-start gap-3 animate-pulse">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-purple-500/40 flex-shrink-0 mt-0.5">
                  <img
                    src={assistantImage || defaultAvatar}
                    alt={assistantName}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#121620] border border-slate-800 shadow-md flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
                  <span className="text-xs sm:text-sm text-slate-300 ml-1 font-medium">{assistantName} is generating response...</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* 3. BOTTOM FLOATING PROMPT INPUT BAR (ChatGPT Style - Responsive) */}
        <div className="w-full flex-shrink-0 px-2.5 sm:px-6 lg:px-8 pb-2 sm:pb-3 pt-1.5 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/95 to-transparent">
          <div className="max-w-4xl mx-auto">
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-2 px-3 sm:px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between shadow-md">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage("")} className="text-rose-400 hover:text-white p-0.5 active:scale-90">
                  <HiXMark className="text-base" />
                </button>
              </div>
            )}

            {/* Input Form Bar */}
            <form onSubmit={handleFormSubmit} className="relative">
              <div className="flex items-center bg-[#161b26] border-2 border-slate-700/80 focus-within:border-cyan-400/90 rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 shadow-2xl transition-all">
                
                {/* Plus / Search Icon */}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="mr-1.5 sm:mr-2 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer active:scale-90"
                  title="New prompt"
                >
                  <HiPlus className="text-lg sm:text-xl" />
                </button>

                {/* Main Text Input Field */}
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isListening
                      ? "Listening... speak now"
                      : "Ask anything, search, or speak..."
                  }
                  disabled={isProcessing}
                  className="w-full min-w-0 bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm md:text-base font-normal focus:outline-none pr-1.5 sm:pr-2 disabled:opacity-50"
                />

                {/* Clear Input Button */}
                {searchQuery && !isProcessing && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 mr-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer active:scale-90"
                  >
                    <HiXMark className="text-base sm:text-lg" />
                  </button>
                )}

                {/* Voice Mic Button (Interactive Wave) */}
                <button
                  type="button"
                  onClick={handleToggleListening}
                  disabled={isProcessing}
                  title={isListening ? "Stop voice listening" : "Start speaking voice command"}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer mr-1 sm:mr-1.5 flex-shrink-0 active:scale-95 ${
                    isListening
                      ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-cyan-300"
                  }`}
                >
                  <HiMicrophone className={`text-base sm:text-lg ${isListening ? "animate-bounce text-emerald-300" : ""}`} />
                  {isListening && (
                    <span className="hidden sm:inline text-xs font-bold text-emerald-300">Listening</span>
                  )}
                </button>

                {/* Send / Ask Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !searchQuery.trim()}
                  className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center flex-shrink-0 shadow-md active:scale-95"
                  title="Send message"
                >
                  {isProcessing ? (
                    <HiArrowPath className="text-base sm:text-lg animate-spin" />
                  ) : (
                    <HiPaperAirplane className="text-base sm:text-lg" />
                  )}
                </button>
              </div>
            </form>

            <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-1.5 truncate px-2">
              {assistantName} AI Virtual Assistant • Powered by Gemini & Voice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;