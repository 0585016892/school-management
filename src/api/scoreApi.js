import axiosClient from "./axiosClient";

export const scoreApi = {
  /* =========================================================
     📊 GET BẢNG ĐIỂM THEO LỚP (EXCEL VIEW)
  ========================================================= */
  getByClass: (classId, subjectId, semester) =>
    axiosClient.get(
      `/scores/class/${classId}?subject_id=${subjectId}&semester=${semester}`,
    ),

  /* =========================================================
     📊 GET ALL SCORES (RAW)
  ========================================================= */
  getAll: () => axiosClient.get("/scores"),

  /* =========================================================
     📊 GET BY STUDENT
  ========================================================= */
  getByStudent: (studentId) => axiosClient.get(`/scores/student/${studentId}`),

  /* =========================================================
     📊 SINGLE CREATE
  ========================================================= */
  create: (data) => axiosClient.post("/scores", data),

  /* =========================================================
     📊 BULK UPSERT (EXCEL SAVE)
  ========================================================= */
  bulkCreate: (data) => axiosClient.post("/scores/bulk", data),

  /* =========================================================
     📊 UPDATE SINGLE
  ========================================================= */
  update: (id, data) => axiosClient.put(`/scores/${id}`, data),

  /* =========================================================
     📊 DELETE
  ========================================================= */
  remove: (id) => axiosClient.delete(`/scores/${id}`),

  /* =========================================================
     📈 AVERAGE BY SUBJECT
  ========================================================= */
  getStudentAverage: (studentId) =>
    axiosClient.get(`/scores/student/${studentId}/average`),

  /* =========================================================
     📊 RANKING
  ========================================================= */
  getStudentRanking: (studentId) =>
    axiosClient.get(`/scores/student/${studentId}/ranking`),

  /* =========================================================
     📊 DASHBOARD
  ========================================================= */
  getDashboard: () => axiosClient.get("/scores/statistics/dashboard"),
};
