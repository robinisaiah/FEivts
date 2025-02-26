import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard"; // Import Dashboard
import { App as AntdApp } from "antd";
import ProtectedRoute from "./ProtectedRoute"; 
import GuestRoute from "./GuestRoute"; 
import React, { useState, useEffect } from "react";
import AuthRedirect from "./AuthRedirect";


function App() {
  return (
    <Router>
      <AntdApp>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} /> {/* Default redirect */}
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        </Routes>
      </AntdApp>
    </Router>
  );
}

export default App;
