import path from "node:path";
import { fileURLToPath } from "node:url";
import { isReleaseMetadataRequired, validateReleasePublishInputsTree } from "./release-publish-inputs.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
let root = "public";

for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--root" && args[index + 1]) {
    root = args[index + 1];
    index += 1;
  }
}

try {
  const result = await validateReleasePublishInputsTree(path.resolve(repoRoot, root), {
    requireMetadata: isReleaseMetadataRequired(),
  });

  if (result.found) {
    console.log(`[release-publish] validated release metadata and appcasts under '${root}'.`);
  } else {
    console.log(`[release-publish] no release metadata present under '${root}'.`);
  }
} catch (error) {
  console.error(`[release-publish] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
