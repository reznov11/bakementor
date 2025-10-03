"use client";

import React, { createContext, useContext } from "react";

type Messages = Record<string, unknown>;

const I18nContext = createContext<{ locale: string; messages: Messages } | undefined>(undefined);

export function I18nProvider({ children, locale = "ru", messages = {} as Messages }: { children: React.ReactNode; locale?: string; messages?: Messages }) {
  return <I18nContext.Provider value={{ locale, messages }}>{children}</I18nContext.Provider>;
}

export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslations must be used within I18nProvider");
  }
  const { messages } = ctx;

  return function t(key: string, vars?: Record<string, string | number>): string {
    const parts = key.split(".");
    let node: unknown = messages;
    for (const part of parts) {
      if (!node || typeof node !== "object") return key;
      node = (node as Record<string, unknown>)[part];
    }
    let value = typeof node === "string" ? node : key;
    if (vars && typeof value === "string") {
      for (const k of Object.keys(vars)) {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(vars[k]));
      }
    }
    return value;
  };
}

export default I18nProvider;
