import type { ExternalLinkMap, ProjectEmailMap } from "@/data/marketing";

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
