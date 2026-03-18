"use client";
import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      mutations: { onError: () => {} },
    },
  });
}

let browserQueryClient = undefined;

function getQueryClient() {
  // On the server, create a fresh client per request to avoid cross-request state.
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  // In the browser, reuse a single client instance.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function DevtoolsWrapper() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (process.env.NODE_ENV !== "development") return null;
  return mounted ? <ReactQueryDevtools initialIsOpen={false} /> : null;
}

export default function Provider({ children }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <DevtoolsWrapper />
    </QueryClientProvider>
  );
}