<script setup lang="ts">
import type { RepoSearchSort, RepoSearchSortField, RepoSearchSortDir } from "@/services/github/client";

defineOptions({ name: "RepoSearchForm" });

const {
  q,
  sort,
  loading,
  disabled = false,
} = defineProps<{
  q: string;
  sort: RepoSearchSort | null;
  loading: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{ submit: [payload: { q: string; sort: RepoSearchSort | null }] }>();

const fieldItems: { label: string; value: RepoSearchSortField | "best-match" }[] = [
  { label: "Best match", value: "best-match" },
  { label: "Stars", value: "stars" },
  { label: "Forks", value: "forks" },
  { label: "Recently updated", value: "updated" },
];

const dirItems: { label: string; value: RepoSearchSortDir }[] = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
];

const draftQ = ref(q);
const draftField = ref<RepoSearchSortField | "best-match">(sort ? sort.field : "best-match");
const draftDir = ref<RepoSearchSortDir>(sort ? sort.dir : "desc");

watch(
  () => [q, sort] as const,
  () => {
    draftQ.value = q;

    if (sort === null) {
      draftField.value = "best-match";
    } else {
      draftField.value = sort.field;
      draftDir.value = sort.dir;
    }
  }
);

function onSubmit() {
  if (loading || !draftQ.value.trim()) {
    return;
  }

  const sort = draftField.value === "best-match" ? null : { field: draftField.value, dir: draftDir.value };

  emit("submit", {
    q: draftQ.value,
    sort,
  });
}
</script>

<template>
  <el-form class="search-form" label-position="top" @submit.prevent="onSubmit">
    <div class="form-grid">
      <el-form-item label="Search repositories" class="field-query">
        <AppInput v-model="draftQ" size="large" maxlength="256" clearable placeholder="e.g. language:rust stars:>5000" />
      </el-form-item>

      <el-form-item label="Sort by" class="field-sort">
        <AppSelect v-model="draftField" :items="fieldItems" size="large" />
      </el-form-item>

      <el-form-item v-if="draftField !== 'best-match'" label="Order" class="field-order">
        <AppSelect v-model="draftDir" :items="dirItems" size="large" />
      </el-form-item>

      <el-form-item label=" " class="field-submit">
        <AppButton type="primary" native-type="submit" size="large" :loading="loading" :disabled="disabled || loading || !draftQ.trim()"> Search </AppButton>
      </el-form-item>
    </div>
  </el-form>
</template>

<style lang="scss" scoped>
.form-grid {
  display: grid;
  gap: var(--space-4);
}

.field-submit :deep(.el-button) {
  width: 100%;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr auto auto auto;
    align-items: end;
  }

  // el-select renders its single value in an absolutely-positioned node, so in an auto grid track it collapses to the caret; a definite width fits the longest option
  .field-sort {
    width: 200px;
  }

  .field-order {
    width: 160px;
  }

  .field-submit :deep(.el-button) {
    width: auto;
  }
}
</style>
