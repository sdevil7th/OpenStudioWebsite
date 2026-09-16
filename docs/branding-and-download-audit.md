# Branding and download audit

**Correction — 16 September 2026:** the original branding work changed the loader
animation and missed the unpadded AI setup cards. The visual review below did not
justify a claim of no visual changes. The loader has been restored and the AI
layout repaired; see the [complete visual-change inventory and verification](visual-regression-correction.md).

## Approved source

Both repositories now keep the supplied **2160 × 2160 PNG** at `assets/branding/openstudio-logo-source.png`. It was copied from `openstudio-app-tile-2160x2160.png` without modifying the master.

SHA-256: `ab70f07153bf727611bda48729dc0bdefe174c53b908655c547aec140f6c8dee`.

PNG icons retain transparency. The small website mark is lossless WebP; larger website marks use quality 92 WebP, downsampled directly from the master. Dimensions, placement and surrounding website styles are preserved. The old v2 header already used this design at lower resolution.

## Website inventory

| Placement found | Updated source/output |
| --- | --- |
| Header and footer mark | `src/components/layout/SiteHeader.tsx`, `src/components/layout/SiteFooter.tsx`, `OPENSTUDIO_MARK` in `src/data/siteContent.ts`, `public/assets/openstudio/branding/openstudio-mark-78.webp` |
| Initial loading screen and route loading screen | Original two-piece SVG and animation restored in the shared `index.html` template. The raster icon substitution was a regression, not an approved branding change. |
| Browser favicons | `favicon-16x16.png`, `favicon-32x32.png`, new `favicon-48x48.png`; links in `index.html` and shared branding constants |
| Browser automatic favicon request | New `public/favicon.ico`, with 16/32/48/256 px entries |
| Apple home-screen icon | `apple-touch-icon.png`, 180 px |
| Web app / Android icons | `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest` |
| Social-sharing / Open Graph image | Old inline vector in `src/pages/OgCardPage.tsx` replaced; `og-image.png` regenerated at 1200 × 630; sharing URL advanced to `?v=3` |
| Structured metadata / publisher logo | Shared branding constants and the organization logo in `index.html` now point to the regenerated PNGs |
| Main README | `README.md` displays the new `icon.png` |
| Microsoft Store promotional/tile exports | Generator now uses the approved PNG. Twelve checked exports and their manifest/README are in local `output/store-branding/images/`; contact sheet at `output/store-branding/preview.png` |
| Reproducible generation | `scripts/generate-branding.mjs`, `scripts/generate-og.mjs`, `scripts/generate-store-branding.mjs` |

Removed old `icon.svg`, `vismay-mark.png` and the superseded `vismay-mark-78.webp`. Browser/PWA icon URLs carry a new cache version so returning visitors do not retain the previous icons under the site's immutable asset cache policy. Bump the icon URL version again when replacing the master in the future.

Regenerate ordinary icons with `npm run generate-branding` (also part of dev/build). For the social card, start `npm run dev`, then run `npm run generate-og`. Run `node scripts/generate-store-branding.mjs` for Store uploads; these marketing exports are kept outside the published website payload.

## App repository inventory

Paths below are relative to `OpenStudio/`.

| Placement found | Updated source/output |
| --- | --- |
| Main app menu-bar mark | `frontend/src/components/MenuBar.tsx` uses `frontend/public/icon-32x32.png` at its existing 16 px size |
| Native executable/window/taskbar and macOS bundle icon | `assets/icon-16x16.png`, new `assets/icon-1024x1024.png`; `CMakeLists.txt` uses the larger source for JUCE's native icon generation |
| Linux AppImage and desktop launcher | Updated `assets/icon-256x256.png`; existing `tools/package-linux-release.sh` consumes it |
| Windows Store / MSIX tile resources | `tools/package-windows-store.ps1` generates StoreLogo and Square44/Square150 resources from the new 1024 px source |
| Frontend browser favicons | `frontend/index.html`, 16/32/48 px PNGs |
| Apple / web manifest / Android icons | `frontend/public/apple-touch-icon.png`, both Android PNGs and `site.webmanifest` |
| Repository README | `README.md` now uses `frontend/public/icon.png` |
| Documentation README | `docs/README.md` uses the same PNG |
| Future icon regeneration | `tools/generate-icons.mjs`, resolving Sharp from the frontend dependencies |

Removed unused old `frontend/public/icon.svg` and `frontend/public/logo.svg`. All first-party README/image references were searched. Third-party brand icons and contributor avatars are separate identities and remain intact.

Existing released installers and cached Release/ASan build directories represent older builds. New app icons reach users with a newly built/published app release. The current Debug executable and its copied frontend were rebuilt successfully. No app release was published during this work.

Historical screenshots and blog illustrations can contain the old menu-bar glyph inside a captured app window. Those captures were retained as historical material; refreshing them should use new captures of the corresponding app view, rather than repainting historical screenshots. The retained `public/assets/openstudio/screenshots/plugin-hosting-1.webp` and `plugin-hosting-2.webp` visibly include the old native title-bar icon; recapture these plugin windows from the updated app when refreshing product screenshots. Their source paths in `src/data/siteContent.ts` and generated responsive variants follow the master captures. External Microsoft Partner Center listing art, and any manually configured GitHub social-preview image, require uploading the generated artwork separately.

## Release data and installer behavior

- `npm run sync-github-data` fetches GitHub repository/release data before dev and production builds. Generated TypeScript/JSON files are ignored; there is no hand-maintained version, tag, timestamp, installer filename, size or release-history snapshot in the source.
- Clean CI/Netlify builds fail if current GitHub release data cannot be obtained. Local builds can reuse a verified snapshot less than 24 hours old after a temporary API failure, printing its original fetch time. Dev/preview serve these GitHub-derived payloads instead of consuming the API quota for every test page. The generated build snapshot provides prerendered/offline values, and a small `/.netlify/functions/github-release` response refreshes the browser's release labels and installers. Netlify caches that live response for five minutes.
- Version, date, filename and size come from the same GitHub release. Download buttons use that release's exact asset URLs. A new live version updates its labels and links together.
- Published manifest checksums are used only when version, URL, filename and size match that GitHub artifact. A mismatched manifest cannot supply another version's checksum or size.
- Stable `/download/{windows,macos,linux}/latest` endpoints remain available. Local production preview now exercises the actual redirect handler against the built metadata.
- Runtime tags and prereleases cannot become the advertised stable desktop release. Installer selection excludes metadata/checksum/debug assets.

### Live download evidence — 15 September 2026

GitHub's current stable desktop tag was `v0.1.01` when checked. These values are evidence of the verification run, not values used to drive the site:

| Platform | GitHub asset | API size (bytes) | Download verification |
| --- | --- | ---: | --- |
| Windows | `OpenStudio-Setup-x64.exe` | 307,195,220 | HTTP 206; matching Content-Range size; PE/MZ header |
| macOS | `OpenStudio-macOS.dmg` | 36,374,947 | HTTP 206; matching Content-Range size; valid `koly` DMG trailer |
| Linux | `OpenStudio-0.1.01-linux-x86_64.AppImage` | 66,492,920 | HTTP 206; matching Content-Range size; ELF header |

All three download endpoints on the supplied deploy preview returned HTTP 302 to those exact GitHub assets. Small byte ranges were downloaded to verify availability; installers were not run or republished. Evidence is in local `output/review/live-installer-verification.json`.

## Verification

### Automated checks

- Website production build and strict application/Node TypeScript checks passed.
- ESLint passed with zero warnings; the complete suite passed **103 tests**, including live-version/size/link synchronization and rejection of mismatched checksums.
- All three local production download endpoints returned **302** to the exact GitHub assets in the generated release payload. This exercises the production redirect handler, in addition to the deployed-preview and byte-range checks above.
- App frontend production build and native `cmake --build build --config Debug` passed. Existing frontend chunk-size/dynamic-import warnings remain; this branding change does not alter app loading architecture. The native app was rebuilt but not manually launched, and fresh platform installers were not packaged.
- Both repositories pass `git diff --check`.

### Visual comparison against the supplied deployment

Reference: [PR 18's actual /v2 preview](https://deploy-preview-18--openstudiowebsite.netlify.app/v2).

Compared **35 canonical routes at 360, 390, 768, 900, 901, 1024, 1440 and 1920 px**: 280 route/width pairs and **560 comparison images**. Each reference route uses its `/v2` path; the updated build uses its canonical path. This includes both sides of the 900 px navigation breakpoint. Captures use reduced motion, loaded fonts, rejected analytics consent and the same GitHub repository snapshot to keep changing statistics out of the comparison.

Reviewed paired desktop/mobile page captures and breakpoint contact sheets, and compared heading geometry throughout all pages. Marketing-page main heading bounds matched the reference and there was no document-level horizontal overflow. Those checks missed the changed loader and the new AI cards' missing spacing and heading style. They establish neither complete visual equivalence nor animation equivalence.

Expected differences are:

- The approved logo and regenerated favicon/social artwork; header/footer mark dimensions and placement are unchanged.
- Corrected documentation, release checksums, MiniMax Music 3 / Stable Audio 3 Medium content and the restored privacy-choice link.
- Documentation/code and blog content fitting narrow cards. For example, the reference NAM blog hero extended to x=481 at a 390 px viewport; the updated image ends at x=361 inside its card. Some page heights change as previously clipped content wraps correctly.
- Native responsive images and static reduced-motion posters replacing delayed/blank reference images; normal animated illustrations can also be at different timeline positions. The reference TONE3000 image was separately verified fully loaded after waiting at its viewport position.
- The local Sponsor control replaces the remote iframe; deployment-preview toolbar placeholders are excluded from design assessment.

The first full-page capture of a few pages above 16,000 px showed Chromium capture artifacts. Those long captures were replaced by stitched viewport captures, and their actual page/footer layout was checked directly. A final footer-separator correction was checked in the production build at all eight widths; those final viewport captures are in `output/playwright/final-footer/`. The HTML comparison index opens each full-size pair; fast-scroll reference captures can still contain delayed lazy images, so this is a layout review rather than a claim that every image pixel or animation frame is identical. The tested widths cover phones, tablets and desktop layouts; they cannot guarantee every possible device/browser combination.

Local review artifacts:

- `output/playwright/branding-comparison/index.html` — browsable route/width comparisons.
- `output/playwright/branding-reference/` and `branding-final/` — original and updated screenshots.
- `output/review/visual-geometry-comparison.json` — all 280 geometry comparisons.
- `output/playwright/reference-nam-loaded.png` — reference lazy-image follow-up.
- `output/playwright/branding-performance.json` — performance measurements.
- `output/review/release-function-contract-check.json` — controlled function checks for stable-release selection, response caching and GitHub quota failure.

### Performance

The existing budgets were unchanged; **all ten mobile/desktop checks passed**.

| Page | Mobile LCP | Desktop LCP | Mobile CLS |
| --- | ---: | ---: | ---: |
| Home | 2.27 s | 1.29 s | 0 |
| Features | 1.94 s | 1.30 s | 0 |
| Download | 2.00 s | 1.34 s | 0.0089 |
| AI | 1.99 s | 1.33 s | 0 |
| Blog | 1.92 s | 1.28 s | 0 |

LCP is the gate's reveal-adjusted largest-content timing; CLS measures unexpected layout movement. Mobile used 390 × 844, 4× CPU slowdown, 1.6 Mbps download and 150 ms latency. Desktop used 1440 × 900, 2× CPU slowdown, 10 Mbps and 40 ms latency. Measurements are controlled local results, not production field measurements.

### External state and release follow-up

GitHub's anonymous API quota was exhausted during repeated QA requests, after successful live data/installer verification. A later direct invocation of the new release function correctly returned 503 under that limit; its successful response path was validated with controlled GitHub data, and browser failure recovery retains the GitHub-derived build snapshot. CI now supplies its read-only token. Netlify's optional server-side `GITHUB_TOKEN` should be configured for a larger API quota; no token is shipped to browsers. Clean production builds require a successful GitHub fetch, while local iteration can reuse the recent verified snapshot described above.

No changes were committed, pushed or deployed, and no app release or Store/GitHub artwork upload was published. Publishing the updated app is required to change the icons embedded in existing users' installed binaries.

## Documentation follow-up — 16 September 2026

The redesign/rebranding maintenance guidance was audited against both working
trees. The app checkout was `98197be`; this is development source, not a claim
that every documented feature is in the latest published installer.

- Added the website [AGENTS.md](../AGENTS.md) and
  [guide authoring notes](../src/features/docs/README.md): canonical routes, compatibility
  contracts, lazy loading, Tailwind ownership, privacy, source verification,
  approved branding inputs and proportionate verification.
- Updated the website README, release synchronization/runbook guidance, release
  input notes, blog authoring instructions and retained-font inventory. Build
  documentation now explains fresh GitHub fetches, the two server-side token
  paths and the limited local snapshot fallback. Historical privacy-review and
  test evidence is explicitly dated instead of presented as the current runbook.
- Updated the app's AGENTS.md, WORKFLOWS.md, branding guide, release runbook and
  smoke checklist. CLAUDE.md now imports the shared AGENTS.md instead of keeping
  a drifting duplicate. Corrected obsolete embedded-frontend, TypeScript-error
  waiver and render-feature claims; documented native packaging and cross-repo
  branding responsibilities.
- Corrected the app-window name to **Keyboard, Mouse & Trackpad** in the website's
  keyboard, pitch-editing and troubleshooting guides, including the Options/Help
  entry points. Those three guides now record verification against `98197be`.
  Keyboard bindings and profile definitions were not changed.
- Fixed the font generator's stale 23-file assertion to match the retained
  **17 files / four families / 80 faces**. An isolated replay of the pinned
  upstream CSS/font/license bytes reproduced the retained CSS and manifest
  exactly; this maintenance fix changes no rendered font assets.

Validation: production build (including strict TypeScript), lint and all **103
website tests** passed again. The build obtained fresh GitHub data successfully
at `2026-09-15T18:52:02.457Z`. Local Markdown links/anchors were checked. The three
corrected guides passed additional browser checks at **360, 390, 768, 901 and
1440 px**, with no page errors, document overflow or clipped corrected menu
labels. Mobile, tablet and desktop screenshots were inspected. No styling was
changed in this follow-up. Evidence is under local `output/review/docs-followup-*`,
`output/review/font-regeneration-check.json` and `output/playwright/docs-followup/`.

The website suite contains unit, integration and Chromium browser tests; 103 is
the total, not an E2E-only count. The earlier eight-width comparison is manual
evidence, not a committed CI screenshot baseline. The separate app E2E suite was
not run in this documentation follow-up. Firefox/WebKit coverage and automated
visual baselines remain potential testing improvements.

### Remaining delivery work

1. Deploy the website and verify real Netlify functions, aliases, legal pages,
   fresh GitHub release data and returning-browser icon caches. Configure the
   optional server-side GitHub token for an adequate API quota.
2. Build, qualify and publish new app installers for the supported platforms,
   following the app release runbook; source icon updates and a Windows Debug
   build do not qualify or replace those artifacts.
3. Upload the generated Microsoft Store artwork and any custom GitHub social
   preview. These external account settings were not changed.
4. Recapture `plugin-hosting-1.webp`, `plugin-hosting-2.webp` and `fx-chain-browser.webp` from the updated
   app when refreshing product screenshots; their old native title-bar glyphs
   remain inside the historical captures. The [review follow-up](review-follow-up.md)
   records the attempted capture and unavailable native Computer Use service;
   these images have not been replaced or repainted.

All repository changes remain uncommitted and undeployed.
