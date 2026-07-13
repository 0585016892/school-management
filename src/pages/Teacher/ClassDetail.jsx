import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Tabs,
  Card,
  Table,
  Spin,
  Tag,
  Typography,
  Space,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Avatar,
} from "antd";
import { useParams } from "react-router-dom";
import {
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  StarOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";
import AuthContext from "../../context/AuthContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

const ClassDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // States bộ lọc & tìm kiếm học tập
  const [studentSearch, setStudentSearch] = useState("");
  const [scoreSearch, setScoreSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // States bộ lọc điểm danh
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("all");
  const [attendanceDateFilter, setAttendanceDateFilter] = useState(null);

  // Màu chủ đạo đồng bộ hệ thống layout sáng
  const PRIMARY_COLOR = "#37B0C3";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(
          `/classes/teacher/${user.teacher_id}/classes`,
        );
        setData(res);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.teacher_id) load();
  }, [id, user]);

  const studentMap = useMemo(() => {
    if (!data?.students) return new Map();
    return new Map(data.students.map((s) => [s.id, s]));
  }, [data?.students]);

  const uniqueSubjects = useMemo(() => {
    if (!data?.scores) return [];
    const subjects = data.scores
      .map((item) => item.subject_name)
      .filter(Boolean);
    return Array.from(new Set(subjects));
  }, [data?.scores]);

  // 1. Lọc danh sách sinh viên
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    return data.students.filter((student) => {
      return (
        student.full_name
          ?.toLowerCase()
          .includes(studentSearch.toLowerCase()) ||
        student.student_code
          ?.toLowerCase()
          .includes(studentSearch.toLowerCase())
      );
    });
  }, [data?.students, studentSearch]);

  // 2. Gom nhóm điểm và tự động tính ĐTB
  const pivotedScores = useMemo(() => {
    if (!data?.scores) return [];

    const grouped = {};
    data.scores.forEach((item) => {
      const sInfo = studentMap.get(item.student_id);
      const studentCode = item.student_code || sInfo?.student_code || "N/A";
      const fullName = item.full_name || sInfo?.full_name || "N/A";
      const key = `${item.student_id}_${item.subject_name}`;

      if (!grouped[key]) {
        grouped[key] = {
          key: key,
          student_id: item.student_id,
          student_code: studentCode,
          full_name: fullName,
          subject_name: item.subject_name || "N/A",
          mieng: "—",
          "15p": "—",
          "1tiet": "—",
          giuaky: "—",
          cuoiky: "—",
        };
      }

      if (item.score_type) {
        grouped[key][item.score_type.toLowerCase()] = item.score;
      }
    });

    return Object.values(grouped)
      .map((row) => {
        let totalWeight = 0;
        let totalScore = 0;
        const weights = {
          mieng: 1,
          "15p": 1,
          "1tiet": 2,
          giuaky: 2,
          cuoiky: 3,
        };

        Object.keys(weights).forEach((type) => {
          if (
            row[type] !== "—" &&
            row[type] !== null &&
            row[type] !== undefined
          ) {
            const scoreVal = parseFloat(row[type]);
            if (!isNaN(scoreVal)) {
              totalScore += scoreVal * weights[type];
              totalWeight += weights[type];
            }
          }
        });

        row.dtb = totalWeight > 0 ? (totalScore / totalWeight).toFixed(2) : "—";
        return row;
      })
      .filter((item) => {
        const matchText =
          item.full_name.toLowerCase().includes(scoreSearch.toLowerCase()) ||
          item.student_code.toLowerCase().includes(scoreSearch.toLowerCase()) ||
          item.subject_name.toLowerCase().includes(scoreSearch.toLowerCase());

        const matchSubject =
          subjectFilter === "all" || item.subject_name === subjectFilter;
        return matchText && matchSubject;
      });
  }, [data?.scores, scoreSearch, subjectFilter, studentMap]);

  // 3. Lọc dữ liệu chuyên cần
  const filteredAttendance = useMemo(() => {
    if (!data?.attendance) return [];
    return data.attendance
      .map((attItem) => {
        const sInfo = studentMap.get(attItem.student_id);
        return {
          ...attItem,
          full_name: attItem.full_name || sInfo?.full_name || "N/A",
          student_code: attItem.student_code || sInfo?.student_code || "N/A",
        };
      })
      .filter((attItem) => {
        const matchText =
          attItem.full_name
            .toLowerCase()
            .includes(attendanceSearch.toLowerCase()) ||
          attItem.student_code
            .toLowerCase()
            .includes(attendanceSearch.toLowerCase());

        const matchStatus =
          attendanceStatusFilter === "all" ||
          attItem.status === attendanceStatusFilter;
        const matchDate =
          !attendanceDateFilter ||
          dayjs(attItem.attendance_date).format("YYYY-MM-DD") ===
            attendanceDateFilter.format("YYYY-MM-DD");

        return matchText && matchStatus && matchDate;
      });
  }, [
    data?.attendance,
    attendanceSearch,
    attendanceStatusFilter,
    attendanceDateFilter,
    studentMap,
  ]);

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
          style={{ color: PRIMARY_COLOR }}
          tip="Đang tải thông tin chi tiết lớp học..."
        />
      </div>
    );
  }
  if (!data) return null;

  // Custom cell renderer cho các đầu điểm thành phần
  const renderScore = (score) => {
    if (score === "—" || score === undefined || score === null)
      return <Text style={{ color: "#94a3b8" }}>—</Text>;
    const num = parseFloat(score);
    return (
      <span style={{ fontWeight: 600, color: num < 5 ? "#ef4444" : "#10b981" }}>
        {score}
      </span>
    );
  };

  // Custom cell renderer cho điểm trung bình môn học
  const renderDTB = (score) => {
    if (score === "—") return <Text style={{ color: "#94a3b8" }}>—</Text>;
    const num = parseFloat(score);
    let labelColor = "#ef4444";
    let bgColor = "#fef2f2";

    if (num >= 7.0) {
      labelColor = PRIMARY_COLOR;
      bgColor = "rgba(55, 176, 195, 0.1)";
    } else if (num >= 5.0) {
      labelColor = "#f59e0b";
      bgColor = "#fffbeb";
    }

    return (
      <span
        style={{
          fontWeight: 700,
          fontSize: "13px",
          color: labelColor,
          backgroundColor: bgColor,
          padding: "4px 10px",
          borderRadius: "6px",
          display: "inline-block",
          minWidth: "50px",
          textAlign: "center",
        }}
      >
        {score}
      </span>
    );
  };

  const scoreColumns = [
    {
      title: "Mã SV",
      dataIndex: "student_code",
      key: "student_code",
      width: 110,
      fixed: "left",
      render: (code) => (
        <code style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>{code}</code>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 180,
      fixed: "left",
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#1e293b" }}>{text}</span>
      ),
    },
    {
      title: "Môn học",
      dataIndex: "subject_name",
      key: "subject_name",
      width: 160,
      render: (text) => (
        <span style={{ color: "#475569", fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: "Điểm Miệng",
      dataIndex: "mieng",
      align: "center",
      width: 110,
      render: renderScore,
    },
    {
      title: "Điểm 15P",
      dataIndex: "15p",
      align: "center",
      width: 110,
      render: renderScore,
    },
    {
      title: "Điểm 1 Tiết",
      dataIndex: "1tiet",
      align: "center",
      width: 110,
      render: renderScore,
    },
    {
      title: "Giữa Kỳ",
      dataIndex: "giuaky",
      align: "center",
      width: 110,
      render: renderScore,
    },
    {
      title: "Cuối Kỳ",
      dataIndex: "cuoiky",
      align: "center",
      width: 110,
      render: renderScore,
    },
    {
      title: "ĐTB Môn",
      dataIndex: "dtb",
      align: "center",
      width: 120,
      fixed: "right",
      render: renderDTB,
    },
  ];

  const studentColumns = [
    {
      title: "Mã SV",
      dataIndex: "student_code",
      key: "student_code",
      width: 120,
      fixed: "left",
      render: (code) => (
        <code style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>{code}</code>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
      width: 220,
      fixed: "left",
      render: (text, record) => (
        <Space size={10}>
          {record.avatar ? (
            <Avatar src={record.avatar} size={32} />
          ) : (
            <Avatar
              size={32}
              style={{
                backgroundColor: "rgba(55, 176, 195, 0.12)",
                color: PRIMARY_COLOR,
                fontWeight: 700,
              }}
            >
              {text?.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <span style={{ fontWeight: 600, color: "#1e293b" }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      align: "center",
      render: (gender) => {
        let isMale = gender === "Nam";
        return (
          <Tag
            color={isMale ? "blue" : gender === "Nữ" ? "magenta" : "default"}
            style={{ borderRadius: "6px", fontWeight: 500 }}
          >
            {gender || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      key: "birthday",
      width: 130,
      render: (date) => (
        <span style={{ color: "#475569" }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}
        </span>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (t) => t || "—",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (t) => t || "—",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 180,
      render: (t) => t || "—",
    },
  ];

  const attendanceColumns = [
    {
      title: "Mã SV",
      dataIndex: "student_code",
      key: "student_code",
      width: 130,
      render: (code) => (
        <code style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>{code}</code>
      ),
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => (
        <span style={{ fontWeight: 600, color: "#1e293b" }}>{text}</span>
      ),
    },
    {
      title: "Ngày điểm danh",
      dataIndex: "attendance_date",
      width: 160,
      render: (date) => (
        <span style={{ color: "#475569", fontWeight: 500 }}>
          {dayjs(date).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (status) => {
        let color = "error";
        let text = "Vắng";
        if (status === "present") {
          color = "success";
          text = "Có mặt";
        } else if (status === "late") {
          color = "warning";
          text = "Muộn";
        }
        return (
          <Tag color={color} style={{ borderRadius: "6px", fontWeight: 600 }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Ghi chú lý do",
      dataIndex: "note",
      key: "note",
      render: (t) => t || <span style={{ color: "#94a3b8" }}>—</span>,
    },
  ];

  return (
    <div style={{ padding: "0px", background: "transparent" }}>
      {/* Tinh chỉnh Style CSS của thẻ Tab theo tone màu chủ đạo */}
      <style>{`
        .custom-detail-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .custom-detail-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${PRIMARY_COLOR} !important;
        }
        .custom-detail-tabs .ant-tabs-ink-bar {
          background: ${PRIMARY_COLOR} !important;
        }
        .custom-detail-tabs .ant-tabs-tab:hover {
          color: ${PRIMARY_COLOR} !important;
        }
        .filter-box {
          background: #ffffff;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
      `}</style>

      {/* HEADER BANNER TOP */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          borderBottom: "1px dashed #e2e8f0",
          paddingBottom: "20px",
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
            <BookOutlined style={{ color: PRIMARY_COLOR, fontSize: "24px" }} />
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
              Lớp Học: {data.class?.class_name}
            </h2>
            <Space style={{ marginTop: "4px" }} size={4}>
              <UserOutlined style={{ color: "#64748b" }} />
              <Text style={{ color: "#64748b", fontSize: "14px" }}>
                Giảng viên phụ trách:{" "}
                <span style={{ fontWeight: 500, color: "#334155" }}>
                  {data.class?.teacher_name}
                </span>
              </Text>
            </Space>
          </div>
        </div>
      </div>

      {/* CONTENT TABS */}
      <Card
        bordered={false}
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.015)",
          border: "1px solid #e2e8f0",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Tabs
          defaultActiveKey="2"
          type="line"
          size="large"
          className="custom-detail-tabs"
          items={[
            {
              key: "1",
              label: (
                <span style={{ fontWeight: 500 }}>
                  <UserOutlined /> Danh sách sinh viên
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <div className="filter-box">
                    <Row>
                      <Col xs={24} sm={12} md={8}>
                        <Input
                          placeholder="Tìm kiếm mã SV, họ tên..."
                          prefix={
                            <SearchOutlined style={{ color: "#94a3b8" }} />
                          }
                          allowClear
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          style={{ borderRadius: "8px" }}
                        />
                      </Col>
                    </Row>
                  </div>
                  <Table
                    rowKey="id"
                    dataSource={filteredStudents}
                    columns={studentColumns}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ x: 1100 }}
                    size="middle"
                  />
                </Space>
              ),
            },
            {
              key: "2",
              label: (
                <span style={{ fontWeight: 500 }}>
                  <StarOutlined /> Bảng điểm học tập
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <div className="filter-box">
                    <Row gutter={[16, 16]} align="middle">
                      <Col xs={24} md={10}>
                        <Input
                          placeholder="Tìm kiếm mã SV, tên sinh viên..."
                          prefix={
                            <SearchOutlined style={{ color: "#94a3b8" }} />
                          }
                          allowClear
                          value={scoreSearch}
                          onChange={(e) => setScoreSearch(e.target.value)}
                          style={{ borderRadius: "8px" }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Select
                          style={{ width: "100%" }}
                          value={subjectFilter}
                          onChange={(value) => setSubjectFilter(value)}
                          dropdownStyle={{ borderRadius: "8px" }}
                        >
                          <Option value="all">Tất cả môn học</Option>
                          {uniqueSubjects.map((sub) => (
                            <Option key={sub} value={sub}>
                              {sub}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                    </Row>
                  </div>
                  <Table
                    rowKey="key"
                    dataSource={pivotedScores}
                    columns={scoreColumns}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    scroll={{ x: 1250 }}
                    size="middle"
                  />
                </Space>
              ),
            },
            {
              key: "3",
              label: (
                <span style={{ fontWeight: 500 }}>
                  <CalendarOutlined /> Chuyên cần lớp
                </span>
              ),
              children: (
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <div className="filter-box">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={9}>
                        <Input
                          placeholder="Tìm kiếm mã SV, tên sinh viên..."
                          prefix={
                            <SearchOutlined style={{ color: "#94a3b8" }} />
                          }
                          allowClear
                          value={attendanceSearch}
                          onChange={(e) => setAttendanceSearch(e.target.value)}
                          style={{ borderRadius: "8px" }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Select
                          style={{ width: "100%" }}
                          value={attendanceStatusFilter}
                          onChange={(value) => setAttendanceStatusFilter(value)}
                        >
                          <Option value="all">Tất cả trạng thái</Option>
                          <Option value="present">Có mặt</Option>
                          <Option value="late">Muộn</Option>
                          <Option value="absent">Vắng</Option>
                        </Select>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <DatePicker
                          style={{ width: "100%", borderRadius: "8px" }}
                          placeholder="Chọn ngày điểm danh"
                          format="DD/MM/YYYY"
                          value={attendanceDateFilter}
                          onChange={(date) => setAttendanceDateFilter(date)}
                          allowClear
                        />
                      </Col>
                    </Row>
                  </div>
                  <Table
                    rowKey="id"
                    dataSource={filteredAttendance}
                    columns={attendanceColumns}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    size="middle"
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ClassDetail;
