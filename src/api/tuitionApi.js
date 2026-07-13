import axiosClient from "./axiosClient";

export const tuitionApi = {
  // 1. GET: Lấy danh sách học phí (Có phân trang + Tìm kiếm)
  getAll: (params) => {
    return axiosClient.get("/tuition", { params });
  },

  // 2. GET: Chi tiết 1 khoản học phí của học sinh
  getById: (id) => {
    return axiosClient.get(`/tuition/${id}`);
  },

  // 3. POST: Tạo đợt thu học phí mới
  create: (data) => {
    return axiosClient.post("/tuition", data);
  },

  // 4. PUT: Cập nhật thông tin khoản học phí
  update: (id, data) => {
    return axiosClient.put(`/tuition/${id}`, data);
  },

  // 5. DELETE: Xóa khoản học phí
  remove: (id) => {
    return axiosClient.delete(`/tuition/${id}`);
  },

  // 6. POST: Tiến hành nộp tiền học phí (Ghi nhận giao dịch)
  executePayment: (data) => {
    return axiosClient.post("/tuition/payment", data);
  },

  // 7. GET: Lấy lịch sử tất cả các đợt đóng tiền của 1 mã học phí
  getPaymentHistory: (tuitionId) => {
    return axiosClient.get(`/tuition/payments/${tuitionId}`);
  },

  // 8. GET: Lấy số liệu thống kê Dashboard tổng quan (Dự kiến, Đã thu, Còn nợ)
  getDashboardSummary: () => {
    return axiosClient.get("/tuition/dashboard/summary");
  },

  // 9. GET: Lấy danh sách học sinh còn nợ tiền học
  getDebtStatistics: () => {
    return axiosClient.get("/tuition/statistics/debt");
  },

  // 10. GET: Lấy danh sách học sinh đóng phí xuất sắc / nhiều nhất
  getTopPaidStatistics: () => {
    return axiosClient.get("/tuition/statistics/top-paid");
  },

  // 11. GET: Lấy doanh thu học phí theo tháng (Biểu đồ)
  getMonthlyStatistics: () => {
    return axiosClient.get("/tuition/statistics/monthly");
  },

  // 12. GET: Lấy danh sách học sinh kèm lớp đổ vào ô Select trên Form tạo mới
  getFormStudents: () => {
    return axiosClient.get("/tuition/form/students");
  },
  getTuitionStudents: (studentId) => {
    return axiosClient.get(`/tuition/student/${studentId}`);
  },
};
