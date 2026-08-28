import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const analyticsSource = readFileSync(new URL("../src/lib/analytics.ts", import.meta.url), "utf8");
const navbarSource = readFileSync(new URL("../src/components/SiteNavbar.tsx", import.meta.url), "utf8");

test("google analytics uses the standard gtag command queue shape", () => {
  assert.match(analyticsSource, /function gtagCommand\(\)/);
  assert.match(analyticsSource, /window\.dataLayer\?\.push\(arguments\)/);
  assert.doesNotMatch(analyticsSource, /dataLayer\?\.push\(args\)/);
});

test("analytics providers wait for the visible-idle gate and flush queued commands", () => {
  assert.match(
    analyticsSource,
    /scheduleAfterInitialLoad\(\s*initializeAnalyticsProviders/,
  );
  assert.match(analyticsSource, /pendingAnalyticsCommands\.push\(command\)/);
  assert.match(analyticsSource, /pendingAnalyticsCommands\.splice\(0\)/);
  assert.match(
    analyticsSource,
    /queuedCommands\.forEach\(\(command\) =>\s*dispatchAnalyticsCommand/,
  );
});

test("mobile navigation loads after startup or direct navigation intent", () => {
  assert.match(navbarSource, /mobileNavModulePromise = importMobileNavSheet\(\)\.catch/);
  assert.match(navbarSource, /mobileNavModulePromise = null/);
  assert.match(navbarSource, /loadMobileNavSheet\(\)\.catch\(\(\) => undefined\)/);
  assert.match(navbarSource, /\.then\(\(\) => setMobileNavRequested\(true\)\)/);
  assert.match(navbarSource, /scheduleAfterInitialLoad\(/);
  assert.match(navbarSource, /onFocus=\{preloadMobileNav\}/);
  assert.match(navbarSource, /onPointerDown=\{preloadMobileNav\}/);
  assert.match(navbarSource, /onPointerEnter=\{preloadMobileNav\}/);
  assert.doesNotMatch(
    navbarSource,
    /if \(mediaQuery\.matches\) \{\s*setMobileNavRequested\(true\)/,
  );
});
