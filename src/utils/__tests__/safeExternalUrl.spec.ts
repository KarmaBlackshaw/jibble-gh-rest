import { describe, it, expect } from "vitest";
import { safeExternalUrl } from "@/utils/safeExternalUrl";

describe("safeExternalUrl", () => {
  it("normalises a bare https URL", () => {
    expect(safeExternalUrl("https://vuejs.org")).toBe("https://vuejs.org/");
  });

  it("keeps an http URL with a path and query string unchanged", () => {
    expect(safeExternalUrl("http://example.com/path?a=1")).toBe("http://example.com/path?a=1");
  });

  it("rejects a javascript: URL", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects a javascript: URL regardless of protocol casing", () => {
    expect(safeExternalUrl("JavaScript:alert(1)")).toBeNull();
  });

  it("rejects a data: URL", () => {
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(safeExternalUrl("")).toBeNull();
  });

  it("rejects a whitespace-only string", () => {
    expect(safeExternalUrl("   ")).toBeNull();
  });

  it("rejects null and undefined", () => {
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
  });

  it("rejects an unparsable string without throwing", () => {
    expect(() => safeExternalUrl("not a url")).not.toThrow();
    expect(safeExternalUrl("not a url")).toBeNull();
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeExternalUrl("//evil.example.com")).toBeNull();
  });

  it("rejects a schemeless host", () => {
    expect(safeExternalUrl("vuejs.org")).toBeNull();
  });

  it("normalises an https: URL with no slashes", () => {
    expect(safeExternalUrl("https:example.com")).toBe("https://example.com/");
  });
});
