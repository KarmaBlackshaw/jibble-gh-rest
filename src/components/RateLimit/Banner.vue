<script setup lang="ts">
import { useRateLimitStore } from "@/stores/rateLimit";
import type { RateLimitBucket } from "@/stores/rateLimit";
import { formatCountdown } from "@/utils/formatCountdown";
import { pluralize } from "@/utils/pluralize";

defineOptions({ name: "RateLimitBanner" });

const props = defineProps<{ bucket: RateLimitBucket }>();

const rateLimit = useRateLimitStore();

const now = useTimestamp({ scheduler: (cb) => useIntervalFn(cb, 1000) });

const blocked = computed(() => rateLimit.isBlocked(props.bucket));
const blockedUntil = computed(() => rateLimit.blockedUntil(props.bucket));
const blockKind = computed(() => rateLimit.blockKind(props.bucket));
const remaining = computed(() => rateLimit.remainingFor(props.bucket));
const limit = computed(() => rateLimit.buckets[props.bucket]?.limit ?? null);

const remainingMs = computed(() => {
  const end = blockedUntil.value;

  return end === null ? 0 : Math.max(0, end - now.value);
});

const countdown = computed(() => formatCountdown(remainingMs.value));

const blockedTitle = computed(() => {
  if (blockKind.value === "secondary") {
    return `GitHub asked us to slow down. Requests resume in ${countdown.value}.`;
  }

  if (props.bucket === "search") {
    return `Search limit reached. New searches resume in ${countdown.value}.`;
  }

  return `GitHub's request limit reached. Repository pages load again in ${countdown.value}.`;
});

const blockedDescription = computed(() => {
  if (blockKind.value === "secondary" || props.bucket !== "search") {
    return null;
  }

  const l = limit.value;

  if (l === null) {
    return null;
  }

  return `GitHub allows ${l} ${pluralize(l, "search", "searches")} a minute without signing in.`;
});

const showLow = computed(() => !blocked.value && remaining.value !== null && remaining.value <= 2);

const lowText = computed(() => {
  const n = remaining.value ?? 0;

  if (props.bucket === "search") {
    return `${n} ${pluralize(n, "search", "searches")} left this minute.`;
  }

  return `${n} ${pluralize(n, "request", "requests")} left this hour.`;
});

function roundedSpeech(ms: number): string {
  const seconds = Math.ceil(ms / 1000);

  if (seconds <= 60) {
    return `${seconds} ${pluralize(seconds, "second", "seconds")}`;
  }

  const minutes = Math.ceil(seconds / 60);

  return `${minutes} ${pluralize(minutes, "minute", "minutes")}`;
}

function blockStartMessage(): string {
  if (blockKind.value === "secondary") {
    return "GitHub asked us to slow down.";
  }

  if (props.bucket === "search") {
    return `Search limit reached. New searches resume in about ${roundedSpeech(remainingMs.value)}.`;
  }

  return `GitHub's request limit reached. Repository pages load again in about ${roundedSpeech(remainingMs.value)}.`;
}

function clearedMessage(): string {
  return props.bucket === "search" ? "You can search again now." : "Repository pages can load again.";
}

const announcement = ref("");
let announcedAlmost = false;
let announcedLow = false;

watch(blocked, (isBlocked, was) => {
  if (isBlocked && !was) {
    announcedAlmost = false;
    announcement.value = blockStartMessage();
  } else if (!isBlocked && was) {
    announcement.value = clearedMessage();
  }
});

watch(remainingMs, (ms) => {
  if (blocked.value && !announcedAlmost && ms > 0 && ms <= 10_000) {
    announcedAlmost = true;
    announcement.value = "Almost ready.";
  }
});

watch(showLow, (visible) => {
  if (visible && !announcedLow) {
    announcedLow = true;
    announcement.value = lowText.value;
  } else if (!visible) {
    announcedLow = false;
  }
});
</script>

<template>
  <div class="rate-limit-banner">
    <div v-if="blocked" id="rate-limit-banner" class="rlb-notice rlb-notice--warning">
      <p class="rlb-notice__title">{{ blockedTitle }}</p>
      <p v-if="blockedDescription" class="rlb-notice__desc">{{ blockedDescription }}</p>
    </div>
    <div v-else-if="showLow" class="rlb-notice rlb-notice--info">
      <p class="rlb-notice__title">{{ lowText }}</p>
    </div>

    <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</div>
  </div>
</template>

<style lang="scss" scoped>
.rlb-notice {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-4);
  border-radius: 4px;
}

.rlb-notice--warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.rlb-notice--info {
  color: var(--el-color-info);
  background: var(--el-color-info-light-9);
}

.rlb-notice__title {
  margin: 0;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.rlb-notice__desc {
  margin: 0;
  font-size: var(--text-sm);
}
</style>
