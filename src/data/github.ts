import type { GithubHighlight, SeoMeta } from "@/data/marketing";
import { externalLinks } from "@/data/siteLinks";

export const githubSeo: SeoMeta = {
  title: "OpenStudio GitHub | Open Source Direction, Contribution Story, and Repository Signals",
  description:
    "See how OpenStudio frames its open-source direction, contribution style, public build transparency, and the repository surface around the product.",
  path: "/github",
};

export const githubHero = {
  eyebrow: "Open source",
  title: "Build in the open. Ship with radical clarity.",
  description:
    "OpenStudio uses GitHub as its public engineering surface: repository truth, release truth, and docs truth should all stay visible in one place.",
  repositoryHref: externalLinks.repository,
};

export const githubHighlights: GithubHighlight[] = [
  {
    eyebrow: "Repository",
    title: "The public repo should explain the product, not just host the code.",
    description:
      "Architecture notes, release notes, and workflow differentiation are part of the same public story instead of living in disconnected surfaces.",
    metric: "Visible architecture",
    accent: "lavender",
  },
  {
    eyebrow: "Release truth",
    title: "Download flow, release flow, and optional AI installs stay honestly framed.",
    description:
      "The GitHub page should reinforce the same message as the download and release surfaces: grounded claims, legible install paths, and no hidden caveats.",
    metric: "Grounded shipping",
    accent: "emerald",
  },
  {
    eyebrow: "Contribution",
    title: "Contribution starts with understanding what is already visible and real.",
    description:
      "The point is not to fake a big community. It is to make the current repo legible enough that the next contributor understands where to help.",
    metric: "Practical collaboration",
    accent: "amber",
  },
];

export const githubPillars = [
  {
    title: "Product direction stays legible",
    description: "The public site and the repository should reinforce each other instead of feeling like separate brands.",
  },
  {
    title: "Engineering tradeoffs stay explicit",
    description: "Release trust, optional tooling, and current platform scope remain visible rather than buried in fine print.",
  },
  {
    title: "Open source is presented as collaboration, not garnish",
    description: "The value is in transparent workflow, docs, release notes, and contribution pathways, not just a badge and a link.",
  },
];

export const githubCallout = {
  eyebrow: "Repository surface",
  title: "Explore the repository with the product story still attached.",
  description:
    "The goal is straightforward: code, docs, releases, and product direction should stay close enough that the repo feels useful even before the contributor graph gets crowded.",
};
