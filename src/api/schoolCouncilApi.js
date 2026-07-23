import axiosClient from "./axiosClient";

const schoolCouncilApi = {
  getAll() {
    return axiosClient.get("/school-councils");
  },

  getById(id) {
    return axiosClient.get(`/school-councils/${id}`);
  },

  create(data) {
    return axiosClient.post("/school-councils", data);
  },

  update(id, data) {
    return axiosClient.put(`/school-councils/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/school-councils/${id}`);
  },

  getAvailableMembers() {
    return axiosClient.get("/school-councils/members/available");
  },

  addMember(id, data) {
    return axiosClient.post(`/school-councils/${id}/members`, data);
  },

  removeMember(id, memberId) {
    return axiosClient.delete(`/school-councils/${id}/members/${memberId}`);
  },
};

export default schoolCouncilApi;
