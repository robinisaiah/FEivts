import companyvideo from "../../images/iVTSvideo.mp4";
import React, { useState, useEffect, createContext } from "react";
import { ConfigProvider, theme, Typography } from "antd";
import { Form, Input, Button, Card, Checkbox } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import companyLogo from "../../images/ivts_ntcpwc_logo.png";
import { fetchIvtsOperatorUrl } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;

// Define an interface for AuthContext
interface AuthContextType {
  accessToken: string | null;
  refreshAccessToken: () => Promise<void>;
}

// Create AuthContext with a default empty object matching the type
export const AuthContext = createContext<AuthContextType | null>(null);

const Login = () => {
  const { setTokens } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  const [username, setUsername] = useState(
    rememberMe ? localStorage.getItem("rememberUsername") || "" : ""
  );

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
      if (!response.ok) {
        throw new Error("Session expired, please login again.");
      }

      setTokens(data.accessToken, data.refreshToken); // Update both tokens
      localStorage.setItem("accessToken", data.accessToken);
    } catch (error) {
      handleLogout();
    }
  };

  interface LoginValues {
    username: string;
    password: string;
  }

  const onFinish = async (values: LoginValues) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, rememberMe }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      setTokens(data.accessToken, data.refreshToken);
      localStorage.setItem("accessToken", data.accessToken);

      localStorage.setItem("role", data.role.toUpperCase());
      setAccessToken(data.accessToken);

      if (data.role.toUpperCase() === "OPERATOR") {
        window.location.href = `${API_BASE_URL}/redirect/ivts`;
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberUsername", values.username);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberUsername");
      }

      navigate("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setAccessToken(null);
    if (!rememberMe) {
      localStorage.removeItem("rememberUsername");
      localStorage.removeItem("rememberMe");
    }
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // Ensure backend clears refresh token
    });
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshAccessToken }}>
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
            <Card
              className="login-card"
              style={{
                background: "#ffffff",
                border: "1px solid #ffffff",
                borderRadius: "8px",
              }}
            >
              <div className="logo-container">
                <img
                  src={companyLogo}
                  alt="IVTS Logo"
                  className="company-logo"
                />
                <Title level={3} className="company-name">
                  i-VTS
                </Title>
              </div>
              <Title
                level={2}
                className="login-title"
                style={{
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
                <Form.Item
                  name="username"
                  initialValue={username}
                  rules={[
                    { required: true, message: "Please enter your username!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
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
                  >
                    {" "}
                    <Text className="remember-text">Remember Me</Text>
                  </Checkbox>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-button"
                  >
                    Log In
                  </Button>
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
