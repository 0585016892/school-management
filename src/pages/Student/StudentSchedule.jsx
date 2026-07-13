import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Spin,
  Empty,
  Typography,
  Space,
  Row,
  Col,
  message,
} from "antd";
import { Icon } from "@iconify/react";
import useAuth from "../../hooks/useAuth";
// Import từ file endpoint API của bạn
import scheduleApi from "../../api/scheduleApi";

const { Title, Text } = Typography;

const StudentSchedule = () => {
  const { user } = useAuth();
  const studentId = user?.student_id || 714; // Fallback bằng ID từ dữ liệu mẫu nếu chưa có auth

  const [loading, setLoading] = useState(true);
  const [scheduleMatrix, setScheduleMatrix] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ name: "", className: "" });

  // Danh sách các Thứ cần hiển thị trên cột của bảng
  const DAYS_IN_WEEK = [
    { key: "Monday", label: "Thứ Hai" },
    { key: "Tuesday", label: "Thứ Ba" },
    { key: "Wednesday", label: "Thứ Tư" },
    { key: "Thursday", label: "Thứ Năm" },
    { key: "Friday", label: "Thứ Sáu" },
    { key: "Saturday", label: "Thứ Bảy" },
  ];

  // Định nghĩa cấu trúc Sáng (4 tiết) và Chiều (3 tiết)
  const PERIODS_CONFIG = [
    { session: "Sáng", period: 1, label: "Tiết 1" },
    { session: "Sáng", period: 2, label: "Tiết 2" },
    { session: "Sáng", period: 3, label: "Tiết 3" },
    { session: "Sáng", period: 4, label: "Tiết 4" },
    { session: "Chiều", period: 5, label: "Tiết 1 (Chiều)" },
    { session: "Chiều", period: 6, label: "Tiết 2 (Chiều)" },
    { session: "Chiều", period: 7, label: "Tiết 3 (Chiều)" },
  ];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await scheduleApi.getByStudentId(studentId);

        if (res && res.success) {
          const rawData = res.data || [];

          // Lưu thông tin học sinh từ bản ghi đầu tiên nếu có
          if (rawData.length > 0) {
            setStudentInfo({
              name: rawData[0].student_name,
              className: rawData[0].class_name,
            });
          }

          // 1. Khởi tạo ma trận rỗng gồm 7 dòng theo cấu trúc Sáng/Chiều
          const matrix = PERIODS_CONFIG.map((p) => {
            const row = {
              key: `${p.session}-${p.period}`, // Key duy nhất tránh trùng lặp
              session: p.session,
              periodLabel: p.label,
              periodValue: p.period,
            };
            DAYS_IN_WEEK.forEach((day) => {
              row[day.key] = null; // Mặc định chưa có môn học
            });
            return row;
          });

          // 2. Đổ dữ liệu từ API vào ma trận
          rawData.forEach((item) => {
            const apiPeriod = parseInt(item.lesson_period);

            // Tìm dòng tương ứng dựa theo số tiết trong API (ví dụ: API trả về tiết 1->7 hoặc bạn tự map logic)
            const rowIdx = matrix.findIndex((r) => r.periodValue === apiPeriod);

            if (rowIdx !== -1) {
              const dayKey = DAYS_IN_WEEK.find(
                (d) => d.key.toLowerCase() === item.day_of_week.toLowerCase(),
              )?.key;

              if (dayKey) {
                matrix[rowIdx][dayKey] = {
                  subject: item.subject_name,
                  teacher: item.teacher_name,
                  room: item.room,
                };
              }
            }
          });

          setScheduleMatrix(matrix);
        } else {
          message.error("Không thể tải thời khóa biểu.");
        }
      } catch (error) {
        console.error("Lỗi khi fetch thời khóa biểu:", error);
        message.error("Đã xảy ra lỗi kết nối hệ thống.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [studentId]);

  // Hàm render nội dung cho từng ô tiết học
  const renderScheduleCell = (cellData) => {
    if (!cellData)
      return (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          -
        </Text>
      );

    return (
      <div style={{ padding: "4px 0" }}>
        <Text
          strong
          style={{ color: "#1e293b", display: "block", marginBottom: "2px" }}
        >
          {cellData.subject}
        </Text>
        <Space direction="vertical" size={0} style={{ display: "flex" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <Icon
              icon="solar:user-rounded-linear"
              style={{ verticalAlign: "middle", marginRight: "4px" }}
            />
            {cellData.teacher || "Chưa phân công"}
          </Text>
          <Tag color="cyan" style={{ marginTop: "4px", fontSize: "11px" }}>
            Phòng: {cellData.room}
          </Tag>
        </Space>
      </div>
    );
  };

  // Cấu hình các cột của bảng Thời khóa biểu
  const columns = [
    {
      title: "Buổi",
      dataIndex: "session",
      key: "session",
      width: 80,
      align: "center",
      fixed: "left",
      // Gộp ô (rowSpan) cho các hàng cùng buổi Sáng hoặc Chiều
      onCell: (record, index) => {
        if (index === 0) return { rowSpan: 4 }; // Sáng chiếm 4 hàng đầu
        if (index === 4) return { rowSpan: 3 }; // Chiều chiếm 3 hàng tiếp theo
        return { rowSpan: 0 }; // Các hàng còn lại bị gộp
      },
      render: (value) => (
        <Text
          strong
          style={{ color: value === "Sáng" ? "#e67e22" : "#9b59b6" }}
        >
          {value}
        </Text>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "periodLabel",
      key: "periodLabel",
      width: 120,
      align: "center",
      fixed: "left",
      render: (text, record) => (
        <Tag
          color={record.session === "Sáng" ? "blue" : "purple"}
          style={{ fontWeight: "bold", padding: "4px 8px" }}
        >
          {text}
        </Tag>
      ),
    },
    ...DAYS_IN_WEEK.map((day) => ({
      title: day.label,
      dataIndex: day.key,
      key: day.key,
      align: "center",
      width: 160,
      render: (cellData) => renderScheduleCell(cellData),
    })),
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" tip="Đang sắp xếp lịch học..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "4px" }}>
      {/* TIÊU ĐỀ TRANG */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      >
        <Col>
          <Space size="middle">
            <Icon
              icon="solar:calendar-date-bold-duotone"
              style={{ color: "#37B0C3", fontSize: "32px" }}
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Thời khóa biểu lên lớp
              </Title>
              {studentInfo.name && (
                <Text type="secondary">
                  Học sinh: <Text strong>{studentInfo.name}</Text> | Lớp:{" "}
                  <Text strong style={{ color: "#37B0C3" }}>
                    {studentInfo.className}
                  </Text>
                </Text>
              )}
            </div>
          </Space>
        </Col>
      </Row>

      {/* BẢNG LƯỚI THỜI KHÓA BIỂU */}
      <Card
        bordered={false}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
      >
        {scheduleMatrix.length > 0 ? (
          <Table
            dataSource={scheduleMatrix}
            columns={columns}
            pagination={false}
            bordered
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa có lịch học được sắp xếp" }}
          />
        ) : (
          <Empty description="Không có dữ liệu thời khóa biểu" />
        )}
      </Card>
    </div>
  );
};

export default StudentSchedule;
