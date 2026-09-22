<script setup lang="ts">
import type { GithubRepo } from "@/types/github";
import { formatExactCount } from "@/utils/formatCount";

defineOptions({ name: "RepoDetailStats" });

const props = defineProps<{ repo: GithubRepo }>();

const pushedAgo = useTimeAgo(() => props.repo.pushed_at);
</script>

<template>
  <section class="repo-stats">
    <h2>Statistics</h2>
    <dl>
      <div>
        <dt>Stars</dt>
        <dd>{{ formatExactCount(repo.stargazers_count) }}</dd>
      </div>
      <div>
        <dt>Forks</dt>
        <dd>{{ formatExactCount(repo.forks_count) }}</dd>
      </div>
      <div v-if="repo.subscribers_count !== undefined">
        <dt>Watchers</dt>
        <dd>{{ formatExactCount(repo.subscribers_count) }}</dd>
      </div>
      <div>
        <dt>Open issues &amp; PRs</dt>
        <dd>{{ formatExactCount(repo.open_issues_count) }}</dd>
      </div>
      <div>
        <dt>Last push</dt>
        <dd>
          <time :datetime="repo.pushed_at">{{ pushedAgo }}</time>
        </dd>
      </div>
    </dl>
  </section>
</template>

<style lang="scss" scoped>
h2 {
  margin: 0 0 var(--space-4);
}

dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: var(--space-4);
  margin: 0;
}

dt {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

dd {
  margin: 0;
  color: var(--text);
  font-size: var(--text-lg);
}
</style>
