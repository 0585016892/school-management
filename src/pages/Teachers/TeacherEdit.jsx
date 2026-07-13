import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  message,
  Space,
  Spin,
  Typography,
  Divider,
} from "antd";
import { Icon } from "@iconify/react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import teacherApi from "../../api/teacherApi";

const { TextArea } = Input;
const { Title, Text } = Typography;

function TeacherEdit() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const loadTeacher = async () => {
    try {
      const res = await teacherApi.getById(id);
      form.setFieldsValue({
        teacher_code: res.teacher_code,
        full_name: res.full_name,
        gender: res.gender,
        birthday: res.birthday ? dayjs(res.birthday) : null,
        phone: res.phone,
        email: res.email,
        address: res.address,
      });
    } catch (error) {
      console.log(error);
      message.error("Không tải được dữ liệu giáo viên");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadTeacher();
  }, [id]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        birthday: values.birthday?.format("YYYY-MM-DD") || null,
      };
      await teacherApi.update(id, payload);
      message.success("Cập nhật thông tin thành công");
      navigate("/admin/teachers");
    } catch (error) {
      console.log(error);
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="Đang tải hồ sơ giáo viên..." />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header điều hướng bên ngoài Card */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Button
            type="text"
            icon={
              <Icon
                icon="solar:alt-arrow-left-linear"
                style={{ verticalAlign: "middle" }}
              />
            }
            onClick={() => navigate("/admin/teachers")}
            style={styles.backBtn}
          >
            Quay lại danh sách
          </Button>
          <Title
            level={3}
            style={{ margin: "8px 0 0 0", color: "#0f172a", fontWeight: 700 }}
          >
            Chỉnh sửa Hồ sơ Giáo viên
          </Title>
        </Col>
      </Row>

      {/* Card Form chính */}
      <Card
        bordered={false}
        style={styles.formCard}
        styles={{ body: { padding: "32px 40px" } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark="optional"
        >
          {/* PHẦN 1: THÔNG TIN LÝ LỊCH */}
          <div style={styles.sectionTitle}>
            <div
              style={{ ...styles.iconHeadingBox, backgroundColor: "#eefafc" }}
            >
              <Icon icon="solar:user-id-linear" style={{ color: "#37B0C3" }} />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
              Thông tin cơ bản
            </Text>
          </div>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={styles.fieldLabel}>Mã giáo viên</Text>}
                name="teacher_code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã giáo viên" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: GV001"
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={styles.fieldLabel}>Họ và tên</Text>}
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input
                  placeholder="Nhập đầy đủ họ tên"
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={styles.fieldLabel}>Giới tính</Text>}
                name="gender"
              >
                <Select
                  variant="filled"
                  placeholder="Chọn giới tính"
                  options={[
                    { value: "Nam", label: "Nam" },
                    { value: "Nữ", label: "Nữ" },
                    { value: "Khác", label: "Khác" },
                  ]}
                  style={styles.input}
                  dropdownStyle={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={styles.fieldLabel}>Ngày sinh</Text>}
                name="birthday"
              >
                <DatePicker
                  style={{ width: "100%", ...styles.input }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  variant="filled"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "24px 0" }} />

          {/* PHẦN 2: THÔNG TIN LIÊN HỆ */}
          <div style={styles.sectionTitle}>
            <div
              style={{ ...styles.iconHeadingBox, backgroundColor: "#fff7ed" }}
            >
              <Icon
                icon="solar:phone-calling-linear"
                style={{ color: "#f97316" }}
              />
            </div>
            <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
              Thông tin liên hệ
            </Text>
          </div>
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={styles.fieldLabel}>Số điện thoại</Text>}
                name="phone"
                rules={[
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải gồm 10 chữ số",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại di động"
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<Text style={styles.fieldLabel}>Địa chỉ Email</Text>}
                name="email"
                rules={[
                  { type: "email", message: "Định dạng Email không hợp lệ" },
                ]}
              >
                <Input
                  placeholder="viethan@school.edu.vn"
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <Text style={styles.fieldLabel}>Địa chỉ thường trú</Text>
                }
                name="address"
              >
                <TextArea
                  rows={3}
                  placeholder="Số nhà, tên đường, xã/phường, quận/huyện..."
                  variant="filled"
                  style={styles.input}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "32px 0 24px 0" }} />

          {/* HÀNG NÚT BẤM XỬ LÝ */}
          <Row justify="end">
            <Col>
              <Space size="medium">
                <Button
                  onClick={() => form.resetFields()}
                  icon={
                    <Icon
                      icon="solar:restart-linear"
                      style={{ verticalAlign: "middle" }}
                    />
                  }
                  style={styles.cancelBtn}
                >
                  Hủy thay đổi
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={
                    <Icon
                      icon="solar:diskette-linear"
                      style={{ verticalAlign: "middle" }}
                    />
                  }
                  loading={loading}
                  style={styles.submitBtn}
                >
                  Lưu cập nhật
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

// HỆ THỐNG GIAO DIỆN PHẲNG ĐỒNG BỘ LAYOUT QUẢN TRỊ MỚI
const styles = {
  container: {
    padding: "4px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  backBtn: {
    paddingLeft: 0,
    color: "#64748b",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  formCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: 24,
  },
  iconHeadingBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
  },
  fieldLabel: {
    fontSize: "13px",
    color: "#475569",
    fontWeight: 500,
  },
  input: {
    borderRadius: 8,
  },
  submitBtn: {
    borderRadius: 8,
    fontWeight: 600,
    padding: "0 24px",
    height: 40,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  cancelBtn: {
    borderRadius: 8,
    height: 40,
    color: "#64748b",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default TeacherEdit;
