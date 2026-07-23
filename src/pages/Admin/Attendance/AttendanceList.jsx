import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Select,
  Card,
  Button,
  Space,
  message,
  Radio,
  Input,
  DatePicker,
  Row,
  Col,
  Statistic,
  Typography,
} from "antd";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";

import classApi from "../../../api/classApi";
import studentApi from "../../../api/studentApi";
import { attendanceApi } from "../../../api/attendanceApi";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { label: "Có mặt", value: "present", color: "#22c55e" },
  { label: "Muộn", value: "late", color: "#eab308" },
  { label: "Vắng", value: "absent", color: "#ef4444" },
  { label: "Phép", value: "excused", color: "#37B0C3" },
];

const AttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [classId, setClassId] = useState(null);
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ================= LOAD CLASSES =================
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await classApi.getAll();
        setClasses(res?.data || []);
      } catch {
        message.error("Lỗi tải danh sách lớp học");
      }
    };
    loadClasses();
  }, []);

  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };

  // ================= LOAD ATTENDANCE =================
  const loadAttendance = async (cid, selectedDate) => {
    if (!cid) return;
    setLoading(true);

    try {
      const res = await attendanceApi.getAll({
        class_id: cid,
        date: selectedDate,
      });
      const attendanceData = res?.data || [];

      if (attendanceData.length > 0) {
        const map = new Map();
        attendanceData.forEach((a) => {
          map.set(a.student_id, {
            id: a.student_id,
            student_code: a.student_code,
            full_name: a.full_name,
            status: a.status,
            note: a.note || "",
          });
        });
        setStudents(Array.from(map.values()));
        return;
      }

      const studentRes = await studentApi.getByClass(cid);
      const studentData = studentRes?.data || studentRes || [];

      setStudents(
        studentData.map((s) => ({
          id: s.id,
          student_code: s.student_code,
          full_name: s.full_name,
          status: "present",
          note: "",
        })),
      );
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải dữ liệu điểm danh");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE STATUS / NOTE =================
  const updateStatus = (id, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  };

  const updateNote = (id, note) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, note } : s)));
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!classId) return message.warning("Vui lòng chọn lớp trước khi lưu");
    setSaving(true);

    const payload = {
      class_id: classId,
      attendance_date: date,
      students: students.map((s) => ({
        student_id: s.id,
        status: s.status,
        note: s.note,
      })),
    };

    try {
      await attendanceApi.bulk(payload);
      message.success("Lưu dữ liệu điểm danh thành công!");
      await loadAttendance(classId, date);
    } catch (err) {
      console.error(err);
      message.error("Lỗi lưu điểm danh");
    } finally {
      setSaving(false);
    }
  };

  // ================= TÍNH TOÁN THỐNG KÊ NHANH =================
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter((s) => s.status === "present").length;
    const late = students.filter((s) => s.status === "late").length;
    const absent = students.filter((s) => s.status === "absent").length;
    const excused = students.filter((s) => s.status === "excused").length;
    return { total, present, late, absent, excused };
  }, [students]);

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã HS",
      dataIndex: "student_code",
      width: 130,
      align: "center",
      fixed: "left",
      render: (text) => (
        <Text strong style={styles.codeText}>
          {text?.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      minWidth: 180,
      render: (text) => (
        <Text strong style={{ color: "#1e293b" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Trạng thái điểm danh",
      dataIndex: "status",
      width: 320,
      align: "center",
      render: (status, r) => (
        <Radio.Group
          value={status}
          buttonStyle="solid"
          size="middle"
          onChange={(e) => updateStatus(r.id, e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <Radio.Button
              key={opt.value}
              value={opt.value}
              style={{
                borderColor: status === opt.value ? opt.color : undefined,
                backgroundColor: status === opt.value ? opt.color : undefined,
                color: status === opt.value ? "#fff" : undefined,
              }}
            >
              {opt.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      ),
    },
    {
      title: "Ghi chú thích",
      dataIndex: "note",
      minWidth: 200,
      render: (note, r) => (
        <Input
          placeholder="Lý do vắng, đi muộn..."
          value={note}
          variant="filled"
          onChange={(e) => updateNote(r.id, e.target.value)}
          style={{ borderRadius: 6 }}
        />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* HEADER TÊN TRANG */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={3}
          style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
        >
          Quản lý Điểm danh chuyên cần
        </Title>
        <Text type="secondary">
          Theo dõi, cập nhật trạng thái lên lớp hàng ngày của học sinh
        </Text>
      </div>

      {/* BỘ LỌC HÀNH ĐỘNG */}
      <Card
        bordered={false}
        style={styles.tableCard}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16}>
            <Space size="middle" wrap style={{ width: "100%" }}>
              <div>
                <Text strong style={styles.filterLabel}>
                  Lớp học điểm danh
                </Text>
                <Select
                  showSearch
                  placeholder="Chọn lớp học"
                  style={{ width: 260 }}
                  value={classId}
                  size="large"
                  optionFilterProp="children"
                  dropdownStyle={{ borderRadius: 8 }}
                  onChange={(v) => {
                    setClassId(v);
                    loadAttendance(v, date);
                  }}
                >
                  {classes.map((c) => (
                    <Select.Option key={c.id} value={c.id}>
                      Lớp {c.class_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong style={styles.filterLabel}>
                  Ngày ghi nhận
                </Text>
                <DatePicker
                  style={{ width: 180, borderRadius: 8 }}
                  allowClear={false}
                  size="large"
                  value={dayjs(date)}
                  disabledDate={disabledDate}
                  onChange={(dateObj) => {
                    if (!dateObj) return;
                    const newDate = dateObj.format("YYYY-MM-DD");
                    setDate(newDate);
                    if (classId) loadAttendance(classId, newDate);
                  }}
                />
              </div>
            </Space>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={
                <Icon
                  icon="solar:diskette-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              size="large"
              loading={saving}
              onClick={handleSave}
              disabled={!classId || students.length === 0}
              style={styles.saveBtn}
            >
              Lưu dữ liệu điểm danh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KHỐI THỐNG KÊ DASHBOARD MINI */}
      {classId && (
        <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
          <Col xs={12} sm={4}>
            <Card
              bordered={false}
              style={styles.statCard}
              styles={{ body: { padding: "12px 20px" } }}
            >
              <Statistic
                title={<Text style={styles.statTitle}>Tổng sĩ số</Text>}
                value={stats.total}
                prefix={
                  <Icon
                    icon="solar:users-group-two-rounded-linear"
                    style={{ color: "#64748b", marginRight: 4 }}
                  />
                }
                valueStyle={{
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={5}>
            <Card
              bordered={false}
              style={styles.statCard}
              styles={{ body: { padding: "12px 20px" } }}
            >
              <Statistic
                title={<Text style={styles.statTitle}>Hiện diện</Text>}
                value={stats.present}
                prefix={
                  <Icon
                    icon="solar:check-circle-linear"
                    style={{ color: "#22c55e", marginRight: 4 }}
                  />
                }
                valueStyle={{
                  color: "#22c55e",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={5}>
            <Card
              bordered={false}
              style={styles.statCard}
              styles={{ body: { padding: "12px 20px" } }}
            >
              <Statistic
                title={<Text style={styles.statTitle}>Đi muộn</Text>}
                value={stats.late}
                prefix={
                  <Icon
                    icon="solar:clock-circle-linear"
                    style={{ color: "#eab308", marginRight: 4 }}
                  />
                }
                valueStyle={{
                  color: "#eab308",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={5}>
            <Card
              bordered={false}
              style={styles.statCard}
              styles={{ body: { padding: "12px 20px" } }}
            >
              <Statistic
                title={<Text style={styles.statTitle}>Vắng mặt</Text>}
                value={stats.absent}
                prefix={
                  <Icon
                    icon="solar:close-circle-linear"
                    style={{ color: "#ef4444", marginRight: 4 }}
                  />
                }
                valueStyle={{
                  color: "#ef4444",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              />
            </Card>
          </Col>
          <Col xs={8} sm={5}>
            <Card
              bordered={false}
              style={styles.statCard}
              styles={{ body: { padding: "12px 20px" } }}
            >
              <Statistic
                title={<Text style={styles.statTitle}>Có đơn phép</Text>}
                value={stats.excused}
                prefix={
                  <Icon
                    icon="solar:letter-opened-linear"
                    style={{ color: "#37B0C3", marginRight: 4 }}
                  />
                }
                valueStyle={{
                  color: "#37B0C3",
                  fontWeight: 700,
                  fontSize: "20px",
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* DANH SÁCH BẢNG GRID DỮ LIỆU */}
      <Card bordered={false} style={styles.tableCard}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={students}
          columns={columns}
          pagination={false}
          bordered
          scroll={{ x: 850 }}
          locale={{
            emptyText:
              "Vui lòng chọn lớp học để khởi chạy danh sách học sinh cần xử lý chuyên cần",
          }}
        />
      </Card>
    </div>
  );
};

// HỆ THỐNG PHẲNG UI ĐỒNG BỘ DỰ ÁN
const styles = {
  container: {
    padding: "4px",
  },
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  statCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  filterLabel: {
    display: "block",
    marginBottom: 6,
    color: "#475569",
    fontSize: "13px",
  },
  statTitle: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 500,
  },
  codeText: {
    fontWeight: 700,
    color: "#334155",
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f1f5f9",
    padding: "3px 6px",
    borderRadius: 4,
  },
  saveBtn: {
    borderRadius: 8,
    fontWeight: 600,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
    maxWidth: "220px",
    justifyContent: "center",
  },
};

export default AttendancePage;
