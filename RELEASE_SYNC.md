# Website and desktop release order

The website can deploy before the next desktop release. Keep download URLs driven
by GitHub releases and published release metadata, never by the local desktop version or a future tag. Website buttons use the exact GitHub assets for the displayed release; installed-app update feeds and stable redirect endpoints continue to use the published manifests.

## Website-only deployment

1. Push the website changes to the branch connected to the production Netlify site.
2. All Netlify build contexts enable `OPENSTUDIO_FETCH_RELEASE_METADATA=true`
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
All dev/build starts run `sync-github-data` for the site's GitHub-derived labels and release history. Clean CI/Netlify builds require a successful fetch; local builds can reuse a verified snapshot less than 24 hours old after a temporary API failure. Published manifests/appcasts use a separate fetch path: builds automatically retrieve them when local inputs are absent, and Netlify refreshes them for every deployment, including previews. Existing valid local inputs are reused; malformed inputs fail validation instead of being silently replaced. The command above explicitly refreshes them.

`GITHUB_TOKEN` authenticates site-data build/runtime requests. `OPENSTUDIO_RELEASE_SOURCE_TOKEN` (falling back to `GH_TOKEN`) authenticates published-metadata discovery. CI supplies its read-only token through both paths. Public release-asset downloads never receive these credentials. Configure the appropriate server-side token for each path when increasing API quota, and do not commit credentials or generated `release-input` files.

## Desktop release

1. Push the app source. A source push alone does not publish new installers or runtimes.
2. If runtime inputs changed, publish and validate the separate AI runtime release
   first, then set the desktop release's runtime tag/version to that published pair.
3. Publish the desktop release. Its manifests carry the real runtime URLs, sizes,
   checksums and backend install plans. The existing `openstudio_release_published`
   dispatch workflow stages those exact assets and deploys the website.
4. Update the "next desktop release" wording in `src/data/aiSetup.ts` only after the
   matching desktop build is available. Review `src/features/docs/content/ai-runtime-setup.ts` and any affected guide `appReference` alongside the shared model catalog. Verify Download, AI and AI Tools setup. No separate manual archive is advertised for an install plan.

The website validates and preserves Windows CUDA/DirectML and Linux CUDA/ROCm
plans; it does not execute them or rewrite package pins. The currently published
runtime metadata layouts remain supported so deploying this repository first is safe.

## Redesign and branding release checks

1. Include the canonical-route redirects and serverless functions with the website deployment. Verify the public privacy page without JavaScript, consent controls, a legacy `/v2` link, a blog/doc deep link, a real 404, and all metadata/download endpoints in the README.
2. Check `/.netlify/functions/github-release` for a successful small JSON response, current stable tag, matching installer sizes/URLs and cache headers. Confirm fallback labels remain usable if it is unavailable. Verify metadata/appcasts separately; a successful HTML page does not prove they were published.
3. Check fresh and returning-browser favicon/PWA/social images. Follow the [branding inventory](docs/branding-and-download-audit.md) for generated Store artwork and external upload locations.
4. Rebuild and qualify new Windows/macOS/Linux app packages before publishing the app rebrand. A successful website or Debug build does not change existing installers or prove native icon/installer behavior on every platform. Use the app's `docs/branding.md` and release smoke checklist.
5. Recapture the two plugin-window screenshots listed in the inventory when replacing their baked-in old title-bar icons. Historical screenshots and released binaries are not changed by icon generation.

## Historical baseline (September 9, 2026)

The GitHub desktop release is `v0.1.01`, referencing AI runtime `0.0.13` with a
Windows x64 base ZIP, macOS arm64 ZIP and Linux x64 CPU ZIP. No macOS x64 runtime
archive is advertised by that manifest even though the DAW itself is universal.
The app's new in-app Hugging Face downloads, Stable Audio conversion and optional local model imports are
documented as awaiting the next desktop release; uploading the website does not
make those features available in an older installed app.

At inspection, the live app/runtime metadata URLs returned 404. The production
fetch step addresses the missing-input path on the next successful website deploy;
it does not change the live site until deployed.
