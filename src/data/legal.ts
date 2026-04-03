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
  title: "A short privacy note based on the current product.",
  summary:
    "OpenStudio is a desktop product and public website, not a telemetry-heavy cloud service. This page reflects the current codebase and shipping surface as we understand it today.",
  seo: {
    title: "OpenStudio Privacy | Fact-Based Privacy Summary",
    description:
      "Read the current OpenStudio privacy summary covering downloads, release metadata, optional AI tools, and the product's present data-collection stance.",
    path: "/privacy",
  },
  facts: [
    { label: "Product shape", value: "Native desktop DAW plus public marketing site" },
    { label: "AI tools", value: "Optional install, separate from the base app" },
    { label: "Update surface", value: "Release metadata and appcast URLs at openstudio.org.in" },
    { label: "Telemetry stance", value: "No dedicated analytics vendor found in the current repo" },
  ],
  sections: [
    {
      title: "What this page is",
      paragraphs: [
        "This is a plain-language privacy summary based on the current OpenStudio website and the Studio13-v3 codebase it was derived from. It is meant to describe observable product behavior, not act as a lawyer-written policy for hypothetical future services.",
        "If OpenStudio later adds account systems, cloud collaboration, or broader data collection, this page should be updated to reflect those changes.",
      ],
    },
    {
      title: "What OpenStudio appears to handle today",
      paragraphs: [
        "The website is built to present the product, link to downloads, show release information, and point people toward documentation, the repository, and contact details.",
        "The desktop app appears to center on local creative work: project files, audio assets, presets, exports, optional AI runtime files, and release/update metadata used to keep the download path legible.",
      ],
      bullets: [
        "Local project and session data created by the user",
        "Presets, themes, exports, and other user-generated files",
        "Optional AI runtime files installed later for stem separation workflows",
        "Standard website or hosting logs that may exist at the infrastructure layer",
      ],
    },
    {
      title: "Network-facing behavior",
      paragraphs: [
        "The current codebase points to release metadata, appcast URLs, and download/release pages hosted on openstudio.org.in. Those update and release surfaces are the clearest network-facing behaviors visible in the repo today.",
        "The optional AI tools flow is separate from the base app and may require downloading runtime packages or models when a user explicitly chooses to install that tooling.",
      ],
    },
    {
      title: "Analytics and telemetry",
      paragraphs: [
        "We did not find clear evidence in the current repo of a dedicated analytics, advertising, or product-telemetry vendor. OpenStudio should therefore not present itself as a telemetry-heavy service.",
        "That said, absence of a dedicated analytics vendor in the repo is not the same as a permanent promise that no operational logs or future diagnostics will ever exist. If that product behavior changes, this page should change with it.",
      ],
    },
  ],
  links: [
    { label: "Documentation", href: externalLinks.documentation ?? "/github", external: Boolean(externalLinks.documentation?.startsWith("http")) },
    { label: "GitHub repository", href: externalLinks.repository ?? "/github", external: Boolean(externalLinks.repository?.startsWith("http")) },
    { label: "Contact", href: "/contact" },
  ],
};

export const securityDocument: LegalDocument = {
  eyebrow: "Security",
  title: "A practical security page, not a marketing checklist.",
  summary:
    "OpenStudio should describe its current release and security posture honestly: public releases, visible trust caveats, and a straightforward disclosure path rather than exaggerated guarantees.",
  seo: {
    title: "OpenStudio Security | Release and Disclosure Notes",
    description:
      "Review OpenStudio's current practical security stance, release surfaces, manual trust caveats, and responsible disclosure path.",
    path: "/security",
  },
  facts: [
    { label: "Release surfaces", value: "Downloads, manifests, appcasts, and GitHub releases" },
    { label: "Platform trust", value: "Manual trust steps may still exist, especially on macOS" },
    { label: "AI tools", value: "Installed separately, not bundled into the base app by default" },
    { label: "Disclosure", value: "Contact the creator or open a responsible report on GitHub" },
  ],
  sections: [
    {
      title: "Current stance",
      paragraphs: [
        "OpenStudio is in a public early-release phase. The correct security posture is practical and transparent: document what is shipped, keep release metadata legible, and avoid implying a hardened enterprise program that does not exist.",
        "The repo shows real release metadata, appcast, and download surfaces. Those are part of the security story because they influence how people discover, trust, and install new builds.",
      ],
    },
    {
      title: "What users should know right now",
      paragraphs: [
        "Windows and macOS downloads are real, but trust cues and packaging maturity are still evolving. Current website messaging should continue to keep those caveats visible instead of hiding them behind polished language.",
        "Optional AI tools are installed later and separately from the base app. That separation is part of the product's current safety and packaging story.",
      ],
      bullets: [
        "Release metadata and appcast files are part of the public shipping surface",
        "Unsigned or manually trusted install flows may still appear during the current release cycle",
        "Users should prefer the official website, repository, and release pages when evaluating builds",
      ],
    },
    {
      title: "What this page does not claim",
      paragraphs: [
        "This page does not claim SOC 2, penetration-test coverage, bug bounty infrastructure, or any enterprise certification that is not visible in the current product and repo.",
        "It also does not claim that every plugin, user script, or third-party tool in a music-production workflow is free from crashes or security risk. OpenStudio is designed to be useful and honest, not magical.",
      ],
    },
    {
      title: "Reporting a security issue",
      paragraphs: [
        "If you believe you have found a security issue in the website, downloads, release artifacts, or app behavior, please report it directly to the project creator or through the public repository.",
        "Include reproduction steps, affected version information, platform details, and whether the issue relates to downloads, update metadata, optional AI tools, or local project handling.",
      ],
    },
  ],
  links: [
    { label: "Email the creator", href: externalLinks.creatorEmail ?? "mailto:sdevil7th@gmail.com" },
    { label: "GitHub repository", href: externalLinks.repository ?? "/github", external: Boolean(externalLinks.repository?.startsWith("http")) },
    { label: "Releases", href: "/releases" },
  ],
};

export const termsDocument: LegalDocument = {
  eyebrow: "Terms",
  title: "Simple terms for the current OpenStudio website and downloads.",
  summary:
    "These terms are intentionally short. They describe the current website and software surface without inventing a separate commercial EULA or licensing model that the repo does not clearly support today.",
  seo: {
    title: "OpenStudio Terms | Site and Software Use",
    description:
      "Read the current OpenStudio terms covering website use, downloads, documentation, and the project's AGPLv3-compatible licensing posture.",
    path: "/terms",
  },
  facts: [
    { label: "License direction", value: "AGPLv3-compatible terms in the current repo" },
    { label: "Third-party notices", value: "Available in LICENSE and THIRD_PARTY_LICENSES.md" },
    { label: "Site purpose", value: "Product information, docs, releases, and downloads" },
    { label: "Future changes", value: "These terms should evolve if the product model changes" },
  ],
  sections: [
    {
      title: "Using the site",
      paragraphs: [
        "The OpenStudio website is provided so people can understand the product, review release information, access documentation, inspect the public repository, and download current builds.",
        "Please use the site and downloads lawfully and in good faith. Do not abuse release endpoints, impersonate the project, or misrepresent unofficial builds as official OpenStudio releases.",
      ],
    },
    {
      title: "Software terms and licensing",
      paragraphs: [
        "Based on the current codebase, OpenStudio is distributed under AGPLv3-compatible terms, with third-party dependency notices available in the repository.",
        "That means these site terms do not replace the software license files. If you download, run, modify, or redistribute the software, you are also responsible for complying with the applicable license text and third-party notices that ship with the project.",
      ],
    },
    {
      title: "Documentation, releases, and product status",
      paragraphs: [
        "The website, documentation, release notes, and download pages are meant to reflect the product as it currently exists. They are not a promise that every planned feature, platform target, or packaging improvement is already complete.",
        "OpenStudio may change its release process, packaging, or website content over time. When those product facts change materially, these terms should be updated as well.",
      ],
    },
    {
      title: "No extra promises beyond what is stated",
      paragraphs: [
        "These terms are intentionally narrow. They do not create a separate warranty program, support contract, enterprise SLA, or hidden commercial license structure that is not already stated in the project materials.",
        "If you need a different legal or commercial arrangement in the future, that should be documented explicitly rather than implied by this page.",
      ],
    },
  ],
  links: [
    { label: "GitHub repository", href: externalLinks.repository ?? "/github", external: Boolean(externalLinks.repository?.startsWith("http")) },
    { label: "Documentation", href: externalLinks.documentation ?? "/github", external: Boolean(externalLinks.documentation?.startsWith("http")) },
    { label: "Contact", href: "/contact" },
  ],
};
