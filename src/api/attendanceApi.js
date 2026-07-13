import axiosClient from "./axiosClient";

export const attendanceApi = {
  // ================= GET ALL (FILTER + PAGINATION) =================
  getAll: (params) => axiosClient.get("/attendance", { params }),
  // params: { page, limit, search, class_id, date, teacher_id }

  // ================= GET BY ID =================
  getById: (id) => axiosClient.get(`/attendance/${id}`),

  // ================= GET STUDENTS BY CLASS =================
  getStudentsByClass: (classId) =>
    axiosClient.get(`/attendance/class/${classId}/students`),
  getStudentsByClassTeacher: (classId, teacherId) =>
    axiosClient.get(`/attendance/teacher/${teacherId}/class/${classId}`),

  // ================= CREATE SINGLE ATTENDANCE =================
  create: (data) => axiosClient.post("/attendance", data),
  /**
   * data:
   * {
   *   student_id,
   *   class_id,
   *   attendance_date,
   *   status, // present | late | absent | excused
   *   note,
   *   teacher_id
   * }
   */

  // ================= BULK ATTENDANCE (EXCEL STYLE) =================
  bulk: (data) => axiosClient.post("/attendance/bulk", data),

  /**
   * data:
   * {
   *   class_id,
   *   attendance_date,
   *   teacher_id,
   *   students: [
   *     {
   *       student_id,
   *       status,
   *       note
   *     }
   *   ]
   * }
   */

  // ================= UPDATE =================
  update: (id, data) => axiosClient.put(`/attendance/${id}`, data),

  // ================= DELETE =================
  remove: (id) => axiosClient.delete(`/attendance/${id}`),

  // ================= STATISTICS =================
  getSummary: () => axiosClient.get("/attendance/statistics/summary"),
};
