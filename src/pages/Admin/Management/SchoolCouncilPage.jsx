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
  Badge,
} from "antd";
import { Icon } from "@iconify/react";
import schoolCouncilApi from "../../../api/schoolCouncilApi";

const { Title, Text } = Typography;
const { Search } = Input;

// Tông màu chủ đạo: #37b0c3
const PRIMARY_COLOR = "#37b0c3";

export default function SchoolCouncilPage() {
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  // State Modal CRUD Council
  const [isCouncilModalOpen, setIsCouncilModalOpen] = useState(false);
  const [editingCouncil, setEditingCouncil] = useState(null);
  const [councilForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // State Modal Quản lý Thành viên
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Cấu hình nhãn & màu sắc cho các loại hội đồng
  const typeMap = {
    school_council: {
      label: "Hội đồng trường",
      color: "cyan",
      icon: "solar:shield-bold-duotone",
    },
    parent_council: {
      label: "Ban đại diện PHHS",
      color: "purple",
      icon: "solar:users-group-two-rounded-bold-duotone",
    },
    emulation_council: {
      label: "Hội đồng Thi đua",
      color: "gold",
      icon: "solar:cup-star-bold-duotone",
    },
    discipline_council: {
      label: "Hội đồng Kỷ luật",
      color: "red",
      icon: "solar:hammer-bold-duotone",
    },
  };

  // Fetch danh sách Hội đồng
  const fetchCouncils = async () => {
    setLoading(true);
    try {
      const res = await schoolCouncilApi.getAll();
      if (res.data && res.data.success) {
        setCouncils(res.data.data);
      } else if (Array.isArray(res.data)) {
        setCouncils(res.data);
      }
    } catch (err) {
      message.error("Không thể tải danh sách hội đồng!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouncils();
  }, []);

  // Lọc dữ liệu theo từ khóa và loại
  const filteredCouncils = councils.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chairman_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Mở modal Thêm/Sửa
  const handleOpenCouncilModal = (council = null) => {
    setEditingCouncil(council);
    if (council) {
      councilForm.setFieldsValue({
        name: council.name,
        type: council.type,
        description: council.description,
        chairman_name: council.chairman_name,
        status: council.status || "active",
      });
    } else {
      councilForm.resetFields();
      councilForm.setFieldsValue({
        type: "school_council",
        status: "active",
      });
    }
    setIsCouncilModalOpen(true);
  };

  // Submit Form Thêm/Sửa
  const handleSaveCouncil = async (values) => {
    setSubmitting(true);
    try {
      if (editingCouncil) {
        await schoolCouncilApi.update(editingCouncil.id, values);
        message.success("Cập nhật hội đồng thành công!");
      } else {
        await schoolCouncilApi.create(values);
        message.success("Thêm hội đồng mới thành công!");
      }
      setIsCouncilModalOpen(false);
      fetchCouncils();
    } catch (err) {
      message.error("Đã xảy ra lỗi khi lưu thông tin!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa Hội đồng
  const handleDeleteCouncil = async (id) => {
    try {
      await schoolCouncilApi.delete(id);
      message.success("Đã xóa hội đồng!");
      fetchCouncils();
    } catch (err) {
      message.error("Không thể xóa hội đồng này!");
      console.error(err);
    }
  };

  // Mở Modal Quản lý Thành viên
  const handleOpenMemberModal = async (council) => {
    setSelectedCouncil(council);
    setIsMemberModalOpen(true);
    setSelectedMemberToAdd(null);
    setLoadingMembers(true);
    try {
      const [councilRes, availableRes] = await Promise.all([
        schoolCouncilApi.getById(council.id),
        schoolCouncilApi.getAvailableMembers(),
      ]);

      const detail = councilRes.data?.data || councilRes.data;
      setSelectedCouncil(detail);
      console.log(detail);

      const availList = availableRes.data?.data || availableRes.data || [];
      setAvailableMembers(availList);
      console.log(availList);
    } catch (err) {
      message.error("Lỗi khi tải thông tin thành viên!");
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Thêm thành viên
  const handleAddMember = async () => {
    if (!selectedMemberToAdd) return;

    // Tách id và member_type từ value đã chọn
    const [member_id, member_type] = selectedMemberToAdd.split("|");

    try {
      await schoolCouncilApi.addMember(selectedCouncil.id, {
        member_id: Number(member_id),
        member_type: member_type,
      });
      message.success("Thêm thành viên thành công!");
      setSelectedMemberToAdd(null);
      handleOpenMemberModal(selectedCouncil);
      fetchCouncils();
    } catch (err) {
      message.error("Lỗi khi thêm thành viên!");
      console.error(err);
    }
  };

  // Xóa thành viên
  const handleRemoveMember = async (memberId) => {
    try {
      await schoolCouncilApi.removeMember(selectedCouncil.id, memberId);
      message.success("Đã xóa thành viên khỏi hội đồng!");
      handleOpenMemberModal(selectedCouncil);
      fetchCouncils();
    } catch (err) {
      message.error("Lỗi khi gỡ thành viên!");
      console.error(err);
    }
  };

  // Columns cho bảng thành viên trong Modal
  const memberTableColumns = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => <Text font-semibold>{text}</Text>,
    },
    {
      title: "Vai trò / Email",
      dataIndex: "role",
      key: "role",
      render: (text, record) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {text || record.email || "Thành viên"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Loại bỏ thành viên?"
          description="Bạn có chắc chắn muốn gỡ thành viên này khỏi hội đồng?"
          onConfirm={() => handleRemoveMember(record.id)}
          okText="Có"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<Icon icon="solar:user-minus-bold-duotone" width={18} />}
          />
        </Popconfirm>
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
        {/* Header Page */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0, color: "#1e293b" }}>
              Quản lý Hội đồng
            </Title>
            <Text type="secondary">
              Quản lý danh sách các hội đồng, ban đại diện và thành viên trong
              nhà trường.
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<Icon icon="solar:add-circle-bold-duotone" width={20} />}
              onClick={() => handleOpenCouncilModal()}
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
            >
              Thêm hội đồng mới
            </Button>
          </Col>
        </Row>

        {/* Filter & Search Bar */}
        <Card
          bordered={false}
          bodyStyle={{ padding: "16px" }}
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Search
                placeholder="Tìm kiếm theo tên hội đồng, chủ tịch..."
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
            <Col xs={24} md={8}>
              <Select
                size="large"
                defaultValue="all"
                style={{ width: "100%" }}
                onChange={(value) => setSelectedType(value)}
                options={[
                  { value: "all", label: "Tất cả loại hội đồng" },
                  { value: "school_council", label: "Hội đồng trường" },
                  { value: "parent_council", label: "Ban đại diện PHHS" },
                  {
                    value: "emulation_council",
                    label: "Hội đồng Thi đua - Khen thưởng",
                  },
                  { value: "discipline_council", label: "Hội đồng Kỷ luật" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Content Section */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
          </div>
        ) : filteredCouncils.length === 0 ? (
          <Card
            bordered={false}
            style={{ borderRadius: 12, textAlign: "center", padding: "40px" }}
          >
            <Empty description="Không tìm thấy hội đồng nào phù hợp" />
          </Card>
        ) : (
          <Row gutter={[20, 20]}>
            {filteredCouncils.map((item) => {
              const config = typeMap[item.type] || {
                label: item.type,
                color: "default",
                icon: "solar:shield-bold-duotone",
              };

              return (
                <Col xs={24} sm={12} lg={8} key={item.id}>
                  <Card
                    hoverable
                    bordered={false}
                    style={{
                      borderRadius: 12,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    bodyStyle={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <div>
                      {/* Badge Type & Status */}
                      <Row
                        justify="space-between"
                        align="middle"
                        style={{ marginBottom: 12 }}
                      >
                        <Tag
                          color={config.color}
                          style={{
                            borderRadius: 16,
                            padding: "2px 10px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: 500,
                          }}
                        >
                          <Icon icon={config.icon} width={16} />
                          {config.label}
                        </Tag>
                        <Badge
                          status={
                            item.status === "active" ? "success" : "default"
                          }
                          text={
                            <Text
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              {item.status === "active" ? "Hoạt động" : "Ngừng"}
                            </Text>
                          }
                        />
                      </Row>

                      {/* Card Title & Description */}
                      <Title
                        level={5}
                        style={{ marginBottom: 8, color: "#0f172a" }}
                      >
                        {item.name}
                      </Title>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "13px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          marginBottom: 16,
                          minHeight: 38,
                        }}
                      >
                        {item.description || "Chưa có mô tả chi tiết."}
                      </Text>

                      {/* Details Info */}
                      <div
                        style={{
                          backgroundColor: "#f8fafc",
                          padding: "12px",
                          borderRadius: 8,
                          marginBottom: 16,
                        }}
                      >
                        <Row
                          justify="space-between"
                          style={{ marginBottom: 6 }}
                        >
                          <Text type="secondary" style={{ fontSize: "13px" }}>
                            Trưởng ban / Chủ tịch:
                          </Text>
                          <Text strong style={{ fontSize: "13px" }}>
                            {item.chairman_name || "Chưa bổ nhiệm"}
                          </Text>
                        </Row>
                        <Row justify="space-between">
                          <Text type="secondary" style={{ fontSize: "13px" }}>
                            Số lượng thành viên:
                          </Text>
                          <Tag
                            color="cyan"
                            style={{ margin: 0, fontWeight: 600 }}
                          >
                            <Icon
                              icon="solar:users-group-two-rounded-linear"
                              style={{ marginRight: 4 }}
                            />
                            {item.member_count || 0} người
                          </Tag>
                        </Row>
                      </div>
                    </div>

                    {/* Actions */}
                    <Row
                      justify="space-between"
                      align="middle"
                      style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}
                    >
                      <Button
                        type="light"
                        size="small"
                        icon={
                          <Icon
                            icon="solar:users-group-rounded-bold-duotone"
                            width={16}
                          />
                        }
                        onClick={() => handleOpenMemberModal(item)}
                        style={{
                          color: PRIMARY_COLOR,
                          backgroundColor: "#e6f7f9",
                          borderColor: "transparent",
                          fontWeight: 500,
                        }}
                      >
                        Thành viên
                      </Button>
                      <Space>
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
                            onClick={() => handleOpenCouncilModal(item)}
                          />
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <Popconfirm
                            title="Xóa hội đồng này?"
                            description="Hành động này không thể hoàn tác."
                            onConfirm={() => handleDeleteCouncil(item.id)}
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
                      </Space>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* --- MODAL 1: Thêm / Sửa Hội đồng --- */}
        <Modal
          title={editingCouncil ? "Cập nhật Hội đồng" : "Tạo mới Hội đồng"}
          open={isCouncilModalOpen}
          onCancel={() => setIsCouncilModalOpen(false)}
          footer={null}
          destroyOnClose
          centered
        >
          <Form
            form={councilForm}
            layout="vertical"
            onFinish={handleSaveCouncil}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="name"
              label="Tên hội đồng"
              rules={[
                { required: true, message: "Vui lòng nhập tên hội đồng!" },
              ]}
            >
              <Input placeholder="Nhập tên hội đồng..." size="large" />
            </Form.Item>

            <Form.Item
              name="type"
              label="Phân loại"
              rules={[{ required: true, message: "Vui lòng chọn phân loại!" }]}
            >
              <Select size="large">
                <Select.Option value="school_council">
                  Hội đồng trường
                </Select.Option>
                <Select.Option value="parent_council">
                  Ban đại diện PHHS
                </Select.Option>
                <Select.Option value="emulation_council">
                  Hội đồng Thi đua - Khen thưởng
                </Select.Option>
                <Select.Option value="discipline_council">
                  Hội đồng Kỷ luật
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="chairman_name" label="Chủ tịch / Trưởng ban">
              <Input placeholder="Nhập tên người đứng đầu..." size="large" />
            </Form.Item>

            <Form.Item name="description" label="Mô tả nhiệm vụ">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả tóm tắt chức năng..."
              />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái">
              <Select size="large">
                <Select.Option value="active">Hoạt động</Select.Option>
                <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
              </Select>
            </Form.Item>

            <Row justify="end" gutter={8} style={{ marginTop: 24 }}>
              <Space>
                <Button onClick={() => setIsCouncilModalOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                  }}
                >
                  {editingCouncil ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Row>
          </Form>
        </Modal>

        {/* --- MODAL 2: Quản lý thành viên --- */}
        <Modal
          title={
            <div>
              <Text strong style={{ fontSize: "16px" }}>
                Quản lý Thành viên
              </Text>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: "13px", color: PRIMARY_COLOR }}
                >
                  {selectedCouncil?.name}
                </Text>
              </div>
            </div>
          }
          open={isMemberModalOpen}
          onCancel={() => setIsMemberModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsMemberModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={650}
          centered
          destroyOnClose
        >
          {loadingMembers ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin />
            </div>
          ) : (
            <Space
              direction="vertical"
              style={{ width: "100%", gap: 20, marginTop: 12 }}
            >
              {/* Form thêm thành viên */}
              <Card
                size="small"
                style={{ backgroundColor: "#f8fafc", borderRadius: 8 }}
                bodyStyle={{ padding: "12px 16px" }}
              >
                <Text
                  bold
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    color: "#64748b",
                  }}
                >
                  Thêm thành viên mới
                </Text>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  <Col flex="auto">
                    <Select
                      showSearch
                      placeholder="-- Chọn thành viên từ danh sách --"
                      optionFilterProp="children"
                      style={{ width: "100%" }}
                      value={selectedMemberToAdd}
                      onChange={(value) => setSelectedMemberToAdd(value)}
                      allowClear
                    >
                      {availableMembers.map((m) => (
                        // Đổi value thành kết hợp unique "id|member_type"
                        <Select.Option
                          key={`${m.id}-${m.member_type}`}
                          value={`${m.id}|${m.member_type}`}
                        >
                          {m.full_name} (
                          {m.member_type === "teacher"
                            ? "Giáo viên"
                            : "Nhân viên"}
                          )
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      disabled={!selectedMemberToAdd}
                      icon={
                        <Icon icon="solar:user-plus-bold-duotone" width={16} />
                      }
                      onClick={handleAddMember}
                      style={{
                        backgroundColor: selectedMemberToAdd
                          ? PRIMARY_COLOR
                          : undefined,
                        borderColor: selectedMemberToAdd
                          ? PRIMARY_COLOR
                          : undefined,
                      }}
                    >
                      Thêm
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Bảng danh sách thành viên hiện tại */}
              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Danh sách thành viên hiện tại (
                  {selectedCouncil?.members?.length || 0})
                </Text>
                <Table
                  dataSource={selectedCouncil?.members || []}
                  columns={memberTableColumns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  size="small"
                  bordered={false}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có thành viên nào"
                      />
                    ),
                  }}
                />
              </div>
            </Space>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
}
