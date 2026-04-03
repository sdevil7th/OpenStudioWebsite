import type { SeoMeta } from "@/data/marketing";
import { contactProfile, externalLinks } from "@/data/siteLinks";

export const contactSeo: SeoMeta = {
  title: "Contact OpenStudio | Creator Contact and Collaboration Surface",
  description:
    "Reach the creator behind OpenStudio, follow the current collaboration surface, and connect around product direction, release feedback, and site work.",
  path: "/contact",
};

export const contactHero = {
  eyebrow: "Contact",
  title: contactProfile.heroTitle,
  description:
    "OpenStudio is still close to the source. The contact surface should feel personal, product-aware, and aligned with the rest of the site rather than like a generic support form.",
};

export const contactMethods = [
  {
    label: "Email",
    value: contactProfile.email,
    href: externalLinks.creatorEmail,
    note: "Best for release feedback, collaboration ideas, and product conversation.",
  },
  {
    label: "Website",
    value: contactProfile.website.replace("https://", ""),
    href: contactProfile.website,
    note: "Portfolio and broader maker context.",
  },
  {
    label: "Location",
    value: contactProfile.location,
    note: "Remote collaboration works well for site, product, and release-facing work.",
  },
];

export const contactAvailability = [
  "Product and release feedback",
  "Frontend motion and marketing site collaboration",
  "Open-source and public-launch discussion",
];
