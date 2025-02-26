import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Table, Modal, Form, Input, message} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
  LinkOutlined
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { Select } from "antd";
import { useNavigate } from "react-router-dom"; 


const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = "/"; // Redirect to login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  useEffect(() => {
    fetchUsers();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login if no token
    }
  }, [navigate]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    const { password, ...userDataWithoutPassword } = user;
    form.setFieldsValue(userDataWithoutPassword);
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id: number) => {
    const isConfirmed = window.confirm("Are you sure? This action cannot be undone.");
    if (!isConfirmed) {
      return; // Exit if the user cancels
    }
  
    try {
      setUsers(users.filter((user) => user.id !== id));
  
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
  
      alert("User deleted successfully");
    } catch (error) {
      alert("Error deleting user");
      console.error("Error:", error);
    }
  };

  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields(); // Validate form fields
      console.log("Form Values:", values); // Debugging step
      const token = localStorage.getItem("token");
      let response;
      if (editingUser) {
      
        // Update existing user
        response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
           },
          body: JSON.stringify(values),
        });
      } else {
        // Add new user
        response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
             Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(values),
        });
      }
  
      const data = await response.json();
      console.log("API Response:", data); // Log API response
  
      if (!response.ok) {
        console.error("API Error:", data);
        setErrorMessage(data.error || `Error: ${response.status}`); // Set error message
        return;
        }
  
      // Update UI after successful API response
      if (editingUser) {
        setUsers(users.map((user) => (user.id === editingUser.id ? { ...data, id: user.id } : user)));
      } else {
        setUsers([...users, { id: data.id, ...data }]); // Ensure backend returns `id`
      }

      fetchUsers();
  
      setIsModalVisible(false);
      form.resetFields(); // Reset form after success
    setErrorMessage("");
    } catch (error) {
      console.error("Error Occurred:", error);
  
      // alert("Error: " + (error instanceof Error ? error.message : "Check console for details"));
    }
  };
  
  

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "User Name", dataIndex: "username", key: "username" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEditUser(record)} style={{ marginRight: 8 }} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record.id)} danger />
        </>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="md">
        <div style={{ padding: "16px", textAlign: "center" }}>
          <Button type="primary" onClick={toggleCollapsed}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<UserOutlined />}>User Management</Menu.Item>
                    <Menu.Item key="2" icon={<LinkOutlined />}><a href="https://www.google.com/">IVTS</a></Menu.Item>
            <Menu.Item key="3" icon={<LogoutOutlined />} onClick={handleLogout}>Log out</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: 16, textAlign: "center", fontSize: "20px" }}> <span style={{ fontSize: "20px" }}>Dashboard</span></Header>
        <Content style={{ margin: "16px", padding: "16px", background: "#fff", borderRadius: "8px" }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser} style={{ marginBottom: 16 }}>
            Add User
          </Button>
          <Table dataSource={users} columns={columns} rowKey="id" scroll={{ x: "max-content" }} />
        </Content>
      </Layout>
      <Modal title={editingUser ? "Edit User" : "Add User"} visible={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={handleSaveUser}>
      {errorMessage && <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>}
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter the name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="User Name" rules={[{ required: true, message: "Please enter the Username" }]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item 
          name="password" 
          label="Password" 
          rules={[{ required: true, message: "Please enter the password" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item 
      name="role" 
      label="Role" 
      rules={[{ required: true, message: "Please select a role" }]}
    >
      <Select placeholder="Select Role">
        <Select.Option value="Admin">Admin</Select.Option>
        <Select.Option value="Operator">Operator</Select.Option>
      </Select>
    </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
