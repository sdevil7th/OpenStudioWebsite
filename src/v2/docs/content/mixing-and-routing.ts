import { SHOTS, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: "Mixing happens in the track headers, the mixer panel docked below the arrangement, and automation lanes on the timeline. This page follows the signal from a channel strip through sends and buses to the master, then covers groups, snapshots, automation, and metering. Shortcuts are from the default OpenStudio keyboard profile; `Ctrl` is `Cmd` on macOS.",
    },

    { type: "h2", id: "mixer-panel", text: "The mixer panel" },
    {
      type: "p",
      text: "Toggle the mixer with `Ctrl+M`, **View → Show Mixer**, or the mixer icon in the main toolbar. It can also be detached into its own window. The **Master** strip is fixed on the left behind a divider; track strips follow in track order and can be reordered by dragging.",
    },
    {
      type: "shot",
      src: SHOTS.mixerMeters,
      alt: "The OpenStudio mixer panel with channel strips and meters",
      caption: "Master on the left, one strip per track, snapshots along the top.",
    },
    {
      type: "p",
      text: "Each strip shows, top to bottom: track name and colour, a group badge, an **FX** indicator with the effect count (click to open the chain), the sends section, the pan knob, the volume fader with a +12 to -inf dB scale and a gain staging readout, a peak meter updated at 10 Hz, the **S**, **M**, and **R** buttons, and a phase invert toggle. A channel strip EQ modal also exists.",
    },
    {
      type: "p",
      text: "The master strip controls the final output volume and pan, shows the master peak meter, and has its own FX chain. It has no solo, mute, or record arm buttons. **View → Show Master Track in TCP** also shows it in the track control panel.",
    },

    { type: "h2", id: "volume-pan-solo-mute", text: "Volume, pan, solo, and mute" },
    {
      type: "ul",
      items: [
        "**Volume** runs from -60 dB (silence) to +12 dB. Drag the fader or the track header knob; double-click the fader to reset to 0 dB. Gain changes are smoothed, so there is no zipper noise.",
        "**Pan** runs from L100 through C to R100 using an equal-power (cosine/sine) pan law.",
        "**Mute** silences the track output. **Solo** mutes every track that is not soloed; several tracks can be soloed at once, and a soloed track still plays when others are muted.",
        "Solo and mute can be linked across tracks through a track group.",
      ],
    },

    { type: "h2", id: "sends-and-buses", text: "Sends, buses, and groups" },
    {
      type: "p",
      text: "A send copies a track's signal to a bus track: a shared reverb, a delay return, or parallel compression.",
    },
    {
      type: "ol",
      items: [
        "Create a bus with **Insert → New Bus/Group Track**.",
        "On the source track, click the sends area of the channel strip or use its context menu, and pick the bus as the destination.",
        "Set the send level (0.0 to 1.0). Send pan and phase are available per send.",
        "Choose **Pre-fader** (send level ignores the track fader) or **Post-fader** (send follows it).",
        "Add effects to the bus. Its output feeds the master.",
      ],
    },
    {
      type: "p",
      text: "Sends can be enabled and disabled individually. If you already have the source tracks selected, **Insert → Create Bus from Selected Tracks** makes the bus and adds a send from each selected track in one step.",
    },

    { type: "h2", id: "groups-vca-freeze", text: "Track groups, VCA faders, and freeze" },
    {
      type: "p",
      text: "A track group links parameters so that moving one member moves them all. Select the tracks with `Ctrl+Click` or `Shift+Click`, right-click, and choose **Create Group from Selected**. The group gets a colour shown on headers and strips. Linked parameters are volume (relative offsets kept), pan, mute, solo, record arm, and FX bypass, adjustable in the group settings. Membership, removal, and deletion live in the channel strip context menu.",
    },
    {
      type: "p",
      text: "VCA-style grouping controls the volume of several tracks from one fader without creating a submix bus; the linked tracks move proportionally and keep their relative levels.",
    },
    {
      type: "p",
      text: "Freezing renders a track's FX chain to a temporary audio file so the plugins stop using CPU. Right-click the track and choose **Freeze Track**; a frozen indicator appears on the header. **Unfreeze Track** restores live processing. Lua has `s13.freezeTrack` and `s13.unfreezeTrack`.",
    },

    { type: "h2", id: "snapshots-and-gain-staging", text: "Mixer snapshots and gain staging" },
    {
      type: "p",
      text: "Snapshots save and recall the whole mixer state: volumes, pans, mutes, and solos. Click **Save** in the snapshots toolbar at the top of the mixer and name it. Click a snapshot button to recall it (undoable), or the trash icon to delete it. Use them to A/B two balances, keep several mix passes, or store reference levels.",
    },
    {
      type: "p",
      text: "The gain staging display on each strip shows the level at successive points in the chain (clip gain, track fader, master output) so you can see where clipping is introduced.",
    },

    { type: "h2", id: "routing-matrix", text: "Routing matrix and signal flow" },
    {
      type: "p",
      text: "**View → Routing Matrix** shows every route between tracks, buses, and the master in one grid. A track routing modal is also available; output channel selection and channel count are set per track. Sidechain routing into plugins is supported. Processing order on a track:",
    },
    {
      type: "code",
      code: "Input → Input FX → Fader → Pan → Track FX → Output → Master → Master FX → Master volume/pan → Device\n                                        └─ Send → Bus → Bus FX → Master",
    },
    {
      type: "p",
      text: `Input FX are pre-fader, so fader automation does not affect them; track FX are post-fader. The master receives the sum of all track outputs and bus outputs. Chains and plugins are covered in [Plugins & scanning](${V2_PATHS.docs}/plugins-and-scanning).`,
    },

    { type: "h2", id: "automation", text: "Automation" },
    {
      type: "p",
      text: "Track volume, pan, mute, master parameters, and individual plugin parameters can be automated. Click the disclosure triangle on a track header, or right-click and choose **Show Automation**; lanes appear under the track. Pick the parameter from the lane dropdown.",
    },
    {
      type: "shot",
      src: SHOTS.automationLanes,
      alt: "Automation lanes under a track in the OpenStudio timeline",
      caption: "Points are joined by lines with the area below filled to show the value.",
    },
    {
      type: "ol",
      items: [
        "Click on the lane to add a point; click and drag to draw several.",
        "Drag existing points to change their time or value.",
        "Select points and press `Delete` to remove them, or right-click the lane and choose **Clear Automation** to clear the parameter.",
      ],
    },
    {
      type: "table",
      head: ["Mode", "Behaviour"],
      rows: [
        ["Read", "Automation plays back; manual changes are temporary."],
        ["Write", "During playback every change is recorded, overwriting existing points."],
        ["Touch", "Records only while you hold a control, then reverts to the existing curve."],
        ["Latch", "Like Touch, but keeps writing the last value after release until the transport stops."],
      ],
    },
    {
      type: "p",
      text: "Set the mode from the lane dropdown or with `s13.setAutomationMode()` in Lua. **Options → Move Envelopes with Items** decides whether automation points follow a clip when you move it; off, they stay at their original times.",
    },

    { type: "h2", id: "metering", text: "Metering panels" },
    {
      type: "p",
      text: "Three panels live under **View → Metering**: a **Loudness Meter** (LUFS), a **Spectrum Analyzer**, and a **Phase Correlation Meter**. The master strip has a peak meter with a clipping reset.",
    },
    {
      type: "callout",
      tone: "note",
      label: "These panels cost CPU",
      text: "The loudness, spectrum, and phase displays render in real time. Close them, and the mixer panel, when the machine is struggling.",
    },
  ],
};

export default doc;
