import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/userContext.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { HiArrowLeft, HiSparkles, HiExclamationCircle } from 'react-icons/hi2'

function Customize2() {
  const { 
    userData, 
    setUserData, 
    serverurl, 
    selectedImage, 
    frontendImage,
    backendImage, 
    assistantName: contextName,
    setAssistantName: setContextName 
  } = useContext(userDataContext) || {}

  const [assistantName, setAssistantName] = useState(contextName || userData?.assistantName || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const displayImage = frontendImage || selectedImage || userData?.assistantImage

  const handleUpdateAssistant = async () => {
    if (!assistantName.trim()) {
      setError("Please enter a valid assistant name")
      return
    }

    setLoading(true)
    setError("")

    try {
      let formData = new FormData()
      formData.append("assistantName", assistantName.trim())
      
      if (backendImage) {
        formData.append("assistantImage", backendImage)
      } else if (selectedImage) {
        formData.append("imageUrl", selectedImage)
      }

      const result = await axios.post(
        `${serverurl || "http://localhost:8000"}/api/user/update`,
        formData,
        { withCredentials: true }
      )

      console.log("Assistant updated:", result.data)
      if (setUserData) {
        setUserData(result.data)
      }
      if (setContextName) {
        setContextName(assistantName.trim())
      }

      navigate("/")
    } catch (err) {
      console.error("Update assistant error:", err)
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to update assistant. Please make sure you are logged in."
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-[#030353] via-[#020230] to-[#000015] flex justify-center items-center flex-col p-6 relative overflow-hidden font-sans text-white'>
      {/* Background Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/customize')}
        className='absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-slate-900/60 border border-slate-700/50 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer z-10'
      >
        <HiArrowLeft className="text-lg" />
        <span>Change Avatar</span>
      </button>

      <div className="w-full max-w-md flex flex-col items-center z-10">
        {/* Selected Avatar Preview */}
        {displayImage ? (
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-blue-400/80 shadow-[0_0_30px_rgba(59,130,246,0.6)] mb-6 transition-all transform hover:scale-105">
            <img src={displayImage} alt="Selected Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-blue-900/40 border-2 border-dashed border-blue-400 flex items-center justify-center mb-6">
            <HiSparkles className="text-4xl text-blue-300 animate-pulse" />
          </div>
        )}

        <h1 className='text-white mb-2 text-2xl sm:text-3xl text-center font-extrabold tracking-wide'>
          Name Your <span className='text-blue-300 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent'>Assistant</span>
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Give your AI companion a personalized name to start chatting
        </p>

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
            <HiExclamationCircle className="text-lg flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input */}
        <input 
          type="text" 
          placeholder='e.g. Shifra, Jarvis, Alex...' 
          className='w-full h-[60px] outline-none border-2 border-slate-600 bg-slate-900/80 focus:border-blue-400 text-white placeholder-slate-400 px-6 rounded-full text-lg transition-all shadow-inner' 
          required 
          onChange={(e) => {
            setAssistantName(e.target.value)
            if (error) setError("")
          }} 
          value={assistantName}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdateAssistant()}
        />

        {/* Action Button */}
        {assistantName.trim() && (
          <button 
            disabled={loading}
            className='w-full h-[60px] mt-6 text-slate-950 font-bold cursor-pointer bg-white rounded-full text-lg hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2' 
            onClick={handleUpdateAssistant}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating Assistant...</span>
              </>
            ) : (
              <span>Finally Create Your Assistant</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default Customize2