import fs from "node:fs/promises";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { parseAiRuntimeManifest, type AiRuntimePlatform } from "./shared/ai-runtime-manifest";
import { GITHUB_RELEASES_URL, fetchGithubRepoSnapshot, resolveLatestReleaseAssetUrl } from "./shared/github-api";

const AI_RUNTIME_MANIFEST_PATH = path.resolve(__dirname, "public", "releases", "ai-runtime", "latest.json");
const AI_RUNTIME_DEPLOY_INPUT_PATH = path.resolve(__dirname, "release-input", "releases", "ai-runtime", "latest.json");

const resolveDevAiRuntimeRedirectTarget = async (platform: AiRuntimePlatform) => {
  for (const manifestPath of [AI_RUNTIME_MANIFEST_PATH, AI_RUNTIME_DEPLOY_INPUT_PATH]) {
    try {
      const manifest = parseAiRuntimeManifest(
        JSON.parse(await fs.readFile(manifestPath, "utf8")),
        path.relative(__dirname, manifestPath),
      );
      return manifest.platforms[platform].url;
    } catch {
      // Try the next available source of truth before falling back.
    }
  }

  return null;
};

const githubDevBridge = () => ({
  name: "openstudio-github-dev-bridge",
  configureServer(server: {
    middlewares: {
      use: (
        handler: (
          req: { url?: string },
          res: {
            statusCode: number;
            setHeader: (name: string, value: string) => void;
            end: (body?: string) => void;
          },
          next: () => void,
        ) => void,
      ) => void;
    };
  }) {
    server.middlewares.use(async (req, res, next) => {
      const requestUrl = req.url ?? "";
      const url = new URL(requestUrl, "http://localhost");
      const pathname = url.pathname;

      if (pathname === "/.netlify/functions/github-repo") {
        try {
          const snapshot = await fetchGithubRepoSnapshot(process.env.GITHUB_TOKEN);

          res.statusCode = 200;
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(snapshot));
          return;
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown GitHub proxy error",
            }),
          );
          return;
        }
      }

      if (
        pathname === "/download/windows/latest" ||
        pathname === "/download/macos/latest" ||
        pathname === "/download/ai-runtime/windows/latest" ||
        pathname === "/download/ai-runtime/macos/latest" ||
        pathname === "/.netlify/functions/download-latest-windows" ||
        pathname === "/.netlify/functions/download-latest-macos" ||
        pathname === "/.netlify/functions/download-latest-ai-runtime-windows" ||
        pathname === "/.netlify/functions/download-latest-ai-runtime-macos" ||
        pathname === "/.netlify/functions/download-latest/windows" ||
        pathname === "/.netlify/functions/download-latest/macos" ||
        pathname === "/.netlify/functions/download-latest"
      ) {
        const pathSegments = pathname.split("/").filter(Boolean);
        const trailingSegment = pathSegments[pathSegments.length - 1];
        const isAiRuntimeRequest = pathname.includes("/ai-runtime/");
        const platform =
          pathname === "/.netlify/functions/download-latest-windows" ||
          pathname === "/.netlify/functions/download-latest-ai-runtime-windows" ||
          pathname.includes("/windows/") ||
          trailingSegment === "windows" ||
          url.searchParams.get("platform") === "windows"
            ? "windows"
            : pathname === "/.netlify/functions/download-latest-macos" ||
                pathname === "/.netlify/functions/download-latest-ai-runtime-macos" ||
                pathname.includes("/macos/") ||
                trailingSegment === "macos" ||
                url.searchParams.get("platform") === "macos"
              ? "macos"
              : null;

        if (!platform) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("Missing or invalid platform in request path.");
          return;
        }

        try {
          if (isAiRuntimeRequest) {
            const redirectTarget = (await resolveDevAiRuntimeRedirectTarget(platform)) ?? GITHUB_RELEASES_URL;

            res.statusCode = 302;
            res.setHeader("Location", redirectTarget);
            res.end();
            return;
          }

          const snapshot = await fetchGithubRepoSnapshot(process.env.GITHUB_TOKEN);
          const assetUrl = resolveLatestReleaseAssetUrl(snapshot.latestRelease, platform);
          const redirectTarget = assetUrl ?? snapshot.latestRelease?.htmlUrl ?? "/releases";

          res.statusCode = 302;
          res.setHeader("Location", redirectTarget);
          res.end();
          return;
        } catch {
          res.statusCode = 302;
          res.setHeader("Location", GITHUB_RELEASES_URL);
          res.end();
          return;
        }
      }

      next();
    });
  },
});

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), githubDevBridge()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "animation-vendor": ["framer-motion"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-aspect-ratio",
          ],
        },
      },
    },
  },
});
