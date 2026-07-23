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
  Select,
  Tooltip,
  Divider,
} from "antd";
import { Icon } from "@iconify/react";
import authApi from "../../../api/authApi";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminProfile = () => {
  const ROLE_CONFIG = {
    admin: { label: "Quản trị viên", bg: "#fef2f2", color: "#ef4444" },
    principal: { label: "Hiệu trưởng", bg: "#fef3c7", color: "#d97706" },
    vice_principal: {
      label: "Phó Hiệu trưởng",
      bg: "#fff7ed",
      color: "#ea580c",
    },
    department_head: {
      label: "Tổ trưởng chuyên môn",
      bg: "#ecfdf5",
      color: "#16a34a",
    },
    teacher: { label: "Giáo viên", bg: "#eefafc", color: "#37B0C3" },
    office_staff: {
      label: "Nhân viên văn phòng",
      bg: "#f3e8ff",
      color: "#9333ea",
    },
    union_president: {
      label: "Chủ tịch Công đoàn",
      bg: "#fdf2f8",
      color: "#db2777",
    },
    school_council: {
      label: "Hội đồng trường",
      bg: "#eff6ff",
      color: "#2563eb",
    },
    student: { label: "Học sinh", bg: "#f8fafc", color: "#64748b" },
    parent: { label: "Phụ huynh", bg: "#f1f5f9", color: "#475569" },
  };

  // --- States ---
  const [profile, setProfile] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- States Lọc & Tìm Kiếm ---
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState(undefined);

  // --- States Modal Thêm User mới ---
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submittingRegister, setSubmittingRegister] = useState(false);

  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();

  // --- Fetch Data ---
  const fetchProfileAndUsers = async () => {
    try {
      setLoading(true);
      const profileRes = await authApi.me();
      const resProfile = profileRes?.data || profileRes;
      setProfile(resProfile);

      if (resProfile?.role === "admin") {
        const usersRes = await authApi.getUsers();
        setUsersList(usersRes?.data || usersRes || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      message.error("Không thể tải thông tin hệ thống.");
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
      message.error(error.response?.data?.message || "Đổi mật khẩu thất bại.");
    }
  };

  // 🌟 --- Xử lý Thêm Tài Khoản Mới (REGISTER) ---
  const handleRegisterUser = async (values) => {
    setSubmittingRegister(true);
    try {
      const payload = {
        username: values.username.trim(),
        password: values.password,
        role: values.role || "student",
        teacher_id: values.teacher_id ? Number(values.teacher_id) : null,
        student_id: values.student_id ? Number(values.student_id) : null,
        is_active: values.is_active !== undefined ? values.is_active : 1,
      };

      const res = await authApi.register(payload);
      if (res?.data?.success || res?.success || res) {
        message.success("Thêm tài khoản người dùng mới thành công!");
        setIsRegisterModalOpen(false);
        registerForm.resetFields();
        fetchProfileAndUsers(); // Reload danh sách user
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      message.error(
        error?.response?.data?.message || "Không thể tạo tài khoản mới!",
      );
    } finally {
      setSubmittingRegister(false);
    }
  };

  // --- Xử lý các chức năng quản lý User ---
  const handleLockUser = (id) => {
    Modal.confirm({
      title: "Khóa tài khoản người dùng?",
      description:
        "Tài khoản bị khóa sẽ không thể đăng nhập vào hệ thống trường học.",
      okText: "Xác nhận khóa",
      okButtonProps: { danger: true },
      cancelText: "Hủy",
      centered: true,
      async onOk() {
        try {
          await authApi.lockUser(id);
          message.success("Đã khóa tài khoản thành công");
          setUsersList((prev) =>
            prev.map((u) => (u.id === id ? { ...u, is_active: 0 } : u)),
          );
        } catch (err) {
          message.error("Lỗi khi thực hiện thao tác");
        }
      },
    });
  };

  const handleUnlockUser = async (id) => {
    try {
      await authApi.unlockUser(id);
      message.success("Đã mở khóa quyền truy cập tài khoản");
      setUsersList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: 1 } : u)),
      );
    } catch (err) {
      message.error("Lỗi khi mở khóa tài khoản");
    }
  };

  const handleResetPassword = (id) => {
    Modal.confirm({
      title: "Đặt lại mật khẩu mặc định?",
      content:
        "Hệ thống sẽ ép chuỗi bảo mật của tài khoản này về mã mặc định '123456'.",
      okText: "Đặt lại mật khẩu",
      cancelText: "Hủy",
      centered: true,
      async onOk() {
        try {
          await authApi.resetPassword(id);
          message.success("Đã reset mật khẩu thành công về: 123456");
        } catch (err) {
          message.error("Lỗi khi reset mật khẩu");
        }
      },
    });
  };

  // 🌟 Cập nhật vai trò trực tiếp trên giao diện
  const handleChangeRole = async (id, newRole) => {
    try {
      const res = await authApi.changeRole(id, newRole);
      if (res?.data?.success || res?.success || res) {
        message.success("Đã cập nhật vai trò tài khoản thành công!");
        // Cập nhật lại state local để UI đổi màu/label ngay lập tức
        setUsersList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
        );
      }
    } catch (err) {
      console.error("Lỗi đổi role:", err);
      message.error(
        err?.response?.data?.message || "Cập nhật vai trò thất bại",
      );
    }
  };

  const handleDeleteUser = (id) => {
    Modal.confirm({
      title: "Xóa tài khoản vĩnh viễn?",
      content:
        "Hành động này sẽ xóa sạch tài khoản khỏi cơ sở dữ liệu và không thể khôi phục.",
      okText: "Xóa vĩnh viễn",
      okButtonProps: { danger: true, type: "primary" },
      cancelText: "Hủy",
      centered: true,
      async onOk() {
        try {
          if (authApi.deleteUser) {
            await authApi.deleteUser(id);
          }
          message.success("Đã xóa tài khoản ra khỏi hệ thống");
          setUsersList((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
          message.error("Không thể xóa tài khoản do vướng ràng buộc dữ liệu");
        }
      },
    });
  };

  // --- Logic Lọc phía Client ---
  const filteredUsers = usersList.filter((user) => {
    const matchSearch = user.username
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    const matchRole = filterRole ? user.role === filterRole : true;
    return matchSearch && matchRole;
  });

  // --- Cấu trúc cột bảng dữ liệu ---
  const columns = [
    {
      title: "Mã số",
      dataIndex: "id",
      key: "id",
      width: 90,
      render: (id) => <Text style={styles.codeText}>#{id}</Text>,
    },
    {
      title: "Tên tài khoản",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Text strong style={{ color: "#1e293b" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Vai trò / Quyền",
      dataIndex: "role",
      key: "role",
      width: 250,
      render: (role, record) => (
        <Select
          value={role}
          size="small"
          bordered={false}
          style={{
            backgroundColor: ROLE_CONFIG[role]?.bg || "#f1f5f9",
            color: ROLE_CONFIG[role]?.color || "#64748b",
            borderRadius: 6,
            padding: "2px 4px",
            fontWeight: 600,
            width: "100%",
          }}
          onChange={(val) => handleChangeRole(record.id, val)}
        >
          {Object.entries(ROLE_CONFIG).map(([value, item]) => (
            <Option key={value} value={value}>
              {item.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 150,
      render: (isActive) => (
        <Tag
          color={isActive ? "success" : "error"}
          bordered={false}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          {isActive ? "● Đang hoạt động" : "○ Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác quản trị",
      key: "action",
      align: "center",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Reset mật khẩu">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:key-linear"
                  style={{ color: "#37B0C3", fontSize: "16px" }}
                />
              }
              onClick={() => handleResetPassword(record.id)}
              style={styles.actionBtn}
            />
          </Tooltip>

          {record.is_active ? (
            <Tooltip title="Khóa tài khoản">
              <Button
                type="text"
                shape="circle"
                icon={
                  <Icon
                    icon="solar:lock-linear"
                    style={{ color: "#f59e0b", fontSize: "16px" }}
                  />
                }
                onClick={() => handleLockUser(record.id)}
                style={styles.actionBtn}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Mở khóa tài khoản">
              <Button
                type="text"
                shape="circle"
                icon={
                  <Icon
                    icon="solar:lock-keyhole-minimalistic-unlocked-linear"
                    style={{ color: "#22c55e", fontSize: "16px" }}
                  />
                }
                onClick={() => handleUnlockUser(record.id)}
                style={styles.actionBtn}
              />
            </Tooltip>
          )}

          <Tooltip title="Xóa tài khoản">
            <Button
              type="text"
              shape="circle"
              danger
              icon={
                <Icon
                  icon="solar:trash-bin-trash-linear"
                  style={{ fontSize: "16px" }}
                />
              }
              onClick={() => handleDeleteUser(record.id)}
              style={styles.actionBtn}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="Đang tải dữ liệu hồ sơ bảo mật..." />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* TIÊU ĐỀ TRANG CHỦ BIÊN BẢN */}
      <div style={{ marginBottom: 24 }}>
        <Title
          level={3}
          style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
        >
          Hồ sơ cá nhân & Bảo mật
        </Title>
        <Text type="secondary">
          Quản lý cấu trúc tài khoản cá nhân, đổi mã bảo mật và phân phối dữ
          liệu người dùng
        </Text>
      </div>

      <Row gutter={[20, 20]}>
        {/* KHU VỰC 1: THÔNG TIN TÀI KHOẢN CÁ NHÂN */}
        <Col xs={24} md={8}>
          <Card
            title={
              <Space size={6} style={{ color: "#37B0C3", fontWeight: 600 }}>
                <Icon
                  icon="solar:user-id-linear"
                  style={{ fontSize: "18px" }}
                />
                <span>Thông tin tài khoản</span>
              </Space>
            }
            bordered={false}
            style={styles.profileCard}
          >
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <Text type="secondary">Mã tài khoản:</Text>
                <Text strong style={{ color: "#334155" }}>
                  #{profile?.id}
                </Text>
              </div>
              <div style={styles.infoRowDivider} />
              <div style={styles.infoItem}>
                <Text type="secondary">Tên đăng nhập:</Text>
                <Text strong style={{ color: "#334155" }}>
                  {profile?.username}
                </Text>
              </div>
              <div style={styles.infoRowDivider} />
              <div style={styles.infoItem}>
                <Text type="secondary">Vai trò hệ thống:</Text>
                <Tag
                  color={profile?.role === "admin" ? "red" : "green"}
                  bordered={false}
                  style={{ margin: 0, fontWeight: 600, borderRadius: 4 }}
                >
                  {profile?.role?.toUpperCase()}
                </Tag>
              </div>
              {profile?.teacher_id && (
                <>
                  <div style={styles.infoRowDivider} />
                  <div style={styles.infoItem}>
                    <Text type="secondary">Mã định danh GV:</Text>
                    <Text
                      strong
                      style={{ color: "#37B0C3", fontFamily: "monospace" }}
                    >
                      {profile?.teacher_id}
                    </Text>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>

        {/* KHU VỰC 2: FORM ĐỔI MẬT KHẨU AN TOÀN BẢO MẬT */}
        <Col xs={24} md={16}>
          <Card
            title={
              <Space size={6} style={{ color: "#37B0C3", fontWeight: 600 }}>
                <Icon
                  icon="solar:lock-password-linear"
                  style={{ fontSize: "18px" }}
                />
                <span>Thiết lập đổi mật khẩu</span>
              </Space>
            }
            bordered={false}
            style={styles.profileCard}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={submitChangePassword}
              requiredMark={false}
              size="large"
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <Text style={styles.fieldLabel}>Mật khẩu hiện tại</Text>
                    }
                    name="oldPassword"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                    ]}
                  >
                    <Input.Password
                      prefix={
                        <Icon
                          icon="solar:lock-linear"
                          style={{ color: "#bfbfbf" }}
                        />
                      }
                      placeholder="Nhập mật khẩu hiện tại để xác thực"
                      variant="filled"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<Text style={styles.fieldLabel}>Mật khẩu mới</Text>}
                    name="newPassword"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu mới!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={
                        <Icon
                          icon="solar:key-linear"
                          style={{ color: "#bfbfbf" }}
                        />
                      }
                      placeholder="Tối thiểu 6 ký tự"
                      variant="filled"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <Text style={styles.fieldLabel}>
                        Xác nhận mật khẩu mới
                      </Text>
                    }
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng xác nhận mật khẩu mới!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              "Mật khẩu mới trùng khớp không chính xác!",
                            ),
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={
                        <Icon
                          icon="solar:check-circle-linear"
                          style={{ color: "#bfbfbf" }}
                        />
                      }
                      placeholder="Nhập lại mật khẩu mới"
                      variant="filled"
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: "right", marginTop: 8 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={
                    <Icon
                      icon="solar:diskette-linear"
                      style={{ verticalAlign: "middle" }}
                    />
                  }
                  style={styles.submitBtn}
                >
                  Cập nhật thay đổi mã bảo mật
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* KHU VỰC 3: BẢNG ĐIỀU KHIỂN QUẢN TRỊ USER (CHỈ HIỂN THỊ VỚI ADMIN) */}
        {profile?.role === "admin" && (
          <Col span={24}>
            <Card
              title={
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ width: "100%" }}
                >
                  <Col>
                    <Space size={8}>
                      <div
                        style={{
                          ...styles.iconHeadingBox,
                          backgroundColor: "#fff5f5",
                        }}
                      >
                        <Icon
                          icon="solar:shield-warning-bold-duotone"
                          style={{ color: "#ef4444", fontSize: "18px" }}
                        />
                      </div>
                      <span
                        style={{
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: "15px",
                        }}
                      >
                        Bảng điều khiển quản trị tài khoản (Users)
                      </span>
                    </Space>
                  </Col>
                  {/* 🌟 NÚT TẠO TÀI KHOẢN MỚI */}
                  <Col>
                    <Button
                      type="primary"
                      icon={
                        <Icon
                          icon="solar:user-plus-bold-duotone"
                          style={{ fontSize: "18px" }}
                        />
                      }
                      onClick={() => {
                        registerForm.resetFields();
                        setIsRegisterModalOpen(true);
                      }}
                      style={{
                        backgroundColor: "#37B0C3",
                        borderColor: "#37B0C3",
                        borderRadius: 8,
                        fontWeight: 600,
                      }}
                    >
                      Thêm tài khoản mới
                    </Button>
                  </Col>
                </Row>
              }
              bordered={false}
              style={styles.tableCard}
            >
              {/* THANH BỘ LỌC TÌM KIẾM MỚI NÂNG CAO */}
              <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} md={8}>
                  <Text strong style={styles.filterLabel}>
                    Tìm kiếm tên tài khoản
                  </Text>
                  <Input
                    placeholder="Nhập username cần lọc..."
                    prefix={
                      <Icon
                        icon="solar:magnifer-linear"
                        style={{ color: "#bfbfbf", fontSize: "18px" }}
                      />
                    }
                    size="large"
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Text strong style={styles.filterLabel}>
                    Lọc theo vai trò quyền
                  </Text>
                  <Select
                    placeholder="Tất cả quyền hạn"
                    size="large"
                    style={{ width: "100%" }}
                    allowClear
                    value={filterRole}
                    onChange={(val) => setFilterRole(val)}
                    dropdownStyle={{ borderRadius: 8 }}
                  >
                    {Object.entries(ROLE_CONFIG).map(([value, item]) => (
                      <Option key={value} value={value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              <Table
                dataSource={filteredUsers}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                scroll={{ x: 800 }}
              />
            </Card>
          </Col>
        )}
      </Row>

      {/* 🌟 MODAL: THÊM TÀI KHOẢN MỚI VIA authApi.register */}
      <Modal
        title={
          <Space size={8}>
            <div
              style={{ ...styles.iconHeadingBox, backgroundColor: "#eefafc" }}
            >
              <Icon
                icon="solar:user-plus-bold-duotone"
                style={{ color: "#37B0C3", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontSize: 18, color: "#0f172a" }}
            >
              Tạo tài khoản người dùng mới
            </Title>
          </Space>
        }
        open={isRegisterModalOpen}
        onCancel={() => setIsRegisterModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width={560}
      >
        <Divider style={{ marginTop: 10, marginBottom: 20 }} />
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={handleRegisterUser}
          initialValues={{ role: "student", is_active: 1 }}
          size="large"
        >
          <Form.Item
            label={
              <Text strong style={styles.fieldLabel}>
                Tên tài khoản (Username)
              </Text>
            }
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Mật khẩu tối thiểu 3 ký tự!" },
            ]}
          >
            <Input
              prefix={
                <Icon icon="solar:user-linear" style={{ color: "#94a3b8" }} />
              }
              placeholder="Nhập tên đăng nhập (VD: gv_nguyenvana)"
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Text strong style={styles.fieldLabel}>
                Mật khẩu (Password)
              </Text>
            }
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={
                <Icon
                  icon="solar:lock-password-linear"
                  style={{ color: "#94a3b8" }}
                />
              }
              placeholder="••••••••"
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Vai trò hệ thống
                  </Text>
                }
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select variant="filled" dropdownStyle={{ borderRadius: 8 }}>
                  {Object.entries(ROLE_CONFIG).map(([value, item]) => (
                    <Option key={value} value={value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Trạng thái tài khoản
                  </Text>
                }
                name="is_active"
              >
                <Select variant="filled" dropdownStyle={{ borderRadius: 8 }}>
                  <Option value={1}>Hoạt động (Active)</Option>
                  <Option value={0}>Khóa (Disabled)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Mã Giáo viên (ID liên kết)
                  </Text>
                }
                name="teacher_id"
              >
                <Input
                  type="number"
                  placeholder="Để trống nếu không phải GV"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Mã Học sinh (ID liên kết)
                  </Text>
                }
                name="student_id"
              >
                <Input
                  type="number"
                  placeholder="Để trống nếu không phải HS"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            style={{ textAlign: "right", marginBottom: 0, marginTop: 20 }}
          >
            <Space size="medium">
              <Button
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ borderRadius: 8 }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submittingRegister}
                style={{
                  backgroundColor: "#37B0C3",
                  borderColor: "#37B0C3",
                  borderRadius: 8,
                }}
              >
                Tạo tài khoản
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const styles = {
  container: { padding: "4px" },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  profileCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    minHeight: "260px",
  },
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  filterLabel: {
    display: "block",
    marginBottom: 8,
    color: "#475569",
    fontSize: "13px",
  },
  fieldLabel: {
    fontSize: "13px",
    color: "#475569",
    fontWeight: 500,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    marginTop: "8px",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },
  infoRowDivider: {
    borderBottom: "1px dashed #f1f5f9",
    width: "100%",
  },
  codeText: {
    fontWeight: 700,
    color: "#475569",
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f1f5f9",
    padding: "2px 6px",
    borderRadius: 4,
  },
  submitBtn: {
    borderRadius: 8,
    fontWeight: 600,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  iconHeadingBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
  },
};

export default AdminProfile;
