# OpenStudio Website

Static marketing site for the first public OpenStudio release.

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The website build can also stage generated AI runtime metadata into stable public JSON paths before Vite runs. By default it looks for deploy inputs under `release-input/`.

## Netlify

- Netlify config lives in [netlify.toml](./netlify.toml).
- `/download/windows/latest` and `/download/macos/latest` are real redirects, not React routes.
- `/download/ai-runtime/windows/latest` and `/download/ai-runtime/macos/latest` are optional convenience redirects for the downloadable AI runtime.
- All other paths fall back to `/index.html` so direct refresh works for React Router pages like `/features` and `/download`.

## Update Release Redirects

- `/download/windows/latest`
- `/download/macos/latest`
- `/download/ai-runtime/windows/latest`
- `/download/ai-runtime/macos/latest`

These paths now rewrite to path-based Netlify function endpoints:

- `/.netlify/functions/download-latest-windows`
- `/.netlify/functions/download-latest-macos`
- `/.netlify/functions/download-latest-ai-runtime-windows`
- `/.netlify/functions/download-latest-ai-runtime-macos`

The installer redirect functions still resolve from the latest GitHub Release for `sdevil7th/OpenStudio`.
The optional AI runtime redirect functions resolve from the published AI runtime manifest and pass through to the GitHub Release asset URL already embedded by the desktop pipeline.

## AI Runtime Metadata Deploy Inputs

The desktop release pipeline is the producer of AI runtime metadata. This repo only validates and republishes that metadata at stable website URLs.

Expected deploy inputs:

- `release-input/releases/ai-runtime/latest.json`
- `release-input/releases/ai-runtime/stable/latest.json`

Published output paths:

- `/releases/ai-runtime/latest.json`
- `/releases/ai-runtime/stable/latest.json`

The website also validates that the root and stable manifests are equivalent before publish so it never serves divergent stable JSON.

Required schema fields:

- `schemaVersion`
- `channel`
- `appVersion`
- `runtimeVersion`
- `publishedAt`
- `platforms.windows.url`
- `platforms.windows.sha256`
- `platforms.windows.size`
- `platforms.windows.fileName`
- `platforms.macos.url`
- `platforms.macos.sha256`
- `platforms.macos.size`
- `platforms.macos.fileName`

Build commands related to runtime metadata:

```bash
npm run stage-ai-runtime-metadata
npm run validate-ai-runtime-metadata
```

Environment variables:

- `GITHUB_TOKEN`
- `OPENSTUDIO_RUNTIME_METADATA_DIR`
  - Optional. Defaults to `release-input`.
- `OPENSTUDIO_REQUIRE_AI_RUNTIME_METADATA`
  - Optional. Set to `true` in deploy/CI when AI runtime metadata must be present.

## Environment Variables

- `GITHUB_TOKEN`

`GITHUB_TOKEN` is optional for local testing, but recommended for Netlify production deploys to reduce the risk of GitHub API rate limits. If it is not set, the download lookup and GitHub snapshot functions fall back to unauthenticated GitHub API requests.

## Local Redirect Testing

Start the local dev server:

```bash
npm install
npm run dev
```

Then verify these URLs locally:

```bash
curl -I http://localhost:8080/download/windows/latest
curl -I http://localhost:8080/download/macos/latest
curl -I http://localhost:8080/download/ai-runtime/windows/latest
curl -I http://localhost:8080/download/ai-runtime/macos/latest
curl -I http://localhost:8080/.netlify/functions/download-latest-windows
curl -I http://localhost:8080/.netlify/functions/download-latest-macos
curl -I http://localhost:8080/.netlify/functions/download-latest-ai-runtime-windows
curl -I http://localhost:8080/.netlify/functions/download-latest-ai-runtime-macos
curl http://localhost:8080/.netlify/functions/github-repo
```

The installer download URLs should respond with `302` and a `Location` header pointing to the latest matching GitHub release asset.
The AI runtime download URLs should respond with `302` and a `Location` header pointing to the platform URL inside the published AI runtime manifest, or fall back to the GitHub releases page if the manifest is unavailable or invalid.

## Netlify Deployment

1. Connect the repo to Netlify or push the branch already connected to the Netlify site.
2. In the Netlify site settings, set:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variable: `GITHUB_TOKEN` (recommended)
   - Environment variable: `OPENSTUDIO_REQUIRE_AI_RUNTIME_METADATA=true` once AI runtime metadata is part of your normal release deploy
3. Deploy the updated branch.

Deployment sequencing:

1. Desktop release pipeline uploads the Windows and macOS AI runtime archives to GitHub Releases.
2. Desktop release pipeline generates:
   - `releases/ai-runtime/latest.json`
   - `releases/ai-runtime/stable/latest.json`
3. Those JSON files are placed into this repo's deploy input directory before `npm run build`.
4. The website build validates the files, republishes them verbatim, and fails if `OPENSTUDIO_REQUIRE_AI_RUNTIME_METADATA=true` and the metadata is missing or malformed.
5. Netlify publishes the built site with stable metadata URLs, no-cache headers, and metadata-driven AI runtime redirects.

## Post-Deploy Verification

After Netlify finishes deploying, verify:

```bash
curl -I https://openstudiowebsite.netlify.app/download/windows/latest
curl -I https://openstudiowebsite.netlify.app/download/macos/latest
curl -I https://openstudiowebsite.netlify.app/download/ai-runtime/windows/latest
curl -I https://openstudiowebsite.netlify.app/download/ai-runtime/macos/latest
curl -I https://openstudiowebsite.netlify.app/.netlify/functions/download-latest-windows
curl -I https://openstudiowebsite.netlify.app/.netlify/functions/download-latest-macos
curl -I https://openstudiowebsite.netlify.app/.netlify/functions/download-latest-ai-runtime-windows
curl -I https://openstudiowebsite.netlify.app/.netlify/functions/download-latest-ai-runtime-macos
curl https://openstudiowebsite.netlify.app/releases/ai-runtime/latest.json
curl https://openstudiowebsite.netlify.app/releases/ai-runtime/stable/latest.json
curl https://openstudiowebsite.netlify.app/.netlify/functions/github-repo
```

Check that:

- `/download/windows/latest` returns `302`
- `/download/macos/latest` returns `302`
- `/download/ai-runtime/windows/latest` returns `302` or falls back cleanly to the GitHub release surface
- `/download/ai-runtime/macos/latest` returns `302` or falls back cleanly to the GitHub release surface
- the installer `Location` header points to the latest GitHub release asset for the matching platform
- the AI runtime `Location` header points to the URL already embedded in the published AI runtime manifest
- the AI runtime metadata JSON files are served and reflect the generated release input
- the GitHub snapshot function returns JSON successfully

## Assets

- Branding assets live in `public/assets/openstudio/branding/`
- Screenshot assets live in `public/assets/openstudio/screenshots/`
- Share image contract lives at `public/assets/openstudio/branding/og-image.png`

The screenshot model is defined in `src/data/screenshots.ts`. Missing screenshots intentionally fall back to labeled placeholders in the UI.

## First Release URLs

- `https://openstudio.org.in/`
- `https://openstudio.org.in/features`
- `https://openstudio.org.in/download`
- `https://openstudio.org.in/download/windows/latest`
- `https://openstudio.org.in/download/macos/latest`
- `https://openstudio.org.in/releases/ai-runtime/latest.json`
- `https://openstudio.org.in/releases/ai-runtime/stable/latest.json`
