import axiosClient from "./axiosClient";

const scheduleApi = {
  // Danh sách
  getAll(params) {
    return axiosClient.get("/schedules", { params });
  },

  // Chi tiết
  getById(id) {
    return axiosClient.get(`/schedules/${id}`);
  },
  getByTeacherId(teacherId) {
    return axiosClient.get(`/schedules/teacher/${teacherId}`);
  },
  getByStudentId(studentId) {
    return axiosClient.get(`/schedules/student/${studentId}`);
  },
  // Form data
  getFormData() {
    return axiosClient.get("/schedules/form-data");
  },

  // Thêm
  create(data) {
    return axiosClient.post("/schedules", data);
  },

  // Sửa
  update(id, data) {
    return axiosClient.put(`/schedules/${id}`, data);
  },

  // Xóa
  remove(id) {
    return axiosClient.delete(`/schedules/${id}`);
  },
};

export default scheduleApi;
