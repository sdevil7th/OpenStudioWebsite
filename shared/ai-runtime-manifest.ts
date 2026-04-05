export type AiRuntimePlatform = "windows" | "macos";
export type AiRuntimeMacosArchitecture = "arm64" | "x64";

export interface AiRuntimePlatformEntry {
  fileName: string;
  sha256: string;
  size: number;
  url: string;
}

export interface AiRuntimeMacosPlatforms {
  arm64: AiRuntimePlatformEntry | null;
  legacy: AiRuntimePlatformEntry | null;
  x64: AiRuntimePlatformEntry | null;
}

export interface AiRuntimeManifest {
  appVersion: string;
  channel: string;
  platforms: {
    macos: AiRuntimeMacosPlatforms;
    windows: AiRuntimePlatformEntry;
  };
  publishedAt: string;
  runtimeVersion: string;
  schemaVersion: number;
}

const ensureAbsoluteHttpUrl = (value: string, label: string) => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute http(s) URL.`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${label} must be an absolute http(s) URL.`);
  }
};

const ensureTimestamp = (value: string, label: string) => {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be a valid timestamp.`);
  }
};

const ensureSha256 = (value: string, label: string) => {
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error(`${label} must be a 64-character SHA-256 hex string.`);
  }
};

const parsePlatformEntry = (value: unknown, label: string): AiRuntimePlatformEntry => {
  if (!value || typeof value !== "object") {
    throw new Error(`${label} is missing.`);
  }

  const entry = value as Record<string, unknown>;

  if (typeof entry.url !== "string" || entry.url.length === 0) {
    throw new Error(`${label}.url is required.`);
  }
  ensureAbsoluteHttpUrl(entry.url, `${label}.url`);

  if (typeof entry.sha256 !== "string" || entry.sha256.length === 0) {
    throw new Error(`${label}.sha256 is required.`);
  }
  ensureSha256(entry.sha256, `${label}.sha256`);

  if (typeof entry.fileName !== "string" || entry.fileName.length === 0) {
    throw new Error(`${label}.fileName is required.`);
  }

  const size = Number(entry.size);
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error(`${label}.size must be a positive number.`);
  }

  return {
    fileName: entry.fileName,
    sha256: entry.sha256,
    size,
    url: entry.url,
  };
};

const parseMacosPlatforms = (value: unknown, label: string): AiRuntimeMacosPlatforms => {
  if (!value || typeof value !== "object") {
    throw new Error(`${label} is missing.`);
  }

  const macosValue = value as Record<string, unknown>;
  const hasNestedShape = macosValue.arm64 != null || macosValue.x64 != null;

  if (!hasNestedShape) {
    return {
      arm64: null,
      legacy: parsePlatformEntry(value, label),
      x64: null,
    };
  }

  const arm64 = macosValue.arm64 != null ? parsePlatformEntry(macosValue.arm64, `${label}.arm64`) : null;
  const x64 = macosValue.x64 != null ? parsePlatformEntry(macosValue.x64, `${label}.x64`) : null;

  if (!arm64 && !x64) {
    throw new Error(`${label} must include at least one macOS architecture entry.`);
  }

  return {
    arm64,
    legacy: null,
    x64,
  };
};

export const resolveAiRuntimeDownloadUrl = (
  manifest: AiRuntimeManifest,
  platform: AiRuntimePlatform,
  architecture?: AiRuntimeMacosArchitecture,
) => {
  if (platform === "windows") {
    return manifest.platforms.windows.url;
  }

  if (manifest.platforms.macos.legacy) {
    return manifest.platforms.macos.legacy.url;
  }

  if (architecture) {
    return manifest.platforms.macos[architecture]?.url ?? null;
  }

  return null;
};

export const parseAiRuntimeManifest = (
  value: unknown,
  label = "AI runtime manifest",
): AiRuntimeManifest => {
  if (!value || typeof value !== "object") {
    throw new Error(`${label} must contain a JSON object.`);
  }

  const manifest = value as Record<string, unknown>;

  if (!Number.isInteger(manifest.schemaVersion) || Number(manifest.schemaVersion) < 1) {
    throw new Error(`${label}.schemaVersion must be an integer >= 1.`);
  }

  if (typeof manifest.channel !== "string" || manifest.channel.length === 0) {
    throw new Error(`${label}.channel is required.`);
  }

  if (typeof manifest.appVersion !== "string" || manifest.appVersion.length === 0) {
    throw new Error(`${label}.appVersion is required.`);
  }

  if (typeof manifest.runtimeVersion !== "string" || manifest.runtimeVersion.length === 0) {
    throw new Error(`${label}.runtimeVersion is required.`);
  }

  if (typeof manifest.publishedAt !== "string" || manifest.publishedAt.length === 0) {
    throw new Error(`${label}.publishedAt is required.`);
  }
  ensureTimestamp(manifest.publishedAt, `${label}.publishedAt`);

  if (!manifest.platforms || typeof manifest.platforms !== "object") {
    throw new Error(`${label}.platforms is required.`);
  }

  const platforms = manifest.platforms as Record<string, unknown>;

  return {
    appVersion: manifest.appVersion,
    channel: manifest.channel,
    platforms: {
      windows: parsePlatformEntry(platforms.windows, `${label}.platforms.windows`),
      macos: parseMacosPlatforms(platforms.macos, `${label}.platforms.macos`),
    },
    publishedAt: manifest.publishedAt,
    runtimeVersion: manifest.runtimeVersion,
    schemaVersion: Number(manifest.schemaVersion),
  };
};
