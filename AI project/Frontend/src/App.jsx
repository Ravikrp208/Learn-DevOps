import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/register" element={<SignUp />} />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
};

export default App;
