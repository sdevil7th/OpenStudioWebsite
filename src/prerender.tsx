import { type ComponentType, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SiteShell from "@/components/layout/SiteShell";
import PrivacyChoices from "@/components/PrivacyChoices";
import { CONSENT_KEY, CONSENT_MAX_AGE_MS, parseConsentRecord } from "./lib/consentRecord";
import { DOCS, loadDocContent } from "@/features/docs";
import { blogPosts } from "./data/blogs";
import { loadBlogPostContent } from "./data/blogContent";
import { StaticRenderContext, type StaticRenderState } from "./lib/staticRender";

const PAGES = {
  "/": "Home",
  "/features": "Features",
  "/nam-rack": "NamRack",
  "/ai": "Ai",
  "/download": "Download",
  "/docs": "Docs",
  "/compare": "Compare",
  "/community": "Community",
  "/blog": "Blog",
  "/releases": "Releases",
  "/roadmap": "Roadmap",
} as const;
// The artwork tool is development-only and must not enter the production graph.
const loaders = import.meta.glob<{ default: ComponentType }>([
  "./pages/*Page.tsx",
  "!./pages/OgCardPage.tsx",
]);

export const prerenderRoutes = [
  ...Object.entries(PAGES).map(([path, name]) => ({ path, moduleSource: `src/pages/${name}Page.tsx` })),
  ...["privacy", "security", "terms"].map((kind) => ({
    path: `/${kind}`,
    moduleSource: "src/pages/LegalPage.tsx",
  })),
  ...DOCS.map(({ slug }) => ({
    path: `/docs/${slug}`,
    moduleSource: "src/pages/DocPage.tsx",
    contentModule: `src/features/docs/content/${slug}.ts`,
  })),
  ...blogPosts.map(({ slug, filename }) => ({
    path: `/blog/${slug}`,
    moduleSource: "src/pages/BlogPostPage.tsx",
    contentModule: `src/data/generatedBlogContent/${filename.replace(/\.md$/, ".ts")}`,
  })),
  { path: "/404", moduleSource: "src/pages/NotFound.tsx" },
];

/** Render the same components and content as the client, without a second copy of marketing/legal prose. */
export async function renderRoute(pathname: string) {
  const state: StaticRenderState = {};
  let element: ReactElement;
  let pattern = pathname;
  if (pathname.startsWith("/docs/")) {
    const slug = pathname.slice("/docs/".length);
    state.docContent = await loadDocContent(slug);
    const { default: Page } = await import("@/pages/DocPage");
    element = <Page />;
    pattern = "/docs/:slug";
  } else if (pathname.startsWith("/blog/")) {
    const post = blogPosts.find(({ slug }) => pathname === `/blog/${slug}`);
    if (!post) throw new Error(`Missing blog content: ${pathname}`);
    await loadBlogPostContent(post);
    const { default: Page } = await import("@/pages/BlogPostPage");
    element = <Page />;
    pattern = "/blog/:slug";
  } else if (pathname === "/privacy" || pathname === "/terms" || pathname === "/security") {
    const { default: Page } = await import("@/pages/LegalPage");
    element = <Page kind={pathname === "/privacy" ? "privacy" : pathname === "/terms" ? "terms" : "security"} />;
  } else if (pathname === "/404") {
    const { default: Page } = await import("./pages/NotFound");
    element = <Page />;
  } else {
    const name = PAGES[pathname as keyof typeof PAGES];
    const loader = loaders[`./pages/${name}Page.tsx`];
    if (!loader) throw new Error(`Missing page: ${pathname}`);
    const { default: Page } = await loader();
    element = <Page />;
  }
  const tree = () => (
    <StaticRenderContext.Provider value={state}>
      <MemoryRouter initialEntries={[pathname]}>
        <Routes>
          <Route element={<SiteShell />}>
            <Route path={pattern} element={element} />
          </Route>
        </Routes>
      </MemoryRouter>
    </StaticRenderContext.Provider>
  );
  // First pass collects the page-owned footer CTA; second pass renders the complete shared footer.
  renderToStaticMarkup(tree());
  const html = renderToStaticMarkup(tree());
  if (!state.seo) throw new Error(`Missing SEO: ${pathname}`);
  const privacyHtml = renderToStaticMarkup(<MemoryRouter><PrivacyChoices /></MemoryRouter>);
  // The parser is shared with runtime consent. This only controls visibility;
  // it cannot initialize analytics or grant permission.
  const privacyBootstrap = `(() => {
    let chosen = false;
    try { chosen = Boolean((${parseConsentRecord.toString()})(localStorage.getItem(${JSON.stringify(CONSENT_KEY)}), Date.now(), ${CONSENT_MAX_AGE_MS})); } catch {}
    const host = document.getElementById("openstudio-privacy");
    if (host) host.hidden = chosen;
    window.addEventListener("openstudio:static-route-restored", () => {
      if (host?.querySelector("[data-privacy-prerender]")) host.hidden = true;
    }, { once: true });
  })();`;
  return { html, privacyHtml, privacyBootstrap, seo: state.seo, updated: state.docContent?.updated };
}
