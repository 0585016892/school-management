import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  // Nếu chưa đăng nhập chút nào -> Vẫn đẩy về login là hợp lý
  if (!user) return <Navigate to="/login" replace />;

  // Normalize role
  const userRole = (user.role || "").toLowerCase();

  // 🌟 ĐÃ SỬA: Nếu đã đăng nhập nhưng SAI QUYỀN -> Đẩy về trang 404
  if (role && userRole !== role.toLowerCase()) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default PrivateRoute;
