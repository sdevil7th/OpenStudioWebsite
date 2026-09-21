# Website analytics

GA4 and Microsoft Clarity run only on the website, after explicit analytics
acceptance. They are not part of the desktop app. Source:
`src/lib/analytics.ts`, `src/lib/analyticsConsent.ts`, and
`src/components/PrivacyChoices.tsx`. Policy text lives in `src/data/legal.ts`.

The same choice panel is prerendered into `#openstudio-privacy`, outside the
temporarily hidden route root. A small pre-paint script uses the shared
`consentRecord.ts` validator to hide it for an unexpired saved choice. This
script never loads analytics or grants consent. The client portal replaces the
inert static panel before paint and keeps router links, focus and choice handlers
inside the existing app. Without JavaScript, or when initial application loading
fails, the static panel stays hidden so unusable controls cannot cover legal text.
The original loader still covers initial non-legal navigation until it finishes.

## Build configuration

Set these in the hosting provider's **build** environment; Vite embeds them at
build time. Changing a value requires a new build.

| Variable | Meaning |
| --- | --- |
| `VITE_GA_MEASUREMENT_ID` | Public GA4 web-stream measurement ID (`G-…`). Omit to disable Google Analytics. |
| `VITE_CLARITY_PROJECT_ID` | Public Clarity project ID. Omit to disable Clarity. |
| `VITE_ANALYTICS_ENABLED` | Usually leave unset: only production builds on `openstudio.org.in` and `www.openstudio.org.in` enable analytics. `false` disables both everywhere; `true` enables configured providers on any host for controlled verification. Consent remains required. |

These IDs are public configuration, not API secrets. Do not put credentials in
any `VITE_` variable. Keep `VITE_ANALYTICS_ENABLED` unset for deploy previews and
ordinary local development so those visits do not enter production reports.

## Required GA4 setting: manual page views

The React router reports a view once the page and its metadata are ready. Keep
this method for accurate titles on lazy routes. Do not add a second GA snippet
in HTML, GTM or a hosting plugin.

In the matching Google Analytics web stream:

1. Open **Admin → Data collection and modification → Data streams**.
2. Choose the stream matching `VITE_GA_MEASUREMENT_ID`.
3. Open the **Enhanced measurement** settings (gear).
4. Expand **Page views → Show advanced settings**.
5. Turn **Page changes based on browser history events** **off**, then save.

Other Enhanced Measurement options can remain enabled. The application already
sets `send_page_view: false` to suppress the initial view from the `config`
command. **That flag does not disable automatic history views**; the account
setting above is also required. Do not replace this with an undocumented tag
option or intercept Google's requests in production.

See [Google's page-view documentation](https://developers.google.com/analytics/devguides/collection/ga4/views)
and [SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications).

## Events and attribution

- `page_view`: one manual event per rendered pathname, including back/forward
  navigation. Query/hash-only changes or duplicate readiness callbacks do not
  create additional views. Reacceptance starts a new consented page context.
- `page_engagement_time`: custom elapsed visible-page duration with
  `duration_ms`, `duration_seconds`, `duration_bucket`, `exit_reason`, and maximum
  scroll depth. It carries the **previous** page URL/title/referrer when leaving
  a route. It does not override Google's built-in `engagement_time_msec`.
- `scroll_depth_reached`: once each at 25/50/75/90% in the current visible-page
  session. Google's optional automatic `scroll` is a separate event.
- `file_download_clicked`, `outbound_link_clicked`, `mailto_link_clicked`:
  delegated link-click tracking. Installer events contain the actual GitHub
  artifact URL. They measure click intent, **not download completion or installs**.
  Don't sum `file_download_clicked` with Google's automatic `file_download` when
  reporting downloads. Same-origin redirect URLs without file extensions are
  not detected as file-download clicks by the generic extension matcher.

Manual page views and events capture URL/title/referrer when they occur, so a
delayed provider load cannot move them to the page active when the queue drains.
The first referrer comes from `document.referrer`; subsequent manual views use
the last consented route. URLs in this manual context exclude query and hash.
This is not a blanket redaction guarantee for Clarity or provider-generated
events: configure provider URL masking/redaction separately if required. Because
manual page URLs omit query strings, do not assume UTM campaign attribution is
preserved by this implementation.

Clarity receives these custom event **names**, while GA receives their parameters.
Clarity records interactions using its own runtime; the site does not manually
create Clarity page views. Its consent calls use
[Microsoft's `consentv2` API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2).

## Consent and loading

- Neither provider loads before acceptance. Pre-consent activity is discarded.
- Accepted providers load after the initial content/intro readiness gate, then
  idle scheduling or the next input. Very short visits may end before providers
  initialize; this is a deliberate loading-performance tradeoff.
- Rejection cancels deferred initialization, discards queued site events,
  disables GA, denies storage consent, stops Clarity and clears accessible
  first-party analytics cookies. Already accepted/buffered activity can still
  finish uploading; third-party-domain cookies cannot be cleared by this site.
- Reacceptance resumes providers without a reload or duplicate script tags.
- Decisions last up to 180 days. Expiry, storage clearing, cross-tab changes and
  unavailable storage are covered by the consent tests. Advertising consent
  remains denied and Google advertising personalization/signals stay disabled.

## Verification

```sh
node --test test/analytics.test.mjs test/analytics-consent-browser.test.mjs test/analytics-verifier.test.mjs
npm run verify:analytics -- --url https://openstudio.org.in
npm run verify:analytics -- --url https://openstudio.org.in --mobile
```

The automated suite uses provider stand-ins for repeatable consent and page-context
regressions. It cannot verify the GA account's history setting.

`verify:analytics` loads the **real** Google and Clarity scripts in a fresh Chromium
context. It intercepts provider uploads before they leave the browser and prevents
installer navigation, so it does not add test traffic to reports or download
binaries. It checks initial consent, actual collection requests, exactly one view
per client navigation (including Back), referrers, engagement page attribution,
and all three installer click events. It fails if analytics are disabled, provider
scripts are blocked, or duplicate/missing events occur. Allow about a minute.

Run this on an analytics-enabled deployment after changes to routing, consent or
provider settings. The live check is separate from offline CI; it depends on
external provider scripts and account configuration. The decoder/assertion tests
also demonstrate that duplicate history events fail the live check.

Account owners should additionally confirm GA Realtime/DebugView and Clarity
recordings, retention, masking, and desired GA key-event/custom-dimension settings.
The interception check proves client behavior, not dashboard ingestion.

## 16 September 2026 correction

The audit found two `/docs` views for one navigation and a custom engagement event
that mixed `/privacy` metadata with `/docs` as its URL. Code now preserves page
context and regression coverage includes the mismatch. Disabling history page
views is a separate GA account change; a code deployment alone does not complete
that correction. The real-provider verifier must pass before marking it resolved.
