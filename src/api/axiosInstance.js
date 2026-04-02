import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: "https://corny-unevacuated-willy.ngrok-free.dev",
});

let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const setTokenWithExpiry = (token) => {
  try {
    const decoded = jwtDecode(token);
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiry", decoded.exp * 1000);
  } catch (error) {
    localStorage.setItem("token", token);
  }
};

const isTokenExpiredFast = () => {
  const expiry = localStorage.getItem("tokenExpiry");
  return !expiry || Date.now() > parseInt(expiry) - 5000;
};

// ✅ تم إزالة الـ try/catch غير الضروري
const refreshTokenRequest = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axiosInstance.post(
    "/api/v1/Authentication/RefreshToken",
    {
      refreshToken: refreshToken,
    }
  );

  if (!response.data?.succeeded) {
    throw new Error(response.data?.message || "Refresh failed");
  }

  const newAccessToken = response.data.data.accessToken;
  
  let newRefreshToken = null;
  if (response.data.data.refreshToken?.tokenString) {
    newRefreshToken = response.data.data.refreshToken.tokenString;
  } else if (response.data.data.refreshToken?.token) {
    newRefreshToken = response.data.data.refreshToken.token;
  } else if (typeof response.data.data.refreshToken === "string") {
    newRefreshToken = response.data.data.refreshToken;
  }

  setTokenWithExpiry(newAccessToken);
  if (newRefreshToken) {
    localStorage.setItem("refreshToken", newRefreshToken);
  }

  return newAccessToken;
};

const clearTokens = () => {
  refreshAttempts = 0;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenExpiry");
  localStorage.removeItem("role");
};

// ✅ دالة ذكية لتحديد إذا كان المسار يحتاج توكن
const requiresAuth = (url, method) => {
  if (!url) return false;
  
  // مسارات المصادقة - لا تحتاج توكن أبداً
  if (url.includes('/api/v1/Authentication/')) return false;
  if (url.includes('/RefreshToken')) return false;
  
  // طرق GET لجلب البيانات - لا تحتاج توكن (عامة)
  if (method === 'get' && (
    url.includes('/Get') || 
    url.includes('/Download') ||
    url.includes('/Browse') ||
    url.includes('/Course') ||
    url.includes('/Category')
  )) return false;
  
  // الكلمات المفتاحية التي تدل على حاجة توكن
  const authKeywords = ['Favorite', 'Upload', 'Profile', 'ChangePassword', 'Create', 'Update', 'Delete', 'Add', 'Remove'];
  if (authKeywords.some(keyword => url.includes(keyword))) {
    return true;
  }
  
  // طرق POST, PUT, DELETE التي تعدل بيانات - تحتاج توكن
  if (method === 'post' || method === 'put' || method === 'delete') {
    return true;
  }
  
  return false;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("/RefreshToken")) {
      return config;
    }

    let token = localStorage.getItem("token");
    
    const needsAuth = requiresAuth(config.url, config.method?.toLowerCase());
    
    if (needsAuth && !token) {
      return Promise.reject({
        response: { status: 401, data: { message: "Authentication required" } }
      });
    }
    
    if (token && isTokenExpiredFast()) {
      try {
        token = await refreshTokenRequest();
      } catch (error) {
        clearTokens();
        if (needsAuth) {
          return Promise.reject(error);
        }
        token = null;
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language = localStorage.getItem("lang") || "ar";
    config.headers["Accept-Language"] = language === "ar" ? "ar-EG" : "en-US";
    config.headers["ngrok-skip-browser-warning"] = "true";
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    
    if (originalRequest._retryCount >= MAX_REFRESH_ATTEMPTS) {
      clearTokens();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      isRefreshing = true;

      try {
        const newToken = await refreshTokenRequest();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        refreshAttempts++;
        if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
          clearTokens();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;