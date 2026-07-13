import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Input,
  Typography,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tag,
  Tooltip,
} from "antd";
import { Icon } from "@iconify/react";
import scheduleApi from "../../api/scheduleApi";
import classApi from "../../api/classApi";
import teacherApi from "../../api/teacherApi";
import { subjectApi } from "../../api/subjectApi";

const { Title, Text } = Typography;
const { Option } = Select;

// Cấu hình danh sách tiết học đồng bộ với logic ma trận (Sáng 1-4, Chiều 5-7)
const periodsConfig = [
  {
    label: "Buổi Sáng",
    options: [
      { label: "Tiết 1", value: 1 },
      { label: "Tiết 2", value: 2 },
      { label: "Tiết 3", value: 3 },
      { label: "Tiết 4", value: 4 },
    ],
  },
  {
    label: "Buổi Chiều",
    options: [
      { label: "Tiết 1 (Chiều)", value: 5 },
      { label: "Tiết 2 (Chiều)", value: 6 },
      { label: "Tiết 3 (Chiều)", value: 7 },
    ],
  },
];

// Phân rã cấu trúc tiết học để sinh ma trận dòng cố định
const TABLE_ROWS_CONFIG = [
  { session: "Sáng", period: 1, label: "Tiết 1" },
  { session: "Sáng", period: 2, label: "Tiết 2" },
  { session: "Sáng", period: 3, label: "Tiết 3" },
  { session: "Sáng", period: 4, label: "Tiết 4" },
  { session: "Chiều", period: 5, label: "Tiết 1 (Chiều)" },
  { session: "Chiều", period: 6, label: "Tiết 2 (Chiều)" },
  { session: "Chiều", period: 7, label: "Tiết 3 (Chiều)" },
];

const DAYS_IN_WEEK = [
  { key: "Monday", label: "Thứ Hai" },
  { key: "Tuesday", label: "Thứ Ba" },
  { key: "Wednesday", label: "Thứ Tư" },
  { key: "Thursday", label: "Thứ Năm" },
  { key: "Friday", label: "Thứ Sáu" },
  { key: "Saturday", label: "Thứ Bảy" },
];

const initialFormState = {
  class_id: undefined,
  subject_id: undefined,
  teacher_id: undefined,
  day_of_week: "Monday",
  lesson_period: null,
  room: "",
};

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Bộ lọc tìm kiếm & Lọc nâng cao
  const [filterClass, setFilterClass] = useState(undefined);
  const [filterTeacher, setFilterTeacher] = useState(undefined);
  const [filterDay, setFilterDay] = useState(undefined);

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [form] = Form.useForm();

  const daysOfWeek = [
    { value: "Monday", label: "Thứ 2" },
    { value: "Tuesday", label: "Thứ 3" },
    { value: "Wednesday", label: "Thứ 4" },
    { value: "Thursday", label: "Thứ 5" },
    { value: "Friday", label: "Thứ 6" },
    { value: "Saturday", label: "Thứ 7" },
  ];

  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        const [resClasses, resSubjects, resTeachers] = await Promise.all([
          classApi.getAll(),
          subjectApi.getAll(),
          teacherApi.getAll(),
        ]);
        setClasses(resClasses?.data || resClasses || []);
        setSubjects(resSubjects?.data || resSubjects || []);
        setTeachers(resTeachers?.data || resTeachers || []);

        // Mặc định tự động chọn lớp đầu tiên để render Thời khóa biểu lưới
        const classList = resClasses?.data || resClasses || [];
        if (classList.length > 0) {
          setFilterClass(classList[0].id);
        }
      } catch (err) {
        message.error("Không thể tải danh mục lớp, môn, giáo viên");
      }
    };
    fetchDictionaries();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await scheduleApi.getAll();
      const rawData = response?.data || response || [];
      setSchedules(rawData);
    } catch (err) {
      message.error("Có lỗi xảy ra khi tải danh sách lịch học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getClassName = (id) =>
    classes.find((c) => c.id === Number(id))?.class_name || `ID: ${id}`;
  const getSubjectName = (id) =>
    subjects.find((s) => s.id === Number(id))?.subject_name || `ID: ${id}`;
  const getTeacherName = (id) =>
    teachers.find((t) => t.id === Number(id))?.full_name || `ID: ${id}`;

  const handleClassChange = (classId) => {
    const selectedClass = classes.find((c) => c.id === classId);
    if (selectedClass && selectedClass.homeroom_teacher_id) {
      form.setFieldsValue({ teacher_id: selectedClass.homeroom_teacher_id });
    } else {
      form.setFieldsValue({ teacher_id: undefined });
    }
  };

  const handleOpenCreate = () => {
    setSelectedId(null);
    form.setFieldsValue({
      ...initialFormState,
      class_id: filterClass, // Kế thừa luôn lớp đang lọc ngoài màn hình để thêm cho nhanh
    });
    setOpenModal(true);
  };

  const handleOpenEdit = async (id) => {
    setSelectedId(id);
    try {
      const response = await scheduleApi.getById(id);
      const data = response.data || response;
      form.setFieldsValue({
        class_id: data.class_id,
        subject_id: data.subject_id,
        teacher_id: data.teacher_id,
        day_of_week: data.day_of_week || "Monday",
        lesson_period: data.lesson_period || null,
        room: data.room || "",
      });
      setOpenModal(true);
    } catch (err) {
      message.error("Không thể tải thông tin chi tiết.");
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Kiểm tra trùng lịch thô sơ ở client để cảnh báo người dùng trước
      const isDuplicate = schedules.some(
        (s) =>
          s.id !== selectedId &&
          s.class_id === values.class_id &&
          s.day_of_week === values.day_of_week &&
          parseInt(s.lesson_period) === parseInt(values.lesson_period),
      );

      if (isDuplicate) {
        message.error("Lớp học này đã có môn học khác xếp vào tiết này rồi!");
        return;
      }

      setConfirmLoading(true);
      if (selectedId) {
        await scheduleApi.update(selectedId, values);
        message.success("Cập nhật thành công!");
      } else {
        await scheduleApi.create(values);
        message.success("Thêm mới thành công!");
      }
      handleCloseModal();
      fetchSchedules();
    } catch (err) {
      if (!err.errorFields) message.error("Thao tác thất bại.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await scheduleApi.remove(id);
      message.success("Xóa thành công!");
      fetchSchedules();
    } catch (err) {
      message.error("Xóa thất bại.");
    }
  };

  const handleResetFilters = () => {
    if (classes.length > 0) setFilterClass(classes[0].id);
    setFilterTeacher(undefined);
    setFilterDay(undefined);
  };

  // ================= XÂY DỰNG LƯỚI MA TRẬN LỊCH HỌC THEO BẢNG SÁNG / CHIỀU =================
  const generateMatrixData = () => {
    return TABLE_ROWS_CONFIG.map((p) => {
      const row = {
        key: `${p.session}-${p.period}`,
        session: p.session,
        periodLabel: p.label,
        periodValue: p.period,
      };

      DAYS_IN_WEEK.forEach((day) => {
        // Lọc tìm kiếm phần tử khớp Lớp + Thứ + Tiết học trên ma trận
        const cellItems = schedules.filter((item) => {
          const matchClass = filterClass
            ? Number(item.class_id) === Number(filterClass)
            : true;
          const matchTeacher = filterTeacher
            ? Number(item.teacher_id) === Number(filterTeacher)
            : true;
          const matchDay = filterDay
            ? item.day_of_week === filterDay
            : item.day_of_week?.toLowerCase() === day.key.toLowerCase();
          const matchPeriod = parseInt(item.lesson_period) === p.period;

          return matchClass && matchTeacher && matchDay && matchPeriod;
        });

        row[day.key] = cellItems.length > 0 ? cellItems : null;
      });
      return row;
    });
  };

  // Render ô lịch học linh hoạt
  const renderScheduleCell = (cellData) => {
    if (!cellData)
      return (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          -
        </Text>
      );

    return (
      <Space
        direction="vertical"
        size={6}
        style={{ width: "100%", display: "flex" }}
      >
        {cellData.map((item) => (
          <div key={item.id} style={styles.cellBox}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <Text strong style={{ color: "#0f172a", fontSize: "13px" }}>
                {getSubjectName(item.subject_id)}
              </Text>
              <Space size={2} style={{ marginTop: "-2px" }}>
                <Tooltip title="Chỉnh sửa">
                  <Button
                    type="text"
                    size="small"
                    style={{ padding: 0, width: 20, height: 20 }}
                    icon={
                      <Icon
                        icon="solar:pen-linear"
                        style={{ color: "#eab308" }}
                      />
                    }
                    onClick={() => handleOpenEdit(item.id)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xóa tiết này?"
                  onConfirm={() => handleDelete(item.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                  centered
                >
                  <Button
                    type="text"
                    size="small"
                    style={{ padding: 0, width: 20, height: 20 }}
                    icon={
                      <Icon
                        icon="solar:trash-bin-trash-linear"
                        style={{ color: "#ef4444" }}
                      />
                    }
                  />
                </Popconfirm>
              </Space>
            </div>

            <Space direction="vertical" size={2} style={{ display: "flex" }}>
              <Text
                type="secondary"
                style={{
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <Icon icon="solar:shield-user-linear" />
                {getTeacherName(item.teacher_id)}
              </Text>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "4px",
                }}
              >
                <Tag
                  color="cyan"
                  style={{
                    margin: 0,
                    fontSize: "10px",
                    padding: "0 6px",
                    border: "none",
                    backgroundColor: "#eefafc",
                    color: "#37B0C3",
                    fontWeight: 600,
                  }}
                >
                  Phòng: {item.room || "N/A"}
                </Tag>
                {!filterClass && (
                  <Tag
                    style={{
                      margin: 0,
                      fontSize: "10px",
                      padding: "0 6px",
                      border: "none",
                    }}
                  >
                    Lớp: {getClassName(item.class_id)}
                  </Tag>
                )}
              </div>
            </Space>
          </div>
        ))}
      </Space>
    );
  };

  // Cột lưới của bảng thời khóa biểu chuyên sâu
  const columns = [
    {
      title: "Buổi",
      dataIndex: "session",
      key: "session",
      width: 70,
      align: "center",
      fixed: "left",
      onCell: (_, index) => {
        if (index === 0) return { rowSpan: 4 };
        if (index === 4) return { rowSpan: 3 };
        return { rowSpan: 0 };
      },
      render: (value) => (
        <Text
          strong
          style={{
            color: value === "Sáng" ? "#f97316" : "#a855f7",
            textTransform: "uppercase",
            fontSize: "12px",
            writingMode: "vertical-lr",
            transform: "rotate(180deg)",
          }}
        >
          {value}
        </Text>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "periodLabel",
      key: "periodLabel",
      width: 110,
      align: "center",
      fixed: "left",
      render: (text, record) => (
        <Tag
          color={record.session === "Sáng" ? "blue" : "purple"}
          style={{ fontWeight: "bold", padding: "4px 8px", border: "none" }}
        >
          {text}
        </Tag>
      ),
    },
    ...DAYS_IN_WEEK.filter((day) =>
      filterDay ? day.key === filterDay : true,
    ).map((day) => ({
      title: day.label,
      dataIndex: day.key,
      key: day.key,
      align: "center",
      width: 170,
      render: (cellData) => renderScheduleCell(cellData),
    })),
  ];

  return (
    <div style={styles.container}>
      {/* TIÊU ĐỀ TRANG CƠ SỞ */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title
            level={3}
            style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
          >
            Quản Lý Lịch Học Toàn Trường
          </Title>
          <Text type="secondary">
            Xếp lịch, điều phối thời khóa biểu lên lớp phân tách Sáng/Chiều
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
            onClick={handleOpenCreate}
            style={styles.addBtn}
          >
            Thêm Lịch Học Mới
          </Button>
        </Col>
      </Row>

      {/* BỘ LỌC TÌM KIẾM VÀ ĐIỀU PHỐI NÂNG CAO */}
      <Card
        bordered={false}
        style={{ ...styles.tableCard, marginBottom: "20px" }}
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Row gutter={[16, 16]} align="end">
          <Col xs={24} sm={12} md={6}>
            <Text strong style={styles.filterLabel}>
              Theo dõi lớp học
            </Text>
            <Select
              showSearch
              placeholder="Chọn lớp học xem lịch"
              size="large"
              style={{ width: "100%" }}
              value={filterClass}
              onChange={(val) => setFilterClass(val)}
              allowClear
              optionFilterProp="children"
            >
              {classes.map((c) => (
                <Option key={c.id} value={c.id}>
                  Lớp {c.class_name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong style={styles.filterLabel}>
              Lọc theo Giáo viên
            </Text>
            <Select
              showSearch
              placeholder="Tất cả giáo viên"
              size="large"
              style={{ width: "100%" }}
              value={filterTeacher}
              onChange={(val) => setFilterTeacher(val)}
              allowClear
              optionFilterProp="children"
            >
              {teachers.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.full_name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Text strong style={styles.filterLabel}>
              Lọc riêng Thứ
            </Text>
            <Select
              placeholder="Tất cả các thứ"
              size="large"
              style={{ width: "100%" }}
              value={filterDay}
              onChange={(val) => setFilterDay(val)}
              allowClear
            >
              {DAYS_IN_WEEK.map((d) => (
                <Option key={d.key} value={d.key}>
                  {d.label}
                </Option>
              ))}
            </Select>
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
              Làm mới bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* MA TRẬN BẢNG THỜI KHÓA BIỂU ĐỒNG BỘ MÀU CHỦ ĐẠO */}
      <Card bordered={false} style={styles.tableCard}>
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Icon
            icon="solar:calendar-date-bold-duotone"
            style={{ color: "#37B0C3", fontSize: "20px" }}
          />
          <Text strong style={{ color: "#334155" }}>
            Lưới tổng hợp:{" "}
            {filterClass
              ? `Thời khóa biểu Lớp ${getClassName(filterClass)}`
              : "Tất cả lịch học"}
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={generateMatrixData()}
          pagination={false}
          loading={loading}
          bordered
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Không có dữ liệu thời khóa biểu phù hợp" }}
          style={styles.matrixTable}
        />
      </Card>

      {/* MODAL THÊM / CẬP NHẬT LỊCH HỌC */}
      <Modal
        title={
          <Space size={8}>
            <div style={styles.iconHeadingBox}>
              <Icon
                icon={
                  selectedId
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
              {selectedId ? "Cập Nhật Lịch Học" : "Thêm Lịch Học Mới"}
            </Title>
          </Space>
        }
        open={openModal}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText={selectedId ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        confirmLoading={confirmLoading}
        width={560}
        destroyOnClose
        okButtonProps={{
          style: {
            backgroundColor: "#37B0C3",
            borderColor: "#37B0C3",
            borderRadius: 8,
          },
        }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: "20px" }}
          size="large"
        >
          <Form.Item
            name="class_id"
            label={
              <Text strong style={styles.fieldLabel}>
                Chọn Lớp Học tiếp nhận
              </Text>
            }
            rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
          >
            <Select
              showSearch
              placeholder="-- Chọn lớp học --"
              optionFilterProp="children"
              onChange={handleClassChange}
              variant="filled"
              dropdownStyle={{ borderRadius: 8 }}
              options={classes.map((c) => ({
                value: c.id,
                label: `Lớp ${c.class_name} ${c.homeroom_teacher ? `(GVCN: ${c.homeroom_teacher})` : ""}`,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="subject_id"
                label={
                  <Text strong style={styles.fieldLabel}>
                    Chọn Môn Học
                  </Text>
                }
                rules={[{ required: true, message: "Vui lòng chọn môn học!" }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn môn"
                  optionFilterProp="children"
                  variant="filled"
                  dropdownStyle={{ borderRadius: 8 }}
                  options={subjects.map((s) => ({
                    value: s.id,
                    label: `${s.subject_name} (${s.subject_code})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="teacher_id"
                label={
                  <Text strong style={styles.fieldLabel}>
                    Giáo Viên Giảng Dạy
                  </Text>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn giáo viên!" },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn giáo viên"
                  optionFilterProp="children"
                  variant="filled"
                  dropdownStyle={{ borderRadius: 8 }}
                  options={teachers.map((t) => ({
                    value: t.id,
                    label: t.full_name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="day_of_week"
                label={
                  <Text strong style={styles.fieldLabel}>
                    Thứ trong tuần
                  </Text>
                }
                rules={[{ required: true, message: "Vui lòng chọn thứ!" }]}
              >
                <Select
                  options={daysOfWeek}
                  placeholder="Chọn thứ"
                  variant="filled"
                  dropdownStyle={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lesson_period"
                label={
                  <Text strong style={styles.fieldLabel}>
                    Tiết Học (Sáng 4 / Chiều 3)
                  </Text>
                }
                rules={[{ required: true, message: "Vui lòng chọn tiết học!" }]}
              >
                <Select
                  placeholder="Chọn tiết"
                  options={periodsConfig}
                  variant="filled"
                  dropdownStyle={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="room"
            label={
              <Text strong style={styles.fieldLabel}>
                Phòng Học Chỉ Định
              </Text>
            }
          >
            <Input
              placeholder="Ví dụ: Phòng 102, Phòng Máy Tính..."
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// HỆ THỐNG CSS PHẲNG STYLE SAAS DỰ ÁN
const styles = {
  container: {
    padding: "4px",
  },
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  filterLabel: {
    display: "block",
    marginBottom: 6,
    color: "#475569",
    fontSize: "13px",
  },
  fieldLabel: {
    fontSize: "13px",
    color: "#475569",
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
  cellBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px",
    textAlign: "left",
    transition: "all 0.2s",
  },
  matrixTable: {
    marginTop: "10px",
  },
};

export default ScheduleList;
