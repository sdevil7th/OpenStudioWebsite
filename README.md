# OpenStudio Website

Static marketing site and public release-surface publisher for `openstudio.org.in`.

This repo is now the only public publisher for:

- `/releases/latest.json`
- `/releases/stable/latest.json`
- `/releases/ai-runtime/latest.json`
- `/releases/ai-runtime/stable/latest.json`
- `/appcast/windows-stable.xml`
- `/appcast/macos-stable.xml`
- `/appcast/linux-stable.xml`
- `/download/windows/latest`
- `/download/macos/latest`
- `/download/linux/latest`
- `/download/ai-runtime/windows/latest`
- `/download/ai-runtime/macos/latest`
- `/download/ai-runtime/macos/arm64/latest`
- `/download/ai-runtime/macos/x64/latest`
- `/download/ai-runtime/linux/latest`
- `/download/ai-runtime/linux/x64/latest`
- `/download/ai-runtime/linux/arm64/latest`

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

## Loading Performance Gates

After building, run the repeatable mobile loading check against `dist/`:

```bash
npm run build
npm run verify:mobile-perf
```

The legacy command remains a single-route mobile check. It starts Vite preview itself, opens a fresh 390 x 844 Pixel 5 Chromium context, and applies 4x CPU slowdown plus a 1.6 Mbps/150 ms mobile network profile. Select the desktop profile for the same focused check at 1440 x 900 with 2x CPU slowdown and a conservative 10 Mbps/40 ms connection:

```bash
npm run verify:mobile-perf -- --profile desktop --route /features
```

Run the core loading matrix across Home, Features, Download, AI, and Blogs on both mobile and desktop profiles with:

```bash
npm run verify:perf
```

Matrix measurements run sequentially in isolated browser contexts. The package command uses a two-second post-reveal observation window so deferred requests near the loading boundary are counted consistently. Supplying `--profile mobile` or `--profile desktop` with `--matrix` narrows the matrix to that profile.

The gate fails when the real React main/hero is not visible after the HTML loader, or when app-ready time, post-ready intro time, intro-hidden time, Largest Contentful Paint (LCP), CLS, long tasks, requests, encoded transfer, redirects, console errors, page errors, failed requests, or HTTP errors exceed their budgets. Because prerendered content can paint behind the full-screen intro, the reported LCP retains the browser's buffered native candidate but is floored at the time the hydrated route actually becomes visible. Download intentionally presents its constructed OpenStudio logo before its heading, so that real rendered logo is accepted as the route's first-viewport hero. The post-ready intro budget prevents the older multi-second loader hold from returning even when application startup itself varies between machines.

An already-hosted build can be checked without starting a local server:

```bash
npm run verify:mobile-perf -- --url https://openstudio.org.in --route /
```

Use `npm run verify:mobile-perf -- --help` for all CLI flags. Every tunable flag also has an environment-variable form:

- `MOBILE_PERF_URL`, `MOBILE_PERF_ROUTE`, `MOBILE_PERF_HERO_SELECTOR`, `MOBILE_PERF_JSON`
- `MOBILE_PERF_PROFILE`
- `MOBILE_PERF_MAX_APP_READY_MS`, `MOBILE_PERF_MAX_INTRO_AFTER_READY_MS`, `MOBILE_PERF_MAX_INTRO_HIDDEN_MS`, `MOBILE_PERF_MAX_CONTENT_VISIBLE_MS`, `MOBILE_PERF_MAX_LCP_MS`
- `MOBILE_PERF_MAX_CLS`, `MOBILE_PERF_MAX_LONG_TASK_COUNT`, `MOBILE_PERF_MAX_LONG_TASK_MS`, `MOBILE_PERF_MAX_LONG_TASK_TOTAL_MS`
- `MOBILE_PERF_MAX_REQUESTS`, `MOBILE_PERF_MAX_TRANSFER_KB`
- `MOBILE_PERF_CPU_RATE`, `MOBILE_PERF_DOWNLOAD_KBPS`, `MOBILE_PERF_UPLOAD_KBPS`, `MOBILE_PERF_LATENCY_MS`, `MOBILE_PERF_SETTLE_MS`, `MOBILE_PERF_TIMEOUT_MS`

The checked-in mobile LCP budget is 4 seconds; the desktop budget is 3.6 seconds. The latter accommodates the intentional desktop logo construction while still rejecting the 4-second "poor" boundary. Desktop permits up to 45 requests and 1,000 KiB because it intentionally loads larger visual assets, while retaining stricter startup and long-task budgets. These laboratory budgets should be recalibrated from repeated cold runs when the hosting transport or route asset strategy changes. Override only a budget that has a measured reason to differ.

A machine-readable result can be saved under the existing artifact area with `--json output/playwright/mobile-performance.json`. Legacy single-route mode retains the original result object. Matrix mode writes an envelope with the profile, route, and result for each measurement.

## Deploy Inputs

The desktop release pipeline is expected to generate these files and publish them as GitHub Release assets. The website workflow or a local operator stages them into `release-input/` before the build runs.

Expected staged deploy-input files:

- `release-input/releases/latest.json`
- `release-input/releases/stable/latest.json`
- `release-input/releases/ai-runtime/latest.json`
- `release-input/releases/ai-runtime/stable/latest.json`
- `release-input/appcast/windows-stable.xml`
- `release-input/appcast/macos-stable.xml`
- `release-input/appcast/linux-stable.xml` when `releases/stable/latest.json` includes `platforms.linux`

Expected desktop release asset filenames:

- `OpenStudio-release-latest.json`
- `OpenStudio-release-stable-latest.json`
- `OpenStudio-ai-runtime-latest.json`
- `OpenStudio-ai-runtime-stable-latest.json`
- `OpenStudio-appcast-windows-stable.xml`
- `OpenStudio-appcast-macos-stable.xml`
- `OpenStudio-appcast-linux-stable.xml` when Linux app metadata is published

Common AI runtime binary asset names referenced by metadata:

- `OpenStudio-AI-Runtime-windows-base-x64.zip`
- `OpenStudio-AI-Runtime-windows-directml-x64.zip` when a downloadable backend archive is published instead of an install plan
- `OpenStudio-AI-Runtime-windows-cuda-x64.zip` when a downloadable backend archive is published instead of an install plan
- `OpenStudio-AI-Runtime-macos-arm64.zip`
- `OpenStudio-AI-Runtime-macos-x64.zip`
- `OpenStudio-AI-Runtime-linux-x64.zip`
- `OpenStudio-AI-Runtime-linux-arm64.zip`

Published output paths:

- `/releases/latest.json`
- `/releases/stable/latest.json`
- `/releases/ai-runtime/latest.json`
- `/releases/ai-runtime/stable/latest.json`
- `/appcast/windows-stable.xml`
- `/appcast/macos-stable.xml`
- `/appcast/linux-stable.xml` when provided

Validation rules:

- app release root/stable manifests must both exist and match after JSON normalization
- AI runtime root/stable manifests must both exist and match after JSON normalization
- app release JSON must include `schemaVersion`, `channel`, `version`, `publishedAt`, `releasePageUrl`, `platforms.windows`, and `platforms.macos`; `platforms.linux` is optional
- AI runtime JSON must include `schemaVersion`, `channel`, `appVersion`, `runtimeVersion`, `publishedAt`, `platforms.windows`, and `platforms.macos`; `platforms.linux` is optional
- AI runtime Windows metadata may be published as a legacy flat `platforms.windows` entry, an old nested backend-asset shape under `platforms.windows.backends`, the new `platforms.windows.base` plus `platforms.windows.backends.<backend>.installPlan` shape, or a mixed transition manifest that contains both legacy and new fields
- AI runtime macOS metadata may be published either as the legacy flat `platforms.macos` entry or as the current nested `platforms.macos.arm64` and `platforms.macos.x64` entries
- AI runtime Linux metadata may be published either as a legacy flat `platforms.linux` entry or as nested `platforms.linux.x64` and `platforms.linux.arm64` entries
- downloadable manifest asset entries must include `url`, `sha256`, `size`, and `fileName`
- Windows backend install-plan entries must expose an `installPlan` object and are published verbatim
- Windows and macOS stable appcasts must be present, valid XML, and align with the stable app manifest enclosure data; the Linux appcast is required when Linux app metadata is published

Current AI runtime manifest shape:

```json
{
  "schemaVersion": 4,
  "channel": "stable",
  "appVersion": "0.0.22",
  "runtimeVersion": "2026.04.05",
  "publishedAt": "2026-04-05T00:00:00.000Z",
  "platforms": {
    "windows": {
      "base": {
        "url": "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.22/OpenStudio-AI-Runtime-windows-base-x64.zip",
        "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        "size": 123,
        "fileName": "OpenStudio-AI-Runtime-windows-base-x64.zip"
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
    },
    "linux": {
      "x64": {
        "url": "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.22/OpenStudio-AI-Runtime-linux-x64.zip",
        "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "size": 123,
        "fileName": "OpenStudio-AI-Runtime-linux-x64.zip"
      },
      "arm64": {
        "url": "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.22/OpenStudio-AI-Runtime-linux-arm64.zip",
        "sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "size": 123,
        "fileName": "OpenStudio-AI-Runtime-linux-arm64.zip"
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

- `/download/windows/latest`, `/download/macos/latest`, and `/download/linux/latest` resolve from `/releases/stable/latest.json` first, then fall back to GitHub latest-release asset matching if metadata is not available.
- `/download/ai-runtime/windows/latest` resolves to `platforms.windows.base.url` when the new Windows manifest shape is present, otherwise it falls back to the legacy flat `platforms.windows.url` entry when available.
- Windows backend install-plan metadata is preserved verbatim in the published JSON at `/releases/ai-runtime/latest.json` and `/releases/ai-runtime/stable/latest.json`.
- `/download/ai-runtime/windows/latest` does not treat `platforms.windows.backends.cuda` or `platforms.windows.backends.directml` as downloadable URLs when those entries only contain `installPlan`.
- `/download/ai-runtime/macos/arm64/latest` and `/download/ai-runtime/macos/x64/latest` resolve from the published AI runtime manifest and should be preferred when the caller knows the target architecture.
- `/download/ai-runtime/macos/latest` remains a best-effort convenience redirect. It still supports the legacy flat macOS manifest entry, and for the new nested shape it will honor `?arch=arm64` or `?arch=x64` when present, otherwise it only redirects when it can infer the architecture safely.
- `/download/ai-runtime/linux/x64/latest` and `/download/ai-runtime/linux/arm64/latest` resolve from the published AI runtime manifest and should be preferred when the caller knows the target architecture.
- `/download/ai-runtime/linux/latest` supports the legacy flat Linux manifest entry and otherwise falls back to `x64`, then `arm64`, when no architecture is provided.
- Netlify never hosts the `.exe`, `.dmg`, `.AppImage`, or AI runtime archive files.

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
3. download the generated metadata/appcast assets from the desktop GitHub Release for `tag`, including the Linux appcast when present
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
curl https://openstudio.org.in/appcast/linux-stable.xml
curl -I https://openstudio.org.in/download/windows/latest
curl -I https://openstudio.org.in/download/macos/latest
curl -I https://openstudio.org.in/download/linux/latest
curl -I https://openstudio.org.in/download/ai-runtime/windows/latest
curl -I https://openstudio.org.in/download/ai-runtime/macos/latest
curl -I https://openstudio.org.in/download/ai-runtime/macos/arm64/latest
curl -I https://openstudio.org.in/download/ai-runtime/macos/x64/latest
curl -I https://openstudio.org.in/download/ai-runtime/linux/latest
curl -I https://openstudio.org.in/download/ai-runtime/linux/x64/latest
curl -I https://openstudio.org.in/download/ai-runtime/linux/arm64/latest
```

Check that:

- metadata/appcast files are live
- metadata/appcast files are uncached
- app download redirects resolve through the published app release metadata to GitHub Release asset URLs
- AI runtime redirects resolve through the published AI runtime metadata to GitHub Release asset URLs

## Assets

- Branding assets live in `public/assets/openstudio/branding/`
- Screenshot assets live in `public/assets/openstudio/screenshots/`
- Share image contract lives at `public/assets/openstudio/branding/og-image.png?v=2`
