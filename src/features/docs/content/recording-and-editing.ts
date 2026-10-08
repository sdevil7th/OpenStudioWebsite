import { SHOTS } from "@/data/siteContent";
import { SITE_PATHS } from "@/constants/routes";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-10-05",
  appReference: { commit: "52cbd7c", channel: "development" },
  blocks: [
    { type: "callout", tone: "note", label: "Development checkout: Click-only metronome shortcut", text: "Unreleased October 5 working-tree addition after app commit 52cbd7c: Ctrl+Shift+Space on Windows/Linux or Cmd+Shift+Space on macOS mirrors Play click only / Stop click only, with Metronome Settings open or closed. All 19 built-in keyboard profiles include it; custom overrides can reassign or disable it. The shortcut changes standalone practice only, leaving transport, recording and Enable unchanged. If Enable is on, the click can still follow playback or recording after Stop click only. Plain Space retains transport start/stop." },
    { type: "callout", tone: "note", label: "Development checkout: Metronome click sounds", text: "Unreleased October 5 working-tree changes after app commit 52cbd7c: Click sounds in Metronome Settings starts collapsed. Regular and Accent independently offer Electronic (original), Woodblock, 808-style cowbell and Mechanical tick, or a custom WAV/AIFF/FLAC/Ogg. The cowbell is an electronic drum-machine sound with a stronger same-pitch accent; use a custom sample for an acoustic cowbell. Play click only auditions the pair. Custom imports inspect the first two seconds, remove DC, select the strongest mono channel, align the first sharp attack peak, match peak level and fade to at most 100 ms. Silent, clipped, invalid, slow-attack and detectable multiple-hit samples are rejected while keeping the previous choice. Automatic detection is limited; audition complex or noisy sources. Prepared copies are saved locally and selections survive project save/load. Include those prepared files when transferring projects; missing copies warn and fall back to the original sound. Regenerate existing rendered click tracks after changing sounds." },
    { type: "callout", tone: "note", label: "Development checkout: Playhead at high zoom", text: "Unreleased October 5 working-tree fix after app commit 52cbd7c: the ruler marker and vertical playhead line use the same current zoom and scroll values and refresh after zoom or resize, including while transport is stopped. This corrects an intermittent disappearance when the playhead remains inside the visible time range at high zoom." },
    { type: "callout", tone: "note", label: "Development checkout: Clip click and drag", text: "Unreleased October 5 working-tree fix after app commit 52cbd7c: clicking a recorded, imported, or MIDI clip preserves its exact placement and trim boundaries, including off-grid clips. Pointer movement below four screen pixels counts as a click. Snapping begins when a drag activates; a click creates no move, trim, copy, or undo entry. The shared timeline handler also uses the main canvas origin when the internal ruler is visible, and Escape cancels an active clip drag before deselection handling." },
    { type: "callout", tone: "note", label: "Development checkout: Import and timed practice", text: "Unreleased September 29 working-tree additions after app commit 52cbd7c: File > Import > Audio... (Ctrl+I) and MIDI... (Ctrl+Alt+I) open filtered native multi-file choosers. Insert > Media file... accepts either. One file uses a compatible selected track; otherwise imports create tracks at the captured edit cursor. Multiple files use separate tracks and one undo entry per file; MIDI currently merges source tracks into one clip per file. Source audio remains referenced in place. These are OpenStudio-profile defaults (Audio: Cmd+I and MIDI: Cmd+Ctrl+I on macOS); other profiles/custom bindings differ. Metronome Settings now offers Countdown in seconds or Stopwatch at project tempo, Pause/Resume and Reset. Closing the dialog keeps practice running; Play/Record or device loss interrupts it. The timer never stops recording." },
    {
      type: "p",
      text: `Audio recording from input to comped take, then the timeline tools in the order you are likely to reach for them. MIDI has [its own page](${SITE_PATHS.docs}/midi-and-piano-roll). Shortcuts are the OpenStudio default keyboard profile; \`Primary\` (and the \`Ctrl\` below) is \`Ctrl\` on Windows and Linux and \`Cmd\` on macOS.`,
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
      text: `Buffer size, drivers, and the macOS microphone permission are in [Audio setup](${SITE_PATHS.docs}/audio-setup).`,
    },

    { type: "h2", id: "recording", text: "Recording, record modes, and loops" },
    {
      type: "ol",
      items: [
        "Position the playhead where recording should begin.",
        "Press `Ctrl+R` or the transport **Record** button. The status reads `[Recording]`.",
        "Press `Space` or **Stop** to finish; there is no separate stop key in the default profile.",
        "The new clip appears on the armed track. Audio is written as WAV into `OpenStudio/Audio` inside your Documents folder and referenced by the project.",
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
        ["**Overdub (Layer)**", "Adds new clips while keeping the existing clips. Loop passes within one recording session are grouped as takes."],
        ["**Replace**", "Removes existing audio clips that overlap the new recording. It does not trim and preserve their portions outside the recorded range."],
      ],
    },
    {
      type: "p",
      text: "For loop recording, make a time selection and choose **View → Set Loop to Selection**, which also enables looping. Then arm and record. Looping is not punch recording; a separate punch control is not exposed in the current UI.",
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
      text: "Multiple loop passes within one recording session become takes on one clip. Only the active take plays; switch it from the clip's take menu.",
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
        "`Primary`+drag on the timeline background, or `Shift`+drag on the ruler, makes a time selection. It drives render bounds and the operations below, and can be copied to the loop range.",
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
      text: "All of it is undoable with `Ctrl+Z` and redoable with `Ctrl+Shift+Z`. **View → Undo History** (`Ctrl+Alt+Z`; macOS: `Cmd+Ctrl+Z`) lists every operation; click one to jump back to it.",
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
      text: `**View → Region/Marker Manager** lists everything in time order with controls to rename, delete, and jump. Rendering by region is in [Rendering & export](${SITE_PATHS.docs}/rendering-and-export).`,
    },
  ],
};

export default doc;
