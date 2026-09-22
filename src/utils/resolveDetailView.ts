import type { GithubError, GithubRepo } from "@/types/github";

export type DetailView = { kind: "ready"; repo: GithubRepo } | { kind: "blocked" } | { kind: "error"; error: GithubError } | { kind: "loading" };

export function resolveDetailView(input: { data: GithubRepo | undefined; error: GithubError | null; isBlocked: boolean }): DetailView {
  if (input.data !== undefined) {
    return { kind: "ready", repo: input.data };
  }

  if (input.isBlocked) {
    return { kind: "blocked" };
  }

  if (input.error !== null) {
    return { kind: "error", error: input.error };
  }

  return { kind: "loading" };
}
