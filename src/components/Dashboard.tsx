import React, { useState, useEffect, useCallback } from "react";
import { Layout, Button, Modal, Form, message } from "antd";
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
      await loadData(); // Refresh the user list
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        ivtsOperatorUrl={ivtsOperatorUrl}
        onLogout={handleLogout}
        onSelectModule={setActiveModule} // Pass the function to Sidebar
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
    overflowY: "auto", // Enables vertical scrolling
    maxHeight: "calc(100vh - 100px)", // Prevents content overflow
  }}>
          {activeModule === "users" ? (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
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
        <UserForm form={form} onFinish={handleSaveUser} />
      </Modal>
    </Layout>
  );
};

export default Dashboard;
