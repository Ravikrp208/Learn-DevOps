import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const userDataContext = createContext();

export function UserProvider({ children }) {
  const serverurl = "http://localhost:8000";
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Configure axios globally to include credentials
  axios.defaults.withCredentials = true;

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${serverurl}/api/auth/me`);
        if (response.data) {
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (err) {
        // If 401/error, token is invalid or missing
        console.log("No active session:", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logoutUser = async () => {
    try {
      await axios.get(`${serverurl}/api/auth/logout`);
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const value = {
    serverurl,
    user,
    setUser,
    loginUser,
    logoutUser,
    loading,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserProvider;