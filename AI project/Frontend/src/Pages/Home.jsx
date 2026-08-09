import React, { useContext, useState } from "react";
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
  HiChatBubbleBottomCenterText
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

  const [isListening, setIsListening] = useState(false);

  const handleLogOut = async () => {
    try {
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

  const assistantImage = userData?.assistantImage || selectedImage || frontendImage;
  const assistantName = userData?.assistantName || "Shifra";
  const userEmail = userData?.email || "user@example.com";

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

        {/* Right Side: Customize, Email, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/customize")}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
          >
            <HiPaintBrush className="text-blue-400 text-base" />
            <span className="hidden sm:inline">Customize</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-300 text-xs sm:text-sm font-medium backdrop-blur-md shadow-inner">
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

      {/* Hero Content Showcase */}
      <main className="w-full max-w-5xl flex flex-col items-center justify-center my-auto py-8 sm:py-12 z-20">
        {/* System Online Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <HiSparkles className="text-blue-400 text-base animate-spin" style={{ animationDuration: "6s" }} />
          <span>AI Neural Engine • Synced</span>
        </div>

        {/* Hero Greeting Text */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-center tracking-tight text-white mb-8 leading-tight drop-shadow-2xl">
          Hello, I am{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 via-purple-400 to-pink-400 bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            {assistantName}
          </span>
        </h1>

        {/* Avatar Card Showcase Container */}
        <div className="relative group my-2">
          {/* Multi-layered Glowing Aura Background */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-90 transition duration-700 group-hover:duration-300" />

          {/* Hologram Reticle Corner Accents */}
          <div className="absolute -top-3 -left-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>
          <div className="absolute -top-3 -right-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>
          <div className="absolute -bottom-3 -left-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>
          <div className="absolute -bottom-3 -right-3 text-cyan-400 text-lg font-mono opacity-80 z-20 pointer-events-none">+</div>

          {/* Card Showcase Frame */}
          <div className="relative w-[270px] h-[370px] sm:w-[320px] sm:h-[430px] bg-[#020220] border-2 border-cyan-400/40 group-hover:border-cyan-300/80 rounded-2xl overflow-hidden flex justify-center items-center shadow-[0_0_60px_rgba(6,182,212,0.35)] transition-all duration-500 group-hover:scale-[1.02]">
            {/* Live Hologram Tag */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 uppercase tracking-widest z-20 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Live Avatar
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

            {/* Bottom Gradient overlay on image */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#020220] to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Audio Visualizer & Voice Mic Bar */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`flex items-center gap-3.5 px-7 py-3.5 rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 cursor-pointer ${
              isListening 
                ? "bg-emerald-500/20 border-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105" 
                : "bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-500 shadow-[0_0_25px_rgba(0,0,0,0.5)] hover:scale-105"
            }`}
          >
            {/* Animated Sound Equalizer Bars */}
            <div className="flex items-center gap-1 h-5">
              <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isListening ? "animate-bounce h-5" : "h-2"}`} />
              <span className={`w-1 bg-blue-400 rounded-full transition-all ${isListening ? "animate-bounce h-4" : "h-3"}`} style={{ animationDelay: "150ms" }} />
              <span className={`w-1 bg-purple-400 rounded-full transition-all ${isListening ? "animate-bounce h-6" : "h-1.5"}`} style={{ animationDelay: "300ms" }} />
              <span className={`w-1 bg-pink-400 rounded-full transition-all ${isListening ? "animate-bounce h-3" : "h-2.5"}`} style={{ animationDelay: "450ms" }} />
            </div>

            <HiMicrophone className={`text-xl ${isListening ? "text-emerald-400 animate-pulse" : "text-blue-400"}`} />
            
            <span className="text-xs sm:text-sm text-slate-200 font-semibold tracking-wide">
              {isListening ? "Listening... Speak Now" : "Click to Speak"}
            </span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-10 z-10">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 shadow-lg hover:border-blue-500/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HiBolt className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Response</h4>
              <p className="text-[11px] text-slate-400">Real-time voice & AI logic</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 shadow-lg hover:border-purple-500/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HiShieldCheck className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Session</h4>
              <p className="text-[11px] text-slate-400">Encrypted JWT auth active</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex items-center gap-3 shadow-lg hover:border-emerald-500/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HiChatBubbleBottomCenterText className="text-xl" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Voice Control</h4>
              <p className="text-[11px] text-slate-400">Interactive speech engine</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center py-3 text-xs text-slate-500 border-t border-slate-900/80 z-10">
        Virtual Assistant AI • Powered by Advanced Neural Engine
      </footer>
    </div>
  );
}

export default Home;