import React from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace("{host}", window.location.hostname);

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onLogout: () => void;
  onSelectModule: (module: "users" | "sessions") => void; // Prop to handle menu selection
}

const handleClick = async () => {
  window.location.href = `${API_BASE_URL}/redirect/ivts`;
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onCollapse,
  onLogout,
  onSelectModule,
}) => {
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div style={{ padding: "16px", textAlign: "center" }}>
        <Button type="primary" onClick={() => onCollapse(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
      </div>
      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
        <Menu.Item
          key="1"
          icon={<UserOutlined />}
          onClick={() => onSelectModule("users")}
        >
          User Management
        </Menu.Item>
        <Menu.Item
          key="2"
          icon={<ClockCircleOutlined />}
          onClick={() => onSelectModule("sessions")}
        >
          User Sessions
        </Menu.Item>
        <Menu.Item key="3" icon={<LinkOutlined />} onClick={handleClick}>
          IVTS
        </Menu.Item>
        <Menu.Item key="4" icon={<LogoutOutlined />} onClick={onLogout}>
          Log out
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
