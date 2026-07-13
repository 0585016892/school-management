import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic,
  List,
  Select,
  Tag,
  Typography,
  Divider,
} from "antd";
import { Icon } from "@iconify/react";
import { subjectApi } from "../../api/subjectApi";

const { Title, Text } = Typography;
const { Option } = Select;

// ================= GENERATE CODE TỰ ĐỘNG =================
const generateSubjectCode = (subjects = []) => {
  const prefix = "MON";
  if (!subjects || !subjects.length) return `${prefix}01`;
  const maxNumber = subjects
    .map((s) => s.subject_code)
    .filter(Boolean)
    .map((code) => parseInt(code.replace(prefix, "")) || 0)
    .reduce((max, num) => Math.max(max, num), 0);
  return `${prefix}${String(maxNumber + 1).padStart(2, "0")}`;
};

const SubjectPage = () => {
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  // States quản lý dữ liệu từ API Phân trang
  const [subjects, setSubjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Bộ lọc & Phân trang đồng bộ Backend
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  // Điều khiển hiển thị Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // States lưu bản ghi tạm thời
  const [editingId, setEditingId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  // Dữ liệu danh mục cấu trúc cho Form
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [autoCode, setAutoCode] = useState("");

  // Hàm chuẩn hóa bóc tách dữ liệu từ Axios
  const handleResponse = (res) =>
    res && res.data && res.data.success !== undefined
      ? res.data
      : { success: true, data: res.data || res };

  // ================= ĐỒNG BỘ DỮ LIỆU TỪ API =================
  const fetchSubjects = useCallback(
    async (page = 1, pageSize = 10, searchKey = "") => {
      setLoading(true);
      try {
        const res = await subjectApi.getAll({
          page: page,
          limit: pageSize,
          search: searchKey,
        });
        const resData = handleResponse(res);

        if (resData.success) {
          setSubjects(resData.data || []);
          setTotal(resData.total || 0);
        } else {
          message.error(resData.message || "Lỗi lấy dữ liệu môn học");
        }
      } catch (err) {
        message.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchSummary = useCallback(async () => {
    try {
      const res = await subjectApi.getDashboardSummary();
      setSummary(handleResponse(res).data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadFormData = async () => {
    try {
      const res = await subjectApi.getFormData();
      const data = handleResponse(res).data || {};
      setAvailableTeachers(data.teachers || []);
      setAvailableClasses(data.classes || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects(1, pagination.pageSize, "");
    fetchSummary();
    loadFormData();
  }, [fetchSummary, fetchSubjects]);

  useEffect(() => {
    if (!editingId && isModalOpen) {
      setAutoCode(generateSubjectCode(subjects));
    }
  }, [subjects, editingId, isModalOpen]);

  // ================= XỬ LÝ SỰ KIỆN PHÂN TRANG & TÌM KIẾM =================
  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
    fetchSubjects(newPagination.current, newPagination.pageSize, search);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchSubjects(1, pagination.pageSize, value);
  };

  const handleResetFilters = () => {
    setSearch("");
    setPagination({ current: 1, pageSize: 10 });
    fetchSubjects(1, 10, "");
  };

  // ================= XEM CHI TIẾT PHÂN CÔNG =================
  const handleOpenDetailModal = async (record) => {
    setSelectedSubject(record);
    setIsDetailModalOpen(true);
    try {
      const [resTeachers, resStudents] = await Promise.all([
        subjectApi.getTeachers(record.id),
        subjectApi.getStudents(record.id),
      ]);
      setTeachers(handleResponse(resTeachers).data || []);
      setStudents(handleResponse(resStudents).data || []);
    } catch (err) {
      message.error("Lỗi tải thông tin phân công của môn học");
    }
  };

  // ================= HÀM XỬ LÝ LỆNH GHI (SUBMIT CRUD) =================
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editingId) {
        res = await subjectApi.update(editingId, values);
      } else {
        res = await subjectApi.create({ ...values, subject_code: autoCode });
      }

      const resData = handleResponse(res);
      if (resData.success) {
        message.success(resData.message || "Lưu thông tin môn học thành công");
        setIsModalOpen(false);
        fetchSubjects(pagination.current, pagination.pageSize, search);
        fetchSummary();
      } else {
        message.error(resData.message || "Lưu thất bại");
      }
    } catch (err) {}
  };

  const handleAssignSubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      const res = await subjectApi.assignTeacher({
        subject_id: selectedSubject.id,
        teacher_id: values.teacher_id,
        class_id: values.class_id,
      });

      const resData = handleResponse(res);
      if (resData.success) {
        message.success(
          resData.message || "Phân công giáo viên đứng lớp thành công",
        );
        setIsAssignModalOpen(false);
        fetchSummary();
      } else {
        message.error(resData.message || "Phân công thất bại");
      }
    } catch (err) {
      message.error(
        "Trùng lịch học hoặc lớp đã có giáo viên phụ trách môn này!",
      );
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await subjectApi.remove(id);
      const resData = handleResponse(res);
      if (resData.success) {
        message.success(resData.message || "Xóa môn học thành công");
        fetchSubjects(pagination.current, pagination.pageSize, search);
        fetchSummary();
      } else {
        message.error(resData.message || "Không thể xóa môn học");
      }
    } catch (err) {
      message.error("Xóa thất bại do vướng dữ liệu phân lớp!");
    }
  };

  // ================= CẤU HÌNH CỘT BẢNG DỮ LIỆU =================
  const columns = [
    {
      title: "Mã môn",
      dataIndex: "subject_code",
      width: 120,
      fixed: "left",
      render: (code) => (
        <Tag color="cyan" style={styles.codeTag}>
          {code}
        </Tag>
      ),
    },
    {
      title: "Tên môn học",
      dataIndex: "subject_name",
      width: 240,
      render: (text) => (
        <Text strong style={{ color: "#1e293b", fontSize: "14px" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Ghi chú chương trình học / Bộ sách",
      dataIndex: "description",
      render: (text) =>
        text || (
          <Text type="secondary" italic style={{ fontSize: "13px" }}>
            Chưa có ghi chú sách giảng dạy
          </Text>
        ),
    },
    {
      title: "Thao tác",
      width: 240,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()} size="small">
          <Button
            type="text"
            size="small"
            icon={
              <Icon
                icon="solar:user-plus-rounded-linear"
                style={{ fontSize: "16px", verticalAlign: "middle" }}
              />
            }
            onClick={() => {
              setSelectedSubject(record);
              assignForm.resetFields();
              setIsAssignModalOpen(true);
            }}
            style={{ color: "#37B0C3", fontWeight: 500 }}
          >
            Phân công
          </Button>
          <Button
            type="text"
            size="small"
            icon={
              <Icon
                icon="solar:pen-linear"
                style={{
                  color: "#eab308",
                  fontSize: "16px",
                  verticalAlign: "middle",
                }}
              />
            }
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
            style={{ color: "#eab308", fontWeight: 500 }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa môn học này?"
            description="Lưu ý: Bạn không thể hoàn tác hành động này."
            onConfirm={(e) => handleDelete(record.id, e)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            centered
          >
            <Button
              type="text"
              danger
              size="small"
              icon={
                <Icon
                  icon="solar:trash-bin-trash-linear"
                  style={{ fontSize: "16px", verticalAlign: "middle" }}
                />
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* KHỐI 1: SỐ LIỆU THỐNG KÊ DASHBOARD TRƯỜNG */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Tổng số môn học</Text>}
              value={summary?.totalSubjects || total}
              prefix={
                <div style={{ ...styles.iconBox, background: "#eefafc" }}>
                  <Icon
                    icon="solar:notebook-linear"
                    style={{ color: "#37B0C3" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Tổng số Giáo viên</Text>}
              value={summary?.totalTeachers || 0}
              prefix={
                <div style={{ ...styles.iconBox, background: "#f0fdf4" }}>
                  <Icon
                    icon="solar:shield-user-linear"
                    style={{ color: "#22c55e" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Tổng số Học sinh</Text>}
              value={summary?.totalStudents || 0}
              prefix={
                <div style={{ ...styles.iconBox, background: "#fef2f2" }}>
                  <Icon
                    icon="solar:users-group-two-rounded-linear"
                    style={{ color: "#ef4444" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
      </Row>

      {/* KHỐI 2: KHU VỰC BẢNG CHÍNH */}
      <Card bordered={false} style={styles.tableCard}>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <Title
              level={3}
              style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
            >
              Phân Phối Môn Học & Giảng Dạy
            </Title>
            <Text type="secondary">
              Bấm vào bất kỳ dòng nào trên danh sách để xem chi tiết lớp học và
              học sinh phụ trách.
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={
                <Icon
                  icon="solar:add-circle-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              size="large"
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
              style={styles.addBtn}
            >
              Thêm môn học mới
            </Button>
          </Col>
        </Row>

        {/* Ô TÌM KIẾM ĐỒNG BỘ PHÂN TRANG */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên môn hoặc mã môn..."
              prefix={
                <Icon
                  icon="solar:magnifer-linear"
                  style={{ color: "#94a3b8", fontSize: "18px" }}
                />
              }
              size="large"
              value={search}
              onChange={handleSearchChange}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col>
            <Button
              size="large"
              icon={
                <Icon
                  icon="solar:restart-linear"
                  style={{ verticalAlign: "middle" }}
                />
              }
              onClick={handleResetFilters}
              style={{ borderRadius: 8 }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={subjects}
          columns={columns}
          onChange={handleTableChange}
          onRow={(record) => ({
            onClick: () => handleOpenDetailModal(record),
            style: { cursor: "pointer" },
          })}
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            showTotal: (totalCount) =>
              `Hiển thị dữ liệu: tìm thấy tổng cộng ${totalCount} môn học`,
          }}
        />
      </Card>

      {/* ================= MODAL 1: THÊM / SỬA MÔN HỌC ================= */}
      <Modal
        title={
          <Space size={8}>
            <div style={styles.iconHeadingBox}>
              <Icon
                icon={
                  editingId
                    ? "solar:pen-bold-duotone"
                    : "solar:add-circle-bold-duotone"
                }
                style={{ color: "#37B0C3", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontSize: 18, color: "#0f172a" }}
            >
              {editingId ? "Cập Nhật Thông Tin Môn Học" : "Tạo Môn Học Mới"}
            </Title>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Lưu dữ liệu"
        cancelText="Hủy"
        centered
        destroyOnClose
        okButtonProps={{
          style: { backgroundColor: "#37B0C3", borderColor: "#37B0C3" },
        }}
      >
        <Divider style={{ marginTop: 10, marginBottom: 20 }} />
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            label={
              <Text strong style={styles.fieldLabel}>
                Mã học phần môn học (Tự động cấp)
              </Text>
            }
          >
            <Input
              value={editingId ? "Hệ thống giữ cố định mã" : autoCode}
              prefix={
                <Icon icon="solar:key-linear" style={{ fontSize: "18px" }} />
              }
              disabled
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Text strong style={styles.fieldLabel}>
                Tên môn học
              </Text>
            }
            name="subject_name"
            rules={[{ required: true, message: "Vui lòng nhập tên môn học!" }]}
          >
            <Input
              placeholder="Ví dụ: Mỹ thuật lớp 3, Tự nhiên và Xã hội lớp 1..."
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            label={
              <Text strong style={styles.fieldLabel}>
                Ghi chú chương trình học / Bộ sách giáo khoa
              </Text>
            }
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Bộ sách Kết nối tri thức với cuộc sống, Cánh Diều..."
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= MODAL 2: PHÂN CÔNG GIÁO VIÊN THEO LỚP TIỂU HỌC ================= */}
      <Modal
        title={
          <Space size={8}>
            <div
              style={{ ...styles.iconHeadingBox, backgroundColor: "#fff7ed" }}
            >
              <Icon
                icon="solar:user-plus-rounded-bold-duotone"
                style={{ color: "#f59e0b", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontSize: 18, color: "#0f172a" }}
            >
              Thiết lập phân công Giảng dạy
            </Title>
          </Space>
        }
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={handleAssignSubmit}
        okText="Xác nhận phân công"
        cancelText="Đóng"
        centered
        okButtonProps={{
          style: { backgroundColor: "#37B0C3", borderColor: "#37B0C3" },
        }}
      >
        <Divider style={{ marginTop: 10, marginBottom: 20 }} />
        <div
          style={{
            marginBottom: 20,
            padding: "12px",
            background: "#eefafc",
            borderRadius: 8,
            borderLeft: "4px solid #37B0C3",
          }}
        >
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Môn học phân phối chương trình:
          </Text>
          <div
            style={{
              fontWeight: 700,
              color: "#37B0C3",
              fontSize: "15px",
              marginTop: "2px",
            }}
          >
            {selectedSubject?.subject_name}
          </div>
        </div>
        <Form form={assignForm} layout="vertical" size="large">
          <Form.Item
            label={
              <Text strong style={styles.fieldLabel}>
                Chọn Lớp Học Tiếp Nhận
              </Text>
            }
            name="class_id"
            rules={[
              {
                required: true,
                message: "Bắt buộc chỉ định lớp học tiếp quản môn học!",
              },
            ]}
          >
            <Select
              placeholder="Chọn lớp học (Ví dụ: Lớp 1A, Lớp 5B)"
              variant="filled"
              dropdownStyle={{ borderRadius: 8 }}
            >
              {availableClasses.map((c) => (
                <Option key={c.id} value={c.id}>
                  Lớp {c.class_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <Text strong style={styles.fieldLabel}>
                Giáo Viên Phụ Trách Giảng Dạy
              </Text>
            }
            name="teacher_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn giáo viên giảng dạy đứng lớp!",
              },
            ]}
          >
            <Select
              placeholder="Chọn Thầy/Cô phụ trách"
              variant="filled"
              dropdownStyle={{ borderRadius: 8 }}
            >
              {availableTeachers.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.full_name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= MODAL 3: XEM CHI TIẾT BẢNG PHÂN CÔNG ================= */}
      <Modal
        title={
          <Space size={8}>
            <div style={styles.iconHeadingBox}>
              <Icon
                icon="solar:bill-list-bold-duotone"
                style={{ color: "#37B0C3", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontSize: 17, color: "#0f172a" }}
            >
              Thông tin giảng dạy môn: {selectedSubject?.subject_name}
            </Title>
          </Space>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setIsDetailModalOpen(false)}
            style={{
              backgroundColor: "#37B0C3",
              borderColor: "#37B0C3",
              borderRadius: 8,
            }}
          >
            Đóng bảng
          </Button>,
        ]}
        width={720}
        centered
      >
        <Divider style={{ marginTop: 10, marginBottom: 20 }} />
        <Row gutter={[20, 20]}>
          <Col xs={24} md={11}>
            <Card
              title={
                <Space
                  size={6}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#37B0C3",
                  }}
                >
                  <Icon icon="solar:shield-user-linear" />
                  <span>Giáo viên phụ trách theo lớp</span>
                </Space>
              }
              type="inner"
              styles={{ body: { padding: 12 } }}
              style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            >
              <List
                size="small"
                dataSource={teachers}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "8px 4px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <Text strong style={{ color: "#334155" }}>
                      Lớp {item.class_name}
                    </Text>
                    <Tag
                      color="cyan"
                      style={{
                        marginLeft: "auto",
                        backgroundColor: "#eefafc",
                        color: "#37B0C3",
                        border: "none",
                        fontWeight: 600,
                      }}
                    >
                      GV. {item.full_name}
                    </Tag>
                  </List.Item>
                )}
                locale={{
                  emptyText: "Môn học này chưa được phân phối cho lớp nào.",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} md={13}>
            <Card
              title={
                <Space
                  size={6}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#22c55e",
                  }}
                >
                  <Icon icon="solar:users-group-two-rounded-linear" />
                  <span>Học sinh tham gia môn học</span>
                </Space>
              }
              type="inner"
              styles={{ body: { padding: 12 } }}
              style={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            >
              <List
                size="small"
                dataSource={students}
                pagination={{ pageSize: 6, size: "small" }}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: "8px 4px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <Space>
                      <Tag
                        color="default"
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          border: "none",
                          fontWeight: 500,
                        }}
                      >
                        Lớp {item.class_name}
                      </Tag>
                      <Text style={{ fontWeight: 600, color: "#334155" }}>
                        {item.full_name}
                      </Text>
                    </Space>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "12px",
                        marginLeft: "auto",
                        fontFamily: "monospace",
                      }}
                    >
                      {item.student_code}
                    </Text>
                  </List.Item>
                )}
                locale={{
                  emptyText: "Chưa có danh sách học sinh tham gia môn học này.",
                }}
              />
            </Card>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

// HỆ THỐNG GIAO DIỆN PHẲNG ĐỒNG BỘ LAYOUT QUẢN TRỊ
const styles = {
  container: {
    padding: "4px",
  },
  statCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    height: "100%",
  },
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
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
  addBtn: {
    borderRadius: 8,
    fontWeight: 600,
    backgroundColor: "#37B0C3",
    borderColor: "#37B0C3",
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
  },
  iconHeadingBox: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#eefafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: "13px",
    color: "#475569",
  },
  codeTag: {
    fontWeight: 700,
    fontFamily: "monospace",
    fontSize: "12px",
    backgroundColor: "#eefafc",
    color: "#37B0C3",
    border: "none",
    padding: "3px 8px",
    borderRadius: "4px",
  },
};

export default SubjectPage;
