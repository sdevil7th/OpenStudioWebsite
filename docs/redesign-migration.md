# Redesign migration

Baseline: `studio-paper-v2` at `97a3f2e`. The Studio Paper design becomes the sole website. Existing public links, legal policy content, release downloads, appcasts and runtime metadata remain supported.

The original visual checks missed a subsequent loader substitution and unstyled
AI setup cards. The [16 September correction](visual-regression-correction.md)
records their repair, all identified visible changes, and the limitations of the
earlier checks. Loading animations must be verified separately from settled pages.

The later [illustration-loading correction](illustration-loading.md) replaces
screenshot placeholders with the actual scene's rest frame. It also supersedes
the historical next-release model wording below: the rebranding release includes
MiniMax Music 3 and Stable Audio 3 Medium.

## Implementation sequence

1. Capture deterministic desktop/mobile screenshots of `/v2` pages before editing. Inventory source imports, build-time dependencies and public asset references.
2. Restore privacy choices; contain optional illustration and route failures; repair hash navigation and keyboard accessibility. Correct documentation using the app implementation, with explicit verification/release metadata.
3. Isolate lazy illustration dependencies, serve responsive images, and convert ordinary static layout to Tailwind while preserving computed dimensions and artwork CSS.
4. Promote canonical routes, prerender redesigned content, preserve old URLs through redirects, and implement real 404s. Remove old code, assets and packages only after their surviving references are migrated.
5. Run strict type checking, lint, tests, the complete production build, browser flows, visual comparisons and loading checks. Record results below.

## Acceptance checks

- Compare desktop (1440 × 900), mobile (390 × 844), and tablet layouts; inspect intentional content/consent changes separately.
- Cover navigation, responsive menus, documentation anchors, article loading, downloads, privacy acceptance/rejection/revocation, unknown routes and failed chunks.
- Decorative controls cannot take keyboard focus; reduced motion keeps meaningful static artwork.
- All retained internal routes and asset URLs resolve, including old blog links and `/v2` aliases.
- Every legal page exposes the shared current policy without requiring JavaScript.
- Initial document and shell do not eagerly import DAW, NAM or GSAP chunks on text-only pages.
- No authored `!important`; specialized upstream artwork styles retain a documented sync path.
- CI runs TypeScript, ESLint, tests and the full build. Browser checks cover the redesigned canonical routes.

## Documentation source

Reviewed against the local OpenStudio app, commit `808ccbe`, using committed implementations where the working tree contains unrelated edits. MiniMax Music 3 and the guided Stable Audio 3 Medium setup retain the explicit next-desktop-release qualification until release metadata verifies availability.

## Validation results

Implemented and checked locally on 15 September 2026. No commit, push or deployment was made as part of this migration.

### Routes and recovery

- All 35 canonical pages are prerendered from their actual React components; a separate document handles HTTP 404s. Each canonical page has its own title, canonical URL and structured metadata. Documentation and blog article bodies are present before JavaScript runs.
- `/v2` and `/v2/*` redirect to the redesigned canonical pages. Old `/home`, `/blogs/*`, `/github`, `/contact` and `/stem-separation` links retain their destinations. Query strings and document fragments are preserved.
- All ten stable app/runtime download endpoints, release metadata and appcasts remain supported. Installer matching excludes metadata, debug files and prereleases.
- Failed optional illustration chunks retain a screenshot. Failed articles offer reload recovery. Legal pages remain readable with JavaScript disabled, a failed entry bundle or a failed route chunk.
- Privacy choices can be opened again from the footer. Acceptance, rejection, revocation and cross-tab synchronization are covered by browser tests. The shared Microsoft Store policy in `src/data/legal.ts` is byte-for-byte unchanged: Git blob `e67ed7a6e613a417337a8f40941be7d6a8b3d40f` before and after.

### Documentation and accessibility

- The 15 guides identify app revision `808ccbe` as a development build. Keyboard shortcuts retain the 19 built-in profiles and distinguish default bindings, platform modifiers, editor scope and custom overrides.
- Lua examples use the actual `openstudio.*` bindings. Corrected function names, arguments, return values, FX/JSFX loading and rendering examples; all 59 named Lua functions were checked against the pinned scripting implementation.
- Corrected signal flow, master mute, render sources and disabled/unavailable export controls. AI guidance distinguishes replacement/variation results from continuation and scopes benchmark claims to the measured model.
- Shared marketing/documentation data includes MiniMax Music 3 and Stable Audio 3 Medium through Diffusers, including model licenses, guided setup, authentication and supported operations. They remain marked for the next desktop release: the published stable release checked during this migration was `v0.1.01`.
- Decorative DAW controls are inert. Carousel tabs support arrow/Home/End navigation with one tab stop. The mobile menu closes on Escape, navigation and desktop resize. Delayed article anchors scroll correctly; malformed fragments cannot crash the page.

### Styling and loading

- Converted 337 static inline style objects to Tailwind utilities; responsive homepage grid columns also use explicit Tailwind classes. Shared typography, gradients, responsive components and animation rules remain in the component layer. Dynamic illustration geometry remains inline.
- Authored site styles contain no `!important`. Eight declarations remain in the pinned upstream NAM artwork stylesheet; the sync script and vendor README document that boundary.
- Page and article imports remain lazy. Live illustrations wait for initial loading and viewport eligibility; text pages do not eagerly import NAM, DAW or GSAP modules. GSAP loads only when needed, without ScrollTrigger.
- Removed the image GraphQL service, its client, Vite bridge, loading planner and obsolete generated indexes. Native `srcset`/`sizes`, intrinsic dimensions and content-versioned responsive images replace the extra metadata request. The build generates 225 variants for 29 referenced source images and can fall back to original images.
- The navbar uses a reproducible 6,464-byte WebP instead of the 142,682-byte master PNG. The original remains as the branding source. Four self-hosted font families retain their original bytes and licenses; the unused Fraunces family is removed.
- A local Sponsor link replaces the GitHub iframe. Release labels use a small release summary instead of loading full release history. The hero reserves its final dimensions, and stylesheet/application reveal timing avoids layout shifts.

### Removed legacy material

| Removed | Scope |
| --- | --- |
| 84 source/tool files | Old pages, shell/navigation/footer, cinematic scenes, animation/loading helpers, image service and obsolete generators/indexes |
| 134 tracked asset files | Unreferenced design references, feature-story and download-cinematic imagery, old screenshots and unused fonts; **36,264,907 bytes (34.6 MiB)** removed |
| 9 packages | `@chenglou/pretext`, the three unused Radix packages, `class-variance-authority`, `framer-motion`, `lenis`, `tailwindcss-animate`, `three` |
| 15 old test files | Assertions specific to removed v1 scenes and implementation; current consent, legal, release, SEO and redesigned browser coverage retained or replaced |

Unused old contact-page and footer data were also removed. Retained material includes current screenshot/blog sources, branding masters, font licenses, pinned NAM UI/artwork and the release publishing infrastructure. Internal version naming was initially retained to limit simultaneous file moves. The subsequent [source structure cleanup](source-structure.md) removes that naming and organizes the sole website by responsibility.

### Verification evidence

- Production build and strict application/Node TypeScript checks pass.
- ESLint passes with zero warnings; `npm audit` reports zero vulnerabilities.
- Full suite: **101 tests passed**. Every canonical route was checked at **390, 768 and 1440 pixels** (105 route/viewport visits), including overflow, inline code wrapping, route status and browser exceptions.
- Production checks validate retained internal links, article anchors, source images and generated `srcset` targets. Regression coverage checks the mobile homepage column layout and compiled color modifiers, as well as privacy, article/chunk recovery, keyboard navigation and real 404s.
- Captured original `/v2` screenshots before editing and compared fully loaded desktop/mobile captures for Home, Features, NAM Rack, Download, Privacy and Lua documentation. Fixed the mobile column and Tailwind modifier regressions found during comparison. Expected differences are corrected content, fitting/wrapping documentation, privacy controls, optimized image rendering and the local Sponsor button.

The existing performance budgets were unchanged. The local ten-run matrix passed every budget:

| Page | Mobile LCP | Desktop LCP | Mobile CLS |
| --- | ---: | ---: | ---: |
| Home | 2.12 s | 1.28 s | 0 |
| Features | 2.31 s | 1.36 s | 0 |
| Download | 1.89 s | 1.29 s | 0.0089 |
| AI | 1.95 s | 1.32 s | 0 |
| Blog | 3.04 s | 1.25 s | 0 |

Mobile used a 390 × 844 viewport, 4× CPU slowdown, 1.6 Mbps download and 150 ms latency; desktop used 1440 × 900, 2× CPU slowdown, 10 Mbps and 40 ms. Both observed two seconds after reveal. A final mobile Home rerun after the visual fixes measured **2.11 s LCP, zero CLS, 30 requests and 437 KiB transferred**, with no budget violations. These are controlled local measurements, not field performance guarantees.

Local artifacts are under the ignored `output/review/` and `output/playwright/` directories, including logs, cleanup inventories, before/after screenshots and performance JSON. The deployed Netlify redirects, functions and update feeds still require the post-deployment checks in `README.md`; this migration validated their local contracts and production output without publishing a deployment.


## Branding and live GitHub data follow-up

The subsequent [branding and download audit](branding-and-download-audit.md) records the approved high-resolution logo, both repository inventories, generated GitHub release data, 103-test validation and expanded comparison against the actual deployed `/v2` preview. Its release-data architecture and latest measurements supersede the earlier snapshot/branding details and performance run above.
