import type { ContactProfile, ExternalLinkMap, ProjectEmailMap } from "@/data/marketing";

export const projectEmails: ProjectEmailMap = {
  contact: "contact@openstudio.org.in",
  support: "support@openstudio.org.in",
  admin: "admin@openstudio.org.in",
  personal: "sdevil7th@gmail.com",
};

export const externalLinks: ExternalLinkMap = {
  repository: "https://github.com/sdevil7th/OpenStudio",
  documentation: "https://github.com/sdevil7th/OpenStudio/tree/main/docs",
  privacy: "/privacy",
  security: "/security",
  terms: "/terms",
  changelog: "/releases",
  contactSite: "https://sourav-das.in",
  contactEmail: `mailto:${projectEmails.contact}`,
  maintainerGithub: "https://github.com/sdevil7th",
};

export const contactProfile: ContactProfile = {
  name: "Sourav Das",
  role: "Maintainer, design systems, audio product direction",
  email: projectEmails.contact,
  supportEmail: projectEmails.support,
  adminEmail: projectEmails.admin,
  personalEmail: projectEmails.personal,
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
