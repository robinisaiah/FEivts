import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

interface AuthContextType {
  accessToken: string | null;
  refreshAccessToken: () => Promise<void>;
  handleLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post("http://localhost:4000/refresh", {}, { withCredentials: true });
      setAccessToken((response.data as { accessToken: string }).accessToken);
    } catch (error) {
      console.error("Failed to refresh token", error);
    }
  };

  useEffect(() => {
    refreshAccessToken();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/auth/logout", {}, { withCredentials: true });
      setAccessToken(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshAccessToken, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
