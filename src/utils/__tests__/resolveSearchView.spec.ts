import { describe, it, expect } from "vitest";
import { resolveSearchView, type SearchView } from "@/utils/resolveSearchView";
import type { GithubError } from "@/services/github/errors";
import type { GithubRepo } from "@/services/github/schemas";

const rows: GithubRepo[] = [];

const serverError: GithubError = { type: "server", status: 500 };
const rateLimitedError: GithubError = { type: "rate-limited", bucket: "search", resetAt: 0 };

type Case = {
  name: string;
  input: Parameters<typeof resolveSearchView>[0];
  expected: SearchView;
};

const cases: Case[] = [
  {
    name: "blank q returns idle regardless of other fields",
    input: { q: "  ", rows: undefined, totalCount: undefined, isStale: false, error: null, isBlocked: false },
    expected: { kind: "idle" },
  },
  {
    name: "rows present with a zero total returns empty",
    input: { q: "vue", rows: [], totalCount: 0, isStale: false, error: null, isBlocked: false },
    expected: { kind: "empty" },
  },
  {
    name: "rows present with a nonzero total and no error returns results",
    input: { q: "vue", rows, totalCount: 48213, isStale: false, error: null, isBlocked: false },
    expected: { kind: "results", stale: false, inlineError: null },
  },
  {
    name: "rows present with an error returns results carrying the inline error, not error",
    input: { q: "vue", rows, totalCount: 48213, isStale: false, error: serverError, isBlocked: false },
    expected: { kind: "results", stale: false, inlineError: serverError },
  },
  {
    name: "rows present with isStale true returns results with stale true",
    input: { q: "vue", rows, totalCount: 48213, isStale: true, error: null, isBlocked: false },
    expected: { kind: "results", stale: true, inlineError: null },
  },
  {
    name: "rows present with a retry in flight never returns loading",
    input: { q: "vue", rows, totalCount: 48213, isStale: false, error: null, isBlocked: false },
    expected: { kind: "results", stale: false, inlineError: null },
  },
  {
    name: "rows undefined with an error returns error",
    input: { q: "vue", rows: undefined, totalCount: undefined, isStale: false, error: serverError, isBlocked: false },
    expected: { kind: "error", error: serverError },
  },
  {
    name: "rows undefined with no error returns loading",
    input: { q: "vue", rows: undefined, totalCount: undefined, isStale: false, error: null, isBlocked: false },
    expected: { kind: "loading" },
  },
  {
    name: "blocked with no rows returns blocked",
    input: { q: "vue", rows: undefined, totalCount: undefined, isStale: false, error: null, isBlocked: true },
    expected: { kind: "blocked" },
  },
  {
    name: "blocked with rows returns results, rows outrank the block",
    input: { q: "vue", rows, totalCount: 48213, isStale: false, error: null, isBlocked: true },
    expected: { kind: "results", stale: false, inlineError: null },
  },
  {
    name: "blocked with no rows and a rate-limited error returns blocked, not error",
    input: { q: "vue", rows: undefined, totalCount: undefined, isStale: false, error: rateLimitedError, isBlocked: true },
    expected: { kind: "blocked" },
  },
  {
    name: "not blocked with no rows and a rate-limited error returns error",
    input: { q: "vue", rows: undefined, totalCount: undefined, isStale: false, error: rateLimitedError, isBlocked: false },
    expected: { kind: "error", error: rateLimitedError },
  },
];

describe("resolveSearchView", () => {
  it.each(cases)("$name", ({ input, expected }) => {
    expect(resolveSearchView(input)).toEqual(expected);
  });
});
