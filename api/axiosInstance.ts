import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AUTH_EXPIRED_EVENT, STORAGE_KEYS } from "../utils/constants";

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

const apiBaseUrl = resolveApiBaseUrl();
const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RefreshPayload = {
  accessToken: string;
  user?: any;
};

type PublicAwareInternalConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
  skipAuth?: boolean;
};

let refreshPromise: Promise<RefreshPayload | null> | null = null;
let authExpiryNotified = false;

const getStoredToken = () =>
  sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)?.replace(/"/g, "") || null;

const clearStoredAuth = () => {
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
  sessionStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  localStorage.removeItem("volt_current_user");
};

const notifyAuthExpired = () => {
  if (typeof window === "undefined" || authExpiryNotified) return;

  authExpiryNotified = true;
  clearStoredAuth();
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, {
    detail: { reason: "refresh-failed" },
  }));
};

const decodeExpiry = (token: string | null) => {
  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const payload = JSON.parse(atob(paddedPayload));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const refreshAccessToken = async (): Promise<RefreshPayload | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshClient
    .post("Auth/refresh", {})
    .then((response) => {
      const payload = response.data?.data;
      if (!payload?.accessToken) return null;

      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, payload.accessToken);
      authExpiryNotified = false;
      return payload as RefreshPayload;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  const result = await refreshPromise;
  if (!result) notifyAuthExpired();
  return result;
};

const isAuthEndpoint = (url?: string) =>
  Boolean(url && /\/(?:AdminAuth|CustomerAuth|Auth)\//i.test(url));

const setBearerHeader = (config: InternalAxiosRequestConfig, token: string | null) => {
  if (!token) return;
  config.headers.Authorization = `Bearer ${token}`;
};

axiosInstance.interceptors.request.use(async (config) => {
  const requestConfig = config as PublicAwareInternalConfig;
  const lang = localStorage.getItem("lang") || "en";
  let token = getStoredToken();

  config.headers["Accept-Language"] = lang;

  if (requestConfig.skipAuth) {
    delete config.headers.Authorization;
    return config;
  }

  if (token && !isAuthEndpoint(config.url)) {
    const expiresAt = decodeExpiry(token);
    if (expiresAt !== null && expiresAt - Date.now() <= 60_000) {
      const refreshed = await refreshAccessToken();
      token = refreshed?.accessToken || token;
    }
  }

  setBearerHeader(config, token);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as PublicAwareInternalConfig | undefined;
    const token = getStoredToken();
    const isUnauthorized = error.response?.status === 401;

    if (config?.skipAuth) {
      return Promise.reject(error);
    }

    if (isUnauthorized && token && config && !config._authRetry && !isAuthEndpoint(config.url)) {
      const refreshed = await refreshAccessToken();
      if (refreshed?.accessToken) {
        config._authRetry = true;
        setBearerHeader(config, refreshed.accessToken);
        return axiosInstance(config);
      }
    }

    if (isUnauthorized && !isAuthEndpoint(config?.url)) {
      notifyAuthExpired();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
