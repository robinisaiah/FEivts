import React, { useState, useEffect } from "react";
import { ConfigProvider, theme, message } from "antd";
import { Form, Input, Button, Card, Typography, Switch } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import companyLogo from "../images/ivts.png";

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Load saved values from local storage
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("rememberMe") === "true");
  const [username, setUsername] = useState(rememberMe ? localStorage.getItem("rememberUsername") || "" : "");

  useEffect(() => {
    if (!rememberMe) {
      setUsername(""); // Clear username field if rememberMe is false
    }
  }, [rememberMe]);

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, rememberMe }),
      });

      const data = await response.json();
      const token = data.token;

      if (response.ok) {
        localStorage.setItem("token", token);
        sessionStorage.setItem("token", token);
        if (rememberMe) {
          
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberUsername", values.username);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberUsername");
        }
        navigate("/dashboard"); // Redirect after login
      } else {
        setErrorMessage(data.message || "Invalid credentials");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    if (!rememberMe) {
      localStorage.removeItem("rememberUsername");
      localStorage.removeItem("rememberMe");
    }

    navigate("/login");
  };

  return (
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
              <Form.Item
                name="username"
                initialValue={username}
                rules={[{ required: true, message: "Please enter your username!" }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please enter your password!" }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>

              <Form.Item className="remember-me">
                <Switch checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                <Text className="remember-text">Remember Me</Text>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-button">
                  Log In
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;
