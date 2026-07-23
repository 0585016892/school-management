import axiosClient from "./axiosClient";

const unionApi = {
  getAll() {
    return axiosClient.get("/unions");
  },

  getById(id) {
    return axiosClient.get(`/unions/${id}`);
  },

  create(data) {
    return axiosClient.post("/unions", data);
  },

  update(id, data) {
    return axiosClient.put(`/unions/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/unions/${id}`);
  },

  getAvailableMembers() {
    return axiosClient.get("/unions/available/members");
  },

  addMember(id, data) {
    return axiosClient.post(`/unions/${id}/members`, data);
  },

  removeMember(id, memberId) {
    return axiosClient.delete(`/unions/${id}/members/${memberId}`);
  },
};

export default unionApi;
