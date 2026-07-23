import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Typography,
  Tooltip,
  ConfigProvider,
  Spin,
  Empty,
  Drawer,
  Descriptions,
  Avatar,
} from "antd";
import { Icon } from "@iconify/react";
import parentApi from "../../../api/parentApi";
import CanRole from "../../../components/CanRole"; // Import Component phân quyền
import useHasRole from "../../../hooks/useHasRole"; // Import Hook kiểm tra quyền
import { ROLES } from "../../../constants/roles"; // Import danh sách Role

const { Title, Text } = Typography;
const { Search } = Input;

// Tông màu chủ đạo: #37b0c3
const PRIMARY_COLOR = "#37b0c3";

export default function ParentManagementPage() {
  const { hasRole } = useHasRole(); // Custom hook kiểm tra role hiện tại

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal CRUD Parent
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // State Drawer Chi tiết Phụ huynh & Quản lý Học sinh liên kết
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // State Thêm con/học sinh mới vào Phụ huynh
  const [studentIdInput, setStudentIdInput] = useState("");
  const [relationshipInput, setRelationshipInput] = useState("Cha");
  const [addingStudent, setAddingStudent] = useState(false);

  // Fetch danh sách phụ huynh
  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await parentApi.getAll({ search: searchTerm });
      if (res.data && res.data.success) {
        setParents(res.data.data);
      } else if (Array.isArray(res.data)) {
        setParents(res.data);
      }
    } catch (err) {
      message.error("Không thể tải danh sách phụ huynh!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Mở modal Thêm/Sửa
  const handleOpenModal = (record = null) => {
    setEditingParent(record);
    if (record) {
      form.setFieldsValue({
        full_name: record.full_name,
        phone: record.phone,
        email: record.email,
        gender: record.gender || "male",
        occupation: record.occupation,
        address: record.address,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ gender: "male" });
    }
    setIsModalOpen(true);
  };

  // Submit Form Thêm/Sửa
  const handleSaveParent = async (values) => {
    setSubmitting(true);
    try {
      if (editingParent) {
        await parentApi.update(editingParent.id, values);
        message.success("Cập nhật phụ huynh thành công!");
      } else {
        await parentApi.create(values);
        message.success("Thêm phụ huynh thành công!");
      }
      setIsModalOpen(false);
      fetchParents();
    } catch (err) {
      message.error("Đã xảy ra lỗi khi lưu!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa Phụ huynh
  const handleDeleteParent = async (id) => {
    try {
      await parentApi.delete(id);
      message.success("Đã xóa phụ huynh!");
      fetchParents();
    } catch (err) {
      message.error("Không thể xóa phụ huynh này!");
      console.error(err);
    }
  };

  // Xem chi tiết Phụ huynh & Danh sách học sinh
  const handleOpenDetail = async (record) => {
    setIsDrawerOpen(true);
    setLoadingDetail(true);
    try {
      const res = await parentApi.getById(record.id);
      setSelectedParent(res.data);
    } catch (err) {
      message.error("Không thể tải thông tin chi tiết!");
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Thêm học sinh liên kết
  const handleAddStudent = async () => {
    if (!studentIdInput) {
      message.warning("Vui lòng nhập ID/Mã học sinh!");
      return;
    }
    setAddingStudent(true);
    try {
      await parentApi.addStudent(selectedParent.id, {
        student_id: studentIdInput,
        relationship: relationshipInput,
      });
      message.success("Đã liên kết học sinh thành công!");
      setStudentIdInput("");
      handleOpenDetail(selectedParent);
      fetchParents();
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể gán học sinh này!",
      );
      console.error(err);
    } finally {
      setAddingStudent(false);
    }
  };

  // Gỡ liên kết học sinh
  const handleRemoveStudent = async (studentId) => {
    try {
      await parentApi.removeStudent(selectedParent.id, studentId);
      message.success("Đã gỡ liên kết học sinh!");
      handleOpenDetail(selectedParent);
      fetchParents();
    } catch (err) {
      message.error("Lỗi khi gỡ học sinh!");
      console.error(err);
    }
  };

  // Cột cho bảng danh sách Phụ huynh chính
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: PRIMARY_COLOR }}>
            {text ? text.charAt(0).toUpperCase() : "P"}
          </Avatar>
          <div>
            <Text strong style={{ display: "block" }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.occupation || "Chưa cập nhật nghề nghiệp"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <Tag color="cyan" style={{ fontSize: "13px", padding: "2px 8px" }}>
          <Icon
            icon="solar:phone-bold-duotone"
            style={{ marginRight: 4, verticalAlign: "middle" }}
          />
          {phone}
        </Tag>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || <Text type="secondary">N/A</Text>,
    },
    {
      title: "Số con liên kết",
      dataIndex: "children_count",
      key: "children_count",
      align: "center",
      render: (count) => (
        <Tag color="blue" style={{ borderRadius: 12, fontWeight: 600 }}>
          <Icon
            icon="solar:users-group-two-rounded-bold-duotone"
            style={{ marginRight: 4, verticalAlign: "middle" }}
          />
          {count || 0} con
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space>
          {/* Mọi role xem được trang đều có quyền Xem Chi tiết */}
          <Tooltip title="Chi tiết & Học sinh">
            <Button
              type="text"
              icon={
                <Icon
                  icon="solar:eye-bold-duotone"
                  width={18}
                  style={{ color: PRIMARY_COLOR }}
                />
              }
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>

          {/* Phân quyền Chỉnh sửa: Admin, Hiệu trưởng, Phó hiệu trưởng */}
          <CanRole
            allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL]}
          >
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={
                  <Icon
                    icon="solar:pen-bold-duotone"
                    width={18}
                    style={{ color: "#64748b" }}
                  />
                }
                onClick={() => handleOpenModal(record)}
              />
            </Tooltip>
          </CanRole>

          {/* Phân quyền Xóa: Chỉ Admin & Hiệu trưởng */}
          <CanRole allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
            <Tooltip title="Xóa">
              <Popconfirm
                title="Xóa phụ huynh này?"
                description="Hành động này không thể hoàn tác."
                onConfirm={() => handleDeleteParent(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <Icon
                      icon="solar:trash-bin-trash-bold-duotone"
                      width={18}
                    />
                  }
                />
              </Popconfirm>
            </Tooltip>
          </CanRole>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: PRIMARY_COLOR,
          borderRadius: 8,
        },
      }}
    >
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        {/* Header Bar */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0, color: "#1e293b" }}>
              Quản lý Phụ huynh
            </Title>
            <Text type="secondary">
              Quản lý thông tin liên lạc và mối liên kết giữa phụ huynh và học
              sinh.
            </Text>
          </Col>
          <Col>
            {/* Phân quyền nút Thêm mới: Chỉ Admin và Hiệu Trưởng */}
            <CanRole allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
              <Button
                type="primary"
                size="large"
                icon={<Icon icon="solar:user-plus-bold-duotone" width={20} />}
                onClick={() => handleOpenModal()}
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  borderColor: PRIMARY_COLOR,
                }}
              >
                Thêm phụ huynh mới
              </Button>
            </CanRole>
          </Col>
        </Row>

        {/* Filter Box */}
        <Card
          bordered={false}
          styles={{ body: { padding: "16px" } }}
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Search
                placeholder="Tìm theo tên, số điện thoại, email..."
                allowClear
                size="large"
                prefix={
                  <Icon
                    icon="solar:magnifer-linear"
                    style={{ color: "#94a3b8" }}
                  />
                }
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
        </Card>

        {/* Table Content */}
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <Table
            columns={columns}
            dataSource={parents}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: true }}
            locale={{
              emptyText: <Empty description="Không tìm thấy phụ huynh nào" />,
            }}
          />
        </Card>

        {/* --- MODAL: Thêm / Sửa Phụ huynh --- */}
        <Modal
          title={
            editingParent ? "Cập nhật thông tin Phụ huynh" : "Tạo mới Phụ huynh"
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveParent}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="full_name"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input placeholder="Nguyễn Văn A..." size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
                >
                  <Input placeholder="0987654321..." size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label="Giới tính">
                  <Select size="large">
                    <Select.Option value="male">Nam</Select.Option>
                    <Select.Option value="female">Nữ</Select.Option>
                    <Select.Option value="other">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="email" label="Email">
              <Input placeholder="example@email.com..." size="large" />
            </Form.Item>

            <Form.Item name="occupation" label="Nghề nghiệp">
              <Input
                placeholder="Kỹ sư, Giáo viên, Kinh doanh..."
                size="large"
              />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ cư trú">
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhà..." />
            </Form.Item>

            <Row justify="end" style={{ marginTop: 24 }}>
              <Space>
                <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                  }}
                >
                  {editingParent ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Row>
          </Form>
        </Modal>

        {/* --- DRAWER: Chi tiết & Quản lý Học sinh liên kết --- */}
        <Drawer
          title="Thông tin chi tiết Phụ huynh"
          placement="right"
          width={500}
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
          destroyOnClose
        >
          {loadingDetail ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
            </div>
          ) : selectedParent ? (
            <Space direction="vertical" style={{ width: "100%", gap: 24 }}>
              {/* Profile Info */}
              <Descriptions
                title="Thông tin cá nhân"
                column={1}
                bordered
                size="small"
              >
                <Descriptions.Item label="Họ tên">
                  {selectedParent.full_name}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {selectedParent.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedParent.email || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Nghề nghiệp">
                  {selectedParent.occupation || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {selectedParent.address || "N/A"}
                </Descriptions.Item>
              </Descriptions>

              {/* Form gán thêm Học sinh/Con (Chỉ BGH/Admin có quyền liên kết) */}
              <CanRole
                allowRoles={[
                  ROLES.ADMIN,
                  ROLES.PRINCIPAL,
                  ROLES.VICE_PRINCIPAL,
                ]}
              >
                <Card
                  size="small"
                  title={
                    <Text
                      strong
                      style={{ fontSize: "14px", color: PRIMARY_COLOR }}
                    >
                      <Icon
                        icon="solar:user-plus-bold-duotone"
                        style={{ marginRight: 6, verticalAlign: "middle" }}
                      />
                      Gán thêm con / học sinh
                    </Text>
                  }
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  <Row gutter={8}>
                    <Col span={14}>
                      <Input
                        placeholder="ID hoặc Mã học sinh"
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                      />
                    </Col>
                    <Col span={10}>
                      <Select
                        style={{ width: "100%" }}
                        value={relationshipInput}
                        onChange={(val) => setRelationshipInput(val)}
                      >
                        <Select.Option value="Cha">Cha</Select.Option>
                        <Select.Option value="Mẹ">Mẹ</Select.Option>
                        <Select.Option value="Người giám hộ">
                          Giám hộ
                        </Select.Option>
                      </Select>
                    </Col>
                  </Row>
                  <Button
                    type="primary"
                    block
                    style={{
                      marginTop: 8,
                      backgroundColor: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                    }}
                    loading={addingStudent}
                    onClick={handleAddStudent}
                  >
                    Xác nhận liên kết
                  </Button>
                </Card>
              </CanRole>

              {/* Danh sách các con hiện tại */}
              <div>
                <Title level={5} style={{ marginBottom: 12 }}>
                  Danh sách con / học sinh liên kết (
                  {selectedParent.children?.length || 0})
                </Title>

                {selectedParent.children &&
                selectedParent.children.length > 0 ? (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {selectedParent.children.map((child) => (
                      <Card
                        key={child.id}
                        size="small"
                        style={{ borderRadius: 8 }}
                      >
                        <Row justify="space-between" align="middle">
                          <Col>
                            <Text strong style={{ display: "block" }}>
                              {child.full_name}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Mã HS: {child.student_code || child.id} | Quan hệ:{" "}
                              <Tag color="cyan">
                                {child.relationship || "Con"}
                              </Tag>
                            </Text>
                          </Col>
                          <Col>
                            {/* Nút Gỡ liên kết con: Chỉ BGH/Admin có quyền */}
                            <CanRole
                              allowRoles={[
                                ROLES.ADMIN,
                                ROLES.PRINCIPAL,
                                ROLES.VICE_PRINCIPAL,
                              ]}
                            >
                              <Popconfirm
                                title="Gỡ học sinh này khỏi phụ huynh?"
                                onConfirm={() => handleRemoveStudent(child.id)}
                                okText="Gỡ"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  type="text"
                                  danger
                                  icon={
                                    <Icon
                                      icon="solar:user-minus-bold-duotone"
                                      width={18}
                                    />
                                  }
                                />
                              </Popconfirm>
                            </CanRole>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa liên kết học sinh nào"
                  />
                )}
              </div>
            </Space>
          ) : null}
        </Drawer>
      </div>
    </ConfigProvider>
  );
}
