<script setup lang="ts">
import type { RepoSearchSort, RepoSearchSortField, RepoSearchSortDir } from "@/services/github/client";

defineOptions({ name: "RepoSearchForm" });

const props = withDefaults(
  defineProps<{
    q: string;
    sort: RepoSearchSort | null;
    loading: boolean;
    disabled?: boolean;
    disabledReasonId?: string;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{ submit: [payload: { q: string; sort: RepoSearchSort | null }] }>();

const draftQ = ref(props.q);
const draftField = ref<RepoSearchSortField | "best-match">(props.sort ? props.sort.field : "best-match");
const draftDir = ref<RepoSearchSortDir>(props.sort ? props.sort.dir : "desc");

watch(
  () => [props.q, props.sort] as const,
  () => {
    draftQ.value = props.q;

    if (props.sort === null) {
      draftField.value = "best-match";
    } else {
      draftField.value = props.sort.field;
      draftDir.value = props.sort.dir;
    }
  }
);

function onSubmit() {
  const sort = draftField.value === "best-match" ? null : { field: draftField.value, dir: draftDir.value };

  emit("submit", { q: draftQ.value, sort });
}
</script>

<template>
  <el-form class="search-form" label-position="top" @submit.prevent="onSubmit">
    <div class="form-grid">
      <el-form-item label="Search repositories" class="field-query">
        <el-input v-model="draftQ" size="large" maxlength="256" clearable placeholder="e.g. language:rust stars:>5000" />
      </el-form-item>

      <el-form-item label="Sort by">
        <el-select v-model="draftField" size="large">
          <el-option label="Best match" value="best-match" />
          <el-option label="Stars" value="stars" />
          <el-option label="Forks" value="forks" />
          <el-option label="Recently updated" value="updated" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="draftField !== 'best-match'" label="Order">
        <el-switch
          v-model="draftDir"
          size="large"
          active-value="asc"
          inactive-value="desc"
          active-text="Ascending"
          inactive-text="Descending"
          aria-label="Order"
        />
      </el-form-item>

      <el-form-item label=" " class="field-submit">
        <el-button
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          :disabled="disabled || loading || !draftQ.trim()"
          :aria-describedby="disabledReasonId"
        >
          Search
        </el-button>
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

  .field-submit :deep(.el-button) {
    width: auto;
  }
}
</style>
