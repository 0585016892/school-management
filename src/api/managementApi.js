import axiosClient from "./axiosClient";

const managementApi = {
  getDashboard: async () => {
    const response = await axiosClient.get("/management/dashboard");

    return response || {};
  },
};

export default managementApi;
