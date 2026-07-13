import axiosClient from "./axiosClient";

const teacherApi = {
  getAll(params) {
    return axiosClient.get("/teachers", {
      params,
    });
  },

  getById(id) {
    return axiosClient.get(`/teachers/${id}`);
  },

  create(data) {
    return axiosClient.post("/teachers", data);
  },

  update(id, data) {
    return axiosClient.put(`/teachers/${id}`, data);
  },

  remove(id) {
    return axiosClient.delete(`/teachers/${id}`);
  },

  getProfile(id) {
    return axiosClient.get(`/teachers/profile/${id}`);
  },

  getSubjects(id) {
    return axiosClient.get(`/teachers/${id}/subjects`);
  },

  getClasses(id) {
    return axiosClient.get(`/teachers/${id}/classes`);
  },

  getSchedules(id) {
    return axiosClient.get(`/teachers/${id}/schedules`);
  },

  getDashboard() {
    return axiosClient.get("/teachers/dashboard/summary");
  },

  getStatisticsBySubject() {
    return axiosClient.get("/teachers/statistics/by-subject");
  },

  getTopTeachers() {
    return axiosClient.get("/teachers/statistics/top-teachers");
  },

  getFormData() {
    return axiosClient.get("/teachers/form/data");
  },
};

export default teacherApi;
