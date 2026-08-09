import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Home from "./Pages/Home";
import Customize from "./Pages/Customize";
import Customize2 from "./Pages/Customize2";
import { userDataContext } from "./context/userContext.jsx";

const App = () => {
  const { userData } = useContext(userDataContext) || {};

  return (
    <Routes>
      <Route
        path="/"
        element={
          userData ? (
            <Home />
          ) : (
            <Navigate to="/signup" replace />
          )
        }
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/customize" replace />}
      />
      <Route
        path="/singup"
        element={!userData ? <SignUp /> : <Navigate to="/customize" replace />}
      />

      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/customize" replace />}
      />
      <Route
        path="/singin"
        element={!userData ? <SignIn /> : <Navigate to="/customize" replace />}
      />

      <Route
        path="/customize"
        element={<Customize />}
      />

      <Route
        path="/customize2"
        element={<Customize2 />}
      />
    </Routes>
  );
};

export default App;
