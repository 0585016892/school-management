import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Breadcrumb,
  Button,
} from "antd";
import { Icon } from "@iconify/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Mapping danh mục chuẩn để hiển thị Breadcrumb động dựa trên pathname thực tế
  const breadcrumbNameMap = {
    "": "Hệ thống",
    admin: "Tổng quan Dashboard",
    students: "Quản lý Học sinh",
    teachers: "Đội ngũ Giáo viên",
    classes: "Danh sách Lớp học",
    subjects: "Chương trình Môn học",
    schedules: "Thời khóa biểu giảng dạy",
    attendance: "Điểm danh chuyên cần",
    scores: "Bảng điểm học tập",
    tuition: "Quản lý Học phí",
  };

  // Trích xuất đoạn cuối của URL để so khớp chính xác Menu Item active độc lập
  const currentKey = location.pathname.split("/").pop() || "admin";

  // Hệ thống Menu Items chuyển đổi toàn bộ sang Iconify (Solar Linear)
  const menuItems = [
    {
      key: "", // 🌟 ĐÃ SỬA: Xóa bỏ gạch chéo và khoảng trắng thừa "/admin  " để đồng bộ nhận diện active key
      icon: <Icon icon="solar:widget-2-linear" style={{ fontSize: "20px" }} />,
      label: "Dashboard",
    },
    {
      key: "group-1",
      type: "group",
      label: "NHÂN SỰ",
      children: [
        {
          key: "students",
          icon: (
            <Icon
              icon="solar:users-group-two-rounded-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Học sinh",
        },
        {
          key: "teachers",
          icon: (
            <Icon
              icon="solar:shield-user-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Giáo viên",
        },
      ],
    },
    {
      key: "group-2",
      type: "group",
      label: "ĐÀO TẠO",
      children: [
        {
          key: "classes",
          // 🌟 Đặt icon Blackboard mới cho đồng bộ cấu trúc lớp học
          icon: (
            <Icon icon="solar:blackboard-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Lớp học",
        },
        {
          key: "subjects",
          icon: (
            <Icon icon="solar:notebook-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Môn học",
        },
        {
          key: "schedules",
          icon: (
            <Icon
              icon="solar:calendar-date-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Thời khóa biểu",
        },
      ],
    },
    {
      key: "group-3",
      type: "group",
      label: "BÁO CÁO",
      children: [
        {
          key: "attendance",
          icon: (
            <Icon icon="solar:user-speak-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Điểm danh",
        },
        {
          key: "scores",
          icon: (
            <Icon
              icon="solar:round-graph-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Điểm số",
        },
        {
          key: "tuition",
          icon: (
            <Icon
              icon="solar:wallet-money-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Học phí",
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        .custom-sider .ant-menu-item-selected {
          background-color: #eefafc !important;
          color: #37b0c3 !important;
        }
        .custom-sider .ant-menu-item:hover {
          color: #37b0c3 !important;
        }
        .user-dropdown-box:hover {
          background-color: #f1f5f9;
        }
        .custom-sider .ant-menu-item .anticon {
          display: inline-flex;
          align-items: center;
        }
      `}</style>

      <Sider
        width={260}
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme="light"
        className="custom-sider"
        style={styles.sider}
      >
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <Icon
              icon="solar:globus-bold"
              style={{ color: "#fff", fontSize: "22px" }}
            />
          </div>
          {!collapsed && (
            <Title level={5} style={styles.logoText}>
              EDU SYSTEM
            </Title>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={styles.menu}
        />
      </Sider>

      <Layout style={{ transition: "all 0.2s" }}>
        <Header style={styles.header}>
          <Space size="middle">
            <Button
              type="text"
              icon={
                <Icon
                  icon={
                    collapsed
                      ? "solar:hamburger-menu-linear"
                      : "solar:menu-hamburger-bold-duotone"
                  }
                  style={{ fontSize: "20px" }}
                />
              }
              onClick={() => setCollapsed(!collapsed)}
              style={styles.toggleBtn}
            />
            <Breadcrumb
              items={[
                { title: "Hệ thống" },
                { title: breadcrumbNameMap[currentKey] || "Chức năng" },
              ]}
              style={styles.breadcrumb}
            />
          </Space>

          <Space size={20}>
            <Button
              type="text"
              icon={
                <Icon
                  icon="solar:bell-bing-linear"
                  style={{ fontSize: "22px", color: "#64748b" }}
                />
              }
              style={{
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    icon: (
                      <Icon
                        icon="solar:user-id-linear"
                        style={{ fontSize: "16px" }}
                      />
                    ),
                    label: "Hồ sơ cá nhân",
                    onClick: () => navigate("/admin/profile"), // 🌟 ĐÃ SỬA: Bổ sung sự kiện onClick để chuyển trang sang hồ sơ Admin
                  },
                  {
                    key: "change-password",
                    icon: (
                      <Icon
                        icon="solar:lock-password-linear"
                        style={{ fontSize: "16px" }}
                      />
                    ),
                    label: "Đổi mật khẩu",
                    onClick: () => navigate("/change-password"),
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    icon: (
                      <Icon
                        icon="solar:logout-3-linear"
                        style={{ fontSize: "16px" }}
                      />
                    ),
                    label: "Đăng xuất",
                    danger: true,
                    onClick: logout,
                  },
                ],
              }}
              placement="bottomRight"
              arrow
            >
              <Space style={styles.userDropdown} className="user-dropdown-box">
                <Avatar
                  size="large"
                  style={{
                    backgroundColor: "#37b0c3",
                    verticalAlign: "middle",
                    fontWeight: 600,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "A"}
                </Avatar>
                {!collapsed && (
                  <div style={{ lineHeight: 1.2 }}>
                    <Text strong style={{ display: "block", color: "#334155" }}>
                      {user?.username || "Admin"}
                    </Text>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, fontWeight: 500 }}
                    >
                      {user?.role?.toUpperCase() || "ADMINISTRATOR"}
                    </Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={styles.content}>
          <div style={styles.mainWrapper}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

const styles = {
  sider: {
    boxShadow: "1px 0 8px rgba(0,0,0,0.02)",
    zIndex: 10,
    position: "relative",
    borderRight: "1px solid #e2e8f0",
  },
  logoContainer: {
    height: 70,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, #37b0c3 0%, #54c5d7 100%)",
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(55, 176, 195, 0.2)",
  },
  logoText: {
    margin: 0,
    color: "#0f172a",
    letterSpacing: "0.5px",
    fontWeight: 800,
    fontSize: "16px",
  },
  menu: {
    borderRight: 0,
    padding: "16px 12px",
  },
  header: {
    padding: "0 24px",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
    borderBottom: "1px solid #e2e8f0",
  },
  toggleBtn: {
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#64748b",
  },
  breadcrumb: {
    fontSize: "14px",
    fontWeight: 500,
  },
  userDropdown: {
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: 8,
    transition: "all 0.2s",
  },
  content: {
    margin: "24px",
    overflow: "initial",
  },
  mainWrapper: {
    padding: 24,
    background: "#fff",
    minHeight: "calc(100vh - 118px)",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
};

export default AdminLayout;
