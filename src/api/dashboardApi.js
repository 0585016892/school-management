import axiosClient from "./axiosClient";

const dashboardApi = {
  getSummary() {
    return axiosClient.get("/dashboard");
  },
};

export default dashboardApi;
