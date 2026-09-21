<script setup lang="ts">
defineOptions({ name: "AppButton", inheritAttrs: false });

const { external = false } = defineProps<{ external?: boolean }>();
</script>

<template>
  <el-button
    class="app-button"
    size="default"
    :tag="external ? 'a' : undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    v-bind="$attrs"
  >
    <slot></slot>
    <span v-if="external" class="visually-hidden"> (opens in new tab)</span>
  </el-button>
</template>

<style lang="scss" scoped>
.app-button {
  font-weight: 500;
  border-radius: 6px;
}

.app-button:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
</style>
