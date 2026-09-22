import { request, type QueryParams } from "@/utils/axios";
import type { GithubError } from "@/services/github/errors";
import type { GithubRepo, GithubRepoSearchResponse } from "@/services/github/types";

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

const SEGMENT_PATTERN = /^[\w.-]+$/;

function isValidSegment(segment: string): boolean {
  return SEGMENT_PATTERN.test(segment) && segment !== "." && segment !== "..";
}

export async function searchRepositories(params: SearchRepositoriesParams, signal?: AbortSignal): Promise<GithubRepoSearchResponse> {
  const query: QueryParams = { q: params.q, page: params.page, per_page: SEARCH_PER_PAGE };

  if (params.sort !== null) {
    query.sort = params.sort.field;
    query.order = params.sort.dir;
  }

  return request<GithubRepoSearchResponse>("/search/repositories", "search", signal, query);
}

export async function getRepo(owner: string, name: string, signal?: AbortSignal): Promise<GithubRepo> {
  if (!isValidSegment(owner) || !isValidSegment(name)) {
    throw { type: "not-found" } satisfies GithubError;
  }

  const url = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;

  return request<GithubRepo>(url, "core", signal);
}
