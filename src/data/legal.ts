import type { SeoMeta } from "@/data/marketing";
import { externalLinks, projectEmails } from "@/data/siteLinks";

export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalFact {
  label: string;
  value: string;
}

export interface LegalLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface LegalDocument {
  eyebrow: string;
  title: string;
  summary: string;
  seo: SeoMeta;
  facts: LegalFact[];
  sections: LegalSection[];
  links?: LegalLink[];
}

export const privacyDocument: LegalDocument = {
  eyebrow: "Privacy",
  title: "Privacy Policy",
  summary:
    "This policy explains how the OpenStudio desktop app and openstudio.org.in handle local files, optional online services, website analytics and support information.",
  seo: {
    title: "OpenStudio Privacy Policy | Website and App",
    description:
      "How OpenStudio handles local audio and projects, TONE3000 login, optional AI downloads, website analytics, privacy choices and deletion requests.",
    path: "/privacy",
    lastModified: "2026-09-10",
  },
  facts: [
    { label: "Last updated", value: "September 10, 2026" },
    { label: "Maintainer", value: "Sourav Das" },
    { label: "Desktop analytics", value: "No Google Analytics or Microsoft Clarity integration" },
    { label: "Privacy contact", value: projectEmails.support },
  ],
  sections: [
    {
      title: "Who is responsible and what this policy covers",
      paragraphs: [
        `OpenStudio is maintained by Sourav Das. This policy covers the OpenStudio desktop application, including its Microsoft Store distribution, and openstudio.org.in. Contact ${projectEmails.support} about privacy or information handled by the project.`,
        "The desktop application processes your music on your device. Accessing information to record or edit it is different from collecting it on the maintainer's servers. Optional online integrations and the public website have the separate data flows described below. Third-party providers are responsible for their own services under their privacy policies.",
      ],
    },
    {
      title: "Audio, MIDI, projects and device information",
      paragraphs: [
        "To record, play, edit and export, the app accesses audio inputs, MIDI devices, files you open, and available audio devices and plugins. Recordings can include identifiable voices; project names, file paths, metadata and device names can also contain personal information. Microphone access is subject to your operating system's permission settings.",
        "The built-in recording, editing, mixing and export workflows store audio, projects, presets, exports and recovery data locally. They do not upload your recordings or project contents to OpenStudio servers. Files placed in a cloud-synced folder may be transferred by your chosen sync service independently of OpenStudio. Third-party plugins or scripts you run may have their own network behavior.",
      ],
    },
    {
      title: "Optional TONE3000 login and NAM Rack",
      paragraphs: [
        "Core recording and editing do not require an OpenStudio account. If you connect NAM Rack to TONE3000, authentication takes place through TONE3000's browser sign-in flow. OpenStudio receives authorization results and access/refresh tokens so it can make requests associated with your TONE3000 account. OpenStudio does not receive the password you enter on TONE3000's login page.",
        "The app keeps authentication tokens locally to maintain the connection across restarts and sends them to TONE3000 for authorized requests and token refresh. Browsing and downloading captures sends search terms, filters and requested tone/model identifiers to the service. TONE3000 and its delivery providers also receive ordinary network information, such as your IP address. These library requests do not upload your recorded audio to TONE3000.",
        "Use NAM Rack's sign-out control to remove the app's saved connection credentials. Signing out of OpenStudio's connection does not delete your TONE3000 account or necessarily sign you out in your browser. Manage that account and its data with TONE3000 directly. Downloaded captures and locally saved projects are separate from your login credentials.",
      ],
    },
    {
      title: "Optional AI tools and downloads",
      paragraphs: [
        "Optional stem separation and music-generation workflows install or import runtime components and model files. The built-in local workflows process audio, text prompts, lyrics and generated results on your computer; they do not send that content to a hosted inference service as part of the normal workflow.",
        "Setup and model downloads can connect to OpenStudio's release site, GitHub, Hugging Face, Python package indexes, PyTorch distribution servers and model publishers. Those services receive the requested resource and normal network information. A model provider may require its own account or license acceptance. Independently installed plugins, scripts, modified builds or services can behave differently and are subject to their own policies.",
      ],
    },
    {
      title: "App updates, website hosting and network requests",
      paragraphs: [
        "Update checks and downloads contact the relevant distribution provider, such as openstudio.org.in, GitHub or Microsoft Store. These services receive IP addresses, requested URLs and other normal HTTP connection information. The purpose is to deliver version information and software, not to upload your audio or project contents. Update controls depend on the installed distribution and your operating system settings.",
        "The website is hosted using Netlify and links to GitHub release assets. Hosting and download providers may keep request logs, including IP addresses, browser/user-agent information, referrers, requested pages and timestamps, to deliver content, diagnose failures and protect infrastructure. Those essential requests occur even when website analytics are rejected.",
      ],
    },
    {
      title: "Website analytics and privacy choices",
      paragraphs: [
        "The website uses Google Analytics 4 for traffic and engagement measurement and Microsoft Clarity for interaction analysis, heatmaps and session replays. These integrations run on the website, not inside the OpenStudio desktop app. They can process page visits, referrers, approximate location, browser/device information, identifiers, download/outbound-link interactions, clicks and scrolling. A replay represents website interactions, not a recording of your desktop or DAW session.",
        "Optional website analytics load only after you choose Accept analytics. Choose Reject analytics to use the site and downloads without loading either provider. You can reopen Privacy choices in the footer to change your decision. Your choice is stored in this browser for up to 180 days; if browser storage is unavailable, it applies to the current page session. Changing your choice takes effect without reloading the page. When a saved choice expires or is cleared, optional analytics stop and the site asks you to choose again.",
        "The site does not enable advertising consent or Google advertising personalization. Analytics providers may use cookies and similar identifiers when analytics are accepted. Rejecting later stops future website tracking through these integrations and clears accessible first-party analytics cookies; it does not automatically erase information already processed by Google or Microsoft or cookies belonging to other domains. Their privacy policies and privacy controls also apply.",
      ],
    },
    {
      title: "Local diagnostics and information you send us",
      paragraphs: [
        "The app can write local startup logs, error reports, recovery records and crash diagnostics. These may contain application and operating-system versions, device/plugin names, file paths, error details and, in crash dumps, portions of process memory. The built-in crash-reporting workflow saves these reports on your device and does not automatically upload them to the maintainer. Review diagnostic files before choosing to share them.",
        `If you email ${projectEmails.support}, contact the maintainer or post a GitHub issue, we receive the details you choose to provide, such as your email address, message and attachments, and use them to respond and investigate. GitHub issues are public: do not include private recordings, passwords, tokens or other confidential data.`,
      ],
    },
    {
      title: "Storage, protection and retention",
      paragraphs: [
        "Local projects, recordings, exports, downloaded models and captures remain in your selected folders or the app's data/cache folders until removed by you or the relevant cleanup process. Recovery copies, logs, browser data and credentials may be stored separately from the main project. Deleting one project or uninstalling an app does not necessarily remove every copy, backup or external file.",
        "Connections to online authentication and download services use HTTPS. The TONE3000 browser sign-in flow can return an authorization result to a temporary HTTP callback on 127.0.0.1, the loopback address of your own computer. That callback is local to your device.",
        "On Windows, saved TONE3000 authentication tokens are encrypted using Windows Data Protection (DPAPI) under your Windows user account. Other platforms use the app's platform-specific credential handling. Access to local files also depends on your operating-system account, device security and backup configuration. Project and audio files are not automatically encrypted by OpenStudio. No system can guarantee absolute security.",
        "Hosting logs and analytics are retained under the providers' applicable service policies and account retention settings; periods differ by provider and data type. Support correspondence is kept as needed to answer requests, resolve issues and meet applicable obligations. Contact us for information about records held by the maintainer or the current provider settings. We cannot remotely delete files that remain solely on your device.",
      ],
    },
    {
      title: "Your controls and privacy requests",
      paragraphs: [
        "You can access your recordings and projects by opening them in OpenStudio or their saved folders, and export audio using the app's export controls. Locally stored files are under your control; you do not need to send them to the maintainer to access or copy them. Contact us if you need help locating app data or diagnostic files for your installation.",
        "You can revoke microphone access through your operating system, decline optional online features, sign out of TONE3000 in NAM Rack, and change website analytics consent using Privacy choices. You can delete your own projects, exports and app data using your device's file-management tools. Back up anything you want to keep before clearing app data, and check any separate cloud backups or synced copies.",
        `Depending on applicable law, you may have rights to access, correct, delete or obtain a copy of personal information, restrict or object to processing, or withdraw consent. Send requests concerning the maintainer's records to ${projectEmails.support}. We may need proportionate information to verify your request; do not send passwords or authentication tokens. Withdrawing consent does not undo processing that already occurred. You may also raise concerns with your local data-protection authority.`,
        "For accounts or information held independently by TONE3000, Microsoft, Google, GitHub, Netlify or another provider, use that provider's privacy-request process. Providers may process data in countries other than your own under their applicable policies and safeguards. We will explain any limitation that prevents us from fulfilling a request directed to us.",
      ],
    },
    {
      title: "Children and changes to this policy",
      paragraphs: [
        `The public website and its analytics are not designed to collect personal information from children. If you believe a child has provided personal information to the maintainer, contact ${projectEmails.support} so we can review and address it. Third-party account services have their own age requirements.`,
        "We update this policy when the application's data flows, website services or privacy controls change. The Last updated date identifies the current revision. Material changes will be described on this page and, where appropriate, in release communications or a renewed consent request.",
      ],
    },
  ],
  links: [
    { label: "Email privacy contact", href: `mailto:${projectEmails.support}` },
    { label: "TONE3000 privacy", href: "https://www.tone3000.com/privacy", external: true },
    { label: "Google privacy", href: "https://policies.google.com/privacy", external: true },
    { label: "Microsoft privacy (Clarity and Store)", href: "https://privacy.microsoft.com/privacystatement", external: true },
    { label: "GitHub privacy", href: "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement", external: true },
    { label: "Netlify privacy", href: "https://www.netlify.com/privacy/", external: true },
    { label: "Hugging Face privacy", href: "https://huggingface.co/privacy", external: true },
    {
      label: "Documentation",
      href: externalLinks.documentation ?? "/github",
      external: Boolean(externalLinks.documentation?.startsWith("http")),
    },
    {
      label: "GitHub repository",
      href: externalLinks.repository ?? "/github",
      external: Boolean(externalLinks.repository?.startsWith("http")),
    },
    { label: "Contact", href: "/contact" },
  ],
};

export const securityDocument: LegalDocument = {
  eyebrow: "Security",
  title: "Security Policy",
  summary:
    "How OpenStudio handles release integrity, platform trust, and responsible vulnerability disclosure.",
  seo: {
    title: "OpenStudio Security Policy | Downloads and Disclosure",
    description:
      "Review the OpenStudio security policy covering supported versions, official downloads, trust prompts, and responsible vulnerability disclosure.",
    path: "/security",
  },
  facts: [
    { label: "Last updated", value: "April 16, 2026" },
    { label: "Disclosure contact", value: projectEmails.support },
    { label: "Response target", value: "Best-effort, typically within 7 days" },
    { label: "Bug bounty", value: "None currently" },
  ],
  sections: [
    {
      title: "Supported versions",
      paragraphs: [
        "Only the latest public release of OpenStudio is actively maintained. Older builds are not backport-patched as a general rule.",
        "Before reporting a security issue in the desktop app or the website distribution flow, please upgrade to the latest public release and confirm the issue still reproduces there.",
      ],
    },
    {
      title: "Verifying your download",
      paragraphs: [
        "Always download OpenStudio from openstudio.org.in or the official GitHub releases page. The website is the public distribution surface for the desktop app, and unofficial mirrors should not be treated as trusted release channels.",
        "On macOS, you may need to approve the app manually in System Settings > Privacy & Security if Gatekeeper prompts you. Do not install builds from unofficial sources.",
      ],
      bullets: [
        "Download from openstudio.org.in or the official GitHub releases page",
        "Check the release page for any integrity notes on the specific build",
        "On macOS: allow the app in System Settings > Privacy & Security if Gatekeeper prompts you",
      ],
    },
    {
      title: "Reporting a vulnerability",
      paragraphs: [
        `Email ${projectEmails.support} with the subject line "Security: OpenStudio" if you believe you found a vulnerability in the OpenStudio desktop app, website, release artifacts, or update metadata.`,
        "Please include a clear description of the issue, reproduction steps, affected version, affected platform such as Windows, macOS, or Linux, and how you discovered it. Please allow up to 7 days for an initial response before public disclosure.",
      ],
    },
    {
      title: "Scope",
      paragraphs: [
        "In scope: the OpenStudio desktop application, the openstudio.org.in website, official release artifacts, and update metadata published for the app.",
        "Out of scope: third-party DAW plugins, your operating system or local system configuration, and AI model or runtime files obtained from third-party providers outside the standard OpenStudio distribution flow.",
      ],
    },
    {
      title: "Disclosure policy",
      paragraphs: [
        "OpenStudio follows coordinated disclosure. Please report issues privately first, allow reasonable time for investigation and a fix, and then disclose publicly when appropriate.",
        "Credit will be given to reporters unless they request anonymity.",
      ],
    },
    {
      title: "What we do not currently claim",
      paragraphs: [
        "OpenStudio does not currently claim SOC 2 compliance, formal security certifications, or a managed penetration-testing program for the current release cycle.",
        "There is also no automated bug bounty program at this time.",
      ],
    },
  ],
  links: [
    { label: "Email disclosure contact", href: `mailto:${projectEmails.support}` },
    {
      label: "GitHub repository",
      href: externalLinks.repository ?? "/github",
      external: Boolean(externalLinks.repository?.startsWith("http")),
    },
    { label: "Releases", href: "/releases" },
  ],
};

export const termsDocument: LegalDocument = {
  eyebrow: "Terms",
  title: "Terms of Use",
  summary:
    "The terms governing use of the OpenStudio website and software downloads. These are intentionally plain and reflect the current open-source, desktop-first product.",
  seo: {
    title: "OpenStudio Terms of Use | Website and Software",
    description:
      "Read the OpenStudio terms governing the website, software downloads, AGPLv3 licensing, acceptable use, and warranty limitations.",
    path: "/terms",
  },
  facts: [
    { label: "Last updated", value: "April 16, 2026" },
    { label: "Software license", value: "GNU AGPLv3" },
    { label: "Third-party notices", value: "LICENSE and THIRD_PARTY_LICENSES.md in the repo" },
    { label: "Contact", value: projectEmails.contact },
  ],
  sections: [
    {
      title: "Acceptance",
      paragraphs: [
        "By using openstudio.org.in or downloading OpenStudio, you agree to these terms. If you do not agree, do not use the site or software.",
      ],
    },
    {
      title: "What OpenStudio is",
      paragraphs: [
        "OpenStudio is a desktop digital audio workstation distributed as open-source software. The website is not the product itself; it exists to provide product information, documentation, release notes, and download access to the application.",
        "OpenStudio is not a subscription service. Core desktop recording and editing do not require an OpenStudio account. Optional integrations, such as authenticated TONE3000 library access, may require an account with that provider and acceptance of its terms.",
      ],
    },
    {
      title: "Software license",
      paragraphs: [
        "The OpenStudio source code is licensed under the GNU Affero General Public License v3 (AGPLv3). The full license text is available in the LICENSE file in the repository.",
        "Third-party component notices are listed in THIRD_PARTY_LICENSES.md. If you download, run, modify, or redistribute the software, you are responsible for complying with the AGPLv3 and any applicable third-party license terms.",
      ],
    },
    {
      title: "Acceptable use",
      paragraphs: [
        "Use the website and software lawfully and in good faith. Do not misrepresent unofficial builds as official OpenStudio releases.",
        "Do not abuse, scrape, or overload release, download, or update endpoints in ways that degrade service availability for others.",
      ],
    },
    {
      title: "No warranty",
      paragraphs: [
        "The software and website are provided \"as is\" without warranty of any kind, express or implied. No guarantee is made that OpenStudio will be fit for a particular purpose, continuously available, or free from errors.",
        "To the extent permitted by applicable law, the maintainer's liability is limited to the amount paid for the software, which is zero because OpenStudio is freely available.",
      ],
    },
    {
      title: "Changes to these terms",
      paragraphs: [
        "These terms may be updated as the product evolves. If material changes are made, they will be reflected in the updated \"Last updated\" date on this page.",
      ],
    },
  ],
  links: [
    {
      label: "GitHub repository",
      href: externalLinks.repository ?? "/github",
      external: Boolean(externalLinks.repository?.startsWith("http")),
    },
    {
      label: "Documentation",
      href: externalLinks.documentation ?? "/github",
      external: Boolean(externalLinks.documentation?.startsWith("http")),
    },
    { label: "Contact", href: "/contact" },
  ],
};
