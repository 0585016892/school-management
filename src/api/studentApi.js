import axiosClient from "./axiosClient";

const studentApi = {
  getAll: (params) => {
    return axiosClient.get("/students", {
      params: params, // Axios sẽ tự động chuyển thành: /students?page=1&limit=10&search=...
    });
  },

  getById(id) {
    return axiosClient.get(`/students/${id}`);
  },

  create(data) {
    return axiosClient.post("/students", data);
  },

  update(id, data) {
    return axiosClient.put(`/students/${id}`, data);
  },

  remove(id) {
    return axiosClient.delete(`/students/${id}`);
  },

  transfer(id, class_id) {
    return axiosClient.put(`/students/transfer/${id}`, {
      class_id,
    });
  },

  getProfile(id) {
    return axiosClient.get(`/students/profile/${id}`);
  },

  getStatGender() {
    return axiosClient.get("/students/statistics/gender");
  },

  getStatClass() {
    return axiosClient.get("/students/statistics/class");
  },

  getDashboard() {
    return axiosClient.get("/students/dashboard/summary");
  },
  getByClass: (classId) => axiosClient.get(`/students/class/${classId}`),
};

export default studentApi;
