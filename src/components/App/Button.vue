<script setup lang="ts">
defineOptions({ name: "AppButton", inheritAttrs: false });
</script>

<template>
  <el-button v-bind="$attrs">
    <slot></slot>
  </el-button>
</template>
