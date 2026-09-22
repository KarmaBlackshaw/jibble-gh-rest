<script setup lang="ts">
import { useRepo } from "@/composables/useRepo";
import { useRateLimitStore } from "@/stores/rateLimit";
import { resolveDetailView } from "@/utils/resolveDetailView";

defineOptions({ name: "RepoDetailPage" });

const route = useRoute("/repos/[owner]/[name]");
const router = useRouter();
const owner = computed(() => route.params.owner);
const name = computed(() => route.params.name);
const rateLimit = useRateLimitStore();

const { data, error, canonicalPath, refetch } = useRepo({ owner, name });

const isCoreBlocked = computed(() => rateLimit.isBlocked("core"));
const limitError = computed(() => error.value?.type === "rate-limited" || error.value?.type === "secondary-rate-limited");
const blocked = computed(() => isCoreBlocked.value || limitError.value);

const view = computed(() => resolveDetailView({ data: data.value, error: error.value, isBlocked: blocked.value }));

const heading = computed(() => {
  if (view.value.kind === "ready") {
    return view.value.repo.full_name;
  }

  if (view.value.kind === "error") {
    return `Couldn't load ${owner.value}/${name.value}`;
  }

  return `${owner.value}/${name.value}`;
});

useTitle(computed(() => `${heading.value} · GitHub Repo Explorer`));

const back: unknown = window.history.state?.back;
const backTo = typeof back === "string" && (back === "/" || back.startsWith("/?")) ? back : "/";

watch(canonicalPath, (path) => {
  if (path) {
    router.replace(path);
  }
});

function retry() {
  if (!rateLimit.isBlocked("core")) {
    refetch();
  }
}
</script>

<template>
  <main class="repo-detail">
    <RouterLink :to="backTo"><span aria-hidden="true">← </span>Back to search</RouterLink>

    <RateLimitBanner bucket="core" />

    <section data-region="repo" class="repo-detail__region">
      <h1 tabindex="-1" :class="{ 'repo-detail__heading--mono': view.kind !== 'error' }">{{ heading }}</h1>

      <div v-if="view.kind === 'loading'" aria-busy="true">
        <el-skeleton :rows="3" animated />
      </div>

      <template v-else-if="view.kind === 'ready'">
        <RepoDetailHeader :repo="view.repo" />
        <RepoDetailStats :repo="view.repo" />
        <RepoDetailMeta :repo="view.repo" />
      </template>

      <template v-else-if="view.kind === 'blocked'">
        <p class="repo-detail__blocked">This repository will load automatically when the limit resets.</p>
        <AppButton tag="router-link" :to="backTo">Back to search</AppButton>
      </template>

      <div v-else role="alert">
        <AppErrorState :error="view.error" variant="page" :banner-visible="isCoreBlocked" @retry="retry" />
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.repo-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.repo-detail__region {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

h1 {
  margin: 0;
}

.repo-detail__heading--mono {
  font-family: var(--font-mono);
}

.repo-detail__blocked {
  margin: 0;
  color: var(--text-muted);
}
</style>
