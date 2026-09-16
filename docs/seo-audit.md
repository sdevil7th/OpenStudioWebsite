# Redesign SEO audit

Audited **16 September 2026**, against the local redesign working tree. This is
implementation and production-build evidence; the changes are not deployed.

## Coverage

All **35 indexable pages** are prerendered from their real React components and
content. Each returns a page-specific HTML document with one visible main H1,
readable content without JavaScript, a unique title and description, one absolute
production canonical, social tags and structured data. Client rendering preserves
the same metadata. Navigation clears stale article tags and replaces the schema.

| Group | Count | Canonical paths |
| --- | ---: | --- |
| Main pages | 11 | `/`, `/features`, `/nam-rack`, `/ai`, `/download`, `/docs`, `/compare`, `/community`, `/blog`, `/releases`, `/roadmap` |
| Legal | 3 | `/privacy`, `/security`, `/terms` |
| Guides | 15 | All `/docs/<slug>` entries in `src/features/docs/index.ts` |
| Articles | 6 | All `/blog/<slug>` entries generated from `blogs/` |

The generated `sitemap.xml` contains exactly those canonical pages; `robots.txt`
permits crawling and links the production sitemap. Legacy `/v2`, `/blogs`,
`/home`, `/stem-separation`, `/github` and `/contact` paths retain permanent
redirects. Unknown routes, guide slugs and article slugs return HTTP 404 and
`noindex`, without a canonical or page schema. The social-card generator route
`/og-card` is now a development-only tool and returns 404 in production.

## Gaps corrected in this follow-up

- Removed the arbitrary fallback sitemap date. Known guide/article update dates
  remain; undated pages omit `lastmod`. Google recommends dates that reflect
  significant content changes. [Google's sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- Restored homepage Organization/WebSite information and added connected WebPage
  and SoftwareApplication entities. Removed the duplicate legacy schema from
  the base HTML template so page metadata has one owner.
- Connected the existing Blog index schema, retained BlogPosting author,
  publisher, image and date fields, and added guide/article breadcrumbs and
  TechArticle metadata for guides.
- Made static and runtime social-image URLs agree, including image content-hash
  versions. Both now expose the same actual image dimensions. The base template
  also references the regenerated branded social card.
- Corrected the AI search description to mention MiniMax Music 3 and Stable Audio
  3 Medium as setup/availability topics, without claiming all development models
  are in the currently published installer.
- Prevented runtime 404 navigation from adding a canonical back to a nonindexable
  page. Canonical/schema suppression and sitemap exclusion consistently honor
  `noindex`.
- Removed the public social-card utility route and its production chunk; the
  local `npm run generate-og` development workflow remains available.

## Verification

- Production build and strict TypeScript checks passed.
- ESLint passed with zero warnings; **all 106 website tests passed**.
- All ten existing mobile/desktop performance gates passed with unchanged budgets.
- The new browser regression visits all 35 sitemap pages with JavaScript
  disabled and enabled, verifies unique head tags and structured-data semantics,
  checks the actual dimensions of social assets, and compares static/runtime
  metadata exactly. It also tests real SPA link navigation, article-to-guide
  cleanup, missing pages, the internal utility URL and 404-to-home recovery.
- Existing checks cover responsive routes, crawlable internal links and anchors,
  image/srcset targets, old-route redirects and legal-page failure recovery.
- HTML body hashes for all 35 pages are identical before/after this SEO follow-up.
  Styles were not edited; no user-visible page content or layout changed.

Local evidence: `output/review/seo-build.log`, `seo-tests.log`, `seo-lint.log`,
`seo-body-comparison.json`, `seo-performance.json`, and `seo-deployed-before.json`. The repeatable browser
test is `test/seo-pages-browser.test.mjs` and runs in the existing CI suite.

Prerendering and matching canonicals follow
[Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
Structured data describes real content; it does not promise a rich result.
Software-app review stars require genuine qualifying review/rating data, which
the site does not currently have. None was fabricated.
[Google's software-app requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app).

## Deployment and search-engine follow-up

Direct HTTP checks during this audit found the deployed production sitemap still
lists **17 URLs**, and `/docs/keyboard-shortcuts` still returns 404. The supplied
PR preview's `/v2/docs/keyboard-shortcuts` returns 200 with the old generic HTML
head and Netlify's `X-Robots-Tag: noindex`. This confirms that the updated local
35-page build is not the currently deployed site. Evidence is dated above; it
does not describe a future deployment.

After publishing:

1. Check all 35 canonical URLs, sitemap/robots responses, old-route redirects and
   representative unknown URLs against the actual Netlify deployment. Verify
   production does not inherit the preview's `noindex` header.
2. Confirm apex/alternate-host and trailing-slash behavior on the CDN and inspect
   the resulting canonical URLs. Check social previews against the public image
   URLs after cache refresh.
3. Submit the canonical sitemap in Google Search Console and inspect representative
   homepage, guide, blog and legal URLs. Review indexing/canonical reports and
   run the Rich Results Test on the deployed applicable schemas.
4. Monitor Search Console page experience and field Core Web Vitals after traffic
   accumulates. Local lab measurements are not field data or a ranking guarantee.

Search Console ownership/settings, actual Google index coverage, rankings and
external rich-result validation were not accessed or claimed verified. No changes
were committed, pushed or deployed by this audit.
