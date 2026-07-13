import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  DatePicker,
  Statistic,
  Divider,
  message,
} from "antd";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import studentApi from "../../api/studentApi";
import classApi from "../../api/classApi";

const { Option } = Select;
const { Title, Text } = Typography;

const StudentList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // States quản lý dữ liệu từ API gửi về
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // States điều khiển giao diện
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // States lưu trữ bộ lọc tìm kiếm
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(undefined);

  // State theo dõi phân trang đồng bộ với Antd Table
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // ================= AXIOS / API FETCH DATA =================
  const fetchData = useCallback(
    async (page = 1, pageSize = 10, searchKey = "", classId = "") => {
      setLoading(true);
      try {
        const response = await studentApi.getAll({
          page: page,
          limit: pageSize,
          search: searchKey,
          class_id: classId || "",
        });

        const resData = response ? response : response;

        if (resData.success) {
          setData(resData.data || []);
          setTotal(resData.total || 0);
        } else {
          message.error(resData.message || "Lỗi lấy dữ liệu từ Server");
        }
      } catch (err) {
        console.error("Lỗi Fetch Data:", err);
        message.error("Không thể kết nối tới máy chủ.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadClasses = async () => {
    try {
      const response = await classApi.getAll();
      const resData = response.data ? response.data : response;
      setClasses(resData.data || resData || []);
    } catch (err) {
      console.error("Lỗi tải lớp học:", err);
    }
  };

  useEffect(() => {
    loadClasses();
    fetchData(1, pagination.pageSize, "", "");
  }, [fetchData]);

  // ================= FILTERS CHANGE HANDLERS =================
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, value, selectedClass);
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, search, value);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedClass(undefined);
    setPagination({ current: 1, pageSize: 10 });
    fetchData(1, 10, "", "");
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchData(
      newPagination.current,
      newPagination.pageSize,
      search,
      selectedClass,
    );
  };

  // ================= CRUD WRITE HANDLERS =================
  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
      };

      let response;
      if (editing) {
        response = await studentApi.update(editing.id, payload);
      } else {
        response = await studentApi.create(payload);
      }

      const resData = response.data ? response.data : response;

      if (resData.success) {
        message.success(resData.message || "Thao tác thành công!");
        setOpen(false);
        form.resetFields();
        fetchData(
          pagination.current,
          pagination.pageSize,
          search,
          selectedClass,
        );
      } else {
        message.error(resData.message || "Xử lý dữ liệu thất bại.");
      }
    } catch (err) {
      console.error("Lỗi Submit Form:", err);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      birthday: record.birthday ? dayjs(record.birthday) : null,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await studentApi.remove(id);
      const resData = response.data ? response.data : response;

      if (resData.success) {
        message.success(resData.message || "Đã xóa học sinh.");
        fetchData(
          pagination.current,
          pagination.pageSize,
          search,
          selectedClass,
        );
      } else {
        message.error(resData.message || "Xóa thất bại.");
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể thực hiện lệnh xóa.");
    }
  };

  // ================= TABLE COLUMNS DEFINITION =================
  const columns = [
    {
      title: "Mã HS",
      dataIndex: "student_code",
      width: 110,
      fixed: "left",
      render: (code) => (
        <Text strong style={styles.codeText}>
          {code?.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      ellipsis: true,
      render: (name) => (
        <Text style={{ fontWeight: 600, color: "#1e293b" }}>{name}</Text>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "class_name",
      width: 140,
      render: (name) => (
        <Tag
          color={name ? "cyan" : "default"}
          style={{
            ...styles.classTag,
            backgroundColor: name ? "#eefafc" : "#f1f5f9",
            color: name ? "#37B0C3" : "#64748b",
          }}
        >
          {name ? `● ${name}` : "○ Chưa phân lớp"}
        </Tag>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      width: 110,
      align: "center",
      render: (gender) => (
        <Tag
          color={
            gender === "Nam" ? "blue" : gender === "Nữ" ? "magenta" : "default"
          }
          bordered={false}
          style={styles.tag}
        >
          <Space size={4}>
            {gender === "Nam" ? (
              <Icon icon="solar:user-rounded-bold" />
            ) : gender === "Nữ" ? (
              <Icon icon="solar:user-rounded-bold-duotone" />
            ) : null}
            <span>{gender || "Khác"}</span>
          </Space>
        </Tag>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "---"),
    },
    {
      title: "Thông tin liên hệ",
      width: 220,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: "13px", fontWeight: 500, color: "#334155" }}>
            {r.phone || "---"}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {r.email || "---"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:eye-linear"
                  style={{ color: "#37B0C3", fontSize: "18px" }}
                />
              }
              onClick={() => navigate(`/admin/students/${record.id}`)}
              style={styles.actionBtn}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:pen-linear"
                  style={{ color: "#eab308", fontSize: "18px" }}
                />
              }
              onClick={() => handleEdit(record)}
              style={styles.actionBtn}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa học sinh này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            centered
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                shape="circle"
                danger
                icon={
                  <Icon
                    icon="solar:trash-bin-trash-linear"
                    style={{ fontSize: "18px" }}
                  />
                }
                style={styles.actionBtn}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "4px" }}>
      {/* SECTION 1: TOP BAR */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title
            level={3}
            style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
          >
            Hồ sơ Học sinh
          </Title>
          <Text type="secondary">
            Hệ thống quản lý thông tin và điều phối phân tách lớp học đồng bộ dữ
            liệu
          </Text>
        </Col>
        <Col>
          <Space size="middle">
            <Button
              icon={
                <Icon
                  icon="solar:restart-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              onClick={handleResetFilters}
              size="large"
              style={{ borderRadius: 8 }}
            >
              Làm mới bộ lọc
            </Button>
            <Button
              type="primary"
              icon={
                <Icon
                  icon="solar:add-circle-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              size="large"
              onClick={() => {
                setOpen(true);
                setEditing(null);
                form.resetFields();
              }}
              style={styles.addBtn}
            >
              Thêm học sinh mới
            </Button>
          </Space>
        </Col>
      </Row>

      {/* SECTION 2: LIVE SEARCH COUNT */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={
                <Text style={{ color: "#64748b", fontSize: "14px" }}>
                  Kết quả tìm thấy
                </Text>
              }
              value={total}
              prefix={
                <div style={{ ...styles.iconBox, background: "#eefafc" }}>
                  <Icon
                    icon="solar:users-group-two-rounded-linear"
                    style={{ color: "#37B0C3" }}
                  />
                </div>
              }
              valueStyle={{
                color: "#0f172a",
                fontWeight: 700,
                fontSize: "24px",
              }}
              suffix={
                <span
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    marginLeft: "4px",
                  }}
                >
                  Học sinh
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* SECTION 3: DATATABLE CARD */}
      <Card bordered={false} style={styles.tableCard}>
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={8}>
            <Text strong style={styles.filterLabel}>
              Tìm kiếm từ khóa
            </Text>
            <Input
              placeholder="Nhập tên hoặc mã học sinh..."
              prefix={
                <Icon
                  icon="solar:magnifer-linear"
                  style={{ color: "#bfbfbf", fontSize: "18px" }}
                />
              }
              size="large"
              allowClear
              value={search}
              onChange={handleSearchChange}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={styles.filterLabel}>
              Phân loại theo lớp
            </Text>
            <Select
              placeholder="Tất cả các lớp"
              size="large"
              style={{ width: "100%" }}
              allowClear
              value={selectedClass}
              onChange={handleClassChange}
              dropdownStyle={{ borderRadius: 8 }}
            >
              {classes.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.class_name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1050 }}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (totalCount) =>
              `Hiển thị dữ liệu: tìm thấy tổng cộng ${totalCount} học sinh`,
          }}
        />
      </Card>

      {/* SECTION 4: MODAL FORM DIALOG */}
      <Modal
        open={open}
        title={
          <Space size={8}>
            <Icon
              icon={
                editing
                  ? "solar:pen-bold-duotone"
                  : "solar:add-circle-bold-duotone"
              }
              style={{ color: "#37B0C3", fontSize: "22px" }}
            />
            <Title
              level={4}
              style={{ margin: 0, fontSize: 18, color: "#0f172a" }}
            >
              {editing ? "Cập Nhật Hồ Sơ Học Sinh" : "Thêm Học Sinh Mới"}
            </Title>
          </Space>
        }
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? "Lưu thay đổi" : "Thêm học sinh"}
        cancelText="Hủy"
        destroyOnClose
        centered
        width={680}
        okButtonProps={{
          style: { backgroundColor: "#37B0C3", borderColor: "#37B0C3" },
        }}
      >
        <Divider style={{ marginTop: 10, marginBottom: 24 }} />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="student_code"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Mã học sinh
                  </Text>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập mã học sinh!" },
                ]}
              >
                <Input
                  placeholder="Ví dụ: HS001"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="full_name"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Họ và tên
                  </Text>
                }
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input
                  placeholder="Nhập đầy đủ họ tên"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="gender"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Giới tính
                  </Text>
                }
              >
                <Select
                  placeholder="Chọn"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                >
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="birthday"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Ngày sinh
                  </Text>
                }
              >
                <DatePicker
                  style={{ width: "100%", borderRadius: 8 }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  variant="filled"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="class_id"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Lớp học hiện tại
                  </Text>
                }
                rules={[
                  { required: true, message: "Vui lòng chỉ định lớp học!" },
                ]}
              >
                <Select
                  placeholder="Chọn lớp"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                >
                  {classes.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.class_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Số điện thoại
                  </Text>
                }
              >
                <Input
                  placeholder="Nhập số điện thoại liên lạc"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Địa chỉ Email
                  </Text>
                }
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
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address"
                label={
                  <Text strong style={{ fontSize: "13px" }}>
                    Địa chỉ thường trú
                  </Text>
                }
              >
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập chi tiết địa chỉ nơi ở hiện tại (Số nhà, đường, tỉnh thành...)"
                  variant="filled"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

// SYSTEM GLOBAL STYLES COHESIVE SYSTEM
const styles = {
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  statCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  addBtn: {
    borderRadius: 8,
    fontWeight: 600,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
  },
  filterLabel: {
    display: "block",
    marginBottom: 8,
    color: "#475569",
    fontSize: "13px",
  },
  codeText: {
    fontWeight: 700,
    color: "#334155",
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f1f5f9",
    padding: "3px 6px",
    borderRadius: 4,
  },
  tag: { borderRadius: 6, fontWeight: 500, padding: "2px 8px" },
  classTag: {
    borderRadius: 6,
    fontWeight: 500,
    padding: "4px 10px",
    border: "none",
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
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    marginRight: "12px",
  },
};

export default StudentList;
