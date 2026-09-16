# Music-model blog and uncommitted-code review

Reviewed on 16 September 2026. Website baseline: `de05863`, branch
`studio-paper-v2`. Scope: the complete uncommitted website diff, including the
preceding illustration-loading changes and the concurrent automation-guide edits.
The desktop checkout was read as evidence; this work does not modify it.

## Article

- Source: [MiniMax, Stable Audio and ACE-Step: three ways into a song](../blogs/2026-09-16-minimax-stable-audio-diffusers-openstudio.md).
- Public path: `/blog/minimax-stable-audio-diffusers-openstudio`.
- Category: AI. The dated post becomes the newest featured blog entry.
- Hero: [natural studio photograph](../public/assets/blogs/minimax-stable-audio-diffusers-openstudio.webp),
  1729 × 910, 156,960 bytes (153.3 KiB). It meets the authoring guide's minimum;
  it has not been enlarged to the preferred master size. Responsive WebP
  derivatives, article HTML, blog index, social metadata and sitemap come from
  the existing generators.
- Author, descriptive alt text, search title/description, keywords and social
  image are configured in `scripts/sync-blog-image-manifest.mjs`.

The post opens with session use, explains each model and all seven model-aware
workflows, then covers setup, memory and implementation challenges. It includes
special thanks to Hugging Face and the Diffusers team, and credits the model
authors. It makes no new speed benchmark or subjective audio-quality claim.

## Source checks

Desktop base: `7f59cff92c4a5f70704ba5985e7da373900d6162`. The AI source files
listed below were committed in that checkout. Its user manual and automation
implementation also have concurrent working-tree edits; those were not treated
as a released binary.

| Claim | Desktop evidence |
| --- | --- |
| Model names, workflows and controls | `frontend/src/data/aiWorkflows.ts` |
| Variation/inpainting use a new track; continuation uses the original track when clear and a new track on overlap | `frontend/src/store/useDAWStore.ts`, generated-source result import |
| Guided Hub downloads, selected MiniMax components, Stable Audio conversion, cache reuse and temporary token handling | `tools/prepare_diffusers_audio.py`; `docs/USER_MANUAL.md`, section 18 |
| Distinct runtime behavior, source conditioning, cancellation and progress | `tools/stable_audio3_generate.py`; `tools/diffusers_audio_pipeline.py` |
| Memory placement and experimental INT8 qualification | `tools/ai_execution_policy.py`; `tools/ai_generation_preflight.py`; `docs/runtime-dependency-contract.md` |
| Decoder bottleneck, bounded-window checks and limits on test conclusions | `docs/ai-generation-qualification-2026-09-13.md` |
| Windows conversion failure, idle release, bounded recovery and release scope | `docs/releases/0.1.02.md` |
| Concurrent Cubase shortcuts and Read/Write behavior | `frontend/src/utils/shortcutProfiles.ts`; `frontend/src/store/actions/automation.ts` |

**Quantization:** the repository has experimental INT8 code and a path that can
accept a matching, locally auditioned qualification profile. That is not a
supported quantized download or a generally enabled INT8/INT4/GGUF option. The
article distinguishes this experiment from available memory offloading and does
not promise that MiniMax will run on every 8 GB GPU. A layer-offloading example
in upstream documentation is not OpenStudio hardware qualification.

Primary upstream links were checked: the ACE-Step XL Turbo Diffusers checkpoint,
MiniMax and Stable Audio model cards, their Diffusers pipeline documentation,
the Diffusers memory guide, and the pinned SAME autoencoder implementation. The
article links them beside the relevant explanations. It avoids conflicting
sample-rate claims between the MiniMax model card and pipeline documentation.

## Problems corrected during this review

1. **Unreadable article tables and lists.** The Markdown renderer retained white
   text utilities from the retired dark theme. The new model comparison exposed
   this on the light article background. Removed those text-color utilities so
   article styling owns the colors. Inline code also inherits a readable color;
   the existing dark code-block styling remains. The browser SEO test now checks
   ordinary list/table text in every post, before and after JavaScript.
2. **Article header icon wrapping.** Tailwind's SVG reset put the small book icon
   on its own line. An explicit inline display restores its intended placement.
3. **Fixed page-count tests.** Two tests assumed exactly 35 canonical pages.
   They now compare the generated routes against an independent inventory of
   public pages and authored guide/blog filenames. The new total is 36 canonical
   pages, plus the generated 404 document.
4. **Draft continuation wording.** Source inspection corrected the post's first
   draft: continuation is not always placed on a new track.

Intentional visual changes in this pass are the new post/image, its featured
position in the blog, readable article colors and the inline book icon. This
pass does not alter the page loader, animation choreography or marketing layouts.
The preceding loading changes and their visual limits are documented separately
in [illustration loading](illustration-loading.md).

## Open findings

### P2 — NAM Rack artwork still exceeds the network budgets

The screenshot placeholders have been removed, and the real scene is available
before GSAP. The remaining cost comes from the illustration itself.
`NAMRackDesignPort.tsx` renders artwork with `loading="eager"`, and
`NAMDesignAssets.ts` selects one source per asset without responsive candidates.
The page mounts its hero and six hardware scenes early. `content-visibility`
does not defer those image downloads or JavaScript effects.

The recorded same-machine loading comparison, with unchanged budgets, is:

| Profile | Before removal | After removal | Remaining failure |
| --- | --- | --- | --- |
| Mobile | 50 requests; 504.6 KiB | 47 requests; 666.4 KiB | Request budget: 35 |
| Desktop | 60 requests; 1425.3 KiB | 49 requests; 1360.3 KiB | Request budget: 45; transfer budget: 1000 KiB |

These are the preceding illustration-change measurements, not new speed claims
for the blog. The final review's new NAM measurements are 47 requests / 637.7 KiB
on mobile and 49 requests / 1360.7 KiB on desktop, with the same network failures.
Their other timing/layout checks pass. A fresh request inventory confirms the mechanism:
the blue wide pedal body is about 187.1 KiB, red wide pedal 119.6 KiB, copper
pedal 118.5 KiB, cabinet 110.97 KiB and stone pedal 79.1 KiB. They are real
hardware textures, not fallback screenshots.

Work still needed:

- Generate size-appropriate artwork variants while preserving transparent
  padding, aspect ratio and control coordinates. Choose candidates for the
  rendered size and device pixel ratio, including the stage transform.
- Defer artwork belonging to distant scenes without hiding their real rest
  layout. Load it before scrolling exposes the scene; do not restore unrelated
  screenshot placeholders.
- Evaluate combining small repeated control textures if request count remains
  high. Verify that an atlas actually reduces total transfer and retains the
  control artwork before adopting it.
- Repeat mobile/desktop network measurements and visual checks at both ordinary
  and high pixel densities. The image GraphQL service is not needed for these
  static asset-delivery improvements.

### P2 — Offscreen mixer meters still repaint

`vendor/PeakMeter.tsx` owns a separate requestAnimationFrame loop. The stage
scheduler pauses GSAP, but it does not pause that loop. Since the new loading
approach mounts the real scenes earlier, offscreen meter work starts earlier too.

A Chromium probe of `/features` at 1440 × 900 with reduced motion enabled found
eight offscreen mixer canvases continuing to issue drawing calls during a
1.2-second observation. This is unnecessary CPU work even when the visible scene
does not move. It is distinct from the NAM network issue.

The follow-up should give meter rendering the same visibility/reduced-motion
policy, retain a complete static paint and redraw on value/size changes. Apply
the adjustment through the vendor script, then verify restart on visibility and
normal peak-decay behavior. This review does not claim that fix is implemented.

## Other limits retained from the redesign review

- The three plugin-window/FX-chain screenshots with baked-in old title-bar
  logos still need native recapture. See [the earlier inventory](review-follow-up.md).
- Browser checks here use Chromium. They do not establish Firefox/WebKit
  rendering equivalence or audible model quality.
- Automation guide changes accurately identify their working-tree/development
  source. Publishing the website does not publish those app changes.
- No installer binaries, releases, analytics policy or download endpoints were
  changed in this pass. Existing tests exercise their contracts.

## Verification

Final checks on 16 September 2026:

- `npm run build`: pass, including strict TypeScript and 37 generated documents
  (36 canonical pages and 404).
- `npm run lint`: pass, zero warnings.
- `npm test`: **136 passed, 0 failed**. The first run exposed the two stale
  page-count assertions; the final full run includes their correction and the
  article-color regression checks. This count combines unit, contract, build and
  browser tests; it is not an E2E-only count.
- SEO: all 36 canonical pages checked with JavaScript disabled and enabled,
  including unique metadata, canonical URLs, schema, social image dimensions,
  readable prerendered content and SPA/404 metadata cleanup.
- Visual: article and hero checked at 360, 390, 768, 900, 901, 1440 and 1920 px;
  blog index checked at 390 and 1440 px. No document overflow or broken images.
  The model table scrolls horizontally on phones and now has readable text.
  No loader or animation artwork was replaced in this pass.
- `npm run verify:perf`: **10/10 core cases pass**, unchanged budgets.
- New article: additional mobile and desktop performance checks pass. Mobile:
  22 requests, 301.6 KiB, measured LCP 2180 ms. Desktop: 21 requests, 282.5 KiB,
  measured LCP 1300 ms. These are local throttled-browser observations, not
  guarantees about every visitor's connection.
- NAM Rack: both additional profiles still fail their network budgets as
  detailed above; the overall review is not an all-routes performance pass.
- `git diff --check`: pass.
- Documentation: 46 local links checked across 12 changed/new Markdown files;
  no missing targets. Task-owned preview and browser processes were stopped.

Local raw evidence is under `output/review/music-blog-*` and
`output/playwright/music-blog-*` (ignored files). The review made no commit,
push, deployment or desktop-repository edit.

## Hero generation provenance

Generated using the built-in imagegen tool. This is an illustrative generated
studio scene, not an OpenStudio screenshot or a photograph of the team. The
selected image was exported to WebP at its original dimensions with Sharp;
there was no compositing or enlargement. The original generated PNG is retained
in the tool's generated-images directory.

Final prompt:

```text
Use case: photorealistic-natural.
Asset type: wide editorial hero photograph for an OpenStudio blog about making songs with ACE-Step, MiniMax Music and Stable Audio inside a desktop music studio.
Primary request: a beautiful, believable home recording studio mid songwriting session, intimate and natural rather than a technology advertisement.
Scene: a real slightly worn wooden desk with a compact MIDI keyboard, over-ear studio headphones, an open notebook of handwritten song ideas that are too small to read, a pencil, and a small audio interface with neatly routed cables. A softly defocused computer display shows indistinct colored audio arrangement lanes, never a legible invented software interface. A studio microphone and an acoustic guitar sit naturally nearby.
Style: high-quality candid editorial photography, physically plausible equipment and proportions, subtle real material texture, no people.
Composition: wide landscape about 1.9:1, preferably 3360 by 1764 pixels or closest available wide size. Focus on the keyboard, notebook and headphones; enough surrounding room to crop to a blog card without losing the subject. A considered composition with quiet breathing room, not a flat lay or glossy product render.
Lighting: gentle late-afternoon window light, warm wood balanced with cool soft shadows, modest lived-in room, restrained natural color and contrast.
Constraints: no title or text overlay, no logos or watermarks, no robots, no floating icons or waveforms, no neon circuits, no surreal AI imagery, no excessive bloom, no fake branded UI, no cluttered impossible cables. The image should feel like a musician briefly stepped away from working on a song.
```
