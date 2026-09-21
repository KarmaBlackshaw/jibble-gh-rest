import { z } from "zod";

const OwnerSchema = z.object({
  login: z.string(),
  avatar_url: z.httpUrl(),
  html_url: z.httpUrl(),
});

const LicenseSchema = z.object({
  key: z.string(),
  name: z.string(),
  spdx_id: z.string().nullable(),
});

export const RepoSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  name: z.string(),
  html_url: z.httpUrl(),
  owner: OwnerSchema,
  description: z.string().nullable(),
  language: z.string().nullable(),
  homepage: z.string().nullable(),
  license: LicenseSchema.nullable(),
  topics: z.array(z.string()).default([]),
  stargazers_count: z.number(),
  forks_count: z.number(),
  open_issues_count: z.number(),
  subscribers_count: z.number().optional(),
  archived: z.boolean(),
  fork: z.boolean(),
  private: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
});

export const RepoSearchResponseSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(z.unknown()).transform((raw) =>
    raw.flatMap((item) => {
      const result = RepoSchema.safeParse(item);

      if (result.success) {
        return [result.data];
      }

      if (import.meta.env.DEV) {
        console.warn("Dropped a search result that failed validation", result.error.issues);
      }

      return [];
    })
  ),
});

export const GithubErrorBodySchema = z.object({
  message: z.string(),
  documentation_url: z.string().nullable().optional(),
  errors: z.array(z.object({ message: z.string().optional() })).optional(),
});

export type GithubRepo = z.infer<typeof RepoSchema>;
export type GithubRepoSearchResponse = z.infer<typeof RepoSearchResponseSchema>;
