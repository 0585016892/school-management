import React, { useEffect, useState } from "react";
import {
  Table,
  Select,
  Card,
  InputNumber,
  Button,
  Space,
  message,
  Row,
  Col,
  Typography,
  Tag,
} from "antd";
import { Icon } from "@iconify/react";

import classApi from "../../api/classApi";
import studentApi from "../../api/studentApi";
import { subjectApi } from "../../api/subjectApi";
import { scoreApi } from "../../api/scoreApi";

const { Title, Text } = Typography;

const ScorePage = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [classId, setClassId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [semester, setSemester] = useState("HK1");

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* =========================================================
     LOAD DROPDOWN
  ========================================================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([
          classApi.getAll(),
          subjectApi.getAll(),
        ]);

        setClasses(c?.data || []);
        setSubjects(s?.data || []);
      } catch {
        message.error("Lỗi tải dữ liệu danh mục");
      }
    };

    load();
  }, []);

  /* =========================================================
     LOAD BẢNG ĐIỂM
  ========================================================= */
  const loadScores = async (cid, sid, sem) => {
    if (!cid || !sid) return;

    setLoading(true);

    try {
      const res = await scoreApi.getByClass(cid, sid, sem);
      const data = res?.data?.data || res?.data || [];

      const mapped = data.map((s) => ({
        ...s,
        mieng: Number(s.mieng || 0),
        p15: Number(s.p15 || 0),
        tiet1: Number(s.tiet1 || 0),
        giuaky: Number(s.giuaky || 0),
        cuoiky: Number(s.cuoiky || 0),
      }));

      setStudents(mapped);
    } catch (err) {
      console.log(err);
      message.error("Lỗi tải bảng điểm học sinh");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UPDATE CELL
  ========================================================= */
  const updateCell = (id, field, value) => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === id ? { ...s, [field]: value } : s)),
    );
  };

  /* =========================================================
     SAVE BULK
  ========================================================= */
  const handleSave = async () => {
    if (!classId || !subjectId) {
      return message.warning("Vui lòng chọn lớp và môn học trước khi lưu!");
    }

    setSaving(true);

    const payload = {
      scores: [],
    };

    students.forEach((s) => {
      payload.scores.push(
        {
          student_id: s.student_id,
          class_id: classId,
          subject_id: subjectId,
          semester,
          score_type: "mieng",
          score: s.mieng || 0,
        },
        {
          student_id: s.student_id,
          class_id: classId,
          subject_id: subjectId,
          semester,
          score_type: "15p",
          score: s.p15 || 0,
        },
        {
          student_id: s.student_id,
          class_id: classId,
          subject_id: subjectId,
          semester,
          score_type: "1tiet",
          score: s.tiet1 || 0,
        },
        {
          student_id: s.student_id,
          class_id: classId,
          subject_id: subjectId,
          semester,
          score_type: "giuaky",
          score: s.giuaky || 0,
        },
        {
          student_id: s.student_id,
          class_id: classId,
          subject_id: subjectId,
          semester,
          score_type: "cuoiky",
          score: s.cuoiky || 0,
        },
      );
    });

    try {
      await scoreApi.bulkCreate(payload);
      message.success("Đã cập nhật bảng điểm thành công!");
      loadScores(classId, subjectId, semester);
    } catch (err) {
      console.log(err);
      message.error("Lưu bảng điểm thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */
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
      width: 120,
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
      title: "Điểm miệng",
      align: "center",
      width: 110,
      render: (_, r) => (
        <InputNumber
          value={r.mieng}
          min={0}
          max={10}
          step={0.25}
          controls={false}
          variant="filled"
          style={{ width: "100%", textAlign: "center", borderRadius: 6 }}
          onChange={(v) => updateCell(r.student_id, "mieng", v)}
        />
      ),
    },
    {
      title: "Điểm 15p",
      align: "center",
      width: 110,
      render: (_, r) => (
        <InputNumber
          value={r.p15}
          min={0}
          max={10}
          step={0.25}
          controls={false}
          variant="filled"
          style={{ width: "100%", textAlign: "center", borderRadius: 6 }}
          onChange={(v) => updateCell(r.student_id, "p15", v)}
        />
      ),
    },
    {
      title: "Điểm 1 tiết",
      align: "center",
      width: 110,
      render: (_, r) => (
        <InputNumber
          value={r.tiet1}
          min={0}
          max={10}
          step={0.25}
          controls={false}
          variant="filled"
          style={{ width: "100%", textAlign: "center", borderRadius: 6 }}
          onChange={(v) => updateCell(r.student_id, "tiet1", v)}
        />
      ),
    },
    {
      title: "Giữa kỳ",
      align: "center",
      width: 110,
      render: (_, r) => (
        <InputNumber
          value={r.giuaky}
          min={0}
          max={10}
          step={0.25}
          controls={false}
          variant="filled"
          style={{ width: "100%", textAlign: "center", borderRadius: 6 }}
          onChange={(v) => updateCell(r.student_id, "giuaky", v)}
        />
      ),
    },
    {
      title: "Cuối kỳ",
      align: "center",
      width: 110,
      render: (_, r) => (
        <InputNumber
          value={r.cuoiky}
          min={0}
          max={10}
          step={0.25}
          controls={false}
          variant="filled"
          style={{ width: "100%", textAlign: "center", borderRadius: 6 }}
          onChange={(v) => updateCell(r.student_id, "cuoiky", v)}
        />
      ),
    },
    {
      title: "ĐTB môn",
      align: "center",
      width: 110,
      fixed: "right",
      render: (_, r) => {
        const avg =
          (r.mieng + r.p15 + r.tiet1 * 2 + r.giuaky * 3 + r.cuoiky * 3) / 10;
        const isFailed = avg < 5;
        return (
          <Tag
            color={isFailed ? "error" : "success"}
            bordered={false}
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              padding: "2px 10px",
              borderRadius: 6,
            }}
          >
            {avg.toFixed(2)}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={styles.container}>
      {/* TIÊU ĐỀ TRANG TẬP TRUNG */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={3}
          style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
        >
          Quản lý & Nhập điểm Học phần
        </Title>
        <Text type="secondary">
          Hệ thống quản lý điểm trực tuyến Portal LMS - Chế độ cập nhật bảng
          điểm tập trung theo lớp học
        </Text>
      </div>

      {/* THANH BỘ LỌC DỮ LIỆU */}
      <Card
        bordered={false}
        style={styles.tableCard}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} lg={18}>
            <Space wrap size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong style={styles.filterLabel}>
                  Lớp học học phần
                </Text>
                <Select
                  placeholder="-- Chọn lớp học --"
                  style={{ width: 220 }}
                  size="large"
                  variant="filled"
                  value={classId}
                  dropdownStyle={{ borderRadius: 8 }}
                  onChange={(v) => {
                    setClassId(v);
                    loadScores(v, subjectId, semester);
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
                  Môn học giảng dạy
                </Text>
                <Select
                  placeholder="-- Chọn môn học --"
                  style={{ width: 240 }}
                  size="large"
                  variant="filled"
                  value={subjectId}
                  dropdownStyle={{ borderRadius: 8 }}
                  onChange={(v) => {
                    setSubjectId(v);
                    loadScores(classId, v, semester);
                  }}
                >
                  {subjects.map((s) => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.subject_name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong style={styles.filterLabel}>
                  Kỳ học ghi nhận
                </Text>
                <Select
                  value={semester}
                  size="large"
                  variant="filled"
                  style={{ width: 150 }}
                  dropdownStyle={{ borderRadius: 8 }}
                  onChange={(v) => {
                    setSemester(v);
                    loadScores(classId, subjectId, v);
                  }}
                >
                  <Select.Option value="HK1">Học kỳ I</Select.Option>
                  <Select.Option value="HK2">Học kỳ II</Select.Option>
                </Select>
              </div>
            </Space>
          </Col>

          {/* NÚT HÀNH ĐỘNG GHI NHẬN */}
          <Col xs={24} lg={6} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={
                <Icon
                  icon="solar:diskette-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              size="large"
              onClick={handleSave}
              loading={saving}
              disabled={!students.length}
              style={styles.saveBtn}
            >
              Lưu bảng điểm đợt này
            </Button>
          </Col>
        </Row>
      </Card>

      {/* BẢNG DỮ LIỆU ĐIỂM SỐ TẬP TRUNG */}
      <Card bordered={false} style={styles.tableCard}>
        <Table
          rowKey="student_id"
          loading={loading}
          dataSource={students}
          columns={columns}
          bordered
          pagination={false}
          scroll={{ x: 1000 }}
          locale={{
            emptyText:
              "Vui lòng chỉ định đầy đủ cấu trúc Lớp học và Môn học để khởi chạy danh sách nhập điểm học phần",
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
    marginBottom: "20px",
  },
  filterLabel: {
    display: "block",
    marginBottom: 6,
    color: "#475569",
    fontSize: "13px",
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

export default ScorePage;
