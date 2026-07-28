import { screenshots } from "@/data/screenshots";
import type { ActionLink, SeoMeta, StoryStep } from "@/data/marketing";

export const homeSeo: SeoMeta = {
  title: "OpenStudio | Free Open-Source DAW with a Built-In Guitar Rig",
  description:
    "Record with a free, open-source DAW featuring a built-in Neural Amp Modeler guitar rig, A1/A2 captures, native pedals, cabinet IRs, mixing, and render.",
  path: "/",
  image: screenshots.namRackHero.src,
  imageAlt: screenshots.namRackHero.alt,
  keywords: [
    "free daw",
    "open source daw",
    "free guitar amp simulator",
    "free guitar rig",
    "open-source amp simulator",
    "NAM A2 player",
    "Neural Amp Modeler DAW",
    "AmpliTube alternative",
    "Guitar Rig alternative",
    "Neural DSP alternative",
    "free amp capture software",
    "TONE3000 integration",
    "Cubase alternative",
    "alternative to Cubase",
    "Pro Tools alternative",
    "alternative to Pro Tools",
    "Reaper alternative",
    "alternative to Reaper",
    "Ableton Live alternative",
    "alternative to Ableton Live",
    "FL Studio alternative",
    "alternative to FL Studio",
    "Logic Pro alternative",
    "alternative to Logic Pro",
    "Studio One alternative",
    "alternative to Studio One",
    "Bitwig Studio alternative",
    "alternative to Bitwig",
    "Reason alternative",
    "GarageBand alternative",
    "Audacity alternative",
    "Cakewalk alternative",
    "Waveform alternative",
    "Mixcraft alternative",
    "Suno AI alternative",
    "alternative to Suno AI",
    "Suno AI killer",
    "Udio alternative",
    "alternative to Udio",
    "ElevenLabs Music alternative",
    "alternative to ElevenLabs Music",
    "Eleven Music alternative",
    "Stable Audio 3 alternative",
    "Google MusicFX alternative",
    "Google Lyria alternative",
    "MiniMax Music alternative",
    "Mureka alternative",
    "Sonauto alternative",
    "AIVA alternative",
    "Beatoven.ai alternative",
    "Mubert alternative",
    "Soundraw alternative",
    "Boomy alternative",
    "music production software",
    "digital audio workstation",
    "audio editing software",
    "music making software",
    "daw free",
    "free music production software",
    "daw windows",
    "daw mac",
    "daw linux",
  ],
  jsonLd: [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "OpenStudio",
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "DigitalAudioWorkstation",
      operatingSystem: ["Windows 10", "Windows 11", "macOS", "Linux"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Free, open-source DAW for Windows, macOS, and Linux with a built-in Neural Amp Modeler guitar rig, recording, MIDI, plugin hosting, audio editing, mixing, and optional AI workflows.",
      keywords:
        "free daw, open source daw, free guitar rig, open-source amp simulator, NAM A2 player, Neural Amp Modeler DAW, AmpliTube alternative, Guitar Rig alternative, Neural DSP alternative, TONE3000 integration, Cubase alternative, Pro Tools alternative, Reaper alternative, Ableton Live alternative, FL Studio alternative, Logic Pro alternative, Studio One alternative, Bitwig Studio alternative, Suno AI alternative, Suno AI killer, Udio alternative, ElevenLabs Music alternative, Stable Audio 3 alternative, music production software, digital audio workstation",
      featureList: [
        "Multi-track recording",
        "MIDI instruments",
        "Built-in Neural Amp Modeler A1/A2 guitar rack",
        "Native pre-effects pedalboard and cabinet IR stage",
        "NAM Rack presets, A/B comparison, project recall, and offline render",
        "Optional authenticated TONE3000 model delivery",
        "Graphical pitch editing",
        "AI stem separation",
        "ACE-Step text-to-music",
        "Optional Stable Audio 3 text-to-audio",
        "Plugin hosting (VST3, CLAP, LV2, ARA2)",
        "Three-tier FX chain",
        "Automation lanes",
        "Audio editing and mixing",
        "Music production workflow",
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
          acceptedAnswer: { "@type": "Answer", text: "Windows 10/11, macOS, and Linux." },
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
            text: "Yes — optional local AI tools include BS Roformer stem separation, ACE-Step text-to-music, Stable Audio 3 text-to-audio after a separate import, and polyphonic pitch detection.",
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
    "OpenStudio is an OpenSource native DAW where multitrack recording, MIDI, pitch editing, plugin hosting, optional stem separation, and scripting stay connected inside one project.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
  tertiaryCta: {
    label: "Explore AI",
    to: "/ai",
  } satisfies ActionLink,
};

export const homeHeroProof = [
  "Multitrack recording",
  "Graphical pitch editing",
  "VST3 / CLAP / LV2 hosting",
  "Optional AI tools",
];

export const homeProofBarItems = [
  "Multitrack recording",
  "Graphical pitch editing",
  "VST3 / CLAP / LV2 hosting",
  "AI stem separation",
  "ACE-Step generation",
  "Stable Audio 3 import",
  "MIDI piano roll",
  "Lua scripting",
  "Input / Track / Master FX",
  "Optional ARA hosting",
];

export const homeNamRack = {
  eyebrow: "Free + open source · Built into the DAW",
  title: "Your guitar rig is already in the session.",
  description:
    "OpenStudio now has a free, built-in guitar rig powered by Neural Amp Modeler, with TONE3000 discovery, native pedals, cabinet IRs, and studio effects inside the DAW.",
  proof: ["NAM A1 + A2", "Native pedals", "Cabinet IRs", "Project recall"],
  caveat:
    "No paid NAM Rack tier. Third-party capture and IR licenses still apply, and authenticated TONE3000 delivery requires a TONE3000 account.",
  cta: {
    label: "Explore the NAM Rack",
    to: "/features#nam-rack",
  } satisfies ActionLink,
  screenshot: screenshots.namRackHero,
};

export const homeAlternativePositioning = {
  eyebrow: "Open source alternative",
  title: "For producers comparing closed DAWs and AI audio tools.",
  description:
    "OpenStudio is positioned as an open source alternative to Cubase, Pro Tools, Reaper, Ableton Live, FL Studio, Logic Pro, Studio One, and Bitwig for creators who want a native DAW with recording, MIDI, plugin hosting, pitch work, and optional AI tools in one inspectable project.",
  supporting:
    "It also gives creators searching for a Suno AI killer, Udio alternative, ElevenLabs Music alternative, or Stable Audio 3-style workflow a local production story: separate stems, generate music through ACE-Step, or import Stable Audio 3 only when that setup makes sense.",
  terms: [
    "Cubase alternative",
    "Pro Tools alternative",
    "Reaper alternative",
    "Ableton Live alternative",
    "FL Studio alternative",
    "Logic Pro alternative",
    "Studio One alternative",
    "Bitwig Studio alternative",
    "Suno AI killer",
    "Suno AI alternative",
    "Udio alternative",
    "ElevenLabs Music alternative",
    "Stable Audio 3 alternative",
  ],
};

export const homeOriginStory = {
  eyebrow: "Open project direction",
  title: "A serious DAW, shaped through public iteration.",
  description:
    "OpenStudio is an OpenSource native DAW with a modern surface, serious audio workflows, and a public development model people can inspect before they commit.",
  points: [
    "Native DAW positioning instead of a browser-first compromise.",
    "Advanced workflow depth stays part of the session instead of becoming a separate utility story.",
    "Release claims stay honest around optional AI tooling, packaging, and installer trust.",
  ],
};

export const homePillars = [
  {
    title: "Optional AI tools inside the DAW",
    eyebrow: "Extract and generate without round-trips",
    description:
      "Separate vocals, drums, bass, guitar, piano, and other with BS Roformer, generate songs through ACE-Step, or import Stable Audio 3 for text-to-audio when that workflow is needed.",
    points: ["6-stem workflow", "ACE-Step text-to-music", "Separate Stable Audio 3 import"],
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
      "Channel strips, sends, automation, input FX, and native plugin windows make the mix stage feel like a real desktop production environment.",
    points: ["Channel strips and sends", "VST3 / CLAP / LV2 hosting"],
  },
];

export const homeCapabilityGrid = [
  {
    title: "Native recording core",
    description: "Record armed tracks, monitor inputs, punch ranges, and waveform previews in a project built for real sessions.",
    accent: "emerald",
  },
  {
    title: "Plugin and FX depth",
    description: "Host VST3, CLAP, and LV2 plugins alongside input FX, track FX, master FX, presets, and native editor windows.",
    accent: "lavender",
  },
  {
    title: "Pitch, MIDI, and stems",
    description: "Graphical pitch tools, piano roll editing, MIDI recording, and optional AI tools stay inside the same workflow.",
    accent: "amber",
  },
  {
    title: "OpenSource / AGPLv3",
    description: "The source is available under GNU AGPLv3 so users can inspect, modify, and contribute with the license clearly visible.",
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
      "When the session gets dense, OpenStudio keeps the mix readable. Channel strips, plugin windows, FX chains, automation, and export all stay within reach.",
    bullets: [
      "Keep channel strips, metering, sends, and routing visible while the project grows.",
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
    label: "Explore AI",
    to: "/ai",
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
    "OpenStudio is built for people who want a serious modern DAW with advanced workflows already within reach and an open project they can actually inspect.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
};
