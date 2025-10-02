"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { authStorage } from "@/lib/auth-storage";
import type { AuthResponse, User } from "@/types/auth";

interface Credentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => authStorage.getAccessToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authStorage.subscribe(({ user: storedUser, tokens }) => {
      if (storedUser !== undefined) {
        setUser(storedUser ?? null);
      }
      if (tokens?.access !== undefined) {
        setAccessToken(tokens.access ?? null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const sync = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await apiClient.get<User>("/auth/me/");
        setUser(data);
        authStorage.setUser(data);
      } catch (error) {
        console.warn("Failed to fetch current user", error);
        authStorage.clear();
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };
    void sync();
  }, [accessToken]);

  const login = useCallback(async ({ email, password }: Credentials) => {
    const { data } = await apiClient.post<AuthResponse>("/auth/token/", {
      email,
      password,
    });
    authStorage.setTokens({ access: data.access, refresh: data.refresh });
    authStorage.setUser(data.user);
    setAccessToken(data.access);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setAccessToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!accessToken) return;
    const { data } = await apiClient.get<User>("/auth/me/");
    setUser(data);
    authStorage.setUser(data);
  }, [accessToken]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      loading,
      login,
      logout,
      refreshUser,
    }),
    [user, accessToken, loading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

