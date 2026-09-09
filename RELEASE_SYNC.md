# Website and desktop release order

The website can deploy before the next desktop release. Keep download URLs driven
by published release metadata, never by the local desktop version or a future tag.

## Website-only deployment

1. Push the website changes to the branch connected to the production Netlify site.
2. The production Netlify context enables `OPENSTUDIO_FETCH_RELEASE_METADATA=true`
   and `OPENSTUDIO_REQUIRE_RELEASE_METADATA=true`. The normal build downloads the
   newest published stable desktop release's JSON and appcasts from GitHub. Runtime,
   FFmpeg, draft and prerelease tags are excluded. Failure to download or validate
   the complete set fails the deploy, leaving the preceding deploy active.
3. Confirm `/privacy`, `/download`, `/ai`, `/releases/latest.json`,
   `/releases/ai-runtime/latest.json` and `/appcast/windows-stable.xml` respond.
   Check the stable variants and macOS/Linux appcasts too. Runtime redirects must
   resolve to the published platform archive, not merely the GitHub releases page.

For a local build with the same release inputs, run
`npm run fetch-release-publish-inputs` followed by `npm run build`.
Ordinary local/CI builds do not require network discovery unless explicitly enabled.
The public repository needs no token; an optional `OPENSTUDIO_RELEASE_SOURCE_TOKEN`
can raise the GitHub API rate limit. Credentials are sent only to the GitHub API,
not to the public asset CDN. Do not commit credentials or generated `release-input` files.

## Desktop release

1. Push the app source. A source push alone does not publish new installers or runtimes.
2. If runtime inputs changed, publish and validate the separate AI runtime release
   first, then set the desktop release's runtime tag/version to that published pair.
3. Publish the desktop release. Its manifests carry the real runtime URLs, sizes,
   checksums and backend install plans. The existing `openstudio_release_published`
   dispatch workflow stages those exact assets and deploys the website.
4. Update the "next desktop release" wording in `src/data/aiSetup.ts` only after the
   matching desktop build is available. Verify both Download and AI pages; they use
   the same setup guide. No separate manual archive is advertised for an install plan.

The website validates and preserves Windows CUDA/DirectML and Linux CUDA/ROCm
plans; it does not execute them or rewrite package pins. The currently published
runtime metadata layouts remain supported so deploying this repository first is safe.

## Verified baseline (September 9, 2026)

The GitHub desktop release is `v0.1.01`, referencing AI runtime `0.0.13` with a
Windows x64 base ZIP, macOS arm64 ZIP and Linux x64 CPU ZIP. No macOS x64 runtime
archive is advertised by that manifest even though the DAW itself is universal.
The app's new Stable Audio Diffusers conversion and MiniMax model import are
documented as awaiting the next desktop release; uploading the website does not
make those features available in an older installed app.

At inspection, the live app/runtime metadata URLs returned 404. The production
fetch step addresses the missing-input path on the next successful website deploy;
it does not change the live site until deployed.
