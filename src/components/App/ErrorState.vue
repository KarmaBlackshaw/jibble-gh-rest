<script setup lang="ts">
import type { GithubError } from "@/types/github";

defineOptions({ name: "AppErrorState" });

const { error, bannerVisible = false } = defineProps<{
  error: GithubError;
  variant: "page" | "inline";
  bannerVisible?: boolean;
}>();

const emit = defineEmits<{ retry: [] }>();

const SYNTAX_URL = "https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories";

type ErrorContent = { title: string; detail: string; action: "retry" | "new-search" | "none"; icon: "info" | "warning" | "error" };

function describeError(error: GithubError): ErrorContent {
  switch (error.type) {
    case "invalid-query": {
      const trimmed = error.message.trim();
      const detail = trimmed !== "" ? trimmed : "Try simplifying it — remove special characters or quotes.";

      return { title: "That search couldn't be understood", detail, action: "none", icon: "warning" };
    }
    case "not-found":
      return { title: "Repository not found", detail: "It may have been deleted, renamed, or made private.", action: "new-search", icon: "info" };
    case "forbidden":
      return { title: "GitHub won't show this", detail: "Access is restricted, so it can't be displayed.", action: "new-search", icon: "warning" };
    case "server":
      return { title: "Something went wrong on GitHub's side", detail: "", action: "retry", icon: "error" };
    case "network":
      return { title: "Couldn't reach GitHub", detail: "Check your connection.", action: "retry", icon: "warning" };
    case "unknown":
    case "aborted":
      return { title: "Something went wrong", detail: "", action: "retry", icon: "error" };
    case "rate-limited":
    case "secondary-rate-limited":
      return { title: "GitHub's rate limit was reached", detail: "Try again shortly.", action: "retry", icon: "warning" };
  }
}

const content = computed(() => describeError(error));

const isInvalidQuery = computed(() => error.type === "invalid-query");

const isLimit = computed(() => error.type === "rate-limited" || error.type === "secondary-rate-limited");

const shouldRender = computed(() => !(bannerVisible && isLimit.value));

const alertType = computed(() => {
  const t = error.type;

  return t === "network" || t === "invalid-query" || isLimit.value ? "warning" : "error";
});
</script>

<template>
  <div v-if="shouldRender" class="error-state">
    <el-result v-if="variant === 'page'" :icon="content.icon" :title="content.title">
      <template v-if="content.detail || isInvalidQuery" #sub-title>
        <span v-if="content.detail">{{ content.detail }}</span>
        <a v-if="isInvalidQuery" class="syntax-link" :href="SYNTAX_URL" target="_blank" rel="noopener noreferrer">
          GitHub search syntax<span class="visually-hidden"> (opens in new tab)</span>
        </a>
      </template>
      <template v-if="content.action !== 'none'" #extra>
        <AppButton v-if="content.action === 'retry'" type="primary" @click="emit('retry')">Retry</AppButton>
        <AppButton v-else tag="router-link" to="/">New search</AppButton>
      </template>
    </el-result>

    <AppAlert v-else :type="alertType" :title="content.title">
      <div class="inline-body">
        <p v-if="content.detail" class="inline-detail">{{ content.detail }}</p>
        <a v-if="isInvalidQuery" class="syntax-link" :href="SYNTAX_URL" target="_blank" rel="noopener noreferrer">
          GitHub search syntax<span class="visually-hidden"> (opens in new tab)</span>
        </a>
        <div v-if="content.action !== 'none'" class="inline-action">
          <AppButton v-if="content.action === 'retry'" type="primary" size="small" @click="emit('retry')">Retry</AppButton>
          <AppButton v-else tag="router-link" to="/" size="small">New search</AppButton>
        </div>
      </div>
    </AppAlert>
  </div>
</template>

<style lang="scss" scoped>
.syntax-link {
  display: inline-block;
  margin-top: var(--space-2);
}

.inline-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.inline-detail {
  margin: 0;
}

.inline-action {
  margin-top: var(--space-2);
}
</style>
