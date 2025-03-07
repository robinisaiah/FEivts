import axios from "axios";
import { User } from "../interfaces/User";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies (for refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

interface RefreshTokenResponse {
  accessToken: string;
}

// **Intercept Request: Attach Token Automatically**
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (!config.headers) {
      config.headers = {}; // ✅ Ensure headers object exists
    }
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// **Intercept Response: Auto Refresh Token on 401**
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // const newAccessToken = refreshResponse.data.accessToken;
        const data = refreshResponse.data as RefreshTokenResponse;
        localStorage.setItem("accessToken", data.accessToken);

        // **Retry original request with new token**
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default api;
