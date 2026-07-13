import axiosClient from "./axiosClient";

const authApi = {
  // Đăng nhập
  login(data) {
    return axiosClient.post("/auth/login", data);
  },

  // Đăng ký tài khoản mới
  register(data) {
    return axiosClient.post("/auth/register", data);
  },

  // Lấy thông tin user hiện tại (Profile)
  me() {
    return axiosClient.get("/auth/me");
  },

  // Đổi mật khẩu cá nhân
  changePassword(data) {
    return axiosClient.put("/auth/change-password", data);
  },

  // Admin: Reset mật khẩu của một user về mặc định (123456)
  resetPassword(id) {
    return axiosClient.put(`/auth/reset-password/${id}`);
  },

  // Admin: Lấy danh sách tất cả người dùng
  getUsers() {
    return axiosClient.get("/auth/users");
  },

  // Admin: Khóa tài khoản user
  lockUser(id) {
    return axiosClient.put(`/auth/lock/${id}`);
  },

  // Admin: Mở khóa tài khoản user
  unlockUser(id) {
    return axiosClient.put(`/auth/unlock/${id}`);
  },
  forgotPassword(email) {
    return axiosClient.post("/auth/forgot-password", { email });
  },
};

export default authApi;
