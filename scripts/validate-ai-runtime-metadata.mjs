import path from "node:path";
import { fileURLToPath } from "node:url";
import { isAiRuntimeMetadataRequired, validateAiRuntimeMetadataTree } from "./ai-runtime-metadata.mjs";

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
  const result = await validateAiRuntimeMetadataTree(path.resolve(repoRoot, root), {
    requireMetadata: isAiRuntimeMetadataRequired(),
  });

  if (result.found) {
    console.log(`[ai-runtime] validated runtime metadata under '${root}'.`);
  } else {
    console.log(`[ai-runtime] no runtime metadata present under '${root}'.`);
  }
} catch (error) {
  console.error(`[ai-runtime] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
