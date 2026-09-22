<script setup lang="ts">
import type { InputInstance } from "element-plus";

defineOptions({ name: "AppInput", inheritAttrs: false });

const model = defineModel<string>();

const inputRef = ref<InputInstance>();

defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<template>
  <el-input ref="inputRef" v-model="model" v-bind="$attrs" />
</template>
