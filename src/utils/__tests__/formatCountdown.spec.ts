import { describe, it, expect } from "vitest";
import { formatCountdown } from "@/utils/formatCountdown";

describe("formatCountdown", () => {
  it("formats sub-minute durations as seconds", () => {
    expect(formatCountdown(45_000)).toBe("45s");
    expect(formatCountdown(1_000)).toBe("1s");
    expect(formatCountdown(0)).toBe("0s");
  });

  it("formats minute-plus durations as minutes and seconds", () => {
    expect(formatCountdown(130_000)).toBe("2m 10s");
    expect(formatCountdown(60_000)).toBe("1m 0s");
  });

  it("never goes negative", () => {
    expect(formatCountdown(-5)).toBe("0s");
  });
});
