<script setup lang="ts">
import type { GithubRepo } from "@/services/github/types";

defineOptions({ name: "RepoList" });

const { repos, loading } = defineProps<{ repos: GithubRepo[]; loading: boolean; stale?: boolean }>();
</script>

<template>
  <div v-if="loading" class="repo-list__skeleton">
    <el-skeleton :count="5" animated>
      <template #template>
        <div class="repo-list__row">
          <div class="repo-list__head">
            <el-skeleton-item variant="image" class="repo-list__avatar" />
            <el-skeleton-item variant="h3" class="repo-list__name" />
          </div>
          <el-skeleton-item variant="text" />
          <el-skeleton-item variant="text" class="repo-list__meta" />
        </div>
      </template>
    </el-skeleton>
  </div>

  <ul v-else-if="repos.length > 0" class="repo-list">
    <li v-for="repo in repos" :key="repo.id">
      <RepoCard :repo="repo" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.repo-list__row {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border);
}

.repo-list__head {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-2);
}

.repo-list__avatar {
  width: 40px;
  height: 40px;
}

.repo-list__name {
  width: 40%;
}

.repo-list__meta {
  width: 60%;
}
</style>
