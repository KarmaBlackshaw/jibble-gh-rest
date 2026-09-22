import { describe, it, expect } from "vitest";
import { resolveDetailView } from "@/utils/resolveDetailView";
import type { DetailView } from "@/utils/resolveDetailView";
import type { GithubRepo } from "@/services/github/types";
import type { GithubError } from "@/services/github/errors";

const repoFixture: GithubRepo = {
  id: 1,
  full_name: "vuejs/core",
  name: "core",
  html_url: "https://github.com/vuejs/core",
  owner: { login: "vuejs", avatar_url: "https://avatars.githubusercontent.com/u/6128107?v=4", html_url: "https://github.com/vuejs" },
  description: "Vue 3 core",
  language: "TypeScript",
  homepage: "https://vuejs.org",
  license: { key: "mit", name: "MIT License", spdx_id: "MIT" },
  topics: ["vue"],
  stargazers_count: 1,
  forks_count: 1,
  open_issues_count: 1,
  subscribers_count: 1,
  archived: false,
  fork: false,
  private: false,
  created_at: "2013-07-29T03:24:51Z",
  updated_at: "2024-05-01T10:20:30Z",
  pushed_at: "2024-04-30T22:15:00Z",
};

const notFoundError: GithubError = { type: "not-found" };
const serverError: GithubError = { type: "server", status: 500 };
const rateLimitedError: GithubError = { type: "rate-limited", bucket: "core", resetAt: 0 };

describe("resolveDetailView", () => {
  const rows: { name: string; data: typeof repoFixture | undefined; error: GithubError | null; isBlocked: boolean; expected: DetailView }[] = [
    { name: "no data, no error, not blocked -> loading", data: undefined, error: null, isBlocked: false, expected: { kind: "loading" } },
    {
      name: "not-found error, not blocked -> error",
      data: undefined,
      error: notFoundError,
      isBlocked: false,
      expected: { kind: "error", error: notFoundError },
    },
    { name: "data outranks a server error", data: repoFixture, error: serverError, isBlocked: false, expected: { kind: "ready", repo: repoFixture } },
    {
      name: "rate-limited error, not blocked -> error",
      data: undefined,
      error: rateLimitedError,
      isBlocked: false,
      expected: { kind: "error", error: rateLimitedError },
    },
    {
      name: "blocked + data -> ready (data outranks the block)",
      data: repoFixture,
      error: null,
      isBlocked: true,
      expected: { kind: "ready", repo: repoFixture },
    },
    { name: "blocked + no data + an error -> blocked", data: undefined, error: serverError, isBlocked: true, expected: { kind: "blocked" } },
    { name: "blocked + no data + no error -> blocked", data: undefined, error: null, isBlocked: true, expected: { kind: "blocked" } },
    {
      name: "not blocked + no data + error -> error",
      data: undefined,
      error: notFoundError,
      isBlocked: false,
      expected: { kind: "error", error: notFoundError },
    },
  ];

  it.each(rows)("$name", ({ data, error, isBlocked, expected }) => {
    expect(resolveDetailView({ data, error, isBlocked })).toEqual(expected);
  });

  it("returns the same repo object identity for the ready case", () => {
    const result = resolveDetailView({ data: repoFixture, error: null, isBlocked: false });

    expect(result.kind).toBe("ready");
    expect(result.kind === "ready" && result.repo).toBe(repoFixture);
  });
});
