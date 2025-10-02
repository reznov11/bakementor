"use client";

import axios, { AxiosError, AxiosRequestConfig } from "axios";

import { authStorage } from "@/lib/auth-storage";
import type { AuthResponse } from "@/types/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: ((token: string | null) => void)[] = [];

const processQueue = (token: string | null, error: unknown) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
  if (error) {
    throw error;
  }
};

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) {
      authStorage.clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/v1/auth/token/refresh/`,
        { refresh: refreshToken },
      );
      authStorage.setTokens({ access: data.access, refresh: data.refresh ?? refreshToken });
      if (data.user) {
        authStorage.setUser(data.user);
      }
      processQueue(data.access, null);
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${data.access}`,
      };
      return apiClient(originalRequest);
    } catch (refreshError) {
      authStorage.clear();
      processQueue(null, refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const setAuthTokens = (tokens: AuthResponse) => {
  authStorage.setTokens(tokens);
  authStorage.setUser(tokens.user);
};

export const clearAuth = () => {
  authStorage.clear();
};
