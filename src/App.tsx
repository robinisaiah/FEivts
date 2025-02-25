import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard"; // Import Dashboard
import { App as AntdApp } from "antd";
import PrivateRoute from "./PrivateRoute"; 
import GuestRoute from "./GuestRoute"; 
import React, { useState, useEffect } from "react";


function App() {
  useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
          // Validate token by sending a request to the backend
          fetch("http://localhost:5000/api/auth/validate", {
              method: "POST",
              headers: { "Authorization": `Bearer ${token}` },
          })
          .then((res) => res.json())
          .then((data) => {
              if (!data.valid) {
                  localStorage.removeItem("token");
                  window.location.href = "/";
              }
          })
          .catch(() => {
              localStorage.removeItem("token");
              window.location.href = "/";
          });
      }
  }, []);
  return (
    <Router>
      <AntdApp>
        <Routes>
        {/* <Route element={<GuestRoute />}> */}
          <Route path="/" element={<LoginForm />} />
        {/* </Route> */}
          {/* <Route element={<PrivateRoute />}> */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* </Route> */}
        </Routes>
      </AntdApp>
    </Router>
  );
}

export default App;
