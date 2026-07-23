import axiosClient from "./axiosClient";

const disciplineApi = {
  getAll(params) {
    return axiosClient.get("/disciplines", { params });
  },
  getAvailableTargets() {
    return axiosClient.get("/disciplines/targets/available");
  },
  create(data) {
    return axiosClient.post("/disciplines", data);
  },
  update(id, data) {
    return axiosClient.put(`/disciplines/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/disciplines/${id}`);
  },
};

export default disciplineApi;
