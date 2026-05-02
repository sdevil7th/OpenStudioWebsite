import type { ContactProfile, ExternalLinkMap } from "@/data/marketing";

export const externalLinks: ExternalLinkMap = {
  repository: "https://github.com/sdevil7th/OpenStudio",
  documentation: "https://github.com/sdevil7th/OpenStudio/tree/main/docs",
  privacy: "/privacy",
  security: "/security",
  terms: "/terms",
  changelog: "/releases",
  contactSite: "https://sourav-das.in",
  contactEmail: "mailto:sdevil7th@gmail.com",
  maintainerGithub: "https://github.com/sdevil7th",
};

export const contactProfile: ContactProfile = {
  name: "Sourav Das",
  role: "Maintainer, design systems, audio product direction",
  email: "sdevil7th@gmail.com",
  website: "https://sourav-das.in",
  heroTitle: "Project contact for OpenStudio.",
  summary:
    "Use this page for release feedback, contribution questions, website collaboration, and maintainer contact around the public OpenStudio project.",
  location: "Remote-first, maintaining OpenStudio in public.",
};

export const footerUtilityLinks = [
  { label: "Documentation", href: externalLinks.documentation },
  { label: "Privacy", href: externalLinks.privacy },
  { label: "Security", href: externalLinks.security },
  { label: "Terms", href: externalLinks.terms },
];
