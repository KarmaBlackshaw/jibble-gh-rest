import type { RateLimitBucket } from "@/stores/rateLimit";

export const REPO_SEARCH_SORT_FIELDS = ["stars", "forks", "updated"] as const;
export const REPO_SEARCH_SORT_DIRS = ["asc", "desc"] as const;

export const SEARCH_PER_PAGE = 30;
export const SEARCH_RESULT_CAP = 1000;

export interface GithubOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GithubLicense {
  key: string;
  name: string;
  spdx_id: string | null;
}

export interface GithubRepo {
  id: number;
  full_name: string;
  name: string;
  html_url: string;
  owner: GithubOwner;
  description: string | null;
  language: string | null;
  homepage: string | null;
  license: GithubLicense | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count?: number;
  archived: boolean;
  fork: boolean;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GithubRepoSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepo[];
}

export interface GithubErrorBody {
  message: string;
  documentation_url?: string | null;
  errors?: { message?: string }[];
}

export type GithubError =
  | { type: "network" }
  | { type: "aborted" }
  | { type: "invalid-query"; message: string }
  | { type: "not-found" }
  | { type: "forbidden" }
  | { type: "rate-limited"; bucket: RateLimitBucket; resetAt: number }
  | { type: "secondary-rate-limited"; retryAfterSeconds: number }
  | { type: "server"; status: number }
  | { type: "unknown"; status: number };

export type RepoSearchSortField = (typeof REPO_SEARCH_SORT_FIELDS)[number];
export type RepoSearchSortDir = (typeof REPO_SEARCH_SORT_DIRS)[number];
export type RepoSearchSort = { field: RepoSearchSortField; dir: RepoSearchSortDir };

export interface SearchRepositoriesParams {
  q: string;
  sort: RepoSearchSort | null;
  page: number;
}
