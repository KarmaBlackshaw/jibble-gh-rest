<script setup lang="ts">
defineOptions({ name: "AppEmptyState" });

const props = defineProps<{ query: string }>();

const description = computed(() => `No repositories match “${props.query}”. Try a different search term.`);
</script>

<template>
  <el-empty :description="description" />
</template>
