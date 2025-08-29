import axios from "axios";

// API base URLs
const AUTH_API = "http://localhost:4000";
const POSTS_API = "http://localhost:3001";

// Create axios instances
const authApi = axios.create({
  baseURL: AUTH_API,
  headers: {
    "Content-Type": "application/json",
  },
});

const postsApi = axios.create({
  baseURL: POSTS_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
postsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
postsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await authApi.post("/token", {
          token: refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return postsApi(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (username) => {
    const response = await authApi.post("/login", { username });
    return response.data;
  },

  logout: async (refreshToken) => {
    await authApi.delete("/logout", { data: { token: refreshToken } });
  },

  refreshToken: async (refreshToken) => {
    const response = await authApi.post("/token", { token: refreshToken });
    return response.data;
  },
};

// Posts API functions
export const postsAPI = {
  getPosts: async () => {
    const response = await postsApi.get("/posts");
    return response.data;
  },
};

export default { authAPI, postsAPI };
