import axios from "axios";
import { STORAGE_KEYS } from "../utils/constants";

const resolveApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) {
      return "http://localhost:5001/api/";
    }
  }
  return "https://test.api.volt.az/api/";
};

const axiosInstance = axios.create({
  // baseURL: "https://api.volt.az/api/",
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ REQUEST: token + language avtomatik
axiosInstance.interceptors.request.use((config) => {
  const lang = localStorage.getItem("lang") || "en";
  const token = sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)?.replace(/"/g, "");

  config.headers["Accept-Language"] = lang;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ RESPONSE: 401 → login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
