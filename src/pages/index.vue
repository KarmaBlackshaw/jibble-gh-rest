<script setup lang="ts">
defineOptions({ name: "HomePage" });
</script>

<template>
  <main class="home">
    <h1 class="title">jibble-gh-rest</h1>
    <p class="subtitle">Vue 3 + Vite + Pinia</p>
    <el-button type="primary">Theme check</el-button>
    <el-alert type="warning" title="Theme check" :closable="false" />
    <el-input aria-label="Input check" />
    <el-select aria-label="Select check" />
  </main>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 100dvh;
  text-align: center;
}

.title {
  font-size: var(--text-2xl);
  font-weight: 600;
}

.subtitle {
  color: var(--text-muted);
}
</style>
