# Final pre-push review

Reviewed **16 September 2026**. Website branch: `studio-paper-v2`; app branch:
`fix-nam-rack`. Changes remain uncommitted and have not been pushed or deployed.

The later [source structure cleanup](source-structure.md) records the removal of
internal website-version naming and its own verification. The results below
describe the pre-cleanup review and remain as historical evidence.

## Result

No unresolved push-blocking defect was found after the corrections below.
This is approval of the reviewed source changes for commit/push, not qualification
of new platform installers or a claim that the deployed site has been updated.

## Issues found and corrected

1. **Release workflow used an unsupported Node version.** The release dispatcher
   selected Node 20 while the project requires Node 22.12 or newer. It now uses
   Node 22.23.2, matching CI, and Netlify explicitly selects the same version.
   The Node distribution and GitHub release for that pin both returned HTTP 200.
2. **Clean builds omitted required release endpoints.** A fresh export without
   ignored local manifests built successfully but failed the production-link
   check because `/releases/latest.json` was missing. Builds now retrieve the
   published manifests/appcasts when inputs are absent, reuse validated local
   inputs, and fail if retrieval or validation fails. Every Netlify context,
   including previews, refreshes the published inputs. CI provides its read-only
   GitHub token to both discovery paths. Three regression tests cover clean
   retrieval/reuse/refresh, unavailable inputs and malformed supplied inputs.
3. **Release-dispatch values were interpolated into shell source.** Tag, channel
   and repository now enter through environment variables; validation also
   rejects malformed desktop tags before the download step. Payload values no
   longer become shell code.

The changes in this review affect build/release preparation and documentation.
No website styles, visible copy or app behavior changed during this final pass.
ESLint also ignores local `output/` review artifacts, matching Git's exclusion;
application source remains covered by the existing lint rules.

## Verification

| Check | Result |
| --- | --- |
| Export of candidate tracked/untracked source files, excluding ignored caches and generated inputs | Passed; clean `npm ci`, no dependency audit findings |
| Clean website build with `CI=true` and fresh GitHub inputs | Passed; published `v0.1.01` manifests/appcasts fetched and validated |
| Clean website strict TypeScript, prerender and lint | Passed |
| Complete website suite | **109 passed** |
| Candidate code/assets compared with working copy after the run | **123 files identical** |
| App frontend production build | Passed; existing chunk-size/dynamic-import warnings remain |
| App native Debug build and copied frontend | Passed |
| App Chromium E2E suite | **100 passed across 15 spec files** |
| Workflow YAML/TOML parsing, Node-version agreement and shell syntax | Passed; every release-workflow shell block passed `bash -n` |
| Diff whitespace and candidate-file checks | Passed; no files over 10 MiB and no matches for scanned private-key/GitHub-token patterns |

Earlier in the same review sequence, all ten website mobile/desktop performance
gates passed, and all 35 page bodies were unchanged by the SEO fixes. The
[branding audit](branding-and-download-audit.md) records the actual `/v2` preview
comparison, and the [SEO audit](seo-audit.md) covers metadata, sitemap, schemas,
prerendering and canonical/404 behavior.

Evidence is local under `output/review/final-*`. The initial clean-checkout
failure is retained in `final-clean-tests-initial.log`; the corrected run is in
`final-clean-tests.log`. The clean export is disposable and is not commit content.
Automatic approval review blocked deletion of the temporary export, so it remains
under ignored `output/review/clean-checkout-final/`. This does not affect commit
contents or application builds.
The automated checks ran on Windows; hosted Linux CI and the deployed Netlify
functions still need their normal post-push runs. The workflow itself was not
dispatched and no deployment command was executed.

## Commit and release follow-up

- Include the new source files, tests, documentation and approved logo masters
  in each repository's commit. They are intentionally new/untracked until
  staged. Do not commit ignored `output/`, `dist/`, `node_modules/`,
  `public/github/`, generated release inputs or app build output.
- Let GitHub CI and the updated deploy preview finish after the push. Verify the
  live Netlify release function, canonical routes, update endpoints, robots and
  social/favicon cache behavior before promoting the website.
- New native icons reach installed users through newly built and qualified
  platform installers. Windows Release, macOS/Linux native packaging and
  installation were not qualified by the browser tests or Debug build.
- Upload Store/custom social artwork separately. The two historical plugin-window
  screenshots listed in the branding inventory still need fresh captures when
  updating product screenshots.
- Search Console submission/index coverage and external rich-result checks remain
  deployment follow-up. Chromium E2E is not Firefox/WebKit coverage or proof of
  native audio/hardware behavior.

No staging, commits, pushes, releases, uploads or deployment were performed.
