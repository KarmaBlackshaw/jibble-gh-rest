<script setup lang="ts" generic="T extends string">
defineOptions({ name: "AppSelect", inheritAttrs: false });

defineProps<{ items: { label: string; value: T }[] }>();

const model = defineModel<T>();
</script>

<template>
  <el-select v-model="model" v-bind="$attrs">
    <el-option v-for="item in items" :key="item.value" :label="item.label" :value="item.value" />
  </el-select>
</template>
