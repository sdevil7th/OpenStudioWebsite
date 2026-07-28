import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const iconSvg = readFileSync(new URL("../public/assets/openstudio/branding/icon.svg", import.meta.url), "utf8");
const logoSource = readFileSync(
  new URL("../src/components/brand/BrandLogoConstructScene.tsx", import.meta.url),
  "utf8",
);
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../src/pages/HomePage.tsx", import.meta.url), "utf8");
const shellSource = readFileSync(new URL("../src/components/SiteShell.tsx", import.meta.url), "utf8");
const navbarSource = readFileSync(new URL("../src/components/SiteNavbar.tsx", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const buttonSource = readFileSync(new URL("../src/components/ui/button.tsx", import.meta.url), "utf8");
const viteConfigSource = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");
const indexCssSource = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
const initialLoadSource = readFileSync(new URL("../src/lib/initialLoad.ts", import.meta.url), "utf8");
const deferredStageSource = readFileSync(new URL("../src/components/DeferredClientStage.tsx", import.meta.url), "utf8");
const featuresSource = readFileSync(new URL("../src/pages/FeaturesPage.tsx", import.meta.url), "utf8");
const aiSource = readFileSync(new URL("../src/pages/StemSeparationPage.tsx", import.meta.url), "utf8");
const assetLoadingSource = readFileSync(new URL("../src/lib/assetLoading.ts", import.meta.url), "utf8");
const assetGraphqlSource = readFileSync(new URL("../src/lib/assetGraphQL.ts", import.meta.url), "utf8");
const assetGraphqlFunctionSource = readFileSync(new URL("../netlify/functions/assets-graphql.ts", import.meta.url), "utf8");
const sharedAssetPlanSource = readFileSync(new URL("../shared/asset-image-plan.ts", import.meta.url), "utf8");
const gsapSource = readFileSync(new URL("../src/lib/gsap.ts", import.meta.url), "utf8");
const runtimePreloadRegistrySource = readFileSync(
  new URL("../src/lib/runtimePreloadRegistry.ts", import.meta.url),
  "utf8",
);
const imageGeneratorSource = readFileSync(new URL("../scripts/generate-image-assets.mjs", import.meta.url), "utf8");
const packageSource = readFileSync(new URL("../package.json", import.meta.url), "utf8");
const smoothScrollSource = readFileSync(
  new URL("../src/components/SmoothScrollProvider.tsx", import.meta.url),
  "utf8",
);

const svgPathCount = (iconSvg.match(/<path\b/g) ?? []).length;
const svgFills = [...new Set([...iconSvg.matchAll(/fill="([^"]+)"/g)].map((match) => match[1]))];

test("brand logo construction scene represents every real svg path", () => {
  const sourcePieceCount = (logoSource.match(/\bid: "/g) ?? []).length;
  assert.equal(sourcePieceCount, svgPathCount);
  assert.match(logoSource, /BRAND_LOGO_VIEW_BOX = "634 505 784 784"/);
});

test("brand logo pieces preserve the original svg fill colors", () => {
  for (const fill of svgFills) {
    assert.ok(logoSource.includes(`fill: "${fill}"`), `missing fill ${fill}`);
  }
  assert.match(logoSource, /colorGroup: "cyan"/);
  assert.match(logoSource, /colorGroup: "navy"/);
});

test("homepage logo animation is viewport-driven and replayable", () => {
  assert.match(homeSource, /data-home-logo-scroll-section/);
  assert.match(homeSource, /HomeLogoAmbientField/);
  assert.match(homeSource, /home-logo-atmosphere__curtain/);
  assert.doesNotMatch(homeSource, /BRAND_LOGO_PIECES/);
  assert.doesNotMatch(homeSource, /BRAND_LOGO_VIEW_BOX/);
  assert.doesNotMatch(homeSource, /home-logo-atmosphere__pieces/);
  assert.match(homeSource, /criticalAssetRootRef=\{logoSectionRef\}/);
  assert.match(homeSource, /playback="viewport"/);
  assert.match(homeSource, /playbackMediaQuery="\(min-width: 1280px\)"/);
  assert.match(homeSource, /progressVariableTargetRef=\{logoSectionRef\}/);
  assert.doesNotMatch(homeSource, /window\.addEventListener\("scroll"/);
  assert.doesNotMatch(homeSource, /setLogoProgress/);
  assert.doesNotMatch(homeSource, /logoProgress/);
  assert.doesNotMatch(homeSource, /HOME_LOGO_ASSEMBLED_PROGRESS/);
  assert.doesNotMatch(homeSource, /xl:min-h-\[214vh\]/);
  assert.doesNotMatch(homeSource, /home-logo-scroll-section[^"]*overflow-hidden/);
  assert.doesNotMatch(homeSource, /ScrollTrigger\.create\(/);
  assert.doesNotMatch(homeSource, /pin: "\[data-home-logo-pin-stage\]"/);
  assert.doesNotMatch(homeSource, /setLogoProgress\(Number\(self\.progress\.toFixed\(3\)\)\)/);
  assert.match(logoSource, /playback\?: "static" \| "viewport"/);
  assert.match(logoSource, /playbackMediaQuery\?: string/);
  assert.match(logoSource, /introDurationMs\?: number/);
  assert.match(logoSource, /destructureDurationMs\?: number/);
  assert.match(logoSource, /introTargetProgress = 0\.62/);
  assert.match(logoSource, /introDurationMs = 1500/);
  assert.match(logoSource, /destructureStartVisibleRatio = 0\.78/);
  assert.match(logoSource, /destructureDurationMs = 720/);
  assert.match(logoSource, /reentryVisibleRatio = 0\.82/);
  assert.match(logoSource, /waitForCriticalAssets/);
  assert.match(logoSource, /waitForIntroHidden/);
  assert.match(logoSource, /document\.fonts\.ready/);
  assert.match(logoSource, /image\.decode/);
  assert.match(logoSource, /window\.__openstudioIntroHidden/);
  assert.match(logoSource, /openstudio:intro-hidden/);
  assert.match(logoSource, /Promise\.all\(\[/);
  assert.match(logoSource, /new IntersectionObserver/);
  assert.match(logoSource, /isLeavingUp/);
  assert.match(logoSource, /entry\.intersectionRatio < destructureStartVisibleRatio/);
  assert.match(logoSource, /entry\.intersectionRatio >= reentryVisibleRatio/);
  assert.match(logoSource, /animationFrame = window\.requestAnimationFrame\(tick\)/);
  assert.match(logoSource, /progressVariableTargetRef\?\.current\?\.style\.setProperty\("--home-logo-progress"/);
  assert.doesNotMatch(logoSource, /element\.style\.filter/);
  assert.doesNotMatch(logoSource, /brightness\(/);
  assert.doesNotMatch(logoSource, /drop-shadow\(0 0 \$\{Math\.round/);
  assert.match(logoSource, /progress = 0\.5/);
  assert.match(logoSource, /pieceStyle\(piece, clampedProgress/);
  assert.match(logoSource, /128 \+ seed \* 56/);
  assert.match(logoSource, /96 \+ seed \* 42/);
  assert.match(logoSource, /vw/);
  assert.match(logoSource, /vh/);
  assert.match(logoSource, /skewX/);
  assert.doesNotMatch(logoSource, /Math\.random/);
});

test("html-first loader appears before react and owns the split reveal", () => {
  assert.match(indexHtml, /id="openstudio-instant-loader"/);
  assert.ok(indexHtml.indexOf('id="openstudio-instant-loader"') < indexHtml.indexOf('id="root"'));
  assert.match(indexHtml, /data-openstudio-loader-state="loading"/);
  assert.match(indexHtml, /openstudio:app-ready/);
  assert.match(indexHtml, /openstudio:intro-hidden/);
  assert.match(indexHtml, /openstudio:\$\{name\}/);
  assert.match(indexHtml, /loader-visible/);
  assert.match(indexHtml, /css-ready/);
  assert.match(indexHtml, /intro-hidden/);
  assert.match(indexHtml, /__openstudioAppCssReady/);
  assert.match(indexHtml, /os-instant-loader__svg/);
  assert.match(indexHtml, /data-os-loader-piece="sky-ribbon-main"/);
  assert.match(indexHtml, /width: clamp\(10rem, 26vw, 16\.4rem\)/);
  assert.match(indexHtml, /\.os-instant-loader__content\s*\{[^}]*inset: 0/);
  assert.match(indexHtml, /\.os-instant-loader__mark\s*\{[^}]*bottom: calc\(50% \+ max\(clamp\(1\.75rem, 4svh, 3rem\), 6rem\)\)/);
  assert.match(indexHtml, /\.os-instant-loader__wordmark\s*\{[^}]*top: calc\(50% \+ clamp\(2rem, 4\.8svh, 3\.35rem\)\)/);
  assert.match(indexHtml, /getBBox\(\)/);
  assert.match(indexHtml, /anchorCenter/);
  assert.match(indexHtml, /orbitableCount/);
  assert.match(indexHtml, /slotAngle/);
  assert.match(indexHtml, /260 \+ \(slot % 3\) \* 58/);
  assert.match(indexHtml, /setAttribute\(\s*"transform"/);
  assert.match(indexHtml, /<g class="os-instant-loader__piece[^>]+data-os-loader-piece="sky-ribbon-main"/);
  assert.match(indexHtml, /requestAnimationFrame/);
  assert.doesNotMatch(indexHtml, /icon\.svg/);
  assert.doesNotMatch(indexHtml, /os-instant-loader__mark"[^]*?<span><\/span>\s*<span><\/span>\s*<span><\/span>/);
  assert.doesNotMatch(shellSource, /BrandIntroOverlay/);
  assert.doesNotMatch(shellSource, /site-shell-content--intro/);
  assert.match(viteConfigSource, /nonBlockingAppCss/);
  assert.match(viteConfigSource, /data-openstudio-app-css/);
});

test("homepage atmosphere is full-bleed and first input does not force heavy scroll libraries", () => {
  assert.match(indexCssSource, /\.home-logo-atmosphere\s*\{[^}]*inset: -18svh -14vw/);
  assert.match(indexCssSource, /\.home-logo-scroll-section\s*\{[\s\S]*--home-logo-progress: 0/);
  assert.match(indexCssSource, /\.home-logo-scroll-section\s*\{[\s\S]*--home-logo-scroll-range: 0px/);
  assert.match(indexCssSource, /opacity: calc\(0\.78 \+ var\(--home-logo-progress, 0\) \* 0\.12\)/);
  assert.match(indexCssSource, /@media \(max-width: 1279px\)\s*\{[\s\S]*--home-logo-progress: 0\.5/);
  assert.match(indexCssSource, /--home-logo-scroll-range: clamp\(22rem, 54svh, 36rem\)/);
  assert.match(indexCssSource, /\.brand-logo-construct\s*\{[\s\S]*contain: layout style/);
  assert.match(indexCssSource, /\.brand-logo-construct__trail-field/);
  const logoPathWillChangeBlock =
    indexCssSource.match(/\.brand-logo-construct__piece,\s*\.brand-logo-construct__trail\s*\{[^}]+\}/)?.[0] ?? "";
  assert.match(logoPathWillChangeBlock, /will-change: transform, opacity/);
  assert.doesNotMatch(logoPathWillChangeBlock, /filter/);
  assert.match(indexCssSource, /min-height: calc\(100svh \+ var\(--home-logo-scroll-range\)\)/);
  assert.match(indexCssSource, /\.home-logo-atmosphere__curtain/);
  assert.match(indexCssSource, /@keyframes home-logo-aurora-curtain/);
  assert.match(indexCssSource, /@keyframes home-logo-aurora-shimmer/);
  assert.doesNotMatch(indexCssSource, /\.home-logo-atmosphere__pieces/);
  assert.doesNotMatch(indexCssSource, /\.home-logo-atmosphere__piece/);
  assert.doesNotMatch(indexCssSource, /@keyframes home-logo-piece-drift/);
  assert.match(indexCssSource, /\.home-logo-sticky-stage\s*\{[^}]*position: sticky/);
  assert.match(indexCssSource, /\.home-logo-sticky-stage\s*\{[^}]*top: 0/);
  assert.doesNotMatch(indexCssSource, /\.home-logo-atmosphere\s*\{[^}]*mask-image/);
  assert.match(initialLoadSource, /runOnInput = true/);
  assert.match(gsapSource, /runOnInput = false/);
  assert.match(smoothScrollSource, /runOnInput: false/);
  assert.match(shellSource, /lenisRef/);
  assert.match(shellSource, /\[location\.hash, location\.pathname\]/);
  assert.doesNotMatch(shellSource, /\[lenis,\s*location\.pathname\]/);
});

test("initial routes are lazy-loaded behind the html-first loader", () => {
  assert.match(appSource, /preloadModuleOnce/);
  assert.match(runtimePreloadRegistrySource, /modulePreloadCache/);
  assert.match(appSource, /const loadHomePage = \(\) => preloadModuleOnce\("route:home", \(\) => import\("@\/pages\/HomePage"\)\)/);
  assert.match(appSource, /const HomePage = lazy\(loadHomePage\)/);
  assert.match(appSource, /const RouteFallback = \(\) =>/);
  assert.match(appSource, /openstudio:route-fallback/);
  assert.match(shellSource, /routeFallbackTokens/);
  assert.match(shellSource, /data-route-pending=\{routePending \? "true" : "false"\}/);
  assert.match(shellSource, /\{!routePending \? <SiteFooter \/> : null\}/);
  assert.match(appSource, /<Suspense fallback=\{<RouteFallback \/>\}>/);
  assert.match(appSource, /route-transition-surface/);
  assert.match(indexCssSource, /\.route-transition-surface \{[\s\S]*min-height: 100svh/);
  assert.match(appSource, /__openstudioFirstRouteReveal/);
  assert.doesNotMatch(appSource, /const PageLoader = \(\) =>/);
  assert.doesNotMatch(appSource, /Suspense fallback=\{null\}/);
  assert.doesNotMatch(appSource, /import HomePage from "@\/pages\/HomePage"/);
});

test("heavy route dependencies are deferred behind polished surfaces", () => {
  assert.match(deferredStageSource, /scheduleAfterInitialLoad/);
  assert.match(deferredStageSource, /runOnInput: false/);
  assert.match(deferredStageSource, /idleDelay = 1800/);
  assert.match(featuresSource, /FeatureCanonicalStory/);
  assert.match(featuresSource, /canonicalRouteUpcoming/);
  assert.match(featuresSource, /FeaturesStoryBackdrop/);
  assert.doesNotMatch(featuresSource, /rootMargin="1400px 0px"/);
  assert.doesNotMatch(featuresSource, /from "framer-motion"/);
  assert.match(aiSource, /const PretextEditorialField = lazy/);
  assert.match(aiSource, /idleDelay=\{720\}/);
  assert.match(aiSource, /rootMargin="1400px 0px"/);
  assert.doesNotMatch(aiSource, /from "framer-motion"/);
  assert.match(viteConfigSource, /"gsap-vendor"/);
  assert.match(viteConfigSource, /"lenis-vendor"/);
  assert.match(viteConfigSource, /"radix-vendor"/);
  assert.match(assetLoadingSource, /assetPriorityManifest/);
  assert.match(assetLoadingSource, /"heavy-story\/on-viewport"/);
  assert.match(assetLoadingSource, /generatedImagePath/);
  assert.match(assetLoadingSource, /netlifyImageCdnUrl/);
  assert.match(assetLoadingSource, /getResponsiveImageAttributes/);
  assert.match(assetLoadingSource, /\[320, 480, 640, 768, 960, 1280, 1600, 1920, 2560, 3200, 3360\]/);
  assert.match(assetGraphqlSource, /assets-graphql/);
  assert.match(assetGraphqlSource, /OpenStudioImagePlan/);
  assert.match(assetGraphqlFunctionSource, /buildAssetPlan/);
  assert.match(sharedAssetPlanSource, /\/\.netlify\/images/);
  assert.match(sharedAssetPlanSource, /selectImageWidth/);
  assert.match(sharedAssetPlanSource, /transition-mask/);
  assert.match(sharedAssetPlanSource, /q: String\(quality\)/);
  assert.match(sharedAssetPlanSource, /params\.set\("h", String\(resolvedHeight\)\)/);
  assert.doesNotMatch(sharedAssetPlanSource, /quality: String\(quality\)/);
  assert.match(imageGeneratorSource, /from "sharp"/);
  assert.match(imageGeneratorSource, /createHash/);
  assert.match(imageGeneratorSource, /public.*assets.*openstudio.*generated/s);
  assert.match(imageGeneratorSource, /image-manifest\.json/);
  assert.match(imageGeneratorSource, /collectReferencedAssetPaths/);
  assert.match(packageSource, /"generate-image-assets"/);
  assert.match(packageSource, /"sharp":/);
});

test("shared button component owns the app-wide interaction theme", () => {
  assert.match(buttonSource, /openstudio-button/);
  assert.match(buttonSource, /onPointerMove/);
  assert.match(buttonSource, /onPointerDown/);
  assert.match(buttonSource, /--openstudio-button-x/);
  assert.match(homeSource, /<Button[\s\S]*?asChild[\s\S]*?className="h-auto min-w-\[min\(100%,17rem\)\]/);
  assert.doesNotMatch(homeSource, /home-action-button/);
});

test("homepage and navbar expose the logo on the home route", () => {
  assert.match(homeSource, /<BrandLogoConstructScene/);
  assert.doesNotMatch(navbarSource, /!isHome/);
  assert.doesNotMatch(navbarSource, /const isHome = location\.pathname === "\/"/);
});
