import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { routeDependencies } from "../scripts/prerender-site.mjs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(read("dist/.vite/manifest.json"));
const rewrites = read("dist/_redirects")
  .trim()
  .split("\n")
  .map((line) => line.split(/\s+/));
const routes = new Map([["/", "/index.html"], ...rewrites.map(([from, to]) => [from, to])]);
const netlify = read("netlify.toml");
const downloadPaths = new Set([...netlify.matchAll(/from = "(\/download\/[^\"]+)"/g)].map((match) => match[1]));
const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&quot;", '"');

test("all 35 canonical pages have unique, indexable prerendered documents", () => {
  assert.equal(routes.size, 35);
  assert.equal([...routes.keys()].filter((route) => route.startsWith("/docs/")).length, 15);
  const titles = new Set();
  for (const [route, file] of routes) {
    const html = read(`dist${file}`);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title && !titles.has(title), `unique title: ${route}`);
    titles.add(title);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${route}: one page heading`);
    assert.ok(html.includes(`rel="canonical" href="https://openstudio.org.in${route}"`), route);
    assert.doesNotMatch(html, /name="robots" content="noindex/);
    assert.match(html, /data-static-route-content/);
  }
});

test("retained links, images and generated srcsets resolve in the production artifact", () => {
  for (const [route, file] of routes) {
    const html = read(`dist${file}`);
    const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => decode(match[1]));
    refs.push(
      ...[...html.matchAll(/srcset="([^"]+)"/g)].flatMap((match) =>
        decode(match[1])
          .split(",")
          .map((part) => part.trim().split(/\s+/)[0]),
      ),
    );
    for (const ref of refs) {
      if (!ref.startsWith("/") || ref.startsWith("//")) continue;
      const url = new URL(ref, "https://openstudio.org.in");
      const exists =
        routes.has(url.pathname) ||
        downloadPaths.has(url.pathname) ||
        url.pathname === "/og-card" ||
        existsSync(path.join(root, "dist", decodeURIComponent(url.pathname)));
      assert.ok(exists, `${route} references missing ${ref}`);
      if (url.hash && routes.has(url.pathname)) {
        const target = read(`dist${routes.get(url.pathname)}`);
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(target.includes(`id="${id}"`), `${route} references missing anchor ${ref}`);
      }
    }
  }
});

test("text pages and the entry leave illustration and animation modules deferred", () => {
  for (const source of ["index.html", "src/pages/LegalPage.tsx", "src/pages/DocPage.tsx"]) {
    const dependencies = routeDependencies(manifest, [source]);
    assert.doesNotMatch(
      dependencies.files.join(" "),
      /NamRackStage|LiveSession|useStageTimeline|PianoRollStage|MixerPanelLite|ArrangementLanes/,
    );
    const code = dependencies.files.map((file) => read(`dist${file}`)).join("\n");
    assert.doesNotMatch(code, /gsap\.registerPlugin|NAM RACK DESIGN|nam-rack-design-port/);
  }
  assert.equal(existsSync(path.join(root, "netlify/functions/assets-graphql.ts")), false);
  assert.doesNotMatch(read("src/styles/site.css"), /!important/);
});

test("old routes redirect and unknown documents retain an HTTP 404 policy", () => {
  for (const [from, to] of [
    ["/v2", "/"],
    ["/v2/*", "/:splat"],
    ["/blogs", "/blog"],
    ["/blogs/*", "/blog/:splat"],
    ["/github", "/community"],
    ["/contact", "/community#contact"],
  ]) {
    const block = netlify.split("[[redirects]]").find((rule) => rule.includes(`from = "${from}"`));
    assert.ok(block?.includes(`to = "${to}"`) && block.includes("status = 301"), from);
  }
  assert.match(netlify, /from = "\/\*"\s+to = "\/404.html"\s+status = 404/);
  assert.match(read("dist/404.html"), /name="robots" content="noindex/);
  assert.doesNotMatch(read("dist/404.html"), /rel="canonical"/);
  assert.doesNotMatch(read("dist/sitemap.xml"), /\/v2|\/blogs|\/404/);
});
