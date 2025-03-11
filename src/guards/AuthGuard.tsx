import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthGuard: React.FC = () => {
  const { accessToken } = useAuth();
  const token = accessToken || localStorage.getItem("accessToken");
  if (!token) {
    // If no access token, redirect to login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render the protected component
};

export default AuthGuard;
