import { screenshots } from "@/data/screenshots";
import type {
  ActionLink,
  FeatureChapter,
  FeatureChapterStory,
  FeatureSceneFragment,
  FeatureStageMedia,
  FeatureTransitionProfile,
  SeoMeta,
} from "@/data/marketing";
import type { ScreenshotAsset } from "@/data/screenshots";

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
  title: "OpenStudio Features | Recording, MIDI, Mixing & Stem Separation",
  description:
    "Explore the full OpenStudio DAW feature set — recording, MIDI instruments, pitch editing, audio mixing, plugin hosting (VST3/CLAP/LV2/ARA2), stem separation, and Lua scripting.",
  path: "/features",
  keywords: [
    "daw features",
    "music production software",
    "audio editing software",
    "audio mixing software",
    "midi software",
    "plugin hosting daw",
    "vst3 daw",
    "stem separation daw",
    "music recording software",
  ],
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
    standout: "Lua scripting is a real part of the product, not just a roadmap note.",
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

type FeatureChapterBlueprint = Omit<FeatureChapter, "sceneBase" | "sceneFragments" | "storyPanel" | "transitionProfile"> & {
  stagePrimary: FeatureStageMedia;
  stageSecondary: FeatureStageMedia;
  stageDetail?: FeatureStageMedia;
  story: FeatureChapterStory;
  transition?: {
    motionPreset?: "drift-left" | "drift-right" | "plunge";
    rotationIntensity?: number;
    burnSeed?: number;
  };
  numeral?: string;
  introTitle?: string;
  introTagline?: string;
};

const featureChapterBlueprints: FeatureChapterBlueprint[] = [
  {
    id: "arrangement",
    label: "Arrangement",
    eyebrow: "Module 01 / session control",
    screenshot: screenshots.heroTimeline,
    accent: "lavender",
    numeral: "I",
    introTitle: "Arrangement",
    introTagline: "Stay in the flow.",
    stagePrimary: {
      asset: screenshots.arrangementStageWide,
      label: "Arrangement overview",
      caption: "A wide session view anchors the chapter so the timeline feels like a real working surface.",
      tone: "lavender",
    },
    stageSecondary: {
      asset: screenshots.arrangementStagePanel,
      label: "Live capture",
      caption: "Tracking stays close to the transport, armed tracks, and arrangement context.",
      tone: "emerald",
    },
    stageDetail: {
      asset: screenshots.arrangementStageDetail,
      label: "Edit-ready timeline",
      caption: "Clip edits, waveform detail, and timeline control stay visible at the same time.",
      tone: "frost",
    },
    story: {
      title: "The arrangement canvas stays fast, visual, and edit-heavy.",
      description:
        "The site should frame arrangement as the core surface: capture, edit, navigate, and reshape the session without breaking flow.",
      standout:
        "Timeline editing, clip precision, and session navigation are treated as first-class workflow, not setup overhead.",
      rail: ["Non-destructive editing", "Multitrack recording", "Markers and transport"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Why it matters",
          title: "The first chapter should feel immediate.",
          description: "Users should read this as a live session surface, not a generic brochure screenshot floating in space.",
          tone: "lavender",
        },
        {
          eyebrow: "Working signal",
          title: "Composition and capture share one stage.",
          description: "Transport, takes, and structural editing remain visible enough to inspect on a large display.",
          metric: "01 / Build",
          tone: "emerald",
        },
      ],
      items: [
        featureCategories.find((item) => item.id === "recording")!.items[0]!,
        featureCategories.find((item) => item.id === "editing")!.items[0]!,
        featureCategories.find((item) => item.id === "editing")!.items[1]!,
        featureCategories.find((item) => item.id === "recording")!.items[3]!,
      ],
    },
    transition: {
      motionPreset: "drift-right",
      rotationIntensity: 1.04,
      burnSeed: 0.17,
    },
    scrollSpan: 212,
    density: 1.05,
  },
  {
    id: "midi",
    label: "MIDI",
    eyebrow: "Module 02 / composition",
    screenshot: screenshots.pianoRoll,
    accent: "amber",
    numeral: "II",
    introTitle: "MIDI",
    introTagline: "Write together.",
    stagePrimary: {
      asset: screenshots.midiStageWide,
      label: "Piano roll focus",
      caption: "The note editor should feel large enough to inspect, not like a thumbnail attached to copy.",
      tone: "amber",
    },
    stageSecondary: {
      asset: screenshots.midiStagePanel,
      label: "Instrument hosting",
      caption: "Plugins stay visible beside the arrangement instead of collapsing into a utility step.",
      tone: "lavender",
    },
    stageDetail: {
      asset: screenshots.midiStageDetail,
      label: "Session continuity",
      caption: "MIDI belongs in the same production room as audio capture and arrangement.",
      tone: "emerald",
    },
    story: {
      title: "MIDI writing and instruments feel like part of the same room.",
      description:
        "Piano roll, instrument tracks, and quick idea capture should sit beside the rest of the session rather than acting like a detached subsystem.",
      rail: ["Piano roll editing", "Instrument tracks", "Human-first input"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Composition",
          title: "The writing surface stays tactile.",
          description: "Grid, notes, and controller context stay large and legible while the surrounding story keeps moving.",
          tone: "amber",
        },
        {
          eyebrow: "Workflow payoff",
          title: "Instrument work stays adjacent to the song.",
          description: "This chapter should prove OpenStudio is not splitting instruments into a disconnected mode.",
          metric: "02 / Compose",
          tone: "lavender",
        },
      ],
      items: [
        featureCategories.find((item) => item.id === "midi-and-instruments")!.items[0]!,
        featureCategories.find((item) => item.id === "midi-and-instruments")!.items[1]!,
        featureCategories.find((item) => item.id === "midi-and-instruments")!.items[2]!,
        featureCategories.find((item) => item.id === "midi-and-instruments")!.items[3]!,
      ],
    },
    transition: {
      motionPreset: "drift-left",
      rotationIntensity: 0.98,
      burnSeed: 0.31,
    },
    scrollSpan: 204,
    density: 1,
  },
  {
    id: "mixer",
    label: "Mixer",
    eyebrow: "Module 03 / sonic architecture",
    screenshot: screenshots.mixerMeters,
    accent: "emerald",
    numeral: "III",
    introTitle: "Mixer",
    introTagline: "Mix panoramic.",
    stagePrimary: {
      asset: screenshots.mixerStageWide,
      label: "Mixer panorama",
      caption: "Wide metering and strip visibility make the mix feel panoramic instead of compressed.",
      tone: "emerald",
    },
    stageSecondary: {
      asset: screenshots.mixerStagePanel,
      label: "Channel detail",
      caption: "A close-up detail layer reinforces that the mixer is dense enough for finishing work.",
      tone: "lavender",
    },
    stageDetail: {
      asset: screenshots.mixerStageDetail,
      label: "Signal path",
      caption: "Routing, FX decisions, and insert visibility support the mix story rather than living elsewhere.",
      tone: "frost",
    },
    story: {
      title: "The mixer is panoramic, readable, and built for actual finishing work.",
      description:
        "Mixing needs a more cinematic treatment than a plain feature list, so the redesign groups channel strips, routing, and metering into one continuous chapter.",
      standout:
        "Detached mixer behavior and clear routing turn the mix surface into a real second vantage point on the session.",
      rail: ["Channel strips", "Routing and sends", "Detached view"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Mix perspective",
          title: "The page needs a second viewpoint.",
          description: "Detached mixing and clearer strip density make this chapter feel like a real workstation moment.",
          tone: "emerald",
        },
        {
          eyebrow: "Finishing pass",
          title: "Routing belongs in the same cinematic frame.",
          description: "Meters, inserts, sends, and buses should read as one continuous surface rather than isolated bullets.",
          metric: "03 / Finish",
          tone: "lavender",
        },
      ],
      items: [
        featureCategories.find((item) => item.id === "mixing")!.items[0]!,
        featureCategories.find((item) => item.id === "mixing")!.items[1]!,
        featureCategories.find((item) => item.id === "routing-and-monitoring")!.items[0]!,
        featureCategories.find((item) => item.id === "routing-and-monitoring")!.items[1]!,
      ],
    },
    transition: {
      motionPreset: "plunge",
      rotationIntensity: 1.12,
      burnSeed: 0.49,
    },
    scrollSpan: 216,
    density: 1.1,
  },
  {
    id: "engine",
    label: "Engine",
    eyebrow: "Module 04 / engine and plugins",
    screenshot: screenshots.pluginHostingPitchAra,
    accent: "lavender",
    numeral: "IV",
    introTitle: "Engine",
    introTagline: "Go deeper.",
    stagePrimary: {
      asset: screenshots.engineStageWide,
      label: "Advanced plugin workflow",
      caption: "Deep plugin moments should still feel like they belong to the same session narrative.",
      tone: "lavender",
    },
    stageSecondary: {
      asset: screenshots.engineStagePanel,
      label: "Pitch workflow",
      caption: "Pitch shaping stays inside production instead of forcing a round-trip into a separate utility.",
      tone: "amber",
    },
    stageDetail: {
      asset: screenshots.engineStageDetail,
      label: "FX hosting",
      caption: "Hosted effects and native windows keep technical depth close to the tracks they change.",
      tone: "emerald",
    },
    story: {
      title: "Plugins, pitch workflows, and deeper processing stay inside the production surface.",
      description:
        "This chapter connects hosting, pitch, and stem-aware depth into one premium story about keeping advanced tools inside the project.",
      standout:
        "Native plugin windows and built-in pitch depth keep advanced moments close to the arrangement instead of off in utility popups.",
      rail: ["VST3 / CLAP / LV2", "Pitch workflows", "Optional stem depth"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Depth",
          title: "Advanced tools should not break the story.",
          description: "Pitch, hosting, and stem-aware workflows need oversized media so they feel premium instead of buried.",
          tone: "lavender",
        },
        {
          eyebrow: "Engine signal",
          title: "The DAW keeps complex moments nearby.",
          description: "This is where OpenStudio should feel most differentiated from a flat marketing surface.",
          metric: "04 / Deepen",
          tone: "amber",
        },
      ],
      items: [
        featureCategories.find((item) => item.id === "plugins-and-fx")!.items[0]!,
        featureCategories.find((item) => item.id === "plugins-and-fx")!.items[1]!,
        featureCategories.find((item) => item.id === "pitch-and-audio-workflows")!.items[0]!,
        featureCategories.find((item) => item.id === "stem-separation")!.items[1]!,
      ],
    },
    transition: {
      motionPreset: "drift-right",
      rotationIntensity: 1.08,
      burnSeed: 0.63,
    },
    scrollSpan: 212,
    density: 0.96,
  },
  {
    id: "automation",
    label: "Automation",
    eyebrow: "Module 05 / extensibility",
    screenshot: screenshots.scriptingView,
    accent: "amber",
    numeral: "V",
    introTitle: "Automation",
    introTagline: "Close with intent.",
    stagePrimary: {
      asset: screenshots.automationStageWide,
      label: "Automation lanes",
      caption: "The finishing chapter closes with visible movement rather than a purely textual promise.",
      tone: "amber",
    },
    stageSecondary: {
      asset: screenshots.automationStagePanel,
      label: "Workflow tooling",
      caption: "A supporting tooling crop holds this spot until a dedicated scripting screenshot is available.",
      tone: "lavender",
    },
    stageDetail: {
      asset: screenshots.automationStageDetail,
      label: "Export readiness",
      caption: "The story exits cleanly into rendering and delivery from the same environment.",
      tone: "emerald",
    },
    story: {
      title: "Automation and scripting give the session a programmable edge.",
      description:
        "The final chapter should land on extensibility: automation lanes, command flow, scripting, and export readiness as the finishing layer of the product story.",
      rail: ["Automation lanes", "Lua scripting", "Export readiness"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Control",
          title: "This chapter should feel like finishing, not setup.",
          description: "Automation, scripting, and export are presented as the layer that lets the session land with intent.",
          tone: "amber",
        },
        {
          eyebrow: "Close-out",
          title: "The scroll story ends in actionable output.",
          description: "The final state should naturally hand off into download or deeper product exploration.",
          metric: "05 / Ship",
          tone: "emerald",
        },
      ],
      items: [
        featureCategories.find((item) => item.id === "automation")!.items[0]!,
        featureCategories.find((item) => item.id === "automation")!.items[1]!,
        featureCategories.find((item) => item.id === "scripting-and-extensibility")!.items[0]!,
        featureCategories.find((item) => item.id === "export-and-project-formats")!.items[0]!,
      ],
    },
    transition: {
      motionPreset: "drift-left",
      rotationIntensity: 0.94,
      burnSeed: 0.79,
    },
    scrollSpan: 190,
    density: 0.9,
  },
];

type CuratedFeatureAssetPack = {
  hero: ScreenshotAsset;
  motion: ScreenshotAsset;
  detail: ScreenshotAsset;
  matte: ScreenshotAsset;
};

const curatedFeatureAssets: Record<FeatureChapterBlueprint["id"], CuratedFeatureAssetPack> = {
  arrangement: {
    hero: screenshots.arrangementOverviewWide,
    motion: screenshots.recordingSession,
    detail: screenshots.automationLanes,
    matte: screenshots.studioStageComposite,
  },
  midi: {
    hero: screenshots.pianoRoll,
    motion: screenshots.recordingSession,
    detail: screenshots.pluginHostingInstrument,
    matte: screenshots.heroCompositeDark,
  },
  mixer: {
    hero: screenshots.mixerMeters,
    motion: screenshots.channelStripCloseup,
    detail: screenshots.fxChainBrowser,
    matte: screenshots.mixBusComposite,
  },
  engine: {
    hero: screenshots.pluginHostingPitchAra,
    motion: screenshots.pitchEditor,
    detail: screenshots.pluginHostingFx,
    matte: screenshots.pitchWorkflowComposite,
  },
  automation: {
    hero: screenshots.automationLanes,
    motion: screenshots.scriptingView,
    detail: screenshots.exportDialog,
    matte: screenshots.studioStageComposite,
  },
};

const sceneFragmentLayouts: Record<string, Array<FeatureSceneFragment["layout"]>> = {
  arrangement: ["inset-right", "inset-left"],
  midi: ["inset-right", "inset-left"],
  mixer: ["inset-right", "inset-left"],
  engine: ["inset-right", "inset-left"],
  automation: ["inset-right", "inset-left"],
};

const transitionProfiles: Record<string, Omit<FeatureTransitionProfile, "burnSeed" | "depthIntensity">> = {
  arrangement: {
    entryDirection: "right",
    collapseStart: 0.18,
    voidPeak: 0.56,
    arrivalStart: 0.72,
    settleEnd: 0.88,
    edgeAngle: -6,
    edgeRoughness: 1.26,
    charWidth: 0.072,
    emberWidth: 0.018,
    smokeStrength: 0.28,
    spreadDepth: 1.34,
    shellIgnitionDelay: 0.1,
    degradationDensity: 0.92,
    tearAmount: 0.54,
    particleDrift: 0.62,
    voidShape: "orb",
    voidScale: 1.02,
    remnantStrength: 0.82,
    contourExtraction: 0.76,
    bridgeHold: 0.17,
    arrivalStyle: "glide",
    pointerDepthProfile: "stage",
    collapseMaskSrc: "/assets/openstudio/feature-story/transitions/arrangement-collapse-mask.png",
    remnantMaskSrc: "/assets/openstudio/feature-story/transitions/arrangement-remnant-mask.png",
    voidBridgeSrc: "/assets/openstudio/feature-story/transitions/arrangement-void-bridge.png",
    arrivalMatteSrc: "/assets/openstudio/feature-story/transitions/arrangement-arrival-matte.png",
    authoredBridge: {
      collapseFieldSrc:
        "/assets/openstudio/feature-story/transitions/reference-match/arrangement-to-midi/collapse-field.png",
      remnantEtchedSrc:
        "/assets/openstudio/feature-story/transitions/reference-match/arrangement-to-midi/remnant-etched.png",
      voidCoreSrc: "/assets/openstudio/feature-story/transitions/reference-match/arrangement-to-midi/void-core.png",
      voidEdgeSrc: "/assets/openstudio/feature-story/transitions/reference-match/arrangement-to-midi/void-edge.png",
      arrivalMatteSrc:
        "/assets/openstudio/feature-story/transitions/reference-match/arrangement-to-midi/arrival-matte.png",
      coreScale: 1.18,
      edgeScale: 1.12,
      arrivalDelay: 0,
      arrivalComposition: "midi-tableau",
      pointerDepthStrength: 1.56,
    },
    fragmentLag: 0.08,
  },
  midi: {
    entryDirection: "left",
    collapseStart: 0.18,
    voidPeak: 0.56,
    arrivalStart: 0.72,
    settleEnd: 0.88,
    edgeAngle: 186,
    edgeRoughness: 1.32,
    charWidth: 0.078,
    emberWidth: 0.02,
    smokeStrength: 0.26,
    spreadDepth: 1.36,
    shellIgnitionDelay: 0.1,
    degradationDensity: 0.94,
    tearAmount: 0.58,
    particleDrift: 0.66,
    voidShape: "eclipse",
    voidScale: 1.06,
    remnantStrength: 0.84,
    contourExtraction: 0.82,
    bridgeHold: 0.16,
    arrivalStyle: "glide",
    pointerDepthProfile: "deep",
    collapseMaskSrc: "/assets/openstudio/feature-story/transitions/midi-collapse-mask.png",
    remnantMaskSrc: "/assets/openstudio/feature-story/transitions/midi-remnant-mask.png",
    voidBridgeSrc: "/assets/openstudio/feature-story/transitions/midi-void-bridge.png",
    arrivalMatteSrc: "/assets/openstudio/feature-story/transitions/midi-arrival-matte.png",
    authoredBridge: {
      collapseFieldSrc: "/assets/openstudio/feature-story/transitions/reference-match/midi-to-mixer/collapse-field.png",
      remnantEtchedSrc: "/assets/openstudio/feature-story/transitions/reference-match/midi-to-mixer/remnant-etched.png",
      voidCoreSrc: "/assets/openstudio/feature-story/transitions/reference-match/midi-to-mixer/void-core.png",
      voidEdgeSrc: "/assets/openstudio/feature-story/transitions/reference-match/midi-to-mixer/void-edge.png",
      arrivalMatteSrc: "/assets/openstudio/feature-story/transitions/reference-match/midi-to-mixer/arrival-matte.png",
      coreScale: 1.2,
      edgeScale: 1.14,
      arrivalDelay: 0,
      arrivalComposition: "mixer-tableau",
      pointerDepthStrength: 1.58,
    },
    fragmentLag: 0.1,
  },
  mixer: {
    entryDirection: "plunge",
    collapseStart: 0.18,
    voidPeak: 0.56,
    arrivalStart: 0.72,
    settleEnd: 0.88,
    edgeAngle: -12,
    edgeRoughness: 1.38,
    charWidth: 0.084,
    emberWidth: 0.022,
    smokeStrength: 0.32,
    spreadDepth: 1.42,
    shellIgnitionDelay: 0.12,
    degradationDensity: 1.02,
    tearAmount: 0.66,
    particleDrift: 0.74,
    voidShape: "veil",
    voidScale: 1.14,
    remnantStrength: 0.92,
    contourExtraction: 0.88,
    bridgeHold: 0.15,
    arrivalStyle: "lift",
    pointerDepthProfile: "deep",
    collapseMaskSrc: "/assets/openstudio/feature-story/transitions/mixer-collapse-mask.png",
    remnantMaskSrc: "/assets/openstudio/feature-story/transitions/mixer-remnant-mask.png",
    voidBridgeSrc: "/assets/openstudio/feature-story/transitions/mixer-void-bridge.png",
    arrivalMatteSrc: "/assets/openstudio/feature-story/transitions/mixer-arrival-matte.png",
    authoredBridge: {
      collapseFieldSrc: "/assets/openstudio/feature-story/transitions/reference-match/mixer-to-engine/collapse-field.png",
      remnantEtchedSrc: "/assets/openstudio/feature-story/transitions/reference-match/mixer-to-engine/remnant-etched.png",
      voidCoreSrc: "/assets/openstudio/feature-story/transitions/reference-match/mixer-to-engine/void-core.png",
      voidEdgeSrc: "/assets/openstudio/feature-story/transitions/reference-match/mixer-to-engine/void-edge.png",
      arrivalMatteSrc: "/assets/openstudio/feature-story/transitions/reference-match/mixer-to-engine/arrival-matte.png",
      coreScale: 1.2,
      edgeScale: 1.12,
      arrivalDelay: 0,
      arrivalComposition: "engine-tableau",
      pointerDepthStrength: 1.6,
    },
    fragmentLag: 0.08,
  },
  engine: {
    entryDirection: "right",
    collapseStart: 0.18,
    voidPeak: 0.56,
    arrivalStart: 0.72,
    settleEnd: 0.88,
    edgeAngle: -4,
    edgeRoughness: 1.24,
    charWidth: 0.07,
    emberWidth: 0.018,
    smokeStrength: 0.24,
    spreadDepth: 1.32,
    shellIgnitionDelay: 0.1,
    degradationDensity: 0.9,
    tearAmount: 0.5,
    particleDrift: 0.58,
    voidShape: "shard",
    voidScale: 0.98,
    remnantStrength: 0.78,
    contourExtraction: 0.72,
    bridgeHold: 0.16,
    arrivalStyle: "bloom",
    pointerDepthProfile: "stage",
    collapseMaskSrc: "/assets/openstudio/feature-story/transitions/engine-collapse-mask.png",
    remnantMaskSrc: "/assets/openstudio/feature-story/transitions/engine-remnant-mask.png",
    voidBridgeSrc: "/assets/openstudio/feature-story/transitions/engine-void-bridge.png",
    arrivalMatteSrc: "/assets/openstudio/feature-story/transitions/engine-arrival-matte.png",
    authoredBridge: {
      collapseFieldSrc:
        "/assets/openstudio/feature-story/transitions/reference-match/engine-to-automation/collapse-field.png",
      remnantEtchedSrc:
        "/assets/openstudio/feature-story/transitions/reference-match/engine-to-automation/remnant-etched.png",
      voidCoreSrc: "/assets/openstudio/feature-story/transitions/reference-match/engine-to-automation/void-core.png",
      voidEdgeSrc: "/assets/openstudio/feature-story/transitions/reference-match/engine-to-automation/void-edge.png",
      arrivalMatteSrc:
        "/assets/openstudio/feature-story/transitions/reference-match/engine-to-automation/arrival-matte.png",
      coreScale: 1.18,
      edgeScale: 1.12,
      arrivalDelay: 0,
      arrivalComposition: "automation-tableau",
      pointerDepthStrength: 1.54,
    },
    fragmentLag: 0.09,
  },
  automation: {
    entryDirection: "left",
    collapseStart: 0.18,
    voidPeak: 0.56,
    arrivalStart: 0.72,
    settleEnd: 0.88,
    edgeAngle: 184,
    edgeRoughness: 1.3,
    charWidth: 0.074,
    emberWidth: 0.018,
    smokeStrength: 0.26,
    spreadDepth: 1.36,
    shellIgnitionDelay: 0.1,
    degradationDensity: 0.96,
    tearAmount: 0.6,
    particleDrift: 0.68,
    voidShape: "eclipse",
    voidScale: 1.08,
    remnantStrength: 0.86,
    contourExtraction: 0.8,
    bridgeHold: 0.15,
    arrivalStyle: "lift",
    pointerDepthProfile: "stage",
    collapseMaskSrc: "/assets/openstudio/feature-story/transitions/automation-collapse-mask.png",
    remnantMaskSrc: "/assets/openstudio/feature-story/transitions/automation-remnant-mask.png",
    voidBridgeSrc: "/assets/openstudio/feature-story/transitions/automation-void-bridge.png",
    arrivalMatteSrc: "/assets/openstudio/feature-story/transitions/automation-arrival-matte.png",
    fragmentLag: 0.1,
  },
};

export const featureChapters: FeatureChapter[] = featureChapterBlueprints.map((chapter) => {
  const fragmentLayouts = sceneFragmentLayouts[chapter.id] ?? ["inset-right", "inset-left"];
  const curatedAssets = curatedFeatureAssets[chapter.id];
  const sceneFragments = [
    curatedAssets.motion
      ? {
          id: `${chapter.id}-fragment-motion`,
          layout: fragmentLayouts[0]!,
          blend: "normal",
          softness: "crisp",
          asset: curatedAssets.motion,
          label: chapter.stageSecondary.label,
          caption: chapter.stageSecondary.caption,
          tone: chapter.stageSecondary.tone,
          sceneRole: "motion",
          mediaType: "image",
        }
      : null,
    curatedAssets.detail
      ? {
          id: `${chapter.id}-fragment-detail`,
          layout: fragmentLayouts[1] ?? "inset-left",
          blend: "normal",
          softness: "crisp",
          asset: curatedAssets.detail,
          label: chapter.stageDetail?.label,
          caption: chapter.stageDetail?.caption,
          tone: chapter.stageDetail?.tone,
          sceneRole: "detail",
          mediaType: "image",
        }
      : null,
  ].filter(Boolean) as FeatureSceneFragment[];

  const entryDirection =
    chapter.transition?.motionPreset === "drift-left"
      ? "left"
      : chapter.transition?.motionPreset === "plunge"
        ? "plunge"
        : "right";

  return {
    id: chapter.id,
    label: chapter.label,
    eyebrow: chapter.eyebrow,
    screenshot: chapter.screenshot,
    accent: chapter.accent,
    sceneBase: {
      asset: curatedAssets.hero,
      label: chapter.stagePrimary.label,
      caption: chapter.stagePrimary.caption,
      tone: chapter.stagePrimary.tone,
      focalPosition: curatedAssets.hero.focalPosition,
      sceneRole: "hero",
      mediaType: "image",
    },
    sceneFragments,
    storyPanel: chapter.story,
    details: chapter.details,
    transitionProfile: {
      entryDirection,
      depthIntensity: chapter.transition?.rotationIntensity ?? 1,
      burnSeed: chapter.transition?.burnSeed,
      arrivalMatteSrc: curatedAssets.matte.src,
      ...transitionProfiles[chapter.id],
      curatedMatteSrc: curatedAssets.matte.src,
    },
    scrollSpan: chapter.scrollSpan,
    density: chapter.density,
    numeral: chapter.numeral,
    introTitle: chapter.introTitle,
    introTagline: chapter.introTagline,
  };
});

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
    "Browse the AI workflow story in detail, or go straight to the current public download and install path.",
  primaryCta: {
    label: "Explore AI",
    to: "/ai",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
};
