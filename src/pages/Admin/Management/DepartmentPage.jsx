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
import departmentApi from "../../../api/departmentApi";

const { Title, Text } = Typography;
const { Option } = Select;

// =====================================================
// COLOR
// =====================================================

const PRIMARY_COLOR = "#37B0C3";
const PRIMARY_HOVER = "#2da0b2";
const PRIMARY_BG = "#eef8f9";

// =====================================================
// COMPONENT
// =====================================================

function DepartmentPage() {
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();

  // =====================================================
  // STATE
  // =====================================================

  const [departments, setDepartments] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [availableMembers, setAvailableMembers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);

  const [memberLoading, setMemberLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const [memberModalOpen, setMemberModalOpen] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [editingDepartment, setEditingDepartment] = useState(null);

  const [searchText, setSearchText] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchDepartments();
  }, []);

  // =====================================================
  // GET ALL DEPARTMENTS
  // =====================================================

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const response = await departmentApi.getAll();

      console.log("=================================");
      console.log("GET DEPARTMENTS RESPONSE");
      console.log(response);
      console.log("=================================");

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.departments)) {
        data = response.departments;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.data?.departments)) {
        data = response.data.departments;
      }

      setDepartments(data);
    } catch (error) {
      console.error("GET DEPARTMENTS ERROR:", error);

      messageApi.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách tổ chuyên môn",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET DEPARTMENT DETAIL
  // =====================================================

  const openDetail = async (record) => {
    try {
      setDrawerOpen(true);

      setDetailLoading(true);

      const response = await departmentApi.getById(record.id);

      console.log("=================================");
      console.log("GET DEPARTMENT DETAIL");
      console.log(response);
      console.log("=================================");

      let department = null;

      if (response?.department) {
        department = response.department;
      } else if (response?.data?.department) {
        department = response.data.department;
      } else if (response?.data) {
        department = response.data;
      } else {
        department = response;
      }

      setSelectedDepartment(department);
    } catch (error) {
      console.error("GET DEPARTMENT DETAIL ERROR:", error);

      messageApi.error(
        error?.response?.data?.message ||
          "Không thể tải thông tin chi tiết tổ chuyên môn",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // CREATE
  // =====================================================

  const handleCreate = () => {
    setEditingDepartment(null);

    form.resetFields();

    form.setFieldsValue({
      name: "",
      type: "department",
      status: "active",
      description: "",
    });

    setModalOpen(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (record) => {
    setEditingDepartment(record);

    form.setFieldsValue({
      name: record.name || "",
      type: record.type || "department",
      parent_id: record.parent_id || null,
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

      console.log("SAVE DEPARTMENT DATA:", values);

      if (editingDepartment) {
        await departmentApi.update(editingDepartment.id, values);

        messageApi.success("Cập nhật thông tin tổ chuyên môn thành công");
      } else {
        await departmentApi.create(values);

        messageApi.success("Thêm tổ chuyên môn mới thành công");
      }

      setModalOpen(false);

      setEditingDepartment(null);

      form.resetFields();

      await fetchDepartments();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      console.error("SAVE DEPARTMENT ERROR:", error);

      messageApi.error(
        error?.response?.data?.message ||
          "Không thể lưu thông tin tổ chuyên môn",
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

      await departmentApi.delete(id);

      messageApi.success("Xóa tổ chuyên môn thành công");

      await fetchDepartments();

      if (selectedDepartment?.id === id) {
        setDrawerOpen(false);

        setSelectedDepartment(null);
      }
    } catch (error) {
      console.error("DELETE DEPARTMENT ERROR:", error);

      messageApi.error(
        error?.response?.data?.message || "Không thể xóa tổ chuyên môn",
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

      const response = await departmentApi.getAvailableMembers();

      console.log("=================================");
      console.log("AVAILABLE MEMBERS");
      console.log(response);
      console.log("=================================");

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
          "Không thể tải danh sách giáo viên và nhân viên",
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

    if (!member) {
      return;
    }

    console.log("SELECTED MEMBER:", member);

    memberForm.setFieldsValue({
      member_type: member.member_type,
    });
  };

  // =====================================================
  // ADD MEMBER
  // =====================================================

  const handleAddMember = async (values) => {
    try {
      if (!selectedDepartment?.id) {
        messageApi.warning("Vui lòng chọn tổ chuyên môn");

        return;
      }

      setMemberLoading(true);

      console.log("=================================");

      console.log("ADD MEMBER DATA:", {
        department_id: selectedDepartment.id,
        member_id: values.member_id,
        member_type: values.member_type,
      });

      console.log("=================================");

      await departmentApi.addMember(selectedDepartment.id, {
        member_id: values.member_id,
        member_type: values.member_type,
      });

      messageApi.success("Thêm thành viên vào tổ thành công");

      setMemberModalOpen(false);

      memberForm.resetFields();

      await openDetail(selectedDepartment);

      await fetchDepartments();
    } catch (error) {
      console.error("ADD MEMBER ERROR:", error);

      messageApi.error(
        error?.response?.data?.message || "Không thể thêm thành viên vào tổ",
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

      console.log("REMOVE MEMBER:", member);

      // Nếu API backend của bạn cần member_id
      // thì dùng member.id
      await departmentApi.removeMember(selectedDepartment.id, member.id);

      messageApi.success("Đã xóa thành viên khỏi tổ");

      await openDetail(selectedDepartment);

      await fetchDepartments();
    } catch (error) {
      console.error("REMOVE MEMBER ERROR:", error);

      messageApi.error(
        error?.response?.data?.message || "Không thể xóa thành viên khỏi tổ",
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const total = departments.length;

    const active = departments.filter(
      (item) =>
        item.status === "active" || item.status === 1 || item.status === "1",
    ).length;

    const teachers = departments.reduce(
      (sum, item) =>
        sum +
        Number(
          item.teacher_count || item.totalTeachers || item.total_teachers || 0,
        ),
      0,
    );

    const members = departments.reduce(
      (sum, item) =>
        sum +
        Number(
          item.member_count || item.totalMembers || item.total_members || 0,
        ),
      0,
    );

    return {
      total,
      active,
      teachers,
      members,
    };
  }, [departments]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredDepartments = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return departments;
    }

    return departments.filter((item) => {
      const name = item.name?.toLowerCase() || "";

      const type = item.type?.toLowerCase() || "";

      const description = item.description?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        type.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [departments, searchText]);

  // =====================================================
  // DEPARTMENT MEMBERS
  // =====================================================

  const departmentMembers =
    selectedDepartment?.members ||
    selectedDepartment?.organization_members ||
    selectedDepartment?.members_list ||
    [];

  // =====================================================
  // GET MEMBER TYPE
  // =====================================================

  const getMemberType = (member) => {
    if (member?.member_type === "teacher") {
      return "teacher";
    }

    if (member?.member_type === "staff") {
      return "staff";
    }

    if (member?.teacher_id || member?.teacher_code) {
      return "teacher";
    }

    return "staff";
  };

  // =====================================================
  // MEMBER NAME
  // =====================================================

  const getMemberName = (member) => {
    return member?.full_name || member?.name || "Không xác định";
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
      title: "Tên tổ chuyên môn",
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
                icon="solar:case-bold-duotone"
                style={{
                  fontSize: 22,
                }}
              />
            }
          />

          <div>
            <Text
              strong
              style={{
                fontSize: 14,
                color: "#0f172a",
              }}
            >
              {name}
            </Text>

            <br />

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              {record.description || "Tổ chuyên môn chuyên trách"}
            </Text>
          </div>
        </Space>
      ),
    },

    {
      title: "Số giáo viên",
      key: "teachers",
      align: "center",
      width: 160,

      render: (_, record) => {
        const count =
          record.teacher_count ||
          record.totalTeachers ||
          record.total_teachers ||
          0;

        return (
          <Tag
            style={{
              backgroundColor: "#e6f4ff",
              color: "#1677ff",
              borderColor: "#91caef",
              borderRadius: 8,
              padding: "3px 10px",
            }}
          >
            <Space size={5}>
              <Icon icon="solar:user-bold-duotone" />

              <span>{count} giáo viên</span>
            </Space>
          </Tag>
        );
      },
    },

    {
      title: "Tổng thành viên",
      key: "members",
      align: "center",
      width: 170,

      render: (_, record) => {
        const count =
          record.member_count ||
          record.totalMembers ||
          record.total_members ||
          0;

        return (
          <Tag
            style={{
              backgroundColor: "#f9f0ff",
              color: "#722ed1",
              borderColor: "#d3adf7",
              borderRadius: 8,
              padding: "3px 10px",
            }}
          >
            <Space size={5}>
              <Icon icon="solar:users-group-two-rounded-bold-duotone" />

              <span>{count} thành viên</span>
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
            style={{
              borderRadius: 20,
              padding: "2px 12px",
            }}
          >
            Đang hoạt động
          </Tag>
        ) : (
          <Tag
            color="default"
            style={{
              borderRadius: 20,
              padding: "2px 12px",
            }}
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
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              onClick={() => openDetail(record)}
              icon={
                <Icon
                  icon="solar:eye-bold-duotone"
                  style={{
                    fontSize: 19,
                    color: PRIMARY_COLOR,
                  }}
                />
              }
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              onClick={() => handleEdit(record)}
              icon={
                <Icon
                  icon="solar:pen-bold-duotone"
                  style={{
                    fontSize: 19,
                    color: PRIMARY_COLOR,
                  }}
                />
              }
            />
          </Tooltip>

          <Popconfirm
            title="Xóa tổ chuyên môn?"
            description="Tất cả thành viên sẽ được hủy liên kết khỏi tổ."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
            }}
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
                    style={{
                      fontSize: 19,
                    }}
                  />
                }
              />
            </Tooltip>
          </Popconfirm>
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
          .dept-card {
            border-radius: 16px !important;
            border: 1px solid #f0f0f0 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
            transition: all .3s ease !important;
          }

          .dept-card:hover {
            box-shadow: 0 8px 25px rgba(55,176,195,.12) !important;
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

          .member-card {
            transition: all .2s ease;
          }

          .member-card:hover {
            border-color: #bce8ee !important;
            box-shadow: 0 4px 15px rgba(55,176,195,.08);
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
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            background: "linear-gradient(135deg, #37B0C3 0%, #1d7e8e 100%)",
            padding: "28px 24px",
            borderRadius: 20,
            marginBottom: 24,
            color: "#fff",
            boxShadow: "0 10px 30px rgba(55,176,195,.22)",
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
                }}
              >
                Tổ chuyên môn
              </Tag>

              <Title
                level={2}
                style={{
                  color: "#fff",
                  margin: "10px 0 5px",
                }}
              >
                Quản lý tổ chuyên môn
              </Title>

              <Text
                style={{
                  color: "rgba(255,255,255,.85)",
                }}
              >
                Quản lý tổ chuyên môn, giáo viên và nhân viên trong nhà trường.
              </Text>
            </Col>

            <Col
              xs={24}
              md={8}
              style={{
                textAlign: "right",
                marginTop: 12,
              }}
            >
              <Space>
                <Button
                  size="large"
                  loading={loading}
                  onClick={fetchDepartments}
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
                  Thêm tổ
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <Row gutter={[16, 16]}>
          {[
            {
              title: "Tổng số tổ",
              value: statistics.total,
              unit: "đơn vị",
              icon: "solar:case-bold-duotone",
              bg: PRIMARY_BG,
              color: PRIMARY_COLOR,
            },
            {
              title: "Đang hoạt động",
              value: statistics.active,
              unit: "tổ",
              icon: "solar:check-circle-bold-duotone",
              bg: "#f6ffed",
              color: "#52c41a",
            },
            {
              title: "Tổng giáo viên",
              value: statistics.teachers,
              unit: "người",
              icon: "solar:user-bold-duotone",
              bg: "#f9f0ff",
              color: "#722ed1",
            },
            {
              title: "Tổng thành viên",
              value: statistics.members,
              unit: "người",
              icon: "solar:users-group-two-rounded-bold-duotone",
              bg: "#fff7e6",
              color: "#fa8c16",
            },
          ].map((item) => (
            <Col xs={24} sm={12} lg={6} key={item.title}>
              <Card
                className="dept-card"
                bodyStyle={{
                  padding: 20,
                }}
              >
                <Space size={16}>
                  <div
                    className="stat-icon-box"
                    style={{
                      background: item.bg,
                      color: item.color,
                    }}
                  >
                    <Icon icon={item.icon} />
                  </div>

                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {item.title}
                    </Text>

                    <Title
                      level={3}
                      style={{
                        margin: 0,
                      }}
                    >
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

        {/* =================================================
            TABLE
        ================================================= */}

        <Card
          className="dept-card"
          style={{
            marginTop: 24,
          }}
          title={
            <Space>
              <Icon
                icon="solar:list-bold-duotone"
                style={{
                  color: PRIMARY_COLOR,
                  fontSize: 22,
                }}
              />

              <span>Danh sách tổ chuyên môn</span>
            </Space>
          }
          extra={
            <Input
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm tổ..."
              prefix={<Icon icon="solar:magnifer-linear" />}
              style={{
                width: 250,
                borderRadius: 10,
              }}
            />
          }
        >
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filteredDepartments}
            scroll={{
              x: 900,
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} tổ`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Chưa có dữ liệu tổ chuyên môn"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Card>

        {/* =================================================
            CREATE / EDIT MODAL
        ================================================= */}

        <Modal
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSubmit}
          confirmLoading={loading}
          destroyOnClose
          okText={editingDepartment ? "Lưu thay đổi" : "Thêm mới"}
          cancelText="Hủy"
          title={
            <Space>
              <Icon
                icon={
                  editingDepartment
                    ? "solar:pen-bold-duotone"
                    : "solar:add-circle-bold-duotone"
                }
                style={{
                  color: PRIMARY_COLOR,
                  fontSize: 22,
                }}
              />

              <span>
                {editingDepartment
                  ? "Cập nhật tổ chuyên môn"
                  : "Thêm tổ chuyên môn"}
              </span>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            style={{
              marginTop: 20,
            }}
          >
            <Form.Item
              label="Tên tổ chuyên môn"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên tổ",
                },
              ]}
            >
              <Input
                placeholder="Ví dụ: Tổ Toán - Tin"
                style={{
                  borderRadius: 8,
                }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Loại tổ chức" name="type">
                  <Select>
                    <Option value="department">Tổ chuyên môn</Option>

                    <Option value="management">Ban giám hiệu</Option>

                    <Option value="union">Công đoàn</Option>

                    <Option value="youth_union">Chi đoàn</Option>

                    <Option value="team">Tổng phụ trách Đội</Option>
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

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea
                rows={4}
                placeholder="Mô tả chức năng, nhiệm vụ..."
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* =================================================
            DETAIL DRAWER
        ================================================= */}

        <Drawer
          width={650}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedDepartment(null);
          }}
          title={
            <Space>
              <Avatar
                shape="square"
                style={{
                  background: PRIMARY_BG,
                  color: PRIMARY_COLOR,
                }}
                icon={<Icon icon="solar:case-bold-duotone" />}
              />

              <div>
                <Text strong>{selectedDepartment?.name || "Chi tiết tổ"}</Text>

                <br />

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                  }}
                >
                  Quản lý thành viên tổ
                </Text>
              </div>
            </Space>
          }
        >
          <Spin spinning={detailLoading}>
            {selectedDepartment ? (
              <>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Tên tổ">
                    {selectedDepartment.name}
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại">
                    <Tag color="cyan">
                      {selectedDepartment.type || "Tổ chuyên môn"}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Trạng thái">
                    <Badge
                      status={
                        selectedDepartment.status === "active"
                          ? "success"
                          : "default"
                      }
                      text={
                        selectedDepartment.status === "active"
                          ? "Đang hoạt động"
                          : "Ngừng hoạt động"
                      }
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="Mô tả">
                    {selectedDepartment.description || "Chưa có mô tả"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Tổng thành viên">
                    <strong>{departmentMembers.length}</strong> người
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Row
                  justify="space-between"
                  align="middle"
                  style={{
                    marginBottom: 16,
                  }}
                >
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                    }}
                  >
                    Danh sách thành viên
                  </Title>

                  <Button
                    type="primary"
                    icon={<Icon icon="solar:user-plus-bold-duotone" />}
                    onClick={openAddMember}
                    style={{
                      background: PRIMARY_COLOR,
                      borderColor: PRIMARY_COLOR,
                    }}
                  >
                    Thêm thành viên
                  </Button>
                </Row>

                {departmentMembers.length === 0 ? (
                  <Empty
                    description="Chưa có thành viên"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Space
                    direction="vertical"
                    style={{
                      width: "100%",
                    }}
                  >
                    {departmentMembers.map((member, index) => {
                      const type = getMemberType(member);

                      const isTeacher = type === "teacher";

                      return (
                        <Card
                          key={`${member.id}-${type}-${index}`}
                          size="small"
                          className="member-card"
                          style={{
                            borderRadius: 12,
                          }}
                        >
                          <Row justify="space-between" align="middle">
                            <Col>
                              <Space>
                                <Avatar
                                  style={{
                                    background: isTeacher
                                      ? PRIMARY_BG
                                      : "#fff7e6",
                                    color: isTeacher
                                      ? PRIMARY_COLOR
                                      : "#fa8c16",
                                  }}
                                >
                                  {getMemberName(member)
                                    .charAt(0)
                                    .toUpperCase()}
                                </Avatar>

                                <div>
                                  <Text strong>{getMemberName(member)}</Text>

                                  <br />

                                  <Space size={5}>
                                    <Tag color={isTeacher ? "cyan" : "orange"}>
                                      {isTeacher ? "Giáo viên" : "Nhân viên"}
                                    </Tag>

                                    {member.teacher_code && (
                                      <Text type="secondary">
                                        {member.teacher_code}
                                      </Text>
                                    )}
                                  </Space>

                                  {member.phone && (
                                    <>
                                      <br />

                                      <Text
                                        type="secondary"
                                        style={{
                                          fontSize: 12,
                                        }}
                                      >
                                        📞 {member.phone}
                                      </Text>
                                    </>
                                  )}
                                </div>
                              </Space>
                            </Col>

                            <Col>
                              <Popconfirm
                                title="Xóa thành viên?"
                                description="Thành viên sẽ bị hủy liên kết khỏi tổ."
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{
                                  danger: true,
                                }}
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

        {/* =================================================
            ADD MEMBER MODAL
        ================================================= */}

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
                style={{
                  color: PRIMARY_COLOR,
                  fontSize: 22,
                }}
              />

              <span>Thêm thành viên vào tổ</span>
            </Space>
          }
        >
          <Form
            form={memberForm}
            layout="vertical"
            onFinish={handleAddMember}
            style={{
              marginTop: 20,
            }}
          >
            {/* MEMBER */}

            <Form.Item
              label="Chọn giáo viên / nhân viên"
              name="member_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thành viên",
                },
              ]}
            >
              <Select
                showSearch
                loading={memberLoading}
                placeholder="Chọn giáo viên hoặc nhân viên"
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
                              color={isTeacher ? "cyan" : "orange"}
                              style={{
                                margin: 0,
                              }}
                            >
                              {isTeacher ? "Giáo viên" : "Nhân viên"}
                            </Tag>

                            {member.teacher_code && (
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: 11,
                                }}
                              >
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

            {/* MEMBER TYPE */}

            <Form.Item
              label="Loại thành viên"
              name="member_type"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại thành viên",
                },
              ]}
            >
              <Select placeholder="Chọn loại thành viên">
                <Option value="teacher">Giáo viên</Option>

                <Option value="staff">Nhân viên</Option>
              </Select>
            </Form.Item>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: 10,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                💡 Loại thành viên sẽ được tự động chọn theo dữ liệu giáo viên /
                nhân viên. Bạn có thể kiểm tra lại trước khi thêm.
              </Text>
            </div>

            {/* ACTION */}

            <Form.Item
              style={{
                marginBottom: 0,
              }}
            >
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
                    Thêm thành viên
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

export default DepartmentPage;
