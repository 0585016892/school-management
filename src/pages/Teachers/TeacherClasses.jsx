import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Spin, Button, Empty, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import teacherApi from "../api/teacherApi";

const TeacherClasses = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      setLoading(true);

      const res = await teacherApi.getClasses(id);

      setClasses(res.data?.data || res.data || []);
    } catch (err) {
      console.log("Error get classes:", err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [id]);

  const columns = [
    {
      title: "Tên lớp",
      dataIndex: "class_name",
      key: "class_name",
    },
    {
      title: "Mã lớp",
      dataIndex: "class_code",
      key: "class_code",
      render: (text) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Số học sinh",
      dataIndex: "student_count",
      key: "student_count",
      render: (text) => text || 0,
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card
        title="Danh sách lớp đang dạy"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : classes.length === 0 ? (
          <Empty description="Giáo viên chưa có lớp nào" />
        ) : (
          <Table
            dataSource={classes}
            columns={columns}
            rowKey={(record, index) => index}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </div>
  );
};

export default TeacherClasses;
