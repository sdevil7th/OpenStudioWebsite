# Microsoft Store privacy review

Reviewed September 10, 2026 for PR #19 (`NAM-support` into `develop`), initially
at `9d1a31733a7cd4641a7ff5261a87350beb935e6d`.

## Requirements and findings

The supplied certification report flags **10.5.1 Privacy Policy**: the submitted
link resolved to a page without a displayed policy. The report does not identify
the submitted URL, so it does not establish which URL or deployment was tested.

Microsoft's current [Store policies, section 10.5.1](https://learn.microsoft.com/en-us/windows/apps/publish/store-policies#105-personal-information)
require a maintained policy for Win32/Desktop Bridge products. The policy must
explain personal information accessed, collected or transmitted; its uses,
storage and protection; recipients; and users' controls and access to their data.
Provide its URL in Partner Center. An additional in-app link is optional under
this section. Sections 10.5.2 and 10.5.4 separately address consent for publishing
personal information and secure handling; policy wording alone cannot establish
that the submitted executable meets those behavioral requirements.

Microsoft's [MSIX privacy and support instructions](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/support-info)
also explain the personal-information declaration and hosted policy option.
Local access to identifiable recordings and account credentials counts even
when the app does not upload recordings to the maintainer.

| Requirement | Coverage in `src/data/legal.ts` |
| --- | --- |
| App and responsible publisher | OpenStudio desktop app, Microsoft Store distribution, website, Sourav Das and support email |
| Information accessed and purpose | Audio/MIDI, voices, projects, paths, devices/plugins, account tokens, searches, AI inputs, diagnostics, website requests and support correspondence |
| Storage and protection | Local files and separate app data, retention criteria, HTTPS, local authentication callback and Windows DPAPI token protection |
| Recipients | TONE3000, hosting/download/model providers, Google Analytics, Microsoft Clarity and support channels; linked provider policies |
| Controls and access | Local file access/copy/export/deletion, microphone permissions, optional features, TONE3000 sign-out, analytics consent and privacy requests |
| Maintenance | Visible revision date and SEO modification date; update when features/data practices change |

The existing PR already supplied most of this coverage. This review clarifies
Windows credential protection, the loopback sign-in callback, local access/copy
controls and diagnostic wording, adds a direct privacy email link, and updates
the policy's revision date.

## Evidence and limits

- On September 10, the production `https://openstudio.org.in/privacy` returned
  HTTP 200 and displayed the older **May 14, 2026** policy in Chromium.
- PR #19's successful Netlify preview at
  `https://deploy-preview-19--openstudiodev.netlify.app/privacy` contained the
  expanded September 9 policy before these follow-up edits.
- The website's actual analytics/consent implementation was inspected. Existing
  browser tests exercise consent, revocation, expiry and synchronization using
  provider stand-ins; they do not audit providers' internal retention settings.
- Desktop source was inspected read-only in `../OpenStudio`, whose HEAD was
  `3beee3bc1ffcb24bba493e9540ac3309309d1c71` with additional local changes.
  `Source/MainComponent.cpp` contains the authentication callback and Windows
  DPAPI handling (also confirmed in its committed version);
  `frontend/src/services/tone3000Session.ts` handles connection state;
  `Source/CrashReportWriter.cpp`, `Source/CrashReporterMain.cpp` and
  `Source/CrashDiagnostics.cpp` implement local diagnostic reporting.
  This is source evidence, not a network audit of the exact submitted MSIX.
- Provider account retention settings and support-mailbox delivery cannot be
  established from this repository. The policy avoids inventing fixed retention
  periods or claiming every platform's local files are encrypted.

## Deployment and resubmission

1. Include these follow-up changes in PR #19, then merge and allow the production
   Netlify deployment to finish. The PR targets `develop`; verify that the merged
   commit reaches the site's configured production branch. A preview deployment
   or a successful merge alone is not proof of production publication.
2. Open **https://openstudio.org.in/privacy** in a signed-out browser. Confirm
   HTTP 200, a visible Privacy Policy, the September 10 revision, and the Windows
   DPAPI and user-control disclosures. Use `openstudio.org.in`, including `.in`.
3. In Partner Center's privacy section, select **Yes** for accessing, collecting
   or transmitting personal information, choose the privacy-policy URL option,
   and enter **https://openstudio.org.in/privacy**. Check the saved URL rather
   than assuming the previously submitted value was correct.
4. Confirm the submitted app version matches these disclosures, then resubmit.
   Suggested certification note after production verification: “The OpenStudio
   privacy policy is publicly available at https://openstudio.org.in/privacy.
   It covers local audio/project access, optional online services, storage and
   protection, recipients and user privacy controls.”

The review does not merge the PR, change Partner Center or resubmit the app.
Microsoft makes the certification decision.

## Verification

Run `npm run build`, `npm run lint` and `npm test`.
All three passed for this review; the full test suite passed all 147 tests.
`test/privacy-page-browser.test.mjs` checks the built policy on desktop and
mobile, without JavaScript, with all app bundles blocked and with the privacy
route chunk blocked. It verifies readable content, privacy contact, horizontal
layout and absence of analytics requests before consent. It models the checked
Netlify rewrite because plain Vite preview serves the home document at
`/privacy`; `/privacy/` resolves to the generated document directly.

The extra `npx tsc --noEmit -p tsconfig.app.json` check reports 33 existing
diagnostics. A compiler comparison using the original PR version of `legal.ts`
produced exactly the same diagnostics; these policy edits introduce none.
