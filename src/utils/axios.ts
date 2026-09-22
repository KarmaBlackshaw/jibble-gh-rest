import axios, { CanceledError, type AxiosResponse } from "axios";

import { useRateLimitStore, type RateLimitBucket } from "@/stores/rateLimit";
import { mapResponseToError } from "@/services/github/errors";
import type { GithubError } from "@/types/github";

declare module "axios" {
  interface AxiosRequestConfig {
    bucket?: RateLimitBucket;
  }
}

const http = axios.create({
  baseURL: "https://api.github.com",
  timeout: 10_000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
  validateStatus: () => true,
});

export type QueryParams = Record<string, string | number>;

function toHeaders(raw: AxiosResponse["headers"]): Headers {
  const headers = new Headers();

  Object.entries(raw).forEach(([key, value]) => {
    if (typeof value === "string") {
      headers.set(key, value);
    }
  });

  return headers;
}

function bucketFrom(resource: string | null, fallback: RateLimitBucket): RateLimitBucket {
  return resource === "search" || resource === "core" ? resource : fallback;
}

http.interceptors.response.use(
  (res) => {
    const rateLimit = useRateLimitStore();
    const headers = toHeaders(res.headers);
    const response = new Response(null, { status: res.status, headers });
    // ponytail: "core" only guards a direct http.* call that skips request(); every call today passes bucket
    const bucket = bucketFrom(headers.get("x-ratelimit-resource"), res.config.bucket ?? "core");

    rateLimit.recordHeaders(bucket, headers, response.ok);

    if (response.ok) {
      return res;
    }

    const error = mapResponseToError(response, bucket, res.data);

    if (error.type === "secondary-rate-limited") {
      rateLimit.recordRetryAfter(error.retryAfterSeconds);
    }

    throw error;
  },
  (error: unknown) => {
    if (error instanceof CanceledError) {
      throw { type: "aborted" } satisfies GithubError;
    }

    throw { type: "network" } satisfies GithubError;
  }
);

export async function request<T>(url: string, bucket: RateLimitBucket, signal?: AbortSignal, params?: QueryParams): Promise<T> {
  const res = await http.get<T>(url, { signal, params, bucket });

  return res.data;
}
