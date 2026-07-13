import React, { useEffect, useState, useMemo } from "react";
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Tabs,
  List,
  Typography,
  Popconfirm,
  message,
  Tooltip,
  Empty,
  Divider,
} from "antd";
import { Icon } from "@iconify/react";
import { tuitionApi } from "../../api/tuitionApi";
import dayjs from "dayjs";

const { Content } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;

const TuitionPage = () => {
  // --- States Hệ Thống ---
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  // --- States Phân trang & Tìm kiếm & Lọc (Tab 1) ---
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // --- States Thống kê & Báo cáo (Tab 2 & 3) ---
  const [summary, setSummary] = useState({
    totalExpected: 0,
    totalPaid: 0,
    totalDebt: 0,
    totalStudents: 0,
  });
  const [debtList, setDebtList] = useState([]);
  const [topPaidList, setTopPaidList] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  // --- States Modals Quản lý ---
  const [isTuitionModalOpen, setIsTuitionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedTuition, setSelectedTuition] = useState(null);
  const [tuitionDetail, setTuitionDetail] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // --- Khởi tạo Form ---
  const [tuitionForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // --- ĐỊNH DẠNG TIỀEN TỆ VND ---
  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  // TỰ ĐỘNG BÓC TÁCH DANH SÁCH LỚP HỌC DUY NHẤT TỪ ĐẰNG FE
  const uniqueClasses = useMemo(() => {
    const classes = studentsList
      .map((student) => student.class_name)
      .filter((className) => className && className.trim() !== "");
    return [...new Set(classes)].sort();
  }, [studentsList]);

  // ==========================================
  // LOGIC CALL FULL API
  // ==========================================

  const fetchTuitionList = async () => {
    setLoading(true);
    try {
      const res = await tuitionApi.getAll({
        page,
        limit,
        search: selectedClass ? selectedClass : search,
      });
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách học phí!");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      const res = await tuitionApi.getById(id);
      if (res.success) {
        setTuitionDetail(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      message.error("Không thể tải chi tiết khoản học phí này!");
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [resSummary, resDebt, resTopPaid, resMonthly] = await Promise.all([
        tuitionApi.getDashboardSummary(),
        tuitionApi.getDebtStatistics(),
        tuitionApi.getTopPaidStatistics(),
        tuitionApi.getMonthlyStatistics(),
      ]);

      if (resSummary.success) setSummary(resSummary.data);
      if (resDebt.success) setDebtList(resDebt.data);
      if (resTopPaid.success) setTopPaidList(resTopPaid.data);
      if (resMonthly.success) setMonthlyRevenue(resMonthly.data);
    } catch (err) {
      message.error("Lỗi khi đồng bộ số liệu thống kê hệ thống!");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormStudents = async () => {
    try {
      const res = await tuitionApi.getFormStudents();
      if (res.success) setStudentsList(res.data);
    } catch (err) {
      message.error("Không thể tải danh sách học sinh!");
    }
  };

  useEffect(() => {
    fetchFormStudents();
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (activeTab === "1") {
      fetchTuitionList();
    }
  }, [page, limit, search, selectedClass, activeTab]);

  useEffect(() => {
    if (activeTab === "2" || activeTab === "3") {
      fetchAnalyticsData();
    }
  }, [activeTab]);

  const handleCreateOrUpdateTuition = async (values) => {
    try {
      const payload = {
        ...values,
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : null,
      };

      if (editingId) {
        const res = await tuitionApi.update(editingId, payload);
        if (res.success) message.success(res.message);
      } else {
        const res = await tuitionApi.create(payload);
        if (res.success) message.success(res.message);
      }

      setIsTuitionModalOpen(false);
      setEditingId(null);
      tuitionForm.resetFields();
      fetchTuitionList();
      fetchAnalyticsData();
    } catch (err) {
      message.error("Thao tác thất bại!");
    }
  };

  const handleEditClick = (record) => {
    setEditingId(record.id);
    tuitionForm.setFieldsValue({
      student_id: record.student_id,
      amount: record.amount,
      due_date: record.due_date ? dayjs(record.due_date) : null,
      note: record.note,
    });
    setIsTuitionModalOpen(true);
  };

  const handleDeleteTuition = async (id) => {
    try {
      const res = await tuitionApi.remove(id);
      if (res.success) {
        message.success(res.message);
        fetchTuitionList();
        fetchAnalyticsData();
      }
    } catch (err) {
      message.error("Không thể xóa khoản học phí này!");
    }
  };

  const handleMakePayment = async (values) => {
    try {
      const payload = {
        tuition_id: selectedTuition.id,
        amount_paid: values.amount_paid,
        payment_method: values.payment_method,
      };
      const res = await tuitionApi.executePayment(payload);
      if (res.success) {
        message.success(res.message);
        setIsPaymentModalOpen(false);
        paymentForm.resetFields();
        fetchTuitionList();
        fetchAnalyticsData();
      }
    } catch (err) {
      message.error("Giao dịch nộp tiền thất bại!");
    }
  };

  const handleOpenHistory = async (record) => {
    setSelectedTuition(record);
    try {
      const res = await tuitionApi.getPaymentHistory(record.id);
      if (res.success) {
        setHistoryList(res.data);
        setIsHistoryModalOpen(true);
      }
    } catch (err) {
      message.error("Lỗi khi truy xuất lịch sử thanh toán!");
    }
  };

  const mainColumns = [
    {
      title: "Mã HS",
      dataIndex: "student_code",
      key: "student_code",
      fixed: "left",
      width: 120,
      render: (text) => (
        <Text strong style={styles.codeText}>
          {text?.toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Họ và Tên",
      dataIndex: "student_name",
      key: "student_name",
      minWidth: 160,
    },
    {
      title: "Lớp học",
      dataIndex: "class_name",
      key: "class_name",
      width: 120,
      render: (text) => (
        <Tag
          color="cyan"
          bordered={false}
          style={{
            backgroundColor: "#eefafc",
            color: "#37B0C3",
            fontWeight: 600,
          }}
        >
          {text || "Trống"}
        </Tag>
      ),
    },
    {
      title: "Học phí",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 150,
      render: (amount) => (
        <Text strong style={{ color: "#334155" }}>
          {formatVND(amount)}
        </Text>
      ),
    },
    {
      title: "Hạn đóng",
      dataIndex: "due_date",
      key: "due_date",
      align: "center",
      width: 140,
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "Không hạn định",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 140,
      render: (status) => {
        if (status === "paid")
          return (
            <Tag
              color="success"
              bordered={false}
              style={{ borderRadius: 6, fontWeight: 500, padding: "2px 8px" }}
            >
              Đã đóng đủ
            </Tag>
          );
        if (status === "partial")
          return (
            <Tag
              color="warning"
              bordered={false}
              style={{ borderRadius: 6, fontWeight: 500, padding: "2px 8px" }}
            >
              Còn nợ
            </Tag>
          );
        return (
          <Tag
            color="error"
            bordered={false}
            style={{ borderRadius: 6, fontWeight: 500, padding: "2px 8px" }}
          >
            Chưa đóng
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Thu tiền">
            <Button
              type="text"
              shape="circle"
              disabled={record.status === "paid"}
              icon={
                <Icon
                  icon="solar:card-transfer-linear"
                  style={{
                    color: record.status === "paid" ? "#bfbfbf" : "#37B0C3",
                    fontSize: "18px",
                  }}
                />
              }
              onClick={() => {
                setSelectedTuition(record);
                setIsPaymentModalOpen(true);
              }}
              style={styles.actionBtn}
            />
          </Tooltip>
          <Tooltip title="Lịch sử">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:history-linear"
                  style={{ color: "#475569", fontSize: "18px" }}
                />
              }
              onClick={() => handleOpenHistory(record)}
              style={styles.actionBtn}
            />
          </Tooltip>
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:eye-linear"
                  style={{ color: "#37B0C3", fontSize: "18px" }}
                />
              }
              onClick={() => handleOpenDetail(record.id)}
              style={styles.actionBtn}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <Icon
                  icon="solar:pen-linear"
                  style={{ color: "#eab308", fontSize: "18px" }}
                />
              }
              onClick={() => handleEditClick(record)}
              style={styles.actionBtn}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa đợt thu học phí?"
            description="Bạn chắc chắn muốn xóa bản ghi đợt thu này?"
            onConfirm={() => handleDeleteTuition(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            centered
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                shape="circle"
                danger
                icon={
                  <Icon
                    icon="solar:trash-bin-trash-linear"
                    style={{ fontSize: "18px" }}
                  />
                }
                style={styles.actionBtn}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: "4px" }}>
      {/* TIÊU ĐỀ TRANG CHỦ */}
      <div style={{ marginBottom: "24px" }}>
        <Title
          level={3}
          style={{ margin: 0, color: "#0f172a", fontWeight: 700 }}
        >
          Quản lý Thu học phí & Công nợ
        </Title>
        <Text type="secondary">
          Quản lý danh sách biên lai, theo dõi tiến độ nộp học phí và thống kê
          doanh thu
        </Text>
      </div>

      {/* KHU VỰC THẺ DASHBOARD TỔNG QUAN */}
      <Row gutter={[20, 20]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Tổng học phí dự kiến</Text>}
              value={summary.totalExpected}
              formatter={formatVND}
              prefix={
                <div style={{ ...styles.iconBox, background: "#eefafc" }}>
                  <Icon
                    icon="solar:bill-list-linear"
                    style={{ color: "#37B0C3" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={
                <Text style={styles.statTitle}>Tổng thực thu thành công</Text>
              }
              value={summary.totalPaid}
              formatter={formatVND}
              prefix={
                <div style={{ ...styles.iconBox, background: "#f0fdf4" }}>
                  <Icon
                    icon="solar:check-circle-linear"
                    style={{ color: "#22c55e" }}
                  />
                </div>
              }
              valueStyle={{ ...styles.statValue, color: "#22c55e" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Hệ thống còn đọng nợ</Text>}
              value={summary.totalDebt}
              formatter={formatVND}
              prefix={
                <div style={{ ...styles.iconBox, background: "#fef2f2" }}>
                  <Icon
                    icon="solar:info-circle-linear"
                    style={{ color: "#ef4444" }}
                  />
                </div>
              }
              valueStyle={{ ...styles.statValue, color: "#ef4444" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={styles.statCard}>
            <Statistic
              title={<Text style={styles.statTitle}>Học sinh áp dụng</Text>}
              value={summary.totalStudents}
              prefix={
                <div style={{ ...styles.iconBox, background: "#faf5ff" }}>
                  <Icon
                    icon="solar:users-group-two-rounded-linear"
                    style={{ color: "#a855f7" }}
                  />
                </div>
              }
              valueStyle={styles.statValue}
            />
          </Card>
        </Col>
      </Row>

      {/* ĐIỀU HƯỚNG TABS CHỨC NĂNG */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        style={{ marginBottom: 20 }}
        items={[
          {
            key: "1",
            label: (
              <Space size={6} style={{ fontWeight: 600 }}>
                <Icon
                  icon="solar:wallet-money-linear"
                  style={{ fontSize: "18px" }}
                />
                <span>Sổ quản lý thu học phí</span>
              </Space>
            ),
            children: (
              <Card bordered={false} style={styles.tableCard}>
                <Row
                  gutter={[16, 16]}
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: "20px" }}
                >
                  <Col xs={24} sm={16} md={14}>
                    <Space
                      size="middle"
                      style={{ width: "100%", flexWrap: "wrap" }}
                    >
                      <div>
                        <Text strong style={styles.filterLabel}>
                          Tìm kiếm học sinh
                        </Text>
                        <Input
                          placeholder="Tên hoặc mã học sinh..."
                          prefix={
                            <Icon
                              icon="solar:magnifer-linear"
                              style={{ color: "#bfbfbf", fontSize: "16px" }}
                            />
                          }
                          allowClear
                          value={search}
                          disabled={!!selectedClass}
                          size="large"
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                          }}
                          style={{ width: 260, borderRadius: 8 }}
                        />
                      </div>

                      <div>
                        <Text strong style={styles.filterLabel}>
                          Phân loại theo lớp
                        </Text>
                        <Select
                          placeholder="Tất cả các lớp học"
                          allowClear
                          size="large"
                          style={{ width: 200 }}
                          dropdownStyle={{ borderRadius: 8 }}
                          value={selectedClass}
                          onChange={(value) => {
                            setSelectedClass(value);
                            if (value) setSearch("");
                            setPage(1);
                          }}
                          options={uniqueClasses.map((className) => ({
                            value: className,
                            label: className,
                          }))}
                        />
                      </div>
                    </Space>
                  </Col>
                  <Col xs={24} sm={8} md={10} style={{ textAlign: "right" }}>
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
                        tuitionForm.resetFields();
                        setIsTuitionModalOpen(true);
                      }}
                      style={styles.addBtn}
                    >
                      Tạo thông báo học phí
                    </Button>
                  </Col>
                </Row>
                <Table
                  columns={mainColumns}
                  dataSource={data}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1050 }}
                  pagination={{
                    current: page,
                    pageSize: limit,
                    total: total,
                    showSizeChanger: true,
                    onChange: (p, s) => {
                      setPage(p);
                      setLimit(s);
                    },
                  }}
                />
              </Card>
            ),
          },
          {
            key: "2",
            label: (
              <Space size={6} style={{ fontWeight: 600 }}>
                <Icon
                  icon="solar:bill-cross-linear"
                  style={{ fontSize: "18px" }}
                />
                <span>Báo cáo nợ phí & Vinh danh</span>
              </Space>
            ),
            children: (
              <Row gutter={[20, 20]}>
                <Col xs={24} lg={14}>
                  <Card
                    bordered={false}
                    style={styles.tableCard}
                    title={
                      <Space
                        size={8}
                        style={{
                          color: "#ef4444",
                          fontSize: "15px",
                          fontWeight: 600,
                        }}
                      >
                        <Icon icon="solar:info-circle-bold" />
                        <span>Danh sách học sinh còn nợ học phí</span>
                      </Space>
                    }
                  >
                    <Table
                      rowKey="tuition_id"
                      dataSource={debtList}
                      pagination={{ pageSize: 5 }}
                      scroll={{ x: 600 }}
                      columns={[
                        {
                          title: "Mã HS",
                          dataIndex: "student_code",
                          key: "student_code",
                          width: 100,
                          render: (t) => (
                            <Text style={styles.codeText}>{t}</Text>
                          ),
                        },
                        {
                          title: "Học sinh",
                          dataIndex: "student_name",
                          key: "student_name",
                        },
                        {
                          title: "Lớp",
                          dataIndex: "class_name",
                          key: "class_name",
                          width: 100,
                        },
                        {
                          title: "Phải đóng",
                          dataIndex: "amount",
                          align: "right",
                          render: formatVND,
                        },
                        {
                          title: "Đã đóng",
                          dataIndex: "paid",
                          align: "right",
                          render: formatVND,
                        },
                        {
                          title: "Còn Thiếu",
                          dataIndex: "debt_amount",
                          align: "right",
                          render: (val) => (
                            <Text type="danger" strong>
                              {formatVND(val)}
                            </Text>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={10}>
                  <Card
                    bordered={false}
                    style={styles.tableCard}
                    title={
                      <Space
                        size={8}
                        style={{
                          color: "#eab308",
                          fontSize: "15px",
                          fontWeight: 600,
                        }}
                      >
                        <Icon icon="solar:cup-star-bold-duotone" />
                        <span>Bảng ghi danh hoàn thành phí xuất sắc</span>
                      </Space>
                    }
                  >
                    <List
                      itemLayout="horizontal"
                      dataSource={topPaidList}
                      renderItem={(item, index) => (
                        <List.Item
                          style={{
                            padding: "12px 4px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <List.Item.Meta
                            avatar={
                              <Tag
                                color={
                                  index === 0
                                    ? "gold"
                                    : index === 1
                                      ? "silver"
                                      : index === 2
                                        ? "orange"
                                        : "blue"
                                }
                                bordered={false}
                                style={{ fontWeight: 700, borderRadius: 4 }}
                              >
                                Top {index + 1}
                              </Tag>
                            }
                            title={
                              <Text strong style={{ color: "#334155" }}>
                                {item.student_name} ({item.class_name})
                              </Text>
                            }
                            description={`Mã số định danh: ${item.student_code}`}
                          />
                          <div style={{ textAlign: "right" }}>
                            <Text
                              type="secondary"
                              style={{ fontSize: "11px", display: "block" }}
                            >
                              Tích lũy đóng
                            </Text>
                            <Text
                              type="success"
                              strong
                              style={{ fontSize: "14px" }}
                            >
                              {formatVND(item.total_paid)}
                            </Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "3",
            label: (
              <Space size={6} style={{ fontWeight: 600 }}>
                <Icon icon="solar:graph-linear" style={{ fontSize: "18px" }} />
                <span>Biểu đồ doanh thu tháng</span>
              </Space>
            ),
            children: (
              <Card
                bordered={false}
                style={styles.tableCard}
                title="Thống kê phân phối doanh thu thực tế theo tháng"
              >
                <div style={{ padding: "10px 4px" }}>
                  {monthlyRevenue.length === 0 ? (
                    <Empty description="Chưa có dữ liệu giao dịch phát sinh phát triển doanh thu" />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                      }}
                    >
                      {monthlyRevenue.map((item, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ width: "130px" }}>
                            <Text strong style={{ color: "#475569" }}>
                              Tháng {item.month}/{item.year}
                            </Text>
                          </div>
                          <div
                            style={{
                              flex: 1,
                              backgroundColor: "#f1f5f9",
                              borderRadius: "6px",
                              marginRight: "20px",
                              height: "18px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                background:
                                  "linear-gradient(90deg, #37B0C3 0%, #54c5d7 100%)",
                                height: "100%",
                                width: `${Math.min(100, (item.revenue / (summary.totalExpected || 1)) * 100)}%`,
                                transition: "width 0.5s ease",
                              }}
                            />
                          </div>
                          <div style={{ width: "160px", textAlign: "right" }}>
                            <Text
                              type="success"
                              strong
                              style={{ fontSize: "15px" }}
                            >
                              {formatVND(item.revenue)}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* MODAL: TẠO MỚI HOẶC SỬA HỌC PHÍ */}
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
              {editingId
                ? "Cập Nhật Thông Tin Học Phí"
                : "Tạo Đợt Đóng Học Phí Mới"}
            </Title>
          </Space>
        }
        open={isTuitionModalOpen}
        onCancel={() => setIsTuitionModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Divider style={{ marginTop: 10, marginBottom: 20 }} />
        <Form
          form={tuitionForm}
          layout="vertical"
          onFinish={handleCreateOrUpdateTuition}
          size="large"
        >
          <Form.Item
            name="student_id"
            label={
              <Text strong style={styles.fieldLabel}>
                Học sinh áp dụng
              </Text>
            }
            rules={[{ required: true, message: "Vui lòng chỉ định học sinh!" }]}
          >
            <Select
              disabled={!!editingId}
              showSearch
              placeholder="Tìm học sinh theo tên/mã..."
              optionFilterProp="children"
              variant="filled"
              dropdownStyle={{ borderRadius: 8 }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={studentsList.map((s) => ({
                value: s.id,
                label: `${s.student_code} - ${s.full_name} (${s.class_name})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label={
              <Text strong style={styles.fieldLabel}>
                Số tiền học phí (VND)
              </Text>
            }
            rules={[
              { required: true, message: "Vui lòng điền số tiền học phí!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%", borderRadius: 8 }}
              min={1000}
              variant="filled"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            name="due_date"
            label={
              <Text strong style={styles.fieldLabel}>
                Hạn nộp tiền cuối cùng
              </Text>
            }
          >
            <DatePicker
              style={{ width: "100%", borderRadius: 8 }}
              format="DD/MM/YYYY"
              variant="filled"
            />
          </Form.Item>
          <Form.Item
            name="note"
            label={
              <Text strong style={styles.fieldLabel}>
                Ghi chú đợt thu học phí
              </Text>
            }
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Thu học phí kỳ chuyên ngành, học phần..."
              variant="filled"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item
            style={{ textAlign: "right", marginBottom: 0, marginTop: 24 }}
          >
            <Space size="medium">
              <Button
                onClick={() => setIsTuitionModalOpen(false)}
                style={{ borderRadius: 8 }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "#37B0C3",
                  borderColor: "#37B0C3",
                  borderRadius: 8,
                }}
              >
                Xác nhận lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL: THU TIỀN ĐÓNG HỌC PHÍ */}
      <Modal
        title={
          <Space size={8}>
            <div style={styles.iconHeadingBox}>
              <Icon
                icon="solar:card-transfer-bold-duotone"
                style={{ color: "#37B0C3", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontSize: 17, color: "#0f172a" }}
            >
              Quầy thu tiền học phí cá nhân
            </Title>
          </Space>
        }
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Divider style={{ marginTop: 10, marginBottom: 20 }} />
        <div
          style={{
            marginBottom: "20px",
            background: "#eefafc",
            padding: "14px",
            borderRadius: "8px",
            borderLeft: "4px solid #37B0C3",
          }}
        >
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Học sinh đối tác giao dịch:{" "}
            <b style={{ color: "#1e293b" }}>{selectedTuition?.student_name}</b>
          </Text>
          <div style={{ marginTop: "4px" }}>
            Mức học phí cần hoàn thành đợt này:{" "}
            <strong style={{ color: "#37B0C3", fontSize: "15px" }}>
              {formatVND(selectedTuition?.amount)}
            </strong>
          </div>
        </div>
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleMakePayment}
          initialValues={{ payment_method: "cash" }}
          size="large"
        >
          <Form.Item
            name="amount_paid"
            label={
              <Text strong style={styles.fieldLabel}>
                Số tiền thực nộp đợt này (VND)
              </Text>
            }
            rules={[{ required: true, message: "Vui lòng nhập số tiền đóng!" }]}
          >
            <InputNumber
              style={{ width: "100%", borderRadius: 8 }}
              min={1000}
              variant="filled"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <Form.Item
            name="payment_method"
            label={
              <Text strong style={styles.fieldLabel}>
                Kênh nộp tiền thanh toán
              </Text>
            }
          >
            <Select variant="filled" dropdownStyle={{ borderRadius: 8 }}>
              <Option value="cash">Tiền mặt (Cash)</Option>
              <Option value="banking">
                Chuyển khoản liên ngân hàng (Banking)
              </Option>
              <Option value="momo">Ví điện tử MoMo</Option>
            </Select>
          </Form.Item>
          <Form.Item
            style={{ textAlign: "right", marginBottom: 0, marginTop: 24 }}
          >
            <Space size="medium">
              <Button
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ borderRadius: 8 }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "#37B0C3",
                  borderColor: "#37B0C3",
                  borderRadius: 8,
                }}
              >
                Xác Nhận Thu Tiền
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL: LỊCH SỬ TẤT CẢ CÁC LẦN ĐÓNG TIỀN */}
      <Modal
        title={
          <Space size={8}>
            <div style={styles.iconHeadingBox}>
              <Icon
                icon="solar:history-bold-duotone"
                style={{ color: "#37B0C3", fontSize: "20px" }}
              />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontSize: 17, color: "#0f172a" }}
            >
              Lịch sử đóng học phí đợt này
            </Title>
          </Space>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsHistoryModalOpen(false)}
            style={{
              backgroundColor: "#37B0C3",
              borderColor: "#37B0C3",
              borderRadius: 8,
            }}
          >
            Đóng cửa sổ
          </Button>,
        ]}
        destroyOnClose
        centered
      >
        <Divider style={{ marginTop: 10, marginBottom: 16 }} />
        <div style={{ marginBottom: 16 }}>
          Học sinh:{" "}
          <Text strong style={{ color: "#0f172a" }}>
            {selectedTuition?.student_name}
          </Text>
        </div>
        <div style={{ maxHeight: "350px", overflowY: "auto", padding: "4px" }}>
          {historyList.length === 0 ? (
            <Empty description="Học sinh này chưa phát sinh bất kỳ giao dịch đóng tiền nào." />
          ) : (
            <List
              dataSource={historyList}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: "12px 4px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          ...styles.iconHeadingBox,
                          backgroundColor:
                            item.payment_method === "momo"
                              ? "#fdf2f8"
                              : item.payment_method === "banking"
                                ? "#eefafc"
                                : "#fef2f2",
                        }}
                      >
                        <Icon
                          icon={
                            item.payment_method === "momo"
                              ? "solar:smartphone-2-linear"
                              : item.payment_method === "banking"
                                ? "solar:card-transfer-linear"
                                : "solar:wallet-linear"
                          }
                          style={{
                            color:
                              item.payment_method === "momo"
                                ? "#db2777"
                                : item.payment_method === "banking"
                                  ? "#37B0C3"
                                  : "#ef4444",
                          }}
                        />
                      </div>
                    }
                    title={
                      <Space>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {dayjs(item.payment_date).format(
                            "HH:mm - DD/MM/YYYY",
                          )}
                        </Text>
                        <Tag
                          bordered={false}
                          size="small"
                          style={{ fontSize: "10px", fontWeight: 600 }}
                        >
                          {item.payment_method.toUpperCase()}
                        </Tag>
                      </Space>
                    }
                    description={<span>Hình thức đóng qua kênh hệ thống</span>}
                  />
                  <div>
                    <Text type="success" strong style={{ fontSize: "14px" }}>
                      +{formatVND(item.amount_paid)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>

      {/* MODAL: CHI TIẾT SÂU MỘT KHOẢN HỌC PHÍ */}
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
              Chi Tiết Khoản Thu Học Phí Hệ Thống
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
            Đã hiểu
          </Button>,
        ]}
        destroyOnClose
        centered
      >
        <Divider style={{ marginTop: 10, marginBottom: 20 }} />
        {tuitionDetail && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div style={styles.detailRow}>
              <Text type="secondary">Học sinh áp dụng:</Text>
              <Text strong style={{ color: "#334155" }}>
                {tuitionDetail.full_name} ({tuitionDetail.student_code})
              </Text>
            </div>
            <div style={styles.detailRow}>
              <Text type="secondary">Lớp học quản lý:</Text>
              <Text strong style={{ color: "#334155" }}>
                {tuitionDetail.class_name || "Chưa phân lớp"}
              </Text>
            </div>
            <div style={styles.detailRow}>
              <Text type="secondary">Mức học phí định danh:</Text>
              <Text strong type="danger">
                {formatVND(tuitionDetail.amount)}
              </Text>
            </div>
            <div style={styles.detailRow}>
              <Text type="secondary">Hạn thanh toán cuối cùng:</Text>
              <Text strong style={{ color: "#334155" }}>
                {tuitionDetail.due_date
                  ? dayjs(tuitionDetail.due_date).format("DD/MM/YYYY")
                  : "Vô thời hạn"}
              </Text>
            </div>
            <div style={styles.detailRow}>
              <Text type="secondary">Trạng thái hiện tại:</Text>
              <Tag
                color={
                  tuitionDetail.status === "paid"
                    ? "success"
                    : tuitionDetail.status === "partial"
                      ? "warning"
                      : "error"
                }
                bordered={false}
                style={{ margin: 0, fontWeight: 600 }}
              >
                {tuitionDetail.status === "paid"
                  ? "Đã đóng đủ"
                  : tuitionDetail.status === "partial"
                    ? "Còn nợ"
                    : "Chưa đóng"}
              </Tag>
            </div>
            <div
              style={{
                borderTop: "1px dashed #e2e8f0",
                paddingTop: "12px",
                marginTop: "4px",
              }}
            >
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: "4px" }}
              >
                Nhật ký biên bản ghi chú:
              </Text>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                }}
              >
                {tuitionDetail.note || "Không có ghi chú đợt thu học phí"}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Content>
  );
};

// HỆ THỐNG PHẲNG UI ĐỒNG BỘ DỰ ÁN
const styles = {
  tableCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  statCard: {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    height: "100%",
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
    color: "#37B0C3",
    fontWeight: 700,
    fontSize: "26px",
    lineHeight: 1.2,
    marginTop: "4px",
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
  codeText: {
    fontWeight: 700,
    color: "#334155",
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: "#f1f5f9",
    padding: "3px 6px",
    borderRadius: 4,
  },
  actionBtn: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "8px",
  },
};

export default TuitionPage;
