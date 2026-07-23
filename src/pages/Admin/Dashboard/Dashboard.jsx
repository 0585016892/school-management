import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  Empty,
  Tag,
  Progress,
  Divider,
  Typography,
  Space,
} from "antd";
import { Icon } from "@iconify/react";
import dashboardApi from "../../../api/dashboardApi";

const { Title, Text } = Typography;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getSummary();
      setData(res);
    } catch (err) {
      console.log("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Hàm định dạng tiền tệ gọn gàng
  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <Empty description="Không có dữ liệu thống kê cho kỳ này" />
      </div>
    );
  }

  const { cards } = data;

  // Tính toán tỷ lệ phần trăm
  const attendancePercent =
    Math.round((cards.presentToday / cards.attendanceToday) * 100) || 0;
  const tuitionPercent =
    Math.round((cards.totalCollected / cards.totalTuition) * 100) || 0;

  return (
    <div style={{ padding: "4px" }}>
      {/* TIÊU ĐỀ DASHBOARD */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={3}
          style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
        >
          Báo cáo Tổng quan
        </Title>
        <Text type="secondary">Cập nhật dữ liệu hệ thống thời gian thực</Text>
      </div>

      {/* HÀNG 1: CÁC TIỂU MỤC THỐNG KÊ NHÂN SỰ */}
      <Row gutter={[20, 20]}>
        {/* Tổng học sinh */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<Text style={styles.statTitle}>Tổng học sinh</Text>}
              value={cards.totalStudents}
              prefix={
                <div style={{ ...styles.iconBox, background: "#eefafc" }}>
                  <Icon
                    icon="solar:users-group-two-rounded-linear"
                    style={{ color: "#37B0C3" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
            <div style={styles.cardFooter}>
              <Tag
                color="cyan"
                style={{
                  border: "none",
                  background: "#eefafc",
                  color: "#37B0C3",
                  fontWeight: 600,
                }}
              >
                +{cards.totalClasses} Lớp học
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Giảng viên */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<Text style={styles.statTitle}>Giảng viên</Text>}
              value={cards.totalTeachers}
              prefix={
                <div style={{ ...styles.iconBox, background: "#fff7ed" }}>
                  <Icon
                    icon="solar:shield-user-linear"
                    style={{ color: "#f97316" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
            <div style={styles.cardFooter}>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                Tỉ lệ sư phạm{" "}
                <b>
                  1:{Math.round(cards.totalStudents / cards.totalTeachers) || 0}
                </b>
              </Text>
            </div>
          </Card>
        </Col>

        {/* Điểm trung bình */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<Text style={styles.statTitle}>Điểm trung bình</Text>}
              value={cards.averageScore}
              precision={1}
              prefix={
                <div style={{ ...styles.iconBox, background: "#f0fdf4" }}>
                  <Icon
                    icon="solar:round-graph-linear"
                    style={{ color: "#22c55e" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
            <div style={styles.cardFooter}>
              <Space
                size={4}
                style={{ color: "#22c55e", fontSize: "13px", fontWeight: 500 }}
              >
                <Icon icon="solar:arrow-left-up-linear" />
                <span>5% so với kỳ trước</span>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Môn học */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={styles.statCard} bordered={false}>
            <Statistic
              title={<Text style={styles.statTitle}>Môn học đào tạo</Text>}
              value={cards.totalSubjects}
              prefix={
                <div style={{ ...styles.iconBox, background: "#faf5ff" }}>
                  <Icon
                    icon="solar:notebook-linear"
                    style={{ color: "#a855f7" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
            <div style={styles.cardFooter}>
              <Text type="secondary" style={{ fontSize: "13px" }}>
                Chương trình chuẩn Bộ GD
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider
        orientation="left"
        style={{ margin: "30px 0 20px 0", color: "#64748b" }}
      >
        Theo dõi hoạt động hôm nay
      </Divider>

      {/* HÀNG 2: CHUYÊN CẦN & TÀI CHÍNH */}
      <Row gutter={[20, 20]}>
        {/* Card Chuyên cần ngày */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size={8}>
                <Icon
                  icon="solar:user-speak-bold-duotone"
                  style={{ color: "#37B0C3", fontSize: "20px" }}
                />
                <span>Tình hình điểm danh hôm nay</span>
              </Space>
            }
            bordered={false}
            style={styles.actionCard}
          >
            <Row
              align="middle"
              justify="space-around"
              style={{ minHeight: "160px" }}
            >
              <Col
                xs={24}
                sm={10}
                style={{ textAlign: "center", marginBottom: "16px" }}
              >
                <Progress
                  type="dashboard"
                  percent={attendancePercent}
                  strokeColor="#37B0C3"
                  trailColor="#f1f5f9"
                  strokeWidth={8}
                />
              </Col>
              <Col xs={24} sm={14}>
                <div style={styles.attendanceDetail}>
                  <Space style={styles.detailItem}>
                    <Space size={6}>
                      <Icon
                        icon="solar:check-circle-bold"
                        style={{ color: "#22c55e" }}
                      />
                      <Text type="secondary">Hiện diện:</Text>
                    </Space>
                    <Text strong color="#1e293b">
                      {cards.presentToday} học sinh
                    </Text>
                  </Space>

                  <Space style={styles.detailItem}>
                    <Space size={6}>
                      <Icon
                        icon="solar:close-circle-bold"
                        style={{ color: "#ef4444" }}
                      />
                      <Text type="secondary">Vắng mặt:</Text>
                    </Space>
                    <Text strong color="#1e293b">
                      {cards.absentToday} học sinh
                    </Text>
                  </Space>

                  <Space style={styles.detailItem}>
                    <Space size={6}>
                      <Icon
                        icon="solar:clock-circle-bold"
                        style={{ color: "#eab308" }}
                      />
                      <Text type="secondary">Đi muộn:</Text>
                    </Space>
                    <Text strong color="#1e293b">
                      {cards.lateToday} học sinh
                    </Text>
                  </Space>

                  <Divider style={{ margin: "12px 0" }} />
                  <Text style={{ color: "#64748b", fontSize: "13px" }}>
                    Tổng lượt xử lý hôm nay:{" "}
                    <b style={{ color: "#1e293b" }}>{cards.attendanceToday}</b>
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Card Thống kê Tài chính */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space size={8}>
                <Icon
                  icon="solar:wallet-money-bold-duotone"
                  style={{ color: "#37B0C3", fontSize: "20px" }}
                />
                <span>Theo dõi tiến độ học phí</span>
              </Space>
            }
            bordered={false}
            style={styles.actionCard}
          >
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Tổng học phí dự thu đợt này
                </Text>
              }
              value={cards.totalTuition}
              formatter={(val) => formatVND(val)}
              valueStyle={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            />

            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Tiến độ hoàn thành:{" "}
                  <b style={{ color: "#37B0C3" }}>{tuitionPercent}%</b>
                </Text>
                <Text type="danger" strong style={{ fontSize: "13px" }}>
                  Còn nợ: {cards.totalDebt.toLocaleString()} đ
                </Text>
              </div>
              <Progress
                percent={tuitionPercent}
                status="active"
                strokeColor="#37B0C3"
                trailColor="#f1f5f9"
                showInfo={false}
                style={{ height: 8 }}
              />
            </div>

            <Row gutter={16} style={{ marginTop: 20 }}>
              <Col span={12}>
                <Card
                  size="small"
                  bordered={false}
                  style={{ background: "#f0fdf4", borderRadius: "8px" }}
                >
                  <Statistic
                    title={
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Đã thu
                      </Text>
                    }
                    value={cards.totalCollected}
                    formatter={(val) => formatVND(val)}
                    valueStyle={{
                      fontSize: "15px",
                      color: "#15803d",
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  bordered={false}
                  style={{ background: "#fef2f2", borderRadius: "8px" }}
                >
                  <Statistic
                    title={
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Công nợ
                      </Text>
                    }
                    value={cards.totalDebt}
                    formatter={(val) => formatVND(val)}
                    valueStyle={{
                      fontSize: "15px",
                      color: "#b91c1c",
                      fontWeight: 600,
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
    background: "#fff",
    borderRadius: 12,
  },
  emptyContainer: {
    padding: "80px 0",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  statCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    height: "100%",
    padding: "4px",
  },
  actionCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    height: "100%",
  },
  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    marginRight: "12px",
  },
  statTitle: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 500,
  },
  statValue: {
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "26px",
    lineHeight: 1.2,
    marginTop: "4px",
  },
  cardFooter: {
    marginTop: 14,
    borderTop: "1px solid #f1f5f9",
    paddingTop: 10,
  },
  attendanceDetail: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
};

export default Dashboard;
