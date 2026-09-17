import fs from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { downloadCatalog } from "./generatedDownloadCatalog";
import { parseAiRuntimeManifest } from "./ai-runtime-manifest";
import { type DownloadCatalog, fixedDownloadRoutes, githubAliases, isDynamicDownload, normalizeDownloadPath, resolveDownload } from "./download-routing";

function serveDownload(request: IncomingMessage, response: ServerResponse, catalog: DownloadCatalog): boolean {
  const url = new URL(request.url ?? "/", "http://localhost");
  const pathname = normalizeDownloadPath(url.pathname);
  if (!isDynamicDownload(pathname) && !fixedDownloadRoutes(catalog).has(pathname) && !githubAliases[pathname]) return false;
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  const result = resolveDownload(new Request(url, { method: request.method, headers }), catalog);
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end();
  return true;
}

export function downloadDevBridge(): Plugin {
  return {
    name: "openstudio-download-dev-bridge",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (serveDownload(request, response, downloadCatalog)) return;
        next();
      });
    },
  };
}

/** Make local production previews exercise the same documents and aliases as Netlify. */
export function previewRoutes(): Plugin {
  return {
    name: "openstudio-preview-routes",
    async configurePreviewServer(server) {
      const dist = path.resolve(server.config.root, server.config.build.outDir);
      // Preview must stay tied to this build even after predev regenerates source data.
      const destinations: unknown = JSON.parse(await fs.readFile(path.join(dist, ".vite/download-routing.json"), "utf8"));
      function destination(key: string): string {
        const value: unknown = destinations && typeof destinations === "object" && key in destinations
          ? Reflect.get(destinations, key) : undefined;
        if (typeof value !== "string" || !/^https?:$/.test(new URL(value).protocol)) {
          throw new Error(`Invalid built download destination: ${key}. Run npm run build.`);
        }
        return value;
      }
      const catalog: DownloadCatalog = {
        app: { windows: destination("windows"), macos: destination("macos"), linux: destination("linux") },
        fallback: destination("fallback"),
        runtime: parseAiRuntimeManifest(JSON.parse(await fs.readFile(path.join(dist, "releases/ai-runtime/stable/latest.json"), "utf8"))),
      };
      const rewrites = new Map(
        (await fs.readFile(path.join(dist, "_redirects"), "utf8"))
          .trim()
          .split("\n")
          .map((line) => {
            const [from, to, status] = line.trim().split(/\s+/);
            return [from, { to, status: parseInt(status, 10) }];
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
        const downloadRule = rewrites.get(normalizeDownloadPath(pathname));
        if (downloadRule?.status === 302) {
          response.writeHead(302, { Location: downloadRule.to });
          response.end();
          return;
        }
        if (serveDownload(request, response, catalog)) return;
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
          if (document.status === 302) {
            response.writeHead(302, { Location: document.to });
            response.end();
            return;
          }
          request.url = document.to + url.search;
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
