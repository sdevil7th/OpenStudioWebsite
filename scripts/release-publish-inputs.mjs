import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { AI_RUNTIME_METADATA_PATHS, validateAiRuntimeMetadata } from "./ai-runtime-metadata.mjs";

export const APP_RELEASE_METADATA_PATHS = [
  "releases/latest.json",
  "releases/stable/latest.json",
];

export const APPCAST_PATHS = [
  "appcast/windows-stable.xml",
  "appcast/macos-stable.xml",
];

export const RELEASE_PUBLISH_INPUT_PATHS = [
  ...APP_RELEASE_METADATA_PATHS,
  ...AI_RUNTIME_METADATA_PATHS,
  ...APPCAST_PATHS,
];

const truthy = new Set(["1", "true", "yes", "on"]);

const xmlParser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

const isTruthy = (value) => truthy.has(String(value ?? "").trim().toLowerCase());

export const isReleaseMetadataRequired = () =>
  isTruthy(process.env.OPENSTUDIO_REQUIRE_RELEASE_METADATA);

export const getReleaseMetadataInputDir = () =>
  process.env.OPENSTUDIO_RELEASE_METADATA_DIR || "release-input";

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
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute http(s) URL.`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${label} must be an absolute http(s) URL.`);
  }
};

const ensureTimestamp = (value, label) => {
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

  return {
    ...entry,
    size: numericSize,
  };
};

export const validateAppReleaseMetadata = (metadata, label) => {
  if (!metadata || typeof metadata !== "object") {
    throw new Error(`${label} must contain a JSON object.`);
  }

  if (!Number.isInteger(metadata.schemaVersion) || metadata.schemaVersion < 1) {
    throw new Error(`${label}.schemaVersion must be an integer >= 1.`);
  }

  if (!metadata.channel || typeof metadata.channel !== "string") {
    throw new Error(`${label}.channel is required.`);
  }

  if (metadata.channel !== "stable") {
    throw new Error(`${label}.channel must be 'stable' for website publishing.`);
  }

  if (!metadata.version || typeof metadata.version !== "string") {
    throw new Error(`${label}.version is required.`);
  }

  if (!metadata.publishedAt || typeof metadata.publishedAt !== "string") {
    throw new Error(`${label}.publishedAt is required.`);
  }
  ensureTimestamp(metadata.publishedAt, `${label}.publishedAt`);

  if (!metadata.releasePageUrl || typeof metadata.releasePageUrl !== "string") {
    throw new Error(`${label}.releasePageUrl is required.`);
  }
  ensureAbsoluteHttpUrl(metadata.releasePageUrl, `${label}.releasePageUrl`);

  if (metadata.fullReleaseNotesUrl != null) {
    if (typeof metadata.fullReleaseNotesUrl !== "string" || metadata.fullReleaseNotesUrl.length === 0) {
      throw new Error(`${label}.fullReleaseNotesUrl must be a non-empty string when provided.`);
    }
    ensureAbsoluteHttpUrl(metadata.fullReleaseNotesUrl, `${label}.fullReleaseNotesUrl`);
  }

  if (metadata.minimumSupportedVersion != null && typeof metadata.minimumSupportedVersion !== "string") {
    throw new Error(`${label}.minimumSupportedVersion must be a string when provided.`);
  }

  if (metadata.notes != null && typeof metadata.notes !== "string") {
    throw new Error(`${label}.notes must be a string when provided.`);
  }

  if (!metadata.platforms || typeof metadata.platforms !== "object") {
    throw new Error(`${label}.platforms is required.`);
  }

  const windows = validatePlatformEntry(metadata.platforms.windows, `${label}.platforms.windows`);
  const macos = validatePlatformEntry(metadata.platforms.macos, `${label}.platforms.macos`);

  if (windows.installerArguments != null && typeof windows.installerArguments !== "string") {
    throw new Error(`${label}.platforms.windows.installerArguments must be a string when provided.`);
  }

  if (macos.edSignature != null && typeof macos.edSignature !== "string") {
    throw new Error(`${label}.platforms.macos.edSignature must be a string when provided.`);
  }

  if (macos.minimumSystemVersion != null && typeof macos.minimumSystemVersion !== "string") {
    throw new Error(`${label}.platforms.macos.minimumSystemVersion must be a string when provided.`);
  }
};

const readJsonFile = async (filePath, label, validate) => {
  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  validate(parsed, label);
  return parsed;
};

const pickSingle = (value, label) => {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (normalized == null || normalized === "") {
    throw new Error(`${label} is missing.`);
  }

  return normalized;
};

const readTextNode = (value, label) => {
  const normalized = pickSingle(value, label);

  if (typeof normalized === "string") {
    return normalized;
  }

  if (typeof normalized === "object" && normalized !== null && typeof normalized["#text"] === "string") {
    return normalized["#text"];
  }

  throw new Error(`${label} must be a text value.`);
};

const parseAppcastFile = async (filePath, label) => {
  const raw = await fs.readFile(filePath, "utf8");
  const validationResult = XMLValidator.validate(raw);

  if (validationResult !== true) {
    const message = typeof validationResult === "object" ? validationResult.err?.msg ?? "Invalid XML." : "Invalid XML.";
    throw new Error(`${label} is not valid XML: ${message}`);
  }

  const parsed = xmlParser.parse(raw);
  const rss = pickSingle(parsed?.rss, `${label}.rss`);
  const channel = pickSingle(rss.channel, `${label}.rss.channel`);
  const item = pickSingle(channel.item, `${label}.rss.channel.item`);
  const enclosure = pickSingle(item.enclosure, `${label}.rss.channel.item.enclosure`);

  return {
    channelLink: readTextNode(channel.link, `${label}.rss.channel.link`),
    enclosureLength: String(enclosure.length ?? ""),
    enclosureUrl: String(enclosure.url ?? ""),
    itemTitle: readTextNode(item.title, `${label}.rss.channel.item.title`),
    openstudioChannel: String(enclosure["openstudio:channel"] ?? ""),
    openstudioFileName: String(enclosure["openstudio:fileName"] ?? ""),
    openstudioMinimumSupportedVersion: String(enclosure["openstudio:minimumSupportedVersion"] ?? ""),
    openstudioSha256: String(enclosure["openstudio:sha256"] ?? ""),
    releaseNotesLink:
      item["sparkle:releaseNotesLink"] != null
        ? readTextNode(item["sparkle:releaseNotesLink"], `${label}.rss.channel.item.sparkle:releaseNotesLink`)
        : "",
    sparkleEdSignature: String(enclosure["sparkle:edSignature"] ?? ""),
    sparkleInstallerArguments: String(enclosure["sparkle:installerArguments"] ?? ""),
    sparkleMinimumSystemVersion: String(enclosure["sparkle:minimumSystemVersion"] ?? ""),
    sparkleShortVersion: String(enclosure["sparkle:shortVersionString"] ?? ""),
    sparkleVersion: String(enclosure["sparkle:version"] ?? ""),
  };
};

const validateAppcastAgainstManifest = ({ appcast, appcastLabel, manifest, platform, platformLabel }) => {
  const platformNode = manifest.platforms[platform];

  if (!platformNode) {
    throw new Error(`${appcastLabel} cannot be validated because ${platformLabel} is missing in releases/stable/latest.json.`);
  }

  const expectedTitle = `OpenStudio ${manifest.version}`;
  if (appcast.itemTitle !== expectedTitle) {
    throw new Error(`${appcastLabel} item title must be '${expectedTitle}'.`);
  }

  if (appcast.channelLink !== manifest.releasePageUrl) {
    throw new Error(`${appcastLabel} channel link must match releases/stable/latest.json.`);
  }

  if (appcast.enclosureUrl !== platformNode.url) {
    throw new Error(`${appcastLabel} enclosure URL must match releases/stable/latest.json.`);
  }

  if (appcast.enclosureLength !== String(platformNode.size)) {
    throw new Error(`${appcastLabel} enclosure length must match releases/stable/latest.json.`);
  }

  if (appcast.sparkleVersion !== manifest.version || appcast.sparkleShortVersion !== manifest.version) {
    throw new Error(`${appcastLabel} sparkle version fields must match releases/stable/latest.json.`);
  }

  if (appcast.openstudioChannel !== manifest.channel) {
    throw new Error(`${appcastLabel} openstudio:channel must match releases/stable/latest.json.`);
  }

  if (appcast.openstudioSha256 !== platformNode.sha256) {
    throw new Error(`${appcastLabel} openstudio:sha256 must match releases/stable/latest.json.`);
  }

  if (appcast.openstudioFileName !== platformNode.fileName) {
    throw new Error(`${appcastLabel} openstudio:fileName must match releases/stable/latest.json.`);
  }

  if (manifest.minimumSupportedVersion) {
    if (appcast.openstudioMinimumSupportedVersion !== manifest.minimumSupportedVersion) {
      throw new Error(`${appcastLabel} openstudio:minimumSupportedVersion must match releases/stable/latest.json.`);
    }
  } else if (appcast.openstudioMinimumSupportedVersion) {
    throw new Error(`${appcastLabel} includes openstudio:minimumSupportedVersion, but releases/stable/latest.json does not.`);
  }

  if (manifest.fullReleaseNotesUrl) {
    if (appcast.releaseNotesLink !== manifest.fullReleaseNotesUrl) {
      throw new Error(`${appcastLabel} sparkle:releaseNotesLink must match releases/stable/latest.json.`);
    }
  } else if (appcast.releaseNotesLink) {
    throw new Error(`${appcastLabel} includes sparkle:releaseNotesLink, but releases/stable/latest.json does not.`);
  }

  if (platform === "windows") {
    if (platformNode.installerArguments) {
      if (appcast.sparkleInstallerArguments !== platformNode.installerArguments) {
        throw new Error(`${appcastLabel} sparkle:installerArguments must match releases/stable/latest.json.`);
      }
    } else if (appcast.sparkleInstallerArguments) {
      throw new Error(`${appcastLabel} includes sparkle:installerArguments, but releases/stable/latest.json does not.`);
    }
  }

  if (platform === "macos") {
    if (platformNode.edSignature) {
      if (appcast.sparkleEdSignature !== platformNode.edSignature) {
        throw new Error(`${appcastLabel} sparkle:edSignature must match releases/stable/latest.json.`);
      }
    } else if (appcast.sparkleEdSignature) {
      throw new Error(`${appcastLabel} includes sparkle:edSignature, but releases/stable/latest.json does not.`);
    }

    if (platformNode.minimumSystemVersion) {
      if (appcast.sparkleMinimumSystemVersion !== platformNode.minimumSystemVersion) {
        throw new Error(`${appcastLabel} sparkle:minimumSystemVersion must match releases/stable/latest.json.`);
      }
    } else if (appcast.sparkleMinimumSystemVersion) {
      throw new Error(`${appcastLabel} includes sparkle:minimumSystemVersion, but releases/stable/latest.json does not.`);
    }
  }
};

export const ensureCleanGeneratedReleaseTargets = async (targetRoot) => {
  await fs.rm(path.join(targetRoot, "appcast"), { recursive: true, force: true });
  await fs.rm(path.join(targetRoot, "releases"), { recursive: true, force: true });
};

export const validateReleasePublishInputsTree = async (
  rootDir,
  { requireMetadata = isReleaseMetadataRequired() } = {},
) => {
  const existingPaths = [];

  for (const relativePath of RELEASE_PUBLISH_INPUT_PATHS) {
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
      throw new Error(`Release metadata is required, but no release publish inputs were found under '${rootDir}'.`);
    }

    return { found: false };
  }

  if (existingPaths.length !== RELEASE_PUBLISH_INPUT_PATHS.length) {
    throw new Error(
      `Release publish inputs are incomplete under '${rootDir}'. Expected ${RELEASE_PUBLISH_INPUT_PATHS.length} files, found ${existingPaths.length}.`,
    );
  }

  const appManifestByPath = new Map();
  for (const relativePath of APP_RELEASE_METADATA_PATHS) {
    appManifestByPath.set(
      relativePath,
      await readJsonFile(path.join(rootDir, relativePath), relativePath, validateAppReleaseMetadata),
    );
  }

  const appRootManifest = appManifestByPath.get(APP_RELEASE_METADATA_PATHS[0]);
  const appStableManifest = appManifestByPath.get(APP_RELEASE_METADATA_PATHS[1]);
  if (normalizeJsonText(appRootManifest) !== normalizeJsonText(appStableManifest)) {
    throw new Error(
      `Release metadata mismatch under '${rootDir}'. '${APP_RELEASE_METADATA_PATHS[0]}' and '${APP_RELEASE_METADATA_PATHS[1]}' must match for publish.`,
    );
  }

  const aiRuntimeByPath = new Map();
  for (const relativePath of AI_RUNTIME_METADATA_PATHS) {
    aiRuntimeByPath.set(
      relativePath,
      await readJsonFile(path.join(rootDir, relativePath), relativePath, validateAiRuntimeMetadata),
    );
  }

  const aiRuntimeRootManifest = aiRuntimeByPath.get(AI_RUNTIME_METADATA_PATHS[0]);
  const aiRuntimeStableManifest = aiRuntimeByPath.get(AI_RUNTIME_METADATA_PATHS[1]);
  if (aiRuntimeRootManifest.channel !== "stable" || aiRuntimeStableManifest.channel !== "stable") {
    throw new Error(`AI runtime metadata under '${rootDir}' must use the 'stable' channel for website publishing.`);
  }

  if (normalizeJsonText(aiRuntimeRootManifest) !== normalizeJsonText(aiRuntimeStableManifest)) {
    throw new Error(
      `AI runtime metadata mismatch under '${rootDir}'. '${AI_RUNTIME_METADATA_PATHS[0]}' and '${AI_RUNTIME_METADATA_PATHS[1]}' must match for publish.`,
    );
  }

  const windowsAppcast = await parseAppcastFile(path.join(rootDir, APPCAST_PATHS[0]), APPCAST_PATHS[0]);
  const macosAppcast = await parseAppcastFile(path.join(rootDir, APPCAST_PATHS[1]), APPCAST_PATHS[1]);

  validateAppcastAgainstManifest({
    appcast: windowsAppcast,
    appcastLabel: APPCAST_PATHS[0],
    manifest: appStableManifest,
    platform: "windows",
    platformLabel: "Windows platform metadata",
  });
  validateAppcastAgainstManifest({
    appcast: macosAppcast,
    appcastLabel: APPCAST_PATHS[1],
    manifest: appStableManifest,
    platform: "macos",
    platformLabel: "macOS platform metadata",
  });

  return { found: true };
};

export const stageReleasePublishInputs = async ({
  repoRoot,
  inputDir = getReleaseMetadataInputDir(),
  outputDir = "public",
  requireMetadata = isReleaseMetadataRequired(),
} = {}) => {
  const inputRoot = path.resolve(repoRoot, inputDir);
  const outputRoot = path.resolve(repoRoot, outputDir);

  let sourceValidation;
  try {
    sourceValidation = await validateReleasePublishInputsTree(inputRoot, { requireMetadata });
  } catch (error) {
    await ensureCleanGeneratedReleaseTargets(outputRoot);
    throw error;
  }

  if (!sourceValidation.found) {
    await ensureCleanGeneratedReleaseTargets(outputRoot);
    return { staged: false, inputRoot, outputRoot };
  }

  await ensureCleanGeneratedReleaseTargets(outputRoot);

  for (const relativePath of RELEASE_PUBLISH_INPUT_PATHS) {
    const sourcePath = path.join(inputRoot, relativePath);
    const destinationPath = path.join(outputRoot, relativePath);
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }

  await validateReleasePublishInputsTree(outputRoot, { requireMetadata: true });
  return { staged: true, inputRoot, outputRoot };
};
