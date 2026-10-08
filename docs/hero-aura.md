# Home hero Aura lifecycle

The hero retains the original `pastel-abstract-background-soft-glowing-hd-web-designs`
embed at `aura.promad.design`, with `theme=light`. No renderer settings, effects,
colours, resolution or frame rate are overridden by the website.

The cross-origin iframe is sandboxed with only `allow-scripts allow-same-origin`,
which permits the renderer, worker and origin-checked readiness messages without
allowing popups, forms, downloads or top-level navigation. Its `no-referrer` policy
omits the parent referrer from the embed request. This does not block the provider's
own resource requests or storage. The shared privacy policy describes the observed
Aura, Supabase and Google Fonts requests, including after analytics rejection.

The page renders its existing light fallback before JavaScript. Loading the iframe
starts automatically after the route-ready and intro-hidden signals, two animation
frames and an idle opportunity, with a visible hero in a visible document. There
is no interaction requirement or fixed quiet-period delay. The idle callback has
a two-second maximum scheduling wait; browsers without that API start after the
paint frames. Initial reduced motion does not mount the iframe.

The readiness signals describe the rendered page, not every lazy image, optional
animation engine or third-party network request. On client navigation the mounted
hero gets its own paint frames even when the initial readiness flags are already
set. Unmounting or enabling reduced motion cancels pending startup work.

## Readiness and failure

An iframe's load event cannot confirm that the asynchronous scene request or lazy
renderer succeeded, and is not used to trigger readiness. Active startup frames
remain renderable at zero opacity: `visibility:hidden` can suspend frame callbacks
in a visible browser and deadlock readiness. The host uses the provider's existing `promad-aura:capture`
message API and validates replies against the exact origin, iframe window and
request ID. This API was inspected and exercised against the live embed on
20 September 2026. It is an external, unversioned integration; it is not a web
standard or a provider-guaranteed readiness contract.

Readiness requires an actual PNG with the opaque, near-white upper centre of this
specific light scene, followed by another successful check after a
1-second settling period. The current capture implementation returns black if
the lazy canvas is absent/unpainted, and an error if the scene container is absent.
Neither is revealed. Replies containing malformed, oversized, transparent or dark
images also leave the fallback in place. A 30-second foreground probe timeout
removes an unresponsive iframe. Unsupported/changed provider behaviour therefore
keeps the fallback instead of revealing a browser error or black background.
The timeout does not automatically retry; a new iframe instance is needed.
Pixel readiness does not establish a healthy frame rate. There is currently no
automatic fallback for slow software rendering after the frame has been verified.

After verification, the frame fades in over 650 ms using `ease-in-out`. The same
duration applies to fade-out and viewport re-entry. The settling period is a
presentation buffer, not proof of readiness; both successful frame checks remain
required. These shorter timings remove 4.25 seconds of deliberate waiting compared
with the previous 3.5-second settle and 2.4-second fade. Network time and renderer
settings are unchanged. The former interaction/10-second gate has been removed.

Captures use quarter-size output only for the startup check, never for the visible
animation. The PNG passes between frames inside the browser; the host does not
upload it or invoke a Netlify function. This adds the provider's capture helper download and a small amount of
startup work. Probes stop after readiness, while offscreen, in a hidden tab, on
reduced motion, and on unmount. The timeout restarts if an unfinished scene returns
to the viewport. It does not run indefinitely while offscreen.

## Pause and resume

Scrolling away retains the same iframe and its ready state; returning reveals the
same scene without a reload or repeated startup checks. The host tracks viewport
intersection and document visibility and hides the frame when inactive. The
observer consumes all queued visibility records in order: under CPU throttling,
the hidden initial layout and its visible replacement can arrive in one batch.
Reading only the first record strands startup until another viewport change.
The browser regression suite explicitly reproduces this batch.
The provider also observes intersection and reduced motion internally. On
30 September 2026 its OffscreenCanvas worker stopped drawing offscreen but kept
requesting animation callbacks. Those are separate guarantees: a hidden host or
an idle iframe main thread does not prove that a worker has stopped. CSS visibility
alone is not a cross-browser pause API. The live check below measures worker
callbacks and paint calls independently and verifies resume with the same iframe.

Changing the OS reduced-motion preference removes the iframe. Re-enabling motion
creates a new component instance with fresh readiness and cancelled old probes.
This accessibility preference is separate from ordinary viewport pause/resume.

## Verification

`test/hero-aura-browser.test.mjs` exercises the cross-origin protocol with controlled
slow, dark, unresponsive and successful scenes, stale readiness after preference
changes, and iframe identity across scrolling. Run `npm run build`, `npm run lint`,
`npm test` and `npm run verify:perf`.

The initial-load performance gate can now include the automatically started iframe.
Inspect the live scene after activation as well; passing the short gate does not
demonstrate low ongoing CPU use. Preserve the approved scene when comparing visuals, including
phone, tablet, both sides of the 900 px navigation breakpoint, and desktop, and
test delayed uncached navigation and reduced motion. Never make CI depend on live
third-party availability.

## Rendering cost and frame rates

The live Aura iframe and original scene remain intact. A 60 fps background is not
an acceptance criterion; the goal is less rendering work with usable page controls
and readable animation. The embed interface inspected on 30 September 2026 has
theme/input/capture options and a capture message protocol, but no verified
frame-rate setting. React's internal `forceFrameRate` symbol in the bundle is not
an embed API. Do not invent an `fps` query parameter, send unsupported messages,
or repeatedly hide/reload the iframe to simulate a cap. A provider-side frame cap
requires a supported Aura interface or a provider change.

The website reduces its competing work instead: the hero DAW commits at most
20 ordinary state snapshots per second (down from 30), with real-time GSAP
choreography and forced boundary updates unchanged. Meters retain the upstream
approximately 20 Hz draw throttle, gated by canvas visibility, stage playback and
document visibility. Reduced motion and resize still paint a rest frame. These
changes do not set Aura's frame rate. The experimental sleeping meter scheduler
was removed after the 1 October comparison below found no independent CPU saving.

## Live worker check

Build once, then run the opt-in check (Chromium and internet access required):

```sh
npm run verify:aura-live -- --json output/review/aura-desktop.json
npm run verify:aura-live -- --mobile --json output/review/aura-mobile.json
npm run verify:aura-live -- --headed --json output/review/aura-tabs.json
npm run verify:aura-live -- --url https://deploy-preview-24--openstudiodev.netlify.app/ --json output/review/aura-preview.json
```

Without `--url`, the command starts and closes its own production preview. It
excludes Netlify's review toolbar, rejects optional analytics, waits for scene
readiness, and samples visible, offscreen and resumed work. JSON records parent
callback counts and task/script/layout time, plus each Aura worker's callback
counts, callback duration and Canvas2D paint calls. Parent-task CPU slowdown is
2x desktop / 4x mobile; cross-origin workers do not necessarily inherit it. There
is no FPS threshold. Compare repeated runs with matching browser/device settings;
do not equate parent callback counts with displayed frames or sum parent task time
and script time (script time is included in task time).

The script requests normal focus behavior on both tabs, attempts a real tab
switch and checks `document.visibilityState`. Automation can keep both tabs
visible, including in headed Chromium: that produces an explicit `unverified`
result, not a fabricated success. `--headed` allows a visible-browser attempt but
does not guarantee a visibility transition. If it remains unverified, native
browser verification is still required. Changing only the parent's visibility
property would not hide its cross-origin child and is not a valid substitute. A new provider renderer
without the observed worker causes this check to fail until its instrumentation
is updated. It is intentionally separate from deterministic offline CI tests.

## 30 September 2026 measurements

Compared the PR's `a19b045` code with the then-experimental timer and 20 fps
scheduling changes, using the same
local production build setup and live Aura provider. Averages below use three
active samples per run (initial, resumed and foreground), normalized to three
seconds. These are lab observations, not field metrics or an FPS requirement.

| Parent-page work per three seconds | PR baseline | Updated |
| --- | ---: | ---: |
| Desktop animation callbacks | 1,442 | 505 |
| Desktop main-thread task time | 616 ms | 445 ms |
| Mobile-profile animation callbacks | 1,436 | 500 |
| Mobile-profile main-thread task time | 1,521 ms | 960 ms |

A second updated desktop run reproduced the reduction. The live worker kept
drawing while visible and stopped painting offscreen; its idle callback loop
remained. One mobile attempt timed out waiting for provider readiness and its
retry passed; a successful local build does not guarantee third-party availability.
Real background-tab worker behavior remains unverified: both headed and headless
automation kept the document visible. Offscreen results do not establish that
separate behavior. Build, lint, all 223 tests and the ten-case loading matrix
passed. Visual checks covered 390, 768, 900, 901 and 1440 px, including initial
loading, reduced motion and delayed uncached navigation.
The baseline and updated reports are under ignored
`output/review/aura-performance/`, including `comparison.json`. The existing
ten-case loading matrix retained its original budgets. Full Chromium is used
by the worker check; do not compare its absolute rendering rates with measurements
from Chromium's legacy headless shell or claim a provider frame-rate change.

## 1 October 2026 review and isolated comparison

PR #24 uses `supro/aura-header` against `develop`. The original
`openstudiowebsite` preview stopped at `a19b045`; the active Netlify checks publish
to `deploy-preview-24--openstudiodev.netlify.app`. Check the deployment's commit
before comparing results. The PR retains the Aura iframe.

Four production client builds isolated the two scheduling changes against
`a19b045`: baseline, sleeping meters only, 20 fps DAW snapshots only, and both.
All four used the same remaining source, including the sandbox and referrer
policy. Full Chromium 147.0.7727.15 ran fresh contexts sequentially, in forward
and reverse orders, with 2x parent CPU slowdown at 1440 × 900. Each 16.1-second
sample covered a complete 16-second DAW loop after live scene readiness. No other
build or browser test ran during measurement.

| Desktop variant (two runs each) | Parent task time / second | Parent callbacks / second |
| --- | ---: | ---: |
| Baseline | 151.5 ms | 480.2 |
| Sleeping meters only | 155.8 ms | 167.5 |
| 20 fps DAW only | 130.9 ms | 480.2 |
| Both | 129.1 ms | 167.8 |

The meter timer alone removed callbacks but did not reduce measured CPU time.
It also reduced meter paint cadence. The small additional saving when combined
with the DAW cap did not justify its extra timer lifecycle, so that experiment was
removed. The original frame-based meter scheduler and upstream draw throttle
remain, including offscreen/stage/hidden-document gates. Regression tests retain
coverage for pause, elapsed-time preservation, reduced motion, resize and cleanup.

The retained 20 fps DAW cap reduced desktop parent task time by about 14% in this
comparison. All successful variants measured approximately 60 fps parent cadence;
that is an observation, not a requirement or a claim about presented GPU frames.
These figures do not establish faster loading, field INP or battery savings.
Mobile evidence at 390 × 844 / 4x CPU was less conclusive: only one of two attempts
for each changed variant reached readiness; both baseline attempts succeeded.
One successful DAW-only sample showed lower task time, but that is insufficient
for a stable mobile improvement estimate. The live provider remains a dependency
with a tested static fallback on failure.

The ignored `output/review/pr24-merge-readiness/` directory contains the variant
build/measurement scripts, raw results and `variants-summary.json`. These dated
measurements supersede using callback reductions alone as evidence of an overall
performance improvement. Real hidden-tab worker behavior remains unverified.

The final reviewed implementation passed build, lint, all 222 tests and the
ten-case loading matrix with unchanged budgets. Visual checks covered 390, 768,
900, 901 and 1440 px, normal initial loading, delayed uncached navigation and
reduced motion. The new privacy text was also inspected with JavaScript disabled.
The separate GA4 account configuration issue was corrected on 1 October 2026:
automatic history page views were disabled, and the production live verifier
passed on desktop and mobile. See
[analytics verification](analytics.md#1-october-2026-pr-24-verification).
