import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Typography,
  Card,
  Tooltip,
  Select,
} from "antd";
import { Icon } from "@iconify/react";
import classApi from "../../../api/classApi";
import teacherApi from "../../../api/teacherApi";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ClassList = () => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);

  const navigate = useNavigate();

  // ================= FETCH =================
  const fetchTeachers = async () => {
    try {
      const res = await teacherApi.getAll();
      setTeachers(res.data || []);
    } catch (err) {
      console.log("Teacher load error:", err);
      setTeachers([]);
    }
  };
  const fetchData = async (page = 1, limit = 10, searchText = "") => {
    try {
      setLoading(true);
      const res = await classApi.getAll({
        page,
        limit,
        search: searchText,
      });

      setData(res.data || []);
      setPagination({
        page: res.page || page,
        limit: limit,
        total: res.total || 0,
      });
    } catch (err) {
      console.log("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTeachers();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await classApi.update(editing.id, values);
      } else {
        await classApi.create(values);
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
      fetchData(pagination.page, pagination.limit, search);
    } catch (err) {
      console.log("Submit error:", err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await classApi.remove(id);
      fetchData(pagination.page, pagination.limit, search);
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // ================= TABLE =================
  const columns = [
    {
      title: "Tên lớp",
      dataIndex: "class_name",
      width: 150,
      fixed: "left",
      render: (name) => (
        <Space size={8}>
          <Icon
            icon="solar:chair-is-linear"
            style={{ color: "#37B0C3", fontSize: "18px" }}
          />
          <Text strong style={{ color: "#0f172a" }}>
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Năm học",
      dataIndex: "school_year",
      width: 150,
      align: "center",
      render: (text) => (
        <Tag color="blue" bordered={false} style={styles.tag}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Giáo viên chủ nhiệm",
      dataIndex: "homeroom_teacher",
      render: (teacher) =>
        teacher ? (
          <Tag
            color="success"
            style={{
              ...styles.tagStatus,
              backgroundColor: "#f0fdf4",
              color: "#16a34a",
            }}
          >
            ● {teacher}
          </Tag>
        ) : (
          <Tag
            color="default"
            style={{
              ...styles.tagStatus,
              backgroundColor: "#f1f5f9",
              color: "#64748b",
            }}
          >
            ○ Chưa phân công
          </Tag>
        ),
    },
    {
      title: "Sĩ số hiện tại",
      dataIndex: "total_students",
      width: 140,
      align: "center",
      render: (count) => <BadgeCount count={count || 0} />,
    },
    {
      title: "Thao tác",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết lớp">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:eye-linear"
                  style={{ color: "#37B0C3", fontSize: "18px" }}
                />
              }
              onClick={() => navigate(`/admin/classes/${record.id}`)}
              style={styles.actionBtn}
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:pen-linear"
                  style={{ color: "#eab308", fontSize: "18px" }}
                />
              }
              onClick={() => {
                setEditing(record);
                form.setFieldsValue(record);
                setOpen(true);
              }}
              style={styles.actionBtn}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa lớp học"
            description="Tất cả dữ liệu liên quan sẽ bị ảnh hưởng. Xác nhận xóa?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
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
    <div style={styles.container}>
      {/* Tiêu đề trang độc lập */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title
            level={3}
            style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
          >
            Quản lý Lớp học
          </Title>
          <Text type="secondary">
            Danh mục các khối lớp, năm học và phân công giáo viên chủ nhiệm
          </Text>
        </Col>
        <Col>
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
              setEditing(null);
              form.resetFields();
              setOpen(true);
            }}
            style={styles.addBtn}
          >
            Thêm lớp học mới
          </Button>
        </Col>
      </Row>

      {/* Card chứa bảng và bộ lọc */}
      <Card bordered={false} style={styles.tableCard}>
        <div style={{ marginBottom: 20 }}>
          <Row>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm tên lớp học..."
                size="large"
                allowClear
                prefix={
                  <Icon
                    icon="solar:magnifer-linear"
                    style={{ color: "#bfbfbf", fontSize: "18px" }}
                  />
                }
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchData(1, pagination.limit, e.target.value);
                }}
                style={{ borderRadius: 8 }}
              />
            </Col>
          </Row>
        </div>

        <Table
          loading={loading}
          dataSource={data}
          columns={columns}
          rowKey="id"
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) =>
              `Hiển thị dữ liệu: tìm thấy tổng cộng ${total} lớp học`,
            onChange: (page, limit) => fetchData(page, limit, search),
          }}
        />
      </Card>

      {/* MODAL THÊM / CẬP NHẬT HIỆN ĐẠI */}
      <Modal
        open={open}
        title={
          <Space size={8}>
            <div style={styles.iconHeadingBox}>
              <Icon
                icon={
                  editing
                    ? "solar:pen-bold-duotone"
                    : "solar:add-circle-bold-duotone"
                }
                style={{ color: "#37B0C3", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontSize: 18, color: "#0f172a" }}
            >
              {editing ? "Cập Nhật Thông Tin Lớp" : "Khởi Tạo Lớp Học Mới"}
            </Title>
          </Space>
        }
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? "Lưu thay đổi" : "Tạo lớp học"}
        cancelText="Hủy bỏ"
        destroyOnClose
        centered
        width={480}
        okButtonProps={{
          style: { backgroundColor: "#37B0C3", borderColor: "#37B0C3" },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="class_name"
            label={
              <Text strong style={styles.fieldLabel}>
                Tên lớp học
              </Text>
            }
            rules={[{ required: true, message: "Vui lòng nhập tên lớp!" }]}
          >
            <Input
              placeholder="Ví dụ: 10A1, 11B2..."
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="school_year"
            label={
              <Text strong style={styles.fieldLabel}>
                Khóa / Năm học
              </Text>
            }
            rules={[{ required: true, message: "Vui lòng nhập năm học!" }]}
          >
            <Input
              placeholder="Ví dụ: 2026-2027"
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="homeroom_teacher_id"
            label={
              <Text strong style={styles.fieldLabel}>
                Giáo viên chủ nhiệm
              </Text>
            }
          >
            <Select
              placeholder="Chọn giáo viên chủ nhiệm"
              allowClear
              showSearch
              optionFilterProp="children"
              variant="filled"
              dropdownStyle={{ borderRadius: 8 }}
              style={{ borderRadius: 8 }}
            >
              {teachers.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.teacher_code} - {t.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Component hiển thị Sĩ số dạng Tag Badge gọn gàng tone màu Cyan tương ứng
const BadgeCount = ({ count }) => (
  <span
    style={{
      backgroundColor: "#eefafc",
      color: "#37B0C3",
      padding: "4px 12px",
      borderRadius: "6px",
      fontWeight: 600,
      fontSize: "13px",
      border: "1px solid #c9eff4",
    }}
  >
    {count} HS
  </span>
);

const styles = {
  container: {
    padding: "4px",
  },
  tableCard: {
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
  iconHeadingBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#eefafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: "13px",
    color: "#475569",
  },
  tag: {
    borderRadius: 6,
    fontWeight: 500,
    padding: "2px 8px",
  },
  tagStatus: {
    borderRadius: 6,
    fontWeight: 500,
    padding: "3px 10px",
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
};

export default ClassList;
