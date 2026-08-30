import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const readSource = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const aiPageSource = readSource("../src/pages/StemSeparationPage.tsx");
const neuralStageSource = readSource("../src/components/scene/AiNeuralStudioStage.tsx");
const signalStageSource = readSource("../src/components/scene/AiSignalWebGLStage.tsx");
const genesisStageSource = readSource("../src/components/scene/AiGenesisStage.tsx");
const architectureStageSource = readSource("../src/components/scene/AiArchitectureOrbit.tsx");
const useCaseStageSource = readSource("../src/components/scene/AiUseCaseConstellation.tsx");
const outroStageSource = readSource("../src/components/scene/AiOutroStage.tsx");
const pretextSource = readSource("../src/components/motion/PretextEditorialField.tsx");
const aiStylesSource = readSource("../src/styles/ai.css");

test("AI page HUD and pointer motion do not poll continuously while idle", () => {
  assert.match(aiPageSource, /const updateHud = \(\) =>/);
  assert.match(aiPageSource, /syncNeuralProgress[\s\S]*updateHud\(\)/);
  assert.match(
    aiPageSource,
    /useLayoutEffect\(\(\) => \{[\s\S]*globalProgressRef\.current[\s\S]*phaseProgressRef\.current[\s\S]*data-ai-neural-global-pct[\s\S]*data-ai-neural-phase-pct[\s\S]*\}, \[activePhaseIndex\]\)/,
  );
  assert.match(
    aiPageSource,
    /<NeuralHud activePhase=\{activePhase\} key=\{`hud-\$\{activePhase\.id\}`\} \/>/,
  );
  assert.doesNotMatch(aiPageSource, /updateHudAfterPhaseCommit/);
  assert.doesNotMatch(aiPageSource, /requestAnimationFrame\(tickHud\)/);
  assert.match(aiPageSource, /const attachDampedPointer =/);
  assert.match(aiPageSource, /if \(!settled\) \{\s*queueFrame\(\)/);
  assert.match(aiPageSource, /if \(isDesktop && !prefersReducedMotion\)/);
});

test("AI WebGL renderers stop frames outside the viewport and in hidden tabs", () => {
  for (const source of [neuralStageSource, signalStageSource]) {
    assert.match(source, /new IntersectionObserver/);
    assert.match(source, /inView && !document\.hidden && frameId === 0/);
    assert.match(source, /window\.cancelAnimationFrame\(frameId\)/);
    assert.match(source, /document\.addEventListener\("visibilitychange"/);
    assert.match(source, /visibilityObserver\?\.disconnect\(\)/);
  }
});

test("AI WebGL render loops resize only when their containers change", () => {
  for (const source of [
    neuralStageSource,
    genesisStageSource,
    architectureStageSource,
    useCaseStageSource,
    outroStageSource,
  ]) {
    assert.match(source, /new ResizeObserver\(resize\)/);
    assert.match(source, /resizeObserver\.observe\(canvas\.parentElement\)/);
    assert.match(source, /window\.addEventListener\("resize", resize\)/);
    assert.match(source, /resizeObserver\?\.disconnect\(\)/);
    assert.doesNotMatch(
      source,
      /const animate = \(now: number\) => \{[\s\S]*?resize\(\);[\s\S]*?renderer\.render/,
    );
  }
});

test("ready neural fallback and offscreen editorial motion do no invisible work", () => {
  assert.match(
    aiStylesSource,
    /\.ai-neural-fallback-stage--hidden \{[\s\S]*?display: none;/,
  );
  assert.match(pretextSource, /\{ rootMargin: "0px" \}/);
  assert.doesNotMatch(pretextSource, /rootMargin: "24% 0px"/);
});

test("editorial text animation stops instead of doing offscreen frame work", () => {
  assert.match(pretextSource, /COMPACT_VIEWPORT_QUERY/);
  assert.match(pretextSource, /query\.addEventListener\("change", syncViewport\)/);
  assert.match(pretextSource, /compactViewport \|\| fragments\.length === 0/);
  assert.match(pretextSource, /if \(!inView\) \{[\s\S]*cancelAnimationFrame\(frameId\)/);
  assert.match(pretextSource, /if \(!inView \|\| document\.hidden\) \{\s*return;/);
  assert.match(pretextSource, /document\.addEventListener\("visibilitychange"/);
});
