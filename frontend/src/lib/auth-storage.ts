"use client";

import type { AuthTokens, User } from "@/types/auth";

const ACCESS_TOKEN_KEY = "bakementor.accessToken";
const REFRESH_TOKEN_KEY = "bakementor.refreshToken";
const USER_KEY = "bakementor.user";

type Subscriber = (payload: { user?: User | null; tokens?: Partial<AuthTokens> | null }) => void;

const subscribers = new Set<Subscriber>();

const isBrowser = (): boolean => typeof window !== "undefined";

const getItem = <T>(key: string): T | null => {
  if (!isBrowser()) return null;
  const value = window.localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse stored value", error);
    return null;
  }
};

const setItem = (key: string, value: unknown): void => {
  if (!isBrowser()) return;
  if (value === null || value === undefined) {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

export const authStorage = {
  getAccessToken(): string | null {
    return getItem<string>(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return getItem<string>(REFRESH_TOKEN_KEY);
  },
  getUser(): User | null {
    return getItem<User>(USER_KEY);
  },
  setTokens(tokens: AuthTokens): void {
    setItem(ACCESS_TOKEN_KEY, tokens.access);
    setItem(REFRESH_TOKEN_KEY, tokens.refresh);
    notify({ tokens });
  },
  setUser(user: User | null): void {
    setItem(USER_KEY, user);
    notify({ user });
  },
  clear(): void {
    setItem(ACCESS_TOKEN_KEY, null);
    setItem(REFRESH_TOKEN_KEY, null);
    setItem(USER_KEY, null);
    notify({ user: null, tokens: null });
  },
  subscribe(callback: Subscriber): () => void {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
};

function notify(payload: { user?: User | null; tokens?: Partial<AuthTokens> | null }) {
  subscribers.forEach((callback) => callback(payload));
}

