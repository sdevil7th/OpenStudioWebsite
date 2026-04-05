import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAiRuntimeMetadataInputDir, isAiRuntimeMetadataRequired, stageAiRuntimeMetadata } from "./ai-runtime-metadata.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

try {
  const result = await stageAiRuntimeMetadata({ repoRoot });

  if (result.staged) {
    console.log(
      `[ai-runtime] staged runtime metadata from '${path.relative(repoRoot, result.inputRoot)}' into '${path.relative(repoRoot, result.outputRoot)}'.`,
    );
  } else {
    console.log(
      `[ai-runtime] no runtime metadata staged from '${getAiRuntimeMetadataInputDir()}'. Required=${isAiRuntimeMetadataRequired()}.`,
    );
  }
} catch (error) {
  console.error(`[ai-runtime] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
