import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getReleaseMetadataInputDir,
  isReleaseMetadataRequired,
  stageReleasePublishInputs,
} from "./release-publish-inputs.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

try {
  const result = await stageReleasePublishInputs({ repoRoot });

  if (result.staged) {
    if (result.hydration?.hydrated) {
      console.log(
        `[release-publish] rehydrated release metadata from ${result.hydration.repo} release '${result.hydration.tag ?? "latest"}'.`,
      );
    }

    console.log(
      `[release-publish] staged release metadata and appcasts from '${path.relative(repoRoot, result.inputRoot)}' into '${path.relative(repoRoot, result.outputRoot)}'.`,
    );
  } else {
    console.log(
      `[release-publish] no release metadata staged from '${getReleaseMetadataInputDir()}'. Required=${isReleaseMetadataRequired()}.`,
    );
  }
} catch (error) {
  console.error(`[release-publish] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
