import React, { useState, useEffect, useCallback } from "react";
import { Layout, Button, Modal, Form, message, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import UserTable from "../user/UserTable";
import UserSessionTable from "../user/UserSessionTable"; // New Component
import UserForm from "../user/UserForm";
import { User } from "../../interfaces/User";
import {
  fetchUsers,
  fetchIvtsOperatorUrl,
  saveUser,
  deleteUser,
  logout,
  resetPassword
} from "../../services/apiService";
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
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Fetch users and IVTS URL
  const loadData = useCallback(async () => {
    try {
      const usersData = await fetchUsers();
      const role = localStorage.getItem("role");
      if(role == "OPERATOR"){
        const ivtsUrl = await fetchIvtsOperatorUrl();
        setIvtsOperatorUrl(ivtsUrl);
      }
      setUsers(usersData);
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
      window.location.href = "/login";
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
      if (selectedUserId === null) {
        message.error("No user selected.");
        return;
      }
  
      const values = await form.validateFields(); // Get new password from form
      await resetPassword(selectedUserId as number, values.newPassword); // Ensure it's a number
  
      message.success("Password reset successfully!");
      setIsResetModalVisible(false);
    } catch (error: unknown) {
      console.error("Error resetting password:", error);
  
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Server error. Try again later.");
      }
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
            rules={[
              { required: true, message: "Please enter New password!" },
              { min: 6, message: "Password must be at least 6 characters long!" },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
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
