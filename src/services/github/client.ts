import axios, { CanceledError } from "axios";
import type { ZodType } from "zod";

import { useRateLimitStore, type RateLimitBucket } from "@/stores/rateLimit";
import { mapResponseToError, type GithubError } from "@/services/github/errors";
import { RepoSchema, RepoSearchResponseSchema, type GithubRepo, type GithubRepoSearchResponse } from "@/services/github/schemas";

export const REPO_SEARCH_SORT_FIELDS = ["stars", "forks", "updated"] as const;
export const REPO_SEARCH_SORT_DIRS = ["asc", "desc"] as const;

export type RepoSearchSortField = (typeof REPO_SEARCH_SORT_FIELDS)[number];
export type RepoSearchSortDir = (typeof REPO_SEARCH_SORT_DIRS)[number];
export type RepoSearchSort = { field: RepoSearchSortField; dir: RepoSearchSortDir };

export const SEARCH_PER_PAGE = 30;
export const SEARCH_RESULT_CAP = 1000;

interface SearchRepositoriesParams {
  q: string;
  sort: RepoSearchSort | null;
  page: number;
}

const REQUEST_TIMEOUT_MS = 10_000;

const http = axios.create({
  baseURL: "https://api.github.com",
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
  validateStatus: () => true,
});

const SEGMENT_PATTERN = /^[\w.-]+$/;

function isValidSegment(segment: string): boolean {
  return SEGMENT_PATTERN.test(segment) && segment !== "." && segment !== "..";
}

function bucketFrom(resource: string | null, fallback: RateLimitBucket): RateLimitBucket {
  if (resource === "search" || resource === "core") {
    return resource;
  }

  return fallback;
}

type QueryParams = Record<string, string | number>;

async function request<T>(url: string, endpointBucket: RateLimitBucket, schema: ZodType<T>, signal?: AbortSignal, params?: QueryParams): Promise<T> {
  const rateLimit = useRateLimitStore();

  let status: number;
  let body: unknown;
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

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.error("GitHub response failed validation", parsed.error.issues);
    }

    throw { type: "malformed" } satisfies GithubError;
  }

  return parsed.data;
}

export async function searchRepositories(params: SearchRepositoriesParams, signal?: AbortSignal): Promise<GithubRepoSearchResponse> {
  const query: QueryParams = { q: params.q, page: params.page, per_page: SEARCH_PER_PAGE };

  if (params.sort !== null) {
    query.sort = params.sort.field;
    query.order = params.sort.dir;
  }

  return request("/search/repositories", "search", RepoSearchResponseSchema, signal, query);
}

export async function getRepo(owner: string, name: string, signal?: AbortSignal): Promise<GithubRepo> {
  if (!isValidSegment(owner) || !isValidSegment(name)) {
    throw { type: "not-found" } satisfies GithubError;
  }

  const url = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;

  return request(url, "core", RepoSchema, signal);
}
