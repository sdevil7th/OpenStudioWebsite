/**
 * Screenshot asset contract
 *
 * Runtime source folder:
 * public/assets/openstudio/screenshots/
 *
 * Keep page components data-driven by editing this file instead of hardcoding
 * image paths in route components. Missing files intentionally degrade to the
 * labeled placeholder UI in ScreenshotFrame, so local development and release
 * prep stay usable while final product captures are still being collected.
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
    | "mixBusComposite";
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
    src: "/assets/openstudio/screenshots/scripting-view.png",
    alt: "OpenStudio scripting panel with Lua automation commands and workflow actions.",
    label: "Lua scripting",
    caption: "Automate repetitive operations and tailor workflows with Lua scripting hooks.",
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
    src: "/assets/openstudio/screenshots/clip-edit-detail.png",
    alt: "Close-up of OpenStudio clip editing with trims, splits, and timeline detail visible.",
    label: "Clip editing detail",
    caption: "Use a close-up editing shot for timeline and arrangement detail.",
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
    src: "/assets/openstudio/screenshots/project-browser.png",
    alt: "OpenStudio project browser or session management interface with project assets visible.",
    label: "Project browser",
    caption: "Use for project/session management and workflow overview.",
    priority: "optional",
    orientation: "landscape",
    displayRatio: 16 / 10,
    fit: "cover",
    captionMode: "external",
    purpose: "Project management supporting screenshot.",
  },
  transportAndMarkers: {
    id: "transportAndMarkers",
    src: "/assets/openstudio/screenshots/transport-and-markers.png",
    alt: "OpenStudio transport and marker controls shown in a focused UI detail view.",
    label: "Transport and markers",
    caption: "A small supporting detail shot for hero and chapter transitions.",
    priority: "optional",
    orientation: "landscape",
    displayRatio: 16 / 10,
    fit: "cover",
    captionMode: "external",
    purpose: "Small supporting UI detail screenshot.",
  },
  heroCompositeDark: {
    id: "heroCompositeDark",
    src: "/assets/openstudio/screenshots/hero-composite-dark.png",
    alt: "A composed dark marketing render of OpenStudio combining multiple interface states.",
    label: "Hero composite",
    caption: "Optional premium composite for the most polished homepage presentation.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium hero composite render.",
  },
  studioStageComposite: {
    id: "studioStageComposite",
    src: "/assets/openstudio/screenshots/studio-stage-composite.png",
    alt: "An atmospheric OpenStudio product-stage composite render for interstitial use.",
    label: "Studio stage composite",
    caption: "Optional atmospheric render for premium interstitial sections.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium interstitial composite render.",
  },
  pitchWorkflowComposite: {
    id: "pitchWorkflowComposite",
    src: "/assets/openstudio/screenshots/pitch-workflow-composite.png",
    alt: "A high-end composite render focused on OpenStudio's pitch workflow.",
    label: "Pitch workflow composite",
    caption: "Optional premium render for the pitch chapter.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium pitch chapter render.",
  },
  mixBusComposite: {
    id: "mixBusComposite",
    src: "/assets/openstudio/screenshots/mix-bus-composite.png",
    alt: "A premium composed render of OpenStudio's mix and export environment.",
    label: "Mix bus composite",
    caption: "Optional premium render for mix and export storytelling.",
    priority: "optional",
    orientation: "wide",
    displayRatio: 16 / 9,
    fit: "cover",
    captionMode: "external",
    purpose: "Optional premium mix/export render.",
  },
};

export const screenshotList = Object.values(screenshots);

export const requiredScreenshotAssets = screenshotList.filter((item) => item.priority === "core");
export const recommendedScreenshotAssets = screenshotList.filter((item) => item.priority === "recommended");
export const optionalScreenshotAssets = screenshotList.filter((item) => item.priority === "optional");
