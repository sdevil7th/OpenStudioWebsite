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
  title: "OpenStudio Features | Free NAM Guitar Rig & Full DAW",
  description:
    "Explore OpenStudio's free NAM A1/A2 guitar rig, native pedals, and cabinet IRs inside a full DAW, with an AmpliTube, Guitar Rig, and Neural DSP comparison.",
  path: "/features",
  lastModified: "2026-07-28",
  image: screenshots.namRackHero.src,
  imageAlt: screenshots.namRackHero.alt,
};

export const featurePageHero = {
  eyebrow: "Features",
  title: "A broad DAW feature set, with deeper workflows where they matter.",
  description:
    "OpenStudio covers the expected ground, then goes deeper with a built-in NAM A1/A2 guitar rig, optional AI tools, pitch editing, native plugin windows, detached mixing, and scripting in one production environment.",
};

export const featureHighlights = [
  "Built-in NAM A1/A2 rig",
  "Optional AI tools",
  "Graphical pitch editing",
  "Detached mixer workflow",
  "Native plugin windows",
  "Lua scripting",
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
      "Plugin scanning, loading, native editors, presets, A/B states, MIDI learn, and FX chains stay close to the session they affect.",
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
    label: "AI Tools",
    title: "AI Tools",
    description:
      "AI features are presented as production tools inside the DAW, not as isolated exports to another utility with no path back into the project.",
    standout: "BS Roformer, ACE-Step, and Stable Audio 3 stay behind explicit setup choices so the base app stays lean.",
    screenshot: screenshots.arrangementOverviewWide,
    items: [
      {
        title: "Built into the DAW workflow",
        description: "Separate material inside OpenStudio and keep the resulting parts inside the session instead of round-tripping to an external app.",
      },
      {
        title: "BS Roformer stem separation",
        description: "Stem separation targets vocals, drums, bass, guitar, piano, and other through the explicit AI tools setup.",
      },
      {
        title: "Optional AI install",
        description: "Stem separation and ACE-Step are enabled through in-app AI tools setup. Stable Audio 3 is a separate manual snapshot import and runtime setup.",
      },
      {
        title: "ACE-Step and Stable Audio paths",
        description: "ACE-Step handles prompt and lyrics text-to-music. Stable Audio 3 handles text-to-audio and source-conditioned workflows after its separate import.",
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
      "Delivery is part of the production flow, with project persistence, render options, queues, stems, regions, and common audio formats available from the session.",
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
    description: "Use stem separation, pitch editing, hosted plugins, and clip-based AI workflows while keeping the result inside the project.",
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
      caption: "Timeline, ruler, grid, playhead, waveforms, MIDI thumbnails, zoom, scroll, and time selection stay in one working view.",
      tone: "lavender",
    },
    stageSecondary: {
      asset: screenshots.arrangementStagePanel,
      label: "Live capture",
      caption: "Audio and MIDI recording stay connected to armed tracks, input monitoring, punch ranges, loop, tempo, and metronome control.",
      tone: "emerald",
    },
    stageDetail: {
      asset: screenshots.arrangementStageDetail,
      label: "Edit-ready timeline",
      caption: "Move, trim, split, fade, group, slip, reverse, normalize, time-stretch, and pitch-shift clips without leaving the arrangement.",
      tone: "frost",
    },
    story: {
      title: "Record, edit, and arrange from the same timeline.",
      description:
        "OpenStudio treats the timeline as the session hub: multitrack audio, MIDI recording, transport, loop, punch, tempo, metronome, waveform detail, and clip editing all remain visible while the project moves.",
      standout:
        "Ripple edits, razor areas, takes, fades, grouping, time selection, and undoable command flow make arrangement work feel like production, not setup.",
      rail: ["Multitrack recording", "Ripple and razor edits", "Takes, fades, and transport"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Session control",
          title: "Capture begins inside the arrangement.",
          description: "Track arm, input monitoring, punch range, record modes, loop, tempo, metronome, and transport decisions sit beside the material being recorded.",
          tone: "lavender",
        },
        {
          eyebrow: "Editing depth",
          title: "Structural edits stay close to the song.",
          description: "Grid snapping, time selection, ripple modes, razor edits, takes, fades, and clip properties are presented as normal timeline work.",
          metric: "01 / Build",
          tone: "emerald",
        },
      ],
      items: [
        {
          title: "Multitrack audio and MIDI recording",
          description: "Record audio or MIDI with armed tracks, input monitoring, punch ranges, record modes, and completed clip handoff.",
        },
        {
          title: "Timeline editing",
          description: "Move, resize, trim, split, duplicate, nudge, copy, paste, and delete clips with grid, snap, zoom, and waveform context.",
        },
        {
          title: "Ripple, razor, takes, and fades",
          description: "Use ripple modes, razor areas, time-selection edits, clip fades, clip properties, take workflows, slip edit, and grouping.",
        },
        {
          title: "Tempo, markers, and transport",
          description: "Keep loop, seek, rewind, tempo, tap tempo, time signature, tempo markers, metronome, and auto-scroll tied to the song.",
        },
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
      caption: "Docked or detached piano roll sessions expose notes, velocity, CC lanes, pitch bend, range editing, and controller detail.",
      tone: "amber",
    },
    stageSecondary: {
      asset: screenshots.midiStagePanel,
      label: "Instrument hosting",
      caption: "Instrument tracks, quick-add instruments, virtual keyboard input, MIDI routing, and plugin editors stay attached to the project.",
      tone: "lavender",
    },
    stageDetail: {
      asset: screenshots.midiStageDetail,
      label: "Session continuity",
      caption: "MIDI import, export, project MIDI export, quantize, note transforms, and audio-to-MIDI conversion keep composition editable.",
      tone: "emerald",
    },
    story: {
      title: "MIDI composition is built into the session.",
      description:
        "OpenStudio carries MIDI tracks, instrument tracks, piano roll editing, virtual keyboard input, import/export, MIDI output routing, quantize, note transforms, CC lanes, pitch bend, and audio-to-MIDI into the same production surface.",
      rail: ["Piano roll", "Instrument tracks", "Audio to MIDI"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Composition",
          title: "Notes and controller data stay editable.",
          description: "Draw, move, resize, select, cut, copy, paste, and transform notes while velocity, CC, pitch bend, and lane preferences remain visible.",
          tone: "amber",
        },
        {
          eyebrow: "Workflow payoff",
          title: "Audio can become MIDI when the idea needs it.",
          description: "The Basic Pitch / ONNX path can create a generated MIDI track from source audio where the native runtime is available.",
          metric: "02 / Compose",
          tone: "lavender",
        },
      ],
      items: [
        {
          title: "Docked and detached piano roll",
          description: "Edit notes, velocity, CC lanes, pitch bend, visible lanes, ranges, and inspector-style note detail in a focused MIDI editor.",
        },
        {
          title: "Quantize and transforms",
          description: "Use quantize, freeze/reset quantize, transpose, octave transpose, velocity scale, reverse, invert, and snap-to-scale operations.",
        },
        {
          title: "Instrument tracks and routing",
          description: "Create MIDI and instrument tracks, route MIDI output, use the virtual keyboard, and open instrument/plugin editors in context.",
        },
        {
          title: "MIDI import, export, and audio-to-MIDI",
          description: "Import/export MIDI, export project MIDI, and generate MIDI from audio clips with undo support where the analysis path is available.",
        },
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
      caption: "Mixer panel, channel strips, master strip, master track, metering, clipping state, and reset actions stay visible for mix decisions.",
      tone: "emerald",
    },
    stageSecondary: {
      asset: screenshots.mixerStagePanel,
      label: "Channel detail",
      caption: "Track controls cover volume, pan, mute, solo, arm, monitoring, record-safe, channel count, playback offset, and output channels.",
      tone: "lavender",
    },
    stageDetail: {
      asset: screenshots.mixerStageDetail,
      label: "Signal path",
      caption: "Sends, buses, routing matrix, sidechains, stereo width, phase invert, pan law, and snapshots make routing inspectable.",
      tone: "frost",
    },
    story: {
      title: "Mixing, routing, and metering get a real workstation surface.",
      description:
        "The mixer brings channel strips, master controls, detached mixer windows, sends, buses, routing matrix, sidechain assignment, metering, snapshots, channel EQ, and automation context into one readable mix layer.",
      standout:
        "Detached mixer behavior and routing visibility make the mix feel like a second vantage point on the same session, not a separate utility.",
      rail: ["Detached mixer", "Sends and buses", "Routing matrix"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Mix perspective",
          title: "The mixer can become its own working view.",
          description: "Detached mixer windows keep levels, strips, and master decisions visible while the arrangement remains available.",
          tone: "emerald",
        },
        {
          eyebrow: "Finishing pass",
          title: "Routing is visible enough to trust.",
          description: "Sends, buses, routing matrix, sidechains, stereo width, phase invert, pan law, and snapshots make signal flow explicit.",
          metric: "03 / Finish",
          tone: "lavender",
        },
      ],
      items: [
        {
          title: "Channel strips and master bus",
          description: "Control volume, pan, mute, solo, arm, input monitoring, record-safe state, channel count, master mono, and master automation.",
        },
        {
          title: "Sends, buses, and routing matrix",
          description: "Build send-based routing, create bus/group tracks, inspect the routing matrix, and assign sidechain sources into plugins.",
        },
        {
          title: "Metering and channel EQ",
          description: "Read peak/RMS meters, master meter clusters, clipping state, channel EQ, loudness, phase correlation, and spectrum bridge data.",
        },
        {
          title: "Mixer snapshots",
          description: "Save, recall, delete, sync, and undo mixer snapshot recalls for mix-state comparison.",
        },
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
      caption: "VST3 hosting, native plugin editors, plugin parameters, preset load/save, A/B compare, MIDI learn, and FX chain presets stay in session.",
      tone: "lavender",
    },
    stageSecondary: {
      asset: screenshots.engineStagePanel,
      label: "Pitch workflow",
      caption: "Graphical pitch editing, YIN analysis, note blobs, drift, vibrato, transition, draw/split tools, preview, and pitch corrector FX are built in.",
      tone: "amber",
    },
    stageDetail: {
      asset: screenshots.engineStageDetail,
      label: "FX hosting",
      caption: "Optional AI tools add stem separation, ACE-Step music generation, Stable Audio 3 workflows, variation, inpaint, and continuation when installed.",
      tone: "emerald",
    },
    story: {
      title: "Plugins, pitch, FX, and optional AI stay inside the project.",
      description:
        "OpenStudio combines VST3 hosting, CLAP/LV2 code-path support, native plugin windows, input/track/master/monitoring FX chains, built-in processors, graphical pitch editing, and optional local AI workflows without forcing a round-trip out of the DAW.",
      standout:
        "AI generation and stem workflows depend on installed runtimes, local hardware, model availability, and licenses, while the base DAW remains lean.",
      rail: ["VST3 hosting", "Pitch editor", "Optional local AI"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Depth",
          title: "Plugin and FX chains stay editable.",
          description: "Scan/load plugins, open native editors, edit parameters, save states and presets, compare A/B states, and map MIDI controls.",
          tone: "lavender",
        },
        {
          eyebrow: "Engine signal",
          title: "Pitch and AI are production tools, not exports.",
          description: "Pitch analysis, correction, stem separation, text-to-music, text-to-audio, variation, inpaint, and continuation can feed the session.",
          metric: "04 / Deepen",
          tone: "amber",
        },
      ],
      items: [
        {
          title: "Plugin hosting and FX chains",
          description: "Host VST3 plugins, use CLAP/LV2 code paths, manage native editors, presets, A/B states, MIDI learn, and FX chain presets.",
        },
        {
          title: "Built-in processors",
          description: "Use EQ, compressor, gate, limiter, delay, reverb, chorus, saturator, pitch corrector, instrument processors, and oversampling controls.",
        },
        {
          title: "Graphical pitch workflow",
          description: "Edit pitch blobs, contours, drift, vibrato, transitions, scale snapping, preview, scrub, and rendered pitch-correction segments.",
        },
        {
          title: "Optional local AI",
          description: "Use stem separation, ACE-Step music generation, Stable Audio 3 audio generation, variation, inpaint, and continuation after runtime setup.",
        },
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
    id: "nam-rack",
    label: "NAM Rack",
    eyebrow: "Module 05 / guitar production",
    screenshot: screenshots.namRackUi,
    accent: "frost",
    numeral: "V",
    introTitle: "NAM Rack",
    introTagline: "Plug in. Stay in the project.",
    stagePrimary: {
      asset: screenshots.namRackUi,
      label: "A1/A2 capture stage",
      caption: "Load local A1 or A2 amp-only and full-rig NAM captures, then keep the complete tone with the session.",
      tone: "frost",
    },
    stageSecondary: {
      asset: screenshots.namRackPreFx,
      label: "Native pedalboard",
      caption: "Compressor, Tape Echo, Mono Octaver, Precision Drive, and Distortion are the five pedals shown before the capture.",
      tone: "amber",
    },
    stageDetail: {
      asset: screenshots.namRackPostFx,
      label: "Cabinet and studio effects",
      caption: "Cabinet IRs and shaping feed reorderable EQ, modulation, delay, reverb, and shimmer before output metering.",
      tone: "emerald",
    },
    story: {
      title: "A complete guitar rig, inside the project.",
      description:
        "Load local NAM A1 or A2 amp-only and full-rig captures, shape them with native pedals and cabinet IRs, then record, automate, recall, and render the complete signal chain in the same OpenStudio session.",
      standout:
        "OpenStudio and the NAM Rack have no paid tier. Third-party capture and IR licenses still apply, and authenticated TONE3000 delivery requires a TONE3000 account.",
      rail: ["NAM A1 + A2", "Native pedalboard", "Cabinet + project recall"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Signal flow",
          title: "The whole playable rig travels with the session.",
          description:
            "Input conditioning, native pre-effects, the NAM capture, cabinet shaping, and studio post-effects remain one inspectable route beside the take, automation, and mix.",
          tone: "frost",
        },
        {
          eyebrow: "Safe by design",
          title: "Tone changes stay out of the real-time hot path.",
          description:
            "Prepared model and IR swaps, model-rate handling, fixed latency, crossfades, and separate capture calibration keep the processor dependable in a live project.",
          metric: "05 / Track",
          tone: "emerald",
        },
      ],
      items: [
        {
          title: "Correct audible path",
          description:
            "Input trim → gate → compressor → tape echo → mono octaver → Precision Drive → distortion → A1/A2 amp or full-rig capture → cabinet IR and shaping → reorderable EQ, modulation, delay, reverb → output trim and meters. The tuner observes the input without joining the audible path.",
        },
        {
          title: "Amp-only and full-rig cabinet behavior",
          description:
            "Use a separate cabinet IR for amp-only captures, or bypass the extra cabinet for full-rig captures while preserving the previous cabinet choice for later recall.",
        },
        {
          title: "Calibration, presets, and restore",
          description:
            "Keep interface calibration separate from creative trim, compare A/B states, save presets, restore models and IRs with the project, recover missing media, and use the same graph for offline render.",
        },
        {
          title: "Optional TONE3000 account delivery",
          description:
            "Connect a TONE3000 account for authenticated, attributed delivery through the current Latest, Trending, and Downloaded online views, alongside local Installed and Favorites views. Richer catalog access is not promised without written scope approval.",
        },
      ],
    },
    transition: {
      motionPreset: "drift-left",
      rotationIntensity: 1.02,
      burnSeed: 0.71,
    },
    scrollSpan: 214,
    density: 1,
  },
  {
    id: "automation",
    label: "Automation",
    eyebrow: "Module 06 / extensibility",
    screenshot: screenshots.scriptingView,
    accent: "amber",
    numeral: "VI",
    introTitle: "Automation",
    introTagline: "Close with intent.",
    stagePrimary: {
      asset: screenshots.automationStageWide,
      label: "Automation lanes",
      caption: "Track and master automation lanes support read, write, touch, latch, manual point editing, range replace, and envelope management.",
      tone: "amber",
    },
    stageSecondary: {
      asset: screenshots.automationStagePanel,
      label: "Workflow tooling",
      caption: "Command palette, shortcuts, menus, screensets, themes, toolbar editor, custom actions, macros, and mouse modifiers shape the working surface.",
      tone: "lavender",
    },
    stageDetail: {
      asset: screenshots.automationStageDetail,
      label: "Export readiness",
      caption: "Render master, stems, selected items, tracks, razor areas, regions, queues, DDP, batch conversion, and project MIDI from the same project.",
      tone: "emerald",
    },
    story: {
      title: "Automation, scripting, and delivery close the production loop.",
      description:
        "OpenStudio finishes with track/master automation, command workflows, Lua scripting, S13FX/JSFX-style processors, render queues, region/stem export, batch conversion, DDP paths, project templates, themes, and project delivery tools.",
      rail: ["Automation lanes", "Lua and JSFX", "Render and delivery"],
    },
    details: {
      callouts: [
        {
          eyebrow: "Control",
          title: "Movement is editable across the project.",
          description: "Read, write, touch, latch, manual point editing, range replace, backend sync, and envelope management cover track and master automation.",
          tone: "amber",
        },
        {
          eyebrow: "Close-out",
          title: "The same session can be scripted, rendered, and delivered.",
          description: "Lua/API scripting, JSFX-style effects, render queues, region matrices, stems, selected item renders, DDP, and batch conversion support finishing work.",
          metric: "06 / Ship",
          tone: "emerald",
        },
      ],
      items: [
        {
          title: "Track and master automation",
          description: "Open lanes, edit points, replace ranges, sync backend envelopes, and keep movement tied to the timeline.",
        },
        {
          title: "Lua, S13FX, and JSFX-style extension",
          description: "Run Lua scripts, use the script editor and console, and extend processing through S13FX/JSFX-style paths.",
        },
        {
          title: "Workflow customization",
          description: "Use command palette, shortcuts, screensets, theme editor, toolbar editor, custom actions, macros, and mouse modifiers.",
        },
        {
          title: "Render and project delivery",
          description: "Render WAV, AIFF, FLAC, MP3, OGG, stems, selected items, tracks, razor areas, regions, queues, DDP, and project MIDI.",
        },
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
  "nam-rack": {
    hero: screenshots.namRackUi,
    motion: screenshots.namRackPreFx,
    detail: screenshots.namRackPostFx,
    matte: screenshots.namRackHero,
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
  "nam-rack": ["inset-right", "inset-left"],
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
    fragmentLag: 0.09,
  },
  "nam-rack": {
    entryDirection: "left",
    collapseStart: 0.18,
    voidPeak: 0.56,
    arrivalStart: 0.72,
    settleEnd: 0.88,
    edgeAngle: 188,
    edgeRoughness: 1.28,
    charWidth: 0.074,
    emberWidth: 0.018,
    smokeStrength: 0.24,
    spreadDepth: 1.34,
    shellIgnitionDelay: 0.1,
    degradationDensity: 0.92,
    tearAmount: 0.56,
    particleDrift: 0.64,
    voidShape: "veil",
    voidScale: 1.04,
    remnantStrength: 0.82,
    contourExtraction: 0.78,
    bridgeHold: 0.16,
    arrivalStyle: "glide",
    pointerDepthProfile: "stage",
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

export const tone3000Feature = {
  eyebrow: "Optional account delivery",
  title: "Reach TONE3000 without turning its catalog into ours.",
  description:
    "Sign up or sign in through TONE3000’s browser-based OAuth flow, then request A1/A2 captures from the current Latest, Trending, and Downloaded online views. Installed captures and Favorites remain available as local library views, with creator attribution and license context visible.",
  points: [
    "A TONE3000 account is required only for authenticated TONE3000 delivery.",
    "Requested downloads come from TONE3000; OpenStudio does not bulk-download, mirror, proxy, or re-host the catalog.",
    "Richer catalog search is not promised unless TONE3000 confirms that endpoint scope for OpenStudio in writing.",
  ],
  screenshot: screenshots.tone3000Browser,
  mobileScreenshot: screenshots.tone3000BrowserMobile,
  caption:
    "Development review UI shown with deterministic mock records; production delivery remains authenticated, user-requested, attributed, and subject to each capture creator’s license.",
  termsHref: "https://www.tone3000.com/api/terms",
};

export const guitarRigComparison = {
  eyebrow: "A fair category comparison",
  title: "OpenStudio compared with AmpliTube, Guitar Rig, and Neural DSP.",
  description:
    "People looking for an AmpliTube alternative, a Guitar Rig alternative, or a Neural DSP alternative are often comparing different product shapes, not just tones. AmpliTube CS and Guitar Rig Player have useful free editions, while Neural DSP offers trials. OpenStudio's distinction is that its complete open-source NAM Rack and the recording, arranging, mixing, automation, and rendering workflow remain free together.",
  products: ["OpenStudio NAM Rack", "AmpliTube 5 / CS", "Guitar Rig 7 / Player", "Neural DSP plug-ins"],
  rows: [
    {
      label: "Product shape",
      values: [
        "Guitar rack inside a full DAW project.",
        "Standalone and plug-in guitar/bass suite with a focused recorder.",
        "Modular standalone and plug-in amp/effects rack.",
        "Separate artist, amp, and bass suites in standalone or plug-in form.",
      ],
    },
    {
      label: "Base cost / free limit",
      values: [
        "Free and open source; no paid NAM Rack tier.",
        "CS is permanently free with limited gear and a 2-track recorder; paid editions expand both.",
        "Player is free with 2 amps, 26 effects/tools, and 60 presets; Pro is paid.",
        "Paid per title, with unrestricted 14-day trials and no permanent free plug-in tier.",
      ],
    },
    {
      label: "Open source",
      values: [
        "Yes. OpenStudio is AGPLv3; the NAM core is MIT-licensed.",
        "No; proprietary.",
        "No; proprietary.",
        "No public open-source release.",
      ],
    },
    {
      label: "Native NAM A1/A2",
      values: [
        "Yes—local A1 and A2 amp-only or full-rig .nam models.",
        "No vendor-documented native .nam A1/A2 import; TONEX uses IK Tone Models.",
        "No vendor-documented native .nam A1/A2 import.",
        "No vendor-documented native .nam A1/A2 import.",
      ],
    },
    {
      label: "Custom capture / IR",
      values: [
        "Loads local .nam captures and local cabinet IRs; it is a player, not a capture trainer.",
        "Loads TONEX Tone Models; capture creation uses TONEX Modeler. Custom IR loading starts above CS.",
        "No user amp-capture importer; custom cabinet IR loading is Pro-only.",
        "Curated amp rigs per title; guitar and bass plug-ins support custom IRs.",
      ],
    },
    {
      label: "Pedals / effects",
      values: [
        "Native pre-pedals, cabinet shaping, EQ, modulation, delay, reverb, and shimmer.",
        "Large stomp, rack, room, cabinet, and mixer-effect ecosystem; CS includes a subset.",
        "Flexible modular chains; Player is limited while Pro carries the larger catalog.",
        "Polished title-specific pedals, amps, cabinets, and studio effects.",
      ],
    },
    {
      label: "Full DAW context",
      values: [
        "Yes—multitrack recording, arranging, editing, routing, mixing, automation, and offline render.",
        "Focused 2-/8-track guitar recorder rather than a general-purpose production DAW.",
        "No full DAW; recording and production need a host.",
        "No full DAW; recording and production need a host.",
      ],
    },
    {
      label: "Account / activation",
      values: [
        "No OpenStudio license account or activation. A TONE3000 account is optional for that integration.",
        "IK account plus product registration and authorization.",
        "Native ID and Native Access for download and activation.",
        "Neural DSP account linked to iLok activation.",
      ],
    },
    {
      label: "Where the commercial option wins",
      values: [
        "Trade-off: younger implementation, fewer bundled licensed tones and presets, and less mature commercial support.",
        "Large branded catalog, deep cabinet/mic routing, TONEX/ToneNET, controller workflows, and paid support.",
        "Mature modular UX, broad Pro catalog, established presets, looper, and ecosystem.",
        "Highly curated artist/brand suites, polished presets, focused support, and Cortex compatibility for supported titles.",
      ],
    },
  ],
  note:
    "Comparison checked 27 July 2026 from current vendor documentation. Product names are used only for factual comparison; OpenStudio is not affiliated with IK Multimedia, Native Instruments, Neural DSP, or TONE3000.",
  sources: [
    {
      label: "AmpliTube 5 editions",
      href: "https://www.ikmultimedia.com/products/amplitube5/",
    },
    {
      label: "Guitar Rig 7 Player",
      href: "https://www.native-instruments.com/en/products/komplete/guitar/guitar-rig-7-player/",
    },
    {
      label: "Guitar Rig comparison",
      href: "https://www.native-instruments.com/en/products/komplete/guitar/guitar-rig-7-player/comparison-chart/",
    },
    {
      label: "Neural DSP plug-ins",
      href: "https://neuraldsp.com/plugins",
    },
    {
      label: "Neural DSP activation",
      href: "https://neuraldsp.com/getting-started/downloading-installing-and-activating-plugins",
    },
    {
      label: "TONE3000 API terms",
      href: "https://www.tone3000.com/api/terms",
    },
    {
      label: "NAM A2 guide",
      href: "https://www.tone3000.com/guides/nam-a2-the-complete-guide",
    },
    {
      label: "NeuralAmpModelerCore A2 release",
      href: "https://github.com/sdatkinson/NeuralAmpModelerCore/releases/tag/v0.5.2",
    },
  ],
};

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
