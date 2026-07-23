import axiosClient from "./axiosClient";

const rewardApi = {
  getAll(params) {
    return axiosClient.get("/rewards", { params });
  },
  getAvailableTargets() {
    return axiosClient.get("/rewards/targets/available");
  },
  create(data) {
    return axiosClient.post("/rewards", data);
  },
  update(id, data) {
    return axiosClient.put(`/rewards/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/rewards/${id}`);
  },
};

export default rewardApi;
