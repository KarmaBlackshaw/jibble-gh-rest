import axios, { CanceledError } from "axios";

import { useRateLimitStore, type RateLimitBucket } from "@/stores/rateLimit";
import { mapResponseToError, type GithubError } from "@/services/github/errors";

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

function bucketFrom(resource: string | null, fallback: RateLimitBucket): RateLimitBucket {
  if (resource === "search" || resource === "core") {
    return resource;
  }

  return fallback;
}

export async function request<T>(url: string, endpointBucket: RateLimitBucket, signal?: AbortSignal, params?: QueryParams): Promise<T> {
  const rateLimit = useRateLimitStore();

  let status: number;
  let body: T;
  const headers = new Headers();

  try {
    const res = await http.get(url, { signal, params });

    status = res.status;
    body = res.data;

    Object.entries(res.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers.set(key, value);
      }
    });
  } catch (error) {
    if (signal?.aborted || error instanceof CanceledError) {
      throw { type: "aborted" } satisfies GithubError;
    }

    throw { type: "network" } satisfies GithubError;
  }

  const response = new Response(null, { status, headers });
  const bucket = bucketFrom(headers.get("x-ratelimit-resource"), endpointBucket);

  rateLimit.recordHeaders(bucket, headers, response.ok);

  if (!response.ok) {
    const error = mapResponseToError(response, bucket, body);

    if (error.type === "secondary-rate-limited") {
      rateLimit.recordRetryAfter(error.retryAfterSeconds);
    }

    throw error;
  }

  return body;
}
