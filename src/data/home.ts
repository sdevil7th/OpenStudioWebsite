import { screenshots } from "@/data/screenshots";
import type { ActionLink, SeoMeta, StoryStep } from "@/data/marketing";

export const homeSeo: SeoMeta = {
  title: "OpenStudio | Free Open Source DAW — Stem Separation, Pitch Editing, MIDI, and Mixing",
  description:
    "OpenStudio is a free, open source DAW for Windows and macOS — stem separation, pitch editing, MIDI instruments, plugin hosting, and a complete music production workflow.",
  path: "/",
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "OpenStudio",
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "DigitalAudioWorkstation",
      operatingSystem: ["Windows 10", "Windows 11", "macOS"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free, open source DAW for Windows and macOS with stem separation, pitch editing, MIDI, plugin hosting, and mixing.",
      featureList: [
        "Multi-track recording",
        "MIDI instruments",
        "Graphical pitch editing",
        "AI stem separation",
        "Plugin hosting (VST3, CLAP, LV2, ARA2)",
        "Three-tier FX chain",
        "Automation lanes",
      ],
      downloadUrl: "https://openstudio.org.in/download",
      url: "https://openstudio.org.in",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is OpenStudio free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, OpenStudio is completely free and open source." },
        },
        {
          "@type": "Question",
          name: "What operating systems does OpenStudio support?",
          acceptedAnswer: { "@type": "Answer", text: "Windows 10/11 and macOS." },
        },
        {
          "@type": "Question",
          name: "What plugins does OpenStudio support?",
          acceptedAnswer: { "@type": "Answer", text: "VST3, CLAP, LV2, and ARA2." },
        },
        {
          "@type": "Question",
          name: "Does OpenStudio have AI features?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — AI-powered stem separation (vocals, drums, bass, and more) and polyphonic pitch detection.",
          },
        },
      ],
    },
  ],
};

export const homeHero = {
  eyebrow: "A modern DAW with uncommon built-in depth",
  title: "Craft Sound Faster",
  supportLine: "Complex things made simple",
  description:
    "OpenStudio combines recording, MIDI, pitch editing, plugin hosting, detached mixer workflow, optional stem separation, and scripting in one native DAW. Features often split across multiple tools stay connected inside the project.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
  tertiaryCta: {
    label: "See Stem Separation",
    to: "/stem-separation",
  } satisfies ActionLink,
};

export const homeHeroProof = [
  "Built-in stem separation",
  "Graphical pitch editing",
  "Detached mixer workflow",
  "Native plugin windows",
];

export const homeProofBarItems = [
  "Built-in stem separation",
  "Graphical pitch editing",
  "Detached mixer workflow",
  "VST3 / CLAP / LV2 hosting",
  "Input FX / Track FX / Master FX",
  "Lua scripting",
  "Optional ARA hosting",
];

export const homeOriginStory = {
  eyebrow: "Developer odyssey",
  title: "One product vision, shipped through focused iteration.",
  description:
    "OpenStudio is being shaped as a native DAW with a visually modern surface and a grounded production story. The public site should make that feel intentional: serious audio workflows, integrated advanced tools, and no fake distance between product ambition and the real release path.",
  points: [
    "Native DAW positioning, not a browser-first toy.",
    "Advanced workflow depth framed as part of the session.",
    "Release claims kept honest around optional AI tooling and installer trust.",
  ],
};

export const homePillars = [
  {
    title: "Stem separation inside the DAW",
    eyebrow: "Extract without round-trips",
    description:
      "Separate vocals, drums, bass, guitar, piano, and other inside OpenStudio after the optional AI tools install. Then keep working in the same session.",
    points: ["6-stem workflow", "Optional in-app AI install"],
  },
  {
    title: "Pitch editing without leaving the song",
    eyebrow: "Tune in context",
    description:
      "Move from pitch analysis to note-level editing and correction in context, instead of exporting clips into a separate pitch tool.",
    points: ["Graphical pitch editing", "Real-time correction path"],
  },
  {
    title: "MIDI, instruments, and audio in one working surface",
    eyebrow: "Compose beside the arrangement",
    description:
      "MIDI tracks, piano roll editing, hardware MIDI input, a virtual keyboard, and instrument loading live beside recorded audio.",
    points: ["Piano roll and virtual keyboard", "Instrument tracks beside audio"],
  },
  {
    title: "A real mix and plugin workflow",
    eyebrow: "See the session clearly",
    description:
      "Detached mixing, channel strips, sends, automation, input FX, and native plugin windows make the mix stage feel like a real desktop production environment.",
    points: ["Detached mixer behavior", "VST3 / CLAP / LV2 hosting"],
  },
];

export const homeCapabilityGrid = [
  {
    title: "Hyper-scale recording",
    description: "Track live takes, shape arrangements, and keep the session responsive as projects grow.",
    accent: "emerald",
  },
  {
    title: "Mixer architecture",
    description: "Channel strips, meters, sends, and FX stay legible when the session turns into a real mix.",
    accent: "lavender",
  },
  {
    title: "Plugin hosting",
    description: "Keep instruments and FX windows visually close to the tracks they change.",
    accent: "amber",
  },
  {
    title: "Collaborative future",
    description: "The product story stays open to documentation, contribution, and public iteration.",
    accent: "frost",
  },
];

export const homeWorkflowIntro = {
  eyebrow: "Connected workflow",
  title: "Composition, recording, editing, stem work, and mix decisions stay connected.",
  description:
    "OpenStudio is strongest when you move through the project without breaking context. The advanced tools are not side quests. They stay part of the session.",
};

export const homeWorkflowSteps: StoryStep[] = [
  {
    id: "write-and-build",
    eyebrow: "Write",
    title: "Build ideas with MIDI and instruments beside the rest of the project.",
    description:
      "The MIDI side is not a separate corner of the app. Piano roll editing, instrument tracks, hardware MIDI input, and the virtual keyboard stay close to the arrange view.",
    bullets: [
      "Write parts in the piano roll while audio tracks stay visible.",
      "Use hardware MIDI devices or the on-screen keyboard for quick input.",
      "Keep MIDI and audio arranged in the same session structure.",
    ],
    screenshot: screenshots.pianoRoll,
  },
  {
    id: "record-and-edit",
    eyebrow: "Capture",
    title: "Record takes, edit clips, and keep the timeline moving.",
    description:
      "Recording and timeline editing stay direct, so capture, cleanup, and arrangement changes can happen back to back without switching tools or flattening the project flow.",
    bullets: [
      "Record straight into a multitrack arrange view.",
      "Trim, split, move, and shape clips in the same timeline.",
      "Use markers, regions, zoom, and transport control without leaving the session.",
    ],
    screenshot: screenshots.heroTimeline,
  },
  {
    id: "separate-and-reshape",
    eyebrow: "Pull apart",
    title: "Separate a source when the arrangement needs a different angle.",
    description:
      "Stem separation is built into the broader production workflow. Once the optional AI tools are installed, you can split a source and keep editing the results inside OpenStudio.",
    bullets: [
      "Extract vocals, drums, bass, guitar, piano, and other from one source.",
      "Try arrangement ideas without treating separation as a separate utility.",
      "Move straight from isolated material to edits, FX, and new mix decisions.",
    ],
    screenshot: screenshots.arrangementOverviewWide,
  },
  {
    id: "tune-and-shape",
    eyebrow: "Tune",
    title: "Handle pitch work in context instead of exporting it away.",
    description:
      "Graphical pitch editing, correction, and analysis stay connected to the take, the arrangement, and the mix. That makes vocal decisions faster and easier to judge musically.",
    bullets: [
      "Inspect notes and contours inside the project.",
      "Apply correction while keeping phrasing tied to the actual song.",
      "Use pitch tools as part of production, not just post-processing.",
    ],
    screenshot: screenshots.pitchEditor,
  },
  {
    id: "mix-and-deliver",
    eyebrow: "Finish",
    title: "Mix with a real mixer, real plugin workflow, and a clean render path.",
    description:
      "When the session gets dense, OpenStudio keeps the mix readable. Detached mixer behavior, plugin windows, FX chains, automation, and export all stay within reach.",
    bullets: [
      "Keep channel strips and metering visible in a mixer workflow that can detach from the main view.",
      "Use input FX, track FX, master FX, sends, and automation where they make sense.",
      "Render to WAV, AIFF, or FLAC without leaving the project environment.",
    ],
    screenshot: screenshots.channelStripCloseup,
  },
];

export const homeShowcase = {
  eyebrow: "Deep tools, one surface",
  title: "The premium side of the workflow stays part of the song.",
  description:
    "Pitch work, plugin windows, and close-up mix decisions belong inside the same production surface. OpenStudio keeps the advanced moments visually close to the arrangement instead of hiding them behind disconnected utilities.",
  primaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
  secondaryCta: {
    label: "See Stem Separation",
    to: "/stem-separation",
  } satisfies ActionLink,
  media: [
    screenshots.pitchEditor,
    screenshots.pluginHostingFx,
    screenshots.channelStripCloseup,
  ],
};

export const homeFinalCta = {
  eyebrow: "Start here",
  title: "Use one DAW, then go deeper when the project asks for it.",
  description:
    "OpenStudio is built for creators who want a serious modern DAW with advanced workflows already within reach.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
};
