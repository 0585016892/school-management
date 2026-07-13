import React, { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { Icon } from "@iconify/react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi"; // Đảm bảo API auth của bạn có hàm xử lý tương ứng

const { Title, Text } = Typography;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // 🌟 State quản lý chế độ hiển thị: "login" hoặc "forgot"
  const [mode, setMode] = useState("login");
  const [forgotLoading, setForgotLoading] = useState(false);

  // --- XỬ LÝ ĐĂNG NHẬP ---
  const onFinishLogin = async (values) => {
    try {
      const user = await login(values);

      if (user && Number(user.is_active) === 0) {
        message.error(
          "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa bởi quản trị viên!",
        );
        return;
      }

      message.success("Đăng nhập thành công");

      const role = (user?.role || "").toLowerCase();
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "teacher") {
        if (user?.teacher_id) {
          navigate("/teacher");
        } else {
          message.warning(
            "Tài khoản giáo viên chưa liên kết với hồ sơ cán bộ!",
          );
          navigate("/profile-setup");
        }
      } else if (role === "student") {
        if (user?.student_id) {
          navigate("/student/schedules");
        } else {
          message.warning(
            "Tài khoản học sinh chưa hoàn thành định danh hồ sơ!",
          );
        }
      } else {
        navigate("/");
      }
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          "Tài khoản hoặc mật khẩu không chính xác",
      );
    }
  };

  // --- 🌟 XỬ LÝ GỬI YÊU CẦU QUÊN MẬT KHẨU ---
  const onFinishForgot = async (values) => {
    setForgotLoading(true);
    try {
      // Gọi lên API xử lý quên mật khẩu của bạn (truyền username hoặc email)
      if (authApi.forgotPassword) {
        await authApi.forgotPassword({ email: values.forgot_email });
      }

      message.success(
        "Yêu cầu thành công! Vui lòng kiểm tra email để nhận mật khẩu mới hoặc liên hệ Admin.",
      );
      setMode("login"); // Quay lại màn hình đăng nhập
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
          "Không thể gửi yêu cầu. Tài khoản không tồn tại!",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} styles={{ body: { padding: "48px 40px" } }}>
        {/* ================= CHẾ ĐỘ 1: FORM ĐĂNG NHẬP MẶC ĐỊNH ================= */}
        {mode === "login" ? (
          <>
            <div style={styles.header}>
              <div style={styles.logoBg}>
                <Icon
                  icon="solar:globus-bold"
                  style={{ color: "#fff", fontSize: "28px" }}
                />
              </div>
              <Title level={3} style={styles.title}>
                EDU SYSTEM PORTAL
              </Title>
              <Text type="secondary" style={styles.subtitle}>
                Hệ thống Quản lý Học tập & Giảng dạy tích hợp
              </Text>
            </div>

            <Form
              layout="vertical"
              onFinish={onFinishLogin}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label={
                  <Text strong style={styles.label}>
                    Tài khoản
                  </Text>
                }
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tài khoản!" },
                ]}
              >
                <Input
                  prefix={
                    <Icon
                      icon="solar:user-rounded-linear"
                      style={{ color: "#94a3b8", fontSize: "20px" }}
                    />
                  }
                  placeholder="Nhập tên tài khoản hoặc email..."
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong style={styles.label}>
                    Mật khẩu
                  </Text>
                }
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={
                    <Icon
                      icon="solar:lock-password-linear"
                      style={{ color: "#94a3b8", fontSize: "20px" }}
                    />
                  }
                  placeholder="••••••••"
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>

              <div style={styles.forgotPassword}>
                <span onClick={() => setMode("forgot")} style={styles.link}>
                  Quên mật khẩu hệ thống?
                </span>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                block
                style={styles.submitBtn}
              >
                Xác nhận đăng nhập
              </Button>
            </Form>
          </>
        ) : (
          /* ================= CHẾ ĐỘ 2: 🌟 FORM QUÊN MẬT KHẨU NÂNG CAO ================= */
          <>
            <div style={styles.header}>
              <div
                style={{
                  ...styles.logoBg,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                  boxShadow: "0 6px 16px rgba(245, 158, 11, 0.25)",
                }}
              >
                <Icon
                  icon="solar:key-bold"
                  style={{ color: "#fff", fontSize: "28px" }}
                />
              </div>
              <Title level={3} style={styles.title}>
                Khôi Phục Mật Khẩu
              </Title>
              <Text type="secondary" style={styles.subtitle}>
                Nhập địa chỉ email đã đăng ký để tìm lại quyền truy cập tài
                khoản
              </Text>
            </div>

            <Form
              layout="vertical"
              onFinish={onFinishForgot}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                label={
                  <Text strong style={styles.label}>
                    Địa chỉ Email khôi phục
                  </Text>
                }
                name="forgot_email"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ email!" },
                  { type: "email", message: "Định dạng email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={
                    <Icon
                      icon="solar:letter-linear"
                      style={{ color: "#94a3b8", fontSize: "20px" }}
                    />
                  }
                  placeholder="Ví dụ: nguyenvan@gmail.com..."
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={forgotLoading}
                style={{
                  ...styles.submitBtn,
                  background: "#f59e0b",
                  borderColor: "#f59e0b",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
                }}
              >
                Gửi yêu cầu khôi phục
              </Button>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <span
                  onClick={() => setMode("login")}
                  style={{ ...styles.link, fontSize: 14 }}
                >
                  <Icon
                    icon="solar:alt-arrow-left-linear"
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  Quay lại đăng nhập
                </span>
              </div>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}

// HỆ THỐNG PHẲNG UI ĐỒNG BỘ ĐỘC QUYỀN TONE MÀU #37B0C3
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #eefafc 100%)",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 16,
    boxShadow: "0 12px 32px rgba(55, 176, 195, 0.08)",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  logoBg: {
    width: 60,
    height: 60,
    background: "linear-gradient(135deg, #37B0C3 0%, #54c5d7 100%)",
    borderRadius: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 16px auto",
    boxShadow: "0 6px 16px rgba(55, 176, 195, 0.25)",
  },
  title: {
    margin: "0 0 6px 0",
    fontWeight: 800,
    letterSpacing: "0.5px",
    color: "#0f172a",
    fontSize: "20px",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    display: "block",
  },
  label: {
    fontSize: 13,
    color: "#475569",
  },
  input: {
    borderRadius: 8,
  },
  forgotPassword: {
    textAlign: "right",
    marginBottom: 24,
  },
  link: {
    fontSize: 13,
    fontWeight: 500,
    color: "#37B0C3",
    cursor: "pointer",
    userSelect: "none",
  },
  submitBtn: {
    height: 44,
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    background: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 14px rgba(55, 176, 195, 0.3)",
    cursor: "pointer",
  },
};

export default Login;
