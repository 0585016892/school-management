import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Drawer,
  Avatar,
  Divider,
  Empty,
  Spin,
  Popconfirm,
  message,
  Descriptions,
  Badge,
  Tooltip,
} from "antd";

import { Icon } from "@iconify/react";
import unionApi from "../../../api/unionApi";
import CanRole from "../../../components/CanRole"; // Import component phân quyền
import { ROLES } from "../../../constants/roles"; // Import bộ Enum Role

const { Title, Text } = Typography;
const { Option } = Select;

// =====================================================
// COLOR PALETTE (Chủ đạo: Xanh lam Công đoàn)
// =====================================================

const PRIMARY_COLOR = "#0284C7"; // Sky Blue
const PRIMARY_HOVER = "#0369A1";
const PRIMARY_BG = "#E0F2FE";

function UnionPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();

  // =====================================================
  // STATE
  // =====================================================

  const [unions, setUnions] = useState([]);
  const [selectedUnion, setSelectedUnion] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editingUnion, setEditingUnion] = useState(null);
  const [searchText, setSearchText] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchUnions();
  }, []);

  // =====================================================
  // GET ALL UNIONS
  // =====================================================

  const fetchUnions = async () => {
    try {
      setLoading(true);
      const response = await unionApi.getAll();

      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.unions)) {
        data = response.unions;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.data?.unions)) {
        data = response.data.unions;
      }

      setUnions(data);
    } catch (error) {
      console.error("GET UNIONS ERROR:", error);
      messageApi.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách tổ chức công đoàn",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET UNION DETAIL
  // =====================================================

  const openDetail = async (record) => {
    try {
      setDrawerOpen(true);
      setDetailLoading(true);

      const response = await unionApi.getById(record.id);

      let unionData = null;
      if (response?.union) {
        unionData = response.union;
      } else if (response?.data?.union) {
        unionData = response.data.union;
      } else if (response?.data) {
        unionData = response.data;
      } else {
        unionData = response;
      }

      setSelectedUnion(unionData);
    } catch (error) {
      console.error("GET UNION DETAIL ERROR:", error);
      messageApi.error(
        error?.response?.data?.message ||
          "Không thể tải thông tin chi tiết tổ công đoàn",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreate = () => {
    setEditingUnion(null);
    form.resetFields();
    form.setFieldsValue({
      name: "",
      type: "union_group",
      status: "active",
      description: "",
    });
    setModalOpen(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (record) => {
    setEditingUnion(record);
    form.setFieldsValue({
      name: record.name || "",
      type: record.type || "union_group",
      status: record.status || "active",
      description: record.description || "",
    });
    setModalOpen(true);
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingUnion) {
        await unionApi.update(editingUnion.id, values);
        messageApi.success("Cập nhật thông tin công đoàn thành công");
      } else {
        await unionApi.create(values);
        messageApi.success("Thêm tổ công đoàn mới thành công");
      }

      setModalOpen(false);
      setEditingUnion(null);
      form.resetFields();
      await fetchUnions();
    } catch (error) {
      if (error?.errorFields) return;

      console.error("SAVE UNION ERROR:", error);
      messageApi.error(
        error?.response?.data?.message || "Không thể lưu thông tin công đoàn",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await unionApi.delete(id);
      messageApi.success("Xóa tổ công đoàn thành công");

      await fetchUnions();

      if (selectedUnion?.id === id) {
        setDrawerOpen(false);
        setSelectedUnion(null);
      }
    } catch (error) {
      console.error("DELETE UNION ERROR:", error);
      messageApi.error(
        error?.response?.data?.message || "Không thể xóa tổ công đoàn",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET AVAILABLE MEMBERS
  // =====================================================

  const openAddMember = async () => {
    try {
      setMemberLoading(true);
      const response = await unionApi.getAvailableMembers();

      let members = [];
      if (Array.isArray(response)) {
        members = response;
      } else if (Array.isArray(response?.members)) {
        members = response.members;
      } else if (Array.isArray(response?.data)) {
        members = response.data;
      } else if (Array.isArray(response?.data?.members)) {
        members = response.data.members;
      }

      setAvailableMembers(members);
      memberForm.resetFields();
      setMemberModalOpen(true);
    } catch (error) {
      console.error("GET AVAILABLE MEMBERS ERROR:", error);
      messageApi.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách cán bộ, giáo viên",
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // =====================================================
  // SELECT MEMBER
  // =====================================================

  const handleSelectMember = (memberId) => {
    const member = availableMembers.find(
      (item) => Number(item.id) === Number(memberId),
    );

    if (!member) return;

    memberForm.setFieldsValue({
      member_type: member.member_type || "teacher",
      position: member.position || "member",
    });
  };

  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (values) => {
    try {
      if (!selectedUnion?.id) {
        messageApi.warning("Vui lòng chọn tổ công đoàn");
        return;
      }

      setMemberLoading(true);

      await unionApi.addMember(selectedUnion.id, {
        member_id: values.member_id,
        member_type: values.member_type,
        position: values.position,
      });

      messageApi.success("Thêm đoàn viên vào tổ công đoàn thành công");
      setMemberModalOpen(false);
      memberForm.resetFields();

      await openDetail(selectedUnion);
      await fetchUnions();
    } catch (error) {
      console.error("ADD MEMBER ERROR:", error);
      messageApi.error(
        error?.response?.data?.message || "Không thể thêm đoàn viên vào tổ",
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // =====================================================
  // REMOVE MEMBER
  // =====================================================

  const handleRemoveMember = async (member) => {
    try {
      setMemberLoading(true);

      await unionApi.removeMember(selectedUnion.id, member.id);

      messageApi.success("Đã xóa đoàn viên khỏi tổ công đoàn");
      await openDetail(selectedUnion);
      await fetchUnions();
    } catch (error) {
      console.error("REMOVE MEMBER ERROR:", error);
      messageApi.error(
        error?.response?.data?.message || "Không thể xóa đoàn viên khỏi tổ",
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const total = unions.length;

    const active = unions.filter(
      (item) =>
        item.status === "active" || item.status === 1 || item.status === "1",
    ).length;

    const totalMembers = unions.reduce(
      (sum, item) =>
        sum +
        Number(
          item.member_count || item.totalMembers || item.total_members || 0,
        ),
      0,
    );

    const teachers = unions.reduce(
      (sum, item) =>
        sum +
        Number(
          item.teacher_count || item.totalTeachers || item.total_teachers || 0,
        ),
      0,
    );

    return { total, active, totalMembers, teachers };
  }, [unions]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredUnions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return unions;

    return unions.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const type = item.type?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        type.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [unions, searchText]);

  // =====================================================
  // UNION MEMBERS
  // =====================================================

  const unionMembers =
    selectedUnion?.members ||
    selectedUnion?.union_members ||
    selectedUnion?.members_list ||
    [];

  // Helper
  const getMemberType = (member) => {
    if (member?.member_type === "teacher") return "teacher";
    if (member?.member_type === "staff") return "staff";
    return "teacher";
  };

  const getMemberName = (member) => {
    return member?.full_name || member?.name || "Không xác định";
  };

  // Map loại tổ chức sang tiếng Việt
  const renderUnionTypeTag = (type) => {
    switch (type) {
      case "grassroots_union":
        return <Tag color="gold">BCH Công đoàn</Tag>;
      case "union_group":
        return <Tag color="blue">Tổ Công đoàn</Tag>;
      case "inspection_committee":
        return <Tag color="purple">Ủy ban Kiểm tra</Tag>;
      case "female_union":
        return <Tag color="magenta">Ban Nữ công</Tag>;
      default:
        return <Tag color="cyan">Tổ Công đoàn</Tag>;
    }
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: "Tổ Công đoàn / Bộ phận",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space size={14}>
          <Avatar
            shape="square"
            size={44}
            style={{
              backgroundColor: PRIMARY_BG,
              color: PRIMARY_COLOR,
              borderRadius: 10,
            }}
            icon={
              <Icon
                icon="solar:users-group-two-rounded-bold-duotone"
                style={{ fontSize: 24 }}
              />
            }
          />
          <div>
            <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
              {name}
            </Text>
            <br />
            <Space size={4} style={{ marginTop: 2 }}>
              {renderUnionTypeTag(record.type)}
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description || "Công đoàn cơ sở"}
              </Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Tổng số đoàn viên",
      key: "members",
      align: "center",
      width: 180,
      render: (_, record) => {
        const count =
          record.member_count ||
          record.totalMembers ||
          record.total_members ||
          0;

        return (
          <Tag
            style={{
              backgroundColor: "#e0f2fe",
              color: PRIMARY_COLOR,
              borderColor: "#7dd3fc",
              borderRadius: 8,
              padding: "4px 12px",
              fontWeight: 600,
            }}
          >
            <Space size={6}>
              <Icon icon="solar:user-hand-up-bold-duotone" />
              <span>{count} đoàn viên</span>
            </Space>
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 160,
      render: (status) => {
        const active = status === "active" || status === 1 || status === "1";

        return active ? (
          <Tag
            color="success"
            style={{ borderRadius: 20, padding: "2px 12px" }}
          >
            Đang hoạt động
          </Tag>
        ) : (
          <Tag
            color="default"
            style={{ borderRadius: 20, padding: "2px 12px" }}
          >
            Ngừng hoạt động
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space size={2}>
          {/* Nút Xem chi tiết: Ai có quyền vào trang đều xem được */}
          <Tooltip title="Xem danh sách đoàn viên">
            <Button
              type="text"
              shape="circle"
              onClick={() => openDetail(record)}
              icon={
                <Icon
                  icon="solar:eye-bold-duotone"
                  style={{ fontSize: 19, color: PRIMARY_COLOR }}
                />
              }
            />
          </Tooltip>

          {/* Nút Chỉnh sửa: ADMIN, PRINCIPAL, UNION_PRESIDENT */}
          <CanRole
            allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.UNION_PRESIDENT]}
          >
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                onClick={() => handleEdit(record)}
                icon={
                  <Icon
                    icon="solar:pen-bold-duotone"
                    style={{ fontSize: 19, color: PRIMARY_COLOR }}
                  />
                }
              />
            </Tooltip>
          </CanRole>

          {/* Nút Xóa: ADMIN, PRINCIPAL, UNION_PRESIDENT */}
          <CanRole
            allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.UNION_PRESIDENT]}
          >
            <Popconfirm
              title="Xóa tổ công đoàn?"
              description="Đoàn viên thuộc tổ sẽ bị hủy liên kết khỏi danh sách."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={
                    <Icon
                      icon="solar:trash-bin-trash-bold-duotone"
                      style={{ fontSize: 19 }}
                    />
                  }
                />
              </Tooltip>
            </Popconfirm>
          </CanRole>
        </Space>
      ),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {contextHolder}

      <style>
        {`
          .union-card {
            border-radius: 16px !important;
            border: 1px solid #f0f0f0 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
            transition: all .3s ease !important;
          }

          .union-card:hover {
            box-shadow: 0 8px 25px rgba(2,132,199,.12) !important;
            border-color: #bae6fd !important;
          }

          .stat-icon-box {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
          }

          .member-card {
            transition: all .2s ease;
          }

          .member-card:hover {
            border-color: #7dd3fc !important;
            box-shadow: 0 4px 15px rgba(2,132,199,.08);
          }
        `}
      </style>

      <div
        style={{
          paddingBottom: 40,
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
            padding: "28px 24px",
            borderRadius: 20,
            marginBottom: 24,
            color: "#fff",
            boxShadow: "0 10px 30px rgba(2,132,199,.25)",
          }}
        >
          <Row align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <Tag
                style={{
                  background: "rgba(255,255,255,.2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 20,
                  padding: "2px 10px",
                }}
              >
                Công đoàn cơ sở
              </Tag>

              <Title level={2} style={{ color: "#fff", margin: "10px 0 5px" }}>
                Quản lý Tổ Công đoàn & Đoàn viên
              </Title>

              <Text style={{ color: "rgba(255,255,255,.87)" }}>
                Quản lý các tổ công đoàn, ban chấp hành và danh sách công đoàn
                viên trong nhà trường.
              </Text>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: "right", marginTop: 12 }}>
              <Space>
                <Button
                  size="large"
                  loading={loading}
                  onClick={fetchUnions}
                  icon={<Icon icon="solar:restart-bold-duotone" />}
                  style={{
                    background: "rgba(255,255,255,.15)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                  }}
                >
                  Làm mới
                </Button>

                {/* Nút Thêm Tổ CĐ: ADMIN, PRINCIPAL, UNION_PRESIDENT */}
                <CanRole
                  allowRoles={[
                    ROLES.ADMIN,
                    ROLES.PRINCIPAL,
                    ROLES.UNION_PRESIDENT,
                  ]}
                >
                  <Button
                    size="large"
                    onClick={handleCreate}
                    icon={<Icon icon="solar:add-circle-bold-duotone" />}
                    style={{
                      color: PRIMARY_COLOR,
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    Thêm Tổ CĐ
                  </Button>
                </CanRole>
              </Space>
            </Col>
          </Row>
        </div>

        {/* STATISTICS */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: "Tổ Công đoàn",
              value: statistics.total,
              unit: "tổ",
              icon: "solar:users-group-two-rounded-bold-duotone",
              bg: PRIMARY_BG,
              color: PRIMARY_COLOR,
            },
            {
              title: "Đang hoạt động",
              value: statistics.active,
              unit: "đơn vị",
              icon: "solar:check-circle-bold-duotone",
              bg: "#f6ffed",
              color: "#52c41a",
            },
            {
              title: "Tổng số Đoàn viên",
              value: statistics.totalMembers,
              unit: "người",
              icon: "solar:user-hand-up-bold-duotone",
              bg: "#f9f0ff",
              color: "#722ed1",
            },
            {
              title: "Đoàn viên Giáo viên",
              value: statistics.teachers,
              unit: "người",
              icon: "solar:user-bold-duotone",
              bg: "#fff7e6",
              color: "#fa8c16",
            },
          ].map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <Card className="union-card" bodyStyle={{ padding: 20 }}>
                <Space size={16}>
                  <div
                    className="stat-icon-box"
                    style={{ background: item.bg, color: item.color }}
                  >
                    <Icon icon={item.icon} />
                  </div>

                  <div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    >
                      {item.title}
                    </Text>

                    <Title level={3} style={{ margin: 0 }}>
                      {item.value}{" "}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 400,
                          color: "#64748b",
                        }}
                      >
                        {item.unit}
                      </span>
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* TABLE */}
        <Card
          className="union-card"
          style={{ marginTop: 24 }}
          title={
            <Space>
              <Icon
                icon="solar:list-bold-duotone"
                style={{ color: PRIMARY_COLOR, fontSize: 22 }}
              />
              <span>Danh sách Tổ Công đoàn</span>
            </Space>
          }
          extra={
            <Input
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm tổ công đoàn..."
              prefix={<Icon icon="solar:magnifer-linear" />}
              style={{ width: 260, borderRadius: 10 }}
            />
          }
        >
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filteredUnions}
            scroll={{ x: 900 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} tổ công đoàn`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Chưa có dữ liệu công đoàn cơ sở"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Card>

        {/* CREATE / EDIT MODAL */}
        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSubmit}
          confirmLoading={loading}
          destroyOnClose
          okText={editingUnion ? "Lưu thay đổi" : "Thêm mới"}
          cancelText="Hủy"
          title={
            <Space>
              <Icon
                icon={
                  editingUnion
                    ? "solar:pen-bold-duotone"
                    : "solar:add-circle-bold-duotone"
                }
                style={{ color: PRIMARY_COLOR, fontSize: 22 }}
              />
              <span>
                {editingUnion ? "Cập nhật Tổ Công đoàn" : "Thêm Tổ Công đoàn"}
              </span>
            </Space>
          }
        >
          <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
            <Form.Item
              label="Tên Tổ Công đoàn / Ban chuyên trách"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên tổ công đoàn" },
              ]}
            >
              <Input
                placeholder="Ví dụ: Tổ Công đoàn Khối 1"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Loại tổ chức" name="type">
                  <Select defaultActiveFirstOption>
                    <Option value="union_group">Tổ Công đoàn</Option>
                    <Option value="grassroots_union">
                      BCH Công đoàn cơ sở
                    </Option>
                    <Option value="female_union">Ban Nữ công</Option>
                    <Option value="inspection_committee">
                      Ủy ban Kiểm tra
                    </Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Trạng thái" name="status">
                  <Select>
                    <Option value="active">Đang hoạt động</Option>
                    <Option value="inactive">Ngừng hoạt động</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả / Nhiệm vụ" name="description">
              <Input.TextArea
                rows={4}
                placeholder="Mô tả chức năng, hoạt động công đoàn..."
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* DETAIL DRAWER */}
        <Drawer
          width={650}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedUnion(null);
          }}
          title={
            <Space>
              <Avatar
                shape="square"
                style={{ background: PRIMARY_BG, color: PRIMARY_COLOR }}
                icon={
                  <Icon icon="solar:users-group-two-rounded-bold-duotone" />
                }
              />
              <div>
                <Text strong>
                  {selectedUnion?.name || "Chi tiết Tổ Công đoàn"}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Danh sách đoàn viên thuộc tổ
                </Text>
              </div>
            </Space>
          }
        >
          <Spin spinning={detailLoading}>
            {selectedUnion ? (
              <>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Tên đơn vị">
                    {selectedUnion.name}
                  </Descriptions.Item>

                  <Descriptions.Item label="Phân loại">
                    {renderUnionTypeTag(selectedUnion.type)}
                  </Descriptions.Item>

                  <Descriptions.Item label="Trạng thái">
                    <Badge
                      status={
                        selectedUnion.status === "active"
                          ? "success"
                          : "default"
                      }
                      text={
                        selectedUnion.status === "active"
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"
                      }
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="Mô tả">
                    {selectedUnion.description || "Chưa có mô tả"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Tổng đoàn viên">
                    <strong style={{ color: PRIMARY_COLOR }}>
                      {unionMembers.length}
                    </strong>{" "}
                    người
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 16 }}
                >
                  <Title level={5} style={{ margin: 0 }}>
                    Danh sách Đoàn viên
                  </Title>
                  {/* Nút Thêm đoàn viên: ADMIN, PRINCIPAL, UNION_PRESIDENT */}
                  <CanRole
                    allowRoles={[
                      ROLES.ADMIN,
                      ROLES.PRINCIPAL,
                      ROLES.UNION_PRESIDENT,
                    ]}
                  >
                    <Button
                      type="primary"
                      icon={<Icon icon="solar:user-plus-bold-duotone" />}
                      onClick={openAddMember}
                      style={{
                        background: PRIMARY_COLOR,
                        borderColor: PRIMARY_COLOR,
                      }}
                    >
                      Thêm đoàn viên
                    </Button>
                  </CanRole>
                </Row>

                {unionMembers.length === 0 ? (
                  <Empty
                    description="Chưa có đoàn viên nào trong tổ này"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {unionMembers.map((member, index) => {
                      const type = getMemberType(member);
                      const isTeacher = type === "teacher";

                      return (
                        <Card
                          key={`${member.id}-${type}-${index}`}
                          size="small"
                          className="member-card"
                          style={{ borderRadius: 12 }}
                        >
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Space size={12}>
                                <Avatar
                                  style={{
                                    background: isTeacher
                                      ? PRIMARY_BG
                                      : "#fff7e6",
                                    color: isTeacher
                                      ? PRIMARY_COLOR
                                      : "#fa8c16",
                                    fontWeight: 600,
                                  }}
                                >
                                  {getMemberName(member)
                                    .charAt(0)
                                    .toUpperCase()}
                                </Avatar>

                                <div>
                                  <Text strong>{getMemberName(member)}</Text>
                                  <br />
                                  <Space size={6} style={{ marginTop: 2 }}>
                                    <Tag color={isTeacher ? "blue" : "orange"}>
                                      {isTeacher ? "Giáo viên" : "Nhân viên"}
                                    </Tag>

                                    {member.position && (
                                      <Tag color="cyan">{member.position}</Tag>
                                    )}

                                    {member.teacher_code && (
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                      >
                                        Mã: {member.teacher_code}
                                      </Text>
                                    )}
                                  </Space>

                                  {member.phone && (
                                    <>
                                      <br />
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                      >
                                        📞 {member.phone}
                                      </Text>
                                    </>
                                  )}
                                </div>
                              </Space>
                            </Col>

                            <Col>
                              {/* Nút Xóa khỏi tổ công đoàn: ADMIN, PRINCIPAL, UNION_PRESIDENT */}
                              <CanRole
                                allowRoles={[
                                  ROLES.ADMIN,
                                  ROLES.PRINCIPAL,
                                  ROLES.UNION_PRESIDENT,
                                ]}
                              >
                                <Popconfirm
                                  title="Xóa khỏi tổ công đoàn?"
                                  description="Đoàn viên sẽ bị hủy liên kết khỏi tổ công đoàn này."
                                  okText="Xóa"
                                  cancelText="Hủy"
                                  okButtonProps={{ danger: true }}
                                  onConfirm={() => handleRemoveMember(member)}
                                >
                                  <Button
                                    danger
                                    type="text"
                                    shape="circle"
                                    icon={
                                      <Icon icon="solar:user-minus-bold-duotone" />
                                    }
                                  />
                                </Popconfirm>
                              </CanRole>
                            </Col>
                          </Row>
                        </Card>
                      );
                    })}
                  </Space>
                )}
              </>
            ) : (
              <Empty />
            )}
          </Spin>
        </Drawer>

        {/* ADD MEMBER MODAL */}
        <Modal
          open={memberModalOpen}
          onCancel={() => {
            setMemberModalOpen(false);
            memberForm.resetFields();
          }}
          footer={null}
          destroyOnClose
          title={
            <Space>
              <Icon
                icon="solar:user-plus-bold-duotone"
                style={{ color: PRIMARY_COLOR, fontSize: 22 }}
              />
              <span>Thêm Đoàn viên vào Tổ Công đoàn</span>
            </Space>
          }
        >
          <Form
            form={memberForm}
            layout="vertical"
            onFinish={handleAddMember}
            style={{ marginTop: 20 }}
          >
            <Form.Item
              label="Chọn cán bộ, giáo viên / nhân viên"
              name="member_id"
              rules={[
                { required: true, message: "Vui lòng chọn người cần thêm" },
              ]}
            >
              <Select
                showSearch
                loading={memberLoading}
                placeholder="Tìm kiếm theo tên hoặc mã..."
                optionFilterProp="label"
                onChange={handleSelectMember}
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableMembers.map((member, index) => {
                  const type = member.member_type;
                  const isTeacher = member.member_type === "teacher";

                  return (
                    <Option
                      key={`${type}-${member.id}-${index}`}
                      value={member.id}
                      label={member.full_name}
                    >
                      <Space size={10}>
                        <Avatar
                          size={30}
                          style={{
                            background: isTeacher ? PRIMARY_BG : "#fff7e6",
                            color: isTeacher ? PRIMARY_COLOR : "#fa8c16",
                          }}
                        >
                          {member.full_name?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <div>
                          <Text strong>{member.full_name}</Text>
                          <br />
                          <Space size={5}>
                            <Tag
                              color={isTeacher ? "blue" : "orange"}
                              style={{ margin: 0, fontSize: 11 }}
                            >
                              {isTeacher ? "Giáo viên" : "Nhân viên"}
                            </Tag>

                            {member.teacher_code && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {member.teacher_code}
                              </Text>
                            )}
                          </Space>
                        </div>
                      </Space>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Loại nhân sự"
                  name="member_type"
                  rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                >
                  <Select placeholder="Chọn loại">
                    <Option value="teacher">Giáo viên</Option>
                    <Option value="staff">Nhân viên</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Chức vụ Công đoàn" name="position">
                  <Select placeholder="Chọn chức vụ">
                    <Option value="Đoàn viên">Đoàn viên</Option>
                    <Option value="Tổ trưởng CĐ">Tổ trưởng CĐ</Option>
                    <Option value="Tổ phó CĐ">Tổ phó CĐ</Option>
                    <Option value="Ủy viên BCH">Ủy viên BCH</Option>
                    <Option value="Chủ tịch CĐ">Chủ tịch CĐ</Option>
                    <Option value="Phó Chủ tịch CĐ">Phó Chủ tịch CĐ</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                💡 Hệ thống tự động xác định thông tin nhân sự. Bạn có thể chọn
                Chức vụ Công đoàn phù hợp trước khi hoàn tất.
              </Text>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Row justify="end">
                <Space>
                  <Button
                    onClick={() => {
                      setMemberModalOpen(false);
                      memberForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={memberLoading}
                    icon={<Icon icon="solar:user-plus-bold-duotone" />}
                    style={{
                      background: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                    }}
                  >
                    Thêm đoàn viên
                  </Button>
                </Space>
              </Row>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default UnionPage;
