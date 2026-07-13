import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Spin,
  Tag,
  Avatar,
  Descriptions,
  Tabs,
  Empty,
  Typography,
  Space,
} from "antd";
import { Icon } from "@iconify/react";
import teacherApi from "../../api/teacherApi";

const { Title, Text } = Typography;

// Hàm format ngày tháng năm sang DD/MM/YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "Chưa cập nhật";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getProfile(id);
      setProfileData(res || res.data);
    } catch (err) {
      console.log("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="Đang tải hồ sơ chi tiết..." />
      </div>
    );
  }
  console.log(profileData);

  if (!profileData || !profileData.teacher) {
    return (
      <div style={styles.loadingContainer}>
        <Empty description="Không tìm thấy thông tin giáo viên" />
        <Button
          icon={
            <Icon
              icon="solar:alt-arrow-left-linear"
              style={{ verticalAlign: "middle" }}
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

  const { teacher, classes, subjects } = profileData;

  // Định nghĩa danh sách các tab hiển thị phía bên phải chuyển toàn bộ sang Iconify
  const tabItems = [
    {
      key: "info",
      label: (
        <span style={styles.tabTitle}>
          <Icon icon="solar:id-card-linear" style={{ fontSize: "18px" }} />{" "}
          Thông tin chi tiết
        </span>
      ),
      children: (
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          layout="vertical"
          bordered
          style={{ marginTop: 10 }}
        >
          <Descriptions.Item label="Trình độ / Bằng cấp">
            <Text strong style={{ color: "#334155" }}>
              {teacher.qualification || "Chưa cập nhật"}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Mức lương cơ bản">
            <Text strong style={{ color: "#22c55e" }}>
              {teacher.salary
                ? `${Number(teacher.salary).toLocaleString()} VND`
                : "Chưa cấu hình"}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày vào làm">
            {formatDate(teacher.hire_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo tài khoản">
            {formatDate(teacher.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ thường trú" span={2}>
            {teacher.address || "Chưa cập nhật"}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "classes",
      label: (
        <span style={styles.tabTitle}>
          <Icon icon="solar:chair-is-linear" style={{ fontSize: "18px" }} /> Lớp
          học phụ trách ({classes?.length || 0})
        </span>
      ),
      children: (
        <div style={{ padding: "10px 0" }}>
          {classes && classes.length > 0 ? (
            <Row gutter={[16, 16]}>
              {classes.map((item, idx) => (
                <Col xs={24} sm={12} key={idx}>
                  <Card size="small" style={styles.subCard}>
                    <Text strong style={{ color: "#37B0C3", fontSize: "15px" }}>
                      {item.class_name || item.name}
                    </Text>
                    <br />
                    <Space size={4} style={{ marginTop: "4px" }}>
                      <Icon
                        icon="solar:users-group-two-rounded-linear"
                        style={{ color: "#64748b" }}
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Sĩ số:{" "}
                        <b style={{ color: "#334155" }}>
                          {item.student_count || 0}
                        </b>{" "}
                        học sinh
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Giáo viên chưa được phân công giảng dạy hoặc chủ nhiệm lớp nào."
            />
          )}
        </div>
      ),
    },
    {
      key: "subjects",
      label: (
        <span style={styles.tabTitle}>
          <Icon icon="solar:notebook-linear" style={{ fontSize: "18px" }} /> Môn
          học giảng dạy ({subjects?.length || 0})
        </span>
      ),
      children: (
        <div style={{ padding: "10px 0" }}>
          {subjects && subjects.length > 0 ? (
            <Space wrap>
              {subjects.map((sub, idx) => (
                <Tag
                  color="purple"
                  key={idx}
                  style={{
                    padding: "6px 14px",
                    fontSize: 13,
                    borderRadius: 6,
                    backgroundColor: "#f3e8ff",
                    color: "#6b21a8",
                    border: "none",
                    fontWeight: 500,
                  }}
                >
                  {sub.subject_name || sub.name} ({sub.subject_code})
                </Tag>
              ))}
            </Space>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa cấu hình chuyên môn giảng dạy."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Thanh công cụ điều hướng hàng đầu */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Button
            icon={
              <Icon
                icon="solar:alt-arrow-left-linear"
                style={{ verticalAlign: "middle" }}
              />
            }
            onClick={() => navigate(-1)}
            style={styles.actionBtn}
          >
            Quay lại
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={
              <Icon
                icon="solar:pen-linear"
                style={{ verticalAlign: "middle" }}
              />
            }
            onClick={() => navigate(`/admin/teachers/edit/${id}`)}
            style={styles.editBtn}
          >
            Chỉnh sửa hồ sơ
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* CỘT TRÁI: THÈ TÓM TẮT THÀNH VIÊN */}
        <Col xs={24} md={8}>
          <Card bordered={false} style={styles.profileCard}>
            <div style={styles.avatarWrapper}>
              <Avatar
                size={110}
                src={teacher.avatar}
                icon={
                  <Icon
                    icon="solar:user-rounded-linear"
                    style={{ fontSize: "55px" }}
                  />
                }
                style={{
                  backgroundColor:
                    teacher.gender === "Nam" ? "#37B0C3" : "#f43f5e",
                  boxShadow: "0 4px 12px rgba(55, 176, 195, 0.15)",
                }}
              />
              <Tag
                color={teacher.gender === "Nam" ? "blue" : "magenta"}
                bordered={false}
                style={styles.genderTag}
              >
                {teacher.gender}
              </Tag>
            </div>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title
                level={4}
                style={{ margin: "14px 0 4px 0", color: "#0f172a" }}
              >
                {teacher.full_name}
              </Title>
              <Text
                style={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: "12px",
                  display: "inline-block",
                }}
              >
                {teacher.teacher_code?.toUpperCase()}
              </Text>
            </div>

            <div style={styles.contactList}>
              <div style={styles.contactItem}>
                <Icon icon="solar:phone-linear" style={styles.contactIcon} />
                <Text style={{ color: "#334155" }}>
                  {teacher.phone || "Chưa có số điện thoại"}
                </Text>
              </div>
              <div style={styles.contactItem}>
                <Icon icon="solar:letter-linear" style={styles.contactIcon} />
                <Text
                  ellipsis={{ tooltip: teacher.email }}
                  style={{ color: "#334155" }}
                >
                  {teacher.email}
                </Text>
              </div>
              <div style={styles.contactItem}>
                <Icon
                  icon="solar:calendar-date-linear"
                  style={styles.contactIcon}
                />
                <Text style={{ color: "#334155" }}>
                  Sinh nhật: {formatDate(teacher.birthday)}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* CỘT PHẢI: CHI TIẾT TÁC VỤ & LỚP/MÔN HỌC */}
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={styles.detailsCard}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Tabs
              defaultActiveKey="info"
              items={tabItems}
              style={styles.tabs}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Khung CSS hệ thống quản trị phẳng, bo góc mềm mại đồng bộ Layout mới
const styles = {
  container: { padding: "4px" },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  actionBtn: {
    borderRadius: 8,
    color: "#475569",
    fontWeight: 500,
    border: "1px solid #e2e8f0",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  editBtn: {
    borderRadius: 8,
    fontWeight: 600,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  profileCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: "12px 0",
  },
  detailsCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    minHeight: 420,
  },
  avatarWrapper: {
    position: "relative",
    width: 110,
    margin: "0 auto",
    textAlign: "center",
  },
  genderTag: {
    position: "absolute",
    bottom: 0,
    right: -4,
    margin: 0,
    borderRadius: 8,
    padding: "2px 8px",
    fontWeight: 500,
  },
  contactList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 20,
    margin: "0 16px",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  contactIcon: { color: "#94a3b8", fontSize: "18px" },
  tabTitle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: 600,
    fontSize: 14,
  },
  subCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
  },
};

export default TeacherProfile;
