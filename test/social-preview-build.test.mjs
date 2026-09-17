import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { preview } from "vite";
import sharp from "sharp";
import { authoredRoutes } from "./helpers/authored-routes.mjs";

const imagePath = "/assets/openstudio/branding/og-image.png";
const meta = (html, name) => html.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]+)"`))?.[1];

test("all published pages expose early, fingerprinted share images without JavaScript", async () => {
  const png = await readFile(new URL(`../dist${imagePath}`, import.meta.url));
  assert.deepEqual(png, await readFile(new URL(`../public${imagePath}`, import.meta.url)));
  const hash = createHash("sha256").update(png).digest("hex").slice(0, 14);
  const image = await sharp(png).metadata();
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
  assert.equal(image.hasAlpha, false);
  for (const route of authoredRoutes) {
    const html = await readFile(new URL(`../dist${route === "/" ? "" : route}/index.html`, import.meta.url), "utf8");
    const headStart = Buffer.from(html).subarray(0, 4096).toString();
    const shareImage = meta(headStart, "og:image");
    assert.ok(shareImage, `${route}: image metadata must be in the first 4 KiB`);
    assert.ok(meta(headStart, "og:title"), route);
    assert.ok(meta(headStart, "og:description"), route);
    assert.equal(meta(headStart, "twitter:image"), shareImage, route);
    const url = new URL(shareImage);
    assert.equal(url.origin, "https://openstudio.org.in", route);
    const bytes = await readFile(new URL(`../dist${url.pathname}`, import.meta.url));
    assert.equal(url.searchParams.get("v"), createHash("sha256").update(bytes).digest("hex").slice(0, 14), route);
    if (!route.startsWith("/blog/")) assert.equal(shareImage, `https://openstudio.org.in${imagePath}?v=${hash}`, route);
    assert.ok(Buffer.byteLength(html.slice(0, html.indexOf('<meta charset="UTF-8"'))) < 1024, route);
  }
});

test("social crawler requests receive HTML metadata and a real PNG", { timeout: 60_000 }, async () => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  try {
    const base = server.resolvedUrls.local[0];
    for (const userAgent of ["WhatsApp/2.24.5.74 A", "facebookexternalhit/1.1", "Twitterbot/1.0", "LinkedInBot/1.0", "Slackbot-LinkExpanding 1.0", "Discordbot/2.0"]) {
      const headers = { "user-agent": userAgent };
      const response = await fetch(base, { headers });
      assert.equal(response.status, 200, userAgent);
      const image = new URL(meta(await response.text(), "og:image"));
      const imageResponse = await fetch(new URL(image.pathname + image.search, base), { headers });
      assert.equal(imageResponse.status, 200, userAgent);
      assert.match(imageResponse.headers.get("content-type"), /image\/png/);
      assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()), await readFile(new URL(`../dist${imagePath}`, import.meta.url)));
    }
    assert.equal((await fetch(new URL("/og-card", base))).status, 404);
  } finally {
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
  }
});
