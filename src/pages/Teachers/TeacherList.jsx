import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Row,
  Col,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Typography,
  Avatar as AntdAvatar,
} from "antd";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import teacherApi from "../../api/teacherApi";

const { Search } = Input;
const { Title, Text } = Typography;

// Hàm tiện ích format ngày tháng năm (DD/MM/YYYY)
const formatDate = (dateStr) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function TeacherList() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchTeachers = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = search,
  ) => {
    try {
      setLoading(true);
      const res = await teacherApi.getAll({
        page,
        limit: pageSize,
        search: keyword,
      });

      setTeachers(res.data || []);
      setPagination({
        current: page,
        pageSize,
        total: res.total || 0,
      });
    } catch (error) {
      console.log(error);
      message.error("Không tải được danh sách giáo viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (id) => {
    try {
      await teacherApi.remove(id);
      message.success("Xóa giáo viên thành công");
      fetchTeachers();
    } catch (error) {
      console.log(error);
      message.error("Xóa giáo viên thất bại");
    }
  };

  const columns = [
    {
      title: "Mã GV",
      dataIndex: "teacher_code",
      width: 100,
      fixed: "left",
      render: (code) => (
        <Text style={styles.codeText}>{code?.toUpperCase()}</Text>
      ),
    },
    {
      title: "Giáo viên",
      key: "teacher_profile",
      width: 240,
      render: (_, record) => (
        <Space size="middle">
          <AntdAvatar
            src={record.avatar}
            icon={
              <Icon
                icon="solar:user-rounded-linear"
                style={{ fontSize: "20px" }}
              />
            }
            style={{
              backgroundColor: record.gender === "Nam" ? "#37B0C3" : "#f43f5e",
              boxShadow: "0 2px 8px rgba(55, 176, 195, 0.15)",
            }}
          />
          <Space direction="vertical" size={0}>
            <Text style={styles.nameText}>{record.full_name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sinh ngày: {formatDate(record.birthday)}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      width: 110,
      align: "center",
      render: (gender) => (
        <Tag
          color={gender === "Nam" ? "blue" : "magenta"}
          bordered={false}
          style={styles.tag}
        >
          <Space size={4}>
            {gender === "Nam" ? (
              <Icon icon="solar:user-rounded-bold" />
            ) : (
              <Icon icon="solar:user-rounded-bold-duotone" />
            )}
            <span>{gender || "Khác"}</span>
          </Space>
        </Tag>
      ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>
            {record.phone}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Địa chỉ thường trú",
      dataIndex: "address",
      width: 180,
      ellipsis: true,
      render: (address) => address || "---",
    },
    {
      title: "Ngày vào làm",
      dataIndex: "hire_date",
      width: 130,
      align: "center",
      render: (date) => (
        <Text style={{ fontSize: 13, color: "#334155" }}>
          {formatDate(date)}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem hồ sơ">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:eye-linear"
                  style={{ color: "#37B0C3", fontSize: "18px" }}
                />
              }
              onClick={() => navigate(`/admin/teachers/profile/${record.id}`)}
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
              onClick={() => navigate(`/admin/teachers/edit/${record.id}`)}
              style={styles.actionBtn}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa giáo viên"
            description="Bạn chắc chắn muốn xóa tài khoản giáo viên này?"
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
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title
            level={3}
            style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
          >
            Hồ sơ Giáo viên
          </Title>
          <Text type="secondary">
            Danh sách cán bộ, giảng viên và công nhân viên chức trường
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
            onClick={() => navigate("/admin/teachers/add")}
            style={styles.addBtn}
          >
            Thêm giáo viên mới
          </Button>
        </Col>
      </Row>

      {/* Main Card */}
      <Card bordered={false} style={styles.tableCard}>
        {/* Bộ lọc tinh gọn */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
          gutter={[16, 16]}
        >
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm theo tên, mã số, số điện thoại..."
              allowClear
              size="large"
              prefix={
                <Icon
                  icon="solar:magnifer-linear"
                  style={{ color: "#bfbfbf", fontSize: "18px" }}
                />
              }
              onSearch={(value) => {
                setSearch(value);
                fetchTeachers(1, pagination.pageSize, value);
              }}
              style={styles.searchBar}
            />
          </Col>

          <Col>
            <Button
              icon={
                <Icon
                  icon="solar:restart-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              size="large"
              onClick={() => {
                setSearch("");
                fetchTeachers(1, pagination.pageSize, "");
              }}
              style={styles.refreshBtn}
            >
              Làm mới
            </Button>
          </Col>
        </Row>

        {/* Bảng dữ liệu */}
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={teachers}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) =>
              `Hiển thị dữ liệu: tìm thấy tổng cộng ${total} cán bộ`,
            position: ["bottomRight"],
          }}
          onChange={(pageInfo) => {
            fetchTeachers(pageInfo.current, pageInfo.pageSize);
          }}
        />
      </Card>
    </div>
  );
}

const styles = {
  container: {
    padding: "4px",
  },
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  searchBar: {
    width: "100%",
    borderRadius: 8,
  },
  addBtn: {
    borderRadius: 8,
    fontWeight: 600,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
  },
  refreshBtn: {
    borderRadius: 8,
    color: "#64748b",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
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
  nameText: {
    fontWeight: 600,
    color: "#1e293b",
    display: "block",
  },
  tag: {
    borderRadius: 6,
    fontWeight: 500,
    padding: "2px 8px",
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

export default TeacherList;
