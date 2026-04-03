import type { ContactProfile, ExternalLinkMap } from "@/data/marketing";

export const externalLinks: ExternalLinkMap = {
  repository: "https://github.com/sdevil7th/OpenStudio",
  documentation: "https://github.com/sdevil7th/OpenStudio/tree/main/docs",
  privacy: "/privacy",
  security: "/security",
  terms: "/terms",
  changelog: "/releases",
  creatorSite: "https://sourav-das.in",
  creatorEmail: "mailto:sdevil7th@gmail.com",
  creatorGithub: "https://github.com/sdevil7th",
};

export const contactProfile: ContactProfile = {
  name: "Sourav Das",
  role: "Creator, design systems, audio product direction",
  email: "sdevil7th@gmail.com",
  website: "https://sourav-das.in",
  heroTitle: "Let's connect.",
  summary:
    "OpenStudio is being shaped as a native DAW with a cinematic interface, serious production workflows, and an honest story around optional AI tooling.",
  location: "Remote-first, building the public OpenStudio release.",
};

export const footerUtilityLinks = [
  { label: "Documentation", href: externalLinks.documentation },
  { label: "Privacy", href: externalLinks.privacy },
  { label: "Security", href: externalLinks.security },
  { label: "Terms", href: externalLinks.terms },
];
