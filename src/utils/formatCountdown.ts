export function formatCountdown(ms: number): string {
  if (ms <= 0) {
    return "0s";
  }

  const totalSeconds = Math.ceil(ms / 1000);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
}
