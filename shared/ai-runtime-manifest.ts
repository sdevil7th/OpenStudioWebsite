export type AiRuntimePlatform = "windows" | "macos";
export type AiRuntimeMacosArchitecture = "arm64" | "x64";
export type AiRuntimeWindowsBackend = "cuda" | "directml";

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

export interface AiRuntimeWindowsPlatforms {
  backends: {
    cuda: AiRuntimePlatformEntry | null;
    directml: AiRuntimePlatformEntry | null;
  };
  legacy: AiRuntimePlatformEntry | null;
}

export interface AiRuntimeManifest {
  appVersion: string;
  channel: string;
  platforms: {
    macos: AiRuntimeMacosPlatforms;
    windows: AiRuntimeWindowsPlatforms;
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

const parseWindowsPlatforms = (value: unknown, label: string): AiRuntimeWindowsPlatforms => {
  if (!value || typeof value !== "object") {
    throw new Error(`${label} is missing.`);
  }

  const windowsValue = value as Record<string, unknown>;
  const hasLegacyShape =
    windowsValue.url != null ||
    windowsValue.sha256 != null ||
    windowsValue.size != null ||
    windowsValue.fileName != null;
  const legacy = hasLegacyShape ? parsePlatformEntry(value, label) : null;

  let cuda: AiRuntimePlatformEntry | null = null;
  let directml: AiRuntimePlatformEntry | null = null;

  if (windowsValue.backends != null) {
    if (!windowsValue.backends || typeof windowsValue.backends !== "object") {
      throw new Error(`${label}.backends must be an object.`);
    }

    const backendsValue = windowsValue.backends as Record<string, unknown>;
    cuda = backendsValue.cuda != null ? parsePlatformEntry(backendsValue.cuda, `${label}.backends.cuda`) : null;
    directml =
      backendsValue.directml != null
        ? parsePlatformEntry(backendsValue.directml, `${label}.backends.directml`)
        : null;

    if (!cuda && !directml) {
      throw new Error(`${label}.backends must include at least one supported backend entry.`);
    }
  }

  if (!legacy && !cuda && !directml) {
    throw new Error(
      `${label} must include either a legacy Windows runtime entry or '${label}.backends.cuda'/'${label}.backends.directml'.`,
    );
  }

  return {
    backends: {
      cuda,
      directml,
    },
    legacy,
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
  backend?: AiRuntimeWindowsBackend,
) => {
  if (platform === "windows") {
    if (manifest.platforms.windows.legacy) {
      return manifest.platforms.windows.legacy.url;
    }

    if (backend) {
      return manifest.platforms.windows.backends[backend]?.url ?? null;
    }

    return null;
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
      windows: parseWindowsPlatforms(platforms.windows, `${label}.platforms.windows`),
      macos: parseMacosPlatforms(platforms.macos, `${label}.platforms.macos`),
    },
    publishedAt: manifest.publishedAt,
    runtimeVersion: manifest.runtimeVersion,
    schemaVersion: Number(manifest.schemaVersion),
  };
};
