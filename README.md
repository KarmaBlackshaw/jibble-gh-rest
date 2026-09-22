# GitHub Repo Explorer

Search GitHub repositories and drill into any repo's details, built against the GitHub REST API. Handles rate limiting, empty/error states, and deep-linkable search from URL params.

## Features

- **Repo search** — query GitHub with sortable results (stars, forks, last updated) and pagination.
- **Repo detail** — per-repo header, stats, and metadata at `/repos/:owner/:name`.
- **URL-driven state** — search query, sort, and page live in the URL, so results are shareable and survive a refresh.
- **Rate-limit aware** — reads GitHub's rate-limit headers, tracks the `search`/`core` buckets in a store, and shows a banner with a countdown when you're throttled.
- **Runtime-validated responses** — every API payload is parsed with [zod](https://zod.dev) schemas, so malformed responses fail loudly instead of leaking `undefined` into the UI.
- **First-class states** — dedicated empty, error, and loading UI rather than blank screens.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Vue 3.5 (`<script setup>`, reactive props destructure) |
| Language | TypeScript (strict) |
| State | Pinia |
| Data fetching | TanStack Vue Query |
| Validation | zod |
| Routing | unplugin-vue-router (file-based) |
| UI kit | Element Plus |
| Build | Vite 6 |
| Tests | Vitest + @vue/test-utils |

Components and composables are auto-imported (`unplugin-vue-components`, `unplugin-auto-import`); routes are generated from the `src/pages/` tree.

## Getting started

Requires **Node ≥ 22**.

```bash
npm install
npm run dev
```

The app talks to the public GitHub REST API (`https://api.github.com`) — no token needed, but unauthenticated requests share a low rate limit, which is why the rate-limit banner exists.

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build + type-check |
| `npm run preview` | Preview the production build |
| `npm run type-check` | `vue-tsc` type-check only |
| `npm run lint` | ESLint (zero warnings allowed) |
| `npm run lint:fix` | ESLint with autofix |
| `npm run test:unit` | Run the Vitest suite |

## Project layout

```
src/
  components/        # App/* primitives, Repo/* feature components, RateLimit/Banner
  composables/       # useRepo, useRepoSearch, useSearchParams
  pages/             # file-based routes (index, repos/[owner]/[name], catch-all)
  services/github/   # REST client, error mapping, zod schemas
  stores/            # Pinia — rate-limit tracking
  utils/             # formatters + view resolvers (unit-tested)
```

## Testing

Pure logic — count/countdown formatting, pluralization, external-URL safety, and the search/detail view resolvers — is covered by unit tests under `src/utils/__tests__/`.

```bash
npm run test:unit
```

## AI-assisted development

This project was built end to end with AI assistance (Claude / Claude Code). AI was used across the whole process — not just autocomplete:

- **Architecture & scaffolding** — component/composable/service boundaries, the file-based routing setup, and the store design.
- **Implementation** — writing components, the GitHub REST client, zod schemas, and the rate-limit handling.
- **Refactoring** — e.g. moving props to Vue 3.5 reactive destructure over `withDefaults`, extracting shared helpers, and tightening types (no `any`, no casts).
- **Tests** — the Vitest specs for the utility layer.
- **Review & docs** — code review passes and this README.

All AI-generated code was reviewed before landing. Treat it as authored-with-AI, not machine-dumped: the same standards (DRY, KISS, SOLID, type safety) were applied throughout.
