import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/userContext.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Customize2() {
  const { userData, setUserData, serverurl, selectedImage, backendImage } = useContext(userDataContext) || {}
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleUpdateAssistant = async () => {
    try {
      let formData = new FormData()
      formData.append("assistantName", assistantName)
      if (backendImage) {
        formData.append("assistantImage", backendImage)
      } else {
        formData.append("imageUrl", selectedImage)
      }

      const result = await axios.post(
        `${serverurl || "http://localhost:8000"}/api/user/update`,
        formData,
        { withCredentials: true }
      )

      console.log(result.data)
      if (setUserData) {
        setUserData(result.data)
      }
      navigate("/")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p-[20px] relative overflow-hidden'>
      <h1 className='text-white mb-[40px] text-[30px] text-center font-bold tracking-wide'>
        Enter Your <span className='text-blue-200'>Assistant Name</span>
      </h1>
      <input 
        type="text" 
        placeholder='eg. shifra' 
        className='w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] focus:border-blue-400 transition-colors' 
        required 
        onChange={(e) => setAssistantName(e.target.value)} 
        value={assistantName}
      />
      {assistantName && (
        <button 
          className='min-w-[300px] h-[60px] mt-[30px] text-black font-semibold cursor-pointer bg-white rounded-full text-[19px] hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
          onClick={handleUpdateAssistant}
        >
          Finally Create Your Assistant
        </button>
      )}
    </div>
  )
}

export default Customize2