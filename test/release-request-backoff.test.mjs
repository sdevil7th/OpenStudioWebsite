import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createServer } from "vite";

test("release fallback backs off, deduplicates retries, caps the delay and recovers", async () => {
  const vite = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = originalNow();
  let calls = 0;
  let recover = false;
  const published = JSON.parse(readFileSync("public/github/latest-release.json", "utf8"));
  const manifest = JSON.parse(readFileSync("public/releases/latest.json", "utf8"));
  try {
    const { loadReleaseInfo } = await vite.ssrLoadModule("/src/hooks/useReleaseInfo.ts");
    Date.now = () => now;
    globalThis.fetch = async (url) => {
      calls++;
      assert.ok(!url.includes("/.netlify/functions/"));
      const body = url.includes("/github/") ? published : manifest;
      return new Response(JSON.stringify(recover ? body : {}), { status: recover ? 200 : 503, headers: { "Content-Type": "application/json" } });
    };
    const fallback = await loadReleaseInfo();
    assert.equal(calls, 2);
    for (const cooldown of [30_000, 60_000, 120_000, 240_000, 300_000, 300_000]) {
      const before = calls;
      now += cooldown - 1;
      assert.equal(await loadReleaseInfo(), fallback);
      assert.equal(calls, before);
      now++;
      const [first, second] = await Promise.all([loadReleaseInfo(), loadReleaseInfo()]);
      assert.equal(first, second, "one result shared by concurrent retry callers");
      assert.equal(calls, before + 2);
    }
    recover = true;
    now += 300_000;
    const successful = await loadReleaseInfo();
    assert.equal(successful.tagName, published.tagName);
    const before = calls;
    now += 600_000;
    assert.equal(await loadReleaseInfo(), successful);
    assert.equal(calls, before, "successful results stay cached for this page session");
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
    await vite.close();
  }
});
