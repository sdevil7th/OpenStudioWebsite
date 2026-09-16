import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const analyticsSource = readFileSync(new URL("../src/lib/analytics.ts", import.meta.url), "utf8");

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
