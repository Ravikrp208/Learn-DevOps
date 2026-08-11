import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const userDataContext = createContext();

export function UserProvider({ children }) {
  const serverurl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname || "localhost"}:8000`;
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [assistantName, setAssistantName] = useState("");

  const loginUser = (data) => {
    setUserData(data);
  };

  const handlecurrentuser = async () => {
    try {
      const result = await axios.get(`${serverurl}/api/user/current`, { withCredentials: true });
      setUserData(result.data);
    } catch (error) {
      console.log("User session check:", error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    handlecurrentuser();
  }, []);

  const value = {
    serverurl,
    userData,
    setUserData,
    userdata: userData,
    setUserdata: setUserData,
    loginUser,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    assistantName,
    setAssistantName,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserProvider;