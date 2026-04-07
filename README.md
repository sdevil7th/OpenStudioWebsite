# OpenStudio Website

Static marketing site and public release-surface publisher for `openstudio.org.in`.

This repo is now the only public publisher for:

- `/releases/latest.json`
- `/releases/stable/latest.json`
- `/releases/ai-runtime/latest.json`
- `/releases/ai-runtime/stable/latest.json`
- `/appcast/windows-stable.xml`
- `/appcast/macos-stable.xml`
- `/download/windows/latest`
- `/download/macos/latest`
- `/download/ai-runtime/windows/latest`
- `/download/ai-runtime/macos/latest`
- `/download/ai-runtime/macos/arm64/latest`
- `/download/ai-runtime/macos/x64/latest`

GitHub Releases remain the binary origin. This repo publishes release metadata and appcasts, then exposes stable redirect surfaces that resolve to GitHub-hosted binaries.

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run stage-release-publish-inputs
npm run validate-release-publish-inputs
npm run build
npm run preview
```

`npm run build` stages deploy inputs into `public/`, validates them again from the staged output, and then runs the Vite build.

## Deploy Inputs

The desktop release pipeline is expected to generate these files and publish them as GitHub Release assets. The website workflow or a local operator stages them into `release-input/` before the build runs.

Expected staged deploy-input files:

- `release-input/releases/latest.json`
- `release-input/releases/stable/latest.json`
- `release-input/releases/ai-runtime/latest.json`
- `release-input/releases/ai-runtime/stable/latest.json`
- `release-input/appcast/windows-stable.xml`
- `release-input/appcast/macos-stable.xml`

Expected desktop release asset filenames:

- `OpenStudio-release-latest.json`
- `OpenStudio-release-stable-latest.json`
- `OpenStudio-ai-runtime-latest.json`
- `OpenStudio-ai-runtime-stable-latest.json`
- `OpenStudio-appcast-windows-stable.xml`
- `OpenStudio-appcast-macos-stable.xml`

Current AI runtime binary asset names referenced by metadata:

- `OpenStudio-AI-Runtime-windows-base.zip`
- `OpenStudio-AI-Runtime-macos-arm64.zip`
- `OpenStudio-AI-Runtime-macos-x64.zip`

Published output paths:

- `/releases/latest.json`
- `/releases/stable/latest.json`
- `/releases/ai-runtime/latest.json`
- `/releases/ai-runtime/stable/latest.json`
- `/appcast/windows-stable.xml`
- `/appcast/macos-stable.xml`

Validation rules:

- app release root/stable manifests must both exist and match after JSON normalization
- AI runtime root/stable manifests must both exist and match after JSON normalization
- app release JSON must include `schemaVersion`, `channel`, `version`, `publishedAt`, `releasePageUrl`, `platforms.windows`, and `platforms.macos`
- AI runtime JSON must include `schemaVersion`, `channel`, `appVersion`, `runtimeVersion`, `publishedAt`, `platforms.windows`, and `platforms.macos`
- AI runtime Windows metadata may be published as a legacy flat `platforms.windows` entry, an old nested backend-asset shape under `platforms.windows.backends`, the new `platforms.windows.base` plus `platforms.windows.backends.<backend>.installPlan` shape, or a mixed transition manifest that contains both legacy and new fields
- AI runtime macOS metadata may be published either as the legacy flat `platforms.macos` entry or as the current nested `platforms.macos.arm64` and `platforms.macos.x64` entries
- downloadable manifest asset entries must include `url`, `sha256`, `size`, and `fileName`
- Windows backend install-plan entries must expose an `installPlan` object and are published verbatim
- both stable appcasts must be present, valid XML, and align with the stable app manifest enclosure data

Current AI runtime manifest shape:

```json
{
  "schemaVersion": 1,
  "channel": "stable",
  "appVersion": "0.0.22",
  "runtimeVersion": "2026.04.05",
  "publishedAt": "2026-04-05T00:00:00.000Z",
  "platforms": {
    "windows": {
      "base": {
        "url": "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.22/OpenStudio-AI-Runtime-windows-base.zip",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "size": 123,
        "fileName": "OpenStudio-AI-Runtime-windows-base.zip"
      },
      "backends": {
        "cuda": {
          "installPlan": {
            "version": 1,
            "steps": [
              {
                "action": "detect",
                "backend": "cuda"
              },
              {
                "action": "install",
                "package": "openstudio-cuda-runtime"
              }
            ]
          }
        },
        "directml": {
          "installPlan": {
            "version": 1,
            "steps": [
              {
                "action": "detect",
                "backend": "directml"
              },
              {
                "action": "install",
                "package": "openstudio-directml-runtime"
              }
            ]
          }
        }
      }
    },
    "macos": {
      "arm64": {
        "url": "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.22/OpenStudio-AI-Runtime-macos-arm64.zip",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "size": 123,
        "fileName": "OpenStudio-AI-Runtime-macos-arm64.zip"
      },
      "x64": {
        "url": "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.22/OpenStudio-AI-Runtime-macos-x64.zip",
        "sha256": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
        "size": 123,
        "fileName": "OpenStudio-AI-Runtime-macos-x64.zip"
      }
    }
  }
}
```

## Environment Variables And Secrets

Build/runtime env:

- `GITHUB_TOKEN`
  - Optional at runtime, recommended to reduce GitHub API rate-limit risk for the snapshot and installer redirect functions.
- `OPENSTUDIO_RELEASE_METADATA_DIR`
  - Optional. Defaults to `release-input`.
- `OPENSTUDIO_REQUIRE_RELEASE_METADATA`
  - Optional in local dev.
  - Set to `true` for release-publish builds so missing or malformed metadata/appcasts fail the build.
- `OPENSTUDIO_DESKTOP_REPO`
  - Optional. Defaults to `sdevil7th/OpenStudio`.
  - Used by runtime GitHub helpers and by the publish workflow contract.

Website workflow secrets:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `OPENSTUDIO_RELEASE_SOURCE_TOKEN`
  - Optional but recommended if desktop release assets are private or if you want a dedicated token for release asset downloads.

Desktop-side secret outside this repo:

- a token with permission to send `repository_dispatch` events to this website repo

## Redirect Behavior

- `/download/windows/latest` and `/download/macos/latest` remain GitHub-release-backed installer redirects.
- `/download/ai-runtime/windows/latest` resolves to `platforms.windows.base.url` when the new Windows manifest shape is present, otherwise it falls back to the legacy flat `platforms.windows.url` entry when available.
- Windows backend install-plan metadata is preserved verbatim in the published JSON at `/releases/ai-runtime/latest.json` and `/releases/ai-runtime/stable/latest.json`.
- `/download/ai-runtime/windows/latest` does not treat `platforms.windows.backends.cuda` or `platforms.windows.backends.directml` as downloadable URLs when those entries only contain `installPlan`.
- `/download/ai-runtime/macos/arm64/latest` and `/download/ai-runtime/macos/x64/latest` resolve from the published AI runtime manifest and should be preferred when the caller knows the target architecture.
- `/download/ai-runtime/macos/latest` remains a best-effort convenience redirect. It still supports the legacy flat macOS manifest entry, and for the new nested shape it will honor `?arch=arm64` or `?arch=x64` when present, otherwise it only redirects when it can infer the architecture safely.
- Netlify never hosts the `.exe`, `.dmg`, or AI runtime `.zip` files.

## Website Publish Workflow

This repo includes a release-publish workflow triggered by `repository_dispatch`.

Assumed event name:

- `openstudio_release_published`

Assumed payload shape:

```json
{
  "tag": "v1.2.3",
  "channel": "stable",
  "desktopRepo": "sdevil7th/OpenStudio"
}
```

Workflow behavior:

1. validate the dispatch payload and reject non-`stable` channels
2. validate `desktopRepo` matches the configured `OPENSTUDIO_DESKTOP_REPO`
3. download the six generated metadata/appcast assets from the desktop GitHub Release for `tag`
4. map them into `release-input/`
5. run `npm ci`
6. run `npm run validate-release-publish-inputs -- --root release-input`
7. run `npm run build` with `OPENSTUDIO_REQUIRE_RELEASE_METADATA=true`
8. deploy `dist/` to Netlify

## Netlify

- Netlify config lives in [netlify.toml](./netlify.toml).
- Release metadata and appcasts are published as static files from the site build output.
- The latest download paths are real Netlify redirects/functions, not React routes.
- All metadata and appcast surfaces are served with:
  - `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`

## Manual Verification

After deploy, verify:

```bash
curl https://openstudio.org.in/releases/latest.json
curl https://openstudio.org.in/releases/stable/latest.json
curl https://openstudio.org.in/releases/ai-runtime/latest.json
curl https://openstudio.org.in/releases/ai-runtime/stable/latest.json
curl https://openstudio.org.in/appcast/windows-stable.xml
curl https://openstudio.org.in/appcast/macos-stable.xml
curl -I https://openstudio.org.in/download/windows/latest
curl -I https://openstudio.org.in/download/macos/latest
curl -I https://openstudio.org.in/download/ai-runtime/windows/latest
curl -I https://openstudio.org.in/download/ai-runtime/macos/latest
curl -I https://openstudio.org.in/download/ai-runtime/macos/arm64/latest
curl -I https://openstudio.org.in/download/ai-runtime/macos/x64/latest
```

Check that:

- all six metadata/appcast files are live
- all six metadata/appcast files are uncached
- installer redirects resolve to GitHub Release asset URLs
- AI runtime redirects resolve through the published AI runtime metadata to GitHub Release asset URLs

## Assets

- Branding assets live in `public/assets/openstudio/branding/`
- Screenshot assets live in `public/assets/openstudio/screenshots/`
- Share image contract lives at `public/assets/openstudio/branding/og-image.png?v=2`
