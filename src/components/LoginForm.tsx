import React, { useState, useEffect, createContext } from "react";
import { ConfigProvider, theme, Typography, message } from "antd";
import { Form, Input, Button, Card, Switch } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import companyLogo from "../images/ivts.png";
import {
  fetchIvtsOperatorUrl
} from "../services/apiService";

const { Title, Text } = Typography;

// Define an interface for AuthContext
interface AuthContextType {
  accessToken: string | null;
  refreshAccessToken: () => Promise<void>;
  handleLogout: () => void;
}

// Create AuthContext with a default empty object matching the type
export const AuthContext = createContext<AuthContextType | null>(null);

const Login = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
  const [username, setUsername] = useState(rememberMe ? localStorage.getItem("rememberUsername") || "" : "");

  useEffect(() => {
    if (!rememberMe) {
      setUsername("");
    }
  }, [rememberMe]);

  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
      } else {
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
  };

  useEffect(() => {
    if (accessToken) {
      const tokenParts = JSON.parse(atob(accessToken.split(".")[1]));
      const expirationTime = tokenParts.exp * 1000 - 60000;
      const timeout = setTimeout(refreshAccessToken, expirationTime - Date.now());
      return () => clearTimeout(timeout);
    }
  }, [accessToken]);

  interface LoginValues {
    username: string;
    password: string;
  }

  const onFinish = async (values: LoginValues) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, rememberMe }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", data.role);
        if (data.role === "Operator") {
          const operatorUrl = await fetchIvtsOperatorUrl();
          if (operatorUrl) {
            window.location.href = operatorUrl; // Redirect dynamically
            return; // Prevent navigating to "/dashboard"
          }
      }
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberUsername", values.username);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberUsername");
        }
        navigate("/dashboard");
      } else {
        setErrorMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    if (!rememberMe) {
      localStorage.removeItem("rememberUsername");
      localStorage.removeItem("rememberMe");
    }
    fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshAccessToken, handleLogout }}>
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <div className="login-container">
          <div className="login-left">
            <div className="login-overlay"></div>
          </div>

          <div className="login-right">
            <Card className="login-card">
              <div className="logo-container">
                <img src={companyLogo} alt="IVTS Logo" className="company-logo" />
                <Title level={3} className="company-name">i-VTS</Title>
              </div>
              <Title level={2} className="login-title">Login</Title>
              {errorMessage && <Text type="danger">{errorMessage}</Text>}
              <Form name="login" onFinish={onFinish}>
                <Form.Item name="username" initialValue={username} rules={[{ required: true, message: "Please enter your username!" }]}> 
                  <Input prefix={<UserOutlined />} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: "Please enter your password!" }]}> 
                  <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>

                <Form.Item className="remember-me"> 
                  <Switch checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  <Text className="remember-text">Remember Me</Text>
                </Form.Item>

                <Form.Item> 
                  <Button type="primary" htmlType="submit" className="login-button">Log In</Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </ConfigProvider>
    </AuthContext.Provider>
  );
};

export default Login;
