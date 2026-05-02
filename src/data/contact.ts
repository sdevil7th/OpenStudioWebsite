import type { SeoMeta } from "@/data/marketing";
import { contactProfile, externalLinks } from "@/data/siteLinks";

export const contactSeo: SeoMeta = {
  title: "Contact OpenStudio | Open Source DAW Project",
  description:
    "Reach the OpenStudio maintainer for release feedback, contributions, website work, and product direction tied to the live repository and public DAW releases.",
  path: "/contact",
  keywords: [
    "openstudio contact",
    "open source daw maintainer",
    "daw project contact",
  ],
};

export const contactHero = {
  eyebrow: "Contact",
  title: contactProfile.heroTitle,
  description:
    "Reach the maintainer directly for release feedback, contribution questions, website work, and product direction tied to the live repository and public releases.",
};

export const contactMethods = [
  {
    label: "Email",
    value: contactProfile.email,
    href: externalLinks.contactEmail,
    note: "Best for release feedback, collaboration ideas, and maintainership questions.",
  },
  {
    label: "Website",
    value: contactProfile.website.replace("https://", ""),
    href: contactProfile.website,
    note: "Maintainer site and broader background.",
  },
  {
    label: "Location",
    value: contactProfile.location,
    note: "Remote collaboration works well for site, product, and release-facing work.",
  },
];

export const contactAvailability = [
  "Product and release feedback",
  "Frontend motion and website collaboration",
  "Open-source contribution and repository questions",
];
