# Website guide authoring

These guides appear at `/docs/<slug>`. They describe OpenStudio behavior verified
against the desktop repository, not every feature implied by the latest website
deployment. Internal links use canonical URLs through `SITE_PATHS.docs` and
`docPath` in `src/constants/routes.ts`. The route components live in `src/pages/`;
this feature owns guide content, metadata, types and rendering blocks.

## Add or change a guide

1. Read the relevant app guide and implementation in `../OpenStudio` from the
   website repository root. Prefer menu/action definitions and runtime code when
   prose disagrees with the app.
2. Edit the typed `DocContent` in `content/<slug>.ts`. Set `updated` to the actual
   review date and `appReference` to the commit reviewed. Use `development` for
   unshipped behavior; set `release` and `version` only after checking that tag.
3. For a new guide, add its metadata to `DOCS` in `index.ts`. Its
   `contentLoaders` glob discovers `content/<slug>.ts` as a lazy module. Reading
   order controls the sidebar and previous/next links. Prerendering and the
   sitemap consume that same inventory.
4. Preserve existing heading IDs where possible so saved links still land at the
   right section. Use existing block types and inline `**bold**`, backtick code
   and Markdown links; extend `types.ts` and `DocBlocks.tsx` together if necessary.
5. Build and run the route/content checks. Inspect changed tables, code, menu
   labels and navigation at narrow widths as well as desktop.

## Sources and terminology

- Shortcuts: app `frontend/src/store/actionRegistry.ts`,
  `frontend/src/utils/shortcutProfiles.ts`, `mouseBehaviorProfiles.ts`,
  `frontend/src/components/MenuBar.tsx`, and `docs/input-profiles.md`.
  State the default profile and explain platform/scope overrides. The app window
  is **Keyboard, Mouse & Trackpad**, available in Options and Help; `F1` opens the
  separate Help Reference. The website guide title remains **Keyboard shortcuts**.
- AI models: app runtime/setup code, `docs/runtime-dependency-contract.md` and
  actual release notes. Shared website availability text belongs in
  `src/data/aiSetup.ts`; keep its marketing and guide consumers consistent.
- Lua, rendering and routing: verify examples and behavior against the registered
  API/backend as well as `docs/API.md`, `USER_MANUAL.md` and
  `implemented_features.md`. Do not copy obsolete limitations from agent notes.
- Legal policy: edit `src/data/legal.ts`; public guides should link `/privacy`
  rather than duplicate the policy.

Do not advance every guide's source revision merely because another app commit
exists. Review the relevant changes first, and preserve honest verification scope.
