# Illustration loading and the coordinated AI release

## Decision — 16 September 2026

The rebranding website and desktop release ship together. MiniMax Music 3 and
Stable Audio 3 Medium therefore describe available guided setup in this release,
not a later desktop release. Updated the shared catalog/setup cards, Home, AI,
AI Tools setup, FAQ and release runbook. The two guide edits reference app source
`b93efc9`; no unverified published tag was invented. The FAQ's retired-project-format
claim was also corrected against the current app manual. Download versions and
assets still come from the actual GitHub release.

## Why the screenshots were appearing

The original redesign's `LiveStage` showed an app screenshot, waited until the
page had loaded and the block approached the viewport, then loaded a separate
illustration component and faded out the screenshot. The original Home hero also
had a screenshot Suspense fallback. The earlier optimization added a post-loader
delay to Home, making that different image particularly noticeable.

These screenshots reserved space and covered loading/failure, but their content
did not match the rendered illustrations. The browser downloaded and decoded
them before downloading the renderer and its artwork. Correct `sizes` reduced
their bandwidth without fixing the scene change.

## Current implementation

- Meter canvases use `stage/meterPlayback.ts` in addition to the GSAP gate.
  Each canvas must intersect the viewport and the document must be visible;
  continuous drawing also requires an active stage and normal motion. Pauses
  retain the canvas, RMS smoothing and peak-hold time. Visible static/reduced-motion
  meters receive a rest-frame paint, including after resizing, without a loop.
  The upstream drawing code and 20 fps limit are unchanged; the integration is a
  reproducible patch in `scripts/vendor-openstudio-ui.mjs`.
- Track activity and mixer meters update through local contexts so unchanged
  labels/controls skip React rendering. Clip artwork has a separate memoized
  boundary whose props exclude playhead time and continuously changing levels.
  Choreography, styles and the 30 fps timeline commit rate are unchanged.
- Each lazy route imports the renderers it uses. Home, Features, AI and NAM Rack
  render their real controls and scene in the rest state. There is no temporary
  screenshot, bitmap crossfade or second scene to replace it.
- `useStageTimeline` loads GSAP after initial loading, only when the visible
  stage has a playback slot. It animates the same DOM elements. Off-screen,
  hidden-tab and scheduler-limited timelines pause; reduced motion and explicit
  playback disabling retain their authored static state. Visible illustrations
  animate at phone, tablet and desktop sizes.
- `LiveStage` reserves its aspect ratio and uses `content-visibility: auto` so
  the browser can skip layout and painting of distant off-screen scenes. This
  does not substitute another scene or remove the actual renderer's DOM. It is
  not a guarantee that artwork requests wait until a block becomes visible.
- A failed GSAP request leaves the complete rest frame visible and does not
  cause an unhandled rejection. A renderer failure uses a local unavailable
  message; failure to fetch a route's required code uses the existing route
  recovery. No unrelated screenshot is used for either condition.
- Prerendering uses those same renderer components. `StageFrame` fits their
  fixed design coordinate system into the reserved slot using SVG/foreignObject
  for JavaScript-disabled documents. Client rendering keeps the existing measured
  layout, artwork and choreography. Decorative controls carry `inert` in the
  HTML, before client refs/effects run.
- The NAM renderer accepts the fixed illustration's initial inner-canvas size,
  through a reproducible vendor patch. Its static amp/cabinet artwork no longer
  uses the desktop port's larger default viewport before browser measurement.
  JavaScript-disabled frames fit a fixed composition into the reserved slot;
  NAM's static shell keeps that composition's canvas dimensions across viewport
  sizes. Normal client rendering retains its responsive layout, measured before
  the page loader is dismissed. Animation loading does not replace that layout.
- Stage selection is explicit in each page rather than an eager global renderer
  barrel. Text/legal pages still exclude NAM/DAW/GSAP code. Standalone screenshots
  in articles, guides and nonanimated cards continue to use responsive images.

## Initial-load lifecycle correction — 16 September 2026

The initial HTML loader (`#openstudio-instant-loader`) emits
`openstudio:intro-hidden` once and records completion in
`window.__openstudioIntroHidden`. Later route loaders reuse its artwork and
`data-openstudio-loader` attribute, but have their own entrance/exit lifecycle.
They do not emit the initial-intro event.

The startup scheduler previously waited for that event whenever *any* loader was
present. If the initial loader timed out before the first route's code arrived,
or a visitor navigated to an uncached route, the illustration could mount while
a route loader was still exiting. The initial event had already happened, so the
GSAP request was never scheduled. Waiting longer did not help; a reload could
avoid the timing window.

`scheduleAfterInitialLoad` now checks the recorded completion state and the
specific initial loader. An exiting route loader cannot restart the initial
wait. The existing idle delay, input scheduling and cancellation remain intact;
GSAP still loads only for eligible visible illustrations. No loader artwork,
layout, animation sequence or screenshot fallback changes are part of this fix.

`test/initial-load.test.mjs` covers both readiness orders, absent initial loaders,
idle/input scheduling and cancellation. `test/first-load-animation-browser.test.mjs`
holds the production Home chunk past the real initial-loader timeout and tests
uncached navigation at 768 and 1440 px. It verifies that the scene's clock advances
without a refresh or further interaction; a `playing` attribute alone would also
pass for the intentionally static reduced-motion frame. Reduced motion is checked
separately for a stable clock and no animation-engine download. The slow-entry
and normal-motion navigation regressions failed against the pre-fix build.

After this fix, the production build (including strict TypeScript), zero-warning
lint and all **147 tests** pass. The unchanged core performance matrix passes
**10 of 10 cases**; it does not include the separate NAM Rack network limitation
recorded below. Generated CSS hashes match the pre-fix build. Local reproduction
and check logs are retained in ignored `output/review/first-load-*` files and
`output/review/production-reproduction.log`.

## Phone playback correction — 16 September 2026

The initial-load event fix above did not address a separate size gate. Every
illustration disabled its timeline below 60% of its design width (45% for the
compact NAM chain). Home scales to approximately 41%, 52% and 58% at 320, 390 and
430 px, respectively. These phones therefore never requested GSAP, even with
normal motion enabled. Waiting or refreshing could not remove the size gate.

Removed that gate from Home and all eight stage renderers. Viewport size now
controls only layout. The shared driver still honors reduced motion, explicit
disabling, document visibility and its two-active-stage limit. Small NAM tiles
can share a viewport; the most eligible two play, and scrolling changes their
eligibility. Other tiles hold their frame instead of all consuming animation
work simultaneously.

The all-tile test also exposed fractional clipping in the NAM grid: amp/cab
reported a 0.99865 intersection ratio while the following EQ/post row reported
1. The latter kept taking both slots even after scrolling amp/cab into view.
The scheduler now treats at least 99% visibility as fully visible, retaining
the priority order and two-stage cap. A regression using the measured fractions
fails against the previous scheduler and passes with this correction.

Reload stress checks found another intermittent stall: the driver was settled,
the document visible and the intro complete, but every stage still had a zero
intersection ratio. Visibility observation now starts after the initial-loading
gate, and returning to a visible tab requests a fresh observation. This avoids
depending on measurements made while the route was hidden. Browser coverage
simulates missed loading-time visibility notifications and verifies that reload
still starts the clock without a scroll, tap or another refresh.

The original artwork, sizing, loop choreography and two-piece loader are intact.
Phones now use the existing animation rest frame and start playback instead of
remaining on the reduced-motion sample. No screenshot placeholders were added.
All four generated CSS bundle hashes match the preceding build.

The earlier rest-frame test only required Home playback at widths of at least
768 px. It now includes 390 px. First-load coverage adds delayed phone entry,
uncached phone navigation and reduced-motion phone navigation; the two
normal-motion regressions failed before the size-gate removal. The dedicated
mobile browser test checks fresh 320/390/430 px contexts with touch/mobile
emulation, actual clock advancement without input, offscreen pause/resume,
all eight illustration types and the rack tour plus all six smaller rack tiles.
Tile checks scroll the relevant row below the sticky header so it can receive
a playback slot. Canvas repainting alone is not treated as proof of a running
scene timeline.

This is Chromium phone emulation, not physical Android/iOS or Safari testing.
Local evidence is under ignored `output/review/mobile-animation-fix/` and
`output/playwright/phone-*` files. The AI guide's accompanying INT8 correction
is sourced separately in [the music-model review](music-models-blog-review.md).

The final production build (including strict TypeScript), zero-warning lint and
all **181 tests** pass. Earlier failed runs are retained: they exposed the phone
cutoff, fractional NAM visibility and intermittent zero-intersection reload.
The controlled visibility regression fails before the observer lifecycle change
and passes afterward; the final full suite includes that scenario.
The unchanged core performance matrix passes **10/10** cases. A separate mobile
NAM Rack check measures 3.12 s reveal-adjusted LCP, zero layout shift, 376 ms of
long tasks and 664.6 KiB encoded. Its 48 requests still exceed the generic limit
of 35; no request budget was raised. These are local throttled measurements.

## Performance tradeoff

A still image can give a cheap early paint while complex rendering code loads;
loading a fallback image is not automatically slower in every metric. Its cost
is an additional request, decoding, memory and bandwidth. A generated still of
the exact illustration would improve visual continuity, but retain that cost.

This implementation avoids duplicate screenshots entirely. The real renderer and
its CSS are needed earlier, and prerendered HTML is larger. That increases some
initial parsing/rendering work even while removing image requests. The optional
animation engine remains deferred, and its timelines are initialized only for
eligible visible blocks. Actual NAM artwork textures are still necessary parts
of the illustration, not throwaway placeholders.

Do not claim that every startup metric improves. Measure the full production
matrix after renderer changes, retaining the current budgets, and inspect the
initial/rest state as well as the completed animation. Preserve the original
two-piece page loader.

## Verification

Checked locally on 16 September 2026:

- Production build, strict TypeScript, zero-warning lint and all **136 tests**
  passed. The build prerenders 35 canonical pages plus the not-found document.
- New production browser coverage holds the GSAP request on Home, Features, AI
  and NAM Rack at 390, 768 and 1440 px. It verifies the real controls exist before
  animation, the original DOM elements stay connected, and their dimensions stay
  within one pixel after loading. Home is also checked transitioning from stopped
  to playing. Failed-GSAP recovery, no-JavaScript content and inert controls pass.
- Existing refresh/uncached-navigation tests still verify the two-piece loader's
  entrance, joining and rotation. Its source and artwork were not changed here.
- The final core performance matrix passed **8 of 10 cases**. Blog/mobile and
  Home/desktop exceeded CPU-task limits; both passed individual reruns with the
  same budgets and no code changes. A native compiler was active on this machine,
  so local timing varies; the original failed measurements are retained. An
  earlier full matrix passed all ten. Do not present the final matrix alone as
  entirely passing or infer a universal speedup from these runs.
- Final Home/mobile measures 2.96 seconds reveal-adjusted LCP, 2.68 seconds to
  app-ready, 650 ms of long tasks, 24 requests and 381.7 KiB encoded. The two
  individual reruns measure 2.62 seconds LCP on Blog/mobile and 1.37 seconds on
  Home/desktop. Earlier screenshot-first measurements painted different content.

### NAM Rack performance limitation

NAM Rack is outside the existing five-route performance matrix. Additional runs
used the same unmodified generic budgets and the saved `de05863` production build
as the before case:

| Profile | Requests before → after | Encoded KiB before → after | Reveal-adjusted LCP before → after |
| --- | --- | --- | --- |
| Mobile | 50 → 47 | 504.6 → 666.4 | 2.31 s → 3.67 s |
| Desktop | 60 → 49 | 1425.3 → 1360.3 | 2.11 s → 1.33 s |

Both builds exceed the generic request-count budget on NAM Rack; both exceed its
desktop transfer budget. The new implementation passes its timing, layout-shift
and long-task limits, but does **not** pass those network limits. Its mobile
markup/rendering cost is higher, despite removing temporary screenshots. The
actual rack textures and controls remain required. This is an outstanding
performance optimization opportunity, not a reason to substitute mismatched
images or raise the budgets silently. These are local throttled Chromium samples,
not field measurements.

### Visual scope and evidence

Captured completed illustration frames on Home, Features, AI and NAM Rack at
360, 390, 768, 900, 901, 1024, 1440 and 1920 px: 160 before/after frame pairs.
Every measured frame has the same CSS width and height; no tested route overflows
horizontally. Comparisons use the previous completed real illustrations, after
their posters disappeared, rather than comparing the new scenes to screenshots.
The renderer artwork and choreography are preserved; NAM's initial canvas size
is now supplied explicitly for prerendering. The restored loader's
separate original-design comparison remains in
[the visual correction report](visual-regression-correction.md).

These are not 160 pixel-identical pairs: fractional positioning, canvas painting
and page content wrapping affect raster comparisons. Intentional visible changes
are the removal of the screenshot-to-scene swap and the corrected model copy and
green guided-setup statuses. No claim is made about every browser, viewport or
animation instant. The three historical plugin-window screenshots still need the
native recaptures recorded in [the review follow-up](review-follow-up.md).

Local evidence is kept in ignored `output/playwright/still-frames/`,
`output/review/still-frame-visual-comparison.json`,
`output/review/still-frame-final-performance.json`, the paired
`still-frame-nam-{mobile,desktop}*.json` files, and
`still-frame-final-{build,lint,tests}.log`. CPU reruns are recorded separately in
`still-frame-blog-mobile-repeat.json` and `still-frame-home-desktop-repeat.json`.
The gallery at `output/playwright/still-frames/loading-behavior.html` shows the
held-engine and first-playback captures plus the corrected no-JavaScript frames.
Documentation, `AGENTS.md` and the
release runbook describe the new loading and release contracts. No commit, push
or deployment was made for this correction.

Separate edits to the keyboard-shortcut and mixing/routing guides appeared while
this task was running. They were preserved and included in the final build/tests;
they were not authored as part of this illustration-loading correction.
