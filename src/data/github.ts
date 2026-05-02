import type { GithubHighlight, SeoMeta } from "@/data/marketing";
import { externalLinks } from "@/data/siteLinks";

export const githubSeo: SeoMeta = {
  title: "OpenStudio on GitHub | Open Source DAW Repository",
  description:
    "Explore OpenStudio's GitHub repository — an open source DAW project. See the public codebase, contribution flow, release transparency, and architecture notes.",
  path: "/github",
  keywords: [
    "open source daw",
    "openstudio github",
    "daw github",
    "open source music production software",
    "open source audio workstation",
    "daw source code",
  ],
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
    title: "Contribution starts with a repository that is legible and easy to trust.",
    description:
      "The goal is to make the current repository understandable enough that the next contributor can see where to help without guesswork.",
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
    "The goal is straightforward: code, docs, releases, and product direction should stay close enough that the repository feels useful to maintainers, contributors, and evaluators alike.",
};
