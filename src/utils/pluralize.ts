export function pluralize(count: number, one: string, other: string): string {
  return count === 1 ? one : other;
}
