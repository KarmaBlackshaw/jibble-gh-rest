<script setup lang="ts">
defineOptions({ name: "AppAlert" });

const {
  type,
  title,
  showIcon = true,
  closable = false,
} = defineProps<{
  type: "info" | "success" | "warning" | "error";
  title?: string;
  showIcon?: boolean;
  closable?: boolean;
}>();
</script>

<template>
  <el-alert :type="type" :title="title" :show-icon="showIcon" :closable="closable">
    <slot></slot>
  </el-alert>
</template>
