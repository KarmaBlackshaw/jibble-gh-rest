import { request, type QueryParams } from "@/utils/axios";
import { SEARCH_PER_PAGE } from "@/types/github";
import type { GithubError, GithubRepo, GithubRepoSearchResponse, SearchRepositoriesParams } from "@/types/github";

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
