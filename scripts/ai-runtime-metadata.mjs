import fs from "node:fs/promises";
import path from "node:path";

export const AI_RUNTIME_METADATA_PATHS = [
  "releases/ai-runtime/latest.json",
  "releases/ai-runtime/stable/latest.json",
];

const truthy = new Set(["1", "true", "yes", "on"]);

const isTruthy = (value) => truthy.has(String(value ?? "").trim().toLowerCase());

export const isAiRuntimeMetadataRequired = () =>
  isTruthy(process.env.OPENSTUDIO_REQUIRE_AI_RUNTIME_METADATA);

export const getAiRuntimeMetadataInputDir = () =>
  process.env.OPENSTUDIO_RUNTIME_METADATA_DIR || "release-input";

const normalizeJsonValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeJsonValue(value[key]);
        return result;
      }, {});
  }

  return value;
};

const normalizeJsonText = (value) => JSON.stringify(normalizeJsonValue(value));

const ensureAbsoluteHttpUrl = (value, label) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    throw new Error(`${label} must be an absolute http(s) URL.`);
  }
};

const ensurePublishedAt = (value, label) => {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be a valid timestamp.`);
  }
};

const ensureSha256 = (value, label) => {
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error(`${label} must be a 64-character SHA-256 hex string.`);
  }
};

const validatePlatformEntry = (entry, label) => {
  if (!entry || typeof entry !== "object") {
    throw new Error(`${label} is missing.`);
  }

  if (!entry.url || typeof entry.url !== "string") {
    throw new Error(`${label}.url is required.`);
  }
  ensureAbsoluteHttpUrl(entry.url, `${label}.url`);

  if (!entry.sha256 || typeof entry.sha256 !== "string") {
    throw new Error(`${label}.sha256 is required.`);
  }
  ensureSha256(entry.sha256, `${label}.sha256`);

  if (!entry.fileName || typeof entry.fileName !== "string") {
    throw new Error(`${label}.fileName is required.`);
  }

  const numericSize = Number(entry.size);
  if (!Number.isFinite(numericSize) || numericSize <= 0) {
    throw new Error(`${label}.size must be a positive number.`);
  }
};

export const validateAiRuntimeMetadata = (metadata, label) => {
  if (!metadata || typeof metadata !== "object") {
    throw new Error(`${label} must contain a JSON object.`);
  }

  if (!Number.isInteger(metadata.schemaVersion) || metadata.schemaVersion < 1) {
    throw new Error(`${label}.schemaVersion must be an integer >= 1.`);
  }

  if (!metadata.channel || typeof metadata.channel !== "string") {
    throw new Error(`${label}.channel is required.`);
  }

  if (!metadata.appVersion || typeof metadata.appVersion !== "string") {
    throw new Error(`${label}.appVersion is required.`);
  }

  if (!metadata.runtimeVersion || typeof metadata.runtimeVersion !== "string") {
    throw new Error(`${label}.runtimeVersion is required.`);
  }

  if (!metadata.publishedAt || typeof metadata.publishedAt !== "string") {
    throw new Error(`${label}.publishedAt is required.`);
  }
  ensurePublishedAt(metadata.publishedAt, `${label}.publishedAt`);

  if (!metadata.platforms || typeof metadata.platforms !== "object") {
    throw new Error(`${label}.platforms is required.`);
  }

  validatePlatformEntry(metadata.platforms.windows, `${label}.platforms.windows`);
  validatePlatformEntry(metadata.platforms.macos, `${label}.platforms.macos`);
};

export const readJsonFile = async (filePath, label) => {
  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  validateAiRuntimeMetadata(parsed, label);
  return parsed;
};

export const ensureCleanGeneratedTargets = async (targetRoot) => {
  await fs.rm(path.join(targetRoot, "releases", "ai-runtime"), { recursive: true, force: true });
};

export const validateAiRuntimeMetadataTree = async (rootDir, { requireMetadata = isAiRuntimeMetadataRequired() } = {}) => {
  const existingPaths = [];

  for (const relativePath of AI_RUNTIME_METADATA_PATHS) {
    const fullPath = path.join(rootDir, relativePath);
    try {
      await fs.access(fullPath);
      existingPaths.push(fullPath);
    } catch {
      // noop
    }
  }

  if (existingPaths.length === 0) {
    if (requireMetadata) {
      throw new Error(
        `AI runtime metadata is required, but no metadata files were found under '${rootDir}'.`,
      );
    }

    return { found: false };
  }

  if (existingPaths.length !== AI_RUNTIME_METADATA_PATHS.length) {
    throw new Error(
      `AI runtime metadata is incomplete under '${rootDir}'. Expected ${AI_RUNTIME_METADATA_PATHS.length} files, found ${existingPaths.length}.`,
    );
  }

  const parsedByPath = new Map();

  for (const relativePath of AI_RUNTIME_METADATA_PATHS) {
    const fullPath = path.join(rootDir, relativePath);
    parsedByPath.set(relativePath, await readJsonFile(fullPath, relativePath));
  }

  const rootManifest = parsedByPath.get(AI_RUNTIME_METADATA_PATHS[0]);
  const stableManifest = parsedByPath.get(AI_RUNTIME_METADATA_PATHS[1]);

  if (normalizeJsonText(rootManifest) !== normalizeJsonText(stableManifest)) {
    throw new Error(
      `AI runtime metadata mismatch under '${rootDir}'. '${AI_RUNTIME_METADATA_PATHS[0]}' and '${AI_RUNTIME_METADATA_PATHS[1]}' must match for publish.`,
    );
  }

  return { found: true };
};

export const stageAiRuntimeMetadata = async ({
  repoRoot,
  inputDir = getAiRuntimeMetadataInputDir(),
  outputDir = "public",
  requireMetadata = isAiRuntimeMetadataRequired(),
} = {}) => {
  const inputRoot = path.resolve(repoRoot, inputDir);
  const outputRoot = path.resolve(repoRoot, outputDir);

  let sourceValidation;
  try {
    sourceValidation = await validateAiRuntimeMetadataTree(inputRoot, { requireMetadata });
  } catch (error) {
    await ensureCleanGeneratedTargets(outputRoot);
    throw error;
  }

  if (!sourceValidation.found) {
    await ensureCleanGeneratedTargets(outputRoot);
    return { staged: false, inputRoot, outputRoot };
  }

  await ensureCleanGeneratedTargets(outputRoot);

  for (const relativePath of AI_RUNTIME_METADATA_PATHS) {
    const sourcePath = path.join(inputRoot, relativePath);
    const destinationPath = path.join(outputRoot, relativePath);
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }

  await validateAiRuntimeMetadataTree(outputRoot, { requireMetadata: true });
  return { staged: true, inputRoot, outputRoot };
};
