import axiosClient from "./axiosClient";

const organizationApi = {
  // =====================================================
  // LẤY DANH SÁCH TỔ CHỨC
  // GET /api/organizations
  // =====================================================
  getAll: async () => {
    const response = await axiosClient.get("/organizations");
    return response.data;
  },

  // =====================================================
  // LẤY CÂY TỔ CHỨC
  // GET /api/organizations/tree
  // =====================================================
  getTree: async () => {
    const response = await axiosClient.get("/organizations/tree");
    return response.data;
  },

  // =====================================================
  // LẤY THỐNG KÊ
  // GET /api/organizations/statistics
  // =====================================================
  getStatistics: async () => {
    const response = await axiosClient.get("/organizations/statistics");
    return response.data;
  },

  // =====================================================
  // LẤY CHI TIẾT TỔ CHỨC
  // GET /api/organizations/:id
  // =====================================================
  getById: async (id) => {
    const response = await axiosClient.get(`/organizations/${id}`);
    return response.data;
  },

  // =====================================================
  // THÊM TỔ CHỨC
  // POST /api/organizations
  // =====================================================
  create: async (data) => {
    const response = await axiosClient.post("/organizations", data);
    return response.data;
  },

  // =====================================================
  // CẬP NHẬT TỔ CHỨC
  // PUT /api/organizations/:id
  // =====================================================
  update: async (id, data) => {
    const response = await axiosClient.put(`/organizations/${id}`, data);

    return response.data;
  },

  // =====================================================
  // XÓA TỔ CHỨC
  // DELETE /api/organizations/:id
  // =====================================================
  delete: async (id) => {
    const response = await axiosClient.delete(`/organizations/${id}`);

    return response.data;
  },

  // =====================================================
  // LẤY DANH SÁCH THÀNH VIÊN
  // GET /api/organizations/:id/members
  // =====================================================
  getMembers: async (id) => {
    const response = await axiosClient.get(`/organizations/${id}/members`);

    return response.data;
  },

  // =====================================================
  // THÊM THÀNH VIÊN VÀO TỔ CHỨC
  // POST /api/organizations/:id/members
  // =====================================================
  addMember: async (id, data) => {
    const response = await axiosClient.post(
      `/organizations/${id}/members`,
      data,
    );

    return response.data;
  },

  // =====================================================
  // XÓA THÀNH VIÊN KHỎI TỔ CHỨC
  // DELETE /api/organizations/:id/members/:memberId
  // =====================================================
  removeMember: async (id, memberId) => {
    const response = await axiosClient.delete(
      `/organizations/${id}/members/${memberId}`,
    );

    return response.data;
  },
};

export default organizationApi;
