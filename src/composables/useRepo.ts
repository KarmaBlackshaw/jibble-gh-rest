import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Ref } from "vue";

import { getRepo } from "@/services/github/client";
import type { GithubError } from "@/services/github/errors";
import type { GithubRepo } from "@/services/github/types";
import { useRateLimitStore } from "@/stores/rateLimit";

export function useRepo(params: { owner: Ref<string>; name: Ref<string> }): {
  data: Ref<GithubRepo | undefined>;
  error: Ref<GithubError | null>;
  isPending: Ref<boolean>;
  isFetching: Ref<boolean>;
  canonicalPath: Ref<string | null>;
  refetch: () => void;
} {
  const { owner, name } = params;
  const rateLimit = useRateLimitStore();
  const queryClient = useQueryClient();

  const { data, error, isPending, isFetching, refetch } = useQuery<GithubRepo, GithubError>({
    queryKey: ["repo", owner, name],
    queryFn: async ({ signal }) => {
      const repo = await getRepo(owner.value, name.value, signal);

      if (repo.owner.login !== owner.value || repo.name !== name.value) {
        queryClient.setQueryData(["repo", repo.owner.login, repo.name], repo);
      }

      return repo;
    },
    enabled: () => owner.value.length > 0 && name.value.length > 0 && !rateLimit.isBlocked("core"),
  });

  const canonicalPath = computed(() => {
    const repo = data.value;

    if (!repo) {
      return null;
    }

    const canonical = `${repo.owner.login}/${repo.name}`;
    const requested = `${owner.value}/${name.value}`;

    if (canonical.toLowerCase() === requested.toLowerCase()) {
      return null;
    }

    return `/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}`;
  });

  return {
    data,
    error,
    isPending,
    isFetching,
    canonicalPath,
    refetch,
  };
}
