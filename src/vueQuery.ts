import type { QueryClientConfig } from "@tanstack/vue-query";

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Every failure is already a typed GithubError; retrying a 404 or 422 only delays the visible result.
      retry: false,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // "always" lets an offline request fail fast as a network error; refetchOnReconnect defaults off under that mode, so set it back on.
      networkMode: "always",
      refetchOnReconnect: true,
    },
  },
} satisfies QueryClientConfig;
