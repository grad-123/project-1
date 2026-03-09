import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ozie-unneedful-freely.ngrok-free.dev",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const language = localStorage.getItem("lang") || "ar";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Accept-Language"] = language === "ar" ? "ar-EG" : "en-US";
    config.headers["ngrok-skip-browser-warning"] = "true";
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const accessToken = localStorage.getItem("token");

        const response = await axios.post(
          "https://corny-unevacuated-willy.ngrok-free.dev/api/v1/Authentication/RefreshToken",
          {
            refreshToken: refreshToken,
            accessToken: accessToken,
          },
        );

        const newAccessToken = response.data.data.accessToken;

        localStorage.setItem("token", newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
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
  },
);

export default axiosInstance;
