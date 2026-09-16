# Website source structure

The visual comparisons in this document isolate the directory reorganization.
Their baseline already contained the earlier loader and AI card regressions;
they did not establish equivalence to suprabho's original design. See the
[visual regression correction](visual-regression-correction.md) for that distinction
and the subsequent fixes.

## Purpose and migration plan

The redesign is the sole website. Its former version prefix described the
migration, not a permanent application boundary. Source code is organized by
responsibility; public URLs and compatibility redirects are independent of those
directories.

The cleanup follows this sequence:

1. Build and preserve the current production artifact as a comparison baseline.
2. Move pages, feature modules, hooks and shared helpers into the locations below.
   Extract the existing header and footer into named layout components without
   changing their markup, styles or behavior.
3. Update client imports, prerender discovery and manifest keys, vendor-sync
   destinations, source-aware tests and maintenance documentation together.
4. Preserve lazy imports, authored CSS rules, canonical URLs, legacy redirects,
   release endpoints, guide content and third-party version identifiers.
5. Run the production build, lint and complete test suite. Compare prerendered
   content and responsive browser rendering with the saved artifact, verify
   performance budgets, and audit remaining version references and document links.

## Directory map

| Location | Responsibility |
| --- | --- |
| `src/pages/` | Route components, including not-found and development-only artwork pages |
| `src/components/layout/` | `SiteShell`, `SiteHeader`, `SiteFooter` and the footer-lead context |
| `src/components/ui/` | Shared website presentation primitives |
| `src/components/` | Shared image, SEO, privacy, error, loader and sponsor components |
| `src/features/docs/` | Guide inventory, types, block renderer and lazy `content/<slug>.ts` modules |
| `src/features/daw-preview/` | Optional interactive illustrations, scheduling, stages and pinned `vendor/` files |
| `src/hooks/` | Shared React hooks, including release information, platform detection and section reveals |
| `src/constants/routes.ts` | Canonical `SITE_PATHS`, `docPath` and `blogPostPath` helpers |
| `src/data/siteContent.ts` | Shared repository references, contact details and media paths |
| `src/data/` | Legal policy, AI setup, blogs and generated GitHub data |
| `src/lib/` | Formatting, analytics, loading, prerender and SEO helpers |
| `src/styles/` | `site.css` design system and specialized DAW styling |
| `shared/github-snapshot.ts` | Repository snapshot contracts and runtime JSON validation, shared by build/server/browser |
| `shared/` and `netlify/functions/` | Release/runtime contracts, GitHub data fetching and public endpoint handlers; explicitly included in the Node TypeScript project |

Use `@/` imports across these boundaries and relative imports within a feature.
Avoid a top-level barrel that eagerly imports pages, guides or illustration
stages. Keep guide and article contents separate from their small inventories.

## Coordinated maintenance

- Routes: update `src/App.tsx` and `src/prerender.tsx` together. The latter also
  names source modules used to find the correct production preload dependencies.
  Keep `OgCardPage.tsx` excluded from the prerender glob; it is a development tool.
- Guides: follow [guide authoring](../src/features/docs/README.md). A directory
  move does not change a guide's verified app revision or content review date.
- DAW previews: follow [the vendor guide](../src/features/daw-preview/vendor/README.md).
  Update the destination in `scripts/vendor-openstudio-ui.mjs` if the vendor
  directory moves. Preserve upstream source headers and reproducible patches.
- Styles: `src/index.css` imports `src/styles/site.css`. The `sp-` CSS prefix
  identifies the Studio Paper design; it is not a website version.
- Tests: browser failure-recovery tests deliberately intercept specific source
  modules or production chunks. Keep those paths consistent with renamed modules.
- Images: `ResponsiveImage`, `Frame` and `LiveStage` accept a layout-specific
  `sizes` value. Keep it aligned with the owning grid, breakpoints and inner
  padding; the lazy poster needs the same delivery attention as a direct image.

## Version references that remain intentional

- `/v2` and `/v2/*` are legacy redirects in Netlify and the client router, with
  regression coverage. They preserve shared links and do not host a second site.
- Historical reports retain the original branch name and deployment-preview URLs.
- Clarity's `consentv2`, published runtime plan IDs, upstream font paths,
  versioned artwork filenames and the vendored NAM `tone-source-v2` CSS selectors
  belong to independent APIs/assets. Do not rename them as part of website source
  cleanup; vendored selectors must continue matching upstream markup.

## Verification

Completed **16 September 2026**. The comparison baseline is a production build
saved immediately before this source cleanup. The original redesign comparison
against PR 18's `/v2` preview remains in the [branding audit](branding-and-download-audit.md).

- Removed the obsolete source directory and version-prefixed page/layout names.
  Updated imports, prerender globs and manifest paths, stylesheet imports,
  vendor-sync destinations, failure-recovery interception paths and documentation.
  Renamed the focused tests to `daw-preview.test.mjs` and `section-reveal.test.mjs`.
- Production build, strict TypeScript checks and ESLint passed. The full suite
  passed **109 tests**, including canonical routes, legacy redirects, downloads,
  privacy controls, lazy-load failures and SEO checks.
- All **35 public pages plus the 404 page** have byte-identical prerendered body
  HTML. Compiled CSS, sitemap and generated hosting rewrites are unchanged.
  All **333 non-JavaScript production assets** match the baseline byte for byte.
- Compared **35 routes at 360, 390, 768, 900, 901, 1024, 1440 and 1920 px** in
  Chromium: **280 route/width pairs**, with viewport screenshots and full-document
  geometry checks. There were no geometry mismatches, horizontal overflow or
  browser exceptions. Captures use reduced motion; affected artwork was also
  checked after its lazy modules, fonts and images finished loading.
- **268 of 280 screenshot pairs were pixel-identical.** Remaining differences
  were inside artwork, including meters and rasterized images. A same-build
  control reproduced the exact Home/NAM differing-pixel counts and larger blog
  image variation. Together with unchanged source logic, CSS, assets and layout,
  this supports no visual regression from the reorganization; the captures are
  not a claim of pixel-identical animation rendering across runs or browsers.
- All **10 mobile/desktop performance checks** passed with the existing budgets.
  Lazy page, guide, article, illustration and animation boundaries remain covered.
- Compared **106 moved TypeScript modules** after normalizing imports, renamed
  identifiers and comments: no other code differences. Guide prose, review dates
  and app references are unchanged. All **461 local imports across 153 modules**
  resolve with exact filename casing, checked to prevent case-sensitive build failures.
- Replayed the pinned vendor sync in an isolated directory. All **35 generated
  vendor files** match after normalizing Windows line endings, and the sync writes
  to `src/features/daw-preview/vendor/`. Existing vendor source files were moved
  without modifying their contents.
- Validated **32 local documentation links across 13 maintenance documents**.
  No old source-directory, stylesheet, component or test names remain in active
  code or maintenance references. Intentional URL/API/artwork/history references
  are listed above. The app repository had no references requiring this rename.

Local evidence is under ignored `output/review/structure-*` and
`output/playwright/structure-comparison/`. Earlier migration and pre-push results
remain dated in their respective reports. These are local checks; no commit,
push or deployment was performed for this cleanup.
