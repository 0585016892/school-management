import React, { useState, useMemo } from "react";
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
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Lấy role hiện tại của user (mặc định nếu chưa load xong)
  const userRole = user?.role;

  // =====================================================
  // BREADCRUMB MAP
  // =====================================================
  const breadcrumbNameMap = {
    admin: "Tổng quan Dashboard",
    organization: "Tổ chức nhà trường",
    management: "Ban giám hiệu",
    departments: "Tổ chuyên môn",
    union: "Công đoàn cơ sở",
    schoolCouncil: "Hội đồng trường",
    students: "Quản lý Học sinh",
    parents: "Quản lý Phụ huynh",
    teachers: "Đội ngũ Giáo viên",
    staffs: "Nhân viên",
    classes: "Danh sách Lớp học",
    subjects: "Chương trình Môn học",
    assignments: "Phân công giảng dạy",
    schedules: "Thời khóa biểu giảng dạy",
    attendance: "Điểm danh chuyên cần",
    scores: "Bảng điểm học tập",
    tuition: "Quản lý Học phí",
    rewards: "Thi đua - Khen thưởng",
    discipline: "Kỷ luật",
    announcements: "Thông báo",
    documents: "Văn bản",
    meetings: "Cuộc họp",
    profile: "Hồ sơ cá nhân",
  };

  // Lấy key hiện tại từ URL
  const currentKey =
    location.pathname.split("/").filter(Boolean).pop() || "admin";

  // =====================================================
  // DANH SÁCH MENU GỐC (CẤU HÌNH PHÂN QUYỀN)
  // =====================================================
  const rawMenuItems = [
    // DASHBOARD
    {
      key: "admin",
      icon: <Icon icon="solar:widget-2-linear" style={{ fontSize: "20px" }} />,
      label: "Dashboard",
      roles: Object.values(ROLES),
    },

    // TỔ CHỨC NHÀ TRƯỜNG
    {
      key: "organization-group",
      type: "group",
      label: "TỔ CHỨC NHÀ TRƯỜNG",
      children: [
        {
          key: "organization",
          icon: (
            <Icon
              icon="solar:buildings-2-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Tổ chức nhà trường",
          roles: [ROLES.ADMIN, ROLES.PRINCIPAL],
        },
        {
          key: "management",
          icon: (
            <Icon
              icon="solar:users-group-rounded-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Ban giám hiệu",
          roles: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL],
        },
        {
          key: "departments",
          icon: <Icon icon="solar:case-linear" style={{ fontSize: "20px" }} />,
          label: "Tổ chuyên môn",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.DEPARTMENT_HEAD,
            ROLES.TEACHER,
          ],
        },
        {
          key: "union",
          icon: (
            <Icon
              icon="solar:users-group-two-rounded-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Công đoàn cơ sở",
          roles: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.UNION_PRESIDENT],
        },
      ],
    },

    // HỘI ĐỒNG
    {
      key: "council-group",
      type: "group",
      label: "HỘI ĐỒNG",
      children: [
        {
          key: "schoolCouncil",
          icon: (
            <Icon icon="solar:buildings-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Hội đồng trường",
          roles: [ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.SCHOOL_COUNCIL],
        },
      ],
    },

    // NHÂN SỰ
    {
      key: "human-resource-group",
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
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.TEACHER,
          ],
        },
        {
          key: "parents",
          icon: (
            <Icon
              icon="solar:users-group-rounded-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Phụ huynh",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.TEACHER,
            ROLES.SCHOOL_COUNCIL,
          ],
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
          roles: [
            ROLES.ADMIN,
            ROLES.DEPARTMENT_HEAD,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.UNION_PRESIDENT,
            ROLES.SCHOOL_COUNCIL,
          ],
        },
        {
          key: "staffs",
          icon: (
            <Icon icon="solar:user-id-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Nhân viên",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.DEPARTMENT_HEAD,
            ROLES.OFFICE_STAFF,
            ROLES.UNION_PRESIDENT,
            ROLES.SCHOOL_COUNCIL,
          ],
        },
      ],
    },

    // ĐÀO TẠO
    {
      key: "training-group",
      type: "group",
      label: "ĐÀO TẠO",
      children: [
        {
          key: "classes",
          icon: (
            <Icon icon="solar:blackboard-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Lớp học",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.TEACHER,
            ROLES.STUDENT,
          ],
        },
        {
          key: "subjects",
          icon: (
            <Icon icon="solar:notebook-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Môn học",
          roles: Object.values(ROLES),
        },
        {
          key: "schedules",
          icon: (
            <Icon
              icon="solar:clipboard-list-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Thời khóa biểu / Phân công",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.TEACHER,
            ROLES.STUDENT,
          ],
        },
      ],
    },

    // NGHIỆP VỤ
    {
      key: "report-group",
      type: "group",
      label: "NGHIỆP VỤ",
      children: [
        {
          key: "attendance",
          icon: (
            <Icon icon="solar:user-speak-linear" style={{ fontSize: "20px" }} />
          ),
          label: "Điểm danh",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.TEACHER,
            ROLES.STUDENT,
            ROLES.PARENT,
          ],
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
          roles: Object.values(ROLES),
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
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.OFFICE_STAFF,
            ROLES.PARENT,
            ROLES.STUDENT,
          ],
        },
        {
          key: "rewards",
          icon: (
            <Icon
              icon="solar:medal-ribbons-star-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Thi đua - Khen thưởng",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.UNION_PRESIDENT,
            ROLES.TEACHER,
            ROLES.SCHOOL_COUNCIL,
          ],
        },
        {
          key: "discipline",
          icon: (
            <Icon
              icon="solar:danger-triangle-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Kỷ luật",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.TEACHER,
            ROLES.SCHOOL_COUNCIL,
          ],
        },
      ],
    },

    // ĐIỀU HÀNH
    {
      key: "operation-group",
      type: "group",
      label: "ĐIỀU HÀNH",
      children: [
        {
          key: "announcements",
          icon: <Icon icon="solar:bell-linear" style={{ fontSize: "20px" }} />,
          label: "Thông báo",
          roles: Object.values(ROLES),
        },
        {
          key: "documents",
          icon: (
            <Icon
              icon="solar:document-text-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Văn bản",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.TEACHER,
            ROLES.DEPARTMENT_HEAD,
            ROLES.OFFICE_STAFF,
            ROLES.UNION_PRESIDENT,
            ROLES.SCHOOL_COUNCIL,
          ],
        },
        {
          key: "meetings",
          icon: (
            <Icon
              icon="solar:calendar-mark-linear"
              style={{ fontSize: "20px" }}
            />
          ),
          label: "Cuộc họp",
          roles: [
            ROLES.ADMIN,
            ROLES.PRINCIPAL,
            ROLES.VICE_PRINCIPAL,
            ROLES.DEPARTMENT_HEAD,
            ROLES.TEACHER,
            ROLES.OFFICE_STAFF,
            ROLES.UNION_PRESIDENT,
            ROLES.SCHOOL_COUNCIL,
          ],
        },
      ],
    },
  ];

  // =====================================================
  // HÀM LỌC MENU THEO ROLE
  // =====================================================
  const authorizedMenuItems = useMemo(() => {
    if (!userRole) return [];

    return rawMenuItems
      .map((item) => {
        // Nếu là group menu, lọc bớt các children không có quyền
        if (item.type === "group" && item.children) {
          const filteredChildren = item.children.filter((child) =>
            child.roles?.includes(userRole),
          );

          // Nếu nhóm không còn item con nào thì ẩn luôn cả nhóm
          if (filteredChildren.length === 0) return null;

          return { ...item, children: filteredChildren };
        }

        // Nếu là single item, kiểm tra roles
        if (item.roles && item.roles.includes(userRole)) {
          return item;
        }

        return null;
      })
      .filter(Boolean);
  }, [userRole]);

  // =====================================================
  // KIỂM TRA QUYỀN TRUY CẬP TRỰC TIẾP QUA URL (ROUTE GUARD)
  // =====================================================
  const hasPermission = useMemo(() => {
    if (!userRole) return false;
    if (currentKey === "admin" || currentKey === "profile") return true;

    // Tìm item đang truy cập trong danh sách phẳng
    let targetItem = null;
    rawMenuItems.forEach((item) => {
      if (item.key === currentKey) targetItem = item;
      if (item.children) {
        const found = item.children.find((c) => c.key === currentKey);
        if (found) targetItem = found;
      }
    });

    if (!targetItem) return true; // Cho phép route tự xử lý 404 nếu route không tồn tại trong menu
    return targetItem.roles?.includes(userRole);
  }, [currentKey, userRole]);

  // Nếu người dùng gõ URL không có quyền -> Chuyển hướng
  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Handle click Menu
  const handleMenuClick = ({ key }) => {
    if (key === "admin") {
      navigate("/admin");
      return;
    }
    navigate(`/admin/${key}`);
  };

  return (
    <Layout
      style={{ minHeight: "100vh", height: "100vh", background: "#f8fafc" }}
    >
      <style>{`
        .custom-sider .ant-menu-item-selected {
          background-color: #eefafc !important;
          color: #37b0c3 !important;
        }
        .custom-sider .ant-menu-item-selected .anticon {
          color: #37b0c3 !important;
        }
        .custom-sider .ant-menu-item:hover {
          color: #37b0c3 !important;
        }
        .custom-sider .ant-menu-item:hover .anticon {
          color: #37b0c3 !important;
        }
        .menu-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .menu-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .menu-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .menu-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .menu-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .user-dropdown-box:hover {
          background-color: #f1f5f9;
        }
        .custom-sider .ant-menu-item .anticon {
          display: inline-flex;
          align-items: center;
        }
      `}</style>

      {/* SIDEBAR */}
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

        <div className="menu-scroll" style={styles.menuScroll}>
          <Menu
            mode="inline"
            selectedKeys={[currentKey]}
            items={authorizedMenuItems}
            onClick={handleMenuClick}
            style={styles.menu}
          />
        </div>
      </Sider>

      {/* MAIN LAYOUT */}
      <Layout style={{ minWidth: 0, height: "100vh", transition: "all 0.2s" }}>
        {/* HEADER */}
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

          {/* USER AREA */}
          <Space size={20}>
            <Button
              type="text"
              icon={
                <Icon
                  icon="solar:bell-bing-linear"
                  style={{ fontSize: "22px", color: "#64748b" }}
                />
              }
              style={styles.notificationBtn}
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
                    onClick: () => navigate("/admin/profile"),
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
                      {user?.role?.toUpperCase() || "GUEST"}
                    </Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* CONTENT */}
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
    height: "100vh",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "1px 0 8px rgba(0,0,0,0.02)",
    zIndex: 10,
    position: "relative",
    borderRight: "1px solid #e2e8f0",
  },
  logoContainer: {
    height: 70,
    minHeight: 70,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    gap: "12px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fff",
    position: "relative",
    zIndex: 2,
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
    whiteSpace: "nowrap",
  },
  menuScroll: {
    height: "calc(100vh - 70px)",
    maxHeight: "calc(100vh - 70px)",
    overflowY: "auto",
    overflowX: "hidden",
  },
  menu: {
    borderRight: 0,
    padding: "16px 12px",
    background: "#fff",
  },
  header: {
    padding: "0 24px",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: 70,
    minHeight: 70,
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
  notificationBtn: {
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    overflow: "auto",
    minWidth: 0,
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
