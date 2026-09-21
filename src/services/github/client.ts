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

const BASE_URL = "https://api.github.com";

const REQUEST_TIMEOUT_MS = 10_000;

const HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

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

async function request<T>(url: string, endpointBucket: RateLimitBucket, schema: ZodType<T>, signal?: AbortSignal): Promise<T> {
  const rateLimit = useRateLimitStore();

  const combined = AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

  let response: Response;

  try {
    response = await fetch(url, { headers: HEADERS, signal: combined });
  } catch {
    if (signal?.aborted) {
      throw { type: "aborted" } satisfies GithubError;
    }

    throw { type: "network" } satisfies GithubError;
  }

  const bucket = bucketFrom(response.headers.get("x-ratelimit-resource"), endpointBucket);

  rateLimit.recordHeaders(bucket, response.headers, response.ok);

  let body: unknown;

  try {
    body = await response.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      body = undefined;
    } else if (signal?.aborted) {
      throw { type: "aborted" } satisfies GithubError;
    } else {
      throw { type: "network" } satisfies GithubError;
    }
  }

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
  const search = new URLSearchParams({ q: params.q, page: String(params.page), per_page: String(SEARCH_PER_PAGE) });

  if (params.sort !== null) {
    search.set("sort", params.sort.field);
    search.set("order", params.sort.dir);
  }

  return request(`${BASE_URL}/search/repositories?${search.toString()}`, "search", RepoSearchResponseSchema, signal);
}

export async function getRepo(owner: string, name: string, signal?: AbortSignal): Promise<GithubRepo> {
  if (!isValidSegment(owner) || !isValidSegment(name)) {
    throw { type: "not-found" } satisfies GithubError;
  }

  const url = `${BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;

  return request(url, "core", RepoSchema, signal);
}
