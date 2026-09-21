import type { GithubError } from "@/services/github/errors";
import type { GithubRepo } from "@/services/github/schemas";

export type SearchView =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "results"; stale: boolean; inlineError: GithubError | null }
  | { kind: "error"; error: GithubError };

export function resolveSearchView(input: {
  q: string;
  rows: GithubRepo[] | undefined;
  totalCount: number | undefined;
  isStale: boolean;
  error: GithubError | null;
}): SearchView {
  if (input.q.trim() === "") {
    return { kind: "idle" };
  }

  if (input.rows !== undefined) {
    if (input.totalCount === 0) {
      return { kind: "empty" };
    }

    return { kind: "results", stale: input.isStale, inlineError: input.error };
  }

  if (input.error !== null) {
    return { kind: "error", error: input.error };
  }

  return { kind: "loading" };
}
