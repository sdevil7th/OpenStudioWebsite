import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const analyticsSource = readFileSync(new URL("../src/lib/analytics.ts", import.meta.url), "utf8");

test("google analytics uses the standard gtag command queue shape", () => {
  assert.match(analyticsSource, /function gtagCommand\(\)/);
  assert.match(analyticsSource, /window\.dataLayer\?\.push\(arguments\)/);
  assert.doesNotMatch(analyticsSource, /dataLayer\?\.push\(args\)/);
});
