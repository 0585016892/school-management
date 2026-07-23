import api from "./axiosClient";

const staffApi = {
  // =====================================================
  // GET ALL STAFF
  // GET /api/staff
  // =====================================================
  getAll: async (params = {}) => {
    const response = await api.get("/staff", {
      params,
    });

    return response.data;
  },

  // =====================================================
  // GET STAFF DETAIL
  // GET /api/staff/:id
  // =====================================================
  getById: async (id) => {
    const response = await api.get(`/staff/${id}`);

    return response.data;
  },

  // =====================================================
  // GET STATISTICS
  // GET /api/staff/statistics/summary
  // =====================================================
  getStatistics: async () => {
    const response = await api.get("/staff/statistics/summary");

    return response.data;
  },

  // =====================================================
  // CREATE
  // POST /api/staff
  // =====================================================
  create: async (data) => {
    const response = await api.post("/staff", data);

    return response.data;
  },

  // =====================================================
  // UPDATE
  // PUT /api/staff/:id
  // =====================================================
  update: async (id, data) => {
    const response = await api.put(`/staff/${id}`, data);

    return response.data;
  },

  // =====================================================
  // UPDATE STATUS
  // PATCH /api/staff/:id/status
  // =====================================================
  updateStatus: async (id, status) => {
    const response = await api.patch(`/staff/${id}/status`, {
      status,
    });

    return response.data;
  },

  // =====================================================
  // DELETE
  // DELETE /api/staff/:id
  // =====================================================
  delete: async (id) => {
    const response = await api.delete(`/staff/${id}`);

    return response.data;
  },
};

export default staffApi;
