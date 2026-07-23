import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Table,
  Avatar,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  message,
  Empty,
  Spin,
  Tooltip,
} from "antd";
import { Icon } from "@iconify/react";
import organizationApi from "../../../api/organizationApi";
import staffApi from "../../../api/staffApi";
import teacherApi from "../../../api/teacherApi";

const { Title, Text } = Typography;
const { Option } = Select;

// MÀU CHỦ ĐẠO TỔNG THỂ
const PRIMARY_COLOR = "#37B0C3";
const PRIMARY_HOVER = "#2da0b2";
const PRIMARY_BG = "#eef8f9";

function OrganizationPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // =====================================================
  // STATE
  // =====================================================
  const [organizations, setOrganizations] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [organizationTree, setOrganizationTree] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStaffs, setLoadingStaffs] = useState(false);

  // =====================================================
  // TYPE MAP CONFIG
  // =====================================================
  const typeMap = {
    management: {
      label: "Ban giám hiệu",
      color: "#1677ff",
      bg: "#e6f4ff",
      icon: "solar:users-group-rounded-bold-duotone",
    },
    department: {
      label: "Tổ chuyên môn",
      color: PRIMARY_COLOR,
      bg: PRIMARY_BG,
      icon: "solar:case-bold-duotone",
    },
    union: {
      label: "Công đoàn",
      color: "#52c41a",
      bg: "#f6ffed",
      icon: "solar:users-group-two-rounded-bold-duotone",
    },
    youth_union: {
      label: "Chi đoàn thanh niên",
      color: "#fa8c16",
      bg: "#fff7e6",
      icon: "solar:users-group-rounded-bold-duotone",
    },
    youth_team: {
      label: "Đội thiếu niên",
      color: "#722ed1",
      bg: "#f9f0ff",
      icon: "solar:flag-bold-duotone",
    },
    council: {
      label: "Hội đồng",
      color: "#eb2f96",
      bg: "#fff0f6",
      icon: "solar:buildings-bold-duotone",
    },
  };

  const getTypeConfig = (type) => {
    return (
      typeMap[type] || {
        label: "Khác",
        color: "#64748b",
        bg: "#f1f5f9",
        icon: "solar:buildings-2-bold-duotone",
      }
    );
  };

  const getLeaderName = (record) => {
    if (record?.leader_teacher_name) return record.leader_teacher_name;
    if (record?.leader_staff_name) return record.leader_staff_name;
    return "Chưa phân công";
  };

  // =====================================================
  // LOAD ALL DATA
  // =====================================================
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchOrganizations(),
      fetchStatistics(),
      fetchOrganizationTree(),
      fetchTeachers(),
      fetchStaffs(),
    ]);
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationApi.getAll();
      if (response) {
        setOrganizations(Array.isArray(response) ? response : []);
      } else {
        setOrganizations([]);
        messageApi.error(
          response?.message || "Không thể tải danh sách tổ chức",
        );
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách tổ chức:", error);
      setOrganizations([]);
      messageApi.error(
        error?.response?.data?.message || "Không thể tải danh sách tổ chức",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoadingStatistics(true);
      const response = await organizationApi.getStatistics();
      setStatistics(response || {});
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
      setStatistics({});
    } finally {
      setLoadingStatistics(false);
    }
  };

  const fetchOrganizationTree = async () => {
    try {
      setLoadingTree(true);
      const response = await organizationApi.getTree();
      setOrganizationTree(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Lỗi lấy cây tổ chức:", error);
      setOrganizationTree([]);
    } finally {
      setLoadingTree(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await teacherApi.getAll();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (Array.isArray(response?.data)) data = response.data;
      else if (Array.isArray(response?.data?.data)) data = response.data.data;
      setTeachers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách giáo viên:", error);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      setLoadingStaffs(true);
      const response = await staffApi.getAll();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (Array.isArray(response?.data)) data = response.data;
      else if (Array.isArray(response?.data?.data)) data = response.data.data;
      setStaffs(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nhân viên:", error);
      setStaffs([]);
    } finally {
      setLoadingStaffs(false);
    }
  };

  // =====================================================
  // STATS COMPUTATION
  // =====================================================
  const managementCount =
    statistics?.management ??
    organizations.filter((item) => item.type === "management").length;

  const departmentCount =
    statistics?.department ??
    organizations.filter((item) => item.type === "department").length;

  const unionCount =
    statistics?.union ??
    statistics?.unions ??
    organizations.filter(
      (item) =>
        item.type === "union" ||
        item.type === "youth_union" ||
        item.type === "youth_team",
    ).length;

  const totalCount =
    statistics?.total ?? statistics?.totalOrganizations ?? organizations.length;

  // =====================================================
  // MODAL & HANDLERS
  // =====================================================
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: "active",
      parent_id: null,
      leader_teacher_id: null,
      leader_staff_id: null,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      parent_id: record.parent_id || null,
      leader_teacher_id: record.leader_teacher_id || null,
      leader_staff_id: record.leader_staff_id || null,
      description: record.description || "",
      status: record.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa tổ chức",
      content:
        "Bạn có chắc chắn muốn xóa đơn vị tổ chức này không? Dữ liệu liên quan có thể sẽ bị ảnh hưởng.",
      okText: "Xóa đơn vị",
      cancelText: "Hủy bỏ",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await organizationApi.delete(id);
          messageApi.success("Đã xóa đơn vị tổ chức thành công");
          await fetchAllData();
        } catch (error) {
          console.error("Lỗi xóa tổ chức:", error);
          messageApi.error(
            error?.response?.data?.message || "Không thể xóa tổ chức",
          );
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name?.trim(),
        type: values.type,
        parent_id: values.parent_id || null,
        leader_teacher_id: values.leader_teacher_id
          ? Number(values.leader_teacher_id)
          : null,
        leader_staff_id: values.leader_staff_id
          ? Number(values.leader_staff_id)
          : null,
        description: values.description?.trim() || "",
        status: values.status || "active",
      };

      if (editingRecord) {
        await organizationApi.update(editingRecord.id, payload);
        messageApi.success("Cập nhật thông tin tổ chức thành công");
      } else {
        await organizationApi.create(payload);
        messageApi.success("Thêm đơn vị tổ chức mới thành công");
      }

      handleCloseModal();
      await fetchAllData();
    } catch (error) {
      console.error("Lỗi lưu tổ chức:", error);
      if (error?.errorFields) return;
      messageApi.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin",
      );
    }
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const columns = [
    {
      title: "Đơn vị tổ chức",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const config = getTypeConfig(record.type);
        return (
          <Space size={14}>
            <Avatar
              shape="square"
              size={42}
              style={{
                backgroundColor: config.bg,
                color: config.color,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              icon={<Icon icon={config.icon} style={{ fontSize: 22 }} />}
            />
            <div>
              <Text strong style={{ fontSize: 14, color: "#0f172a" }}>
                {text}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.description || "Chưa có thông tin mô tả"}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: "Loại tổ chức",
      dataIndex: "type",
      key: "type",
      width: 170,
      render: (type) => {
        const config = getTypeConfig(type);
        return (
          <Tag
            style={{
              color: config.color,
              backgroundColor: config.bg,
              borderColor: `${config.color}30`,
              borderRadius: 6,
              padding: "2px 10px",
              fontWeight: 500,
            }}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Người phụ trách",
      key: "leader",
      width: 200,
      render: (_, record) => {
        const leader = getLeaderName(record);
        const isAssigned = leader !== "Chưa phân công";

        return (
          <Space>
            <Avatar
              size="small"
              style={{
                backgroundColor: isAssigned ? PRIMARY_BG : "#f1f5f9",
                color: isAssigned ? PRIMARY_COLOR : "#94a3b8",
                fontWeight: 600,
              }}
            >
              {isAssigned ? leader.charAt(0) : "?"}
            </Avatar>
            <Text
              style={{
                fontSize: 13,
                color: isAssigned ? "#334155" : "#94a3b8",
              }}
            >
              {leader}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Đơn vị trực thuộc",
      key: "parent",
      width: 200,
      render: (_, record) => (
        <Text style={{ fontSize: 13, color: "#475569" }}>
          {record.parent_name ? (
            <Space>
              <Icon
                icon="solar:corner-down-right-bold"
                style={{ color: PRIMARY_COLOR }}
              />
              <span>{record.parent_name}</span>
            </Space>
          ) : (
            <Tag color="default" style={{ borderRadius: 4 }}>
              Cấp cao nhất
            </Tag>
          )}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) =>
        status === "active" ? (
          <Tag color="success" style={{ borderRadius: 12, padding: "0 10px" }}>
            Đang hoạt động
          </Tag>
        ) : (
          <Tag color="default" style={{ borderRadius: 12, padding: "0 10px" }}>
            Ngừng hoạt động
          </Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:pen-bold-duotone"
                  style={{ fontSize: 18, color: PRIMARY_COLOR }}
                />
              }
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              shape="circle"
              danger
              icon={
                <Icon
                  icon="solar:trash-bin-trash-bold-duotone"
                  style={{ fontSize: 18 }}
                />
              }
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // =====================================================
  // RENDER TREE NODE
  // =====================================================
  const renderTreeNode = (node, level = 0) => {
    if (!node) return null;

    const config = getTypeConfig(node.type);
    const children = Array.isArray(node.children)
      ? node.children
      : Array.isArray(node.subOrganizations)
        ? node.subOrganizations
        : [];

    return (
      <div
        key={node.id}
        style={{
          marginTop: 16,
          marginLeft: level > 0 ? 28 : 0,
        }}
      >
        <OrganizationNode
          icon={config.icon}
          title={node.name}
          subtitle={config.label}
          description={node.description}
          leader={getLeaderName(node)}
          color={config.color}
          bg={config.bg}
        />

        {children.length > 0 && (
          <div
            style={{
              borderLeft: `2px dashed ${PRIMARY_COLOR}40`,
              marginLeft: 24,
              paddingLeft: 20,
              marginTop: 10,
            }}
          >
            {children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {contextHolder}

      {/* Dynamic Style Injection */}
      <style>{`
        .org-card {
          border-radius: 16px !important;
          border: 1px solid #f0f0f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
          transition: all 0.3s ease !important;
        }
        .org-card:hover {
          box-shadow: 0 8px 25px rgba(55, 176, 195, 0.12) !important;
          border-color: #d1f0f5 !important;
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
        .node-card {
          width: 320px;
          border-radius: 14px !important;
          border: 1px solid #e2e8f0 !important;
          transition: all 0.2s ease !important;
          background: #ffffff;
        }
        .node-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06) !important;
        }
      `}</style>

      <div
        style={{
          paddingBottom: 40,
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        {/* =================================================
            HERO HEADER BANNER
        ================================================= */}
        <div
          style={{
            background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #1d7e8e 100%)`,
            padding: "28px 24px",
            borderRadius: "20px",
            marginBottom: 24,
            color: "#fff",
            boxShadow: "0 10px 30px rgba(55, 176, 195, 0.22)",
          }}
        >
          <Row align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={4}>
                <Tag
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "20px",
                    padding: "2px 12px",
                  }}
                >
                  Cơ cấu nhà trường
                </Tag>
                <Title
                  level={2}
                  style={{
                    color: "#fff",
                    margin: "8px 0 4px 0",
                    fontWeight: 700,
                  }}
                >
                  Tổ Chức Nhà Trường
                </Title>
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 14 }}
                >
                  Quản lý sơ đồ bộ máy, các đơn vị trực thuộc và phân công nhân
                  sự phụ trách.
                </Text>
              </Space>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: "right", marginTop: 12 }}>
              <Button
                type="primary"
                size="large"
                icon={
                  <Icon
                    icon="solar:add-circle-bold-duotone"
                    style={{ fontSize: 22 }}
                  />
                }
                onClick={handleAdd}
                style={{
                  backgroundColor: "#ffffff",
                  color: PRIMARY_COLOR,
                  borderColor: "#ffffff",
                  fontWeight: 600,
                  borderRadius: 12,
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  height: 46,
                  padding: "0 22px",
                }}
              >
                Thêm đơn vị mới
              </Button>
            </Col>
          </Row>
        </div>

        {/* =================================================
            STATISTICS CARDS
        ================================================= */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="org-card" bodyStyle={{ padding: 20 }}>
              <Spin spinning={loadingStatistics}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    className="stat-icon-box"
                    style={{ background: PRIMARY_BG, color: PRIMARY_COLOR }}
                  >
                    <Icon icon="solar:buildings-2-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Tổng số đơn vị
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {totalCount}{" "}
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          fontWeight: 400,
                        }}
                      >
                        đơn vị
                      </span>
                    </Title>
                  </div>
                </div>
              </Spin>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="org-card" bodyStyle={{ padding: 20 }}>
              <Spin spinning={loadingStatistics}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    className="stat-icon-box"
                    style={{ background: "#e6f4ff", color: "#1677ff" }}
                  >
                    <Icon icon="solar:users-group-rounded-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Ban giám hiệu
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {managementCount}{" "}
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          fontWeight: 400,
                        }}
                      >
                        đơn vị
                      </span>
                    </Title>
                  </div>
                </div>
              </Spin>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="org-card" bodyStyle={{ padding: 20 }}>
              <Spin spinning={loadingStatistics}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    className="stat-icon-box"
                    style={{ background: PRIMARY_BG, color: PRIMARY_COLOR }}
                  >
                    <Icon icon="solar:case-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Tổ chuyên môn
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {departmentCount}{" "}
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          fontWeight: 400,
                        }}
                      >
                        tổ
                      </span>
                    </Title>
                  </div>
                </div>
              </Spin>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="org-card" bodyStyle={{ padding: 20 }}>
              <Spin spinning={loadingStatistics}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    className="stat-icon-box"
                    style={{ background: "#f9f0ff", color: "#722ed1" }}
                  >
                    <Icon icon="solar:flag-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Đoàn thể - Đội
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {unionCount}{" "}
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          fontWeight: 400,
                        }}
                      >
                        đơn vị
                      </span>
                    </Title>
                  </div>
                </div>
              </Spin>
            </Card>
          </Col>
        </Row>

        {/* =================================================
            ORGANIZATION TREE GRAPH
        ================================================= */}
        <Card
          className="org-card"
          title={
            <Space>
              <Icon
                icon="solar:hierarchy-2-bold-duotone"
                style={{ fontSize: 22, color: PRIMARY_COLOR }}
              />
              <span style={{ fontWeight: 600 }}>Sơ đồ bộ máy tổ chức</span>
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <Spin spinning={loadingTree}>
            {organizationTree.length > 0 ? (
              <div style={{ padding: "10px 0 20px", overflowX: "auto" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 24,
                    alignItems: "flex-start",
                  }}
                >
                  {organizationTree.map((node) => renderTreeNode(node))}
                </div>
              </div>
            ) : (
              <Empty
                description="Chưa xây dựng sơ đồ tổ chức"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Spin>
        </Card>

        {/* =================================================
            ORGANIZATION TABLE LIST
        ================================================= */}
        <Card
          className="org-card"
          title={
            <Space>
              <Icon
                icon="solar:list-bold-duotone"
                style={{ fontSize: 22, color: PRIMARY_COLOR }}
              />
              <span style={{ fontWeight: 600 }}>Danh sách đơn vị tổ chức</span>
            </Space>
          }
          style={{ marginTop: 24 }}
        >
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={organizations}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} đơn vị`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* =================================================
            MODAL ADD / UPDATE
        ================================================= */}
        <Modal
          title={
            <Space>
              <Icon
                icon={
                  editingRecord
                    ? "solar:pen-bold-duotone"
                    : "solar:add-circle-bold-duotone"
                }
                style={{ color: PRIMARY_COLOR, fontSize: 22 }}
              />
              <span style={{ fontWeight: 600 }}>
                {editingRecord
                  ? "Cập nhật thông tin tổ chức"
                  : "Thêm đơn vị tổ chức mới"}
              </span>
            </Space>
          }
          open={isModalOpen}
          onCancel={handleCloseModal}
          onOk={handleSubmit}
          okText={editingRecord ? "Lưu thay đổi" : "Tạo đơn vị"}
          cancelText="Hủy bỏ"
          width={640}
          okButtonProps={{
            style: {
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              borderRadius: 8,
            },
          }}
          cancelButtonProps={{ style: { borderRadius: 8 } }}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              label="Tên đơn vị tổ chức"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên tổ chức" }]}
            >
              <Input
                placeholder="Ví dụ: Tổ chuyên môn Khối 3"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Loại tổ chức"
                  name="type"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại tổ chức" },
                  ]}
                >
                  <Select
                    placeholder="Chọn loại tổ chức"
                    style={{ borderRadius: 8 }}
                  >
                    <Option value="management">Ban giám hiệu</Option>
                    <Option value="department">Tổ chuyên môn</Option>
                    <Option value="union">Công đoàn cơ sở</Option>
                    <Option value="youth_union">Chi đoàn thanh niên</Option>
                    <Option value="youth_team">Đội thiếu niên</Option>
                    <Option value="council">Hội đồng</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Đơn vị trực thuộc cấp trên" name="parent_id">
                  <Select allowClear placeholder="Chọn đơn vị cấp trên">
                    {organizations
                      .filter(
                        (item) =>
                          !editingRecord || item.id !== editingRecord.id,
                      )
                      .map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giáo viên phụ trách" name="leader_teacher_id">
                  <Select
                    allowClear
                    showSearch
                    loading={loadingTeachers}
                    placeholder="Chọn giáo viên"
                    optionFilterProp="label"
                    options={teachers.map((t) => ({
                      value: t.id,
                      label: `${t.full_name} (ID: ${t.id})`,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Nhân viên phụ trách" name="leader_staff_id">
                  <Select
                    allowClear
                    showSearch
                    loading={loadingStaffs}
                    placeholder="Chọn nhân viên"
                    optionFilterProp="label"
                    options={staffs.map((s) => ({
                      value: s.id,
                      label: `${s.full_name} (${s.position || "Nhân viên"})`,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Trạng thái hoạt động" name="status">
              <Select defaultValue="active">
                <Option value="active">Đang hoạt động</Option>
                <Option value="inactive">Ngừng hoạt động</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Mô tả chức năng / nhiệm vụ" name="description">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả tóm tắt nhiệm vụ của đơn vị..."
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

// =====================================================
// ORGANIZATION NODE COMPONENT
// =====================================================
function OrganizationNode({
  icon,
  title,
  subtitle,
  description,
  leader,
  color,
  bg,
}) {
  return (
    <Card
      className="node-card"
      bodyStyle={{ padding: 16 }}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar
          shape="square"
          size={44}
          style={{
            backgroundColor: bg,
            color: color,
            borderRadius: 10,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          icon={<Icon icon={icon} style={{ fontSize: 22 }} />}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            strong
            style={{
              display: "block",
              color: "#0f172a",
              fontSize: 14,
              lineHeight: "1.3",
            }}
          >
            {title}
          </Text>

          <Tag
            style={{
              marginTop: 6,
              marginBottom: 6,
              color: color,
              backgroundColor: bg,
              borderColor: `${color}30`,
              borderRadius: 4,
              fontSize: 11,
            }}
          >
            {subtitle}
          </Tag>

          {leader && leader !== "Chưa phân công" && (
            <div style={{ marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Phụ trách:{" "}
                <strong style={{ color: "#334155" }}>{leader}</strong>
              </Text>
            </div>
          )}

          {description && (
            <Text
              type="secondary"
              ellipsis={{ tooltip: description }}
              style={{
                fontSize: 12,
                display: "block",
                marginTop: 4,
                color: "#64748b",
              }}
            >
              {description}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
}

export default OrganizationPage;
