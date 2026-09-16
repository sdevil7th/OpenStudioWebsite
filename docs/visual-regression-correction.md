# Visual regression correction — 16 September 2026

## What happened

The branding/cleanup work replaced suprabho's two-piece SVG loader with a single
raster app icon. That was an unauthorized design change. The same work added two
AI setup cards without padding and used an undefined `sp-h3` class. Expanded model
status text also made the AI table harder to scan. The previous claim that nothing
changed visually was incorrect.

These changes were included in `4c8c359ab6bec306564006f466dfb1bd50043c04`
(`chore: Updated the PR with code quality fixes, SEO, and other fixes`), committed
16 September 2026 at 02:45:21 IST. This identifies the commit containing the work,
not the precise time of the earlier uncommitted edits. The reference for the
original design is `97a3f2e`, before that commit. The later source-folder rename
did not introduce the loader replacement.

The earlier screenshot matrix used reduced motion and waited for the loader to
disappear. Its geometry comparisons concentrated on headings. The folder-rename
comparison used a baseline that already contained these regressions. Neither
comparison could support the broader assurance given to the user.

## Repairs in this follow-up

- Restored the original SVG paths, solid indigo fill, opposite-corner entrances,
  800 ms joining animation, three-second rotation, background, wordmark and
  progress treatment from `97a3f2e`. The same HTML template drives initial loading
  and uncached route loading. The approved raster logo remains in the website's
  icons, header/footer and social artwork.
- Kept legal documents immediately readable. An inert loader template now also
  survives direct legal visits, so subsequent uncached navigation can use the
  restored animation. Initial legal loading still has no covering overlay.
- Gave the new AI setup cards the existing design's card radius, 22/24 px padding,
  bold Space Grotesk headings and 13.5 px body text. They use the existing two-column
  grid and collapse to one column at 640 px. There is no undefined heading class.
- Shortened Stable Audio 3 Medium and MiniMax Music 3 table statuses to
  “Next desktop release.” Full licensing/download/conversion instructions remain
  in the setup cards and guide. This is a copy/layout repair, not a change in model
  availability. The same catalog still feeds the guide's table.
- Corrected blog image `sizes` to describe the actual featured/grid columns.
  At 1440 px and device pixel ratio 1, 377 px cards now request 480 px variants;
  at ratio 2 they request 768 px variants. Their CSS crop and displayed dimensions
  are unchanged. This removes excess transfer without selecting undersized images.

## Inventory of visible changes since the original design

This includes added UI, content changes that affect wrapping/page height, and
loading/failure states. Source organization and SEO metadata alone are not visual
changes to the rendered website.

| Area | Change introduced during the redesign cleanup | Current disposition |
| --- | --- | --- |
| Initial and uncached-route loader | The joining SVG pieces were replaced by the full gradient app tile, rotating in the original large frame | Reverted to the original animation in this follow-up |
| AI setup cards | Two detailed cards were added for Stable Audio 3 Medium and MiniMax Music 3, with missing padding and an undefined heading style | Content retained; spacing, typography and responsive grid repaired |
| AI model table | Model names, capabilities, availability and status colors changed; verbose status strings changed column balance and row wrapping | Correct information retained; next-release statuses shortened |
| AI page prose | Updated generation behavior, MiniMax workflows, licensing/setup and development-release caveats | Retained; these are visible content changes |
| Home AI sections | Added MiniMax next-release text/chip and corrected per-model setup wording | Retained; wrapping can differ from the original copy |
| Documentation | Corrected hotkeys/profile names, Lua API, signal flow, exports, AI setup and other app behavior; added source-verification/development-reference metadata | Retained; tables and article lengths necessarily differ |
| Header/footer logo | Regenerated small marks from the supplied high-resolution logo; original header already used this gradient design | Retained at the original 26 px header / 22 px footer dimensions |
| Favicons, home-screen icons and social image | Regenerated icons; replaced the previous NAM-oriented default share image with branded OpenStudio artwork | Retained as requested branding changes; these are visible outside the page body |
| App and README branding | Updated app/menu/native/package icons and README images in the separate app repository | Retained as requested; full placement inventory is in the branding audit |
| Privacy UI | Restored the analytics choice panel and added the footer's Privacy choices control | Retained; the panel is intentionally visible until a choice is made |
| Footer Sponsor control | Replaced GitHub's remote iframe with a local Sponsor button | Retained; it is a different rendered control and should have been disclosed |
| Download/release labels | GitHub-derived version, release date, size and exact installer URLs stay synchronized; checksum display requires a matching artifact | Retained; data/text can change independently of the design |
| Blog/docs at narrow widths | Constrained overflowing grid children/images and allowed long inline code to wrap; wide tables scroll within their cards | Retained; previously clipped content now fits, changing some page heights |
| Home hero and other lazy illustrations | Reserved hero space and retained screenshot posters while illustration code loads or fails; deferred animation work and static reduced-motion states | Retained; intermediate and reduced-motion images can differ from the original live illustration frames |
| Image delivery | Switched image elements to generated responsive WebP sources and intrinsic dimensions | Retained; source artwork is unchanged, but a browser-selected resized image is not pixel-identical to the full source |
| Errors and keyboard focus | Added reload recovery for failed pages/articles and a keyboard-visible skip link; removed decorative illustration controls from tab order | Retained; these affect failure/focus states rather than normal settled layouts |
| Legal page loading | Removed reveal/covering-loader dependence so prerendered policies remain readable when JavaScript is delayed or fails | Retained; first-load behavior deliberately differs |

Palette, retained font files, normal page-reveal choreography and the underlying
DAW/NAM illustrations were not intentionally redesigned. Ordinary inline styles
were moved to Tailwind, with specificity adjusted to preserve them; that refactor
alone was not evidence that every rendered state remained identical.

## Image audit

All **31 retained blog/product raster source images** match `97a3f2e` byte for
byte. All **17 retained WOFF2 font files** also match. The retired PNG duplicates,
unused screenshots and old-site cinematic assets were removed; the active WebP
product/blog sources were not repainted or replaced. The resize encoder's quality
settings were not lowered during the migration.

The old app glyph remains baked into the historical `plugin-hosting-1.webp` and
`plugin-hosting-2.webp` captures. These have not been presented as updated captures.
They require a fresh capture of those plugin windows to show the new app icon;
changing the icon files does not alter pixels already inside a screenshot.
The later [review follow-up](review-follow-up.md) also identified the old icon
inside the Raum window in `fx-chain-browser.webp`; all three need real recaptures.

The three screenshots supplied with this report showed two actual page-layout
regressions and the loader replacement. Their problems were not caused by missing
model illustrations or by the image GraphQL service's removal.

## Verification and evidence

- Production build including strict TypeScript, lint, and **119 tests passed**.
- New production-browser tests examine actual SVG transforms on initial loading
  and delayed uncached navigation, at mobile and desktop widths; cover the static
  reduced-motion state; and cover navigation after a direct legal-page visit.
- AI card tests check real padding, heading weight, responsive columns, contained
  table scrolling and absence of document-level overflow at 390, 768, 900, 901
  and 1440 px.
- Visual captures cover **360, 390, 768, 900, 901, 1024, 1440 and 1920 px**. The
  loader reference fixture uses the SVG, loader CSS and global base stylesheet
  from `97a3f2e`, with the retained fonts and equivalent Tailwind base compilation.
  Frames are sampled at 300, 800 and 1550 ms with normal motion enabled. This is
  an isolated original-loader comparison, not a fresh full original-site build.
- All **24 initial-loader frame comparisons are pixel-identical** to that fixture.
  Six of eight navigation-frame comparisons are identical; the remaining two
  differ by 1 and 21 pixels, at most 2/255 per color channel. AI cards/table captures
  were inspected separately, including phone and tablet layouts.
- Blog images decode successfully at device pixel ratios 1 and 2 and request
  variants appropriate to their displayed widths.
- All **10 existing performance checks passed**, without budget changes. Measured
  reveal-adjusted LCP ranged from 1.33 to 2.69 seconds in the local matrix.

Local artifacts are under `output/playwright/visual-repair/`; numerical evidence
is in `output/review/loader-original-pixel-comparison.json`,
`visual-repair-image-sources.json`, `visual-repair-performance.json` and the
`visual-repair-*.log` files. Earlier full-page reference captures remain in
`output/playwright/branding-reference/`.

This follow-up verifies the reported regressions and audits the source/image
changes. It is not a claim of pixel-identical pages in every state, browser or
possible viewport. The changes are local and have not been committed, pushed or
deployed as part of this follow-up.

The subsequent [review follow-up](review-follow-up.md) records the remaining code
fixes, image-delivery checks and the blocked native screenshot recapture. Its
layout comparison uses the repaired site above as its baseline; it does not
replace the original-loader comparison recorded here.
