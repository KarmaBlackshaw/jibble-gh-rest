<script setup lang="ts">
import type { GithubRepo } from "@/services/github/types";

defineOptions({ name: "RepoDetailHeader" });

const props = defineProps<{ repo: GithubRepo }>();

const avatarUrl = computed(() => {
  const url = new URL(props.repo.owner.avatar_url);

  url.searchParams.set("s", "64");

  return url.href;
});

const initial = computed(() => props.repo.owner.login.charAt(0).toUpperCase());

const description = computed(() => props.repo.description?.trim() || null);
</script>

<template>
  <div class="repo-header">
    <div class="repo-header__ident">
      <el-avatar shape="square" :size="32" :src="avatarUrl" alt="">
        <span aria-hidden="true">{{ initial }}</span>
      </el-avatar>
      <a :href="repo.owner.html_url" target="_blank" rel="noopener noreferrer" class="repo-header__owner">
        {{ repo.owner.login }}<span class="visually-hidden">(opens in new tab)</span>
      </a>
      <el-tag v-if="repo.archived" type="warning" disable-transitions>Archived</el-tag>
      <el-tag v-if="repo.fork" type="info" disable-transitions>Fork</el-tag>
    </div>

    <p class="repo-header__desc" :class="{ 'repo-header__desc--muted': !description }">
      {{ description ?? "No description provided." }}
    </p>

    <AppButton external :href="repo.html_url" class="repo-header__github">View on GitHub</AppButton>
  </div>
</template>

<style lang="scss" scoped>
.repo-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: flex-start;
}

.repo-header__ident {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.repo-header__owner {
  font-size: var(--text-base);
}

.repo-header__desc {
  margin: 0;
  color: var(--text);
}

.repo-header__desc--muted {
  color: var(--text-muted);
}

.repo-header__github {
  min-height: 44px;
}
</style>
