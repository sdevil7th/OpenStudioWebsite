import { SHOTS, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: "Every track has FX chains, the chains hold built-in effects and third-party plugins, and the plugins come from a scan of the standard directories on your machine. This page covers all three, plus presets, bypass, safe mode, and what to do when a plugin refuses to appear or behave. Shortcuts are from the default OpenStudio keyboard profile; `Ctrl` is `Cmd` on macOS.",
    },

    { type: "h2", id: "fx-chain-architecture", text: "FX chain positions" },
    {
      type: "table",
      head: ["Chain", "Where it sits", "Typical use"],
      rows: [
        ["Input FX", "Before the track fader", "Input conditioning: EQ, compression, gating"],
        ["Track FX", "After the track fader", "Standard insert effects"],
        ["Master FX", "On the master bus output", "Mastering chain"],
      ],
    },
    {
      type: "p",
      text: "A monitoring FX chain also exists. To open a chain, click the **FX** button on a track header or channel strip; the FX Chain panel shows the current chain, and a chain type selector switches between Input FX and Track FX. The master chain opens from the FX button on the Master strip. Chain presets can be saved and loaded for track, input, and master chains.",
    },

    { type: "h2", id: "built-in-effects", text: "Built-in effects" },
    {
      type: "p",
      text: "Built-in effects carry the `OpenStudio` prefix. Older projects and scripts that use the legacy `S13` names still load. Each one has dedicated parameter sliders, a graph of its curve or response, preset save and load, and a bypass toggle.",
    },
    {
      type: "table",
      head: ["Effect", "What it is"],
      rows: [
        ["OpenStudio EQ", "Parametric equalizer with a graphical display"],
        ["OpenStudio Compressor", "Dynamic range compressor with a graph"],
        ["OpenStudio Gate", "Noise gate with threshold visualization"],
        ["OpenStudio Delay", "Tempo-synced delay with a graph"],
        ["OpenStudio Reverb", "Algorithmic reverb with visualization"],
        ["OpenStudio Saturator", "Harmonic saturation and distortion"],
        ["OpenStudio Chorus", "Chorus modulation"],
      ],
    },
    {
      type: "p",
      text: `Two larger built-ins have their own pages: the guitar and bass capture host in [NAM Rack setup](${V2_PATHS.docs}/nam-rack-setup), and the real-time pitch corrector in [Pitch editing](${V2_PATHS.docs}/pitch-editing). A limiter is also built in, and S13FX script effects with sliders and a native editor are supported.`,
    },

    { type: "h2", id: "formats-and-scan-paths", text: "Formats and scan paths" },
    {
      type: "p",
      text: "OpenStudio hosts 64-bit plugins for effects and virtual instruments. VST3 is the stable, most mature path. CLAP and LV2 code paths are present and exposed where the format is available, but individual plugin compatibility varies more than it does for VST3.",
    },
    {
      type: "p",
      text: "Open the FX Chain panel or the Plugin Browser and click **Scan**. The standard directories are scanned and the results are grouped by manufacturer and category, filterable by name.",
    },
    {
      type: "kv",
      rows: [
        ["macOS", "`~/Library/Audio/Plug-Ins/VST3`"],
        ["Windows", "`C:\\Program Files\\Common Files\\VST3`"],
        ["Linux", "`/usr/lib/lv2`"],
      ],
    },
    {
      type: "shot",
      src: SHOTS.fxChainBrowser,
      alt: "The OpenStudio FX chain panel with the plugin browser open",
      caption: "Scanned plugins listed by manufacturer and category beside the track's chain.",
    },

    { type: "h2", id: "adding-and-editing", text: "Adding a plugin, editors, presets, and A/B" },
    {
      type: "ol",
      items: [
        "Open the FX Chain panel for the track.",
        "Click **+** or **Add Plugin**.",
        "Filter the list by name, manufacturer, or category and click the plugin.",
        "It is appended to the chain and its native editor window opens.",
      ],
    },
    {
      type: "p",
      text: "Native editors open in separate windows when the plugin provides one. Parameters can be changed there or from the parameter list in the FX Chain panel, and each parameter can be automated or mapped to a controller with MIDI Learn.",
    },
    {
      type: "shot",
      src: SHOTS.pluginHosting,
      alt: "A third-party plugin editor hosted by OpenStudio",
      caption: "A hosted VST3 editor in its own native window.",
    },
    {
      type: "p",
      text: "To save a preset, set the parameters, click the preset save icon in the FX Chain panel, and name it. Load one from the plugin's preset browser. Plugin state is also stored in the project. For VST3 plugins, A/B comparison gives you two independent slots: set up A, switch to B, adjust, and toggle between them to compare by ear.",
    },

    { type: "h2", id: "bypass-reorder-safe-mode", text: "Bypass, reordering, and safe mode" },
    {
      type: "ul",
      items: [
        "**FX Bypass** on the track header bypasses the whole chain without removing anything. The FX button turns from green (active) to red (bypassed). Individual plugins bypass from inside the FX Chain panel.",
        "Drag effects within a track or input chain to reorder them; signal flows top to bottom.",
        "**File → Open Project (Safe Mode)…** (`Ctrl+Shift+O`) opens a project with every plugin bypassed so it loads quickly. Enable plugins one at a time afterwards.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "Master FX order",
      text: "Reordering by drag is supported for track and input chains. Master FX reordering is not supported in the current UI.",
    },

    { type: "h2", id: "bridges-ara-sidechain", text: "32-bit bridge, ARA2, and sidechain" },
    {
      type: "p",
      text: "Sidechain routing into plugins is supported for plugins that take a sidechain input. ARA2 hosting exists at the host-controller level: the ARA host controller lifecycle and per-track ARA status are implemented. The feature list does not describe an end-user ARA editing workflow beyond that, so treat ARA support as plumbing for now.",
    },
    {
      type: "callout",
      tone: "warn",
      label: "32-bit plugins are experimental",
      text: "**Options → Toggle 32-bit Plugin Bridge** exists for 32-bit VST plugins, but the control is experimental. The stable hosting path is 64-bit native plugins only, and bridging is not part of the supported plugin-hosting contract.",
    },

    { type: "h2", id: "troubleshooting", text: "When a plugin will not show up or misbehaves" },
    { type: "h3", text: "Plugin not in the list" },
    {
      type: "ol",
      items: [
        "Confirm it is installed in one of the standard directories above.",
        "Open the FX Chain panel and click **Scan** again.",
        "Confirm it is a 64-bit plugin. VST3 is the reliable format; CLAP and LV2 depend on the plugin and the build.",
        "Check the plugin file is not corrupted, for example by reinstalling it.",
      ],
    },
    { type: "h3", text: "Plugin crashes, hangs, or makes noise" },
    {
      type: "ol",
      items: [
        "Open the project in Safe Mode (`Ctrl+Shift+O`) so every plugin loads bypassed.",
        "Enable plugins one at a time until the problem returns.",
        "Check the plugin's documentation for channel configuration requirements; some expect a specific layout.",
        "Update the plugin to its latest version.",
        "Remove the plugin from the chain and add it again to reset its state.",
      ],
    },
    {
      type: "p",
      text: `More symptoms, including audio dropouts caused by heavy plugins, are indexed in [Troubleshooting](${V2_PATHS.docs}/troubleshooting).`,
    },
  ],
};

export default doc;
