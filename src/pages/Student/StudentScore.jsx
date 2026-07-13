import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Spin,
  Empty,
  Select,
  Typography,
  Space,
  Row,
  Col,
  message,
} from "antd";
import { Icon } from "@iconify/react";
import useAuth from "../../hooks/useAuth";
// Giả định import từ file chứa các hàm gọi API của bạn
import { scoreApi } from "../../api/scoreApi";

const { Title, Text } = Typography;
const { Option } = Select;

const StudentScore = () => {
  const { user } = useAuth();
  const studentId = user?.student_id || 714; // Fallback id từ data mẫu nếu chưa có auth
  console.log("user:::", user);

  const [loading, setLoading] = useState(true);
  const [rawScores, setRawScores] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("ALL");

  // Định nghĩa tên môn học dựa trên subject_id từ API (Bạn có thể map với API danh mục môn học nếu có)
  const subjectMap = {
    1: "Toán 1",
    2: "Toán 2",
  };

  // Hệ số tính điểm trung bình môn (Miệng: 1, 15p: 1, 1tiet: 2, Giuaky: 2, Cuoiky: 3)
  const SCORE_WEIGHTS = {
    mieng: 1,
    "15p": 1,
    "1tiet": 2,
    giuaky: 2,
    cuoiky: 3,
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        // Gọi API lấy điểm của học sinh
        const res = await scoreApi.getByStudent(studentId);

        if (res && res.success) {
          setRawScores(res.data || []);
        } else {
          message.error("Không thể tải danh sách điểm.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy điểm học sinh:", error);
        message.error("Đã xảy ra lỗi hệ thống.");
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [studentId]);

  // Xử lý biến đổi cấu trúc dữ liệu phẳng thành dạng bảng hàng dọc theo môn
  useEffect(() => {
    if (!rawScores.length) {
      setDisplayData([]);
      return;
    }

    // Bước 1: Nhóm các đầu điểm theo tổ hợp (subject_id + semester)
    const grouped = rawScores.reduce((acc, curr) => {
      const key = `${curr.subject_id}_${curr.semester}`;

      if (!acc[key]) {
        acc[key] = {
          key: key,
          subject_id: curr.subject_id,
          subject_name:
            subjectMap[curr.subject_id] || `Môn học ${curr.subject_id}`,
          semester: curr.semester,
          mieng: null,
          "15p": null,
          "1tiet": null,
          giuaky: null,
          cuoiky: null,
          _rawScores: [], // Lưu để tính toán ĐTB môn
        };
      }

      const scoreValue = parseFloat(curr.score);
      acc[key][curr.score_type] = scoreValue;
      acc[key]._rawScores.push({ type: curr.score_type, value: scoreValue });

      return acc;
    }, {});

    // Bước 2: Chuyển object nhóm thành mảng và tính Điểm trung bình môn
    const formattedData = Object.values(grouped).map((item) => {
      let totalPoints = 0;
      let totalWeights = 0;

      item._rawScores.forEach((s) => {
        const weight = SCORE_WEIGHTS[s.type] || 1;
        totalPoints += s.value * weight;
        totalWeights += weight;
      });

      // ĐTB môn = Tổng (Điểm * Hệ số) / Tổng hệ số
      item.avg_score =
        totalWeights > 0 ? (totalPoints / totalWeights).toFixed(2) : "-";
      return item;
    });

    // Bước 3: Lọc theo học kỳ nếu người dùng chọn bộ lọc
    if (selectedSemester !== "ALL") {
      setDisplayData(
        formattedData.filter((item) => item.semester === selectedSemester),
      );
    } else {
      setDisplayData(formattedData);
    }
  }, [rawScores, selectedSemester]);

  // Hàm render tag điểm màu sắc
  const renderScore = (score) => {
    if (score === null || score === undefined)
      return <Text type="secondary">-</Text>;
    let color = "red";
    if (score >= 8.0) color = "green";
    else if (score >= 5.0) color = "blue";
    return (
      <Tag color={color} style={{ fontWeight: "bold" }}>
        {score.toFixed(1)}
      </Tag>
    );
  };

  // Cấu hình các cột của bảng điểm
  const columns = [
    {
      title: "Tên môn học",
      dataIndex: "subject_name",
      key: "subject_name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      align: "center",
      render: (sem) => <Tag color="purple">{sem}</Tag>,
    },
    {
      title: "Điểm miệng",
      dataIndex: "mieng",
      key: "mieng",
      align: "center",
      render: renderScore,
    },
    {
      title: "Điểm 15 phút",
      dataIndex: "15p",
      key: "15p",
      align: "center",
      render: renderScore,
    },
    {
      title: "Điểm 1 tiết",
      dataIndex: "1tiet",
      key: "1tiet",
      align: "center",
      render: renderScore,
    },
    {
      title: "Điểm giữa kỳ",
      dataIndex: "giuaky",
      key: "giuaky",
      align: "center",
      render: renderScore,
    },
    {
      title: "Điểm cuối kỳ",
      dataIndex: "cuoiky",
      key: "cuoiky",
      align: "center",
      render: renderScore,
    },
    {
      title: "Điểm TB Môn",
      dataIndex: "avg_score",
      key: "avg_score",
      align: "center",
      fixed: "right",
      render: (avg) => {
        if (avg === "-") return "-";
        const num = parseFloat(avg);
        const color = num >= 8.0 ? "gold" : num >= 5.0 ? "cyan" : "volcano";
        return (
          <Tag
            color={color}
            style={{ fontSize: "14px", fontWeight: "bold", padding: "2px 8px" }}
          >
            {avg}
          </Tag>
        );
      },
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
        <Spin size="large" tip="Đang tải bảng điểm chi tiết..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "4px" }}>
      {/* TIÊU ĐỀ TRANG VÀ BỘ LỌC */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "20px" }}
      >
        <Col>
          <Space size="middle">
            <Icon
              icon="solar:notebook-bold-duotone"
              style={{ color: "#37B0C3", fontSize: "28px" }}
            />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Kết quả học tập chi tiết
              </Title>
              <Text type="secondary">
                Tra cứu chi tiết các đầu điểm thành phần theo từng học kỳ
              </Text>
            </div>
          </Space>
        </Col>
        <Col xs={24} style={{ marginTop: "12px", sm: { marginTop: 0 } }}>
          <Space>
            <Text strong>Học kỳ:</Text>
            <Select
              defaultValue="ALL"
              style={{ width: 140 }}
              onChange={(value) => setSelectedSemester(value)}
            >
              <Option value="ALL">Tất cả học kỳ</Option>
              <Option value="HK1">Học kỳ 1</Option>
              <Option value="HK2">Học kỳ 2</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* BẢNG ĐIỂM */}
      <Card
        bordered={false}
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
      >
        {displayData.length > 0 ? (
          <Table
            dataSource={displayData}
            columns={columns}
            pagination={false}
            scroll={{ x: "max-content" }}
            bordered
          />
        ) : (
          <Empty description="Không tìm thấy dữ liệu điểm phù hợp" />
        )}
      </Card>
    </div>
  );
};

export default StudentScore;
