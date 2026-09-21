<script setup lang="ts">
import { useSearchParams } from "@/composables/useSearchParams";
import type { RepoSearchSort } from "@/services/github/client";
import { useRepoSearch } from "@/composables/useRepoSearch";
import { useRateLimitStore } from "@/stores/rateLimit";
import { resolveSearchView } from "@/utils/resolveSearchView";
import { formatExactCount } from "@/utils/formatCount";
import { pluralize } from "@/utils/pluralize";
import { SEARCH_PER_PAGE, SEARCH_RESULT_CAP } from "@/services/github/client";

defineOptions({ name: "HomePage" });

const params = useSearchParams();
const search = useRepoSearch({ q: params.q, sort: params.sort, page: params.page });
const rateLimit = useRateLimitStore();

const resultsId = "search-results";
const exampleQueries = ["vue", "language:rust stars:>5000", "topic:accessibility"];

const resultsHeading = ref<HTMLElement | null>(null);
const announcement = ref("");
const focusPending = ref(false);

const view = computed(() =>
  resolveSearchView({
    q: params.q.value,
    rows: search.rows.value,
    totalCount: search.totalCount.value,
    isStale: search.isStale.value,
    error: search.error.value,
  })
);

const pageCount = computed(() => {
  const total = search.totalCount.value ?? 0;

  return Math.ceil(Math.min(total, SEARCH_RESULT_CAP) / SEARCH_PER_PAGE);
});

const statusHeading = computed(() => {
  const current = view.value;
  const q = params.q.value;
  const page = params.page.value;

  if (current.kind === "idle") {
    return "Try an example search";
  }

  if (current.kind === "loading") {
    return "Searching…";
  }

  if (current.kind === "empty") {
    return `No results for “${q}”`;
  }

  if (current.kind === "error") {
    return "Search failed";
  }

  if (current.stale) {
    if (current.inlineError !== null) {
      return `Couldn't load page ${page}. Showing page ${search.lastGoodPage.value ?? page}.`;
    }

    return `Loading page ${page}…`;
  }

  const total = search.totalCount.value ?? 0;

  return `${formatExactCount(total)} ${pluralize(total, "repository", "repositories")} for “${q}” · page ${page} of ${pageCount.value}`;
});

watch(search.totalCount, (n) => {
  if (n !== undefined) {
    params.clampPageTo(n);
  }
});

watch(statusHeading, (text) => {
  if (!focusPending.value) {
    announcement.value = text;
  }
});

function retry() {
  if (!rateLimit.isBlocked("search")) {
    search.refetch();
  }
}

async function focusResultsWhenSettled() {
  focusPending.value = true;

  await until(search.isFetching).toBe(false);

  resultsHeading.value?.focus();
  focusPending.value = false;
}

async function onSubmit(payload: { q: string; sort: RepoSearchSort | null }) {
  const navigated = await params.submit(payload);

  if (!navigated) {
    retry();
  }

  await focusResultsWhenSettled();
}

async function onPageChange(page: number) {
  await params.goToPage(page);
  await focusResultsWhenSettled();
}

useTitle(computed(() => (params.q.value ? `${params.q.value} · GitHub Repo Explorer` : "GitHub Repo Explorer")));
</script>

<template>
  <a class="visually-hidden" :href="`#${resultsId}`">Skip to results</a>

  <main class="search-page">
    <h1 tabindex="-1">GitHub Repo Explorer</h1>

    <section class="search-page__search" aria-label="Search">
      <RepoSearchForm :q="params.q.value" :sort="params.sort.value" :loading="search.isFetching.value" @submit="onSubmit" />
    </section>

    <section class="search-page__results" data-region="results">
      <h2 :id="resultsId" ref="resultsHeading" tabindex="-1">{{ statusHeading }}</h2>

      <AppErrorState v-if="view.kind === 'results' && view.inlineError" :error="view.inlineError" variant="inline" :banner-visible="false" @retry="retry" />
      <el-alert
        v-else-if="view.kind === 'results' && search.incompleteResults.value"
        type="info"
        role="none"
        show-icon
        :closable="false"
        title="GitHub timed out before finishing this search, so some matches may be missing. A narrower query usually fixes it."
      />

      <RepoList
        v-if="view.kind === 'loading' || view.kind === 'results'"
        :repos="search.rows.value ?? []"
        :loading="view.kind === 'loading'"
        :stale="view.kind === 'results' && view.stale"
      />
      <AppEmptyState v-else-if="view.kind === 'empty'" :query="params.q.value" />
      <AppErrorState v-else-if="view.kind === 'error'" :error="view.error" variant="page" :banner-visible="false" @retry="retry" />

      <RepoPagination
        v-if="view.kind === 'results'"
        :total-count="search.totalCount.value ?? 0"
        :current-page="params.page.value"
        @update:current-page="onPageChange"
      />

      <ul v-if="view.kind === 'idle'" class="search-page__examples" role="list">
        <li v-for="example in exampleQueries" :key="example">
          <RouterLink :to="{ path: '/', query: { q: example } }">{{ example }}</RouterLink>
        </li>
      </ul>

      <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.search-page__results {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-page__examples {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-family: var(--font-mono);
}
</style>
