import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync(
  new URL("../src/pages/FeaturesPage.tsx", import.meta.url),
  "utf8",
);
const canonicalStorySource = readFileSync(
  new URL("../src/components/scene/FeatureCanonicalStory.tsx", import.meta.url),
  "utf8",
);
const backdropSource = readFileSync(
  new URL("../src/components/scene/FeaturesStoryBackdrop.tsx", import.meta.url),
  "utf8",
);
const imageSchedulerSource = readFileSync(
  new URL("../src/lib/imageScheduler.ts", import.meta.url),
  "utf8",
);
const featureSource = readFileSync(
  new URL("../src/data/features.ts", import.meta.url),
  "utf8",
);
const packageSource = readFileSync(
  new URL("../package.json", import.meta.url),
  "utf8",
);
const cssSource = [
  "../src/index.css",
  "../src/styles/features.css",
  "../src/styles/ai.css",
]
  .map((source) => readFileSync(new URL(source, import.meta.url), "utf8"))
  .join("\n");

const stripComments = (source) =>
  source
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n");

const pageCodeSource = stripComments(pageSource);
const canonicalCodeSource = stripComments(canonicalStorySource);
const featureCodeSource = stripComments(featureSource);

test("features page uses the canonical story as its only desktop renderer", () => {
  assert.match(packageSource, /"three":/);
  assert.match(pageSource, /FeatureCanonicalStory/);
  assert.match(pageSource, /data-feature-story-marker/);
  assert.match(pageSource, /progressById/);
  assert.match(pageSource, /const progressTargets = gsap\.utils\.toArray<HTMLElement>/);
  assert.match(pageSource, /useDesktopStory\s*\?\s*"\[data-feature-story-marker\]"/);
  assert.match(pageSource, /setActiveId\(chapterId\)/);
  assert.match(pageSource, /setProgressById/);
  assert.match(pageSource, /--feature-story-portal-opacity/);
  assert.doesNotMatch(pageCodeSource, /FeatureSceneCompositorState/);
  assert.doesNotMatch(pageCodeSource, /FeatureStoryPanel/);
  assert.doesNotMatch(pageCodeSource, /FeatureDetailCrawlPanel/);
  assert.doesNotMatch(pageCodeSource, /syncCanonicalStory/);
  assert.doesNotMatch(pageCodeSource, /compositorStateRef/);
  assert.doesNotMatch(pageCodeSource, /data-story-panel/);
  assert.doesNotMatch(pageCodeSource, /data-detail-crawl-panel/);
  assert.doesNotMatch(pageCodeSource, /FeatureSceneCompositorSurface/);
  assert.doesNotMatch(pageCodeSource, /FeatureStoryUnifiedTransition/);
  assert.doesNotMatch(pageCodeSource, /FeatureSceneWebGLStage/);
  assert.match(pageSource, /prefersReducedMotion/);
  assert.match(canonicalStorySource, /usePrefersReducedMotion/);
});

test("canonical chapter title layer replaces the route and stays center anchored", () => {
  assert.match(canonicalStorySource, /feature-canonical-story__diorama/);
  assert.match(canonicalStorySource, /feature-canonical-story__chapter-title-stack/);
  assert.match(canonicalStorySource, /data-feature-chapter-title-layer/);
  assert.match(canonicalStorySource, /chapter\.introTitle \?\? chapter\.label/);
  assert.match(
    canonicalStorySource,
    /const titleExitProgress = prefersReducedMotion[\s\S]*revealProgress\(activeProgress, 0\.34, 0\.52\)/,
  );
  assert.match(canonicalStorySource, /\? \(1 - titleExitProgress\) \* 0\.9[\s\S]*: 0/);
  assert.doesNotMatch(canonicalCodeSource, /feature-canonical-story__route/);
  assert.doesNotMatch(canonicalCodeSource, /strokeDashoffset/);
  assert.match(
    cssSource,
    /\.feature-canonical-story__chapter-title-layer \{[\s\S]*left: 50%;[\s\S]*top: 50%;[\s\S]*translate3d\(-50%, -50%, 0\)/,
  );
  assert.match(
    cssSource,
    /\.feature-story-marker \{[\s\S]*min-height: min\(var\(--feature-story-span, 196vh\), 176vh\)/,
  );
});

test("canonical scene keeps low-cost rendering and scheduled image loading", () => {
  assert.match(canonicalStorySource, /getResponsiveImageAttributes/);
  assert.match(canonicalStorySource, /story-active/);
  assert.match(canonicalStorySource, /story-next/);
  assert.match(canonicalStorySource, /feature-canonical-story__copy/);
  assert.match(canonicalStorySource, /feature-canonical-story__inspect/);
  assert.match(pageSource, /warmScheduledImages/);
  assert.match(pageSource, /canonicalRouteUpcoming/);
  assert.match(pageSource, /slot: "cinematic"/);
  assert.match(
    pageSource,
    /if \(!window\.matchMedia\(DESKTOP_STORY_MEDIA_QUERY\)\.matches\) \{\s*return;/,
  );
  assert.match(imageSchedulerSource, /MAX_IDLE_IMAGE_DECODE = 2/);
  assert.match(imageSchedulerSource, /MAX_SCROLL_IMAGE_DECODE = 1/);
  assert.match(imageSchedulerSource, /resolveImageAssetUrl/);
  assert.match(imageSchedulerSource, /loadImageWithFallbacks/);
  assert.match(imageSchedulerSource, /shouldLoadHeavyMedia/);
  assert.doesNotMatch(backdropSource, /StarField/);
  assert.doesNotMatch(backdropSource, /ConstellationField/);
  assert.doesNotMatch(pageSource, /document\.fonts\.ready[\s\S]*ScrollTrigger\.refresh\(\)/);
});

test("features and AI responsive rules keep their separate breakpoint intent", () => {
  assert.match(
    cssSource,
    /@media \(min-width: 1024px\) and \(max-width: 1279px\) \{[\s\S]*\.feature-canonical-story \{/,
  );
  assert.match(
    cssSource,
    /@media \(max-width: 1279px\) \{[\s\S]*\.ai-neural-lab \{[\s\S]*\.ai-neural-usecase-band \{/,
  );
  assert.match(
    cssSource,
    /@media \(max-width: 1023px\) \{[\s\S]*\.feature-story-shell-sticky \{[\s\S]*\.feature-story-stage-secondary-frame,/,
  );
  assert.match(
    cssSource,
    /@media \(max-width: 1023px\) \{[\s\S]*\.feature-story-hero \{[\s\S]*\.feature-story-mobile-detail \{/,
  );
  assert.match(
    cssSource,
    /@media \(max-width: 1279px\) \{[\s\S]*\.ai-genesis-overlay__headline \{[\s\S]*\.ai-arch-node-card,/,
  );
});

test("feature cinematic copy uses product-facing DAW capability language", () => {
  assert.doesNotMatch(
    featureCodeSource,
    /The site should|This chapter should|generic brochure|marketing surface|redesign groups|page needs|should land/,
  );
  assert.match(featureSource, /Record, edit, and arrange from the same timeline/);
  assert.match(featureSource, /MIDI composition is built into the session/);
  assert.match(featureSource, /Mixing, routing, and metering get a real workstation surface/);
  assert.match(featureSource, /Plugins, pitch, FX, and optional AI stay inside the project/);
  assert.match(featureSource, /A complete guitar rig, inside the project/);
  assert.match(featureSource, /NAM A1 \+ A2/);
  assert.match(featureSource, /The tuner observes the input without joining the audible path/);
  assert.match(featureSource, /Rich(?:er)? catalog search is not promised/);
  assert.match(featureSource, /Automation, scripting, and delivery close the production loop/);
  assert.match(featureSource, /Multitrack audio and MIDI recording/);
  assert.match(featureSource, /Ripple, razor, takes, and fades/);
  assert.match(featureSource, /Quantize and transforms/);
  assert.match(featureSource, /Sends, buses, and routing matrix/);
  assert.match(featureSource, /Optional local AI/);
  assert.match(featureSource, /Render and project delivery/);
});
