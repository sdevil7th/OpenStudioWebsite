export const CONSENT_KEY = "openstudio.analytics-consent.v1";
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

// Self-contained so prerendering can serialize this same validation into the
// tiny pre-paint bootstrap. Never treat malformed/expired storage as consent.
export function parseConsentRecord(raw: string | null, now: number, maxAge: number): { choice: "accepted" | "rejected"; time: number } | null {
  try {
    const record: unknown = JSON.parse(raw ?? "null");
    if (record && typeof record === "object" && "choice" in record && "time" in record &&
      (record.choice === "accepted" || record.choice === "rejected") &&
      typeof record.time === "number" && Number.isFinite(record.time) && now >= record.time && now - record.time < maxAge) {
      return { choice: record.choice, time: record.time };
    }
  } catch { /* Unavailable or invalid storage requires a new choice. */ }
  return null;
}
