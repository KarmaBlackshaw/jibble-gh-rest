import type { RateLimitBucket } from "@/stores/rateLimit";
import type { GithubErrorBody } from "@/services/github/types";

export type GithubError =
  | { type: "network" }
  | { type: "aborted" }
  | { type: "invalid-query"; message: string }
  | { type: "not-found" }
  | { type: "forbidden" }
  | { type: "rate-limited"; bucket: RateLimitBucket; resetAt: number }
  | { type: "secondary-rate-limited"; retryAfterSeconds: number }
  | { type: "server"; status: number }
  | { type: "unknown"; status: number };

const INVALID_QUERY_FALLBACK = "GitHub could not process that search.";
const SECONDARY_LIMIT_PATTERN = /rate limit|secondary|abuse/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBody(body: unknown): GithubErrorBody | null {
  if (!isRecord(body) || typeof body.message !== "string") {
    return null;
  }

  const errors = Array.isArray(body.errors)
    ? body.errors.flatMap((entry) => (isRecord(entry) && typeof entry.message === "string" ? [{ message: entry.message }] : []))
    : undefined;

  return { message: body.message, errors };
}

function invalidQueryMessage(body: unknown): string {
  const parsed = parseBody(body);

  if (!parsed) {
    return INVALID_QUERY_FALLBACK;
  }

  const fromErrors = parsed.errors?.find((entry) => typeof entry.message === "string" && entry.message.length > 0)?.message;

  return fromErrors ?? parsed.message;
}

function positiveInt(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 && Number.isInteger(parsed) ? parsed : null;
}

function mapThrottled(response: Response, bucket: RateLimitBucket, body: unknown): GithubError {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const reset = Number(response.headers.get("x-ratelimit-reset"));

  if (remaining === "0" && Number.isFinite(reset)) {
    return { type: "rate-limited", bucket, resetAt: reset * 1000 };
  }

  const retryAfter = positiveInt(response.headers.get("retry-after"));

  if (retryAfter !== null) {
    return { type: "secondary-rate-limited", retryAfterSeconds: retryAfter };
  }

  if (response.status === 429) {
    return { type: "secondary-rate-limited", retryAfterSeconds: 60 };
  }

  const parsed = parseBody(body);

  if (response.status === 403 && parsed && SECONDARY_LIMIT_PATTERN.test(parsed.message)) {
    return { type: "secondary-rate-limited", retryAfterSeconds: 60 };
  }

  return { type: "forbidden" };
}

export function mapResponseToError(response: Response, bucket: RateLimitBucket, body: unknown): GithubError {
  const { status } = response;

  if (status === 401 || status === 451) {
    return { type: "forbidden" };
  }

  if (status === 404) {
    return { type: "not-found" };
  }

  if (status === 422) {
    return { type: "invalid-query", message: invalidQueryMessage(body) };
  }

  if (status === 403 || status === 429) {
    return mapThrottled(response, bucket, body);
  }

  if (status >= 500) {
    return { type: "server", status };
  }

  return { type: "unknown", status };
}
