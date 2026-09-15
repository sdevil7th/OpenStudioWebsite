import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const repoRoot = path.resolve(import.meta.dirname, "..");
const SITE_URL = "https://openstudio.org.in";
const escapeHtml = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const safeJson = (value) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");

export function routeDependencies(manifest, sources) {
  const files = new Set();
  const styles = new Set();
  const visited = new Set();
  const visit = (source) => {
    if (visited.has(source)) return;
    visited.add(source);
    const record = manifest[source];
    if (!record) throw new Error(`Missing built route module: ${source}`);
    if (record.file?.endsWith(".js")) files.add(`/${record.file}`);
    for (const css of record.css ?? []) styles.add(`/${css}`);
    // Dynamic imports (illustrations, other articles) deliberately remain deferred.
    for (const dependency of record.imports ?? []) visit(dependency);
  };
  for (const source of sources) visit(source);
  return { files: [...files], styles: [...styles] };
}

export function buildRouteHtml(template, route, { manifest, imageIndex = {} }) {
  const { seo } = route;
  const canonical = new URL(route.path, SITE_URL).href;
  const image = seo.image ?? "/assets/openstudio/branding/og-image.png?v=3";
  const metadata = imageIndex[new URL(image, SITE_URL).pathname];
  const width = metadata?.[0] ?? 1200;
  const height = metadata?.[1] ? Math.round(width / metadata[1]) : 630;
  const imageUrl = new URL(image, SITE_URL).href;
  const robots = seo.robots ?? "index, follow";
  const tags = [];
  const meta = (attribute, name, content) => {
    if (content != null) tags.push(`<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(content)}" />`);
  };
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(
      /<meta\b[^>]*(?:name|property)=["'](?:description|keywords|robots|og:[^"']+|twitter:[^"']+|article:[^"']+)["'][^>]*>/gi,
      "",
    )
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");
  tags.push(`<title>${escapeHtml(seo.title)}</title>`);
  const indexable = !robots.toLowerCase().includes("noindex");
  if (indexable) tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  meta("name", "description", seo.description);
  meta("name", "robots", robots);
  for (const [name, content] of Object.entries({
    type: seo.ogType ?? "website",
    site_name: "OpenStudio",
    title: seo.title,
    description: seo.description,
    url: canonical,
    image: imageUrl,
    "image:alt": seo.imageAlt ?? "OpenStudio",
    "image:width": width,
    "image:height": height,
    locale: "en_US",
  }))
    meta("property", `og:${name}`, content);
  for (const [name, content] of Object.entries({
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    image: imageUrl,
    "image:alt": seo.imageAlt ?? "OpenStudio",
  }))
    meta("name", `twitter:${name}`, content);
  if (seo.ogType === "article") {
    meta("property", "article:published_time", seo.publishedTime);
    meta("property", "article:modified_time", seo.modifiedTime);
    meta("property", "article:author", seo.authorProfileUrl);
    meta("property", "article:section", seo.articleSection);
  }
  if (indexable) {
    const schema = seo.jsonLd ?? {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.title,
      description: seo.description,
      url: canonical,
      image: imageUrl,
      isPartOf: { "@type": "WebSite", name: "OpenStudio", url: SITE_URL },
    };
    tags.push(`<script type="application/ld+json" data-static-route>${safeJson(schema)}</script>`);
  }
  const dependencies = routeDependencies(manifest, [
    route.moduleSource,
    ...(route.contentModule ? [route.contentModule] : []),
  ]);
  for (const href of dependencies.files) {
    if (!html.includes(`"${href}"`)) tags.push(`<link rel="modulepreload" crossorigin href="${href}" />`);
  }
  for (const href of dependencies.styles) {
    if (!html.includes(`"${href}"`)) tags.push(`<link rel="stylesheet" crossorigin href="${href}" />`);
  }
  const content = route.html.replace(/(data-sp-reveal="[^"]+")/g, '$1 data-sp-in="true"');
  html = html.replace(/<div id="root"><\/div>/, `<div id="root"><div data-static-route-content>${content}</div></div>`);
  if (/^\/(privacy|security|terms)$/.test(route.path)) {
    html = html
      .replace('<html lang="en">', '<html lang="en" data-openstudio-immediate-content>')
      .replace(/<!-- openstudio-loader:start -->[\s\S]*?<!-- openstudio-loader:end -->/, "");
  }
  return html.replace("</head>", `${tags.join("\n")}\n</head>`);
}

export function buildSitemapXml(routes) {
  const entries = routes
    .filter(({ path: routePath, seo }) => routePath !== "/404" && !seo?.robots?.toLowerCase().includes("noindex"))
    .map((route) => {
      // Omit unknown dates. Build time and a fixed redesign date do not describe content updates.
      const updated = route.updated ?? route.seo?.modifiedTime ?? route.seo?.publishedTime;
      const lastmod = updated ? `<lastmod>${escapeHtml(updated.slice(0, 10))}</lastmod>` : "";
      return `  <url><loc>${escapeHtml(new URL(route.path, SITE_URL).href)}</loc>${lastmod}</url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

export async function generateStaticSeo({ root = repoRoot } = {}) {
  const dist = path.join(root, "dist");
  const [template, manifest] = await Promise.all([
    fs.readFile(path.join(dist, "index.html"), "utf8"),
    fs.readFile(path.join(dist, ".vite/manifest.json"), "utf8").then(JSON.parse),
  ]);
  const vite = await createServer({
    root,
    configFile: false,
    appType: "custom",
    logLevel: "error",
    esbuild: { jsx: "automatic" },
    resolve: { alias: { "@": path.join(root, "src") } },
    server: { middlewareMode: true },
  });
  const originalError = console.error;
  // These components intentionally run layout effects only in the browser; this output is a static fallback, not hydrated HTML.
  console.error = (...args) => {
    if (!String(args[0]).includes("useLayoutEffect does nothing on the server")) originalError(...args);
  };
  try {
    const { prerenderRoutes, renderRoute } = await vite.ssrLoadModule("/src/prerender.tsx");
    const { generatedImageSeoIndex } = await vite.ssrLoadModule("/src/lib/generatedImageSeoIndex.ts");
    const routes = [];
    for (const spec of prerenderRoutes) {
      if (!/^\/[a-z0-9/-]*$/.test(spec.path)) throw new Error(`Unsafe output route: ${spec.path}`);
      const route = { ...spec, ...(await renderRoute(spec.path)) };
      const target =
        spec.path === "/404" ? path.join(dist, "404.html") : path.join(dist, spec.path.slice(1), "index.html");
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, buildRouteHtml(template, route, { manifest, imageIndex: generatedImageSeoIndex }));
      routes.push(route);
    }
    const sitemap = buildSitemapXml(routes);
    await fs.writeFile(path.join(dist, "sitemap.xml"), sitemap);
    await fs.writeFile(path.join(root, "public/sitemap.xml"), sitemap);
    // Exact routes take priority over Netlify's fallback; unknown slugs still reach the genuine 404.
    const redirects = routes
      .filter(({ path: routePath }) => routePath !== "/" && routePath !== "/404")
      .map(({ path: routePath }) => `${routePath} ${routePath}/index.html 200!`);
    await fs.writeFile(path.join(dist, "_redirects"), `${redirects.join("\n")}\n`);
    return {
      routeCount: routes.length,
      blogPostCount: routes.filter(({ path: routePath }) => routePath.startsWith("/blog/")).length,
    };
  } finally {
    console.error = originalError;
    await vite.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log("[prerender]", await generateStaticSeo());
}
