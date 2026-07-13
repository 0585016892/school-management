import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  DatePicker,
  Select,
  Radio,
  Input,
  Button,
  Typography,
  Space,
  message,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { attendanceApi } from "../../api/attendanceApi";
import scheduleApi from "../../api/scheduleApi";
import useAuth from "../../hooks/useAuth";
import Loading from "../../components/Loading";

const { Title, Text } = Typography;

const AttendanceTeacher = () => {
  const { user } = useAuth();
  const teacherId = user?.teacher_id;

  const [isLoading, setIsLoading] = useState(true);
  const [attendanceList, setAttendanceList] = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Màu chủ đạo hệ thống sáng
  const PRIMARY_COLOR = "#37B0C3";

  // --- 1. Lấy danh sách lớp học của Giáo viên ---
  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherClasses = async () => {
      try {
        const response = await scheduleApi.getByTeacherId(teacherId);
        const scheduleData = response?.data || response || [];

        const uniqueClassesMap = {};
        scheduleData.forEach((item) => {
          if (item.class_id) {
            uniqueClassesMap[item.class_id] =
              item.class_name || `Lớp (ID: ${item.class_id})`;
          }
        });

        const formattedClasses = Object.keys(uniqueClassesMap).map((id) => ({
          id: Number(id),
          name: uniqueClassesMap[id],
        }));

        setClasses(formattedClasses);

        if (formattedClasses.length > 0) {
          setSelectedClassId(formattedClasses[0].id);
        }
      } catch (err) {
        message.error("Không thể tải danh sách lớp học.");
      }
    };

    fetchTeacherClasses();
  }, [teacherId]);

  // --- 2. Tải danh sách học sinh cần điểm danh ---
  const fetchAttendance = async () => {
    if (!teacherId || !selectedClassId) return;

    setIsLoading(true);
    try {
      const response = await attendanceApi.getStudentsByClassTeacher(
        selectedClassId,
        teacherId,
      );
      const data = response?.data || response || [];

      const formattedFilterDate = selectedDate.format("YYYY-MM-DD");
      const dayData = data.filter((item) => {
        return (
          dayjs(item.attendance_date).format("YYYY-MM-DD") ===
          formattedFilterDate
        );
      });

      setAttendanceList(dayData);
    } catch (err) {
      message.error("Lỗi khi tải danh sách điểm danh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [teacherId, selectedClassId, selectedDate]);

  // --- 3. Thay đổi trạng thái/ghi chú Local ---
  const handleStatusChange = (id, newStatus) => {
    setAttendanceList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
  };

  const handleNoteChange = (id, newNote) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note: newNote } : item)),
    );
  };

  // --- 4. GỬI API CẬP NHẬT ---
  const handleSaveAttendance = async () => {
    if (attendanceList.length === 0) return;

    setIsLoading(true);
    try {
      const payload = {
        class_id: selectedClassId,
        attendance_date: selectedDate.format("YYYY-MM-DD"),
        teacher_id: teacherId,
        students: attendanceList.map((item) => ({
          student_id: item.student_id || item.student_actual_id,
          status: item.status || "present",
          note: item.note || null,
        })),
      };
      const response = await attendanceApi.bulk(payload);
      if (response.success || response) {
        message.success(
          `Đã cập nhật điểm danh ngày ${selectedDate.format("DD/MM/YYYY")}`,
        );
        fetchAttendance();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else {
        alert(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng Internet!",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 5. Thống kê số lượng ---
  const stats = attendanceList.reduce(
    (acc, cur) => {
      if (cur.status === "present") acc.present++;
      else if (cur.status === "absent") acc.absent++;
      else if (cur.status === "late") acc.late++;
      else if (cur.status === "excused") acc.excused++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0 },
  );

  const columns = [
    {
      title: "Mã Học Sinh",
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
      width: 220,
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#1e293b" }}>{text}</span>
      ),
    },
    {
      title: "Trạng Thái Điểm Danh",
      dataIndex: "status",
      key: "status",
      width: 450,
      align: "center",
      render: (status, record) => (
        <Radio.Group
          value={status || "present"}
          onChange={(e) => handleStatusChange(record.id, e.target.value)}
          className="custom-attendance-radio-group"
        >
          <Radio.Button value="present" className="btn-present">
            <CheckCircleOutlined /> Có mặt
          </Radio.Button>
          <Radio.Button value="late" className="btn-late">
            <ClockCircleOutlined /> Muộn
          </Radio.Button>
          <Radio.Button value="excused" className="btn-excused">
            <ExclamationCircleOutlined /> Có phép
          </Radio.Button>
          <Radio.Button value="absent" className="btn-absent">
            <CloseCircleOutlined /> Vắng
          </Radio.Button>
        </Radio.Group>
      ),
    },
    {
      title: "Ghi chú / Lý do",
      dataIndex: "note",
      key: "note",
      render: (note, record) => (
        <Input
          placeholder="Nhập lý do vắng, muộn..."
          value={note || ""}
          onChange={(e) => handleNoteChange(record.id, e.target.value)}
          style={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
        />
      ),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen={true} text="Đang tải dữ liệu hệ thống..." />;
  }

  return (
    <div style={{ padding: "0px", background: "transparent" }}>
      {/* CSS Nhúng Tinh Chỉnh Nút Điểm Danh và Form */}
      <style>{`
        .custom-attendance-radio-group {
          display: flex !important;
          width: 100%;
          border-radius: 10px;
          overflow: hidden;
          background: #f1f5f9;
          padding: 4px;
          border: none;
        }
        .custom-attendance-radio-group .ant-radio-button-wrapper {
          flex: 1;
          text-align: center;
          border: none !important;
          background: transparent !important;
          color: #64748b;
          border-radius: 8px !important;
          margin: 0 2px !important;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 600;
          height: 34px;
          font-size: 13px;
        }
        .custom-attendance-radio-group .ant-radio-button-wrapper::before {
          display: none !important;
        }
        
        /* Màu khi Active đồng bộ tinh tế */
        .custom-attendance-radio-group .ant-radio-button-wrapper-checked.btn-present {
          background-color: #10b981 !important; /* Xanh cây Mint hiện đại */
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
        }
        .custom-attendance-radio-group .ant-radio-button-wrapper-checked.btn-late {
          background-color: #f59e0b !important; /* Vàng hổ phách */
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2);
        }
        .custom-attendance-radio-group .ant-radio-button-wrapper-checked.btn-excused {
          background-color: #3b82f6 !important; /* Xanh dương sâu */
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
        }
        .custom-attendance-radio-group .ant-radio-button-wrapper-checked.btn-absent {
          background-color: #ef4444 !important; /* Đỏ Rose cực nét */
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
        }
      `}</style>

      {/* HEADER TÁC VỤ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            Quản Lý Điểm Danh
          </h2>
          <p
            style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}
          >
            Vui lòng chọn đúng lớp học và ngày để cập nhật thông tin hiện diện
            của học sinh.
          </p>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          size="large"
          onClick={handleSaveAttendance}
          loading={isLoading}
          style={{
            borderRadius: "10px",
            backgroundColor: PRIMARY_COLOR,
            borderColor: PRIMARY_COLOR,
            fontWeight: 600,
            height: "42px",
            boxShadow: `0 4px 12px rgba(55, 176, 195, 0.25)`,
          }}
        >
          Lưu Kết Quả
        </Button>
      </div>

      {/* KHỐI BỘ LỌC HIỆN ĐẠI */}
      <Card
        bordered={false}
        style={{
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.01)",
          border: "1px solid #e2e8f0",
          marginBottom: "24px",
        }}
        bodyStyle={{ padding: "20px 24px" }}
      >
        <Space size={32} wrap>
          <Space size={10}>
            <FilterOutlined
              style={{ color: PRIMARY_COLOR, fontSize: "16px" }}
            />
            <Text strong style={{ color: "#475569" }}>
              Lớp giảng dạy:
            </Text>
            <Select
              style={{ width: 200 }}
              placeholder="Chọn lớp học"
              value={selectedClassId}
              onChange={(val) => setSelectedClassId(val)}
              options={classes.map((cls) => ({
                value: cls.id,
                label: cls.name,
              }))}
            />
          </Space>

          <Space size={10}>
            <Text strong style={{ color: "#475569" }}>
              Ngày thực hiện:
            </Text>
            <DatePicker
              format="DD/MM/YYYY"
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              allowClear={false}
              style={{ width: 160, borderRadius: "8px" }}
            />
          </Space>
        </Space>
      </Card>

      {/* BANNER THỐNG KÊ NHANH (STATS BANNER) */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title={
                <span style={{ color: "#047857", fontWeight: 600 }}>
                  Có Mặt
                </span>
              }
              value={stats.present}
              valueStyle={{ color: "#10b981", fontWeight: 700 }}
              suffix={
                <span style={{ fontSize: "14px", color: "#047857" }}>
                  / {attendanceList.length} SV
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.15)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title={
                <span style={{ color: "#b45309", fontWeight: 600 }}>
                  Đi Muộn
                </span>
              }
              value={stats.late}
              valueStyle={{ color: "#f59e0b", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title={
                <span style={{ color: "#1d4ed8", fontWeight: 600 }}>
                  Có Phép
                </span>
              }
              value={stats.excused}
              valueStyle={{ color: "#3b82f6", fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Statistic
              title={
                <span style={{ color: "#b91c1c", fontWeight: 600 }}>
                  Vắng Không Phép
                </span>
              }
              value={stats.absent}
              valueStyle={{ color: "#ef4444", fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* BẢNG TƯƠNG TÁC CHÍNH */}
      <Card
        bordered={false}
        style={{
          borderRadius: "14px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.015)",
          border: "1px solid #e2e8f0",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={attendanceList}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          size="middle"
          locale={{
            emptyText:
              "Không có dữ liệu điểm danh của lớp trong ngày được chọn.",
          }}
        />
      </Card>
    </div>
  );
};

export default AttendanceTeacher;
