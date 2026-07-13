import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Spin,
  Typography,
  ConfigProvider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import authApi from "../../api/authApi"; // Đường dẫn tới file authApi của bạn

const { Title, Text } = Typography;
const { confirm } = Modal;

const StudentProfileDetail = () => {
  // --- States ---
  const [profile, setProfile] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dùng form instance của Antd để quản lý dữ liệu form đổi mật khẩu
  const [form] = Form.useForm();

  // --- Fetch Data ---
  const fetchProfileAndUsers = async () => {
    try {
      setLoading(true);
      // 1. Lấy thông tin cá nhân
      const profileRes = await authApi.me();
      console.log("Profile data:", profileRes);
      setProfile(profileRes);

      // 2. Nếu là admin, lấy thêm danh sách users
      if (profileRes.data?.role === "admin") {
        const usersRes = await authApi.getUsers();
        setUsersList(usersRes.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải thông tin profile. Vui lòng đăng nhập lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndUsers();
  }, []);

  // --- Xử lý Đổi Mật Khẩu ---
  const submitChangePassword = async (values) => {
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Đổi mật khẩu thất bại.";
      message.error(errorMsg);
    }
  };

  // --- Xử lý các chức năng của Admin ---
  const handleLockUser = (id) => {
    confirm({
      title: "Bạn có chắc chắn muốn KHÓA tài khoản này?",
      icon: <ExclamationCircleOutlined />,
      okText: "Khóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await authApi.lockUser(id);
          message.success("Đã khóa tài khoản");
          setUsersList((prev) =>
            prev.map((u) => (u.id === id ? { ...u, is_active: 0 } : u)),
          );
        } catch (err) {
          message.error("Lỗi khi khóa tài khoản");
        }
      },
    });
  };

  const handleUnlockUser = async (id) => {
    try {
      await authApi.unlockUser(id);
      message.success("Đã mở khóa tài khoản");
      setUsersList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: 1 } : u)),
      );
    } catch (err) {
      message.error("Lỗi khi mở khóa tài khoản");
    }
  };

  const handleResetPassword = (id) => {
    confirm({
      title: "Bạn có chắc chắn muốn reset mật khẩu tài khoản này về '123456'?",
      icon: <ExclamationCircleOutlined />,
      okText: "Reset",
      cancelText: "Hủy",
      async onOk() {
        try {
          await authApi.resetPassword(id);
          message.success("Reset mật khẩu thành công về: 123456");
        } catch (err) {
          message.error("Lỗi khi reset mật khẩu");
        }
      },
    });
  };

  // --- Cấu trúc cột cho Bảng Admin (Antd Table) ---
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "green"}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Đang hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            icon={<KeyOutlined />}
            size="small"
            onClick={() => handleResetPassword(record.id)}
          >
            Reset PW
          </Button>
          {record.is_active ? (
            <Button
              danger
              type="primary"
              icon={<LockOutlined />}
              size="small"
              onClick={() => handleLockUser(record.id)}
            >
              Khóa
            </Button>
          ) : (
            <Button
              type="primary"
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              icon={<UnlockOutlined />}
              size="small"
              onClick={() => handleUnlockUser(record.id)}
            >
              Mở khóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    // Bọc ConfigProvider ngoài cùng để tiêm màu chủ đạo #37b0c3 vào Antd Components
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#37b0c3",
          borderRadius: 6,
        },
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px",
          backgroundColor: "#f9f9f9",
          minHeight: "100vh",
        }}
      >
        <Title
          level={2}
          style={{
            borderBottom: "2px solid #37b0c3",
            paddingBottom: "12px",
            marginBottom: "24px",
          }}
        >
          Hồ Sơ Học Sinh
        </Title>

        <Row gutter={[24, 24]}>
          {/* KHU VỰC 1: THÔNG TIN CÁ NHÂN */}
          <Col xs={24} md={8}>
            <Card
              title={
                <span style={{ color: "#37b0c3", fontWeight: "bold" }}>
                  Thông tin tài khoản
                </span>
              }
              bordered={false}
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: "100%",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <p style={{ margin: 0 }}>
                  <Text type="secondary" strong>
                    ID tài khoản:
                  </Text>{" "}
                  {profile?.id}
                </p>
                <p style={{ margin: 0 }}>
                  <Text type="secondary" strong>
                    Tên đăng nhập:
                  </Text>{" "}
                  {profile?.username}
                </p>
                <p style={{ margin: 0 }}>
                  <Text type="secondary" strong>
                    Vai trò:{" "}
                  </Text>
                  <Tag color={profile?.role === "admin" ? "red" : "green"}>
                    {profile?.role?.toUpperCase()}
                  </Tag>
                </p>
                {profile?.teacher_id && (
                  <p style={{ margin: 0 }}>
                    <Text type="secondary" strong>
                      Mã định danh GV:
                    </Text>{" "}
                    {profile?.teacher_id}
                  </p>
                )}
              </Space>
            </Card>
          </Col>

          {/* KHU VỰC 2: ĐỔI MẬT KHẨU */}
          <Col xs={24} md={16}>
            <Card
              title={
                <span style={{ color: "#37b0c3", fontWeight: "bold" }}>
                  Đổi mật khẩu
                </span>
              }
              bordered={false}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={submitChangePassword}
                requiredMark={false}
              >
                <Form.Item
                  label="Mật khẩu cũ"
                  name="oldPassword"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu cũ"
                  />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Nhập mật khẩu mới"
                  />
                </Form.Item>

                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận mật khẩu mới!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Mật khẩu mới không khớp!"),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<UserOutlined />}
                  >
                    Cập nhật mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* KHU VỰC 3: QUẢN LÝ DÀNH CHO ADMIN */}
          {profile?.role === "admin" && (
            <Col span={24}>
              <Card
                title={
                  <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                    Bảng điều khiển Admin (Quản lý User)
                  </span>
                }
                bordered={false}
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              >
                <Table
                  dataSource={usersList}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: true }}
                />
              </Card>
            </Col>
          )}
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default StudentProfileDetail;
