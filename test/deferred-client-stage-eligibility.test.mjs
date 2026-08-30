import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const deferredStageSource = readFileSync(
  new URL("../src/components/DeferredClientStage.tsx", import.meta.url),
  "utf8",
);
const aiPageSource = readFileSync(
  new URL("../src/pages/StemSeparationPage.tsx", import.meta.url),
  "utf8",
);
const downloadPageSource = readFileSync(
  new URL("../src/pages/DownloadPage.tsx", import.meta.url),
  "utf8",
);

const desktopMotionQuery =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

test("deferred client stages keep their fallback mounted until media and lazy-load gates pass", () => {
  assert.match(deferredStageSource, /mediaQuery\?: string/);
  assert.match(
    deferredStageSource,
    /window\.matchMedia\(mediaQuery\)\.matches/,
  );
  assert.match(deferredStageSource, /query\.addEventListener\("change", syncEligibility\)/);
  assert.match(deferredStageSource, /if \(!mediaEligible\) \{[\s\S]*?setShouldRender\(false\)/);
  assert.match(deferredStageSource, /new IntersectionObserver/);
  assert.match(deferredStageSource, /scheduleAfterInitialLoad/);
  assert.match(
    deferredStageSource,
    /\{mediaEligible && shouldRender \? children : fallback\}/,
  );
});

test("all AI WebGL stages require desktop motion before their lazy children can mount", () => {
  assert.ok(aiPageSource.includes(desktopMotionQuery));

  assert.equal((aiPageSource.match(/<DeferredClientStage\b/g) ?? []).length, 6);
  assert.equal(
    (aiPageSource.match(/mediaQuery=\{DESKTOP_MOTION_MEDIA_QUERY\}/g) ?? []).length,
    6,
  );

  for (const fallback of [
    "AiGenesisFallbackStage",
    "AiSignalFallbackStage",
    "NeuralFallbackInstrument",
    "AiArchitectureFallbackStage",
    "AiUseCaseFallbackStage",
    "AiOutroFallbackStage",
  ]) {
    assert.match(aiPageSource, new RegExp(`fallback=\\{<${fallback}`));
  }
});

test("the download cinematic keeps its static surface outside desktop motion eligibility", () => {
  assert.ok(downloadPageSource.includes(desktopMotionQuery));
  assert.match(
    downloadPageSource,
    /<DeferredClientStage[\s\S]*?fallback=\{<DownloadCinematicStaticSurface \/>\}[\s\S]*?mediaQuery=\{DESKTOP_MOTION_MEDIA_QUERY\}[\s\S]*?>/,
  );
});
