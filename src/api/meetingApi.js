import axiosClient from "./axiosClient";

const meetingApi = {
  getAll(params) {
    return axiosClient.get("/meetings", { params });
  },
  getById(id) {
    return axiosClient.get(`/meetings/${id}`);
  },
  getAvailableMembers() {
    return axiosClient.get("/meetings/members/available");
  },
  create(data) {
    return axiosClient.post("/meetings", data);
  },
  update(id, data) {
    return axiosClient.put(`/meetings/${id}`, data);
  },
  delete(id) {
    return axiosClient.delete(`/meetings/${id}`);
  },
  addMember(meetingId, data) {
    return axiosClient.post(`/meetings/${meetingId}/members`, data);
  },
  updateAttendance(memberRecordId, data) {
    return axiosClient.put(
      `/meetings/members/${memberRecordId}/attendance`,
      data,
    );
  },
  removeMember(memberRecordId) {
    return axiosClient.delete(`/meetings/members/${memberRecordId}`);
  },
  saveMinutes(meetingId, data) {
    return axiosClient.post(`/meetings/${meetingId}/minutes`, data);
  },
};

export default meetingApi;
