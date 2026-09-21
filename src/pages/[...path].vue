<script setup lang="ts">
defineOptions({ name: "NotFoundPage" });

useTitle("Page not found · GitHub Repo Explorer");
</script>

<template>
  <main class="not-found">
    <h1 tabindex="-1">Page not found</h1>
    <el-result icon="info" sub-title="That address doesn't match anything here.">
      <template #extra>
        <el-button tag="router-link" to="/">New search</el-button>
      </template>
    </el-result>
  </main>
</template>

<style lang="scss" scoped>
.not-found {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}
</style>
