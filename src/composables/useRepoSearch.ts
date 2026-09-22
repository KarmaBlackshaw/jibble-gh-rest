import { useQuery } from "@tanstack/vue-query";
import type { Ref } from "vue";

import { searchRepositories, type RepoSearchSort } from "@/services/github/client";
import type { GithubError } from "@/services/github/errors";
import type { GithubRepo, GithubRepoSearchResponse } from "@/services/github/types";
import { useRateLimitStore } from "@/stores/rateLimit";

type LastGood = { searchKey: string; page: number; rows: GithubRepo[]; totalCount: number; incompleteResults: boolean };

export function useRepoSearch(params: { q: Readonly<Ref<string>>; sort: Readonly<Ref<RepoSearchSort | null>>; page: Readonly<Ref<number>> }) {
  const rateLimit = useRateLimitStore();

  const sortField = computed(() => params.sort.value?.field ?? null);
  const sortDir = computed(() => params.sort.value?.dir ?? null);

  const { data, error, isPending, isFetching, refetch } = useQuery<GithubRepoSearchResponse, GithubError>({
    queryKey: ["search", params.q, sortField, sortDir, params.page],
    queryFn: ({ signal }) => searchRepositories({ q: params.q.value.trim(), sort: params.sort.value, page: params.page.value }, signal),
    enabled: () => params.q.value.trim().length > 0 && !rateLimit.isBlocked("search"),
  });

  const searchKey = computed(() => JSON.stringify([params.q.value.trim(), sortField.value, sortDir.value]));
  const lastGood = shallowRef<LastGood | null>(null);

  watch(data, (value) => {
    if (value !== undefined) {
      lastGood.value = {
        searchKey: searchKey.value,
        page: params.page.value,
        rows: value.items,
        totalCount: value.total_count,
        incompleteResults: value.incomplete_results,
      };
    }
  });

  const held = computed(() => (lastGood.value?.searchKey === searchKey.value ? lastGood.value : null));

  const rows = computed(() => data.value?.items ?? held.value?.rows);
  const totalCount = computed(() => data.value?.total_count ?? held.value?.totalCount);
  const incompleteResults = computed(() => data.value?.incomplete_results ?? held.value?.incompleteResults ?? false);
  const isStale = computed(() => data.value === undefined && held.value !== null);
  const lastGoodPage = computed(() => (isStale.value ? held.value?.page : undefined));

  return {
    rows,
    totalCount,
    incompleteResults,
    isStale,
    lastGoodPage,
    error,
    isPending,
    isFetching,
    refetch,
  };
}
