import React, { useState, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Dropdown, Space, theme } from "antd";
// Import Iconify component
import { Icon } from "@iconify/react";
import AuthContext from "../context/AuthContext";

const { Header, Sider, Content } = Layout;

const TeacherLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Màu chủ đạo của bạn
  const PRIMARY_COLOR = "#37B0C3";

  // Thay thế toàn bộ bằng bộ Solar Outline/Linear cực xịn
  const menuItems = [
    {
      key: "/teacher",
      icon: <Icon icon="solar:widget-4-linear" style={{ fontSize: "20px" }} />,
      label: "Bảng điều khiển",
    },
    {
      key: "/teacher/attendance",
      icon: (
        <Icon
          icon="solar:user-check-rounded-linear"
          style={{ fontSize: "20px" }}
        />
      ),
      label: "Điểm danh",
    },
    {
      key: "/teacher/classes",
      icon: (
        <Icon
          icon="solar:notebook-bookmark-linear"
          style={{ fontSize: "20px" }}
        />
      ),
      label: "Lớp học của tôi",
    },
    {
      key: "/teacher/schedules",
      icon: (
        <Icon
          icon="solar:calendar-calendar-linear"
          style={{ fontSize: "20px" }}
        />
      ),
      label: "Lịch dạy",
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
        onClick: () => navigate("/teacher/profile"),
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
      {/* CSS tùy chỉnh cho Menu Light và Iconify */}
      <style>{`
        /* Style cho item đang active trong Menu Light */
        .custom-sidebar .ant-menu-item-selected {
          background-color: rgba(55, 176, 195, 0.1) !important;
          color: ${PRIMARY_COLOR} !important;
          font-weight: 600;
        }
        /* Hiệu ứng hover vào menu */
        .custom-sidebar .ant-menu-item:hover, 
        .custom-sidebar .ant-menu-item-active {
          color: ${PRIMARY_COLOR} !important;
        }
        /* Nút toggle đổi màu khi hover */
        .toggle-btn:hover {
          color: ${PRIMARY_COLOR} !important;
          background-color: rgba(55, 176, 195, 0.05) !important;
        }
        /* Căn chỉnh icon lề giữa chuẩn với chữ của Antd */
        .ant-menu-item .ant-menu-item-icon {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          vertical-align: middle;
        }
      `}</style>

      {/* SIDEBAR BÊN TRÁI */}
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
            transition: "all 0.2s",
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
              L
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
                Teacher <span style={{ color: PRIMARY_COLOR }}>LMS</span>
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

      {/* KHU VỰC NỘI DUNG BÊN PHẢI */}
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
          {/* Nút đóng mở nhanh Sidebar sử dụng icon Solar Hamburger */}
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

          {/* KHU VỰC USER PROFILE */}
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
                    {user?.full_name || "Giảng viên"}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Teacher Account
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
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
