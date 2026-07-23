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
  DatePicker,
  Popconfirm,
  Tooltip,
  Empty,
} from "antd";

import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ManOutlined,
  WomanOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import staffApi from "../../../api/staffApi";
import CanRole from "../../../components/CanRole"; // Import phân quyền
import { ROLES } from "../../../constants/roles"; // Import bộ Role

const { Title, Text } = Typography;
const { Option } = Select;

function StaffPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // =====================================================
  // STATE
  // =====================================================
  const [staff, setStaff] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    male: 0,
    female: 0,
    other: 0,
  });

  const [loading, setLoading] = useState(false);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // =====================================================
  // FILTER
  // =====================================================
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [genderFilter, setGenderFilter] = useState(undefined);
  const [departmentFilter, setDepartmentFilter] = useState(undefined);

  // =====================================================
  // PAGINATION
  // =====================================================
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // =====================================================
  // LOAD DATA
  // =====================================================
  useEffect(() => {
    fetchStaff();
  }, [
    pagination.current,
    pagination.pageSize,
    statusFilter,
    genderFilter,
    departmentFilter,
  ]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // =====================================================
  // GET STAFF
  // =====================================================
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (genderFilter) params.gender = genderFilter;
      if (departmentFilter) params.department = departmentFilter;

      const response = await staffApi.getAll(params);

      if (response) {
        setStaff(response || []);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination?.total || 0,
        }));
      } else {
        setStaff([]);
        messageApi.error(
          response?.message || "Không thể tải danh sách nhân viên",
        );
      }
    } catch (error) {
      console.error("GET STAFF ERROR:", error);
      messageApi.error(
        error?.response?.data?.message || "Không thể tải danh sách nhân viên",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET STATISTICS
  // =====================================================
  const fetchStatistics = async () => {
    try {
      setLoadingStatistics(true);
      const response = await staffApi.getStatistics();
      if (response) {
        setStatistics(
          response || {
            total: 0,
            active: 0,
            inactive: 0,
            male: 0,
            female: 0,
            other: 0,
          },
        );
      }
    } catch (error) {
      console.error("GET STAFF STATISTICS ERROR:", error);
    } finally {
      setLoadingStatistics(false);
    }
  };

  // =====================================================
  // SEARCH & RESET
  // =====================================================
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchStaff();
  };

  const handleResetFilter = () => {
    setSearch("");
    setStatusFilter(undefined);
    setGenderFilter(undefined);
    setDepartmentFilter(undefined);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationInfo) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }));
  };

  // =====================================================
  // MODAL ACTIONS
  // =====================================================
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: "active" });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      user_id: record.user_id || null,
      full_name: record.full_name,
      gender: record.gender || null,
      date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
      phone: record.phone || "",
      email: record.email || "",
      position: record.position || "",
      department: record.department || "",
      address: record.address || "",
      status: record.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        user_id: values.user_id || null,
        full_name: values.full_name?.trim(),
        gender: values.gender || null,
        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : null,
        phone: values.phone || null,
        email: values.email || null,
        position: values.position || null,
        department: values.department || null,
        address: values.address || null,
        status: values.status || "active",
      };

      if (editingRecord) {
        const response = await staffApi.update(editingRecord.id, payload);
        if (response) {
          messageApi.success("Cập nhật nhân viên thành công");
        } else {
          throw new Error(response?.message || "Cập nhật thất bại");
        }
      } else {
        const response = await staffApi.create(payload);
        if (response) {
          messageApi.success("Thêm nhân viên thành công");
        } else {
          throw new Error(response?.message || "Thêm nhân viên thất bại");
        }
      }

      handleCloseModal();
      await fetchStaff();
      await fetchStatistics();
    } catch (error) {
      console.error("CREATE / UPDATE STAFF ERROR:", error);
      if (error?.errorFields) return;
      messageApi.error(
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      );
    }
  };

  // =====================================================
  // DELETE & STATUS CHANGE
  // =====================================================
  const handleDelete = async (id) => {
    try {
      await staffApi.delete(id);
      messageApi.success("Xóa nhân viên thành công");
      await fetchStaff();
      await fetchStatistics();
    } catch (error) {
      console.error("DELETE STAFF ERROR:", error);
      messageApi.error("Không thể xóa nhân viên");
    }
  };

  const handleChangeStatus = async (record) => {
    try {
      const newStatus = record.status === "active" ? "inactive" : "active";
      await staffApi.updateStatus(record.id, newStatus);
      messageApi.success(
        newStatus === "active"
          ? "Đã kích hoạt nhân viên"
          : "Đã ngừng hoạt động nhân viên",
      );
      await fetchStaff();
      await fetchStatistics();
    } catch (error) {
      console.error("CHANGE STAFF STATUS ERROR:", error);
      messageApi.error(
        error?.response?.data?.message || "Không thể cập nhật trạng thái",
      );
    }
  };

  const renderGender = (gender) => {
    if (gender === "male") return <Tag color="blue">Nam</Tag>;
    if (gender === "female") return <Tag color="magenta">Nữ</Tag>;
    return <Tag>Khác</Tag>;
  };

  const renderStatus = (status) => {
    if (status === "active") {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Đang hoạt động
        </Tag>
      );
    }
    return (
      <Tag color="default" icon={<StopOutlined />}>
        Ngừng hoạt động
      </Tag>
    );
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const columns = [
    {
      title: "Nhân viên",
      key: "staff",
      fixed: "left",
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar
            size={44}
            style={{ background: "#37b0c3" }}
            icon={<UserOutlined />}
          />
          <div>
            <Text strong>{record.full_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: renderGender,
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 220,
      render: (_, record) => (
        <div>
          <div>
            <Text>{record.phone || "Chưa có SĐT"}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email || "Chưa có email"}
          </Text>
        </div>
      ),
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      key: "position",
      width: 180,
      render: (position) =>
        position || <Text type="secondary">Chưa phân công</Text>,
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 180,
      render: (department) =>
        department || <Text type="secondary">Chưa phân công</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          {/* Sửa thông tin: Admin, Hiệu trưởng, Nhân viên văn phòng */}
          <CanRole
            allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.OFFICE_STAFF]}
          >
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          </CanRole>

          {/* Đổi trạng thái active/inactive */}
          <CanRole
            allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.OFFICE_STAFF]}
          >
            <Tooltip
              title={
                record.status === "active" ? "Ngừng hoạt động" : "Kích hoạt"
              }
            >
              <Button
                type="text"
                icon={
                  record.status === "active" ? (
                    <StopOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                onClick={() => handleChangeStatus(record)}
              />
            </Tooltip>
          </CanRole>

          {/* Xóa nhân viên: Quyền tối cao chỉ Admin & Hiệu trưởng */}
          <CanRole allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL]}>
            <Popconfirm
              title="Xóa nhân viên"
              description={`Bạn có chắc muốn xóa "${record.full_name}"?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record.id)}
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </CanRole>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      {/* =================================================
          HEADER
      ================================================= */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
            Quản lý nhân viên
          </Title>
          <Text type="secondary">
            Quản lý thông tin nhân viên và cán bộ trong nhà trường
          </Text>
        </Col>

        {/* Nút thêm mới: Chỉ Admin, Hiệu trưởng và Nhân viên VP */}
        <Col>
          <CanRole
            allowRoles={[ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.OFFICE_STAFF]}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ height: 42, borderRadius: 8, background: "#37b0c3" }}
            >
              Thêm nhân viên
            </Button>
          </CanRole>
        </Col>
      </Row>

      {/* =================================================
          STATISTICS
      ================================================= */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              loading={loadingStatistics}
              title="Tổng nhân viên"
              value={statistics.total}
              prefix={<TeamOutlined style={{ color: "#37b0c3" }} />}
              suffix="người"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              loading={loadingStatistics}
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              suffix="người"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              loading={loadingStatistics}
              title="Nam"
              value={statistics.male}
              prefix={<ManOutlined style={{ color: "#1677ff" }} />}
              suffix="người"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              loading={loadingStatistics}
              title="Nữ"
              value={statistics.female}
              prefix={<WomanOutlined style={{ color: "#eb2f96" }} />}
              suffix="người"
            />
          </Card>
        </Col>
      </Row>

      {/* =================================================
          FILTER
      ================================================= */}
      <Card style={{ marginTop: 24 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8} lg={7}>
            <Input
              allowClear
              value={search}
              prefix={<SearchOutlined />}
              placeholder="Tìm tên, SĐT, email, chức vụ..."
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Select
              allowClear
              value={statusFilter}
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              onChange={setStatusFilter}
            >
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <Select
              allowClear
              value={genderFilter}
              placeholder="Giới tính"
              style={{ width: "100%" }}
              onChange={setGenderFilter}
            >
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Col>

          <Col xs={24} md={5}>
            <Input
              allowClear
              value={departmentFilter}
              placeholder="Phòng ban"
              onChange={(e) => setDepartmentFilter(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>

          <Col xs={24} md={3}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Tìm
              </Button>
              <Tooltip title="Đặt lại bộ lọc">
                <Button icon={<ReloadOutlined />} onClick={handleResetFilter} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* =================================================
          TABLE
      ================================================= */}
      <Card
        style={{ marginTop: 24 }}
        title={
          <Space>
            <TeamOutlined style={{ fontSize: 20, color: "#37b0c3" }} />
            <span>Danh sách nhân viên</span>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={staff}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: <Empty description="Không có dữ liệu nhân viên" />,
          }}
        />
      </Card>

      {/* =================================================
          MODAL
      ================================================= */}
      <Modal
        title={editingRecord ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText={editingRecord ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="ID tài khoản" name="user_id">
                <Input type="number" placeholder="Nhập ID tài khoản" />
              </Form.Item>
            </Col>

            <Col xs={24} md={16}>
              <Form.Item
                label="Họ và tên"
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input placeholder="Nhập họ và tên nhân viên" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Giới tính" name="gender">
                <Select allowClear placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Ngày sinh" name="date_of_birth">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Số điện thoại" name="phone">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
              >
                <Input placeholder="example@gmail.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Chức vụ" name="position">
                <Input placeholder="Ví dụ: Nhân viên hành chính" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Phòng ban" name="department">
                <Input placeholder="Ví dụ: Phòng hành chính" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Trạng thái" name="status" initialValue="active">
                <Select>
                  <Option value="active">Đang hoạt động</Option>
                  <Option value="inactive">Ngừng hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Địa chỉ" name="address">
                <Input.TextArea rows={3} placeholder="Nhập địa chỉ nhân viên" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}

export default StaffPage;
