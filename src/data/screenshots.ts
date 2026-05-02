/**
 * Screenshot asset contract
 *
 * Runtime source folder:
 * public/assets/openstudio/screenshots/
 *
 * Keep page components data-driven by editing this file instead of hardcoding
 * image paths in route components. Launch validation fails when referenced
 * files are missing, so public pages never ship with broken proof media.
 */
export interface ScreenshotAsset {
  id:
    | "heroTimeline"
    | "mixerMeters"
    | "pianoRoll"
    | "pitchEditor"
    | "fxChainBrowser"
    | "exportDialog"
    | "scriptingView"
    | "arrangementOverviewWide"
    | "recordingSession"
    | "clipEditDetail"
    | "automationLanes"
    | "pluginHostingInstrument"
    | "pluginHostingFx"
    | "pluginHostingPitchAra"
    | "channelStripCloseup"
    | "projectBrowser"
    | "transportAndMarkers"
    | "heroCompositeDark"
    | "studioStageComposite"
    | "pitchWorkflowComposite"
    | "mixBusComposite"
    | "arrangementStageWide"
    | "arrangementStagePanel"
    | "arrangementStageDetail"
    | "midiStageWide"
    | "midiStagePanel"
    | "midiStageDetail"
    | "mixerStageWide"
    | "mixerStagePanel"
    | "mixerStageDetail"
    | "engineStageWide"
    | "engineStagePanel"
    | "engineStageDetail"
    | "automationStageWide"
    | "automationStagePanel"
    | "automationStageDetail"
    | "arrangementCuratedHero"
    | "arrangementCuratedSecondary"
    | "arrangementCuratedDetail"
    | "arrangementCuratedMatte"
    | "midiCuratedHero"
    | "midiCuratedSecondary"
    | "midiCuratedDetail"
    | "midiCuratedMatte"
    | "mixerCuratedHero"
    | "mixerCuratedSecondary"
    | "mixerCuratedDetail"
    | "mixerCuratedMatte"
    | "engineCuratedHero"
    | "engineCuratedSecondary"
    | "engineCuratedDetail"
    | "engineCuratedMatte"
    | "automationCuratedHero"
    | "automationCuratedSecondary"
    | "automationCuratedDetail"
    | "automationCuratedMatte";
  src: string;
  alt: string;
  label: string;
  caption: string;
  required?: boolean;
  priority?: "core" | "recommended" | "optional";
  orientation?: "landscape" | "portrait" | "wide";
  displayRatio?: number;
  fit?: "cover" | "contain";
  captionMode?: "external" | "overlay" | "hidden";
  focalPosition?: string;
  purpose?: string;
}

export const screenshots: Record<ScreenshotAsset["id"], ScreenshotAsset> = {
  heroTimeline: {
    id: "heroTimeline",
    src: "/assets/openstudio/screenshots/hero-timeline.png",
    alt: "OpenStudio multitrack timeline with waveform clips, edit handles, and transport controls.",
    label: "Timeline view",
    caption: "Fast arrangement, clip editing, and transport control in one native timeline.",
    required: true,
    priority: "core",
    orientation: "wide",
    displayRatio: 3838 / 2088,
    fit: "cover",
    captionMode: "external",
    purpose: "Primary hero and arrangement proof screenshot.",
  },
  mixerMeters: {
    id: "mixerMeters",
    src: "/assets/openstudio/screenshots/mixer-meters.png",
    alt: "OpenStudio mixer with channel strips, plug-in inserts, and output metering.",
    label: "Mixer and metering",
    caption: "Channel strips, insert chains, and metering stay visible while the session grows.",
    required: true,
    priority: "core",
    orientation: "landscape",
    displayRatio: 3838 / 574,
    fit: "contain",
    captionMode: "external",
    purpose: "Mix section and channel visibility proof screenshot.",
  },
  pianoRoll: {
    id: "pianoRoll",
    src: "/assets/openstudio/screenshots/piano-roll.png",
    alt: "OpenStudio piano roll editor with note blocks, grid divisions, and virtual keyboard.",
    label: "Piano roll",
    caption: "Write MIDI ideas with note editing, timing control, and keyboard-guided input.",
    required: true,
    priority: "core",
    orientation: "landscape",
    displayRatio: 3460 / 1672,
    fit: "cover",
    captionMode: "external",
    purpose: "MIDI composition proof screenshot.",
  },
  pitchEditor: {
    id: "pitchEditor",
    src: "/assets/openstudio/screenshots/pitch-editor.png",
    alt: "OpenStudio pitch editor showing note curves and correction controls on a vocal take.",
    label: "Pitch tools",
    caption: "Inspect, correct, and shape pitch data without leaving the project context.",
    required: true,
    priority: "core",
    orientation: "landscape",
    displayRatio: 3838 / 1183,
    fit: "cover",
    captionMode: "external",
    purpose: "Pitch workflow proof screenshot.",
  },
  fxChainBrowser: {
    id: "fxChainBrowser",
    src: "/assets/openstudio/screenshots/fx-chain-browser.png",
    alt: "OpenStudio effects browser with categories and a visible FX chain rack.",
    label: "FX browser",
    caption: "Built-in effects and hosted plug-ins can be chained into repeatable signal paths.",
    required: true,
    priority: "core",
    orientation: "landscape",
    displayRatio: 1813 / 1786,
    fit: "contain",
    captionMode: "external",
    purpose: "Effects and plugin-hosting proof screenshot.",
  },
  exportDialog: {
    id: "exportDialog",
    src: "/assets/openstudio/screenshots/export-dialog.png",
    alt: "OpenStudio export dialog with format, bitrate, and render options for final delivery.",
    label: "Export dialog",
    caption: "Render release-ready files in WAV, AIFF, or FLAC without a separate finishing step.",
    required: true,
    priority: "core",
    orientation: "portrait",
    displayRatio: 1057 / 1333,
    fit: "contain",
    captionMode: "external",
    purpose: "Export and release flow proof screenshot.",
  },
  scriptingView: {
    id: "scriptingView",
    src: "/assets/openstudio/screenshots/automation-lanes.png",
    alt: "OpenStudio automation lanes with parameter curves across the song timeline.",
    label: "Automation workflow",
    caption: "Shape detailed movement over time and keep power-user workflows close to the arrangement.",
    priority: "optional",
    orientation: "landscape",
    displayRatio: 16 / 10,
    fit: "cover",
    captionMode: "external",
    purpose: "Power-user workflow proof screenshot.",
  },
  arrangementOverviewWide: {
    id: "arrangementOverviewWide",
    src: "/assets/openstudio/screenshots/arrangement-overview-wide.png",
    alt: "Wide OpenStudio arrangement view showing the full song structure across multiple tracks.",
    label: "Arrangement overview",
    caption: "Use a wide arrangement shot for premium hero and stage transitions.",
    priority: "recommended",
    orientation: "wide",
    displayRatio: 3838 / 2088,
    fit: "cover",
    captionMode: "external",
    purpose: "Premium wide hero and stage image.",
  },
  recordingSession: {
    id: "recordingSession",
    src: "/assets/openstudio/screenshots/recording-session.png",
    alt: "OpenStudio recording session with armed tracks, transport, and live input activity.",
    label: "Recording session",
    caption: "Show the moment of capture with armed tracks and transport visibility.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 3838 / 2083,
    fit: "cover",
    captionMode: "external",
    purpose: "Capture-focused supporting screenshot.",
  },
  clipEditDetail: {
    id: "clipEditDetail",
    src: "/assets/openstudio/screenshots/hero-timeline.png",
    alt: "OpenStudio timeline with waveform clips, edit handles, and transport controls.",
    label: "Timeline detail",
    caption: "Timeline editing stays visible around clips, transport, and arrangement context.",
    priority: "optional",
    orientation: "landscape",
    displayRatio: 16 / 10,
    fit: "cover",
    captionMode: "external",
    purpose: "Editing detail supporting screenshot.",
  },
  automationLanes: {
    id: "automationLanes",
    src: "/assets/openstudio/screenshots/automation-lanes.png",
    alt: "OpenStudio automation lanes with parameter curves across the song timeline.",
    label: "Automation lanes",
    caption: "Support the editing and finishing story with clear automation visuals.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 3838 / 2083,
    fit: "cover",
    captionMode: "external",
    purpose: "Automation-focused supporting screenshot.",
  },
  pluginHostingInstrument: {
    id: "pluginHostingInstrument",
    src: "/assets/openstudio/screenshots/plugin-hosting-1.png",
    alt: "OpenStudio hosting an instrument plugin window alongside the main session interface.",
    label: "Instrument hosting",
    caption: "Keep instrument plugins open alongside the arrangement instead of hiding them behind a detached utility flow.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 1539 / 1132,
    fit: "contain",
    captionMode: "external",
    purpose: "Instrument plugin workflow screenshot.",
  },
  pluginHostingFx: {
    id: "pluginHostingFx",
    src: "/assets/openstudio/screenshots/plugin-hosting-2.png",
    alt: "OpenStudio hosting an effects plugin window alongside the main session interface.",
    label: "FX hosting",
    caption: "Native plugin windows keep effect decisions close to the tracks and mixer that they shape.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 1716 / 1095,
    fit: "contain",
    captionMode: "external",
    purpose: "Effects plugin workflow screenshot.",
  },
  pluginHostingPitchAra: {
    id: "pluginHostingPitchAra",
    src: "/assets/openstudio/screenshots/plugin-hosting-3.png",
    alt: "OpenStudio hosting an advanced pitch-focused plugin window inside the project workflow.",
    label: "Advanced plugin workflow",
    caption: "Optional deeper plugin workflows can stay part of the session instead of turning into a round-trip out of the DAW.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 2983 / 1936,
    fit: "contain",
    captionMode: "external",
    purpose: "Advanced plugin and pitch-oriented workflow screenshot.",
  },
  channelStripCloseup: {
    id: "channelStripCloseup",
    src: "/assets/openstudio/screenshots/channel-strip-closeup.png",
    alt: "Close-up of an OpenStudio channel strip with inserts, meters, and routing controls.",
    label: "Channel strip close-up",
    caption: "A detail shot for a more premium mix presentation.",
    priority: "recommended",
    orientation: "portrait",
    displayRatio: 823 / 513,
    fit: "contain",
    captionMode: "external",
    purpose: "Premium mixing detail screenshot.",
  },
  projectBrowser: {
    id: "projectBrowser",
    src: "/assets/openstudio/screenshots/arrangement-overview-wide.png",
    alt: "Wide OpenStudio arrangement view showing the full song structure across multiple tracks.",
    label: "Project overview",
    caption: "A wide arrangement view keeps project structure visible at a glance.",
    priority: "optional",
    orientation: "landscape",
    displayRatio: 16 / 10,
    fit: "cover",
    captionMode: "external",
    purpose: "Project management supporting screenshot.",
  },
  transportAndMarkers: {
    id: "transportAndMarkers",
    src: "/assets/openstudio/screenshots/hero-timeline.png",
    alt: "OpenStudio timeline with waveform clips, edit handles, and transport controls.",
    label: "Transport context",
    caption: "Transport and timeline context stay anchored while editing decisions move quickly.",
    priority: "optional",
    orientation: "landscape",
    displayRatio: 16 / 10,
    fit: "cover",
    captionMode: "external",
    purpose: "Small supporting UI detail screenshot.",
  },
  heroCompositeDark: {
    id: "heroCompositeDark",
    src: "/assets/openstudio/design-reference/home-hero-timeline.jpg",
    alt: "OpenStudio hero reference image built around the timeline and production workspace.",
    label: "Hero timeline reference",
    caption: "A polished timeline reference for homepage storytelling.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium hero composite render.",
  },
  studioStageComposite: {
    id: "studioStageComposite",
    src: "/assets/openstudio/design-reference/home-story-server.jpg",
    alt: "OpenStudio product reference image for the project story section.",
    label: "Project story reference",
    caption: "A supporting product reference for interstitial storytelling.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium interstitial composite render.",
  },
  pitchWorkflowComposite: {
    id: "pitchWorkflowComposite",
    src: "/assets/openstudio/screenshots/pitch-editor.png",
    alt: "OpenStudio pitch editor showing note curves and correction controls on a vocal take.",
    label: "Pitch workflow",
    caption: "Pitch editing stays grounded in the visible OpenStudio editor.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium pitch chapter render.",
  },
  mixBusComposite: {
    id: "mixBusComposite",
    src: "/assets/openstudio/screenshots/mixer-meters.png",
    alt: "OpenStudio mixer with channel strips, plug-in inserts, and output metering.",
    label: "Mix bus workflow",
    caption: "Mix and metering proof stays tied to the live product UI.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium mix/export render.",
  },
  arrangementStageWide: {
    id: "arrangementStageWide",
    src: "/assets/openstudio/feature-story/arrangement-stage-wide.png",
    alt: "Derived wide arrangement crop showing the OpenStudio session structure across multiple tracks.",
    label: "Arrangement story stage",
    caption: "A cleaned-up wide crop for the arrangement chapter's pinned stage.",
    priority: "recommended",
    orientation: "wide",
    displayRatio: 1600 / 1000,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story arrangement hero crop.",
  },
  arrangementStagePanel: {
    id: "arrangementStagePanel",
    src: "/assets/openstudio/feature-story/arrangement-stage-panel.png",
    alt: "Derived arrangement panel crop focusing on the timeline and pitch-aware editing area.",
    label: "Arrangement panel",
    caption: "A tighter crop for secondary movement in the arrangement chapter.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 1200 / 900,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story arrangement secondary panel.",
  },
  arrangementStageDetail: {
    id: "arrangementStageDetail",
    src: "/assets/openstudio/feature-story/arrangement-stage-detail.png",
    alt: "Derived recording-session crop highlighting track and transport context in OpenStudio.",
    label: "Arrangement detail",
    caption: "A supportive detail crop for the arrangement chapter.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 960 / 720,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story arrangement detail panel.",
  },
  midiStageWide: {
    id: "midiStageWide",
    src: "/assets/openstudio/feature-story/midi-stage-wide.png",
    alt: "Derived piano roll crop showing note blocks across the OpenStudio MIDI editor.",
    label: "MIDI story stage",
    caption: "A wide crop that keeps the note editor legible in the MIDI chapter.",
    priority: "recommended",
    orientation: "wide",
    displayRatio: 1600 / 1000,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story MIDI hero crop.",
  },
  midiStagePanel: {
    id: "midiStagePanel",
    src: "/assets/openstudio/feature-story/midi-stage-panel.png",
    alt: "Derived instrument-hosting crop showing a plugin window alongside the OpenStudio session.",
    label: "MIDI panel",
    caption: "A focused crop for plugin-assisted composition in the MIDI chapter.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 1200 / 900,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story MIDI secondary panel.",
  },
  midiStageDetail: {
    id: "midiStageDetail",
    src: "/assets/openstudio/feature-story/midi-stage-detail.png",
    alt: "Derived close piano-roll crop emphasizing note density and timing control in OpenStudio.",
    label: "MIDI detail",
    caption: "A tighter crop for MIDI note detail during the chapter transition.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 960 / 720,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story MIDI detail panel.",
  },
  mixerStageWide: {
    id: "mixerStageWide",
    src: "/assets/openstudio/feature-story/mixer-stage-wide.png",
    alt: "Derived effects-hosting crop showing a large plugin surface suited to the mixing chapter.",
    label: "Mixer story stage",
    caption: "A bigger, calmer crop for the mixer chapter's pinned scene.",
    priority: "recommended",
    orientation: "wide",
    displayRatio: 1600 / 1000,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story mixer hero crop.",
  },
  mixerStagePanel: {
    id: "mixerStagePanel",
    src: "/assets/openstudio/feature-story/mixer-stage-panel.png",
    alt: "Derived channel-strip close-up crop emphasizing tactile controls and mix detail in OpenStudio.",
    label: "Mixer panel",
    caption: "A more readable detail crop for the mix chapter's floating panel.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 1200 / 900,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story mixer secondary panel.",
  },
  mixerStageDetail: {
    id: "mixerStageDetail",
    src: "/assets/openstudio/feature-story/mixer-stage-detail.png",
    alt: "Derived mixer-meters crop highlighting channel visibility and session balance in OpenStudio.",
    label: "Mixer detail",
    caption: "A supporting crop for metering and routing detail.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 960 / 720,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story mixer detail panel.",
  },
  engineStageWide: {
    id: "engineStageWide",
    src: "/assets/openstudio/feature-story/engine-stage-wide.png",
    alt: "Derived advanced plugin workflow crop showing a larger pitch-oriented plugin state in OpenStudio.",
    label: "Engine story stage",
    caption: "A wide crop for the advanced-tools chapter.",
    priority: "recommended",
    orientation: "wide",
    displayRatio: 1600 / 1000,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story engine hero crop.",
  },
  engineStagePanel: {
    id: "engineStagePanel",
    src: "/assets/openstudio/feature-story/engine-stage-panel.png",
    alt: "Derived pitch-editor crop showing note and correction context inside OpenStudio.",
    label: "Engine panel",
    caption: "A tighter crop for pitch and analysis detail in the engine chapter.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 1200 / 900,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story engine secondary panel.",
  },
  engineStageDetail: {
    id: "engineStageDetail",
    src: "/assets/openstudio/feature-story/engine-stage-detail.png",
    alt: "Derived FX-hosting crop showing plugin controls and OpenStudio session adjacency.",
    label: "Engine detail",
    caption: "A supportive plugin crop for the advanced-tools chapter.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 960 / 720,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story engine detail panel.",
  },
  automationStageWide: {
    id: "automationStageWide",
    src: "/assets/openstudio/feature-story/automation-stage-wide.png",
    alt: "Derived automation-lanes crop showing parameter movement over time in OpenStudio.",
    label: "Automation story stage",
    caption: "A wide crop for the finishing and automation chapter.",
    priority: "recommended",
    orientation: "wide",
    displayRatio: 1600 / 1000,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story automation hero crop.",
  },
  automationStagePanel: {
    id: "automationStagePanel",
    src: "/assets/openstudio/feature-story/automation-stage-panel.png",
    alt: "Derived FX-browser crop showing modular processing controls in OpenStudio.",
    label: "Automation panel",
    caption: "A secondary crop for the finishing chapter with modular processing controls visible.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 1200 / 900,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story automation secondary panel.",
  },
  automationStageDetail: {
    id: "automationStageDetail",
    src: "/assets/openstudio/feature-story/automation-stage-detail.png",
    alt: "Derived export-dialog crop showing OpenStudio render options for final delivery.",
    label: "Automation detail",
    caption: "A delivery-focused detail crop for the last chapter.",
    priority: "recommended",
    orientation: "landscape",
    displayRatio: 960 / 720,
    fit: "cover",
    captionMode: "external",
    purpose: "Derived feature-story automation detail panel.",
  },
};

export const screenshotList = Object.values(screenshots);

export const requiredScreenshotAssets = screenshotList.filter((item) => item.priority === "core");
export const recommendedScreenshotAssets = screenshotList.filter((item) => item.priority === "recommended");
export const optionalScreenshotAssets = screenshotList.filter((item) => item.priority === "optional");
