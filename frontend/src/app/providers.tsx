"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";

import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import MediaLibraryModal from "@/components/media/MediaLibraryModal";
import I18nProvider from "@/i18n/provider";

interface ProvidersProps {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, unknown>;
}

export function Providers({ children, locale = "ru", messages = {} }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const memoizedChildren = useMemo(() => children, [children]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider locale={locale} messages={messages}>
          <AuthProvider>
            {memoizedChildren}
            <MediaLibraryModal />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
