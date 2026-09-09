export const CONSENT_EVENT = "openstudio:analytics-consent";
export const PRIVACY_CHOICES_EVENT = "openstudio:privacy-choices";
const KEY = "openstudio.analytics-consent.v1";
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
// Browsers overflow longer timeout delays, so renew the timer for distant expiry.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;
export type AnalyticsConsent = "accepted" | "rejected" | null;
let sessionChoice: AnalyticsConsent = null;

function readStoredConsent(): { choice: Exclude<AnalyticsConsent, null>; time: number } | null {
  if (typeof window === "undefined") return null;

  try {
    const record = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (
      record &&
      (record.choice === "accepted" || record.choice === "rejected") &&
      Number.isFinite(record.time) &&
      Date.now() >= record.time &&
      Date.now() - record.time < MAX_AGE_MS
    ) {
      return record;
    }
  } catch {
    // Only an explicit choice made in this page can enable analytics without storage.
  }

  return null;
}

export function readAnalyticsConsent(): AnalyticsConsent {
  return sessionChoice ?? readStoredConsent()?.choice ?? null;
}

export function subscribeToAnalyticsConsent(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  let previousChoice = readAnalyticsConsent();
  let expiryTimer = 0;

  const refresh = () => {
    window.clearTimeout(expiryTimer);
    const record = sessionChoice ? null : readStoredConsent();
    const choice = sessionChoice ?? record?.choice ?? null;

    if (record) {
      expiryTimer = window.setTimeout(
        refresh,
        Math.min(MAX_TIMEOUT_MS, Math.max(0, record.time + MAX_AGE_MS - Date.now())),
      );
    }

    if (choice !== previousChoice) {
      previousChoice = choice;
      listener();
    }
  };

  const storageChanged = (event: StorageEvent) => {
    // sessionStorage events from a same-origin frame are unrelated to consent.
    if (event.storageArea && event.storageArea !== window.localStorage) return;

    if (event.key === KEY || event.key === null) {
      // A newer decision in another tab supersedes this page's fallback choice.
      sessionChoice = null;
      refresh();
    }
  };
  const visibilityChanged = () => {
    if (document.visibilityState === "visible") refresh();
  };

  window.addEventListener(CONSENT_EVENT, refresh);
  window.addEventListener(PRIVACY_CHOICES_EVENT, refresh);
  window.addEventListener("storage", storageChanged);
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", visibilityChanged);
  refresh();

  return () => {
    window.clearTimeout(expiryTimer);
    window.removeEventListener(CONSENT_EVENT, refresh);
    window.removeEventListener(PRIVACY_CHOICES_EVENT, refresh);
    window.removeEventListener("storage", storageChanged);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("pageshow", refresh);
    document.removeEventListener("visibilitychange", visibilityChanged);
  };
}

export function setAnalyticsConsent(choice: Exclude<AnalyticsConsent, null>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ choice, time: Date.now() }));
    sessionChoice = null; // Read storage on every check so other tabs can revoke.
  } catch {
    sessionChoice = choice;
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function openPrivacyChoices() {
  window.dispatchEvent(new Event(PRIVACY_CHOICES_EVENT));
}
