# OpenStudio website maintenance

This repository publishes the Studio Paper website and the release surfaces used
by installed OpenStudio apps. Start with [README.md](README.md) and
[RELEASE_SYNC.md](RELEASE_SYNC.md). The desktop app is maintained separately in
`../OpenStudio`; inspect its source when changing product documentation.

## Structure and public contracts

- The Studio Paper site is the sole website implementation. Put route components
  in `src/pages/`, shared layout in `src/components/layout/`, reusable hooks in
  `src/hooks/`, and cohesive features in `src/features/`. Follow
  [the source structure guide](docs/source-structure.md); do not introduce
  version-prefixed source folders or component names.
- Canonical paths and route helpers live in `src/constants/routes.ts`. Pages use
  `/docs`, `/blog`, `/ai` and other canonical URLs; `/v2/*` and old routes remain
  compatibility redirects, independently of the source directory structure.
- Keep cross-feature imports explicit with `@/` and retain relative imports
  inside a feature. Avoid eager barrels that collapse lazy-loading boundaries.
- Keep client routes in `src/App.tsx`, prerender routes in `src/prerender.tsx`,
  and hosting aliases in `netlify.toml` consistent. Unknown documents must retain
  HTTP 404 and `noindex`, including unknown documentation/blog slugs.
- Preserve the JSON, XML and download endpoints listed in the README. Installed
  apps consume them independently of the website UI. A website-only deploy must
  retain published appcasts and app/AI-runtime manifests.
  Clean builds retrieve missing release inputs from GitHub and fail if the
  complete validated set cannot be obtained; do not weaken that requirement.
- GitHub is the installer origin. `scripts/sync-github-data.mjs` generates the
  ignored GitHub snapshots before dev/build. Never hand-maintain release tags,
  versions, sizes or URLs in UI source or copy test fixtures into production.
- `useReleaseInfo.ts` keeps the displayed release and exact installer URLs
  together. Manifest checksums are used only for the same version and artifact.
  Keep GitHub credentials server-side; see the README for the two fetch paths.

## React, TypeScript and styling

- Keep strict TypeScript checks passing. Validate untrusted JSON at network
  boundaries; avoid `any`, unchecked assertions and duplicated contract types.
- Use Tailwind for ordinary static layout, spacing, typography and responsive
  states. Shared design tokens and specialized artwork/keyframes belong in their
  existing stylesheets. Use inline styles for runtime geometry when needed.
- Do not add authored `!important` rules. The retained upstream NAM artwork
  exceptions and reproducible patches are documented in
  [the vendor guide](src/features/daw-preview/vendor/README.md).
- Preserve lazy page, guide, article, animation and illustration boundaries.
  Text/legal routes must not eagerly load NAM/DAW/GSAP code. Optional artwork
  failures leave a usable poster; route/article failures provide recovery.
- Use `ResponsiveImage` and generated `srcset` variants with intrinsic dimensions
  and meaningful alt text. The image GraphQL service has been retired.
- Keep decorative controls out of keyboard navigation and preserve reduced-motion
  alternatives, menu focus behavior and readable content before JavaScript.

## Content and branding

- Follow [the guide authoring notes](src/features/docs/README.md). Check menu labels,
  shortcuts, profiles and model behavior against the desktop implementation,
  record the verified app commit, and distinguish development from shipped features.
- Edit shared legal text in `src/data/legal.ts`; do not fork a second privacy
  policy in a page. Privacy, Terms and Security must remain readable without
  application JavaScript. Preserve analytics acceptance, rejection and revocation.
- The approved master is `assets/branding/openstudio-logo-source.png`. Generate
  derivatives from it with `npm run generate-branding`. Follow the
  [branding inventory](docs/branding-and-download-audit.md) for social/Store artwork,
  cache versions and coordinated app updates. Keep marketing exports in `output/`.
- Blog Markdown is authored in `blogs/`; follow [its guide](blogs/README.md).
  Generated blog/GitHub/image files are outputs, not alternate sources of truth.
- Keep prerendered and client SEO consistent: one canonical URL, matching social
  metadata and page-owned JSON-LD. Use genuine content update dates in the sitemap
  or omit `lastmod`; never substitute build time. Keep internal artwork tools out
  of the public route inventory. See [the SEO audit](docs/seo-audit.md).

## Verification

For implementation changes, run `npm run build`, `npm run lint` and `npm test`.
The build includes strict TypeScript and prerendering. Install Chromium with
`npx playwright install chromium` before browser tests. Tests depend on generated
build/GitHub data, so run the build first in a clean checkout.

For loading changes, run `npm run verify:perf` after building; preserve existing
budgets unless measurements justify a change. For layout changes, compare affected
routes against the approved design at phone, tablet and desktop widths, including
both sides of the 900 px navigation breakpoint. The browser suite uses Chromium;
it is not a Safari/Firefox or automatic screenshot-baseline suite.

For documentation-only changes, validate referenced paths, commands and relevant
source behavior. Keep historical test results dated instead of presenting them as
the latest run. Store local evidence under ignored `output/review/` or
`output/playwright/`, and stop task-owned browser/dev-server processes at handoff.
