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
import rewardApi from "../../../api/rewardApi"; // Cập nhật đường dẫn phù hợp dự án của bạn

const { Title, Text } = Typography;
const { Search } = Input;

const PRIMARY_COLOR = "#37b0c3";

export default function RewardPage() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const [targets, setTargets] = useState([]); // Danh sách đối tượng chọn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
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

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await rewardApi.getAll({
        search: searchTerm,
        target_type: selectedType,
      });

      setRewards(res.data);
    } catch (err) {
      message.error("Không thể tải danh sách khen thưởng!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      const res = await rewardApi.getAvailableTargets();
      console.log(res);

      setTargets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRewards();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType]);

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleOpenModal = (record = null) => {
    setEditingReward(record);
    if (record) {
      let targetValue = null;
      if (record.student_id) targetValue = `${record.student_id}|student`;
      else if (record.teacher_id) targetValue = `${record.teacher_id}|teacher`;
      else if (record.staff_id) targetValue = `${record.staff_id}|staff`;

      form.setFieldsValue({
        target: targetValue,
        title: record.title,
        reward_type: record.reward_type || "Cấp trường",
        school_year: record.school_year || "2025-2026",
        reward_date: record.reward_date ? dayjs(record.reward_date) : null,
        reason: record.reason,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        reward_type: "Cấp trường",
        school_year: "2025-2026",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveReward = async (values) => {
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
      title: values.title,
      reward_type: values.reward_type,
      school_year: values.school_year,
      reward_date: values.reward_date
        ? values.reward_date.format("YYYY-MM-DD")
        : null,
      reason: values.reason,
    };

    try {
      if (editingReward) {
        await rewardApi.update(editingReward.id, payload);
        message.success("Cập nhật thành công!");
      } else {
        await rewardApi.create(payload);
        message.success("Tạo mới thành công!");
      }
      setIsModalOpen(false);
      fetchRewards();
    } catch (err) {
      message.error("Đã xảy ra lỗi!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReward = async (id) => {
    try {
      await rewardApi.delete(id);
      message.success("Đã xóa!");
      fetchRewards();
    } catch (err) {
      message.error("Lỗi khi xóa!");
    }
  };

  const columns = [
    {
      title: "Tiêu đề / Khen thưởng",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ color: "#0f172a" }}>
            {text}
          </Text>
          {record.reason && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Lý do: {record.reason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Người nhận",
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
      title: "Loại khen thưởng",
      dataIndex: "reward_type",
      key: "reward_type",
      render: (type) => (
        <Tag color="cyan" style={{ fontWeight: 600 }}>
          {type || "Cấp trường"}
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
      title: "Ngày khen thưởng",
      dataIndex: "reward_date",
      key: "reward_date",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
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
              title="Xóa khen thưởng này?"
              onConfirm={() => handleDeleteReward(record.id)}
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
              Thi đua - Khen thưởng
            </Title>
            <Text type="secondary">
              Quản lý danh sách khen thưởng học sinh, giáo viên và nhân viên.
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<Icon icon="solar:cup-star-bold-duotone" width={20} />}
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
            >
              Thêm khen thưởng
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
                placeholder="Tìm kiếm danh hiệu, tên cá nhân..."
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
            dataSource={rewards}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }}
          />
        </Card>

        <Modal
          title={
            editingReward ? "Cập nhật Khen thưởng" : "Thêm mới Khen thưởng"
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
            onFinish={handleSaveReward}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="title"
              label="Tiêu đề / Danh hiệu"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input
                placeholder="Ví dụ: Học sinh giỏi, Giáo viên xuất sắc..."
                size="large"
              />
            </Form.Item>

            <Form.Item name="target" label="Cá nhân nhận khen thưởng">
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
                <Form.Item name="reward_type" label="Loại khen thưởng">
                  <Select size="large">
                    <Select.Option value="Cấp trường">Cấp trường</Select.Option>
                    <Select.Option value="Cấp quận/huyện">
                      Cấp quận/huyện
                    </Select.Option>
                    <Select.Option value="Cấp tỉnh/thành phố">
                      Cấp tỉnh/thành phố
                    </Select.Option>
                    <Select.Option value="Cấp quốc gia">
                      Cấp quốc gia
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="school_year" label="Năm học">
                  <Input placeholder="2025-2026..." size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="reward_date" label="Ngày khen thưởng">
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
              />
            </Form.Item>

            <Form.Item name="reason" label="Lý do / Thành tích">
              <Input.TextArea
                rows={3}
                placeholder="Mô tả lý do khen thưởng..."
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
                  {editingReward ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Row>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
