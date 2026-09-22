import { describe, it, expect } from "vitest";
import { formatCount, formatExactCount } from "@/utils/formatCount";

describe("formatCount", () => {
  it("formats 0 as 0", () => {
    expect(formatCount(0)).toBe("0");
  });

  it("formats 999 as 999", () => {
    expect(formatCount(999)).toBe("999");
  });

  it("formats 1200 as 1.2K", () => {
    expect(formatCount(1200)).toBe("1.2K");
  });

  it("formats 1234 as 1.2K", () => {
    expect(formatCount(1234)).toBe("1.2K");
  });

  it("formats 1000000 as 1M", () => {
    expect(formatCount(1_000_000)).toBe("1M");
  });
});

describe("formatExactCount", () => {
  it("formats 48213 with thousands separators", () => {
    expect(formatExactCount(48213)).toBe("48,213");
  });

  it("formats 0 as 0", () => {
    expect(formatExactCount(0)).toBe("0");
  });
});
