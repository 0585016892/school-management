import axiosClient from "./axiosClient";

const parentApi = {
  getAll(params) {
    return axiosClient.get("/parents", { params });
  },

  getById(id) {
    return axiosClient.get(`/parents/${id}`);
  },

  create(data) {
    return axiosClient.post("/parents", data);
  },

  update(id, data) {
    return axiosClient.put(`/parents/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/parents/${id}`);
  },

  addStudent(id, data) {
    return axiosClient.post(`/parents/${id}/students`, data);
  },

  removeStudent(id, studentId) {
    return axiosClient.delete(`/parents/${id}/students/${studentId}`);
  },
};

export default parentApi;
