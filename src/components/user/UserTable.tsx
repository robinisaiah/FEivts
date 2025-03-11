// src/components/UserTable.tsx
import React from "react";
import { Table, Button } from "antd";
import { EditOutlined, DeleteOutlined, KeyOutlined } from "@ant-design/icons";
import { User } from "../../interfaces/User";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onResetPassword: (id: number) => void;
  onDelete: (id: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onResetPassword }) => {
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "User Name", dataIndex: "username", key: "username" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} style={{ marginRight: 8 }} />
          <Button icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} danger style={{ marginRight: 8 }}/>
          <Button type="default"
            icon={<KeyOutlined />} onClick={() => onResetPassword(record.id)}>
          </Button>
        </>
      ),
    },
  ];

  return <Table dataSource={users} columns={columns} rowKey="id" />;
};

export default UserTable;