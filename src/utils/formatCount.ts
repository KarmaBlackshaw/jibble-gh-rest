const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const exact = new Intl.NumberFormat("en");

export function formatCount(value: number): string {
  return compact.format(value);
}

export function formatExactCount(value: number): string {
  return exact.format(value);
}
