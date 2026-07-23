import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Spin,
  Empty,
  Tag,
  Table,
  Avatar,
  Space,
  Progress,
  List,
  Divider,
  message,
} from "antd";
import { Icon } from "@iconify/react";
import managementApi from "../../../api/managementApi";

const { Title, Text } = Typography;

// MÀU CHỦ ĐẠO
const PRIMARY_COLOR = "#37B0C3";
const PRIMARY_HOVER = "#2da0b2";
const PRIMARY_BG = "#eef8f9";

function ManagementPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await managementApi.getDashboard();
      console.log("MANAGEMENT DASHBOARD:", response.data);
      setData(response.data || {});
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
      messageApi.error(
        error?.response?.data?.message || "Không thể tải dữ liệu Ban Giám Hiệu",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DATA DESTRUCTURING
  // =====================================================
  const overview = data?.overview || {};
  const attendance = data?.attendance || {};
  const tuition = data?.tuition || {};
  const organization = data?.organization || {};
  const charts = data?.charts || {};
  const teachers = data?.teachers || [];
  const staffs = data?.staffs || [];
  const classes = data?.classes || [];
  const rewards = data?.rewards || [];
  const disciplines = data?.disciplines || [];

  // FORMAT MONEY
  const formatMoney = (value) => {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
  };

  // ATTENDANCE DATA
  const attendanceData = [
    {
      name: "Có mặt",
      value: Number(attendance.present || 0),
      color: "#52c41a",
    },
    {
      name: "Có phép",
      value: Number(attendance.excused || 0),
      color: PRIMARY_COLOR,
    },
    { name: "Đi muộn", value: Number(attendance.late || 0), color: "#faad14" },
    {
      name: "Vắng mặt",
      value: Number(attendance.absent || 0),
      color: "#ff4d4f",
    },
  ];

  // STUDENT GRADE
  const studentByGrade = charts.studentByGrade || [];
  const maxGradeValue =
    Math.max(...studentByGrade.map((item) => Number(item.value || 0))) || 1;

  // GENDER CHARTS
  const teacherGender = charts.teacherGender || [];
  const staffGender = charts.staffGender || [];

  // =====================================================
  // TABLE COLUMNS
  // =====================================================
  const teacherColumns = [
    {
      title: "Mã GV",
      dataIndex: "teacher_code",
      render: (code) => <Tag color="cyan">{code || "N/A"}</Tag>,
    },
    {
      title: "Giáo viên",
      dataIndex: "full_name",
      render: (name) => (
        <Space>
          <Avatar
            style={{
              background: PRIMARY_BG,
              color: PRIMARY_COLOR,
              fontWeight: 600,
            }}
          >
            {name?.charAt(0)}
          </Avatar>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) =>
        gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Khác",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (value) => value || <Text type="secondary">Chưa cập nhật</Text>,
    },
    {
      title: "Trình độ / Trạng thái",
      dataIndex: "qualification",
      render: (value) => value || <Text type="secondary">Chưa cập nhật</Text>,
    },
  ];

  const staffColumns = [
    {
      title: "Nhân viên",
      dataIndex: "full_name",
      render: (name) => (
        <Space>
          <Avatar
            style={{ background: "#fff7e6", color: "#fa8c16", fontWeight: 600 }}
          >
            {name?.charAt(0)}
          </Avatar>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) =>
        gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Khác",
    },
    {
      title: "Chức vụ",
      dataIndex: "position",
      render: (value) => value || <Text type="secondary">Chưa cập nhật</Text>,
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      render: (value) => value || <Text type="secondary">Chưa cập nhật</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status === "active" ? (
          <Tag color="success">Đang làm việc</Tag>
        ) : (
          <Tag color="default">Ngừng làm việc</Tag>
        ),
    },
  ];

  const classColumns = [
    {
      title: "Lớp",
      dataIndex: "class_name",
      render: (value) => (
        <Text strong style={{ color: PRIMARY_COLOR, fontSize: 15 }}>
          {value}
        </Text>
      ),
    },
    {
      title: "Năm học",
      dataIndex: "school_year",
      render: (year) => <Tag>{year}</Tag>,
    },
    {
      title: "Giáo viên chủ nhiệm",
      dataIndex: "homeroom_teacher_name",
      render: (value) =>
        value ? (
          <Space>
            <Icon
              icon="solar:user-speak-bold-duotone"
              style={{ color: PRIMARY_COLOR }}
            />
            <span>{value}</span>
          </Space>
        ) : (
          <Text type="secondary">Chưa phân công</Text>
        ),
    },
  ];

  return (
    <>
      {contextHolder}

      {/* Dynamic Style Injection */}
      <style>{`
        .mgmt-card {
          border-radius: 16px !important;
          border: 1px solid #f0f0f0 !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03) !important;
          transition: all 0.3s ease !important;
        }
        .mgmt-card:hover {
          box-shadow: 0 8px 25px rgba(55, 176, 195, 0.12) !important;
          border-color: #d1f0f5 !important;
        }
        .icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }
        .stat-card-inner {
          display: flex;
          align-items: center;
          gap: 16px;
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
            padding: "32px 24px",
            borderRadius: "20px",
            marginBottom: 28,
            color: "#fff",
            boxShadow: "0 10px 30px rgba(55, 176, 195, 0.25)",
          }}
        >
          <Row align="middle" justify="space-between" id="header-row">
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
                  Bảng điều khiển quản lý
                </Tag>
                <Title
                  level={2}
                  style={{
                    color: "#fff",
                    margin: "8px 0 4px 0",
                    fontWeight: 700,
                  }}
                >
                  Ban Giám Hiệu
                </Title>
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 15 }}
                >
                  Báo cáo tổng quan hoạt động, tình hình nhân sự & chất lượng
                  giáo dục nhà trường.
                </Text>
              </Space>
            </Col>
            <Col xs={0} md={8} style={{ textAlign: "right" }}>
              <Icon
                icon="solar:chart-square-bold-duotone"
                style={{ fontSize: 96, opacity: 0.3, color: "#fff" }}
              />
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          {/* =================================================
              TỔNG QUAN CHÍNH (KEY METRICS)
          ================================================= */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 20 }}>
                <div className="stat-card-inner">
                  <div
                    className="icon-box"
                    style={{ background: PRIMARY_BG, color: PRIMARY_COLOR }}
                  >
                    <Icon icon="solar:users-group-rounded-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Tổng học sinh
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {overview.students || 0}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 20 }}>
                <div className="stat-card-inner">
                  <div
                    className="icon-box"
                    style={{ background: "#e6f7ff", color: "#1677ff" }}
                  >
                    <Icon icon="solar:user-id-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Giáo viên
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {overview.teachers || 0}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 20 }}>
                <div className="stat-card-inner">
                  <div
                    className="icon-box"
                    style={{ background: "#fff7e6", color: "#fa8c16" }}
                  >
                    <Icon icon="solar:users-group-two-rounded-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Nhân viên
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {overview.staffs || 0}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 20 }}>
                <div className="stat-card-inner">
                  <div
                    className="icon-box"
                    style={{ background: "#f9f0ff", color: "#722ed1" }}
                  >
                    <Icon icon="solar:buildings-bold-duotone" />
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Lớp học
                    </Text>
                    <Title level={3} style={{ margin: 0, color: "#0f172a" }}>
                      {overview.classes || 0}
                    </Title>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* =================================================
              THỐNG KÊ QUẢN LÝ BỔ SUNG
          ================================================= */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={12} sm={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 16 }}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Tổ chức trường
                    </Text>
                  }
                  value={overview.organizations || 0}
                  suffix={<Text style={{ fontSize: 12 }}>đơn vị</Text>}
                  valueStyle={{
                    color: PRIMARY_COLOR,
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                  prefix={
                    <Icon
                      icon="solar:sitemap-bold-duotone"
                      style={{ marginRight: 6 }}
                    />
                  }
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 16 }}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Khen thưởng
                    </Text>
                  }
                  value={overview.rewards || 0}
                  suffix={<Text style={{ fontSize: 12 }}>mục</Text>}
                  valueStyle={{
                    color: "#52c41a",
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                  prefix={
                    <Icon
                      icon="solar:cup-star-bold-duotone"
                      style={{ marginRight: 6 }}
                    />
                  }
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 16 }}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Kỷ luật
                    </Text>
                  }
                  value={overview.disciplines || 0}
                  suffix={<Text style={{ fontSize: 12 }}>trường hợp</Text>}
                  valueStyle={{
                    color: "#ff4d4f",
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                  prefix={
                    <Icon
                      icon="solar:danger-triangle-bold-duotone"
                      style={{ marginRight: 6 }}
                    />
                  }
                />
              </Card>
            </Col>

            <Col xs={12} sm={6}>
              <Card className="mgmt-card" bodyStyle={{ padding: 16 }}>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Văn bản quản lý
                    </Text>
                  }
                  value={overview.documents || 0}
                  suffix={<Text style={{ fontSize: 12 }}>văn bản</Text>}
                  valueStyle={{
                    color: "#1677ff",
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                  prefix={
                    <Icon
                      icon="solar:document-text-bold-duotone"
                      style={{ marginRight: 6 }}
                    />
                  }
                />
              </Card>
            </Col>
          </Row>

          {/* =================================================
              ĐIỂM DANH + HỌC PHÍ
          ================================================= */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                className="mgmt-card"
                title={
                  <Space>
                    <Icon
                      icon="solar:check-circle-bold-duotone"
                      style={{ color: PRIMARY_COLOR, fontSize: 22 }}
                    />
                    <span style={{ fontWeight: 600 }}>Tình hình điểm danh</span>
                  </Space>
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text type="secondary">Tỷ lệ có mặt trung bình</Text>
                  <Text strong style={{ fontSize: 18, color: PRIMARY_COLOR }}>
                    {attendance.rate || 0}%
                  </Text>
                </div>

                <Progress
                  percent={Number(attendance.rate || 0)}
                  strokeColor={PRIMARY_COLOR}
                  trailColor="#e2e8f0"
                  strokeWidth={10}
                  showInfo={false}
                  style={{ marginBottom: 24 }}
                />

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {attendanceData.map((item) => (
                    <div key={item.name}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Space>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: item.color,
                            }}
                          />
                          <Text style={{ fontSize: 13 }}>{item.name}</Text>
                        </Space>
                        <Text strong>{item.value}</Text>
                      </div>
                      <Progress
                        percent={
                          attendance.total
                            ? Math.round((item.value / attendance.total) * 100)
                            : 0
                        }
                        strokeColor={item.color}
                        trailColor="#f1f5f9"
                        strokeWidth={6}
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                className="mgmt-card"
                title={
                  <Space>
                    <Icon
                      icon="solar:wallet-money-bold-duotone"
                      style={{ color: "#52c41a", fontSize: 22 }}
                    />
                    <span style={{ fontWeight: 600 }}>Tình hình học phí</span>
                  </Space>
                }
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "1px solid #b7eb8f",
                    marginBottom: 20,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{ fontSize: 13, textTransform: "uppercase" }}
                  >
                    Tổng doanh thu học phí
                  </Text>
                  <Title
                    level={2}
                    style={{
                      color: "#278213",
                      margin: "4px 0 0 0",
                      fontWeight: 700,
                    }}
                  >
                    {formatMoney(tuition.total_amount)}{" "}
                    <span style={{ fontSize: 16 }}>VNĐ</span>
                  </Title>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#f8fafc",
                        borderRadius: 10,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Số bản ghi học phí
                      </Text>
                      <Title level={4} style={{ margin: "4px 0 0 0" }}>
                        {tuition.total_records || 0}
                      </Title>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#f8fafc",
                        borderRadius: 10,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Trạng thái vận hành
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag
                          color="processing"
                          style={{ borderRadius: 12, padding: "0 10px" }}
                        >
                          Đang quản lý
                        </Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          {/* =================================================
              BIỂU ĐỒ HỌC SINH & CƠ CẤU NHÂN SỰ
          ================================================= */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                className="mgmt-card"
                title={
                  <Space>
                    <Icon
                      icon="solar:chart-2-bold-duotone"
                      style={{ color: PRIMARY_COLOR, fontSize: 22 }}
                    />
                    <span style={{ fontWeight: 600 }}>Học sinh theo khối</span>
                  </Space>
                }
              >
                {studentByGrade.length > 0 ? (
                  <div
                    style={{
                      height: 280,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-around",
                      padding: "20px 10px 10px 10px",
                    }}
                  >
                    {studentByGrade.map((item, index) => {
                      const value = Number(item.value || 0);
                      const height = Math.max(
                        (value / maxGradeValue) * 200,
                        12,
                      );

                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 8,
                            flex: 1,
                          }}
                        >
                          <Text
                            strong
                            style={{ color: PRIMARY_COLOR, fontSize: 13 }}
                          >
                            {value}
                          </Text>

                          <div
                            style={{
                              width: "40%",
                              maxWidth: 40,
                              minWidth: 20,
                              height,
                              borderRadius: "10px 10px 4px 4px",
                              background: `linear-gradient(180deg, ${PRIMARY_COLOR} 0%, #1d7e8e 100%)`,
                              boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
                              transition: "height 0.5s ease",
                            }}
                          />

                          <Text
                            type="secondary"
                            style={{ fontSize: 12, fontWeight: 500 }}
                          >
                            {item.name}
                          </Text>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty
                    description="Chưa có dữ liệu khối học"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                className="mgmt-card"
                title={
                  <Space>
                    <Icon
                      icon="solar:users-group-two-rounded-bold-duotone"
                      style={{ color: PRIMARY_COLOR, fontSize: 22 }}
                    />
                    <span style={{ fontWeight: 600 }}>
                      Cơ cấu giới tính nhân sự
                    </span>
                  </Space>
                }
              >
                <div style={{ marginBottom: 20 }}>
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 12,
                      color: "#334155",
                    }}
                  >
                    • Giáo viên
                  </Text>
                  {teacherGender.map((item) => {
                    const total = teacherGender.reduce(
                      (sum, x) => sum + Number(x.value || 0),
                      0,
                    );
                    const percent = total
                      ? Math.round((item.value / total) * 100)
                      : 0;

                    return (
                      <div key={item.name} style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text type="secondary">{item.name}</Text>
                          <Text strong>
                            {item.value} ({percent}%)
                          </Text>
                        </div>
                        <Progress
                          percent={percent}
                          strokeColor={PRIMARY_COLOR}
                          showInfo={false}
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>

                <Divider style={{ margin: "16px 0" }} />

                <div>
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 12,
                      color: "#334155",
                    }}
                  >
                    • Nhân viên
                  </Text>
                  {staffGender.map((item) => {
                    const total = staffGender.reduce(
                      (sum, x) => sum + Number(x.value || 0),
                      0,
                    );
                    const percent = total
                      ? Math.round((item.value / total) * 100)
                      : 0;

                    return (
                      <div key={item.name} style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text type="secondary">{item.name}</Text>
                          <Text strong>
                            {item.value} ({percent}%)
                          </Text>
                        </div>
                        <Progress
                          percent={percent}
                          strokeColor="#fa8c16"
                          showInfo={false}
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>

          {/* =================================================
              TỔ CHỨC
          ================================================= */}
          <Card
            className="mgmt-card"
            title={
              <Space>
                <Icon
                  icon="solar:buildings-2-bold-duotone"
                  style={{ color: PRIMARY_COLOR, fontSize: 22 }}
                />
                <span style={{ fontWeight: 600 }}>
                  Cơ cấu tổ chức nhà trường
                </span>
              </Space>
            }
            style={{ marginTop: 24 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px 20px",
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <Statistic
                    title={<Text type="secondary">Đơn vị tổ chức</Text>}
                    value={organization.totalOrganizations || 0}
                    valueStyle={{ color: PRIMARY_COLOR, fontWeight: 700 }}
                  />
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px 20px",
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <Statistic
                    title={<Text type="secondary">Tổng thành viên</Text>}
                    value={organization.totalMembers || 0}
                    valueStyle={{ color: "#1677ff", fontWeight: 700 }}
                  />
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px 20px",
                    borderRadius: 12,
                    textAlign: "center",
                  }}
                >
                  <Statistic
                    title={<Text type="secondary">Giáo viên tham gia</Text>}
                    value={organization.totalTeachers || 0}
                    valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* =================================================
              DANH SÁCH GIÁO VIÊN
          ================================================= */}
          <Card
            className="mgmt-card"
            title={<span style={{ fontWeight: 600 }}>Danh sách giáo viên</span>}
            style={{ marginTop: 24 }}
          >
            <Table
              rowKey="id"
              columns={teacherColumns}
              dataSource={teachers}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* =================================================
              DANH SÁCH NHÂN VIÊN
          ================================================= */}
          <Card
            className="mgmt-card"
            title={<span style={{ fontWeight: 600 }}>Danh sách nhân viên</span>}
            style={{ marginTop: 24 }}
          >
            <Table
              rowKey="id"
              columns={staffColumns}
              dataSource={staffs}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* =================================================
              DANH SÁCH LỚP HỌC
          ================================================= */}
          <Card
            className="mgmt-card"
            title={<span style={{ fontWeight: 600 }}>Danh sách lớp học</span>}
            style={{ marginTop: 24 }}
          >
            <Table
              rowKey="id"
              columns={classColumns}
              dataSource={classes}
              pagination={{ pageSize: 5 }}
            />
          </Card>

          {/* =================================================
              KHEN THƯỞNG + KỶ LUẬT
          ================================================= */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                className="mgmt-card"
                title={
                  <Space>
                    <Icon
                      icon="solar:cup-star-bold-duotone"
                      style={{ color: "#faad14", fontSize: 22 }}
                    />
                    <span style={{ fontWeight: 600 }}>Khen thưởng gần đây</span>
                  </Space>
                }
              >
                <List
                  dataSource={rewards}
                  locale={{
                    emptyText: (
                      <Empty
                        description="Chưa có dữ liệu khen thưởng"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                  }}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "12px 0" }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{ background: "#fff7e6", color: "#faad14" }}
                            icon={<Icon icon="solar:cup-star-linear" />}
                          />
                        }
                        title={<Text strong>{item.title}</Text>}
                        description={
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {item.student_name ||
                              item.teacher_name ||
                              item.staff_name ||
                              "Đối tượng chưa xác định"}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                className="mgmt-card"
                title={
                  <Space>
                    <Icon
                      icon="solar:danger-triangle-bold-duotone"
                      style={{ color: "#ff4d4f", fontSize: 22 }}
                    />
                    <span style={{ fontWeight: 600 }}>Kỷ luật gần đây</span>
                  </Space>
                }
              >
                <List
                  dataSource={disciplines}
                  locale={{
                    emptyText: (
                      <Empty
                        description="Chưa có dữ liệu kỷ luật"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                  }}
                  renderItem={(item) => (
                    <List.Item style={{ padding: "12px 0" }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{ background: "#fff1f0", color: "#ff4d4f" }}
                            icon={<Icon icon="solar:danger-triangle-linear" />}
                          />
                        }
                        title={<Text strong>{item.violation}</Text>}
                        description={
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {item.student_name ||
                              item.teacher_name ||
                              item.staff_name ||
                              "Đối tượng chưa xác định"}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </>
  );
}

export default ManagementPage;
