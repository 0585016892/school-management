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
  Drawer,
  Radio,
  Tabs,
} from "antd";
import { Icon } from "@iconify/react";
import dayjs from "dayjs";
import meetingApi from "../../../api/meetingApi"; // Cập nhật đường dẫn cho khớp dự án

const { Title, Text } = Typography;
const { Search } = Input;

const PRIMARY_COLOR = "#37b0c3";

export default function MeetingPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // CRUD Meeting Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Detail & Drawer Quản lý
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState(null);

  // Form biên bản
  const [minutesForm] = Form.useForm();
  const [savingMinutes, setSavingMinutes] = useState(false);

  const statusMap = {
    scheduled: {
      label: "Sắp diễn ra",
      color: "processing",
      icon: "solar:clock-circle-bold-duotone",
    },
    ongoing: {
      label: "Đang diễn ra",
      color: "warning",
      icon: "solar:play-circle-bold-duotone",
    },
    completed: {
      label: "Đã kết thúc",
      color: "success",
      icon: "solar:check-circle-bold-duotone",
    },
    cancelled: {
      label: "Đã hủy",
      color: "error",
      icon: "solar:close-circle-bold-duotone",
    },
  };

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await meetingApi.getAll({
        search: searchTerm,
        status: selectedStatus,
      });
      if (res.data && res.data.success) {
        setMeetings(res.data.data);
      } else if (Array.isArray(res.data)) {
        setMeetings(res.data);
      }
    } catch (err) {
      message.error("Không thể tải danh sách cuộc họp!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetings();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus]);

  const handleOpenModal = (record = null) => {
    setEditingMeeting(record);
    if (record) {
      form.setFieldsValue({
        title: record.title,
        location: record.location,
        meeting_date: record.meeting_date ? dayjs(record.meeting_date) : null,
        status: record.status || "scheduled",
        description: record.description,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: "scheduled" });
    }
    setIsModalOpen(true);
  };

  const handleSaveMeeting = async (values) => {
    setSubmitting(true);
    const payload = {
      ...values,
      meeting_date: values.meeting_date
        ? values.meeting_date.format("YYYY-MM-DD HH:mm:ss")
        : null,
    };

    try {
      if (editingMeeting) {
        await meetingApi.update(editingMeeting.id, payload);
        message.success("Cập nhật cuộc họp thành công!");
      } else {
        await meetingApi.create(payload);
        message.success("Tạo cuộc họp mới thành công!");
      }
      setIsModalOpen(false);
      fetchMeetings();
    } catch (err) {
      message.error("Đã xảy ra lỗi!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    try {
      await meetingApi.delete(id);
      message.success("Đã xóa cuộc họp!");
      fetchMeetings();
    } catch (err) {
      message.error("Lỗi khi xóa cuộc họp!");
    }
  };

  // Mở Drawer chi tiết (ĐIỂM DANH & BIÊN BẢN)
  const handleOpenDetail = async (record) => {
    setIsDrawerOpen(true);
    setLoadingDetail(true);
    try {
      const [detailRes, availRes] = await Promise.all([
        meetingApi.getById(record.id),
        meetingApi.getAvailableMembers(),
      ]);
      console.log(detailRes);
      console.log("availRes:::", availRes);

      if (detailRes && detailRes.success) {
        const meetingData = detailRes.data;
        setSelectedMeeting(meetingData);

        if (meetingData.minutes) {
          minutesForm.setFieldsValue({
            content: meetingData.minutes.content,
            conclusion: meetingData.minutes.conclusion,
            file_url: meetingData.minutes.file_url,
          });
        } else {
          minutesForm.resetFields();
        }
      }

      if (availRes && availRes.success) {
        setAvailableMembers(availRes.data);
      }
    } catch (err) {
      message.error("Lỗi khi tải thông tin cuộc họp!");
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Thêm thành viên vào cuộc họp
  const handleAddMember = async () => {
    if (!selectedMemberToAdd) return;
    const [member_id, member_type] = selectedMemberToAdd.split("|");

    try {
      await meetingApi.addMember(selectedMeeting.id, {
        member_id: Number(member_id),
        member_type,
      });
      message.success("Thêm thành viên thành công!");
      setSelectedMemberToAdd(null);
      handleOpenDetail(selectedMeeting);
      fetchMeetings();
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi thêm thành viên!");
    }
  };

  // Cập nhật điểm danh
  const handleAttendanceChange = async (memberRecordId, status) => {
    try {
      await meetingApi.updateAttendance(memberRecordId, {
        attendance_status: status,
      });
      message.success("Đã cập nhật điểm danh!");
      handleOpenDetail(selectedMeeting);
    } catch (err) {
      message.error("Lỗi cập nhật điểm danh!");
    }
  };

  // Gỡ thành viên
  const handleRemoveMember = async (memberRecordId) => {
    try {
      await meetingApi.removeMember(memberRecordId);
      message.success("Đã gỡ thành viên!");
      handleOpenDetail(selectedMeeting);
      fetchMeetings();
    } catch (err) {
      message.error("Lỗi khi gỡ thành viên!");
    }
  };

  // Lưu biên bản
  const handleSaveMinutes = async (values) => {
    setSavingMinutes(true);
    try {
      await meetingApi.saveMinutes(selectedMeeting.id, values);
      message.success("Lưu biên bản cuộc họp thành công!");
      handleOpenDetail(selectedMeeting);
      fetchMeetings();
    } catch (err) {
      message.error("Lỗi khi lưu biên bản!");
    } finally {
      setSavingMinutes(false);
    }
  };

  const columns = [
    {
      title: "Chủ đề cuộc họp",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: "14px", color: "#0f172a" }}>
            {text}
          </Text>
          {record.location && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              <Icon
                icon="solar:map-point-bold-duotone"
                style={{ marginRight: 4 }}
              />
              {record.location}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian họp",
      dataIndex: "meeting_date",
      key: "meeting_date",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "N/A"),
    },
    {
      title: "Số tham dự",
      dataIndex: "member_count",
      key: "member_count",
      align: "center",
      render: (count) => (
        <Tag color="cyan" style={{ borderRadius: 12, fontWeight: 600 }}>
          <Icon
            icon="solar:users-group-rounded-bold-duotone"
            style={{ marginRight: 4, verticalAlign: "middle" }}
          />
          {count || 0} thành viên
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = statusMap[status] || statusMap.scheduled;
        return (
          <Tag color={config.color} style={{ borderRadius: 12 }}>
            <Icon
              icon={config.icon}
              style={{ marginRight: 4, verticalAlign: "middle" }}
            />
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Biên bản",
      dataIndex: "has_minutes",
      key: "has_minutes",
      align: "center",
      render: (has) =>
        has ? (
          <Tag color="green">Đã có BB</Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Chưa lập
          </Text>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Điểm danh & Biên bản">
            <Button
              type="text"
              icon={
                <Icon
                  icon="solar:eye-bold-duotone"
                  width={18}
                  style={{ color: PRIMARY_COLOR }}
                />
              }
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
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
              title="Xóa cuộc họp này?"
              onConfirm={() => handleDeleteMeeting(record.id)}
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
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={3} style={{ margin: 0, color: "#1e293b" }}>
              Quản lý Cuộc họp & Biên bản
            </Title>
            <Text type="secondary">
              Lên lịch cuộc họp, theo dõi điểm danh và lưu trữ biên bản cuộc
              họp.
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<Icon icon="solar:calendar-add-bold-duotone" width={20} />}
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
            >
              Tạo cuộc họp mới
            </Button>
          </Col>
        </Row>

        {/* Filter Bar */}
        <Card
          bordered={false}
          styles={{ body: { padding: "16px" } }}
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Search
                placeholder="Tìm theo chủ đề, địa điểm họp..."
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
                onChange={(val) => setSelectedStatus(val)}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "scheduled", label: "Sắp diễn ra" },
                  { value: "ongoing", label: "Đang diễn ra" },
                  { value: "completed", label: "Đã kết thúc" },
                  { value: "cancelled", label: "Đã hủy" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Table Content */}
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Table
            columns={columns}
            dataSource={meetings}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            locale={{
              emptyText: <Empty description="Chưa có dữ liệu cuộc họp" />,
            }}
          />
        </Card>

        {/* Modal Thêm / Sửa cuộc họp */}
        <Modal
          title={editingMeeting ? "Cập nhật Cuộc họp" : "Tạo cuộc họp mới"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveMeeting}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="title"
              label="Chủ đề / Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập chủ đề!" }]}
            >
              <Input
                placeholder="Cuộc họp HĐQT / Họp Ban Chuyên Môn..."
                size="large"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="meeting_date"
                  label="Thời gian họp"
                  rules={[{ required: true, message: "Chọn ngày giờ họp!" }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: "100%" }}
                    size="large"
                    format="DD/MM/YYYY HH:mm"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select size="large">
                    <Select.Option value="scheduled">Sắp diễn ra</Select.Option>
                    <Select.Option value="ongoing">Đang diễn ra</Select.Option>
                    <Select.Option value="completed">Đã kết thúc</Select.Option>
                    <Select.Option value="cancelled">Đã hủy</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="location" label="Địa điểm họp">
              <Input
                placeholder="Phòng họp A1 / Hội trường B..."
                size="large"
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả / Nội dung dự kiến">
              <Input.TextArea
                rows={3}
                placeholder="Tóm tắt nội dung chương trình họp..."
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
                  {editingMeeting ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Row>
          </Form>
        </Modal>

        {/* Drawer Điểm danh & Biên bản */}
        <Drawer
          title={
            <div>
              <Text strong style={{ fontSize: "16px" }}>
                Chi tiết cuộc họp
              </Text>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: "13px", color: PRIMARY_COLOR }}
                >
                  {selectedMeeting?.title}
                </Text>
              </div>
            </div>
          }
          placement="right"
          width={650}
          onClose={() => setIsDrawerOpen(false)}
          open={isDrawerOpen}
          destroyOnClose
        >
          {loadingDetail ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Text>Đang tải dữ liệu...</Text>
            </div>
          ) : selectedMeeting ? (
            <Tabs
              defaultActiveKey="attendance"
              items={[
                {
                  key: "attendance",
                  label: "Thành viên & Điểm danh",
                  children: (
                    <Space
                      direction="vertical"
                      style={{ width: "100%", gap: 16 }}
                    >
                      {/* Thêm thành viên */}
                      <Card size="small" style={{ backgroundColor: "#f8fafc" }}>
                        <Text
                          strong
                          style={{
                            fontSize: "12px",
                            textTransform: "uppercase",
                            color: "#64748b",
                          }}
                        >
                          Thêm thành viên mời họp
                        </Text>
                        <Row gutter={8} style={{ marginTop: 8 }}>
                          <Col flex="auto">
                            <Select
                              showSearch
                              placeholder="-- Chọn giáo viên / nhân viên --"
                              style={{ width: "100%" }}
                              value={selectedMemberToAdd}
                              onChange={(val) => setSelectedMemberToAdd(val)}
                              allowClear
                            >
                              {availableMembers.map((m) => (
                                <Select.Option
                                  key={`${m.id}-${m.member_type}`}
                                  value={`${m.id}|${m.member_type}`}
                                >
                                  {m.full_name} (
                                  {m.member_type === "teacher"
                                    ? "Giáo viên"
                                    : "Nhân viên"}
                                  )
                                </Select.Option>
                              ))}
                            </Select>
                          </Col>
                          <Col>
                            <Button
                              type="primary"
                              disabled={!selectedMemberToAdd}
                              onClick={handleAddMember}
                              style={{
                                backgroundColor: PRIMARY_COLOR,
                                borderColor: PRIMARY_COLOR,
                              }}
                            >
                              Thêm
                            </Button>
                          </Col>
                        </Row>
                      </Card>

                      {/* Bảng điểm danh */}
                      <Table
                        dataSource={selectedMeeting.members || []}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                          {
                            title: "Họ và tên",
                            dataIndex: "full_name",
                            key: "full_name",
                            render: (text, r) => (
                              <div>
                                <Text strong>{text}</Text>
                                <div
                                  style={{ fontSize: "11px", color: "#94a3b8" }}
                                >
                                  {r.member_type === "teacher"
                                    ? "Giáo viên"
                                    : "Nhân viên"}
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: "Điểm danh",
                            dataIndex: "attendance_status",
                            key: "attendance_status",
                            render: (status, r) => (
                              <Radio.Group
                                size="small"
                                value={status}
                                onChange={(e) =>
                                  handleAttendanceChange(r.id, e.target.value)
                                }
                              >
                                <Radio.Button value="invited">
                                  Thư mời
                                </Radio.Button>
                                <Radio.Button value="present">
                                  Có mặt
                                </Radio.Button>
                                <Radio.Button value="absent">Vắng</Radio.Button>
                              </Radio.Group>
                            ),
                          },
                          {
                            title: "",
                            key: "action",
                            width: 50,
                            render: (_, r) => (
                              <Popconfirm
                                title="Gỡ thành viên này?"
                                onConfirm={() => handleRemoveMember(r.id)}
                              >
                                <Button
                                  type="text"
                                  danger
                                  icon={
                                    <Icon
                                      icon="solar:user-minus-bold-duotone"
                                      width={16}
                                    />
                                  }
                                />
                              </Popconfirm>
                            ),
                          },
                        ]}
                      />
                    </Space>
                  ),
                },
                {
                  key: "minutes",
                  label: "Biên bản cuộc họp",
                  children: (
                    <Form
                      form={minutesForm}
                      layout="vertical"
                      onFinish={handleSaveMinutes}
                    >
                      <Form.Item name="content" label="Nội dung cuộc họp">
                        <Input.TextArea
                          rows={5}
                          placeholder="Chi tiết diễn biến và thảo luận trong cuộc họp..."
                        />
                      </Form.Item>

                      <Form.Item
                        name="conclusion"
                        label="Kết luận / Nghị quyết cuộc họp"
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Các quyết định, công việc cần triển khai..."
                        />
                      </Form.Item>

                      <Form.Item
                        name="file_url"
                        label="Tệp biên bản đính kèm (URL/Drive)"
                      >
                        <Input placeholder="https://drive.google.com/file/..." />
                      </Form.Item>

                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={savingMinutes}
                        block
                        style={{
                          backgroundColor: PRIMARY_COLOR,
                          borderColor: PRIMARY_COLOR,
                        }}
                      >
                        Lưu biên bản cuộc họp
                      </Button>
                    </Form>
                  ),
                },
              ]}
            />
          ) : null}
        </Drawer>
      </div>
    </ConfigProvider>
  );
}
