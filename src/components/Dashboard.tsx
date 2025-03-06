import React, { useState, useEffect, useCallback } from "react";
import { Layout, Button, Modal, Form, message, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserTable from "../components/UserTable";
import UserSessionTable from "../components/UserSessionTable"; // New Component
import UserForm from "../components/UserForm";
import { User } from "../interfaces/User";
import {
  fetchUsers,
  fetchIvtsOperatorUrl,
  saveUser,
  deleteUser,
  logout,
} from "../services/apiService";
import "antd/dist/reset.css";

const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [ivtsOperatorUrl, setIvtsOperatorUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<"users" | "sessions">("users"); // Track selected module
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  // Fetch users and IVTS URL
  const loadData = useCallback(async () => {
    try {
      const usersData = await fetchUsers();
      const ivtsUrl = await fetchIvtsOperatorUrl();
      setUsers(usersData);
      setIvtsOperatorUrl(ivtsUrl);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) navigate("/");
    loadData();
  }, [loadData, navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Handle saving user
  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields();
      await saveUser(values, !!editingUser);
      await loadData();
      setIsModalVisible(false);
      form.resetFields();
      setErrorMessage("");
    } catch (error) {
      console.error("Error saving user:", error);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Handle deleting user
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await deleteUser(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleOpenModal = (user: User | null) => {
    setEditingUser(user); 
    setErrorMessage("");
    setIsModalVisible(true);
    form.resetFields();
    if (user) {
      form.setFieldsValue({
        name: user.name,
        username: user.username,
        role: user.role,
        id: user.id
      });
    }
  };

  const handleOpenResetModal = async (id: number) => {
    setSelectedUserId(id);
    setIsResetModalVisible(true);
    form.resetFields();
  };

  const handleResetPassword = async () => {
    try {
      const values = await form.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error("Passwords do not match!");
        return;
      }

      const response = await fetch(`/api/users/${selectedUserId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: values.newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success("Password reset successfully!");
        setIsResetModalVisible(false);
      } else {
        message.error(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      message.error("Server error. Try again later.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        ivtsOperatorUrl={ivtsOperatorUrl}
        onLogout={handleLogout}
        onSelectModule={setActiveModule} 
      />
      <Layout>
        <Header style={{ background: "#fff", padding: 16, textAlign: "center", fontSize: "20px" }}>
          Dashboard
        </Header>
        <Content  style={{
    margin: "16px",
    padding: "16px",
    background: "#fff",
    borderRadius: "8px",
    overflowY: "auto",
    maxHeight: "calc(100vh - 100px)",
  }}>
          {activeModule === "users" ? (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setErrorMessage("");
                  setEditingUser(null);
                  setIsModalVisible(true);
                }}
                style={{ marginBottom: 16 }}
              >
                Add User
              </Button>
              <UserTable
                users={users}
                onEdit={(user) => handleOpenModal(user)}
                onDelete={handleDeleteUser}
                onResetPassword={handleOpenResetModal}
              />
            </>
          ) : (
            <UserSessionTable /> // Dynamically render session module
          )}
        </Content>
      </Layout>
      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSaveUser}
      >
        {errorMessage && <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>}
        <UserForm form={form} onFinish={handleSaveUser} editingUser={editingUser} />
      </Modal>
      <Modal
        title="Reset Password"
        open={isResetModalVisible}
        onCancel={() => setIsResetModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleResetPassword}>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: "Please enter a new password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true, message: "Please confirm your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Reset Password
            </Button>
            <Button onClick={() => setIsResetModalVisible(false)}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
