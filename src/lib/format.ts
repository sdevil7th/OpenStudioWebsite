/** Small formatting helpers shared by the Studio Paper pages. */

export const formatBytes = (bytes: number | undefined | null) => {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) {
    return null;
  }

  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

/** "30 Aug 2026" — the mono metadata style used across the preview. */
export const formatDate = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
};

/** "30 August 2026" for running prose. */
export const formatLongDate = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

/** 1234 → "1.2k", 19 → "19". */
export const formatCount = (value: number | undefined | null) => {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
};

/** "v0.1.01" → "0.1.01". */
export const stripVersionPrefix = (tag: string) => tag.replace(/^v(?=\d)/, "");

/** "abcdef…1234" for a long hex digest. */
export const abbreviateDigest = (digest: string | undefined | null) => {
  if (!digest) {
    return null;
  }

  return digest.length > 16 ? `${digest.slice(0, 8)}…${digest.slice(-6)}` : digest;
};
