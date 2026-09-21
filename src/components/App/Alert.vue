<script setup lang="ts">
defineOptions({ name: "AppAlert" });

withDefaults(
  defineProps<{
    type: "info" | "success" | "warning" | "error";
    title?: string;
    showIcon?: boolean;
    closable?: boolean;
  }>(),
  { showIcon: true, closable: false }
);
</script>

<template>
  <el-alert :type="type" :title="title" :show-icon="showIcon" :closable="closable">
    <slot></slot>
  </el-alert>
</template>
