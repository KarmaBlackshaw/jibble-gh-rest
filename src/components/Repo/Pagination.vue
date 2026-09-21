<script setup lang="ts">
import { SEARCH_PER_PAGE, SEARCH_RESULT_CAP } from "@/services/github/client";
import { formatExactCount } from "@/utils/formatCount";

defineOptions({ name: "RepoPagination" });

const props = defineProps<{ totalCount: number; currentPage: number }>();

const emit = defineEmits<{ "update:currentPage": [page: number] }>();

const cappedTotal = computed(() => Math.min(props.totalCount, SEARCH_RESULT_CAP));

const showCapNote = computed(() => props.totalCount > SEARCH_RESULT_CAP);

const isWide = useMediaQuery("(min-width: 768px)");

function onCurrentChange(page: number) {
  if (page === props.currentPage) {
    return;
  }

  emit("update:currentPage", page);
}
</script>

<template>
  <nav v-if="totalCount > 0" class="repo-pagination" aria-label="Search results pages">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="cappedTotal"
      :page-size="SEARCH_PER_PAGE"
      :current-page="currentPage"
      :pager-count="isWide ? 7 : 5"
      @current-change="onCurrentChange"
    />
    <p v-if="showCapNote" class="repo-pagination__note">
      Showing the first 1,000 of {{ formatExactCount(totalCount) }} results — GitHub limits search to 1,000 results per query.
    </p>
  </nav>
</template>

<style lang="scss" scoped>
.repo-pagination {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
  margin-top: var(--space-4);
}

.repo-pagination__note {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--text-sm);
  text-align: center;
}
</style>
