import { SHOTS, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: `Audio recording from input to comped take, then the timeline tools in the order you are likely to reach for them. MIDI has [its own page](${V2_PATHS.docs}/midi-and-piano-roll). Shortcuts are the OpenStudio default keyboard profile; \`Primary\` (and the \`Ctrl\` below) is \`Ctrl\` on Windows and Linux and \`Cmd\` on macOS.`,
    },

    { type: "h2", id: "inputs-arming-monitoring", text: "Inputs, arming, and monitoring" },
    {
      type: "ol",
      items: [
        "Confirm the device in **View → Audio Settings…**. Its channels are what the track input dropdown offers.",
        "On each track, pick the input in the track header and choose **Stereo** (a channel pair) or **Mono** (one channel).",
        "Click the red **Record Arm** circle. The transport's Record button stays disabled until at least one track is armed; arm several to record them together.",
        "Toggle **Monitor** to hear the live input through the track's input FX and track FX, at a delay set by your buffer size.",
      ],
    },
    {
      type: "p",
      text: `Buffer size, drivers, and the macOS microphone permission are in [Audio setup](${V2_PATHS.docs}/audio-setup).`,
    },

    { type: "h2", id: "recording", text: "Recording, record modes, and punch" },
    {
      type: "ol",
      items: [
        "Position the playhead where recording should begin.",
        "Press `Ctrl+R` or the transport **Record** button. The status reads `[Recording]`.",
        "Press `Space` or **Stop** to finish; there is no separate stop key in the default profile.",
        "The new clip appears on the armed track. Audio is written as WAV into the project directory.",
      ],
    },
    {
      type: "p",
      text: "**Options → Record Mode** decides what happens when you record over existing material. The mode shows as a transport badge whenever it is not Normal.",
    },
    {
      type: "table",
      head: ["Mode", "Behaviour"],
      rows: [
        ["**Normal**", "Creates a new clip on the armed track. Existing clips are preserved."],
        ["**Overdub**", "Records a new take over existing clips. Both are kept for comping."],
        ["**Replace**", "Replaces existing audio in the recorded range with the new material."],
      ],
    },
    {
      type: "p",
      text: "To punch in on a range, make a time selection or loop region over it, press `L` to enable loop, arm the track, and record. Only the range inside the boundaries is captured; playback runs outside it without recording.",
    },
    {
      type: "shot",
      src: SHOTS.recordingSession,
      alt: "Recording a take on an armed track with the transport in record",
      caption: "An armed, monitored track mid-take.",
    },

    { type: "h2", id: "takes-and-comping", text: "Takes and comping" },
    {
      type: "p",
      text: "In Overdub mode every pass over the same position becomes a take on that clip. Only the active take plays; switch it from the clip's take menu.",
    },
    {
      type: "ol",
      items: [
        "Record as many takes as you need over the section.",
        "Run **Edit → Explode Takes to New Tracks** to lay them out on separate tracks. Neither take command has a default key; both are in the Edit menu and Command Palette.",
        "Split or razor-edit the best pieces from each track.",
        "Select the pieces and run **Edit → Implode Clips into Takes** to fold them back into one clip.",
      ],
    },

    { type: "h2", id: "selection-moving-nudging", text: "Selection, moving, and nudging" },
    {
      type: "ul",
      items: [
        "Click a clip to select it; `Primary`+click adds or removes one. Drag on empty space to marquee-select. `Ctrl+Shift+A` selects every clip, `Esc` clears.",
        "Click a track header to select the track; `Ctrl+Click` multi-selects, `Shift+Click` selects a range, `Ctrl+A` selects all tracks.",
        "`Primary`+drag on the timeline background, or `Shift`+drag on the ruler, makes a time selection. It drives punch recording, render bounds, and the operations below.",
        "Drag a clip to move it in time or to another track. Hold `Alt`/`Option` to bypass snap for one drag, `Primary` to copy instead of move, `Shift` to lock to the first axis you cross.",
        "`Ctrl+X`, `Ctrl+C`, and `Ctrl+V` cut, copy, and paste at the playhead. Multi-clip pastes keep their relative track positions.",
      ],
    },
    {
      type: "table",
      head: ["Action", "Shortcut", "Moves by"],
      rows: [
        ["Nudge left", "`Left`", "One grid unit"],
        ["Nudge right", "`Right`", "One grid unit"],
        ["Nudge left fine", "`Ctrl+Left`", "A fine amount"],
        ["Nudge right fine", "`Ctrl+Right`", "A fine amount"],
      ],
    },

    { type: "h2", id: "split-trim-slip-fade", text: "Split, trim, slip, and fade" },
    {
      type: "ul",
      items: [
        "**Split at playhead:** select a clip and press `S`, or **Edit → Split at Cursor**. `B` picks the Split tool for click-to-cut. **Edit → Split at Time Selection** cuts every clip at both selection edges.",
        "**Trim:** in the Select tool, hover a clip edge until the resize cursor appears and drag. Inward hides content, outward reveals it. The source file is untouched.",
        "**Slip:** hold `Primary+Shift` and drag inside a clip. The boundaries stay put while the audio slides within them.",
        "**Fades:** hover the top-left or top-right corner for the handle and drag inward. **Auto-Crossfade** in the main toolbar or View menu crossfades overlapping clips on one track.",
        "**Gain envelope:** `Shift`+click an audio clip to add a point, drag a point to move it, right-click to remove it.",
      ],
    },
    {
      type: "p",
      text: "All of it is undoable with `Ctrl+Z` and redoable with `Ctrl+Shift+Z`. **View → Undo History** (`Ctrl+Alt+Z`) lists every operation; click one to jump back to it.",
    },

    { type: "h2", id: "time-selection-razor-ripple", text: "Time selection, razor, and ripple" },
    {
      type: "p",
      text: "With a time selection active, the Edit menu offers **Cut within Time Selection**, **Copy within Time Selection**, **Delete within Time Selection** (later clips ripple earlier), **Insert Silence** (later clips push later), **Split at Time Selection**, and **Set Loop to Selection** (`Ctrl+L`).",
    },
    {
      type: "p",
      text: "Razor editing cuts a region out of several tracks at once. Hold `Alt`/`Option` and drag on the timeline background, then press `Delete` or **Edit → Delete Razor Edit Content**. **Clear Razor Edits** in the Command Palette dismisses the area without deleting.",
    },
    {
      type: "callout",
      tone: "note",
      label: "Razor leaves a gap",
      text: "Deleting razor content does not apply ripple mode in the current build. Close the gap with a time-selection delete or by moving the clips.",
    },
    {
      type: "p",
      text: "Ripple mode, set from **Options → Ripple Editing** or **Preferences → Editing**, decides whether later clips close a gap. The active mode shows in the transport bar as `Ripple: Track` or `Ripple: All`.",
    },
    {
      type: "table",
      head: ["Mode", "Behaviour"],
      rows: [
        ["**Off**", "Clips stay where they are when content is deleted, leaving gaps."],
        ["**Per Track**", "Later clips on the same track shift to fill the gap."],
        ["**All Tracks**", "Later clips on every track shift to fill the gap."],
      ],
    },

    { type: "h2", id: "clip-tools", text: "Clip properties, grouping, and transients" },
    {
      type: "ul",
      items: [
        "`U` toggles clip mute. **Edit → Toggle Clip Lock** stops a clip being moved, resized, or deleted.",
        "`F2` opens Clip Properties, including per-clip volume in dB. **Edit → Normalize Selected Clips** raises the peak to 0 dB; **Edit → Reverse Clip** reverses the audio.",
        "`Ctrl+G` groups selected clips so they move and edit together; `Ctrl+Shift+G` ungroups.",
        "**Edit → Quantize Selected Clips to Grid** snaps clip starts to the grid.",
        "**Edit → Dynamic Split…** splits a clip at transients or silence; set threshold and minimum duration in the dialog.",
        "With an audio clip selected, `Tab` jumps the playhead to the next transient, `Shift+Tab` to the previous one.",
      ],
    },

    { type: "h2", id: "markers-and-regions", text: "Markers and regions" },
    {
      type: "p",
      text: "Press `M` to drop a marker at the playhead, or `Shift+M` to name it as you add it. For a region, make a time selection and press `Shift+R` (or **Insert → Region from selection**). Regions have a name, start, end, and colour, and double as render bounds.",
    },
    {
      type: "p",
      text: `**View → Region/Marker Manager** lists everything in time order with controls to rename, delete, and jump. Rendering by region is in [Rendering & export](${V2_PATHS.docs}/rendering-and-export).`,
    },
  ],
};

export default doc;
