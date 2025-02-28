// src/components/UserForm.tsx
import React from "react";
import { Form, Input, Select } from "antd";

interface UserFormProps {
  form: any;
  onFinish: (values: any) => void;
  initialValues?: any;
}

const UserForm: React.FC<UserFormProps> = ({ form, onFinish, initialValues }) => {
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
  );
};

export default UserForm;