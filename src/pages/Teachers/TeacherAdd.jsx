import React, { useState } from "react";
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
  Typography,
  Divider,
} from "antd";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import teacherApi from "../../api/teacherApi";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

function TeacherAdd() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...values,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
        hire_date: values.hire_date
          ? values.hire_date.format("YYYY-MM-DD")
          : null,
      };

      await teacherApi.create(payload);
      message.success("Thêm giáo viên thành công");
      navigate("/admin/teachers");
    } catch (error) {
      console.log(error);
      message.error(
        error?.response?.data?.message || "Thêm giáo viên thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "4px" }}>
      <Card
        bordered={false}
        style={styles.formCard}
        title={
          <Space size={8}>
            <div style={styles.iconHeadingBox}>
              <Icon
                icon="solar:user-plus-rounded-linear"
                style={{ color: "#37B0C3", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}
            >
              Thêm giáo viên mới
            </Title>
          </Space>
        }
        extra={
          <Button
            icon={
              <Icon
                icon="solar:alt-arrow-left-linear"
                style={{ verticalAlign: "middle", marginRight: "4px" }}
              />
            }
            onClick={() => navigate("/admin/teachers")}
            style={styles.backBtn}
          >
            Quay lại
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Mã giáo viên
                  </Text>
                }
                name="teacher_code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã giáo viên!" },
                ]}
              >
                <Input
                  placeholder="VD: GV001"
                  variant="filled"
                  style={styles.inputRadius}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Họ và tên
                  </Text>
                }
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
              >
                <Input
                  placeholder="Nhập đầy đủ họ tên"
                  variant="filled"
                  style={styles.inputRadius}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Giới tính
                  </Text>
                }
                name="gender"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select
                  placeholder="Chọn giới tính"
                  variant="filled"
                  style={styles.inputRadius}
                >
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Ngày sinh
                  </Text>
                }
                name="dob"
              >
                <DatePicker
                  style={{ width: "100%", borderRadius: 8 }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  maxDate={dayjs()}
                  variant="filled"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Số điện thoại
                  </Text>
                }
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  variant="filled"
                  style={styles.inputRadius}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Địa chỉ Email
                  </Text>
                }
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "Địa chỉ định dạng Email không hợp lệ!",
                  },
                ]}
              >
                <Input
                  placeholder="example@school.edu.vn"
                  variant="filled"
                  style={styles.inputRadius}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Địa chỉ thường trú
                  </Text>
                }
                name="address"
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập chi tiết nơi ở hiện tại..."
                  variant="filled"
                  style={styles.inputRadius}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Chuyên môn giảng dạy
                  </Text>
                }
                name="specialization"
              >
                <Input
                  placeholder="Ví dụ: Toán học, Văn học..."
                  variant="filled"
                  style={styles.inputRadius}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Ngày tuyển dụng
                  </Text>
                }
                name="hire_date"
              >
                <DatePicker
                  style={{ width: "100%", borderRadius: 8 }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày vào làm"
                  variant="filled"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text strong style={styles.fieldLabel}>
                    Trạng thái công tác
                  </Text>
                }
                name="status"
                initialValue={1}
              >
                <Select variant="filled" style={styles.inputRadius}>
                  <Option value={1}>Đang công tác</Option>
                  <Option value={0}>Nghỉ việc</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "24px 0" }} />

          <Space size="medium">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={
                <Icon
                  icon="solar:diskette-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              style={styles.saveBtn}
            >
              Lưu thông tin giáo viên
            </Button>
            <Button
              onClick={() => form.resetFields()}
              icon={
                <Icon
                  icon="solar:restart-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              style={styles.resetBtn}
            >
              Làm mới Form
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

// HỆ THỐNG GIAO DIỆN PHẲNG ĐỒNG BỘ LAYOUT QUẢN TRỊ
const styles = {
  formCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  iconHeadingBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#eefafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    borderRadius: 8,
    color: "#64748b",
    fontWeight: 500,
    border: "1px solid #e2e8f0",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  fieldLabel: {
    fontSize: "13px",
    color: "#475569",
  },
  inputRadius: {
    borderRadius: "8px",
  },
  saveBtn: {
    borderRadius: 8,
    fontWeight: 600,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  resetBtn: {
    borderRadius: 8,
    color: "#64748b",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default TeacherAdd;
