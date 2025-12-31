"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // exponential backoff for retries
            retry: (failureCount, error: any) => {
              // Don't retry on 404s or 401s (if desired, but typically we want to retry network errors)
              if (error?.response?.status === 404 || error?.response?.status === 401) {
                return false;
              }
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Default to 1 minute stale time to avoid immediate refetching
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
