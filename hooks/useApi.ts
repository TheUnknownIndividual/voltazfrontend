import { useState, useCallback } from "react";
import { AxiosRequestConfig } from "axios";
import axiosInstance from "../api/axiosInstance";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const request = useCallback(
    async (
      method: AxiosRequestConfig["method"],
      endpoint: string,
      data?: any,
      config: AxiosRequestConfig = {}
    ) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await axiosInstance({
          url: endpoint,
          method,
          data,
          ...config,
        });

        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (error: any) {
  const message =
    error?.response?.data?.error?.details ||
    error?.response?.data?.message ||
    error?.message ||
    "An error occurred";

  setState({
    data: null,
    loading: false,
    error: message,
  });

  throw error;
}
    },
    []
  );

  return {
    ...state,
    get: (url: string, config?: AxiosRequestConfig) =>
      request("GET", url, undefined, config),
    post: (url: string, data?: any, config?: AxiosRequestConfig) =>
      request("POST", url, data, config),
    put: (url: string, data?: any, config?: AxiosRequestConfig) =>
      request("PUT", url, data, config),
    patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
      request("PATCH", url, data, config),
    del: (url: string, config?: AxiosRequestConfig) =>
      request("DELETE", url, undefined, config),
  };
}

export default useApi;
