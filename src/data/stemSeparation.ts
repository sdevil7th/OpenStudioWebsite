import { screenshots } from "@/data/screenshots";
import type { ActionLink, SeoMeta, StoryStep } from "@/data/marketing";

export const stemSeparationSeo: SeoMeta = {
  title: "OpenStudio Stem Separation | Separate Vocals, Drums, Bass, Guitar, Piano, and More in the DAW",
  description:
    "OpenStudio can separate vocals, drums, bass, guitar, piano, and other inside the DAW after the optional AI tools install, then move straight into editing and mix work.",
  path: "/stem-separation",
};

export const stemHero = {
  eyebrow: "Stem separation",
  title: "Separate stems without leaving the session.",
  description:
    "OpenStudio can split a source into vocals, drums, bass, guitar, piano, and other from inside the DAW after the optional AI tools install. Then those new parts can go straight into editing, arrangement, and mix decisions.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
};

export const stemExplainer = {
  eyebrow: "What it does",
  title: "Pull a full source apart into workable parts.",
  paragraphs: [
    "Stem separation breaks a source into individual parts so you can work on the pieces instead of only reacting to the full mix. In OpenStudio, that means isolating vocals, drums, bass, guitar, piano, and other directly from the app once the optional AI tools are installed.",
    "That matters because the result does not stop at analysis. The new material can move straight into editing, arrangement changes, pitch work, FX choices, and mix decisions inside the same project.",
  ],
};

export const stemArchitectureCards = [
  {
    id: "vocals",
    label: "Vocals",
    color: "rgba(255, 92, 92, 0.9)",
    description: "Isolate lead lines, harmonies, and vocal phrasing when the session needs cleanup or a new arrangement decision.",
  },
  {
    id: "drums",
    label: "Drums",
    color: "rgba(245, 212, 68, 0.9)",
    description: "Pull the rhythm bed apart for groove studies, transient cleanup, or a different production direction.",
  },
  {
    id: "bass",
    label: "Bass",
    color: "rgba(86, 219, 109, 0.9)",
    description: "Give low-end material its own path when balance, tone, or replacement work needs more control.",
  },
  {
    id: "piano",
    label: "Piano",
    color: "rgba(58, 215, 255, 0.9)",
    description: "Break harmonic content into something you can mute, reshape, or process as part of a new arrangement.",
  },
  {
    id: "guitar",
    label: "Guitar",
    color: "rgba(111, 122, 255, 0.92)",
    description: "Separate guitars for re-amping, editing, texture changes, or creative resampling inside the same project.",
  },
  {
    id: "other",
    label: "Other",
    color: "rgba(246, 134, 255, 0.9)",
    description: "Everything else stays available as its own creative layer instead of disappearing into the original source.",
  },
];

export const stemWhyItMatters = [
  {
    title: "Stay in the project",
    description:
      "From separation to editing to mix work, the point is to keep momentum inside one session instead of round-tripping through another utility.",
  },
  {
    title: "Work on parts, not only full mixes",
    description:
      "When you can isolate a vocal, a rhythm section, or a harmonic layer, more arrangement and cleanup decisions become practical.",
  },
  {
    title: "Turn a special-purpose tool into a real workflow step",
    description:
      "Stem separation becomes more useful when it is integrated with the timeline, pitch tools, plugin chains, and mixer instead of living off to the side.",
  },
];

export const stemPerformanceNotes = [
  {
    title: "Zero round-trips",
    description: "Separate material, bring it back into the timeline, and keep moving inside the project instead of bouncing between utilities.",
  },
  {
    title: "Practical extraction",
    description: "The goal is not an abstract AI demo. The goal is to create workable parts that feed the next production decision.",
  },
  {
    title: "Local workflow value",
    description: "Once the optional tools are installed, the separation path becomes part of editing, pitch work, routing, and mix choices already happening in the DAW.",
  },
];

export const stemWorkspaceChannels = stemArchitectureCards.map((card, index) => ({
  ...card,
  level: ["78%", "62%", "54%", "48%", "40%", "66%"][index]!,
}));

export const stemUseCases = [
  {
    title: "Remix preparation",
    description: "Pull key parts from a source, then rearrange, replace, or process them inside the session.",
  },
  {
    title: "Vocal or instrument isolation",
    description: "Focus on a single part when you need cleanup, processing, or a more deliberate edit path.",
  },
  {
    title: "Arrangement experiments",
    description: "Mute or reshape separated parts to test alternate structures without rebuilding a session from scratch.",
  },
  {
    title: "Practice and reference work",
    description: "Break a track into more readable pieces when you want to study a part or practice against a reduced source.",
  },
  {
    title: "Creative resampling",
    description: "Treat the separated stems as new raw material for sound design, edits, and layered processing.",
  },
  {
    title: "Mix cleanup",
    description: "Push an isolated part into its own FX, level, or routing path when the source needs more control than the full mix allows.",
  },
];

export const stemWorkflowIntro = {
  eyebrow: "Workflow",
  title: "From separation to editing to mix decisions in one place.",
  description:
    "The value is not just that separation exists. The value is that the result can stay connected to the rest of the production workflow.",
};

export const stemWorkflowSteps: StoryStep[] = [
  {
    id: "choose-and-separate",
    eyebrow: "Separate",
    title: "Choose the source and extract only the stems you need.",
    description:
      "OpenStudio's current stem workflow is designed to stay practical. You choose the clip, select the target stems, run the separation, and bring the results back into the session.",
    bullets: [
      "Current path targets vocals, drums, bass, guitar, piano, and other.",
      "The feature is available after the optional AI tools install inside the app.",
      "The base app stays smaller because the AI runtime is not bundled by default.",
    ],
    screenshot: screenshots.arrangementOverviewWide,
  },
  {
    id: "edit-and-arrange",
    eyebrow: "Edit",
    title: "Treat the separated stems like production material, not exports.",
    description:
      "Once the stems are back in the project, they can move through the timeline like the rest of the session. That means arrangement work can continue immediately instead of waiting on another app handoff.",
    bullets: [
      "Trim, split, move, mute, and rearrange the separated parts in the timeline.",
      "Try alternate arrangements by keeping or removing specific layers.",
      "Use the result as source material for a new section, bounce, or edit pass.",
    ],
    screenshot: screenshots.heroTimeline,
  },
  {
    id: "shape-and-process",
    eyebrow: "Process",
    title: "Push isolated parts through pitch tools, FX, and plugin chains.",
    description:
      "Isolation becomes more useful when you can immediately shape the result. OpenStudio keeps the separated material close to pitch editing, plugin windows, and effect chains.",
    bullets: [
      "Tune or reshape a separated vocal inside the same project.",
      "Route isolated material into dedicated FX chains and plugin windows.",
      "Use the result for correction, creative processing, or both.",
    ],
    screenshot: screenshots.pluginHostingPitchAra,
  },
  {
    id: "mix-and-deliver",
    eyebrow: "Finish",
    title: "Balance the result, make the mix decision, and render the project.",
    description:
      "Separated parts are most useful when they lead into the mix instead of stopping at a demo preview. OpenStudio keeps the mixer, routing, and export path right there when the session moves forward.",
    bullets: [
      "Balance new stems through the mixer and route them where they need to go.",
      "Use automation and FX choices to fit the parts back into the song.",
      "Render the project once the new arrangement or cleanup pass is ready.",
    ],
    screenshot: screenshots.channelStripCloseup,
  },
];

export const stemInstallFacts = [
  "Stem separation is optional and enabled through an in-app AI tools install.",
  "Python is required for the current optional AI tools setup.",
  "The base OpenStudio download does not bundle the larger AI runtime by default.",
  "Current workflow is grounded in a 6-stem path rather than vague AI promises.",
];

export const stemPracticalNote =
  "This is an integrated production tool, not magic. Results depend on the source material, but the workflow value comes from keeping the outcome inside the project once separation is done.";

export const stemFinalCta = {
  eyebrow: "Keep going",
  title: "Separate the source, then keep producing in the same DAW.",
  description:
    "OpenStudio treats stem separation as one step in a larger workflow, not as an isolated trick that ends in another export folder.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
};
