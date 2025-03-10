// utils/axiosInstance.ts
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Replace with your API URL

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // ✅ Send cookies with requests
  });

interface RefreshTokenResponse {
    accessToken: string;
  }

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers = config.headers || {}; // Ensure headers exist
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post<RefreshTokenResponse>(`${API_BASE_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
        const data = await response.data;
        const newAccessToken = data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired. Logging out.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // window.location.href = "/login"; // Redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default api;
