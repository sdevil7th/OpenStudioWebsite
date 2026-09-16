# Remaining review fixes — 16 September 2026

## Plan

1. Preserve the current built site as a layout comparison baseline, including the
   restored two-piece loader. Recheck the upgrade guidance against the app manual.
2. Restore the shared backup/format warning inside the existing download callout;
   close mobile navigation on every link activation, including its current page.
3. Give screenshots and lazy illustration posters image sizes matching their
   actual columns. Keep their CSS dimensions/crops and source images unchanged.
4. Include all server/shared modules in routine strict TypeScript checks. Use one
   shared GitHub snapshot contract and validate nested network/cache JSON before
   rendering it, preserving the last valid build snapshot on failure.
5. Recapture the historical native plugin windows if native capture is
   available. Do not paint a new logo into an old screenshot or substitute a mock.
6. Run build, lint, regression tests, the performance matrix and affected-page
   visual checks. Update the inventory and record any blocked work explicitly.

## Native screenshot capture

The Computer Use skill was initialized through `@oai/sky`. Both `list_apps` and
`list_windows` failed with: `Computer Use native pipe is unavailable: failed to
connect native pipe: The system cannot find the file specified. (os error 2)`.
The tool could not discover or capture OpenStudio windows, so no native UI actions
were attempted. Inspection of the high-density Features captures also found the
old title-bar icon inside the Raum window in `fx-chain-browser.webp`, bringing
the known recapture list to three:

| Source in `public/assets/openstudio/screenshots/` | View to recapture |
| --- | --- |
| `plugin-hosting-1.webp` | Komplete Kontrol / The Gentleman plugin editor |
| `plugin-hosting-2.webp` | AmpliTube 5 plugin editor |
| `fx-chain-browser.webp` | Track FX chain with the Raum plugin editor visible |

These existing captures remain unchanged pending restored native access. No
replacement capture has been fabricated. Capture the actual updated app/plugin
windows, retain the intended framing, replace the master captures, then run the
normal build to regenerate their image variants and cache versions. Inspect the
Features and plugin documentation views at phone, tablet and desktop widths.

## Implemented

- **Upgrade guidance:** restored `downloadUpgradeNote` inside the existing
  "Before you install" callout, including backups, retired formats, lack of
  automatic migration and retaining the older app for unconverted sessions.
  Removed its stale hardcoded "upcoming 0.1.02" framing. Rechecked the compatibility
  section of the app's `docs/USER_MANUAL.md`; the app checkout was `b93efc9` at
  final verification. No app source or app documentation was changed in this task.
- **Mobile navigation:** every mobile route-link activation closes the menu,
  including clicking or pressing Enter on the current route. Existing route-change
  and viewport-change behavior is retained.
- **Image delivery:** `Frame` and `LiveStage` accept layout-specific `sizes`.
  Updated Home, Features, NAM Rack, AI, documentation, article heroes and generated
  article-body images to describe their actual image columns, gaps and padding.
  CSS widths, crops, original raster assets and encoding quality are unchanged.
- **TypeScript:** `tsconfig.node.json` now explicitly checks all shared TypeScript
  and Netlify functions, with unused locals/parameters checked as well.
- **GitHub data:** `shared/github-snapshot.ts` owns the previously duplicated
  interfaces and a runtime parser. The build, function and browser validate nested
  release/assets, statistics, dates, flags and HTTPS GitHub/avatar URLs. Invalid
  browser refreshes retain the valid GitHub-derived build data and allow retry.
  Older cache omissions of optional release fields and browser-fallback lists
  remain supported. CI/Netlify builds still fail when live GitHub data is unavailable.
- Updated README, AGENTS, the source guide and branding/visual audit links with
  the contracts above and the corrected screenshot inventory.

## Verification

- Production build, including both strict TypeScript projects and prerendering,
  passed. ESLint passed with zero warnings. The complete suite passed **131 tests**;
  this total includes unit, build and Chromium browser tests, not just E2E tests.
- New regressions cover upgrade guidance in prerendered HTML, malformed nested
  GitHub responses, cached-request retry, current-page mobile navigation and image
  selection at **390, 768, 1024 and 1440 px**, each at device pixel ratios 1 and 2.
  The existing normal-motion initial/route loader, reduced-motion, AI layout,
  privacy, SEO, downloads and lazy-failure tests passed in the same run.
- All **10 mobile/desktop performance gates passed** with unchanged budgets.
  Reveal-adjusted LCP ranged from **1.27 to 2.62 seconds** in this local run.
- Compared seven affected routes at **360, 390, 768, 900, 901, 1024, 1440 and
  1920 px**: 56 route/width pairs. The baseline is the saved build immediately
  before this follow-up, already containing the restored original loader and
  repaired AI cards. This comparison isolates this task; the separate
  [original-design loader comparison](visual-regression-correction.md) remains
  the evidence against suprabho's design.
- For layout isolation, both builds used the same GitHub data and original image
  sources, with optional illustrations held on their real fallback posters.
  All 48 non-Download pairs had identical main heights, heading bounds and image
  bounds, with no horizontal overflow. Of those, 41 viewport captures were
  pixel-identical; seven differed by 19–136 pixels at only 1/255 per color channel.
  The added download paragraph increased the page height by about 57–168 px,
  depending on wrapping. Its phone, tablet and desktop captures were inspected.
- Actual responsive variants were checked separately, without original-image
  substitution. At 1440 px, 554 px Features images selected 640 px variants at
  DPR 1 and 1280 px at DPR 2; 150 px NAM thumbnails selected 320 px at both.
  Phone layouts selected larger files as their thumbnails expanded. Every tested
  image decoded. Smaller variants change raster pixels; these are not claims of
  pixel-identical image detail. Natural-ratio rounding caused less than one pixel
  of main-height difference in some actual-variant comparisons.

Evidence: `output/review/remaining-{build,lint,tests,performance}.log`,
`output/review/remaining-performance.json`,
`output/review/remaining-visual-comparison.json`,
`output/review/remaining-image-selection.json`,
`output/playwright/remaining-fixes/index.html`, and the separate DPR captures in
`output/playwright/remaining-image-quality/`. These ignored local artifacts are
not shipped. Browser coverage is Chromium; this run does not establish every
possible viewport, animation state or browser's rendering.

The remaining task is the three real screenshot recaptures above. Source changes
are local and uncommitted; no push, deployment or external artwork upload was made.

## Subsequent loading and release-copy correction

The [illustration-loading follow-up](illustration-loading.md) records the later
removal of screenshot placeholders, the coordinated AI release wording, and its
own verification results. The screenshot-held comparisons above describe the
earlier implementation and do not establish the new loading behavior.

The [music-model blog and uncommitted-code review](music-models-blog-review.md)
records the subsequent post, article readability fixes, source checks and the
remaining NAM artwork and offscreen-meter performance work.
