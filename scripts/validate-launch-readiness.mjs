import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const liveRoots = ["src", "scripts", "shared", "netlify", "blogs"];
const liveFiles = ["index.html", "public/_headers", "public/robots.txt", "public/sitemap.xml"];
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".md",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);

const suspiciousTerms = [
  ["lor" + "em", "ips" + "um"].join(" "),
  ["Screenshot", "place" + "holder"].join(" "),
  ["TO", "DO"].join(""),
  ["FIX", "ME"].join(""),
  ["CHANGE", "ME"].join("_"),
  ["T", "BD"].join(""),
];

const mojibakePattern = new RegExp(`[${String.fromCharCode(0xe2)}${String.fromCharCode(0xc3)}${String.fromCharCode(0xfffd)}]`);

const normalizePath = (value) => value.replaceAll("\\", "/");

const pathExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const collectTextFiles = async () => {
  const files = [];

  for (const root of liveRoots) {
    const fullRoot = path.join(repoRoot, root);
    if (await pathExists(fullRoot)) {
      files.push(...await walk(fullRoot));
    }
  }

  for (const file of liveFiles) {
    const fullPath = path.join(repoRoot, file);
    if (await pathExists(fullPath)) {
      files.push(fullPath);
    }
  }

  return files.filter((file) => textExtensions.has(path.extname(file)));
};

const assertCleanText = async (files) => {
  const failures = [];

  for (const file of files) {
    const relative = normalizePath(path.relative(repoRoot, file));
    const text = await fs.readFile(file, "utf8");

    if (mojibakePattern.test(text)) {
      failures.push(`${relative}: contains mojibake characters`);
    }

    for (const term of suspiciousTerms) {
      if (text.includes(term)) {
        failures.push(`${relative}: contains '${term}'`);
      }
    }
  }

  return failures;
};

const assertAssetReferencesExist = async (files) => {
  const failures = [];
  const assetPattern = /["'(](\/assets\/[^"'()\s?#]+)(?:[?#][^"'()\s]*)?["')]/g;
  const seen = new Set();

  for (const file of files) {
    const text = await fs.readFile(file, "utf8");
    const relative = normalizePath(path.relative(repoRoot, file));
    for (const match of text.matchAll(assetPattern)) {
      const assetPath = match[1];
      const key = `${relative}:${assetPath}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const fullAssetPath = path.join(repoRoot, "public", assetPath);
      if (!await pathExists(fullAssetPath)) {
        failures.push(`${relative}: missing asset ${assetPath}`);
      }
    }
  }

  return failures;
};

const assertRepoHygiene = async () => {
  const failures = [];
  const removedPaths = ["html designs", "social-card.html", "public/assets/openstudio/feature-story/curated-v2"];

  for (const removedPath of removedPaths) {
    if (await pathExists(path.join(repoRoot, removedPath))) {
      failures.push(`${removedPath} should not exist in the launch tree`);
    }
  }

  const ignoredTracked = spawnSync("git", ["ls-files", "-ci", "--exclude-standard"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (ignoredTracked.status === 0) {
    const offenders = ignoredTracked.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line !== "release-input/README.md");

    for (const offender of offenders) {
      failures.push(`${offender} is tracked but now ignored`);
    }
  }

  const checkScreenshots = spawnSync("git", ["check-ignore", "-q", ".screenshots/"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (checkScreenshots.status !== 0) {
    failures.push(".screenshots/ is not ignored");
  }

  return failures;
};

export const validateLaunchReadiness = async () => {
  const files = await collectTextFiles();
  const failures = [
    ...await assertCleanText(files),
    ...await assertAssetReferencesExist(files),
    ...await assertRepoHygiene(),
  ];

  if (failures.length > 0) {
    throw new Error(`Launch readiness failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await validateLaunchReadiness();
    console.log("[launch] readiness checks passed.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
