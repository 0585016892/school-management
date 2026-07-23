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
import documentApi from "../../../api/documentApi"; // Đảm bảo đường dẫn đúng tới file api

const { Title, Text } = Typography;
const { Search } = Input;

const PRIMARY_COLOR = "#37b0c3";

export default function DocumentPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Status mapping
  const statusMap = {
    draft: {
      label: "Bản thảo",
      color: "default",
      icon: "solar:file-edit-bold-duotone",
    },
    published: {
      label: "Đã ban hành",
      color: "success",
      icon: "solar:check-circle-bold-duotone",
    },
    archived: {
      label: "Lưu trữ",
      color: "warning",
      icon: "solar:box-minimalistic-bold-duotone",
    },
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getAll({
        search: searchTerm,
        status: selectedStatus,
      });
      if (res.data && res.data.success) {
        setDocuments(res.data.data);
      } else if (Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err) {
      message.error("Không thể tải danh sách văn bản!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus]);

  const handleOpenModal = (record = null) => {
    setEditingDoc(record);
    if (record) {
      form.setFieldsValue({
        title: record.title,
        document_number: record.document_number,
        document_type: record.document_type || "Công văn",
        issued_by: record.issued_by,
        issue_date: record.issue_date ? dayjs(record.issue_date) : null,
        file_url: record.file_url,
        status: record.status || "draft",
        content: record.content,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        document_type: "Công văn",
        status: "draft",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveDocument = async (values) => {
    setSubmitting(true);

    const payload = {
      ...values,
      issue_date: values.issue_date
        ? values.issue_date.format("YYYY-MM-DD")
        : null,
    };

    try {
      if (editingDoc) {
        await documentApi.update(editingDoc.id, payload);
        message.success("Cập nhật văn bản thành công!");
      } else {
        await documentApi.create(payload);
        message.success("Tạo mới văn bản thành công!");
      }
      setIsModalOpen(false);
      fetchDocuments();
    } catch (err) {
      message.error("Đã xảy ra lỗi!");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    try {
      await documentApi.delete(id);
      message.success("Đã xóa văn bản!");
      fetchDocuments();
    } catch (err) {
      message.error("Lỗi khi xóa văn bản!");
    }
  };

  const columns = [
    {
      title: "Tiêu đề văn bản",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text strong style={{ color: "#0f172a", fontSize: "14px" }}>
            {text}
          </Text>
          {record.document_number && (
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Số/Ký hiệu: <Text code>{record.document_number}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại văn bản",
      dataIndex: "document_type",
      key: "document_type",
      render: (type) => <Tag color="cyan">{type || "Công văn"}</Tag>,
    },
    {
      title: "Cơ quan ban hành",
      dataIndex: "issued_by",
      key: "issued_by",
      render: (text) => text || "N/A",
    },
    {
      title: "Ngày ban hành",
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = statusMap[status] || statusMap.draft;
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
      title: "Tệp đính kèm",
      dataIndex: "file_url",
      key: "file_url",
      align: "center",
      render: (url) =>
        url ? (
          <Tooltip title="Mở file đính kèm">
            <Button
              type="light"
              size="small"
              icon={<Icon icon="solar:link-circle-bold-duotone" width={16} />}
              onClick={() => window.open(url, "_blank")}
              style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
            >
              Tải / Xem
            </Button>
          </Tooltip>
        ) : (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Không có
          </Text>
        ),
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
              title="Xóa văn bản này?"
              onConfirm={() => handleDeleteDocument(record.id)}
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
              Quản lý Văn bản & Tài liệu
            </Title>
            <Text type="secondary">
              Quản lý các công văn, thông tư, quyết định và hồ sơ tài liệu của
              nhà trường.
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<Icon icon="solar:document-add-bold-duotone" width={20} />}
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
            >
              Thêm văn bản mới
            </Button>
          </Col>
        </Row>

        {/* Filter Box */}
        <Card
          bordered={false}
          styles={{ body: { padding: "16px" } }}
          style={{ marginBottom: 24, borderRadius: 12 }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Search
                placeholder="Tìm kiếm tiêu đề, số hiệu văn bản, cơ quan ban hành..."
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
                  { value: "draft", label: "Bản thảo" },
                  { value: "published", label: "Đã ban hành" },
                  { value: "archived", label: "Lưu trữ" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* Table Content */}
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            locale={{
              emptyText: <Empty description="Chưa có dữ liệu văn bản" />,
            }}
          />
        </Card>

        {/* Modal Form */}
        <Modal
          title={editingDoc ? "Cập nhật Văn bản" : "Thêm mới Văn bản"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          destroyOnClose
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveDocument}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="title"
              label="Tên / Tiêu đề văn bản"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề văn bản!" },
              ]}
            >
              <Input
                placeholder="Ví dụ: Quy định thực hiện kế hoạch giảng dạy..."
                size="large"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="document_number" label="Số / Ký hiệu văn bản">
                  <Input placeholder="123/QĐ-BGDĐT..." size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="document_type" label="Loại văn bản">
                  <Select size="large">
                    <Select.Option value="Công văn">Công văn</Select.Option>
                    <Select.Option value="Quyết định">Quyết định</Select.Option>
                    <Select.Option value="Thông tư">Thông tư</Select.Option>
                    <Select.Option value="Tờ trình">Tờ trình</Select.Option>
                    <Select.Option value="Khác">Khác</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="issued_by" label="Cơ quan ban hành">
                  <Input
                    placeholder="Ban Giám Hiệu, Bộ GD&ĐT..."
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="issue_date" label="Ngày ban hành">
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select size="large">
                    <Select.Option value="draft">Bản thảo</Select.Option>
                    <Select.Option value="published">Đã ban hành</Select.Option>
                    <Select.Option value="archived">Lưu trữ</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="file_url" label="Đường dẫn file (URL)">
                  <Input
                    placeholder="https://drive.google.com/..."
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="content" label="Trích yếu / Nội dung tóm tắt">
              <Input.TextArea
                rows={3}
                placeholder="Tóm tắt nội dung chính của văn bản..."
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
                  {editingDoc ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Row>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
