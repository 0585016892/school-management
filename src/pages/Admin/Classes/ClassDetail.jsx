import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classApi from "../../../api/classApi";
import {
  Card,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Typography,
  Avatar,
  Input,
} from "antd";
import { Icon } from "@iconify/react";

const { Title, Text } = Typography;

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClass, resStudents] = await Promise.all([
        classApi.getById(id),
        classApi.getStudents(id),
      ]);
      setClassData(resClass);
      setStudents(resStudents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Bộ lọc tìm kiếm học sinh trong lớp
  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.student_code?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "student_code",
      width: 150,
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
      render: (name, record) => (
        <Space size="middle">
          <Avatar
            size="small"
            icon={<Icon icon="solar:user-rounded-linear" />}
            style={{
              backgroundColor: record.gender === "Nữ" ? "#f43f5e" : "#37B0C3",
              boxShadow: "0 2px 6px rgba(55, 176, 195, 0.15)",
            }}
          />
          <Text strong style={{ color: "#1e293b" }}>
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      width: 120,
      align: "center",
      render: (gender) => (
        <Tag
          color={gender === "Nam" ? "blue" : "magenta"}
          bordered={false}
          style={styles.genderTag}
        >
          {gender}
        </Tag>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      width: 150,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          icon={
            <Icon
              icon="solar:eye-linear"
              style={{ fontSize: "16px", verticalAlign: "middle" }}
            />
          }
          onClick={() => navigate(`/admin/students/${record.id}`)}
          style={styles.actionBtn}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Nút quay lại & Tiêu đề */}
      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: 24 }}
        size="small"
      >
        <Button
          icon={
            <Icon
              icon="solar:alt-arrow-left-linear"
              style={{ verticalAlign: "middle" }}
            />
          }
          type="text"
          onClick={() => navigate(-1)}
          style={styles.backBtn}
        >
          Quay lại danh sách
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title
              level={3}
              style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
            >
              Lớp {classData?.class_name}
            </Title>
            <Text type="secondary">
              Quản lý danh sách học sinh và thông tin lớp học hiện tại
            </Text>
          </div>
          <Tag
            color="orange"
            bordered={false}
            style={{
              fontSize: 13,
              padding: "4px 14px",
              borderRadius: 6,
              fontWeight: 600,
              backgroundColor: "#fff7ed",
              color: "#ea580c",
            }}
          >
            Niên khóa: {classData?.school_year}
          </Tag>
        </div>
      </Space>

      {/* Card Thông tin tổng quan (Thống kê) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Giáo viên chủ nhiệm</Text>}
              value={classData?.homeroom_teacher || "Chưa phân công"}
              prefix={
                <div style={{ ...styles.iconBox, background: "#eefafc" }}>
                  <Icon
                    icon="solar:shield-user-linear"
                    style={{ color: "#37B0C3" }}
                  />
                </div>
              }
              valueStyle={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Tổng sĩ số</Text>}
              value={students.length}
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
              prefix={
                <div style={{ ...styles.iconBox, background: "#f0fdf4" }}>
                  <Icon
                    icon="solar:users-group-two-rounded-linear"
                    style={{ color: "#22c55e" }}
                  />
                </div>
              }
              valueStyle={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Cập nhật lần cuối</Text>}
              value={
                classData?.updated_at
                  ? new Date(classData.updated_at).toLocaleDateString("vi-VN")
                  : "Hôm nay"
              }
              prefix={
                <div style={{ ...styles.iconBox, background: "#fffbeb" }}>
                  <Icon
                    icon="solar:calendar-date-linear"
                    style={{ color: "#d97706" }}
                  />
                </div>
              }
              valueStyle={{ fontSize: 16, color: "#334155", fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng danh sách học sinh */}
      <Card
        bordered={false}
        style={styles.tableCard}
        title={
          <Space
            size={8}
            style={{ fontSize: "16px", fontWeight: 600, color: "#1e293b" }}
          >
            <Icon
              icon="solar:chair-is-bold-duotone"
              style={{ color: "#37B0C3", fontSize: "20px" }}
            />
            <span>Danh sách lớp học</span>
          </Space>
        }
        extra={
          <Input
            placeholder="Tìm tên hoặc mã số..."
            prefix={
              <Icon
                icon="solar:magnifer-linear"
                style={{ color: "#bfbfbf", fontSize: "16px" }}
              />
            }
            style={{ width: 250, borderRadius: 8 }}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      >
        <Table
          loading={loading}
          dataSource={filteredStudents}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) =>
              `Hiển thị dữ liệu: tìm thấy tổng cộng ${total} học sinh`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

const styles = {
  container: {
    padding: "4px",
  },
  backBtn: {
    paddingLeft: 0,
    color: "#64748b",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  statCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    height: "100%",
  },
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    marginRight: "10px",
  },
  statTitle: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 500,
    display: "block",
    marginBottom: "4px",
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
  genderTag: {
    borderRadius: 6,
    fontWeight: 500,
    padding: "2px 10px",
  },
  actionBtn: {
    color: "#37B0C3",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default ClassDetail;
