import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "vite";

const person = login => ({ login, profilePath: `/${login}`, avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4" });
const summary = (count, contributors) => ({ contributors: { contributorCount: count, contributors } });

test("GitHub contributor totals include co-authors and are independent of the avatar preview size", async () => {
  const server = await createServer({ configFile: false, logLevel: "silent", server: { middlewareMode: true } });
  try {
    const { parseContributorSummary: parse } = await server.ssrLoadModule("/shared/github-contributors.ts");
    assert.equal(parse(summary(2, [person("author"), person("co-author")])).count, 2);
    assert.equal(parse(summary(23, [person("author")])).count, 23, "never count just the first page of avatar results");
    assert.equal(parse(summary(2, [person("author"), person("co-author")])).contributors[1].contributions, undefined, "do not invent a co-author's commit count");
    assert.equal(parse(summary(0, [])).count, 0);
    for (const invalid of [
      {}, { contributors: null }, summary("2", []), summary(-1, []), summary(1.5, []),
      summary(1, [person("one"), person("two")]), summary(2, [person("one"), person("ONE")]),
      summary(1, [{ ...person("one"), profilePath: "//evil.example" }]),
      summary(1, [{ ...person("one"), avatarUrl: "https://avatars.githubusercontent.com.evil.example/a" }]),
      summary(1, [{ ...person("one"), avatarUrl: "https://secret@avatars.githubusercontent.com/a" }]),
    ]) assert.throws(() => parse(invalid));
  } finally { await server.close(); }
});

test("contributor summaries use the selected app repo without exposing API credentials", async () => {
  const server = await createServer({ configFile: false, logLevel: "silent", server: { middlewareMode: true } });
  const originalFetch = globalThis.fetch;
  try {
    const { fetchGithubContributors } = await server.ssrLoadModule("/shared/github-contributors.ts");
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://github.com/example/app/_sidebar");
      assert.equal(new Headers(options.headers).get("Authorization"), null);
      assert.equal(new Headers(options.headers).get("Accept"), "application/json");
      assert.ok(options.signal);
      return Response.json(summary(2, [person("author"), person("co-author")]));
    };
    assert.equal((await fetchGithubContributors("https://github.com/example/app")).count, 2);
    globalThis.fetch = async () => new Response("Unavailable", { status: 503 });
    await assert.rejects(fetchGithubContributors("https://github.com/example/app"), /503/);
    globalThis.fetch = async () => Response.json({ contributors: { count: 2 } });
    await assert.rejects(fetchGithubContributors("https://github.com/example/app"), /Invalid/);
  } finally {
    globalThis.fetch = originalFetch;
    await server.close();
  }
});
