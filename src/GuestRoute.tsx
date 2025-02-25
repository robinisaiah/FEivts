import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const GuestRoute = () => {
  const token = localStorage.getItem("token"); // Check if token exists
  return token ?  <Navigate to="/dashboard" replace /> : <Outlet /> ;
};

export default GuestRoute;
