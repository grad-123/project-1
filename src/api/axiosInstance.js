import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://corny-unevacuated-willy.ngrok-free.dev/api/v1/",
});


axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const accessToken = localStorage.getItem("token");


        const response = await axios.post(
          "https://corny-unevacuated-willy.ngrok-free.dev/api/v1/Authentication/RefreshToken",
          {
            refreshToken: refreshToken,
            accessToken: accessToken,
          }
        );

        const newAccessToken = response.data.data.accessToken;

        localStorage.setItem("token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.clear();
        window.location.replace("/auth/login");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;