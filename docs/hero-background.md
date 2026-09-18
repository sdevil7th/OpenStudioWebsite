# Local light-curtain background

## Implementation ? 18 September 2026

The home background recreates the reference's overlapping cyan, blue and violet
light curtains locally. Curtains fade in and out at staggered phases. The
renderer starts with populated phases, so its first frame is already settled;
there is no dark startup sequence or multi-second loader hold.

- `src/features/hero-aura/renderer.ts` owns the deterministic artwork. It paints
  350 narrow light curtains with four cached gradient brushes, additive blending
  and a blur applied at **480 ? 336**, regardless of viewport size or pixel ratio.
- `src/components/HeroAuraBackdrop.tsx` caps painting at 30 frames/second and
  cancels the frame loop offscreen, in a hidden document, or with reduced motion.
  Playback resumes from its paused time. No viewport-size cutoff disables phones.
- `scripts/generate-hero-aura.mjs` renders time zero with the same painter and
  writes a lossless WebP plus a generated content-hash URL. Both dev startup and
  the build regenerate it. Run `npm run generate-hero-aura` directly after editing
  the artwork. Chromium is required, as it is for OG generation.
- The generated image is present in prerendered HTML, fills the complete hero,
  and stays visible without JavaScript or when canvas/filter support is missing.
  It uses `ResponsiveImage` with intrinsic dimensions; its deliberate fixed
  resolution matches the soft canvas artwork at DPR 1 and 2. It is not upscaled
  into multiple bitmap variants. `sizes` describes the full viewport width.
- `src/styles/site.css` stretches the same surface across the hero with a subtle
  grid overlay. There is no centered 1600px boundary, screen-sized blur filter,
  iframe, scene fetch or external font/renderer dependency.
- The original two-piece loader and existing hero content/layout are retained.
  The loader template matches pre-Aura commit `77e9678` exactly.

The generated files are outputs, not alternate artwork sources:
`public/assets/openstudio/backgrounds/hero-aura-rest.webp` and
`src/features/hero-aura/generatedRestFrame.ts`. The public image path is identical
for prerendering and the client; its query hash changes when the artwork changes.

The earlier two-gradient approximation was rejected because it changed the
appearance and barely moved. Its 2.98s/1.32s timing results apply to that earlier
implementation, not this renderer. See the dated local evidence for each version.
The curtain renderer uses the reference's visual behavior, not synchronized
random frames or a claim of pixel-identical reproduction.

## Verification

Run `npm run build`, `npm run lint`, `npm test`, then `npm run verify:perf` with
unchanged budgets. The focused regression is
`node --test test/hero-aura-browser.test.mjs`.

That regression checks visible pixel changes over time, full-width coverage up
to 3840px, a bounded drawing surface, offscreen pause/resume, a simulated hidden
lifecycle, live reduced-motion changes, no-JavaScript and failed-canvas fallback,
no third-party home requests and delayed uncached home navigation. The hidden
lifecycle simulation checks real pixels, but does not certify native scheduling
on every browser. Browser checks use Chromium; other browsers without the
required canvas filter support retain the static frame.

Visual checks include normal initial loading, settled moving frames, reduced
motion, delayed navigation and phone/tablet/desktop/4K widths. Local motion,
screenshot and timing evidence is stored under ignored
`output/review/pr24/curtains/`. `comparison.webm` shows the live reference and local
renderer side by side. Hosted timings and physical-device behavior require
separate verification after deployment.

### Latest local results — 18 September 2026

Build, lint and **206 tests passed**. All **10 existing performance checks passed**
without budget changes. In this matrix run, home content became visible after
**3.21s mobile / 1.28s desktop**, with **523 / 575 KiB** measured encoded transfer.
These are single cold local measurements under the repository's throttled
Chromium profiles, not hosted timings or the previous approximation's medians.

Visual evidence covers 320, 390, 768, 900, 901, 1440, 1920, 2560 and 3840px,
including DPR 2 on the phone. All have a full-width surface, 480 × 336 backing
resolution, a decoded fallback and no document-level horizontal overflow.
A separate five-second steady window at 1440px measured 0.795s of main-thread
task time including the existing DAW animation; offscreen it measured 0.073s.
This is not a GPU or physical-device battery measurement. No deployment was made.
