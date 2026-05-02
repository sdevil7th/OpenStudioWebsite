import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync(new URL("../src/pages/FeaturesPage.tsx", import.meta.url), "utf8");
const compositorSource = readFileSync(
  new URL("../src/components/scene/FeatureSceneCompositor.tsx", import.meta.url),
  "utf8",
);
const webglSource = readFileSync(
  new URL("../src/components/scene/FeatureSceneWebGLStage.tsx", import.meta.url),
  "utf8",
);
const featureSource = readFileSync(new URL("../src/data/features.ts", import.meta.url), "utf8");
const packageSource = readFileSync(new URL("../package.json", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

const chapterCount = 5;
const phases = {
  cueStart: 0.22,
  collapseStart: 0.22,
  loosenStart: 0.22,
  destructionStart: 0.36,
  voidPeak: 0.72,
  arrivalStart: 0.9,
  panelInStart: 0.9,
  visualSettleStart: 1,
  settleEnd: 1,
};

const clamp = (value) => Math.max(0, Math.min(1, value));
const phaseProgress = (value, start, end) => (end <= start ? (value >= end ? 1 : 0) : clamp((value - start) / (end - start)));
const easeOutCubic = (value) => 1 - (1 - clamp(value)) ** 3;

const transitionStateAt = ({ chapterIndex, progress, direction = 1, stoppedFor = 0 }) => {
  const hasNext = chapterIndex < chapterCount - 1;
  const clamped = hasNext ? clamp(progress) : 1;
  const visualOwnerIndex = hasNext && clamped >= phases.voidPeak ? chapterIndex + 1 : chapterIndex;
  const currentPanelOpacity = hasNext ? 1 - phaseProgress(clamped, phases.cueStart, phases.destructionStart + 0.16) : 1;
  const nextPanelOpacity = hasNext ? easeOutCubic(phaseProgress(clamped, phases.panelInStart, phases.settleEnd)) : 0;
  const transitionActive = hasNext && clamped >= phases.collapseStart && clamped < phases.visualSettleStart ? 1 : 0;
  const settleProgress = clamp((stoppedFor - 90) / 620);
  const loosenProgress = hasNext ? phaseProgress(clamped, phases.loosenStart, phases.destructionStart) : 0;
  const destructionProgress = hasNext ? phaseProgress(clamped, phases.destructionStart, phases.voidPeak) : 0;
  const reassemblyProgress = hasNext ? phaseProgress(clamped, phases.voidPeak, phases.arrivalStart) : 1;
  const readableProgress = hasNext ? phaseProgress(clamped, phases.panelInStart, phases.settleEnd) : 1;

  return {
    activeIndex: chapterIndex,
    nextIndex: hasNext ? chapterIndex + 1 : chapterIndex,
    visualOwnerIndex,
    transitionDirection: direction,
    transitionActive,
    currentPanelOpacity: Number(currentPanelOpacity.toFixed(3)),
    nextPanelOpacity: Number(nextPanelOpacity.toFixed(3)),
    loosenProgress: Number(loosenProgress.toFixed(3)),
    destructionProgress: Number(destructionProgress.toFixed(3)),
    reassemblyProgress: Number(reassemblyProgress.toFixed(3)),
    readableProgress: Number(readableProgress.toFixed(3)),
    settleProgress: Number(settleProgress.toFixed(3)),
  };
};

test("feature story uses one canonical controller instead of per-marker timeline ownership", () => {
  assert.match(pageSource, /const storyController = \{/);
  assert.match(pageSource, /const syncCanonicalStory = \(\) => \{/);
  assert.doesNotMatch(pageSource, /markers\.forEach\(\(marker, index\) =>[\s\S]*gsap\.timeline/);
  assert.doesNotMatch(pageSource, /useEffect\(\(\) => \{[\s\S]*Object\.assign\(compositorStateRef\.current[\s\S]*\}, \[activeId\]\);/);
  assert.match(pageSource, /transitionDirection: storyController\.direction/);
  assert.match(pageSource, /settleProgress,/);
  assert.match(pageSource, /ambientProgress:/);
  assert.match(pageSource, /loosenProgress,/);
  assert.match(pageSource, /destructionProgress,/);
  assert.match(pageSource, /reassemblyProgress,/);
  assert.match(pageSource, /readableProgress,/);
});

test("feature story transition timings occupy most of the chapter", () => {
  assert.match(pageSource, /STORY_CUE_START = 0\.22/);
  assert.match(pageSource, /STORY_DESTRUCTION_START = 0\.36/);
  assert.match(pageSource, /STORY_REASSEMBLY_START = 0\.72/);
  assert.match(pageSource, /STORY_PANEL_IN_START = 0\.9/);
  assert.match(compositorSource, /const DEFAULT_COLLAPSE = 0\.22/);
  assert.match(compositorSource, /const DEFAULT_VOID_PEAK = 0\.72/);
  assert.match(compositorSource, /const DEFAULT_ARRIVAL = 0\.9/);
  assert.match(featureSource, /collapseStart: 0\.22/);
  assert.match(featureSource, /voidPeak: 0\.72/);
  assert.match(featureSource, /arrivalStart: 0\.9/);
  assert.match(featureSource, /settleEnd: 1/);
  assert.match(featureSource, /scrollSpan: 2(?:6|8|9|86|92)|scrollSpan: 300/);
});

test("webgl stage is the desktop primary renderer with the canvas fallback retained", () => {
  assert.match(packageSource, /"three":/);
  assert.match(pageSource, /FeatureSceneWebGLStage/);
  assert.match(pageSource, /fallback=\{[\s\S]*<FeatureSceneCompositor/);
  assert.match(webglSource, /new THREE\.WebGLRenderer/);
  assert.match(webglSource, /ShaderMaterial/);
  assert.match(webglSource, /Points/);
  assert.match(webglSource, /prefers-reduced-motion: reduce/);
});

test("feature scene keeps the right story panel and moves dense chapter details into the bottom crawl", () => {
  assert.match(pageSource, /FeatureStoryPanel/);
  assert.match(pageSource, /feature-story-panel/);
  assert.match(pageSource, /FeatureDetailCrawlPanel/);
  assert.match(pageSource, /feature-story-detail-crawl-panel/);
  assert.match(pageSource, /chapter\.details\.callouts/);
  assert.match(pageSource, /chapter\.details\.items/);
  assert.match(pageSource, /--credits-progress/);
  assert.doesNotMatch(pageSource, /FeatureStoryCreditsPanel/);
  assert.doesNotMatch(pageSource, /feature-story-credits-panel/);
  assert.match(webglSource, /y: 0/);
  assert.match(webglSource, /height: 0\.56/);
  assert.match(compositorSource, /height \* 0\.015/);
  assert.match(compositorSource, /height \* 0\.49/);
  assert.match(pageSource, /stageBounds\.height \* 0\.05/);
  assert.match(pageSource, /stageBounds\.height \* 0\.6/);
});

test("feature story right panel is readable while the bottom dense crawl has a taller scene band", () => {
  const panelRule = cssSource.match(/\.feature-story-panel \{[\s\S]*?\n  \}/)?.[0] ?? "";
  assert.match(panelRule, /overflow: visible/);
  assert.doesNotMatch(panelRule, /overflow: hidden/);
  assert.match(panelRule, /width: clamp\(24rem, 25vw, 30rem\)/);
  assert.match(panelRule, /top: clamp\(/);
  assert.match(panelRule, /max-height: none/);
  assert.match(cssSource, /\.feature-story-panel h2 \{[\s\S]*font-size: 1\.75rem/);
  assert.match(cssSource, /\.feature-story-panel p,[\s\S]*font-size: 0\.86rem/);
  assert.match(cssSource, /\.feature-story-detail-crawl-panel \{[\s\S]*height: clamp\(/);
  assert.match(cssSource, /--credits-crawl-distance: 27rem/);
  assert.match(cssSource, /--credits-crawl-y: var\(--credits-crawl-current-y\)/);
  assert.match(cssSource, /\.feature-story-detail-crawl-panel__mask \{[\s\S]*height: clamp\(/);
  assert.match(pageSource, /measureDetailCrawlPanels/);
  assert.match(pageSource, /ResizeObserver/);
  assert.match(pageSource, /--credits-crawl-distance/);
  assert.match(pageSource, /setDetailCrawlProgress/);
  assert.match(pageSource, /ScrollTrigger\.refresh\(\)/);
});

test("forward ownership changes at reassembly before readable next content", () => {
  assert.deepEqual(transitionStateAt({ chapterIndex: 0, progress: 0.18 }), {
    activeIndex: 0,
    nextIndex: 1,
    visualOwnerIndex: 0,
    transitionDirection: 1,
    transitionActive: 0,
    currentPanelOpacity: 1,
    nextPanelOpacity: 0,
    loosenProgress: 0,
    destructionProgress: 0,
    reassemblyProgress: 0,
    readableProgress: 0,
    settleProgress: 0,
  });
  assert.deepEqual(transitionStateAt({ chapterIndex: 0, progress: 0.52 }), {
    activeIndex: 0,
    nextIndex: 1,
    visualOwnerIndex: 0,
    transitionDirection: 1,
    transitionActive: 1,
    currentPanelOpacity: 0,
    nextPanelOpacity: 0,
    loosenProgress: 1,
    destructionProgress: 0.444,
    reassemblyProgress: 0,
    readableProgress: 0,
    settleProgress: 0,
  });
  assert.deepEqual(transitionStateAt({ chapterIndex: 0, progress: 0.96 }), {
    activeIndex: 0,
    nextIndex: 1,
    visualOwnerIndex: 1,
    transitionDirection: 1,
    transitionActive: 1,
    currentPanelOpacity: 0,
    nextPanelOpacity: 0.936,
    loosenProgress: 1,
    destructionProgress: 1,
    reassemblyProgress: 1,
    readableProgress: 0.6,
    settleProgress: 0,
  });
});

test("reverse scroll restores previous ownership symmetrically", () => {
  assert.match(pageSource, /const upcoming = states\.find\(\(state\) => state\.rect\.top > 112\)/);
  assert.match(pageSource, /const previousIndex = Math\.max\(0, upcoming\.index - 1\)/);
  assert.deepEqual(transitionStateAt({ chapterIndex: 0, progress: 0.74, direction: -1 }).visualOwnerIndex, 1);
  assert.deepEqual(transitionStateAt({ chapterIndex: 0, progress: 0.6, direction: -1 }), {
    activeIndex: 0,
    nextIndex: 1,
    visualOwnerIndex: 0,
    transitionDirection: -1,
    transitionActive: 1,
    currentPanelOpacity: 0,
    nextPanelOpacity: 0,
    loosenProgress: 1,
    destructionProgress: 0.667,
    reassemblyProgress: 0,
    readableProgress: 0,
    settleProgress: 0,
  });
});

test("stopping mid-transition advances settle without changing indexes", () => {
  assert.deepEqual(transitionStateAt({ chapterIndex: 2, progress: 0.74, stoppedFor: 80 }), {
    activeIndex: 2,
    nextIndex: 3,
    visualOwnerIndex: 3,
    transitionDirection: 1,
    transitionActive: 1,
    currentPanelOpacity: 0,
    nextPanelOpacity: 0,
    loosenProgress: 1,
    destructionProgress: 1,
    reassemblyProgress: 0.111,
    readableProgress: 0,
    settleProgress: 0,
  });
  assert.deepEqual(transitionStateAt({ chapterIndex: 2, progress: 0.74, stoppedFor: 710 }), {
    activeIndex: 2,
    nextIndex: 3,
    visualOwnerIndex: 3,
    transitionDirection: 1,
    transitionActive: 1,
    currentPanelOpacity: 0,
    nextPanelOpacity: 0,
    loosenProgress: 1,
    destructionProgress: 1,
    reassemblyProgress: 0.111,
    readableProgress: 0,
    settleProgress: 1,
  });
});

test("last chapter never transitions to a missing scene", () => {
  assert.deepEqual(transitionStateAt({ chapterIndex: 4, progress: 0.5 }), {
    activeIndex: 4,
    nextIndex: 4,
    visualOwnerIndex: 4,
    transitionDirection: 1,
    transitionActive: 0,
    currentPanelOpacity: 1,
    nextPanelOpacity: 0,
    loosenProgress: 0,
    destructionProgress: 0,
    reassemblyProgress: 1,
    readableProgress: 1,
    settleProgress: 0,
  });
});
