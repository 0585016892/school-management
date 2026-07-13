import React from "react";
import { Button, Result, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

const { Paragraph, Text } = Typography;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <Result
        status="404"
        title={
          <span
            style={{ fontSize: "72px", fontWeight: "800", color: "#1e293b" }}
          >
            404
          </span>
        }
        subTitle={
          <div style={{ marginTop: "10px" }}>
            <Title level={4} style={{ margin: 0, color: "#64748b" }}>
              Trang không tồn tại hoặc bạn không có quyền truy cập!
            </Title>
            <Text type="secondary">
              Vui lòng kiểm tra lại đường dẫn hoặc tài khoản của bạn.
            </Text>
          </div>
        }
        icon={
          <div style={{ marginBottom: "-20px" }}>
            <Icon
              icon="solar:map-arrow-square-bold-duotone"
              style={{ fontSize: "120px", color: "#ff4d4f" }}
            />
          </div>
        }
        extra={
          <Button
            type="primary"
            size="large"
            style={{
              background: "#37B0C3",
              borderColor: "#37B0C3",
              borderRadius: "6px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => navigate(-1)} // Quay lại trang trước đó
          >
            <Icon
              icon="solar:alt-arrow-left-linear"
              style={{ fontSize: "18px" }}
            />
            Quay lại trang trước
          </Button>
        }
      />
    </div>
  );
};

// Khai báo Title nhanh từ Typography
const { Title } = Typography;

export default NotFound;
