import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";

import authApi from "../../api/authApi";

function ChangePassword() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      await authApi.changePassword({
        oldPassword: values.oldPassword,

        newPassword: values.newPassword,
      });

      message.success("Đổi mật khẩu thành công");

      form.resetFields();
    } catch (err) {
      message.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const [form] = Form.useForm();

  return (
    <Card
      title="Đổi mật khẩu"
      style={{
        maxWidth: 600,
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Mật khẩu hiện tại"
          name="oldPassword"
          rules={[
            {
              required: true,
              message: "Nhập mật khẩu hiện tại",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            {
              required: true,
              message: "Nhập mật khẩu mới",
            },
            {
              min: 6,
              message: "Ít nhất 6 ký tự",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            {
              required: true,
              message: "Xác nhận mật khẩu",
            },

            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error("Mật khẩu không khớp"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Đổi mật khẩu
        </Button>
      </Form>
    </Card>
  );
}

export default ChangePassword;
