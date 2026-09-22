import { describe, it, expect } from "vitest";
import { pluralize } from "@/utils/pluralize";

describe("pluralize", () => {
  it("uses the singular form for a count of 1", () => {
    expect(pluralize(1, "star", "stars")).toBe("star");
  });

  it("uses the plural form for a count of 0", () => {
    expect(pluralize(0, "star", "stars")).toBe("stars");
  });

  it("uses the plural form for a count of 2", () => {
    expect(pluralize(2, "star", "stars")).toBe("stars");
  });
});
