// ProtectedRoute.js
import React, { useEffect } from "react";
import { useAuth } from "./spotifyComponents/authContext"; // Correct import path
import { Navigate, useLocation } from "react-router-dom";
import { message } from "antd";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      message.error("You need to log in to access this page.");
    }
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
