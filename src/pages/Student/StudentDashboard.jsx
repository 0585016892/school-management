import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Empty,
  Spin,
  message,
  Typography,
  Space,
} from "antd";
import { Icon } from "@iconify/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "../../api/axiosClient"; // Hoặc instance API của bạn
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;

const StudentDashboard = () => {
  const { user } = useAuth();
  const studentId = user?.student_id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Màu chủ đạo hệ thống
  const PRIMARY_COLOR = "#37B0C3";

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!studentId) return;
      try {
        setLoading(true);
        const res = await axios.get(`/dashboard/student/${studentId}`);
        setData(res);
      } catch (error) {
        console.error("Lỗi tải dashboard học sinh:", error);
        message.error("Không thể tải dữ liệu bảng điều khiển.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentId]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Đang chuẩn bị bảng học tập..." />
      </div>
    );
  }

  if (!data) return <Empty description="Không có dữ liệu hiển thị" />;

  const { studentInfo, cards, charts, tables } = data;

  // Hàm render tag điểm màu sắc dựa trên số điểm
  const renderScoreTag = (score) => {
    if (!score) return "-";
    const numScore = parseFloat(score);
    let color = "red";
    if (numScore >= 8.0) color = "green";
    else if (numScore >= 5.0) color = "blue";
    return (
      <Tag color={color} style={{ fontWeight: "bold", margin: "2px" }}>
        {numScore.toFixed(1)}
      </Tag>
    );
  };

  // Cấu trúc cột ĐÃ ĐƯỢC CẬP NHẬT theo đúng cấu trúc dữ liệu thực tế (recentScores)
  const scoreColumns = [
    {
      title: "Môn học",
      dataIndex: "subject_name",
      key: "subject_name",
      fixed: "left",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      align: "center",
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Điểm miệng",
      dataIndex: "diem_mieng",
      key: "diem_mieng",
      align: "center",
      render: renderScoreTag,
    },
    {
      title: "Điểm 15p",
      dataIndex: "diem_15p",
      key: "diem_15p",
      align: "center",
      render: renderScoreTag,
    },
    {
      title: "Điểm giữa kỳ",
      dataIndex: "diem_giuaky",
      key: "diem_giuaky",
      align: "center",
      render: renderScoreTag,
    },
    {
      title: "Điểm 1 tiết",
      dataIndex: "diem_1tiet",
      key: "diem_1tiet",
      align: "center",
      render: renderScoreTag,
    },
    {
      title: "Điểm cuối kỳ",
      dataIndex: "diem_cuoiky",
      key: "diem_cuoiky",
      align: "center",
      render: renderScoreTag,
    },
    {
      title: "ĐTB Môn",
      dataIndex: "avg_subject_score",
      key: "avg_subject_score",
      align: "center",
      fixed: "right",
      render: (score) => (
        <Tag color="gold" style={{ fontSize: "14px", fontWeight: "bold" }}>
          {parseFloat(score).toFixed(1)}
        </Tag>
      ),
    },
  ];

  // Cấu trúc cột bài tập (Dữ liệu API của bạn đang không có `recentAssignments` mà có `recentSchedules`)
  // Giữ lại cột này nhưng dự phòng nếu dữ liệu trống
  const assignmentColumns = [
    {
      title: "Tên bài tập / Lịch trình",
      dataIndex: "title",
      key: "title",
      render: (text) => <Text ellipsis>{text || "Chưa rõ tên"}</Text>,
    },
    {
      title: "Hạn nộp / Thời gian",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => {
        if (!date) return "-";
        const isOverdue = new Date(date) < new Date();
        return (
          <Tag color={isOverdue ? "error" : "warning"}>
            {new Date(date).toLocaleDateString("vi-VN")}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "4px" }}>
      {/* KHU VỰC CHÀO MỪNG */}
      <div style={{ marginBottom: "24px" }}>
        <Title level={3} style={{ margin: 0, color: "#1e293b" }}>
          Xin chào, {studentInfo?.fullName || "Học sinh"} 👋
        </Title>
        <Text type="secondary">
          Mã số: <Text strong>{studentInfo?.studentCode}</Text> | Lớp:{" "}
          <Text strong style={{ color: PRIMARY_COLOR }}>
            {studentInfo?.className}
          </Text>{" "}
          | Niên khóa: <Text strong>{studentInfo?.schoolYear}</Text>
        </Text>
      </div>

      {/* ========================= KHU VỰC THẺ ĐẾM (CARDS) ========================= */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
          >
            <Statistic
              title="Điểm trung bình học tập"
              value={parseFloat(cards?.averageScore || 0)}
              precision={2}
              valueStyle={{ color: PRIMARY_COLOR, fontWeight: 700 }}
              prefix={
                <Icon
                  icon="solar:star-bold-duotone"
                  style={{ marginRight: 8 }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
          >
            <Statistic
              title="Bài tập chưa nộp"
              value={cards?.pendingAssignments || 0}
              valueStyle={{ color: "#faad14", fontWeight: 700 }}
              prefix={
                <Icon
                  icon="solar:clipboard-list-bold-duotone"
                  style={{ marginRight: 8 }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
          >
            <Statistic
              title="Nghỉ học / Đi muộn"
              value={`${cards?.totalAbsent || 0} / ${cards?.totalLate || 0}`}
              valueStyle={{ color: "#ff4d4f", fontWeight: 700 }}
              prefix={
                <Icon
                  icon="solar:user-block-bold-duotone"
                  style={{ marginRight: 8 }}
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
          >
            <Statistic
              title="Tổng học phí phải đóng"
              value={parseFloat(cards?.totalDebt || 0)}
              suffix="đ"
              valueStyle={{
                color: parseFloat(cards?.totalDebt) > 0 ? "#ff4d4f" : "#52c41a",
                fontWeight: 700,
              }}
              prefix={
                <Icon
                  icon="solar:card-2-bold-duotone"
                  style={{ marginRight: 8 }}
                />
              }
            />
          </Card>
        </Col>
      </Row>

      {/* ========================= BIỂU ĐỒ & DANH SÁCH BÀI TẬP ========================= */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        {/* Biểu đồ điểm số */}
        <Col xs={24} xl={14}>
          <Card
            title={
              <Space>
                <Icon
                  icon="solar:chart-square-linear"
                  style={{ color: PRIMARY_COLOR, fontSize: "20px" }}
                />
                <span>Biểu đồ năng lực theo môn</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)", height: "100%" }}
          >
            {charts?.subjectScoresChart?.length > 0 ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={charts.subjectScoresChart}
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="subject_name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(55, 176, 195, 0.05)" }}
                      formatter={(value) => [
                        parseFloat(value).toFixed(2),
                        "Điểm TB",
                      ]}
                    />
                    <Bar
                      dataKey="avg_score"
                      name="Điểm TB"
                      fill={PRIMARY_COLOR}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty
                description="Chưa có dữ liệu điểm để vẽ biểu đồ"
                style={{ padding: "40px 0" }}
              />
            )}
          </Card>
        </Col>

        {/* Lịch trình/Bài tập về nhà mới nhất */}
        <Col xs={24} xl={10}>
          <Card
            title={
              <Space>
                <Icon
                  icon="solar:calendar-linear"
                  style={{ color: "#faad14", fontSize: "20px" }}
                />
                <span>Lịch trình / Bài tập gần đây</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)", height: "100%" }}
          >
            {/* API trả về recentSchedules chứ không phải recentAssignments */}
            <Table
              dataSource={tables?.recentSchedules || []}
              columns={assignmentColumns}
              rowKey={(record, index) => index}
              pagination={false}
              size="middle"
              locale={{ emptyText: "Không có lịch trình hay bài tập nào" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ========================= ĐIỂM SỐ CHI TIẾT VỪA CẬP NHẬT ========================= */}
      <Row>
        <Col span={24}>
          <Card
            title={
              <Space>
                <Icon
                  icon="solar:document-text-linear"
                  style={{ color: "#52c41a", fontSize: "20px" }}
                />
                <span>Bảng điểm chi tiết các môn học</span>
              </Space>
            }
            bordered={false}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
          >
            <Table
              dataSource={tables?.recentScores || []}
              columns={scoreColumns}
              rowKey={(record, index) => index}
              pagination={false}
              scroll={{ x: "max-content" }} // Giúp bảng hiển thị tốt trên mobile vì nhiều cột điểm
              locale={{ emptyText: "Chưa cập nhật đầu điểm nào" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
