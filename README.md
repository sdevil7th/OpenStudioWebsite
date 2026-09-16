<p align="center"><img src="public/assets/openstudio/branding/icon.png" width="112" height="112" alt="OpenStudio logo" /></p>

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

## Website structure

The Studio Paper redesign is the sole website. Source folders describe their responsibility, without a website-version prefix. `/v2/*` remains a compatibility redirect for existing preview links.

- `src/App.tsx`: canonical routes, legacy aliases and lazy page boundaries.
- `src/pages/`: lazy website page components, plus the not-found page and development-only artwork tool.
- `src/components/layout/`: `SiteShell.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx` and the footer-lead context. The shell owns shared layout and privacy controls.
- `src/components/ui/`: shared website presentation primitives.
- `src/features/docs/content/`: one typed, lazy-loaded module per guide. Each records the app revision and release/development status it describes.
- `src/features/daw-preview/`: optional animated illustrations, scheduler and pinned upstream UI. See its `vendor/README.md` before syncing.
- `src/hooks/`: shared release, platform, media-query, section-reveal and navigation hooks.
- `src/constants/routes.ts`: canonical `SITE_PATHS`, `docPath` and `blogPostPath`; `src/data/siteContent.ts` contains shared repository/contact/media references.
- `src/lib/`: formatting, analytics, loading and SEO helpers.
- `src/data/`: shared legal policy, model setup, generated GitHub release data and blog metadata. Legal policy text has one source in `legal.ts`.
- `src/components/ResponsiveImage.tsx`: browser-selected image variants with original-image fallback; no image GraphQL service.
- `src/styles/site.css`: shared design tokens, typography, responsive component styles and animation effects in Tailwind's component layer. Ordinary page layouts use Tailwind utilities; runtime artwork geometry remains inline.
- `src/prerender.tsx` and `scripts/prerender-site.mjs`: render the actual page components into static HTML, route-specific head metadata, sitemap and exact hosting rewrites.
- `shared/` and `netlify/functions/`: release/runtime contracts and stable download endpoints.
- `shared/github-snapshot.ts`: the repository snapshot types and nested JSON parser shared by build generation, the GitHub function and browser refreshes.

See [repository instructions](AGENTS.md), [source structure and cleanup verification](docs/source-structure.md), [guide authoring](src/features/docs/README.md), and [migration plan and verification](docs/redesign-migration.md) for maintenance rules and regression checks.
The [final pre-push review](docs/final-review.md) records clean-checkout validation
and the remaining deployment/release checks for this migration.
The [review follow-up](docs/review-follow-up.md) records the subsequent navigation,
upgrade guidance, image delivery and data-validation fixes, including the pending
native plugin screenshot captures.

## Local

Use Node.js 22.12 or newer (CI uses Node 22). Dev/build startup fetches current GitHub repository and release data. Clean builds require internet access; local builds can reuse a previously verified snapshot less than 24 hours old during a temporary API outage or quota limit. `GITHUB_TOKEN` increases the API rate limit, and CI supplies its read-only token. Run `npm run sync-github-data` separately when refreshing generated release data.

A build also retrieves the published release manifests and appcasts when local
release inputs are absent. Valid existing inputs can be reused locally; Netlify
deployments refresh them. Missing, invalid or unavailable release inputs fail
the build instead of publishing broken update links. CI provides its read-only
token as both `GITHUB_TOKEN` and `GH_TOKEN` for these separate fetch paths.

```bash
npm ci
npm run dev
```

## Build

```bash
npm run stage-release-publish-inputs
npm run validate-release-publish-inputs
npm run build
npm run preview
```

`npm run build` fetches current GitHub data, generates branding, responsive images and blog HTML, stages and validates release inputs, runs strict TypeScript checking, builds the client and prerenders all canonical pages. Run `npm run lint` and `npm test` for the remaining CI checks. Browser tests require `npx playwright install chromium`.
The TypeScript build covers client code, configuration, all shared TypeScript
modules and all Netlify functions. Network and cached repository snapshots must
pass the shared runtime parser before use; malformed browser refreshes preserve
the valid build snapshot.

## Test coverage

Run `npm run build` before `npm test` in a clean checkout; tests consume the generated GitHub payloads and production documents. CI runs lint, build and the complete test suite after installing Chromium.

- Browser tests cover all canonical routes at 390, 768 and 1440 px, legacy redirects/404s, navigation and keyboard behavior, privacy consent, lazy-load recovery and GitHub release label/link consistency.
- SEO browser tests visit every sitemap page with JavaScript disabled and enabled, compare the head metadata and structured data, validate social-image dimensions, and check metadata cleanup during navigation and 404 recovery.
- Focused browser regressions cover normal-motion two-piece loading, AI card/table layout, current-page mobile-menu activation, and Features/NAM image selection at standard and high-density resolutions. Build tests check upgrade guidance before JavaScript; contract tests reject malformed repository snapshots and verify retry behavior.
- The suite also includes unit, source-contract and build tests. A reported total is not an E2E-only count. Desktop app tests live in the separate app repository.
- Browsers currently run in Chromium. The eight-width visual comparison recorded in the audit is a manual review artifact, not an automated screenshot-regression suite. Firefox/WebKit coverage and CI screenshot baselines are follow-up improvements.
- Loading performance is an explicit `npm run verify:perf` check; the current CI workflow does not run that matrix automatically.

## Search indexing and sharing

Production builds prerender all canonical marketing, legal, documentation and
blog pages with readable content, unique titles/descriptions, absolute canonical
URLs, Open Graph/Twitter tags and page-owned JSON-LD. `PageSeo` keeps the same
metadata during client navigation. Sitemap dates come from authored guide/article
updates; omit `lastmod` when the content modification date is unknown.

Keep schemas in `src/lib/structuredData.ts` and the blog metadata helpers aligned
with visible content. Never invent reviews, ratings, release versions or dates for
search features. Old routes use permanent redirects; missing pages return 404
and `noindex`. `/og-card` is available only on the Vite development server for
`npm run generate-og`, and returns 404 in production.

After deployment, verify production HTTP status/robots headers and submit the
canonical sitemap in Search Console. Deploy-preview `noindex` headers are
intentional. Local validation does not confirm Google indexing or rich-result
eligibility. See the [dated SEO audit](docs/seo-audit.md) for coverage and the
deployment follow-up.

## Loading Performance Gates

After building, run the repeatable mobile loading check against `dist/`:

```bash
npm run build
npm run verify:mobile-perf
```

The single-route command checks the home page by default. It starts Vite preview itself, opens a fresh 390 x 844 Pixel 5 Chromium context, and applies 4x CPU slowdown plus a 1.6 Mbps/150 ms mobile network profile. Select the desktop profile for the same focused check at 1440 x 900 with 2x CPU slowdown and a conservative 10 Mbps/40 ms connection:

```bash
npm run verify:mobile-perf -- --profile desktop --route /features
```

Run the core loading matrix across Home, Features, Download, AI, and Blog on both mobile and desktop profiles with:

```bash
npm run verify:perf
```

Matrix measurements run sequentially in isolated browser contexts. The package command uses a two-second post-reveal observation window so deferred requests near the loading boundary are counted consistently. Supplying `--profile mobile` or `--profile desktop` with `--matrix` narrows the matrix to that profile.

The gate fails when the real React main/hero is not visible after the HTML loader, or when app-ready time, post-ready intro time, intro-hidden time, Largest Contentful Paint (LCP), CLS, long tasks, requests, encoded transfer, redirects, console errors, page errors, failed requests, or HTTP errors exceed their budgets. Because prerendered content can paint behind the full-screen intro, the reported LCP retains the browser's buffered native candidate but is floored at the time the client route actually becomes visible. The post-ready intro budget prevents the older multi-second loader hold from returning even when application startup itself varies between machines.

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

The checked-in mobile LCP budget is 4 seconds; the desktop budget is 3.6 seconds. Both profiles measure the redesigned page heading. Desktop permits up to 45 requests and 1,000 KiB because it intentionally loads larger visual assets, while retaining stricter startup and long-task budgets. These laboratory budgets should be recalibrated from repeated cold runs when the hosting transport or route asset strategy changes. Override only a budget that has a measured reason to differ.

A machine-readable result can be saved under the existing artifact area with `--json output/playwright/mobile-performance.json`. Legacy single-route mode retains the original result object. Matrix mode writes an envelope with the profile, route, and result for each measurement.

## Deploy Inputs

The desktop release pipeline generates these files and publishes them as GitHub Release assets. The release dispatch workflow stages the selected tag. Ordinary production Netlify builds fetch and validate the latest published stable desktop release before staging, so a website-only deployment preserves update feeds and runtime downloads. See [release order and verification](RELEASE_SYNC.md). Locally, run `npm run fetch-release-publish-inputs` before building to exercise the same path.

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
- AI runtime Linux metadata may be published either as a legacy flat `platforms.linux` entry or as nested `platforms.linux.x64` and `platforms.linux.arm64` entries. Optional `platforms.linux.backends.cuda` and `.rocm` install plans are validated and preserved.
- downloadable manifest asset entries must include `url`, `sha256`, `size`, and `fileName`
- Windows backend install-plan entries must expose an `installPlan` object and are published verbatim
- Windows and macOS stable appcasts must be present, valid XML, and align with the stable app manifest enclosure data; the Linux appcast is required when Linux app metadata is published

Illustrative AI runtime manifest shape (example versions, hashes and sizes below are not current release data):

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
  - Optional for public GitHub access; recommended for builds and runtime to reduce API rate-limit risk. CI supplies its read-only token.
- `OPENSTUDIO_FETCH_RELEASE_METADATA`
  - Set to `true` in the production Netlify context to fetch published manifests/appcasts before staging. Local builds can opt in to the same path.
- `OPENSTUDIO_RELEASE_METADATA_DIR`
  - Optional. Defaults to `release-input`.
- `OPENSTUDIO_REQUIRE_RELEASE_METADATA`
  - Optional in local dev.
  - Set to `true` for release-publish builds so missing or malformed metadata/appcasts fail the build.
- `OPENSTUDIO_DESKTOP_REPO`
  - Optional. Defaults to `sdevil7th/OpenStudio`.
  - Used by GitHub build/runtime helpers and by the publish workflow contract.

Website workflow secrets:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `OPENSTUDIO_RELEASE_SOURCE_TOKEN`
  - Optional API token for published-metadata discovery (`GH_TOKEN` is its fallback). Public release-asset downloads do not receive this credential. Set this separately from `GITHUB_TOKEN` when raising the production metadata-fetch quota.

Desktop-side secret outside this repo:

- a token with permission to send `repository_dispatch` events to this website repo

## Redirect Behavior

Canonical pages are emitted into `dist/_redirects` at build time. `/v2/*` redirects to the corresponding canonical route, `/blogs/*` to `/blog/*`, `/github` to `/community`, and `/contact` to `/community#contact`. Unknown routes receive `404.html` with HTTP 404 and `noindex`. Local production preview applies the same page rewrites and aliases, serves the GitHub-derived build payloads, and runs the desktop download redirect handler against staged metadata. It does not emulate deployed AI-runtime functions; validate those on Netlify.

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

Responsive WebP derivatives are generated only for referenced screenshot/blog sources. Browsers select their size from `srcset`; source images remain a fallback if a variant fails. Generated files are recreated by the build. The self-hosted font subset is versioned at `google-fonts-20260915` and retains the original bytes and licenses for the four used families.

- The approved 2160 px master lives in `assets/branding/openstudio-logo-source.png`. `npm run generate-branding` produces the website icons in `public/assets/openstudio/branding/`.
- Screenshot assets live in `public/assets/openstudio/screenshots/`
- Share image contract lives at `public/assets/openstudio/branding/og-image.png?v=3`.
- See the [branding inventory, download verification and visual comparison](docs/branding-and-download-audit.md) for all website/app placements and the GitHub data flow.
