import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import { redirectToLatestPlatformRelease } from "../netlify/functions/download-latest";

/** Make local production previews exercise the same documents and aliases as Netlify. */
export function previewRoutes(): Plugin {
  return {
    name: "openstudio-preview-routes",
    async configurePreviewServer(server) {
      const dist = path.resolve(server.config.root, server.config.build.outDir);
      const rewrites = new Map(
        (await fs.readFile(path.join(dist, "_redirects"), "utf8"))
          .trim()
          .split("\n")
          .map((line) => {
            const [from, to] = line.trim().split(/\s+/);
            return [from, to];
          }),
      );
      const config = await fs.readFile(path.join(server.config.root, "netlify.toml"), "utf8");
      const aliases = [...config.matchAll(/\[\[redirects\]\]([\s\S]*?)(?=\[\[redirects\]\]|$)/g)].flatMap(
        ([, block]) => {
          const from = block.match(/from\s*=\s*"([^"]+)"/)?.[1];
          const to = block.match(/to\s*=\s*"([^"]+)"/)?.[1];
          return from && to && /status\s*=\s*301/.test(block) ? [{ from, to }] : [];
        },
      );
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");
        const pathname = url.pathname;
        // Preview uses the freshly fetched GitHub build payload, avoiding API rate limits during visual QA.
        const githubDocument =
          pathname === "/.netlify/functions/github-release"
            ? "/github/latest-release.json"
            : pathname === "/.netlify/functions/github-repo"
              ? "/github/repository.json"
              : null;
        if (githubDocument) {
          request.url = githubDocument;
          next();
          return;
        }
        const downloadPlatform = pathname.match(/^\/download\/(windows|macos|linux)\/latest$/)?.[1];
        if (downloadPlatform === "windows" || downloadPlatform === "macos" || downloadPlatform === "linux") {
          const endpoint = new Request(new URL(request.url ?? "/", `http://${request.headers.host}`));
          const result = await redirectToLatestPlatformRelease(endpoint, downloadPlatform);
          response.writeHead(result.status, Object.fromEntries(result.headers));
          response.end();
          return;
        }
        for (const { from, to } of aliases) {
          const prefix = from.endsWith("*") ? from.slice(0, -1) : null;
          if (pathname === from || (prefix && pathname.startsWith(prefix))) {
            const destination = new URL(to.replace(":splat", prefix ? pathname.slice(prefix.length) : ""), url);
            destination.search = url.search;
            response.writeHead(301, {
              Location: destination.pathname + destination.search + destination.hash,
            });
            response.end();
            return;
          }
        }
        const route = pathname.replace(/\/$/, "") || "/";
        const document = rewrites.get(route);
        if (document) {
          request.url = document + url.search;
          next();
          return;
        }
        if (route === "/" || /\.[a-z0-9]+$/i.test(route)) {
          next();
          return;
        }
        try {
          response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          response.end(await fs.readFile(path.join(dist, "404.html")));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}
