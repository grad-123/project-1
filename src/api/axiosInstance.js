// axiosInstance.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: "https://verdict-prevent-very.ngrok-free.dev" 
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

const requiresAuth = (url, method) => {
  if (!url) return false;
  
  if (url.includes('/api/v1/Authentication/')) return false;
  if (url.includes('/RefreshToken')) return false;
  
  if (method === 'post' || method === 'put' || method === 'delete') {
    return true;
  }
  
  return false;
};

// ✅ Request interceptor - مع إضافة تسجيل لطلبات AI
axiosInstance.interceptors.request.use(
  async (config) => {
    // لا نتدخل في طلبات RefreshToken أبداً
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
    
    // ✅ مهم: لا نعدل headers إذا كان responseType هو blob
    const isBlobRequest = config.responseType === 'blob';
    
    if (!needsAuth && !isBlobRequest) {
      if (token && !isTokenExpiredFast()) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      const language = localStorage.getItem("lang") || "ar";
      config.headers["Accept-Language"] = language === "ar" ? "ar-EG" : "en-US";
      config.headers["ngrok-skip-browser-warning"] = "true";
      
      // ✅ تسجيل طلبات AI
      if (config.url && (config.url.includes("/Ask") || config.url.includes("/Summary"))) {
        console.log("🚀 REQUEST:", {
          method: config.method,
          url: config.url,
          data: config.data,
          headers: { ...config.headers, Authorization: "Bearer [HIDDEN]" }
        });
      }
      
      return config;
    }
    
    // معالجة الطلبات التي تحتاج توكن (POST/PUT/DELETE) أو طلبات التحميل (blob)
    if (token && isTokenExpiredFast()) {
      try {
        token = await refreshTokenRequest();
      } catch (error) {
        clearTokens();
        return Promise.reject(error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ لطلبات التحميل (blob)، نحتاج headers محددة
    if (isBlobRequest) {
      config.headers['Accept'] = '*/*';
      config.headers['ngrok-skip-browser-warning'] = '69420';
    }

    const language = localStorage.getItem("lang") || "ar";
    config.headers["Accept-Language"] = language === "ar" ? "ar-EG" : "en-US";
    
    // ✅ نضيف ngrok header فقط إذا لم يكن موجوداً مسبقاً
    if (!config.headers['ngrok-skip-browser-warning']) {
      config.headers['ngrok-skip-browser-warning'] = "true";
    }
    
    // ✅ تسجيل طلبات AI
    if (config.url && (config.url.includes("/Ask") || config.url.includes("/Summary"))) {
      console.log("🚀 REQUEST (with auth):", {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: { ...config.headers, Authorization: "Bearer [HIDDEN]" }
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - مع إضافة تسجيل لردود AI
axiosInstance.interceptors.response.use(
  (response) => {
    // تسجيل ردود AI
    if (response.config.url && (response.config.url.includes("/Ask") || response.config.url.includes("/Summary"))) {
      console.log("✅ RESPONSE:", {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // تسجيل أخطاء AI
    if (error.config?.url && (error.config.url.includes("/Ask") || error.config.url.includes("/Summary"))) {
      console.error("❌ ERROR RESPONSE:", {
        url: error.config.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    const originalRequest = error.config || {};
    
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