import React, { useState, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  theme,
  Select,
} from "antd";
import { Icon } from "@iconify/react";
import AuthContext from "../context/AuthContext";

const { Header, Sider, Content } = Layout;

const StudentLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  // State giả định nếu tài khoản là Phụ huynh quản lý nhiều con
  const [selectedChild, setSelectedChild] = useState("child_1");

  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Màu chủ đạo đồng bộ với hệ thống
  const PRIMARY_COLOR = "#37B0C3";

  // Danh mục menu dành riêng cho Học sinh / Phụ huynh sử dụng Solar Icons mượt mà
  const menuItems = [
    {
      key: "/student",
      icon: <Icon icon="solar:widget-4-linear" style={{ fontSize: "20px" }} />,
      label: "Bảng tổng quan",
    },
    {
      key: "/student/scores",
      icon: (
        <Icon icon="solar:document-text-linear" style={{ fontSize: "20px" }} />
      ),
      label: "Kết quả học tập",
    },
    {
      key: "/student/schedules",
      icon: (
        <Icon icon="solar:calendar-date-linear" style={{ fontSize: "20px" }} />
      ),
      label: "Thời khóa biểu",
    },

    {
      key: "/student/tuition",
      icon: <Icon icon="solar:card-2-linear" style={{ fontSize: "20px" }} />,
      label: "Học phí & Hóa đơn",
    },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: (
          <Icon
            icon="solar:user-circle-linear"
            style={{ color: PRIMARY_COLOR, fontSize: "16px" }}
          />
        ),
        label: <span style={{ fontWeight: 500 }}>Hồ sơ cá nhân</span>,
        onClick: () => navigate("/student/profile"),
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: (
          <Icon icon="solar:logout-3-linear" style={{ fontSize: "16px" }} />
        ),
        label: <span style={{ fontWeight: 500 }}>Đăng xuất</span>,
        danger: true,
        onClick: () => {
          if (logout) logout();
          navigate("/login");
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <style>{`
        .custom-sidebar .ant-menu-item-selected {
          background-color: rgba(55, 176, 195, 0.1) !important;
          color: ${PRIMARY_COLOR} !important;
          font-weight: 600;
        }
        .custom-sidebar .ant-menu-item:hover, 
        .custom-sidebar .ant-menu-item-active {
          color: ${PRIMARY_COLOR} !important;
        }
        .toggle-btn:hover {
          color: ${PRIMARY_COLOR} !important;
          background-color: rgba(55, 176, 195, 0.05) !important;
        }
        .ant-menu-item .ant-menu-item-icon {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          vertical-align: middle;
        }
        /* Style lại ô chọn Học sinh cho mượt mà */
        .child-select .ant-select-selector {
          border-radius: 8px !important;
          border-color: #e2e8f0 !important;
        }
        .child-select.ant-select-focused .ant-select-selector {
          border-color: ${PRIMARY_COLOR} !important;
          box-shadow: 0 0 0 2px rgba(55, 176, 195, 0.1) !important;
        }
      `}</style>

      {/* SIDEBAR TRÁI */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
        className="custom-sidebar"
        width={260}
        collapsedWidth={80}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
          background: "#ffffff",
          borderRight: "1px solid #f1f5f9",
          zIndex: 10,
        }}
      >
        {/* LOGO HỆ THỐNG */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: "0 24px",
            background: "#ffffff",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: PRIMARY_COLOR,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "16px",
                boxShadow: `0 4px 12px rgba(55, 176, 195, 0.25)`,
              }}
            >
              S
            </div>
            {!collapsed && (
              <span
                style={{
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "16px",
                  letterSpacing: "0.5px",
                }}
              >
                Student <span style={{ color: PRIMARY_COLOR }}>Portal</span>
              </span>
            )}
          </div>
        </div>

        {/* MENU ĐIỀU HƯỚNG */}
        <Menu
          mode="inline"
          theme="light"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "transparent",
            borderRight: 0,
            padding: "16px 12px",
          }}
        />
      </Sider>

      {/* NỘI DUNG PHẢI */}
      <Layout style={{ background: "#f8fafc" }}>
        {/* HEADER TOP BAR */}
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f1f5f9",
            position: "sticky",
            top: 0,
            zIndex: 9,
            width: "100%",
            height: 64,
          }}
        >
          <Space size={16}>
            {/* Nút Hamburger rút gọn menu */}
            <Button
              type="text"
              className="toggle-btn"
              icon={
                <Icon
                  icon="solar:hamburger-menu-linear"
                  style={{
                    fontSize: "20px",
                    transform: collapsed ? "rotate(90deg)" : "none",
                    transition: "transform 0.3s",
                  }}
                />
              }
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                color: "#64748b",
              }}
            />

            {/* Bộ chọn chuyển đổi giữa các con (Hữu ích nếu Role là Parent) */}
            {!collapsed && user?.role === "parent" && (
              <Select
                className="child-select"
                defaultValue="child_1"
                style={{ width: 180 }}
                onChange={(value) => setSelectedChild(value)}
                options={[
                  { value: "child_1", label: "Con: Nguyễn Văn A" },
                  { value: "child_2", label: "Con: Nguyễn Thị B" },
                ]}
              />
            )}
          </Space>

          {/* USER PROFILE */}
          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "6px 12px",
                borderRadius: "10px",
              }}
              className="toggle-btn"
            >
              <Space size={10}>
                <Avatar
                  style={{
                    backgroundColor: "rgba(55, 176, 195, 0.08)",
                    color: PRIMARY_COLOR,
                    border: `1.5px solid rgba(55, 176, 195, 0.3)`,
                  }}
                  icon={<Icon icon="solar:user-linear" />}
                  src={user?.avatar_url}
                  size={36}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: "1.2",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#0f172a",
                      fontSize: "14px",
                    }}
                  >
                    {user?.full_name || "Phụ huynh"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    {user?.role === "parent"
                      ? "Tài khoản phụ huynh"
                      : "Tài khoản học sinh"}
                  </span>
                </div>
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    marginLeft: "4px",
                  }}
                />
              </Space>
            </div>
          </Dropdown>
        </Header>

        {/* NƠI HIỂN THỊ CÁC PAGE CON */}
        <Content
          style={{
            margin: "24px",
            padding: 28,
            minHeight: "calc(100vh - 112px)",
            background: colorBgContainer,
            borderRadius: "16px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.015)",
            overflow: "initial",
          }}
        >
          {/* Bạn có thể truyền state selectedChild xuống các page con qua context hoặc outlet context nếu cần */}
          <Outlet context={{ selectedChild }} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentLayout;
