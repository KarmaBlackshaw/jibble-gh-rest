import { useQuery } from "@tanstack/vue-query";
import type { Ref } from "vue";

import { searchRepositories, type RepoSearchSort } from "@/services/github/client";
import type { GithubError } from "@/services/github/errors";
import type { GithubRepo, GithubRepoSearchResponse } from "@/services/github/schemas";
import { useRateLimitStore } from "@/stores/rateLimit";

type LastGood = { searchKey: string; page: number; rows: GithubRepo[]; totalCount: number; incompleteResults: boolean };

export function useRepoSearch(params: { q: Readonly<Ref<string>>; sort: Readonly<Ref<RepoSearchSort | null>>; page: Readonly<Ref<number>> }) {
  const rateLimit = useRateLimitStore();

  const sortField = computed(() => params.sort.value?.field ?? null);
  const sortDir = computed(() => params.sort.value?.dir ?? null);

  const query = useQuery<GithubRepoSearchResponse, GithubError>({
    queryKey: ["search", params.q, sortField, sortDir, params.page],
    queryFn: ({ signal }) => searchRepositories({ q: params.q.value.trim(), sort: params.sort.value, page: params.page.value }, signal),
    enabled: () => params.q.value.trim().length > 0 && !rateLimit.isSearchBlocked,
  });

  const searchKey = computed(() => JSON.stringify([params.q.value.trim(), sortField.value, sortDir.value]));
  const lastGood = shallowRef<LastGood | null>(null);

  watch(query.data, (value) => {
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

  const rows = computed(() => query.data.value?.items ?? held.value?.rows);
  const totalCount = computed(() => query.data.value?.total_count ?? held.value?.totalCount);
  const incompleteResults = computed(() => query.data.value?.incomplete_results ?? held.value?.incompleteResults ?? false);
  const isStale = computed(() => query.data.value === undefined && held.value !== null);
  const lastGoodPage = computed(() => (isStale.value ? held.value?.page : undefined));

  function refetch() {
    query.refetch();
  }

  return {
    rows,
    totalCount,
    incompleteResults,
    isStale,
    lastGoodPage,
    error: query.error,
    isPending: query.isPending,
    isFetching: query.isFetching,
    refetch,
  };
}
