import axiosClient from "./axiosClient";

const classApi = {
  // list + pagination + search
  getAll(params) {
    return axiosClient.get("/classes", { params });
  },

  getById(id) {
    return axiosClient.get(`/classes/${id}`);
  },
  getByTeacherId(teacherId) {
    return axiosClient.get(`/classes/teacher/${teacherId}`);
  },

  create(data) {
    return axiosClient.post("/classes", data);
  },

  update(id, data) {
    return axiosClient.put(`/classes/${id}`, data);
  },

  remove(id) {
    return axiosClient.delete(`/classes/${id}`);
  },

  getStudents(id) {
    return axiosClient.get(`/classes/${id}/students`);
  },

  getTeachers() {
    return axiosClient.get("/classes/teachers/homeroom/list");
  },

  transferStudent(studentId, new_class_id) {
    return axiosClient.put(`/classes/transfer/student/${studentId}`, {
      new_class_id,
    });
  },

  getSummary() {
    return axiosClient.get("/classes/statistics/summary");
  },

  getDashboard() {
    return axiosClient.get("/classes/dashboard/class-overview");
  },
};

export default classApi;
