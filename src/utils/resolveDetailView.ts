import type { GithubError } from "@/services/github/errors";
import type { GithubRepo } from "@/services/github/schemas";

export type DetailView = { kind: "ready"; repo: GithubRepo } | { kind: "error"; error: GithubError } | { kind: "loading" };

export function resolveDetailView(input: { data: GithubRepo | undefined; error: GithubError | null }): DetailView {
  if (input.data !== undefined) {
    return { kind: "ready", repo: input.data };
  }

  if (input.error !== null) {
    return { kind: "error", error: input.error };
  }

  return { kind: "loading" };
}
