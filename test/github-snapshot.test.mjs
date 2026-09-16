import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createServer } from "vite";

const published = JSON.parse(readFileSync(new URL("../public/github/repository.json", import.meta.url), "utf8"));

test("repository snapshots validate nested data, URLs and old cache compatibility", async () => {
  const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
  try {
    const { parseGithubRepoSnapshot: parse } = await server.ssrLoadModule("/shared/github-snapshot.ts");
    assert.deepEqual(parse(published), published);
    const legacy = { ...published };
    delete legacy.languages;
    delete legacy.contributors;
    delete legacy.releases;
    delete legacy.releaseCount;
    assert.deepEqual(parse(legacy, published).languages, published.languages);
    assert.deepEqual(parse(legacy, published).contributors, published.contributors);
    assert.equal(parse(legacy, published).releases, undefined);
    assert.deepEqual(parse({ ...published, languages: [], contributors: [] }, published).languages, []);
    assert.equal(parse({ ...published, latestRelease: null, hasPublishedReleases: false }).latestRelease, null);
    for (const invalid of [
      null, [], { error: "rate limit" },
      { ...published, fetchedAt: "not a date" },
      { ...published, repositoryUrl: "javascript:alert(1)" },
      { ...published, ownerProfileUrl: "https://github.com.evil.example/user" },
      { ...published, ownerAvatarUrl: "data:image/svg+xml,unsafe" },
      { ...published, stats: { ...published.stats, stars: -1 } },
      { ...published, stats: { ...published.stats, forks: "12" } },
      { ...published, releaseCount: Infinity },
      { ...published, languages: {} },
      { ...published, languages: [{ name: "C++", bytes: 10, percent: 101 }] },
      { ...published, contributors: [{ ...published.contributors[0], contributions: 1.5 }] },
      { ...published, latestRelease: { ...published.latestRelease, isPrerelease: true } },
      { ...published, latestRelease: { ...published.latestRelease, tagName: "ai-runtime-v1" } },
      { ...published, latestRelease: null, hasPublishedReleases: true },
      { ...published, releases: [{ ...published.latestRelease, assets: [null] }] },
      { ...published, releases: [{ ...published.latestRelease, assets: [{ name: "installer", size: -1 }] }] },
      { ...published, releases: [{ ...published.latestRelease, htmlUrl: "https://user:pass@github.com/a" }] },
      { ...published, releases: [{ ...published.latestRelease, body: {} }] },
    ]) assert.throws(() => parse(invalid, published));
  } finally {
    await server.close();
  }
});

test("invalid repository responses do not poison cached requests and can be retried", async () => {
  const server = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
  const originalFetch = globalThis.fetch;
  try {
    const { getGithubRepoSnapshot, githubFallbackSnapshot } = await server.ssrLoadModule("/src/lib/github.ts");
    let requests = 0;
    globalThis.fetch = async () => new Response(JSON.stringify(++requests === 1 ? { stats: null } : published));
    await assert.rejects(getGithubRepoSnapshot());
    assert.deepEqual(githubFallbackSnapshot, published, "the known build snapshot stays intact");
    const [first, second] = await Promise.all([getGithubRepoSnapshot(), getGithubRepoSnapshot()]);
    assert.deepEqual(first, published);
    assert.equal(first, second);
    assert.equal(requests, 2, "successful concurrent requests share one validated result");
  } finally {
    globalThis.fetch = originalFetch;
    await server.close();
  }
});
