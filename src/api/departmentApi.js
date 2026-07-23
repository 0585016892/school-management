import axiosClient from "./axiosClient";

const departmentApi = {
  // =====================================================
  // LẤY DANH SÁCH TỔ CHUYÊN MÔN
  // GET /api/departments
  // =====================================================
  getAll: async (params = {}) => {
    const response = await axiosClient.get("/departments", {
      params,
    });

    return response.data?.data || response.data || [];
  },

  // =====================================================
  // LẤY CHI TIẾT TỔ
  // GET /api/departments/:id
  // =====================================================
  getById: async (id) => {
    const response = await axiosClient.get(`/departments/${id}`);

    return response.data?.data || response.data;
  },

  // =====================================================
  // TẠO TỔ
  // POST /api/departments
  // =====================================================
  create: async (data) => {
    const response = await axiosClient.post("/departments", data);

    return response.data;
  },

  // =====================================================
  // CẬP NHẬT TỔ
  // PUT /api/departments/:id
  // =====================================================
  update: async (id, data) => {
    const response = await axiosClient.put(`/departments/${id}`, data);

    return response.data;
  },

  // =====================================================
  // XÓA TỔ
  // DELETE /api/departments/:id
  // =====================================================
  delete: async (id) => {
    const response = await axiosClient.delete(`/departments/${id}`);

    return response.data;
  },

  // =====================================================
  // THÊM THÀNH VIÊN
  // POST /api/departments/:id/members
  // =====================================================
  addMember: async (departmentId, data) => {
    const response = await axiosClient.post(
      `/departments/${departmentId}/members`,
      data,
    );

    return response.data;
  },

  // =====================================================
  // XÓA THÀNH VIÊN
  // DELETE /api/departments/:departmentId/members/:memberId
  // =====================================================
  removeMember: async (departmentId, memberId) => {
    const response = await axiosClient.delete(
      `/departments/${departmentId}/members/${memberId}`,
    );

    return response.data;
  },

  // =====================================================
  // LẤY DANH SÁCH GIÁO VIÊN / NHÂN VIÊN CÓ THỂ THÊM
  // GET /api/departments/members/available
  // =====================================================
  getAvailableMembers: async () => {
    const response = await axiosClient.get("/departments/members/available");

    return response.data?.data || response.data || [];
  },
};

export default departmentApi;
