<script setup lang="ts">
import type { GithubRepo } from "@/services/github/schemas";
import { formatCount } from "@/utils/formatCount";
import { pluralize } from "@/utils/pluralize";

defineOptions({ name: "RepoCard" });

const props = defineProps<{ repo: GithubRepo }>();

const avatarUrl = computed(() => {
  const url = new URL(props.repo.owner.avatar_url);

  url.searchParams.set("s", "64");

  return url.href;
});

const to = computed(() => `/repos/${encodeURIComponent(props.repo.owner.login)}/${encodeURIComponent(props.repo.name)}`);

const description = computed(() => props.repo.description?.trim() || "No description provided.");

const language = computed(() => props.repo.language?.trim() || null);

const initial = computed(() => props.repo.owner.login.charAt(0).toUpperCase());

const stars = computed(() => `${formatCount(props.repo.stargazers_count)} ${pluralize(props.repo.stargazers_count, "star", "stars")}`);

const forks = computed(() => `${formatCount(props.repo.forks_count)} ${pluralize(props.repo.forks_count, "fork", "forks")}`);

const updatedAgo = useTimeAgo(() => props.repo.updated_at);
</script>

<template>
  <article class="repo-card">
    <div class="repo-card__head">
      <el-avatar shape="square" :size="40" :src="avatarUrl" alt="">
        <span aria-hidden="true">{{ initial }}</span>
      </el-avatar>
      <h3 class="repo-card__name">
        <RouterLink :to="to">{{ repo.full_name }}</RouterLink>
      </h3>
    </div>

    <p class="repo-card__desc">{{ description }}</p>

    <div class="repo-card__meta">
      <span>{{ stars }}</span>
      <span>{{ forks }}</span>
      <el-tag v-if="language" size="small" type="info" disable-transitions>{{ language }}</el-tag>
      <time :datetime="repo.updated_at" :title="repo.updated_at">Updated {{ updatedAgo }}</time>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.repo-card {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border);
}

.repo-card__head {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.repo-card__name {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  font-weight: 600;
}

.repo-card__name :deep(a) {
  display: inline-block;
  padding: var(--space-2) 0;
}

.repo-card__desc {
  display: -webkit-box;
  margin: var(--space-2) 0 0;
  overflow: hidden;
  color: var(--text-muted);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.repo-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin-top: var(--space-2);
  color: var(--text-muted);
  font-size: var(--text-sm);
}
</style>
