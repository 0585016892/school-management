import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import authApi from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo và kiểm tra Token tồn tại khi F5 hoặc mở trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      const parsedUser = JSON.parse(userData);

      // An toàn bảo mật: Nếu User lưu ở máy local có trạng thái bị khóa, đá ra ngay lập tức
      if (parsedUser && Number(parsedUser.is_active) === 0) {
        localStorage.clear();
        setUser(null);
      } else {
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  // Hàm xử lý Đăng nhập tập trung trạng thái Core
  const login = async (values) => {
    try {
      const res = await authApi.login(values);

      // Kiểm tra dữ liệu an toàn để tránh crash ứng dụng nếu Backend lỗi cấu trúc
      if (!res || !res.user) {
        message.error("Cấu trúc phản hồi từ máy chủ không hợp lệ!");
        return null;
      }

      // ================= 1. KIỂM TRA TRẠNG THÁI HOẠT ĐỘNG (IS_ACTIVE) =================
      if (Number(res.user.is_active) === 0) {
        // Đảm bảo bộ nhớ máy local luôn sạch sẽ khi dính tài khoản bị khóa
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);

        // Trả về thẳng object user để Login.jsx bắt được điều kiện dừng luồng
        return res.user;
      }

      // ================= 2. GHI NHẬN TRẠNG THÁI NẾU HỢP LỆ =================
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);

      // Trả dữ liệu User ra ngoài cho component Login.jsx tự do điều phối giao diện
      return res.user;
    } catch (error) {
      // Đẩy lỗi ra ngoài để khối try-catch tại Login.jsx hiển thị thông báo chính xác
      throw error;
    }
  };

  // Hàm Đăng xuất hệ thống
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    message.success("Đã đăng xuất khỏi hệ thống.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
