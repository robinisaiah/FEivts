import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchIvtsOperatorUrl } from "../services/apiService";

const AuthGuard: React.FC = () => {
  const { accessToken } = useAuth();
  const token = accessToken || localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperatorUrl = async () => {
      if (role === "OPERATOR") {
        try {
          const operatorUrl = await fetchIvtsOperatorUrl();
          if (operatorUrl) {
            setRedirectUrl(operatorUrl);
          }
        } catch (error) {
          console.error("Error fetching operator URL:", error);
        }
      }
    };

    fetchOperatorUrl();
  }, [role]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (redirectUrl) {
    window.location.href = redirectUrl;
    return null; // Prevent rendering anything else
  }

  return <Outlet />; // Render protected routes if no redirection occurs
};

export default AuthGuard;
