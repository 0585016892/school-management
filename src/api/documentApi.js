import axiosClient from "./axiosClient";

const documentApi = {
  getAll(params) {
    return axiosClient.get("/documents", { params });
  },
  getById(id) {
    return axiosClient.get(`/documents/${id}`);
  },
  create(data) {
    return axiosClient.post("/documents", data);
  },
  update(id, data) {
    return axiosClient.put(`/documents/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/documents/${id}`);
  },
};

export default documentApi;
