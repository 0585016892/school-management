import axiosClient from "./axiosClient";

// ====================== SUBJECT CRUD ======================
export const subjectApi = {
  getAll: () => {
    return axiosClient.get("/subjects");
  },

  getById: (id) => {
    return axiosClient.get(`/subjects/${id}`);
  },

  create: (data) => {
    return axiosClient.post("/subjects", data);
  },

  update: (id, data) => {
    return axiosClient.put(`/subjects/${id}`, data);
  },

  remove: (id) => {
    return axiosClient.delete(`/subjects/${id}`);
  },

  // ====================== TEACHER ======================
  assignTeacher: (data) => {
    return axiosClient.post("/subjects/assign-teacher", data);
  },

  getTeachers: (subjectId) => {
    return axiosClient.get(`/subjects/teachers/${subjectId}`);
  },

  // ====================== STUDENTS ======================
  getStudents: (subjectId) => {
    return axiosClient.get(`/subjects/students/${subjectId}`);
  },

  // ====================== STATISTICS ======================
  getTopSubjects: () => {
    return axiosClient.get("/subjects/statistics/top-subjects");
  },

  getSubjectScore: () => {
    return axiosClient.get("/subjects/statistics/subject-score");
  },

  getDashboardSummary: () => {
    return axiosClient.get("/subjects/dashboard/summary");
  },

  // ====================== FORM DATA ======================
  getFormData: () => {
    return axiosClient.get("/subjects/form/data");
  },
};
