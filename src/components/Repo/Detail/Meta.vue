<script setup lang="ts">
import type { GithubRepo } from "@/types/github";
import { safeExternalUrl } from "@/utils/safeExternalUrl";

defineOptions({ name: "RepoDetailMeta" });

const props = defineProps<{ repo: GithubRepo }>();

const language = computed(() => props.repo.language?.trim() || null);

const license = computed(() => props.repo.license?.name?.trim() || null);

const homepageHref = computed(() => safeExternalUrl(props.repo.homepage));

const createdAgo = useTimeAgo(() => props.repo.created_at);

const updatedAgo = useTimeAgo(() => props.repo.updated_at);
</script>

<template>
  <div class="repo-meta">
    <section>
      <h2>About</h2>
      <dl>
        <div>
          <dt>Language</dt>
          <dd>
            <el-tag v-if="language" type="info" disable-transitions>{{ language }}</el-tag>
            <span v-else class="repo-meta__muted">Not specified</span>
          </dd>
        </div>
        <div>
          <dt>License</dt>
          <dd>
            <template v-if="license">{{ license }}</template>
            <span v-else class="repo-meta__muted">No license specified</span>
          </dd>
        </div>
        <div v-if="homepageHref">
          <dt>Homepage</dt>
          <dd>
            <a :href="homepageHref" target="_blank" rel="noopener noreferrer"> {{ repo.homepage }}<span class="visually-hidden">(opens in new tab)</span> </a>
          </dd>
        </div>
      </dl>
    </section>

    <section v-if="repo.topics.length > 0">
      <h2>Topics</h2>
      <div class="repo-meta__topics">
        <el-tag v-for="topic in repo.topics" :key="topic" type="info" disable-transitions>{{ topic }}</el-tag>
      </div>
    </section>

    <section>
      <h2>Activity</h2>
      <dl>
        <div>
          <dt>Created</dt>
          <dd>
            <time :datetime="repo.created_at">{{ createdAgo }}</time>
          </dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>
            <time :datetime="repo.updated_at">{{ updatedAgo }}</time>
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.repo-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

h2 {
  margin: 0 0 var(--space-4);
}

dl {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
}

dl div {
  display: flex;
  gap: var(--space-2);
}

dt {
  min-width: 6rem;
  color: var(--text-muted);
}

dd {
  margin: 0;
  color: var(--text);
}

.repo-meta__muted {
  color: var(--text-muted);
}

.repo-meta__topics {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
