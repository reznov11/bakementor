"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo, useState } from "react";

import { AuthProvider } from "@/providers/auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());
  const memoizedChildren = useMemo(() => children, [children]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{memoizedChildren}</AuthProvider>
    </QueryClientProvider>
  );
}

