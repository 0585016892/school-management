import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Spin,
  Empty,
  Tabs,
  message,
} from "antd";
import { Icon } from "@iconify/react";
import useAuth from "../../hooks/useAuth";
// Import endpoint API của bạn
import { tuitionApi } from "../../api/tuitionApi";

const { Title, Text } = Typography;

const StudentTuition = () => {
  const { user } = useAuth();
  const studentId = user?.student_id || 714; // Fallback nếu chưa cấu hình auth

  const [loading, setLoading] = useState(true);
  const [tuitionData, setTuitionData] = useState(null);

  useEffect(() => {
    const fetchTuitionData = async () => {
      try {
        setLoading(true);
        // Gọi API tương ứng với hàm bạn yêu cầu
        const res = await tuitionApi.getTuitionStudents(studentId);

        if (res && res.success) {
          setTuitionData(res.data);
        } else {
          message.error("Không thể tải thông tin học phí.");
        }
      } catch (error) {
        console.error("Lỗi khi fetch học phí:", error);
        message.error("Đã xảy ra lỗi kết nối hệ thống.");
      } finally {
        setLoading(false);
      }
    };

    fetchTuitionData();
  }, [studentId]);

  // Hàm helper format tiền tệ VND (ví dụ: 5,000,000 đ)
  const formatVND = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Hàm helper format ngày tháng gọn đẹp
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // Hàm render tag trạng thái đóng tiền
  const renderStatusTag = (status) => {
    const config = {
      paid: {
        color: "success",
        text: "Đã hoàn thành",
        icon: "solar:check-circle-bold",
      },
      partial: {
        color: "warning",
        text: "Đang đóng dở",
        icon: "solar:clock-circle-bold",
      },
      unpaid: {
        color: "error",
        text: "Chưa thanh toán",
        icon: "solar:info-circle-bold",
      },
    };

    const current = config[status] || config.unpaid;
    return (
      <Tag
        color={current.color}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 8px",
        }}
      >
        <Icon icon={current.icon} />
        {current.text}
      </Tag>
    );
  };

  // Định nghĩa các cột cho bảng Danh sách học phí (Tuition List)
  const tuitionColumns = [
    {
      title: "Khoản thu / Nội dung",
      dataIndex: "note",
      key: "note",
      render: (text) => <Text strong>{text || "Học phí định kỳ"}</Text>,
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "due_date",
      key: "due_date",
      align: "center",
      render: (date) => formatDate(date),
    },
    {
      title: "Số tiền cần đóng",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => <Text>{formatVND(amount)}</Text>,
    },
    {
      title: "Đã nộp",
      dataIndex: "total_paid",
      key: "total_paid",
      align: "right",
      render: (paid) => <Text type="success">{formatVND(paid)}</Text>,
    },
    {
      title: "Còn nợ",
      dataIndex: "total_debt",
      key: "total_debt",
      align: "right",
      render: (debt) => (
        <Text type={Number(debt) > 0 ? "danger" : "secondary"} strong>
          {formatVND(debt)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => renderStatusTag(status),
    },
  ];

  // Định nghĩa các cột cho bảng Lịch sử thanh toán (Payment History)
  const paymentColumns = [
    {
      title: "Mã GD",
      dataIndex: "payment_id",
      key: "payment_id",
      render: (id) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: "Ngày đóng",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (date) => formatDate(date),
    },
    {
      title: "Nội dung khoản thu",
      dataIndex: "fee_note",
      key: "fee_note",
      render: (text) => <Text type="secondary">{text || "Nộp tiền học"}</Text>,
    },
    {
      title: "Phương thức",
      dataIndex: "payment_method",
      key: "payment_method",
      align: "center",
      render: (method) => {
        const methods = {
          banking: { text: "Chuyển khoản", color: "cyan" },
          momo: { text: "Ví MoMo", color: "magenta" },
          cash: { text: "Tiền mặt", color: "orange" },
        };
        const current = methods[method] || { text: method, color: "default" };
        return <Tag color={current.color}>{current.text}</Tag>;
      },
    },
    {
      title: "Số tiền đóng",
      dataIndex: "amount_paid",
      key: "amount_paid",
      align: "right",
      render: (amount) => (
        <Text strong style={{ color: "#52c41a" }}>
          +{formatVND(amount)}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu học phí..." />
      </div>
    );
  }

  if (!tuitionData) {
    return <Empty description="Không có dữ liệu học phí hiển thị" />;
  }

  const { studentInfo, summary, tuitionList, paymentHistory } = tuitionData;

  return (
    <div style={{ padding: "4px" }}>
      {/* TIÊU ĐỀ TRANG & THÔNG TIN HỌC SINH */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      >
        <Col>
          <Space size="middle">
            <Icon
              icon="solar:wallet-money-bold-duotone"
              style={{ color: "#10b981", fontSize: "32px" }}
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý Học phí học sinh
              </Title>
              <Text type="secondary">
                Học sinh: <Text strong>{studentInfo.full_name}</Text> (
                {studentInfo.student_code}) | Lớp:{" "}
                <Text strong style={{ color: "#10b981" }}>
                  {studentInfo.class_name}
                </Text>
              </Text>
            </div>
          </Space>
        </Col>
      </Row>

      {/* KHỐI THỐNG KÊ TỔNG QUAN (SUMMARY CARDS) */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              borderLeft: "4px solid #1890ff",
            }}
          >
            <Statistic
              title={<Text type="secondary">Tổng học phí phải đóng</Text>}
              value={summary.totalExpected}
              formatter={(value) => formatVND(value)}
              valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              borderLeft: "4px solid #52c41a",
            }}
          >
            <Statistic
              title={<Text type="secondary">Tổng tiền đã đóng</Text>}
              value={summary.totalPaid}
              formatter={(value) => formatVND(value)}
              valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            bordered={false}
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              borderLeft: "4px solid #ff4d4f",
            }}
          >
            <Statistic
              title={<Text type="secondary">Tổng tiền còn nợ học kỳ</Text>}
              value={summary.totalDebt}
              formatter={(value) => formatVND(value)}
              valueStyle={{ color: "#ff4d4f", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* CHI TIẾT CÁC KHOẢN VÀ LỊCH SỬ GIAO DỊCH */}
      <Card
        bordered={false}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: (
                <Space>
                  <Icon icon="solar:bill-list-linear" />
                  Danh sách khoản thu
                </Space>
              ),
              children: (
                <Table
                  dataSource={tuitionList}
                  columns={tuitionColumns}
                  rowKey="tuition_id"
                  pagination={false}
                  bordered
                  scroll={{ x: "max-content" }}
                  locale={{ emptyText: "Không có đợt thu học phí nào" }}
                />
              ),
            },
            {
              key: "2",
              label: (
                <Space>
                  <Icon icon="solar:history-linear" />
                  Lịch sử đóng tiền ({paymentHistory?.length || 0})
                </Space>
              ),
              children: (
                <Table
                  dataSource={paymentHistory}
                  columns={paymentColumns}
                  rowKey="payment_id"
                  pagination={{ pageSize: 5 }}
                  bordered
                  scroll={{ x: "max-content" }}
                  locale={{ emptyText: "Chưa có lịch sử thanh toán tiền học" }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default StudentTuition;
