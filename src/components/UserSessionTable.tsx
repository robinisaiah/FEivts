import React, { useEffect, useState } from "react";
import { Table, Input, DatePicker, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table"; // Correct Import
import { fetchUsesrsSessions } from "../services/apiService"; // Fixed function name
import dayjs from "dayjs"; // For date formatting

interface User {
  id: number;
  name: string;
  login_time: string;
  logout_time: string | null;
  duration: string;
}

const UserSessionTable: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams({
          name: searchText,
          fromDate: dateRange ? dateRange[0] : "",
          toDate: dateRange ? dateRange[1] : "",
        }).toString();

        const response: User[] = await fetchUsesrsSessions();
        const formattedData = response.map((user, index) => ({
          key: user.id, // Ensure unique key
          sno: index + 1, 
          name: user.name,
          login_time: user.login_time? user.login_time || "N/A",
          logout_time: user.logout_time? user.logout_time || "Still Active",
          duration: user.duration? user.duration || "Pending",
        }));
  
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching user sessions:", error);
      }
    };

    fetchData();
  }, [searchText, dateRange]);

  const columns: ColumnsType<User> = [
     {
      title: "#", // Shortened for compactness
      dataIndex: "sno",
      key: "sno",
      align: "center",
      render: (_: any, __: User, index: number) => <b>{index + 1}</b>, // Bold numbering
    },
    {
      title: "👤 Name", // Icon for appeal
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span style={{ fontWeight: "bold" }}>{text}</span>,
    },
    {
      title: "🕒 Login Time",
      dataIndex: "login_time",
      key: "login_time",
      align: "center",
      render: (text: string) => <span style={{ color: "#3498db" }}><b>{text}</b></span>,
    },
    {
      title: "🚪 Logout Time",
      dataIndex: "logout_time",
      key: "logout_time",
      align: "center",
      render: (text: string | null) =>
        text ? <span style={{ color: "#e67e22" }}><b>{text}</b></span> : <i style={{ color: "#95a5a6" }}>Still Active</i>,
    },
    {
      title: "⏳ Duration",
      dataIndex: "duration",
      key: "duration",
      align: "center",
      render: (text: string | null) => {
        if (!text) return <i style={{ color: "#95a5a6" }}>Pending</i>;
        const [hours, minutes] = text.split(" : ").map(Number);
        const color = hours > 2 ? "#e74c3c" : "#2ecc71"; // Red for long sessions, green for short
        return <span style={{ color, fontWeight: "bold" }}>{text} hrs</span>;
      },
    }
  ];

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Search by name or email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <DatePicker.RangePicker
            onChange={(dates, dateStrings) =>
              setDateRange(dateStrings as [string, string])
            }
          />
        </Col>
      </Row>

      <Table columns={columns} dataSource={data} rowKey="id" />
    </>
  );
};

export default UserSessionTable;
