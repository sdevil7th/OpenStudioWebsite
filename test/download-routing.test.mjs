import assert from "node:assert/strict";
import { readFile, readdir, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { test } from "node:test";
import { createServer, preview } from "vite";
import { parseAllRedirects } from "@netlify/redirect-parser";

test("download compatibility, architecture precedence and bounded offline load", async () => {
  const vite = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
  const originalFetch = globalThis.fetch;
  try {
    const { resolveDownload, fixedDownloadRoutes, isDynamicDownload, githubAliases } = await vite.ssrLoadModule("/shared/download-routing.ts");
    const { downloadCatalog } = await vite.ssrLoadModule("/shared/generatedDownloadCatalog.ts");
    const { default: handler, config } = await vite.ssrLoadModule("/netlify/functions/download-resolver.ts");
    assert.deepEqual(await readdir("netlify/functions"), ["download-resolver.ts"]);
    assert.deepEqual(config.rateLimit, { windowLimit: 60, windowSize: 60, aggregateBy: ["ip", "domain"] });
    assert.ok(!config.path.includes("/.netlify/functions/download-resolver"));
    for (const path of config.path) assert.ok(isDynamicDownload(path) || fixedDownloadRoutes(downloadCatalog).has(path) || githubAliases[path], path);
    for (const path of [...fixedDownloadRoutes(downloadCatalog).keys(), ...Object.keys(githubAliases)].filter((path) => path.startsWith("/.netlify/"))) {
      assert.ok(config.path.includes(path), `${path} must be protected by the same rule`);
    }
    let upstreamCalls = 0;
    globalThis.fetch = async () => { upstreamCalls++; throw new Error("Runtime network requests are forbidden"); };
    for (const [path, document] of Object.entries(githubAliases)) {
      const response = handler(new Request(`https://example.test${path}`));
      assert.equal(response.status, 302);
      assert.equal(response.headers.get("location"), document);
    }
    for (const [path, target] of fixedDownloadRoutes(downloadCatalog)) {
      for (const method of ["GET", "HEAD"]) {
        const response = resolveDownload(new Request(`https://example.test${path}?cacheBust=1`, { method }), downloadCatalog);
        assert.equal(response.status, 302);
        assert.equal(response.headers.get("location"), target);
        assert.equal(await response.text(), "");
      }
    }
    // Synthetic URLs are confined to test data; exercise both modern and legacy schemas.
    const asset = (name) => ({ fileName: name, url: `https://example.test/${name}`, sha256: "a".repeat(64), size: 1 });
    const catalog = structuredClone(downloadCatalog);
    for (const platform of ["macos", "linux"]) {
      catalog.runtime.platforms[platform] = { arm64: asset(`${platform}-arm64`), x64: asset(`${platform}-x64`), legacy: null };
      for (const path of [`/download/ai-runtime/${platform}/latest`, `/.netlify/functions/download-latest-ai-runtime-${platform}`]) {
        const resolve = (query = "", headers = {}) => resolveDownload(new Request(`https://example.test${path}${query}`, { headers }), catalog);
        assert.equal(resolve("?arch=aarch64", { "sec-ch-ua-arch": '"x86"', "user-agent": "Intel" }).headers.get("location"), `https://example.test/${platform}-arm64`);
        assert.equal(resolve("?arch=invalid", { "sec-ch-ua-arch": '"x86"', "user-agent": "arm64" }).headers.get("location"), `https://example.test/${platform}-x64`);
        assert.equal(resolve("", { "user-agent": "Apple Silicon" }).headers.get("location"), `https://example.test/${platform}-arm64`);
        assert.equal(resolve().headers.get("location"), platform === "linux" ? "https://example.test/linux-x64" : catalog.fallback);
        assert.equal(resolve().headers.get("cache-control"), "no-store");
        catalog.runtime.platforms[platform].legacy = asset("legacy");
        assert.equal(resolve("?arch=arm64").headers.get("location"), "https://example.test/legacy");
        catalog.runtime.platforms[platform].legacy = null;
      }
    }
    const generic = "https://example.test/.netlify/functions/download-latest";
    assert.equal(handler(new Request(`${generic}?platform=WINDOWS`)).headers.get("location"), downloadCatalog.app.windows);
    assert.equal(handler(new Request(`${generic}/macos?platform=windows`)).headers.get("location"), downloadCatalog.app.macos);
    for (const method of ["GET", "HEAD"]) {
      for (const platform of ["WINDOWS", "MacOS", "LiNuX"]) {
        const response = handler(new Request(`${generic}/${platform}/?platform=invalid`, { method }));
        assert.equal(response.status, 302);
        assert.equal(response.headers.get("location"), downloadCatalog.app[platform.toLowerCase()]);
      }
    }
    assert.equal(handler(new Request(`${generic}?platform=invalid`)).status, 400);
    assert.equal(handler(new Request("https://example.test/.netlify/functions/download-resolver")).status, 404);
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      const response = handler(new Request(`${generic}?platform=windows`, { method }));
      assert.equal(response.status, 405);
      assert.equal(response.headers.get("allow"), "GET, HEAD");
    }
    // Bounded stress test: invoke locally, including random queries and unsupported methods.
    for (let batch = 0; batch < 100; batch++) {
      await Promise.all(Array.from({ length: 50 }, async (_, i) => {
        const response = await handler(new Request(`${generic}?platform=windows&nonce=${batch}-${i}`, { method: i % 2 ? "GET" : "POST" }));
        assert.equal(response.status, i % 2 ? 302 : 405);
      }));
    }
    assert.equal(upstreamCalls, 0, "5,000 handler calls must produce zero network requests");
  } finally {
    globalThis.fetch = originalFetch;
    await vite.close();
  }
});

test("preview uses built redirects and release inputs independently of the working catalog", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "openstudio-download-preview-"));
  const vite = await createServer({ configFile: false, logLevel: "silent", server: { middlewareMode: true } });
  let server;
  try {
    const { previewRoutes } = await vite.ssrLoadModule("/shared/preview-routes.ts");
    const dist = path.join(root, "dist");
    await mkdir(path.join(dist, ".vite"), { recursive: true });
    await mkdir(path.join(dist, "releases/ai-runtime/stable"), { recursive: true });
    const asset = (name) => ({ fileName: name, url: `https://example.test/Built-${name}?Token=CaseSensitive`, sha256: "a".repeat(64), size: 1 });
    const built = {
      windows: "https://example.test/Built-Windows.exe?Token=CaseSensitive",
      macos: "https://example.test/Built-MacOS.dmg",
      linux: "https://example.test/Built-Linux.AppImage",
      fallback: "https://example.test/Built-Releases",
    };
    await Promise.all([
      writeFile(path.join(root, "netlify.toml"), ""),
      writeFile(path.join(dist, "index.html"), "Built site"),
      writeFile(path.join(dist, "404.html"), "Not found"),
      writeFile(path.join(dist, "_redirects"), "/download/windows/latest https://example.test/CDN-Windows.exe?Token=Unchanged 302!\n"),
      writeFile(path.join(dist, ".vite/download-routing.json"), JSON.stringify(built)),
      writeFile(path.join(dist, "releases/ai-runtime/stable/latest.json"), JSON.stringify({
        schemaVersion: 1, channel: "stable", appVersion: "1.0.0", runtimeVersion: "1.0.0", publishedAt: "2026-01-01T00:00:00Z",
        platforms: { windows: asset("Windows.zip"), macos: { arm64: asset("ARM64.zip"), x64: asset("X64.zip") } },
      })),
    ]);
    server = await preview({ root, configFile: false, plugins: [previewRoutes()], logLevel: "silent", preview: { host: "127.0.0.1", port: 0 } });
    const checks = [
      ["/DOWNLOAD/Windows/LATEST/", "https://example.test/CDN-Windows.exe?Token=Unchanged"],
      ["/.netlify/functions/download-latest/WINDOWS/?platform=macos", built.windows],
      ["/.netlify/functions/download-latest-windows", built.windows],
      ["/.netlify/functions/download-latest?platform=MACOS", built.macos],
      ["/download/AI-RUNTIME/MacOS/latest/?arch=ARM64", asset("ARM64.zip").url],
      ["/.netlify/functions/download-latest-ai-runtime-macos?arch=x64", asset("X64.zip").url],
      ["/download/ai-runtime/macos/latest", built.fallback],
    ];
    for (const [route, target] of checks) {
      for (const method of ["GET", "HEAD"]) {
        const response = await fetch(new URL(route, server.resolvedUrls.local[0]), { method, redirect: "manual" });
        assert.equal(response.status, 302, route);
        assert.equal(response.headers.get("location"), target, route);
      }
    }
  } finally {
    if (server) await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    await vite.close();
    await rm(root, { recursive: true, force: true });
  }
});

test("development bridge accepts mixed-case legacy platform paths", async () => {
  const loader = await createServer({ configFile: false, logLevel: "silent", server: { middlewareMode: true } });
  let server;
  try {
    const { downloadDevBridge } = await loader.ssrLoadModule("/shared/preview-routes.ts");
    const { downloadCatalog } = await loader.ssrLoadModule("/shared/generatedDownloadCatalog.ts");
    server = await createServer({ configFile: false, plugins: [downloadDevBridge()], logLevel: "silent", server: { host: "127.0.0.1", port: 0 } });
    await server.listen();
    for (const method of ["GET", "HEAD"]) {
      const response = await fetch(new URL("/.netlify/functions/download-latest/WINDOWS/?platform=linux", server.resolvedUrls.local[0]), { method, redirect: "manual" });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get("location"), downloadCatalog.app.windows);
    }
  } finally {
    if (server) await server.close();
    await loader.close();
  }
});

test("Netlify accepts built CDN rules; fixed downloads and old GitHub URLs remain usable", async () => {
  const rules = await readFile("dist/_redirects", "utf8");
  const parsed = await parseAllRedirects({ redirectsFiles: ["dist/_redirects"], netlifyConfigPath: "netlify.toml" });
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.redirects.filter((rule) => rule.status === 302).length, 8);
  assert.ok(!rules.includes("/.netlify/"));
  const vite = await createServer({ logLevel: "silent", server: { middlewareMode: true } });
  const server = await preview({ logLevel: "silent", preview: { host: "127.0.0.1", port: 0 } });
  try {
    const { downloadCatalog } = await vite.ssrLoadModule("/shared/generatedDownloadCatalog.ts");
    const { fixedDownloadRoutes, githubAliases } = await vite.ssrLoadModule("/shared/download-routing.ts");
    const origin = server.resolvedUrls.local[0];
    for (const [path, target] of fixedDownloadRoutes(downloadCatalog)) {
      if (!path.startsWith("/.netlify/")) assert.ok(rules.includes(`${path} ${target} 302!\n`), path);
      const response = await fetch(new URL(path, origin), { redirect: "manual" });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get("location"), target);
    }
    for (const [path, document] of Object.entries(githubAliases)) {
      const redirect = await fetch(new URL(path, origin), { redirect: "manual" });
      assert.equal(redirect.status, 302);
      assert.equal(redirect.headers.get("location"), document);
      const response = await fetch(new URL(path, origin));
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /json/);
      assert.deepEqual(await response.json(), JSON.parse(await readFile(`dist${document}`, "utf8")));
    }
    const missing = await fetch(new URL("/.netlify/functions/download-resolver", origin));
    assert.equal(missing.status, 404);
  } finally {
    await vite.close();
    await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
  }
});
