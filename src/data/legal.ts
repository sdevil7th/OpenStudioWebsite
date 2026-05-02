import type { SeoMeta } from "@/data/marketing";
import { externalLinks } from "@/data/siteLinks";

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
    "OpenStudio is a local desktop application and public website. This policy describes what limited information the site and app may encounter and how it is handled.",
  seo: {
    title: "OpenStudio Privacy Policy | Website and App",
    description:
      "Read the OpenStudio privacy policy covering the public website, the desktop app, release metadata checks, and optional local AI tools.",
    path: "/privacy",
  },
  facts: [
    { label: "Last updated", value: "April 16, 2026" },
    { label: "Analytics", value: "None" },
    { label: "Software license", value: "GNU AGPLv3" },
    { label: "AI tools", value: "Optional, user-installed only" },
  ],
  sections: [
    {
      title: "Scope of this policy",
      paragraphs: [
        "This policy covers openstudio.org.in and the OpenStudio desktop application. The website exists primarily to explain the product, publish release information, and let users download the app itself.",
        "This policy does not cover third-party services, plugins, or tools that you choose to connect to independently outside the base OpenStudio website and desktop workflow.",
      ],
    },
    {
      title: "Information the website may collect",
      paragraphs: [
        "The website may generate standard server or hosting logs such as IP address, browser type, referrer, pages visited, and timestamps. That information is retained only as needed for infrastructure operation, security, and availability.",
        "OpenStudio does not use tracking pixels, ad networks, or dedicated analytics vendors on the public site.",
      ],
    },
    {
      title: "Information the desktop app may encounter",
      paragraphs: [
        "Project files, audio, presets, and exports stay on your device as part of the normal desktop workflow. OpenStudio is a desktop product first, and the website is only the delivery and documentation surface around it.",
        "The app may request openstudio.org.in to check release or update metadata. Those requests are intended to retrieve version information and download metadata, not to send personal identity information.",
      ],
    },
    {
      title: "Optional AI tools",
      paragraphs: [
        "Stem separation and similar features are provided through a separate optional install. Those tools are not required to use the base application.",
        "When installed, the intended base workflow is local: audio is processed on your machine rather than uploaded to external servers as part of the standard OpenStudio experience.",
      ],
    },
    {
      title: "Third-party services",
      paragraphs: [
        "Release artifacts are hosted through GitHub at github.com/sdevil7th/OpenStudio, so GitHub's own privacy policy applies when you access release assets there.",
        "OpenStudio does not integrate advertising, remarketing, or marketing automation vendors into the current website or desktop product flow.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [
        "If you have privacy questions about the OpenStudio website or desktop application, contact sdevil7th@gmail.com.",
      ],
    },
  ],
  links: [
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
    { label: "Disclosure contact", value: "sdevil7th@gmail.com" },
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
        "Email sdevil7th@gmail.com with the subject line \"Security: OpenStudio\" if you believe you found a vulnerability in the OpenStudio desktop app, website, release artifacts, or update metadata.",
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
    { label: "Email project contact", href: externalLinks.contactEmail ?? "mailto:sdevil7th@gmail.com" },
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
    { label: "Contact", value: "sdevil7th@gmail.com" },
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
        "OpenStudio is not a subscription service and does not require an account to use the current website or desktop app.",
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
