import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";

/**
 * Component bảo vệ Route theo Role
 * @param {Array<string> | string} roles - 1 Role hoặc danh sách các ROLES được phép truy cập
 */
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null; // Hoặc trả về component <Spin /> / <Loading />

  // 1. Chưa đăng nhập -> Chuyển về /login (lưu lại route cũ để redirect lại sau)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lấy role của user hiện tại
  const userRole = (user.role || "").toLowerCase();

  // 2. Kiểm tra phân quyền nếu Route có khai báo props `roles`
  if (roles) {
    // Ép về mảng chữ thường để so sánh linh hoạt
    const allowedRoles = Array.isArray(roles)
      ? roles.map((r) => r.toLowerCase())
      : [roles.toLowerCase()];

    // ĐÃ ĐĂNG NHẬP NHƯNG SAI QUYỀN -> Đẩy về trang /404
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/404" replace />;
    }
  }

  // 3. Hợp lệ -> Cho phép render component con
  return children;
};

export default PrivateRoute;
