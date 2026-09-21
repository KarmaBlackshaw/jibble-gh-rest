<script setup lang="ts">
defineOptions({ name: "AppInput", inheritAttrs: false });

const model = defineModel<string>();
</script>

<template>
  <el-input v-model="model" v-bind="$attrs" />
</template>
