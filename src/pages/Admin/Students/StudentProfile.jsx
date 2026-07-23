import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import studentApi from "../../../api/studentApi";
import {
  Card,
  Tabs,
  Tag,
  Spin,
  Row,
  Col,
  Avatar,
  Typography,
  Descriptions,
  Table,
  Empty,
  Button,
} from "antd";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getProfile(id);
        console.log("Student Profile Data:", res);

        setProfileData(res.data || res);
      } catch (err) {
        console.error("Lỗi tải hồ sơ học sinh:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="Đang tải hồ sơ học sinh..." />
      </div>
    );
  }

  if (!profileData || !profileData.student) {
    return (
      <div style={styles.loadingContainer}>
        <Empty description="Không tìm thấy thông tin học sinh" />
        <Button
          icon={
            <Icon
              icon="solar:alt-arrow-left-linear"
              style={{ verticalAlign: "middle", marginRight: "4px" }}
            />
          }
          onClick={() => navigate(-1)}
          style={{ marginTop: 16, borderRadius: 8 }}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  const { student, scores, attendance } = profileData;

  // ================= CẤU HÌNH TABS DỮ LIỆU BÊN PHẢI =================
  const tabItems = [
    {
      key: "overview",
      label: (
        <span style={styles.tabTitle}>
          <Icon icon="solar:id-card-linear" style={{ fontSize: "18px" }} /> Lý
          lịch trích ngang
        </span>
      ),
      children: (
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          layout="vertical"
          bordered
          style={{ marginTop: 8 }}
        >
          <Descriptions.Item label="Họ và tên học sinh" span={2}>
            <Text strong style={{ fontSize: 15, color: "#0f172a" }}>
              {student.full_name}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mã định danh (Code)">
            <Text
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#334155",
              }}
            >
              {student.student_code?.toUpperCase()}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Lớp học hiện tại">
            <Tag
              color="cyan"
              style={{
                fontSize: 13,
                padding: "2px 10px",
                borderRadius: 6,
                fontWeight: 600,
                backgroundColor: "#eefafc",
                borderColor: "transparent",
                color: "#37B0C3",
              }}
            >
              {student.class_name || "Chưa phân lớp"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {student.birthday
              ? dayjs(student.birthday).format("DD/MM/YYYY")
              : "Chưa cập nhật"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            <Tag
              color={
                student.gender === "Nam"
                  ? "blue"
                  : student.gender === "Nữ"
                    ? "magenta"
                    : "default"
              }
              bordered={false}
              style={{ borderRadius: 4, fontWeight: 500 }}
            >
              {student.gender || "---"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ thường trú" span={2}>
            {student.address || "Chưa cập nhật dữ liệu địa chỉ"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "scores",
      label: (
        <span style={styles.tabTitle}>
          <Icon icon="solar:notebook-linear" style={{ fontSize: "18px" }} /> Kết
          quả học tập ({scores?.length || 0})
        </span>
      ),
      children: (
        <div style={{ marginTop: 8 }}>
          {scores && scores.length > 0 ? (
            <Table
              dataSource={scores}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Môn học",
                  dataIndex: "subject_name",
                  render: (t) => <Text strong>{t}</Text>,
                },
                {
                  title: "Điểm chuyên cần",
                  dataIndex: "attendance_score",
                  align: "center",
                },
                {
                  title: "Điểm giữa kỳ",
                  dataIndex: "midterm_score",
                  align: "center",
                },
                {
                  title: "Điểm cuối kỳ",
                  dataIndex: "final_score",
                  align: "center",
                },
                {
                  title: "Tổng kết",
                  key: "total",
                  align: "center",
                  render: (_, r) => (
                    <Text strong style={{ color: "#22c55e" }}>
                      {r.total_score || "---"}
                    </Text>
                  ),
                },
              ]}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có dữ liệu điểm số cho học sinh này."
            />
          )}
        </div>
      ),
    },
    {
      key: "attendance",
      label: (
        <span style={styles.tabTitle}>
          <Icon icon="solar:clock-circle-linear" style={{ fontSize: "18px" }} />{" "}
          Nhật ký điểm danh ({attendance?.length || 0})
        </span>
      ),
      children: (
        <div style={{ marginTop: 8 }}>
          {attendance && attendance.length > 0 ? (
            <Table
              dataSource={attendance}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
              columns={[
                {
                  title: "Ngày điểm danh",
                  dataIndex: "date",
                  render: (d) => dayjs(d).format("DD/MM/YYYY"),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  render: (status) => {
                    const isPresent = status === "Có mặt";
                    return (
                      <Tag
                        color={isPresent ? "success" : "error"}
                        bordered={false}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          borderRadius: "4px",
                        }}
                      >
                        <Icon
                          icon={
                            isPresent
                              ? "solar:check-circle-bold"
                              : "solar:close-circle-bold"
                          }
                        />
                        {status}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Ghi chú",
                  dataIndex: "note",
                  render: (n) => n || "---",
                },
              ]}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Học sinh chưa có dữ liệu điểm danh trên hệ thống."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Nút quay lại tiện ích */}
      <div style={{ marginBottom: 20 }}>
        <Button
          icon={
            <Icon
              icon="solar:alt-arrow-left-linear"
              style={{ verticalAlign: "middle" }}
            />
          }
          onClick={() => navigate(-1)}
          style={styles.backBtn}
        >
          Quay lại danh sách
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* KHỐI TRÁI: THÔNG TIN THẺ CÁ NHÂN NHANH */}
        <Col xs={24} md={8}>
          <Card bordered={false} style={styles.profileCard}>
            <div style={styles.avatarSection}>
              <Avatar
                size={100}
                src={student.avatar}
                icon={
                  <Icon
                    icon="solar:user-rounded-linear"
                    style={{ fontSize: "50px" }}
                  />
                }
                style={{
                  backgroundColor:
                    student.gender === "Nam" ? "#37B0C3" : "#f43f5e",
                  boxShadow: "0 4px 12px rgba(55, 176, 195, 0.15)",
                }}
              />
              <Title
                level={4}
                style={{ margin: "16px 0 4px 0", color: "#0f172a" }}
              >
                {student.full_name}
              </Title>
              <Text type="secondary" style={styles.subTitleCode}>
                MÃ SỐ: {student.student_code?.toUpperCase()}
              </Text>
            </div>

            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <Icon icon="solar:phone-linear" style={styles.infoIcon} />
                <Text style={{ color: "#334155" }}>
                  {student.phone || "Chưa cập nhật SĐT"}
                </Text>
              </div>
              <div style={styles.infoItem}>
                <Icon icon="solar:letter-linear" style={styles.infoIcon} />
                <Text
                  ellipsis={{ tooltip: student.email }}
                  style={{ color: "#334155" }}
                >
                  {student.email || "Chưa có email"}
                </Text>
              </div>
              <div style={styles.infoItem}>
                <Icon icon="solar:home-2-linear" style={styles.infoIcon} />
                <Text
                  ellipsis={{ tooltip: student.address }}
                  style={{ color: "#334155" }}
                >
                  {student.address || "Chưa cập nhật địa chỉ"}
                </Text>
              </div>
              <div style={styles.infoItem}>
                <Icon
                  icon="solar:calendar-date-linear"
                  style={styles.infoIcon}
                />
                <Text style={{ color: "#334155" }}>
                  Sinh nhật:{" "}
                  {student.birthday
                    ? dayjs(student.birthday).format("DD/MM/YYYY")
                    : "---"}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* KHỐI PHẢI: TABS LÝ LỊCH + ĐIỂM SỐ + ĐIỂM DANH */}
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={styles.tabsCard}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Tabs
              defaultActiveKey="overview"
              items={tabItems}
              style={styles.tabs}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Cấu trúc CSS System đồng bộ Dashboard quản trị mới
const styles = {
  container: { padding: "4px" },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  backBtn: {
    borderRadius: 8,
    color: "#475569",
    fontWeight: 500,
    border: "1px solid #e2e8f0",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  profileCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: "10px 0",
  },
  tabsCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    minHeight: 440,
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  subTitleCode: {
    fontFamily: "monospace",
    fontWeight: 600,
    backgroundColor: "#f1f5f9",
    color: "#475569",
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 12,
    marginTop: "6px",
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 20,
    margin: "0 16px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  infoIcon: { color: "#94a3b8", fontSize: "18px" },
  tabTitle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 600,
  },
  tabs: {
    "--antd-wave-shadow-color": "#37B0C3",
  },
};

document.documentElement.style.setProperty("--ant-primary-color", "#37B0C3");

export default StudentProfile;
