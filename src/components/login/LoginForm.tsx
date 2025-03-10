import companyvideo from "../../images/iVTSvideo.mp4"; 
import React, { useState, useEffect, createContext } from "react";
import { ConfigProvider, theme, Typography, message } from "antd";
import { Form, Input, Button, Card, Switch, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import companyLogo from "../../images/Group_1212.png";
import {
  fetchIvtsOperatorUrl
} from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axiosInstance";

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
  const { setTokens } = useAuth();
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

  // useEffect(() => {
  //   console.log(accessToken);
  //   if (accessToken) {
  //     const tokenParts = JSON.parse(atob(accessToken.split(".")[1]));
  //     const expirationTime = tokenParts.exp * 1000 - 60000;
  //     const timeout = setTimeout(refreshAccessToken, expirationTime - Date.now());
  //     return () => clearTimeout(timeout);
  //   }
  // }, [accessToken]);

  interface LoginValues {
    username: string;
    password: string;
  }

  const onFinish = async (values: LoginValues) => {
    // try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, rememberMe }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setTokens(data.accessToken,data.refreshToken);
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", data.role);
        if (data.role === "Operator") {
          const operatorUrl = await fetchIvtsOperatorUrl();
          if (operatorUrl) {
            window.location.href = operatorUrl;
            return; 
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
    // } catch (error) {
    //   setErrorMessage("An unexpected error occurred. Please try again.");
    // }
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
                  <video autoPlay loop muted>
    <source src={companyvideo} type="video/mp4" />
    Your browser does not support the video tag.
</video>

            <div className="login-overlay"></div>
          </div>

          <div className="login-right">
            <Card className="login-card" style = {{background: "#ffffff", border: "1px solid #ffffff", borderRadius: "8px"}}>
              <div className="logo-container">
                <img src={companyLogo} alt="IVTS Logo" className="company-logo" />
                <Title level={3} className="company-name">i-VTS</Title>
              </div>
              <Title level={2} className="login-title" style={{
    color: "#121212",
    fontFamily: "Manrope",
    fontWeight: 600,
    fontSize: "18px",
    lineHeight: "100%",
    letterSpacing: "0%",
    textAlign: "left", 
    display: "block", 
  }}
>
  Login
</Title>

              {errorMessage && <Text type="danger">{errorMessage}</Text>}
              <Form name="login" onFinish={onFinish}>
                <Form.Item name="username" initialValue={username} rules={[{ required: true, message: "Please enter your username!" }]}> 
                  <Input prefix={<UserOutlined />} placeholder="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} 
                    style={{
                      backgroundColor: "#f5f5f5", // Change background color
                      padding: "10px", // Add padding
                      borderRadius: "5px", // Optional: Add border radius
                      border: "1px solid #ccc", // Optional: Adjust border style
                      color: "#121212",
                    }}
                     className="custom-password-input"
                    />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: "Please enter your password!" }]}> 
                  <Input.Password prefix={<LockOutlined />}
  placeholder="Enter Password"
  style={{
    backgroundColor: "#f5f5f5", // Background color
    padding: "10px", // Padding
    borderRadius: "5px", // Border radius
    border: "1px solid #ccc", // Border style
    color: "#121212", // Text color
  }}
  className="custom-password-input"
                    />
                </Form.Item>

                <Form.Item className="remember-me"> 
                <Checkbox 
    checked={rememberMe} 
    onChange={(e) => setRememberMe(e.target.checked)}
    className="remember-checkbox"
>                  <Text className="remember-text">Remember Me</Text>
</Checkbox>
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
