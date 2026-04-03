import { screenshots } from "@/data/screenshots";
import type { ActionLink, FeatureChapter, SeoMeta } from "@/data/marketing";

export interface FeatureItem {
  title: string;
  description: string;
  note?: string;
}

export interface FeatureCategory {
  id: string;
  label: string;
  title: string;
  description: string;
  standout?: string;
  screenshot: (typeof screenshots)[keyof typeof screenshots];
  items: FeatureItem[];
}

export const featurePageSeo: SeoMeta = {
  title: "OpenStudio Features | Recording, MIDI, Pitch, Stem Separation, Mixing, and Scripting",
  description:
    "Explore the full OpenStudio feature set across recording, editing, MIDI instruments, mixing, routing, pitch workflows, optional stem separation, scripting, and export.",
  path: "/features",
};

export const featurePageHero = {
  eyebrow: "Features",
  title: "A broad DAW feature set, with deeper workflows where they matter.",
  description:
    "OpenStudio covers the expected ground, but it also brings stem separation, pitch editing, native plugin windows, detached mixing, and scripting directly into the same production environment.",
};

export const featureHighlights = [
  "Stem separation in-app",
  "Graphical pitch editing",
  "Detached mixer workflow",
  "Native plugin windows",
  "Lua scripting",
  "Optional ARA hosting",
];

export const featureCategories: FeatureCategory[] = [
  {
    id: "recording",
    label: "Recording",
    title: "Recording",
    description:
      "Capture stays close to the timeline and transport, so the first pass from input to take does not feel detached from the rest of the session.",
    screenshot: screenshots.recordingSession,
    items: [
      {
        title: "Native multitrack recording",
        description: "Record directly into a multitrack project with the arrange view and transport still in front of you.",
      },
      {
        title: "Track arm and input monitoring",
        description: "Arm tracks, monitor inputs, and keep recording decisions tied to the project instead of a hidden setup layer.",
      },
      {
        title: "Audio device and I/O control",
        description: "Configure driver, sample rate, buffer size, and I/O routing from the app's device settings.",
      },
      {
        title: "Metronome, tempo, and loop control",
        description: "Keep timing, click, and loop setup within the same session workflow while writing or tracking.",
      },
    ],
  },
  {
    id: "editing",
    label: "Editing",
    title: "Editing",
    description:
      "OpenStudio keeps editing practical and visible so arrangement cleanup and clip-level decisions can happen quickly under real session pressure.",
    screenshot: screenshots.heroTimeline,
    items: [
      {
        title: "Timeline editing",
        description: "Trim, split, move, duplicate, fade, and align clips in a canvas timeline built for direct manipulation.",
      },
      {
        title: "Markers, regions, and navigation",
        description: "Organize the session with markers and regions while keeping the bigger song structure readable.",
      },
      {
        title: "Clip properties and detail control",
        description: "Adjust clip name, fades, mute, lock, and related properties without leaving the project context.",
      },
      {
        title: "Undo, redo, and command-driven workflow",
        description: "Use undo history, keyboard shortcuts, and a command palette to keep editing fast and recoverable.",
      },
    ],
  },
  {
    id: "midi-and-instruments",
    label: "MIDI & Instruments",
    title: "MIDI & Instruments",
    description:
      "The MIDI side is not a bolt-on afterthought. It lives alongside audio tracks as part of the same production environment.",
    screenshot: screenshots.pianoRoll,
    items: [
      {
        title: "MIDI tracks and clips",
        description: "Write and arrange MIDI inside the same project as recorded audio and plugin-based instruments.",
      },
      {
        title: "Piano roll editing",
        description: "Edit note timing, placement, and structure in the piano roll without breaking the larger arrangement view.",
      },
      {
        title: "Virtual keyboard and MIDI devices",
        description: "Use hardware MIDI input or the on-screen keyboard when you want ideas to move into the session quickly.",
      },
      {
        title: "Instrument track workflow",
        description: "Create instrument tracks and load virtual instruments inside the same track-and-mixer ecosystem as audio.",
      },
    ],
  },
  {
    id: "mixing",
    label: "Mixing",
    title: "Mixing",
    description:
      "Mix decisions stay readable because the mixer is treated like a real working surface, not a simplified afterthought.",
    standout: "Detached mixer behavior keeps the mix visible while the arrange view stays open.",
    screenshot: screenshots.channelStripCloseup,
    items: [
      {
        title: "Channel strips and metering",
        description: "Read levels, balance tracks, and inspect channel state in a mixer built around real mix feedback.",
      },
      {
        title: "Detached mixer workflow",
        description: "Keep the mixer open in its own window when you want mixing and arranging visible at the same time.",
      },
      {
        title: "Master bus control",
        description: "Control master volume, pan, mono state, and master FX as part of the same mix workflow.",
      },
      {
        title: "Mix-ready session control",
        description: "Use solo, mute, grouping, automation visibility, and track selection tools without leaving the mixer context.",
      },
    ],
  },
  {
    id: "routing-and-monitoring",
    label: "Routing & Monitoring",
    title: "Routing & Monitoring",
    description:
      "Signal flow matters. OpenStudio exposes the practical routing and monitoring pieces that keep a project usable as it grows.",
    screenshot: screenshots.automationLanes,
    items: [
      {
        title: "Input FX, track FX, and master FX",
        description: "Process audio at the right stage of the chain instead of flattening everything into a single insert list.",
      },
      {
        title: "Track sends",
        description: "Build send-based routing with per-send control inside the same mixer and track workflow.",
      },
      {
        title: "Track input and output routing",
        description: "Choose recording sources and direct tracks through a clearer I/O path than a barebones DAW setup.",
      },
      {
        title: "Monitoring-aware capture flow",
        description: "Keep track arm, monitoring, routing, and transport decisions close while recording.",
      },
    ],
  },
  {
    id: "plugins-and-fx",
    label: "Plugins & FX",
    title: "Plugins & FX",
    description:
      "Plugin workflow should feel native to the session, from scanning and loading to editing and keeping windows where you need them.",
    standout: "Native plugin windows help the session feel like a desktop production tool, not just a flat panel UI.",
    screenshot: screenshots.pluginHostingFx,
    items: [
      {
        title: "VST3, CLAP, and LV2 hosting",
        description: "Load supported plugin formats directly into the project instead of being limited to one narrow ecosystem.",
      },
      {
        title: "Native plugin windows",
        description: "Open plugin editors in their own windows and keep them close to the tracks and mix decisions they affect.",
      },
      {
        title: "Plugin browser and scanning",
        description: "Search and load available plugins through a dedicated browser rather than a hidden utility step.",
      },
      {
        title: "Built-in effects and scriptable processors",
        description: "Use built-in processing and JSFX-style Lua-capable processors alongside hosted plugins in the same chain.",
      },
    ],
  },
  {
    id: "pitch-and-audio-workflows",
    label: "Pitch & Audio",
    title: "Pitch & Audio Workflows",
    description:
      "Pitch work is treated as part of production, not as an export-and-return task once the rest of the session is already moving.",
    standout: "Pitch editing and correction are built directly into the broader session workflow.",
    screenshot: screenshots.pitchEditor,
    items: [
      {
        title: "Graphical pitch editor",
        description: "Inspect notes and contours visually, then reshape pitch decisions without leaving the project.",
      },
      {
        title: "Real-time pitch correction",
        description: "Use a built-in pitch-correction FX path for live or immediate corrective work inside the mix and track workflow.",
      },
      {
        title: "Polyphonic pitch detection",
        description: "Take advantage of deeper analysis tools where the material asks for more than a simple monophonic read.",
      },
      {
        title: "Optional ARA hosting support",
        description: "ARA-capable plugin hosting is part of the architecture, with wording kept conservative where host depth can vary by setup.",
      },
    ],
  },
  {
    id: "stem-separation",
    label: "Stem Separation",
    title: "Stem Separation",
    description:
      "Separation is presented as a production tool inside the DAW, not as an isolated export to another utility with no path back into the project.",
    standout: "Once the optional AI tools are installed, separation can feed directly into editing, arrangement, and mix work.",
    screenshot: screenshots.arrangementOverviewWide,
    items: [
      {
        title: "Built into the DAW workflow",
        description: "Separate material inside OpenStudio and keep the resulting parts inside the session instead of round-tripping to an external app.",
      },
      {
        title: "6-stem separation path",
        description: "Current workflow targets vocals, drums, bass, guitar, piano, and other.",
      },
      {
        title: "Optional AI install",
        description: "Stem separation is enabled through an in-app AI tools install, so the base app stays lean and the install story stays honest.",
      },
      {
        title: "Creative and corrective use",
        description: "Use separated material for remix prep, cleanup, practice, arrangement changes, and further processing inside the same project.",
      },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    title: "Automation",
    description:
      "Automation is part of shaping the production over time, not a buried advanced menu you only find after the mix is already fighting back.",
    screenshot: screenshots.automationLanes,
    items: [
      {
        title: "Automation lanes",
        description: "Open automation lanes and edit level or parameter movement where it belongs: inside the timeline.",
      },
      {
        title: "Automation modes",
        description: "Support for read, write, touch, and latch gives the automation workflow more depth than a simple static envelope.",
      },
      {
        title: "Track and master automation context",
        description: "Keep automation visible across tracks and the master path when the mix needs movement instead of fixed settings.",
      },
    ],
  },
  {
    id: "scripting-and-extensibility",
    label: "Scripting",
    title: "Scripting & Extensibility",
    description:
      "OpenStudio is not locked to a single narrow workflow. It exposes scripting and processor-level extensibility for users who want to push deeper.",
    standout: "Lua scripting is a real part of the product, not just a placeholder line in a roadmap.",
    screenshot: screenshots.scriptingView,
    items: [
      {
        title: "Lua script editor",
        description: "Write and run Lua scripts from a dedicated script editor inside the app.",
      },
      {
        title: "Script access to tracks, transport, FX, MIDI, and automation",
        description: "The Lua API reaches into practical session operations instead of only offering a cosmetic macro surface.",
      },
      {
        title: "Processor-level extensibility",
        description: "JSFX-style and Lua-capable processing paths make it possible to extend the production workflow beyond stock controls.",
      },
    ],
  },
  {
    id: "export-and-project-formats",
    label: "Export",
    title: "Export & Project Formats",
    description:
      "Delivery matters as much as creation, so export and project persistence should feel like part of finishing the work, not an afterthought.",
    screenshot: screenshots.exportDialog,
    items: [
      {
        title: "Offline render and export",
        description: "Render to WAV, AIFF, or FLAC from inside the project when the session is ready to leave the app.",
      },
      {
        title: "Project persistence",
        description: "Save current projects as .osproj while continuing to open legacy .s13 sessions.",
      },
      {
        title: "Presets, themes, and peak caches",
        description: "Project-adjacent assets such as FX presets, themes, and waveform cache files are treated as part of a serious desktop workflow.",
      },
    ],
  },
  {
    id: "workflow-and-interface",
    label: "Workflow",
    title: "Workflow & Interface",
    description:
      "The product combines a native engine with a modern UI layer so the surface can stay fast, visual, and flexible without pretending to be a browser app first.",
    screenshot: screenshots.pluginHostingInstrument,
    items: [
      {
        title: "Native desktop architecture",
        description: "A JUCE C++ audio engine and a React interface let the app feel modern without giving up native DAW fundamentals.",
      },
      {
        title: "Command palette and shortcuts",
        description: "Move through the app with keyboard-first tools when the session benefits from faster command access.",
      },
      {
        title: "Clip launcher and alternate views",
        description: "Session workflow is not limited to one static arrange-only view.",
      },
      {
        title: "Theme and interface flexibility",
        description: "The interface is built with enough flexibility to support broader workflow and appearance customization.",
      },
    ],
  },
];

export const proofBarItems = featureHighlights;

export const workflowCards = [
  {
    title: "Build",
    description: "Write parts, record takes, and keep the project moving before the idea cools off.",
    items: ["MIDI and instruments", "Native recording", "Timeline editing"],
  },
  {
    title: "Shape",
    description: "Use the deeper tools when the session needs them, not as a separate export round-trip.",
    items: ["Stem separation", "Pitch editing", "Plugin windows"],
  },
  {
    title: "Finish",
    description: "Mix, automate, route, and render from the same project once the production is ready to land.",
    items: ["Detached mixer", "Automation and sends", "Export workflow"],
  },
];

export const featureChapters: FeatureChapter[] = [
  {
    id: "arrangement",
    label: "Arrangement",
    eyebrow: "Module 01 / session control",
    title: "The arrangement canvas stays fast, visual, and edit-heavy.",
    description:
      "The site should frame arrangement as the core surface: capture, edit, navigate, and reshape the session without breaking flow.",
    screenshot: screenshots.heroTimeline,
    accent: "lavender",
    standout: "Timeline editing, clip precision, and session navigation are treated as first-class workflow, not setup overhead.",
    rail: ["Non-destructive editing", "Multitrack recording", "Markers and transport"],
    items: [
      featureCategories.find((item) => item.id === "recording")!.items[0]!,
      featureCategories.find((item) => item.id === "editing")!.items[0]!,
      featureCategories.find((item) => item.id === "editing")!.items[1]!,
      featureCategories.find((item) => item.id === "recording")!.items[3]!,
    ],
  },
  {
    id: "midi",
    label: "MIDI",
    eyebrow: "Module 02 / composition",
    title: "MIDI writing and instruments feel like part of the same room.",
    description:
      "Piano roll, instrument tracks, and quick idea capture should sit beside the rest of the session rather than acting like a detached subsystem.",
    screenshot: screenshots.pianoRoll,
    accent: "amber",
    rail: ["Piano roll editing", "Instrument tracks", "Human-first input"],
    items: [
      featureCategories.find((item) => item.id === "midi-and-instruments")!.items[0]!,
      featureCategories.find((item) => item.id === "midi-and-instruments")!.items[1]!,
      featureCategories.find((item) => item.id === "midi-and-instruments")!.items[2]!,
      featureCategories.find((item) => item.id === "midi-and-instruments")!.items[3]!,
    ],
  },
  {
    id: "mixer",
    label: "Mixer",
    eyebrow: "Module 03 / sonic architecture",
    title: "The mixer is panoramic, readable, and built for actual finishing work.",
    description:
      "Mixing needs a more cinematic treatment than a plain feature list, so the redesign groups channel strips, routing, and metering into one continuous chapter.",
    screenshot: screenshots.mixerMeters,
    accent: "emerald",
    standout: "Detached mixer behavior and clear routing turn the mix surface into a real second vantage point on the session.",
    rail: ["Channel strips", "Routing and sends", "Detached view"],
    items: [
      featureCategories.find((item) => item.id === "mixing")!.items[0]!,
      featureCategories.find((item) => item.id === "mixing")!.items[1]!,
      featureCategories.find((item) => item.id === "routing-and-monitoring")!.items[0]!,
      featureCategories.find((item) => item.id === "routing-and-monitoring")!.items[1]!,
    ],
  },
  {
    id: "engine",
    label: "Engine",
    eyebrow: "Module 04 / engine and plugins",
    title: "Plugins, pitch workflows, and deeper processing stay inside the production surface.",
    description:
      "This chapter connects hosting, pitch, and stem-aware depth into one premium story about keeping advanced tools inside the project.",
    screenshot: screenshots.pluginHostingPitchAra,
    accent: "lavender",
    standout: "Native plugin windows and built-in pitch depth keep advanced moments close to the arrangement instead of off in utility popups.",
    rail: ["VST3 / CLAP / LV2", "Pitch workflows", "Optional stem depth"],
    items: [
      featureCategories.find((item) => item.id === "plugins-and-fx")!.items[0]!,
      featureCategories.find((item) => item.id === "plugins-and-fx")!.items[1]!,
      featureCategories.find((item) => item.id === "pitch-and-audio-workflows")!.items[0]!,
      featureCategories.find((item) => item.id === "stem-separation")!.items[1]!,
    ],
  },
  {
    id: "automation",
    label: "Automation",
    eyebrow: "Module 05 / extensibility",
    title: "Automation and scripting give the session a programmable edge.",
    description:
      "The final chapter should land on extensibility: automation lanes, command flow, scripting, and export readiness as the finishing layer of the product story.",
    screenshot: screenshots.scriptingView,
    accent: "amber",
    rail: ["Automation lanes", "Lua scripting", "Export readiness"],
    items: [
      featureCategories.find((item) => item.id === "automation")!.items[0]!,
      featureCategories.find((item) => item.id === "automation")!.items[1]!,
      featureCategories.find((item) => item.id === "scripting-and-extensibility")!.items[0]!,
      featureCategories.find((item) => item.id === "export-and-project-formats")!.items[0]!,
    ],
  },
];

export const galleryScreenshots = [
  screenshots.heroTimeline,
  screenshots.pluginHostingFx,
  screenshots.pianoRoll,
  screenshots.fxChainBrowser,
  screenshots.exportDialog,
];

export const premiumGalleryScreenshots = [
  screenshots.arrangementOverviewWide,
  screenshots.recordingSession,
  screenshots.automationLanes,
  screenshots.pluginHostingInstrument,
  screenshots.pluginHostingPitchAra,
  screenshots.channelStripCloseup,
];

export const featuresFinalCta = {
  eyebrow: "Go further",
  title: "See the differentiated workflows in context.",
  description:
    "Browse the stem separation story in detail, or go straight to the current public download and install path.",
  primaryCta: {
    label: "Explore Stem Separation",
    to: "/stem-separation",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
};
