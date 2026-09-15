import path from "node:path";
import { fetchReleasePublishInputs } from "./fetch-release-publish-inputs.mjs";
import { fileURLToPath } from "node:url";
import {
  getReleaseMetadataInputDir,
  stageReleasePublishInputs,
  validateReleasePublishInputsTree,
} from "./release-publish-inputs.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

/** A clean website build must preserve the update endpoints used by installed apps. */
export async function prepareReleasePublishInputs({
  root = repoRoot,
  inputDir = getReleaseMetadataInputDir(),
  refresh = process.env.OPENSTUDIO_FETCH_RELEASE_METADATA === "true",
  fetchInputs = fetchReleasePublishInputs,
} = {}) {
  const existing = refresh ? null : await validateReleasePublishInputsTree(path.resolve(root, inputDir), { requireMetadata: false });
  let fetchedTag;
  if (refresh || !existing?.found) {
    const fetched = await fetchInputs({ repoRoot: root, inputDir });
    fetchedTag = fetched.tag;
  }
  const result = await stageReleasePublishInputs({ repoRoot: root, inputDir, requireMetadata: true });
  return { ...result, fetchedTag };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  try {
    const result = await prepareReleasePublishInputs();
    if (result.fetchedTag) console.log(`[release-publish] fetched and validated ${result.fetchedTag}.`);
    console.log(
      `[release-publish] staged release metadata and appcasts from '${path.relative(repoRoot, result.inputRoot)}' into '${path.relative(repoRoot, result.outputRoot)}'.`,
    );
  } catch (error) {
    console.error(`[release-publish] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
