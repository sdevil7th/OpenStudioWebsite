import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const iconSvg = readFileSync(new URL("../public/assets/openstudio/branding/icon.svg", import.meta.url), "utf8");
const logoSource = readFileSync(
  new URL("../src/components/brand/BrandLogoConstructScene.tsx", import.meta.url),
  "utf8",
);
const introSource = readFileSync(
  new URL("../src/components/brand/BrandIntroOverlay.tsx", import.meta.url),
  "utf8",
);
const homeSource = readFileSync(new URL("../src/pages/HomePage.tsx", import.meta.url), "utf8");
const shellSource = readFileSync(new URL("../src/components/SiteShell.tsx", import.meta.url), "utf8");
const navbarSource = readFileSync(new URL("../src/components/SiteNavbar.tsx", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const buttonSource = readFileSync(new URL("../src/components/ui/button.tsx", import.meta.url), "utf8");

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

test("homepage logo scroll is progress-derived and reversible", () => {
  assert.match(homeSource, /data-home-logo-scroll-section/);
  assert.match(homeSource, /ScrollTrigger\.create\(/);
  assert.match(homeSource, /setLogoProgress\(Number\(self\.progress\.toFixed\(3\)\)\)/);
  assert.match(logoSource, /progress = 0\.5/);
  assert.match(logoSource, /pieceStyle\(piece, clampedProgress/);
  assert.match(logoSource, /128 \+ seed \* 56/);
  assert.match(logoSource, /96 \+ seed \* 42/);
  assert.match(logoSource, /vw/);
  assert.match(logoSource, /vh/);
  assert.match(logoSource, /skewX/);
  assert.doesNotMatch(logoSource, /Math\.random/);
});

test("shared brand intro is hard-load gated and reduced-motion aware", () => {
  assert.match(shellSource, /<BrandIntroOverlay onVisibilityChange=\{setBrandIntroVisible\} \/>/);
  assert.match(shellSource, /site-shell-content--intro/);
  assert.match(introSource, /BRAND_INTRO_DURATION_MS = 1500/);
  assert.match(introSource, /INTRO_TARGET_PROGRESS = 0\.66/);
  assert.match(introSource, /document\.getElementById\("main-content"\)/);
  assert.match(introSource, /useReducedMotion/);
  assert.match(introSource, /initialPathRef\.current === "\/og-card"/);
  assert.doesNotMatch(introSource, /sessionStorage/);
});

test("initial routes are lazy-loaded behind the brand intro", () => {
  assert.match(appSource, /lazy\(\(\) => import\("@\/pages\/HomePage"\)\)/);
  assert.match(appSource, /const PageLoader = \(\) =>/);
  assert.match(appSource, /<Suspense fallback=\{<PageLoader \/>\}>/);
  assert.doesNotMatch(appSource, /Suspense fallback=\{null\}/);
  assert.doesNotMatch(appSource, /import HomePage from "@\/pages\/HomePage"/);
});

test("shared button component owns the app-wide interaction theme", () => {
  assert.match(buttonSource, /openstudio-button/);
  assert.match(buttonSource, /onPointerMove/);
  assert.match(buttonSource, /onPointerDown/);
  assert.match(buttonSource, /--openstudio-button-x/);
  assert.match(homeSource, /<Button asChild className="h-auto min-w-\[min\(100%,17rem\)\]/);
  assert.doesNotMatch(homeSource, /home-action-button/);
});

test("homepage and navbar expose the logo on the home route", () => {
  assert.match(homeSource, /<BrandLogoConstructScene/);
  assert.doesNotMatch(navbarSource, /!isHome/);
  assert.doesNotMatch(navbarSource, /const isHome = location\.pathname === "\/"/);
});
