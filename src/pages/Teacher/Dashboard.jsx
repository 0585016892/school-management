import React, { useEffect, useState, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Spin,
  Empty,
  Progress,
  Avatar,
  Tag,
  Space,
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  DashboardOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import AuthContext from "../../context/AuthContext";

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Màu chủ đạo đồng bộ với Layout sáng
  const PRIMARY_COLOR = "#37B0C3";

  useEffect(() => {
    const load = async () => {
      if (!user?.teacher_id) return;
      setLoading(true);
      try {
        const res = await axiosClient.get(
          `/dashboard/teacher/${user.teacher_id}`,
        );
        setData(res?.data || res);
      } catch (err) {
        console.error("Lỗi tải dữ liệu Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <Spin
          size="large"
          tip="Đang tải dữ liệu giảng dạy..."
          style={{ color: PRIMARY_COLOR }}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <Empty description="Không tìm thấy dữ liệu bảng điều khiển" />
      </div>
    );
  }

  const { cards, tables } = data;

  // Cấu hình cột: Danh sách lớp dạy
  const classColumns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <span style={{ color: "#64748b" }}>{index + 1}</span>
      ),
    },
    {
      title: "Tên Lớp Học",
      dataIndex: "class_name",
      key: "class_name",
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#1e293b" }}>Lớp {text}</span>
      ),
    },
    {
      title: "Sĩ số",
      key: "total_students",
      align: "center",
      width: 150,
      render: (_, record) => {
        const classChart = data.charts?.studentByClass?.find(
          (c) => c.class_name === record.class_name,
        );
        return (
          <Tag color="cyan" style={{ borderRadius: "6px", fontWeight: 500 }}>
            {classChart ? `${classChart.total} học sinh` : "0 học sinh"}
          </Tag>
        );
      },
    },
  ];

  // Cấu hình cột: Top học sinh
  const topStudentColumns = [
    {
      title: "Hạng",
      key: "rank",
      width: 80,
      align: "center",
      render: (_, __, index) => {
        const trophyColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // Vàng, Bạc, Đồng huy chương
        if (index < 3) {
          return (
            <Avatar
              size={26}
              style={{
                backgroundColor: trophyColors[index],
                color: "#fff",
                fontWeight: "bold",
                fontSize: "13px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              {index + 1}
            </Avatar>
          );
        }
        return <span style={{ color: "#64748b" }}>{index + 1}</span>;
      },
    },
    {
      title: "Mã SV",
      dataIndex: "student_code",
      key: "student_code",
      width: 120,
      align: "center",
      render: (code) => (
        <code style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>{code}</code>
      ),
    },
    {
      title: "Họ và Tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (name) => (
        <span style={{ fontWeight: 500, color: "#1e293b" }}>{name}</span>
      ),
    },
    {
      title: "Điểm Trung Bình",
      dataIndex: "avg_score",
      key: "avg_score",
      align: "center",
      width: 150,
      sorter: (a, b) => parseFloat(a.avg_score) - parseFloat(b.avg_score),
      render: (score) => {
        const numScore = parseFloat(score);
        let tagColor = "error";
        let labelColor = "#ef4444";
        let bgColor = "#fef2f2";

        if (numScore >= 7) {
          labelColor = PRIMARY_COLOR;
          bgColor = "rgba(55, 176, 195, 0.1)";
        } else if (numScore >= 5) {
          labelColor = "#f59e0b";
          bgColor = "#fffbeb";
        }

        return (
          <span
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: labelColor,
              backgroundColor: bgColor,
              padding: "4px 10px",
              borderRadius: "6px",
              display: "inline-block",
              minWidth: "50px",
              textAlign: "center",
            }}
          >
            {numScore.toFixed(2)}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ backgroundColor: "transparent" }}>
      {/* HEADER KHU VỰC */}
      <div style={{ marginBottom: "28px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(55, 176, 195, 0.1)",
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
            }}
          >
            <DashboardOutlined style={{ color: PRIMARY_COLOR }} />
          </div>
          Bảng Điều Khiển Giảng Viên
        </h2>
        <p style={{ color: "#64748b", margin: "6px 0 0 0", fontSize: "14px" }}>
          Xin chào Thầy/Cô, dưới đây là tổng quan số liệu và tiến độ giảng dạy
          thời gian thực.
        </p>
      </div>

      {/* THẺ THỐNG KÊ TỔNG QUAN (CARDS) */}
      <Row gutter={[20, 20]} style={{ marginBottom: "28px" }}>
        {/* CARD 1 */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.015)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(55, 176, 195, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOutlined
                  style={{ color: PRIMARY_COLOR, fontSize: "20px" }}
                />
              </div>
              <Statistic
                title={
                  <span style={{ color: "#64748b", fontWeight: 500 }}>
                    Lớp đang dạy
                  </span>
                }
                value={cards?.totalClasses || 0}
                valueStyle={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "24px",
                }}
              />
            </div>
          </Card>
        </Col>

        {/* CARD 2 */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.015)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ color: "#10b981", fontSize: "20px" }} />
              </div>
              <Statistic
                title={
                  <span style={{ color: "#64748b", fontWeight: 500 }}>
                    Tổng số học sinh
                  </span>
                }
                value={cards?.totalStudents || 0}
                valueStyle={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "24px",
                }}
              />
            </div>
          </Card>
        </Col>

        {/* CARD 3 */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.015)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LineChartOutlined
                  style={{ color: "#f59e0b", fontSize: "20px" }}
                />
              </div>
              <Statistic
                title={
                  <span style={{ color: "#64748b", fontWeight: 500 }}>
                    Điểm số trung bình
                  </span>
                }
                value={parseFloat(cards?.averageScore || 0).toFixed(2)}
                valueStyle={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "24px",
                }}
              />
            </div>
          </Card>
        </Col>

        {/* CARD 4: ĐIỂM DANH */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.015)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(6, 182, 212, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#06b6d4", fontSize: "20px" }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    Điểm danh hôm nay
                  </div>
                  <div
                    style={{
                      color: "#1e293b",
                      fontWeight: 700,
                      fontSize: "20px",
                    }}
                  >
                    {cards?.presentToday || 0}
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      /{cards?.attendanceToday || 0} SV
                    </span>
                  </div>
                </div>
              </div>

              <Progress
                type="circle"
                percent={
                  cards?.attendanceToday
                    ? Math.round(
                        (cards.presentToday / cards.attendanceToday) * 100,
                      )
                    : 0
                }
                width={42}
                strokeWidth={9}
                showInfo={false}
                strokeColor={PRIMARY_COLOR}
              />
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginTop: "12px",
                borderTop: "1px dashed #e2e8f0",
                paddingTop: "8px",
              }}
            >
              Vắng mặt:{" "}
              <span style={{ color: "#ef4444", fontWeight: 600 }}>
                {cards?.absentToday || 0}
              </span>{" "}
              học sinh
            </div>
          </Card>
        </Col>
      </Row>

      {/* KHU VỰC CHI TIẾT BẢNG (TABLES) */}
      <Row gutter={[20, 20]}>
        {/* DANH SÁCH LỚP DẠY */}
        <Col xs={24} xl={10}>
          <Card
            title={
              <Space style={{ color: "#1e293b", fontWeight: 600 }}>
                <BookOutlined style={{ color: PRIMARY_COLOR }} />
                <span>Danh Sách Lớp Dạy</span>
              </Space>
            }
            bordered={false}
            style={{
              borderRadius: "14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              border: "1px solid #f1f5f9",
            }}
          >
            <Table
              dataSource={tables?.classes || []}
              columns={classColumns}
              rowKey="id"
              pagination={false}
              size="middle"
              style={{ backgroundColor: "#fff" }}
            />
          </Card>
        </Col>

        {/* BẢNG THÀNH TÍCH HỌC SINH */}
        <Col xs={24} xl={14}>
          <Card
            title={
              <Space style={{ color: "#1e293b", fontWeight: 600 }}>
                <TrophyOutlined style={{ color: "#f59e0b" }} />
                <span>Bảng Thành Tích Học Sinh Xuất Sắc</span>
              </Space>
            }
            bordered={false}
            style={{
              borderRadius: "14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
              border: "1px solid #f1f5f9",
            }}
          >
            <Table
              dataSource={tables?.topStudents || []}
              columns={topStudentColumns}
              rowKey="student_code"
              pagination={false}
              size="middle"
              style={{ backgroundColor: "#fff" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherDashboard;
