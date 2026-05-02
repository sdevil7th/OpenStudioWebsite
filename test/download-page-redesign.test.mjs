import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const downloadPageSource = readFileSync(new URL("../src/pages/DownloadPage.tsx", import.meta.url), "utf8");
const downloadsDataSource = readFileSync(new URL("../src/data/downloads.ts", import.meta.url), "utf8");
const downloadCinematicDataSource = readFileSync(new URL("../src/data/downloadCinematic.ts", import.meta.url), "utf8");
const downloadCinematicSource = readFileSync(
  new URL("../src/components/scene/DownloadCinematicStory.tsx", import.meta.url),
  "utf8",
);
const featuresPageSource = readFileSync(new URL("../src/pages/FeaturesPage.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

test("features page no longer renders the stale workflow-detail placeholder", () => {
  assert.doesNotMatch(featuresPageSource, /Dense chapter context now rides inside the scene/);
  assert.doesNotMatch(featuresPageSource, /data-feature-details/);
  assert.doesNotMatch(featuresPageSource, /data-feature-detail-block/);
  assert.doesNotMatch(cssSource, /\.feature-story-detail-block/);
  assert.doesNotMatch(cssSource, /\.feature-text-weave/);
});

test("download page keeps stable platform data and dialog-driven downloads", () => {
  assert.match(downloadsDataSource, /DOWNLOAD_PATHS\.windowsLatest/);
  assert.match(downloadsDataSource, /DOWNLOAD_PATHS\.macosLatest/);
  assert.match(downloadsDataSource, /DOWNLOAD_PATHS\.linuxLatest/);
  assert.match(downloadPageSource, /platformDownloads/);
  assert.match(downloadPageSource, /downloadInstructions/);
  assert.match(downloadPageSource, /setPendingDownload\(activePlatform\)/);
  assert.match(downloadPageSource, /setPendingDownload\(platform\)/);
  assert.match(downloadPageSource, /window\.location\.assign\(activeInstruction\.href\)/);
});

test("download preview removes abstract command-deck scenes and reuses the homepage logo animation", () => {
  assert.equal(
    existsSync(new URL("../src/components/scene/DownloadReleaseDeckStage.tsx", import.meta.url)),
    false,
  );
  assert.equal(
    existsSync(new URL("../src/components/scene/DownloadStudioDeskStage.tsx", import.meta.url)),
    false,
  );
  assert.doesNotMatch(downloadPageSource, /DownloadReleaseDeckStage/);
  assert.doesNotMatch(downloadPageSource, /DownloadStudioDeskStage/);
  assert.doesNotMatch(downloadPageSource, /data-download-command-deck/);
  assert.doesNotMatch(cssSource, /download-command-/);
  assert.doesNotMatch(cssSource, /download-release-deck/);
  assert.match(downloadPageSource, /BrandLogoConstructScene/);
  assert.match(downloadPageSource, /data-download-logo-stage/);
  assert.match(downloadPageSource, /LOGO_SCROLL_TARGET_PROGRESS = 0\.66/);
  assert.match(downloadPageSource, /ScrollTrigger\.create\(\{[\s\S]*endTrigger: "\[data-download-panel-stack\]"/);
  assert.match(downloadPageSource, /pin: "\[data-download-logo-pin-stage\]"/);
  assert.match(downloadPageSource, /pinSpacing: false/);
  assert.doesNotMatch(downloadPageSource, /requestAnimationFrame/);
  assert.doesNotMatch(downloadPageSource, /LOGO_INTRO_/);
  assert.match(downloadPageSource, /size="intro"/);
  assert.match(downloadPageSource, /data-download-studio-hero/);
  assert.match(downloadPageSource, /data-download-panel-stack/);
  assert.match(downloadPageSource, /data-download-logo-pin-stage/);
  assert.match(cssSource, /\.download-studio-hero/);
  assert.match(cssSource, /\.download-home-logo-stage/);
});

test("download hero keeps the sticky logo column before the scrolling platform panels", () => {
  assert.match(
    downloadPageSource,
    /<div className="download-home-logo-stage" data-download-logo-pin-stage>[\s\S]*<BrandLogoConstructScene[\s\S]*<div className="download-studio-hero__panel-stack" data-download-panel-stack>/,
  );
  assert.match(downloadPageSource, /download-hero-platform-grid/);
  assert.match(downloadPageSource, /data-download-hero-card/);
  assert.match(downloadPageSource, /platformOrder\.map/);
  assert.match(downloadPageSource, /Download AppImage/);
  assert.match(downloadPageSource, /Focus \$\{item\.label\} release path/);
  assert.match(cssSource, /\.download-hero-platform-grid/);
  assert.match(cssSource, /\.download-platform-card--hero/);
  assert.match(cssSource, /\.download-studio-hero__panel-stack/);
});

test("download cinematic story uses generated studio plates and GSAP instead of WebGL props", () => {
  assert.match(downloadPageSource, /DownloadCinematicStory/);
  assert.match(downloadPageSource, /lazy\(\(\) => import\("@\/components\/scene\/DownloadCinematicStory"\)\)/);
  assert.match(downloadPageSource, /data-download-cinema/);
  assert.match(downloadPageSource, /data-download-cinematic-story/);
  assert.doesNotMatch(downloadPageSource, /StudioEvolutionScene/);
  assert.doesNotMatch(downloadPageSource, /data-download-studio-evolution/);
  assert.doesNotMatch(downloadPageSource, /from "three"|three\/addons/);

  assert.match(downloadCinematicDataSource, /downloadCinematicScenes/);
  assert.match(downloadCinematicDataSource, /downloadCinematicPlates/);
  assert.match(downloadCinematicDataSource, /The studio powers on/);
  assert.match(downloadCinematicDataSource, /Sources come into focus/);
  assert.match(downloadCinematicDataSource, /Signal reaches the interface/);
  assert.match(downloadCinematicDataSource, /OpenStudio takes the screen/);
  assert.match(downloadCinematicDataSource, /Ready for the next take/);
  assert.match(downloadCinematicDataSource, /screenshots\.recordingSession/);
  assert.equal((downloadCinematicDataSource.match(/screenshots\./g) ?? []).length, 1);
  assert.deepEqual(
    (downloadCinematicDataSource.match(/\/assets\/openstudio\/download-cinematic\/[^"]+\.webp/g) ?? []).sort(),
    [
      "/assets/openstudio/download-cinematic/screen-reveal-plate.webp",
      "/assets/openstudio/download-cinematic/signal-closeup.webp",
      "/assets/openstudio/download-cinematic/studio-wide.webp",
    ].sort(),
  );

  assert.match(downloadCinematicSource, /gsap\.timeline\(\{/);
  assert.match(downloadCinematicSource, /pin: stage/);
  assert.match(downloadCinematicSource, /pinSpacing: false/);
  assert.match(downloadCinematicSource, /prefersReducedMotion \|\| !isDesktop/);
  assert.match(downloadCinematicSource, /data-download-cinematic-timeline/);
  assert.match(downloadCinematicSource, /data-download-cinematic-asset/);
  assert.match(downloadCinematicSource, /data-download-cinematic-screen-reveal/);
  assert.match(downloadCinematicSource, /data-download-cinematic-fallback/);
  assert.match(downloadCinematicSource, /data-download-cinematic-mobile-fallback/);
  assert.match(downloadCinematicSource, /data-download-cinematic-reduced-motion/);
  assert.match(downloadCinematicSource, /downloadCinematicPlates/);
  assert.match(downloadCinematicSource, /downloadCinematicScenePlateMap/);
  assert.match(downloadCinematicSource, /downloadCinematicSourceLabels/);
  assert.match(downloadCinematicSource, /downloadCinematicScreenshot\.webpSrc/);
  assert.match(downloadCinematicSource, /downloadCinematicScreenshot\.src/);
  assert.equal(existsSync(new URL("../public/assets/openstudio/screenshots/recording-session.webp", import.meta.url)), true);
  assert.equal(existsSync(new URL("../public/assets/openstudio/download-cinematic/studio-wide.webp", import.meta.url)), true);
  assert.equal(existsSync(new URL("../public/assets/openstudio/download-cinematic/signal-closeup.webp", import.meta.url)), true);
  assert.equal(
    existsSync(new URL("../public/assets/openstudio/download-cinematic/screen-reveal-plate.webp", import.meta.url)),
    true,
  );
  assert.doesNotMatch(downloadCinematicSource, /import \* as THREE|WebGLRenderer|GLTFLoader|RGBELoader|three\/addons/);
  assert.doesNotMatch(downloadCinematicSource, /makeGuitar|deskLamp|CatmullRomCurve3|InstancedMesh|RoomWakes|SourcesArm/);

  assert.match(cssSource, /\.download-cinematic/);
  assert.match(cssSource, /min-height: var\(--download-cinema-scroll-vh, 620vh\)/);
  assert.match(cssSource, /@media \(min-width: 1024px\)[\s\S]*\.download-cinematic[\s\S]*width: 100vw/);
  assert.match(cssSource, /\.download-cinematic[\s\S]*margin-left: calc\(50% - 50vw\)/);
  assert.match(cssSource, /\.download-cinematic__stage[\s\S]*height: 100svh/);
  assert.match(cssSource, /\.download-cinematic__film/);
  assert.match(cssSource, /\.download-cinematic__plate/);
  assert.match(cssSource, /\.download-cinematic__source-callout/);
  assert.match(cssSource, /\.download-cinematic__signal-overlay/);
  assert.match(cssSource, /\.download-cinematic__screen-composite/);
  assert.match(cssSource, /\.download-cinematic__ready-panel/);
  assert.match(cssSource, /\.download-cinematic__fallback/);
  assert.match(cssSource, /\.download-cinematic__fallback-media/);
  assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.download-cinematic__fallback/);
  assert.doesNotMatch(cssSource, /\.download-cinematic__room/);
  assert.doesNotMatch(cssSource, /\.download-cinematic__source-lane/);
  assert.doesNotMatch(cssSource, /\.studio-evolution/);
});

test("download cinematic removes old studio-evolution assets and references", () => {
  assert.equal(existsSync(new URL("../src/components/scene/StudioEvolutionScene.tsx", import.meta.url)), false);
  assert.equal(existsSync(new URL("../src/components/scene/StudioEvolutionActs.ts", import.meta.url)), false);
  assert.equal(existsSync(new URL("../src/components/scene/studio-evolution", import.meta.url)), false);
  assert.equal(existsSync(new URL("../src/data/studioEvolution.ts", import.meta.url)), false);
  assert.equal(existsSync(new URL("../public/assets/openstudio/studio-evolution", import.meta.url)), false);

  [downloadPageSource, downloadCinematicSource, downloadCinematicDataSource, cssSource].forEach((source) => {
    assert.doesNotMatch(source, /StudioEvolution/);
    assert.doesNotMatch(source, /studio-evolution/);
    assert.doesNotMatch(source, /GLTFLoader|RGBELoader|WebGLRenderer/);
  });
});
test("download requirements render as a responsive spec-sheet table", () => {
  assert.match(downloadPageSource, /data-download-requirements-table/);
  assert.match(downloadPageSource, /<table className="download-requirements__table">/);
  assert.match(downloadPageSource, /systemRequirementMatrix\.map/);
  assert.match(downloadPageSource, /download-requirements__mobile-label/);
  assert.match(cssSource, /\.download-requirements__table-wrap/);
  assert.match(cssSource, /\.download-requirements__table/);
  assert.match(cssSource, /@media \(max-width: 767px\)[\s\S]*\.download-requirements__mobile-label/);
  assert.doesNotMatch(downloadPageSource, /download-requirement-card/);
  assert.doesNotMatch(cssSource, /\.download-requirement-card/);
});

test("download page has page-scoped preview surfaces and touch-friendly controls", () => {
  assert.match(cssSource, /\.download-page\s*\{/);
  assert.match(downloadPageSource, /className="h-auto flex-1 px-6 py-4 font-bold"/);
  assert.match(downloadPageSource, /className="h-12 w-12 rounded-2xl p-0"/);
  assert.match(cssSource, /\.download-home-logo-stage/);
  assert.match(cssSource, /\.download-cinematic__ready-panel/);
  assert.match(cssSource, /\.download-requirements__table-wrap/);
  assert.match(cssSource, /\.download-ai-callout/);
});
