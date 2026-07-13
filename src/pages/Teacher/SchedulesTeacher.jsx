import React, { useState, useEffect } from "react";
import { Card, Table, Typography, Space, Tag, message, Alert } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import scheduleApi from "../../api/scheduleApi";
import useAuth from "../../hooks/useAuth";

const { Title, Text } = Typography;

const SchedulesTeacher = () => {
  const { user } = useAuth();
  const teacherId = user?.teacher_id;

  const [rawSchedules, setRawSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Màu chủ đạo đồng bộ hệ thống layout sáng
  const PRIMARY_COLOR = "#37B0C3";

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const dayLabels = {
    Monday: "Thứ 2",
    Tuesday: "Thứ 3",
    Wednesday: "Thứ 4",
    Thursday: "Thứ 5",
    Friday: "Thứ 6",
    Saturday: "Thứ 7",
    Sunday: "Chủ Nhật",
  };

  // --- 1. Gọi API lấy thời khóa biểu giáo viên ---
  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherSchedules = async () => {
      setLoading(true);
      try {
        const response = await scheduleApi.getByTeacherId(teacherId);
        setRawSchedules(response?.data || response || []);
      } catch (err) {
        message.error("Lỗi khi tải thời khóa biểu cá nhân");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSchedules();
  }, [teacherId]);

  // --- 2. Cấu trúc ma trận dữ liệu: Sáng (1->4), Chiều (5->7) ---
  const generateTableData = () => {
    const dataSource = [];
    const periodsConfig = [
      { id: 1, label: "Tiết 1", session: "Sáng" },
      { id: 2, label: "Tiết 2", session: "Sáng" },
      { id: 3, label: "Tiết 3", session: "Sáng" },
      { id: 4, label: "Tiết 4", session: "Sáng" },
      { id: 5, label: "Tiết 5", session: "Chiều" },
      { id: 6, label: "Tiết 6", session: "Chiều" },
      { id: 7, label: "Tiết 7", session: "Chiều" },
    ];

    periodsConfig.forEach((p) => {
      const row = {
        key: p.id,
        session: p.session,
        period: p.label,
      };

      daysOfWeek.forEach((day) => {
        const match = rawSchedules.find(
          (item) =>
            item.day_of_week === day && Number(item.lesson_period) === p.id,
        );
        row[day] = match || null;
      });

      dataSource.push(row);
    });

    return dataSource;
  };

  // --- 3. Cấu hình cột hiển thị với tính năng gộp dòng ---
  const columns = [
    {
      title: "Buổi",
      dataIndex: "session",
      key: "session",
      width: 90,
      align: "center",
      fixed: "left",
      onCell: (record, rowIndex) => {
        if (rowIndex === 0) return { rowSpan: 4 };
        if (rowIndex > 0 && rowIndex < 4) return { rowSpan: 0 };
        if (rowIndex === 4) return { rowSpan: 3 };
        if (rowIndex > 4) return { rowSpan: 0 };
        return {};
      },
      render: (text) => (
        <span
          style={{
            fontWeight: 700,
            color: text === "Sáng" ? PRIMARY_COLOR : "#f59e0b",
            fontSize: "14px",
            letterSpacing: "0.3px",
          }}
        >
          {text.toUpperCase()}
        </span>
      ),
    },
    {
      title: "Tiết",
      dataIndex: "period",
      key: "period",
      width: 90,
      fixed: "left",
      align: "center",
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#475569" }}>{text}</span>
      ),
    },
    ...daysOfWeek.map((day) => ({
      title: dayLabels[day],
      dataIndex: day,
      key: day,
      align: "center",
      width: 160,
      render: (schedule) => {
        if (!schedule)
          return (
            <span
              style={{
                color: "#cbd5e1",
                fontStyle: "italic",
                fontSize: "16px",
              }}
            >
              —
            </span>
          );

        return (
          <div className="schedule-cell-card">
            <div className="subject-title">{schedule.subject_name}</div>
            <div className="meta-info-container">
              <span className="meta-badge class-badge">
                <TeamOutlined style={{ fontSize: "11px" }} /> Lớp{" "}
                {schedule.class_name}
              </span>
              <span className="meta-badge room-badge">
                <EnvironmentOutlined style={{ fontSize: "11px" }} /> P.{" "}
                {schedule.room}
              </span>
            </div>
          </div>
        );
      },
    })),
  ];

  if (!teacherId) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Cảnh báo quyền truy cập"
          description="Không tìm thấy thông tin tài khoản giáo viên hợp lệ. Vui lòng đăng nhập lại."
          type="warning"
          showIcon
          style={{ borderRadius: "10px" }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "0px", background: "transparent" }}>
      {/* Tùy chỉnh hiệu ứng hiển thị CSS phẳng chuẩn SaaS */}
      <style>{`
        .custom-schedule-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #e2e8f0 !important;
        }
        .schedule-cell-card {
          padding: 10px 8px;
          background: #ffffff;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          text-align: left;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.01);
        }
        .schedule-cell-card:hover {
          transform: translateY(-2px);
          border-color: ${PRIMARY_COLOR};
          box-shadow: 0 6px 16px rgba(55, 176, 195, 0.12);
        }
        .subject-title {
          font-weight: 700;
          color: #1e293b;
          font-size: 13.5px;
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .meta-info-container {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 6px;
          width: fit-content;
        }
        .class-badge {
          background-color: rgba(55, 176, 195, 0.08);
          color: ${PRIMARY_COLOR};
        }
        .room-badge {
          background-color: #fffbeb;
          color: #d97706;
          border: 1px solid #fef3c7;
        }
      `}</style>

      {/* HEADER BANNER TOP */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "rgba(55, 176, 195, 0.1)",
              padding: "12px",
              borderRadius: "14px",
              display: "flex",
            }}
          >
            <CalendarOutlined
              style={{ color: PRIMARY_COLOR, fontSize: "24px" }}
            />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Thời Khóa Biểu Cá Nhân
            </h2>
            <p
              style={{
                color: "#64748b",
                margin: "4px 0 0 0",
                fontSize: "14px",
              }}
            >
              Theo dõi và quản lý lịch biểu lịch dạy chi tiết theo các tiết học
              trong tuần.
            </p>
          </div>
        </div>

        {/* PROFILE BADGE */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "8px 16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.015)",
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "#10b981", fontSize: "14px" }} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.2,
            }}
          >
            <span
              style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}
            >
              Giảng viên
            </span>
            <span
              style={{ fontSize: "13.5px", color: "#1e293b", fontWeight: 600 }}
            >
              {user?.full_name || user?.username || "Ban Giảng Dạy"}
            </span>
          </div>
        </div>
      </div>

      {/* KHỐI BẢNG MA TRẬN THỜI KHÓA BIỂU */}
      <Card
        bordered={false}
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.015)",
          border: "1px solid #e2e8f0",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <Table
          className="custom-schedule-table"
          columns={columns}
          dataSource={generateTableData()}
          pagination={false}
          loading={loading}
          bordered
          scroll={{ x: 1100 }}
          locale={{
            emptyText: "Bạn chưa có lịch phân công giảng dạy trong tuần này",
          }}
        />
      </Card>
    </div>
  );
};

export default SchedulesTeacher;
