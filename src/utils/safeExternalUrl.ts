export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (raw == null) {
    return null;
  }

  const trimmed = raw.trim();

  if (trimmed === "") {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }

    return null;
  } catch {
    return null;
  }
}
