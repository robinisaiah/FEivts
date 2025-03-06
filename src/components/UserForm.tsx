// src/components/UserForm.tsx
import React from "react";
import { Form, Input, Select } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { User } from "../interfaces/User";

interface UserFormProps {
  form: any;
  onFinish: (values: any) => void;
  initialValues?: any;
  editingUser: User | null; 
}

const UserForm: React.FC<UserFormProps> = ({ form, onFinish, initialValues, editingUser }) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter the name" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="id" hidden>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item name="username" label="User Name" rules={[{ required: true, message: "Please enter the Username" }]}>
        <Input type="email" />
      </Form.Item>
      { !editingUser && (
      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: "Please enter your password!" },
          { min: 6, message: "Password must be at least 6 characters long!" },
        ]}
        hasFeedback
        >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter password"
        />
        </Form.Item>
      )}
      { !editingUser && (
        <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={["password"]}
        hasFeedback
        rules={[
          { required: true, message: "Please confirm your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords do not match!"));
            },
          }),
        ]}
        >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirm password"
        />
        </Form.Item>
)}
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
  );
};

export default UserForm;