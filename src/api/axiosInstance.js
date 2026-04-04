import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL:"https://corny-unevacuated-willy.ngrok-free.dev" 
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

// ✅ دالة تحديد是否需要 توكن - المبسطة
const requiresAuth = (url, method) => {
  if (!url) return false;
  
  // مسارات المصادقة - لا تحتاج توكن أبداً
  if (url.includes('/api/v1/Authentication/')) return false;
  if (url.includes('/RefreshToken')) return false;
  
  // طرق POST, PUT, DELETE التي تعدل بيانات - تحتاج توكن دائماً
  if (method === 'post' || method === 'put' || method === 'delete') {
    return true;
  }
  
  // طرق GET - لا نمنعها أبداً، لكننا سنحاول إضافة توكن إذا وجد
  return false;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // لا نريد إضافة أي شيء لطلبات الـ RefreshToken أبداً
    if (config.url?.includes("/RefreshToken")) {
      return config;
    }

    let token = localStorage.getItem("token");
    
    // التحقق إذا كان هذا الطلب يتطلب توكن (POST/PUT/DELETE فقط)
    const needsAuth = requiresAuth(config.url, config.method?.toLowerCase());
    
    // إذا كان الطلب يتطلب توكن ولا يوجد توكن، نرفضه فوراً
    if (needsAuth && !token) {
      return Promise.reject({
        response: { status: 401, data: { message: "Authentication required" } }
      });
    }
    
    // إذا كان الطلب لا يحتاج توكن (GET بشكل عام)
    if (!needsAuth) {
      // نحاول إضافة التوكن إذا كان موجوداً ولم ينته صلاحيته
      if (token && !isTokenExpiredFast()) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // إضافة الهيدرز العامة
      const language = localStorage.getItem("lang") || "ar";
      config.headers["Accept-Language"] = language === "ar" ? "ar-EG" : "en-US";
      config.headers["ngrok-skip-browser-warning"] = "true";
      return config;
    }
    
    // --- من هنا فصاعداً، الكود خاص بالطلبات POST/PUT/DELETE فقط ---
    
    // التحقق من صلاحية التوكن وتجديده إذا لزم الأمر
    if (token && isTokenExpiredFast()) {
      try {
        token = await refreshTokenRequest();
      } catch (error) {
        clearTokens();
        return Promise.reject(error);
      }
    }
    
    // إضافة التوكن إلى الهيدر
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // إضافة الهيدرز العامة
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
    
    // نتأكد أن هذا الطلب كان يحتاج توكن أصلاً قبل محاولة إعادة المحاولة
    const needsAuth = requiresAuth(originalRequest.url, originalRequest.method?.toLowerCase());
    
    if (needsAuth && error.response?.status === 401 && !originalRequest._retry) {
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