import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { userDataContext } from "../context/UserContext.jsx";
import aiBg from "../assets/ai_background.png";
import { 
  HiSparkles, 
  HiEnvelope, 
  HiLockClosed, 
  HiUser, 
  HiEye, 
  HiEyeSlash, 
  HiArrowRight, 
  HiCheckCircle, 
  HiExclamationCircle,
  HiCpuChip
} from "react-icons/hi2";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assistantName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { serverurl, loginUser } = useContext(userDataContext);
  
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.assistantName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post(
        `${serverurl || "http://localhost:8000"}/api/auth/signup`,
        {
          assistantName: formData.assistantName,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      setMessage({ type: "success", text: "Account created successfully! Redirecting to Dashboard..." });
      
      if (response.data) {
        loginUser(response.data);
      }

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("SignUp error:", error);
      const errorMsg = error.response?.data?.message || "Failed to create account. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* AI Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-opacity bg-no-repeat opacity-30 mix-blend-luminosity scale-105 transition-all duration-1000"
        style={{ backgroundImage: `url(${aiBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/70 to-[#0b0f19]/90 pointer-events-none" />

      {/* Background Decorative Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-float-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-float-glow" />
      <div className="absolute top-[40%] right-[35%] w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Cyber Grid pattern backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.25)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side Showcase Section */}
        <div className="lg:col-span-5 p-8 lg:p-12 bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-slate-950/90 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          {/* Subtle Background Image inside Showcase Card */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: `url(${aiBg})` }}
          />
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">

            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <HiSparkles className="text-indigo-400 text-sm animate-pulse" />
              <span>AI Assistant Platform</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Empower Your Workflow with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Smart AI</span>
            </h1>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Create your account to unlock personal virtual assistance, real-time command processing, and automated workflows.
            </p>
          </div>

          {/* AI Features Cards */}
          <div className="my-8 space-y-3.5">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-slate-300">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <HiCpuChip className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Voice & Text Commands</h4>
                <p className="text-xs text-slate-400">Natural language processing</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-slate-300">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <HiSparkles className="text-xl" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Custom Assistant Name</h4>
                <p className="text-xs text-slate-400">Personalize your companion</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Next-Gen Virtual Assistant</span>
            <span>v2.0 Active</span>
          </div>
        </div>

        {/* Right Side Form Section */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="mt-2 text-sm text-slate-400">
                Sign up to configure your custom AI Virtual Assistant.
              </p>
            </div>

            {/* Alert Message Banner */}
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 border transition-all ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {message.type === "success" ? (
                  <HiCheckCircle className="text-lg flex-shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <HiExclamationCircle className="text-lg flex-shrink-0 mt-0.5 text-rose-400" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Assistant Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Assistant Name / Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiUser className="text-lg" />
                  </div>
                  <input
                    type="text"
                    name="assistantName"
                    value={formData.assistantName}
                    onChange={handleChange}
                    placeholder="e.g. Jarvis AI or Alex"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiEnvelope className="text-lg" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiLockClosed className="text-lg" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <HiEyeSlash className="text-lg" /> : <HiEye className="text-lg" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Must be at least 6 characters</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Up</span>
                    <HiArrowRight className="text-base" />
                  </>
                )}
              </button>
            </form>

            {/* Already have an account link */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-4"
              >
                Sign In
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
