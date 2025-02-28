import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { fetchUsesrsSessions } from "../services/apiService"; // Fixed Typo

interface Session {
  login_time: string;
  logout_time: string | null;
}

interface User {
  id: number;
  name: string;
  sessions: Session[];
}

const UserTable: React.FC = () => {
  const [data, setData] = useState<User[]>([]);

  // Uncomment this if you want to fetch from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchUsesrsSessions();
        setData(response as User[]); // Assuming response is an array of users
      } catch (error) {
        console.error("Error fetching user sessions:", error);
      }
    };

    fetchData();
  }, []);

  // Remove the conflicting `data` variable declaration

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id"
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Sessions",
      dataIndex: "sessions",
      key: "sessions",
      render: (sessions: Session[]) => (
        sessions.length > 0 ? (
          sessions.map((session, index) => (
            <Tag color={session.logout_time ? "green" : "red"} key={index}>
              {new Date(session.login_time).toLocaleString()} - {session.logout_time ? new Date(session.logout_time).toLocaleString() : "Active"}
            </Tag>
          ))
        ) : (
          <Tag color="gray">No Sessions</Tag>
        )
      )
    }
  ];

  return <Table dataSource={data} columns={columns} rowKey="id" />;
};

export default UserTable;
