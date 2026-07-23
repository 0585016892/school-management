import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Popconfirm,
  message,
  Typography,
  Tooltip,
  ConfigProvider,
  DatePicker,
  Empty,
} from "antd";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import disciplineApi from "../../../api/disciplineApi"; // Cập nhật đường dẫn phù hợp với dự án của bạn

const { Title, Text } = Typography;
const { Search } = Input;

const PRIMARY_COLOR = "#37b0c3";

export default function DisciplinePage() {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const [targets, setTargets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const typeMap = {
    student: {
      label: "Học sinh",
      color: "blue",
      icon: "solar:user-speak-bold-duotone",
    },
    teacher: {
      label: "Giáo viên",
      color: "purple",
      icon: "solar:user-id-bold-duotone",
    },
    staff: {
      label: "Nhân viên",
      color: "orange",
      icon: "solar:case-round-bold-duotone",
    },
  };

  const fetchDisciplines = async () => {
    setLoading(true);
    try {
      const res = await disciplineApi.getAll({
        search: searchTerm,
        target_type: selectedType,
      });
      setDisciplines(res.data);
    } catch (err) {
      message.error("Không thể tải danh sách kỷ luật!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      const res = await disciplineApi.getAvailableTargets();
      setTargets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDisciplines();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType]);

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleOpenModal = (record = null) => {
    setEditingDiscipline(record);
    if (record) {
      let targetValue = null;
      if (record.student_id) targetValue = `${record.student_id}|student`;
      else if (record.teacher_id) targetValue = `${record.teacher_id}|teacher`;
      else if (record.staff_id) targetValue = `${record.staff_id}|staff`;

      form.setFieldsValue({
        target: targetValue,
        violation: record.violation,
        disciplinary_action: record.disciplinary_action || "Khiển trách",
        school_year: record.school_year || "2025-2026",
        discipline_date: record.discipline_date
          ? dayjs(record.discipline_date)
          : null,
        description: record.description,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        disciplinary_action: "Khiển trách",
        school_year: "2025-2026",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveDiscipline = async (values) => {
    setSubmitting(true);

    let student_id = null;
    let teacher_id = null;
    let staff_id = null;

    if (values.target) {
      const [id, type] = values.target.split("|");
      if (type === "student") student_id = Number(id);
      if (type === "teacher") teacher_id = Number(id);
      if (type === "staff") staff_id = Number(id);
    }

    const payload = {
      student_id,
      teacher_id,
      staff_id,
      violation: values.violation,
      disciplinary_action: values.disciplinary_action,
      school_year: values.school_year,
      discipline_date: values.discipline_date
        ? values.discipline_date.format("YYYY-MM-DD")
        : null,
      description: values.description,
    };

    try {
      if (editingDiscipline) {
        await disciplineApi.update(editingDiscipline.id, payload);
        message.success("Cập nhật kỷ luật thành công!");
      } else {
        await disciplineApi.create(payload);
        message.success("Tạo mới quyết định kỷ luật thành công!");
      }
      setIsModalOpen(false);
      fetchDisciplines();
    } catch (err) {
      message.error("Đã xảy ra lỗi!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDiscipline = async (id) => {
    try {
      await disciplineApi.delete(id);
      message.success("Đã xóa bản ghi kỷ luật!");
      fetchDisciplines();
    } catch (err) {
      message.error("Lỗi khi xóa kỷ luật!");
    }
  };

  const columns = [
    {
      title: "Hành vi vi phạm",
      dataIndex: "violation",
      key: "violation",
      render: (text, record) => (
        <div>
          <Text strong style={{ color: "#0f172a" }}>
            {text}
          </Text>
          {record.description && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Mô tả: {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Cá nhân vi phạm",
      dataIndex: "target_name",
      key: "target_name",
      render: (text, record) => {
        const config = typeMap[record.target_type] || {
          label: "Khác",
          color: "default",
          icon: "solar:star-bold-duotone",
        };
        return (
          <Space direction="vertical" size={2}>
            <Text strong style={{ color: "#334155" }}>
              {text || "N/A"}
            </Text>
            <Tag
              color={config.color}
              style={{ borderRadius: 12, padding: "0 8px" }}
            >
              <Icon
                icon={config.icon}
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />
              {config.label}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Hình thức xử lý",
      dataIndex: "disciplinary_action",
      key: "disciplinary_action",
      render: (action) => (
        <Tag color="red" style={{ fontWeight: 600 }}>
          {action || "Khiển trách"}
        </Tag>
      ),
    },
    {
      title: "Năm học",
      dataIndex: "school_year",
      key: "school_year",
      align: "center",
      render: (year) => <Text bold>{year}</Text>,
    },
    {
      title: "Ngày xử lý",
      dataIndex: "discipline_date",
      key: "discipline_date",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={
                <Icon
                  icon="solar:pen-bold-duotone"
                  width={18}
                  style={{ color: "#64748b" }}
                />
              }
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa bản ghi kỷ luật này?"
              onConfirm={() => handleDeleteDiscipline(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={
                  <Icon icon="solar:trash-bin-trash-bold-duotone" width={18} />
                }
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: PRIMARY_COLOR, borderRadius: 8 } }}
    >
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0, color: "#1e293b" }}>
              Quản lý Kỷ luật
            </Title>
            <Text type="secondary">
              Quản lý danh sách xử lý vi phạm kỷ luật của học sinh, giáo viên và
              nhân viên.
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<Icon icon="solar:hammer-bold-duotone" width={20} />}
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
            >
              Thêm quyết định kỷ luật
            </Button>
          </Col>
        </Row>

        <Card
          bordered={false}
          styles={{ body: { padding: "16px" } }}
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Search
                placeholder="Tìm kiếm hành vi, tên cá nhân, hình thức kỷ luật..."
                allowClear
                size="large"
                prefix={
                  <Icon
                    icon="solar:magnifer-linear"
                    style={{ color: "#94a3b8" }}
                  />
                }
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                size="large"
                defaultValue="all"
                style={{ width: "100%" }}
                onChange={(val) => setSelectedType(val)}
                options={[
                  { value: "all", label: "Tất cả đối tượng" },
                  { value: "student", label: "Học sinh" },
                  { value: "teacher", label: "Giáo viên" },
                  { value: "staff", label: "Nhân viên" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Table
            columns={columns}
            dataSource={disciplines}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            locale={{
              emptyText: <Empty description="Chưa có dữ liệu kỷ luật" />,
            }}
          />
        </Card>

        <Modal
          title={
            editingDiscipline
              ? "Cập nhật Kỷ luật"
              : "Thêm mới Quyết định Kỷ luật"
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveDiscipline}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="violation"
              label="Hành vi vi phạm"
              rules={[
                { required: true, message: "Vui lòng nhập hành vi vi phạm!" },
              ]}
            >
              <Input
                placeholder="Ví dụ: Đi muộn nhiều lần, Vi phạm quy chế thi..."
                size="large"
              />
            </Form.Item>

            <Form.Item name="target" label="Cá nhân vi phạm">
              <Select
                showSearch
                placeholder="-- Chọn cá nhân --"
                size="large"
                allowClear
                optionFilterProp="children"
              >
                {targets.map((item) => (
                  <Select.Option
                    key={`${item.id}-${item.target_type}`}
                    value={`${item.id}|${item.target_type}`}
                  >
                    {item.full_name} (
                    {item.target_type === "student"
                      ? "Học sinh"
                      : item.target_type === "teacher"
                        ? "Giáo viên"
                        : "Nhân viên"}
                    )
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="disciplinary_action" label="Hình thức xử lý">
                  <Select size="large">
                    <Select.Option value="Khiển trách">
                      Khiển trách
                    </Select.Option>
                    <Select.Option value="Cảnh cáo">Cảnh cáo</Select.Option>
                    <Select.Option value="Tạm đình chỉ">
                      Tạm đình chỉ
                    </Select.Option>
                    <Select.Option value="Buộc nghỉ học có thời hạn">
                      Buộc nghỉ học có thời hạn
                    </Select.Option>
                    <Select.Option value="Khác">Hình thức khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="school_year" label="Năm học">
                  <Input placeholder="2025-2026..." size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="discipline_date" label="Ngày vi phạm / Ngày xử lý">
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả chi tiết">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả chi tiết sự việc vi phạm..."
              />
            </Form.Item>

            <Row justify="end" style={{ marginTop: 24 }}>
              <Space>
                <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                  }}
                >
                  {editingDiscipline ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Row>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
