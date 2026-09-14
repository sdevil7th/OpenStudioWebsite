import { REPO, SHOTS, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: `One continuous session: a guitar part through the NAM Rack, a MIDI drum part, two edits, a quick mix, and a rendered file. It assumes you have finished [Getting started](${V2_PATHS.docs}/getting-started) and can hear playback. Shortcuts are the OpenStudio default keyboard profile; \`Ctrl\` means \`Cmd\` on macOS.`,
    },

    { type: "h2", id: "set-the-tempo", text: "Set the tempo and save" },
    {
      type: "ol",
      items: [
        "Click the **BPM** field in the transport bar and type a tempo, or tap `T` in time with the song. Set the **Time Signature** beside it if the song is not in 4/4.",
        "Click the metronome icon so you have a click to play to. The gear next to it sets the sound, accent pattern, and volume.",
        "Press `Ctrl+S` and choose a folder. Recorded audio is written as WAV files into a subdirectory beside the `.osproj`, and auto-backup only runs once the project has a path, so save before you record.",
      ],
    },

    { type: "h2", id: "record-guitar", text: "Record guitar through the NAM Rack" },
    {
      type: "p",
      text: "The NAM Rack is the built-in guitar and bass workspace: Neural Amp Modeler A1/A2 captures, a pedalboard, a cabinet IR stage, and post effects, sitting in the track's FX chain so you hear the tone while you play.",
    },
    {
      type: "ol",
      items: [
        "Press `Ctrl+T` for an audio track. Pick the guitar input in the track header and set it to **Mono**.",
        "Click **FX** on the track header, add **OpenStudio NAM Rack**, select the live instrument input inside the rack, and choose the **Guitar** or **Bass** profile.",
        "Load a local `.nam` file, or connect TONE3000 and open a tone pack. In a multi-capture pack, click **View Captures**, pick the exact child, **Audition** it, then **Use**.",
        "Check the topology badge. **RAW / AMP ONLY** needs a cabinet IR in the Cab stage; **CAB EMBEDDED** is a full rig and bypasses it.",
        "Set the input trim, then open the tuner and tune. It listens to the dry input and adds no latency.",
        "Click the record-arm circle and turn on **Monitor**. Aim for input peaks around −12 to −6 dB.",
        "Press `Ctrl+R`, play, and press `Space` to stop. The take lands as a clip at the playhead.",
      ],
    },
    {
      type: "shot",
      src: SHOTS.recordingSession,
      alt: "An armed audio track with input monitoring on, recording a take",
      caption: "Armed, monitoring through the FX chain, recording.",
    },
    {
      type: "p",
      text: `For another pass, set **Options → Record Mode** to **Overdub** and record over the same range; each pass becomes a take. Comping is in [Recording & editing](${V2_PATHS.docs}/recording-and-editing), the rack in [NAM Rack setup](${V2_PATHS.docs}/nam-rack-setup).`,
    },
    {
      type: "callout",
      tone: "note",
      label: "Nothing bundled",
      text: `OpenStudio ships no captures or IRs. Bring a local \`.nam\` file or sign in to TONE3000 where the build offers it ([NAM Rack guide](${REPO.namRackDoc})).`,
    },

    { type: "h2", id: "add-midi-drums", text: "Add a MIDI drum part" },
    {
      type: "ol",
      items: [
        "Press `Ctrl+Shift+I` for an instrument track. The Plugin Browser opens; pick a VST3 drum instrument (click **Scan** first if the list is empty).",
        "To play it in: choose your controller in the track header's MIDI input dropdown, arm, enable monitoring, press `Ctrl+R`, and play. No controller? `Alt+B` opens the on-screen keyboard.",
        "To draw it: double-click a MIDI clip to open the Piano Roll, choose the **Draw** tool, and click in the grid. Row is pitch, column is time; drag to set length.",
        "For a step-entered pattern, enable **Step Input** in the Piano Roll toolbar, pick a step size, and press `C` through `B` to insert notes.",
        "Tighten timing with **MIDI → Quantize Notes…**; `Q` reapplies the same settings later. Drag bars in the velocity lane to set how hard each hit plays.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "Drum editor",
      text: `The Drum Editor action exists, but a mounted drum-grid editor is not in the current build. Use the Piano Roll for drum notes. More in [MIDI & piano roll](${V2_PATHS.docs}/midi-and-piano-roll).`,
    },

    { type: "h2", id: "tidy-the-take", text: "Tidy the take" },
    {
      type: "p",
      text: "Three edits cover most first sessions. All are non-destructive and undoable with `Ctrl+Z`; `Ctrl+Alt+Z` opens the undo history.",
    },
    {
      type: "ol",
      items: [
        "**Split.** Select the clip, put the playhead where the mistake starts, press `S`; repeat at the end and press `Delete` on the middle piece. `B` switches to the Split tool.",
        "**Trim.** Hover a clip edge until the resize cursor appears and drag inward to hide the count-in, or outward to reveal audio you trimmed away.",
        "**Fade.** Hover the top-left or top-right corner and drag the handle inward. **Auto-Crossfade** in the main toolbar crossfades overlapping clips on one track automatically.",
      ],
    },

    { type: "h2", id: "quick-mix", text: "A quick mix with a bus and a snapshot" },
    {
      type: "ol",
      items: [
        "Press `Ctrl+M` for the mixer. Each strip has a fader (−60 to +12 dB), pan, a peak meter, and **S**, **M**, **R** buttons; double-click a fader for 0 dB.",
        "Start with every fader at unity and pull down whatever is loudest first, watching the master meter on the left.",
        "Select the guitar and drum tracks and choose **Insert → Create Bus from Selected Tracks**. OpenStudio makes a bus with a send from each track.",
        "Click the bus's **FX** button and add **OpenStudio Reverb**. In each strip's sends area, set the level and pick pre- or post-fader.",
        "Click **Save** in the Mixer Snapshots toolbar and name it. Try another balance, save that too, and click either name to switch.",
      ],
    },
    {
      type: "shot",
      src: SHOTS.mixerMeters,
      alt: "The mixer panel with channel strips, sends, and the master strip",
      caption: "Mixer docked below the arrangement. Master is always on the left.",
    },
    {
      type: "p",
      text: `Sends, the routing matrix, and automation are in [Mixing & routing](${V2_PATHS.docs}/mixing-and-routing).`,
    },

    { type: "h2", id: "render", text: "Render the song" },
    {
      type: "ol",
      items: [
        "Press `Ctrl+Alt+R` or open **File → Render…**.",
        "Set **Source** to **Master mix** and **Bounds** to **Entire project**.",
        "Choose a folder and a file name; `$project` and `$date` are replaced at render time.",
        "Pick **WAV** and a bit depth. Add a **Tail** in milliseconds if the reverb rings past the last clip.",
        "Turn on **Add to project after render** if you want the bounce back on the timeline, then render. **Add to Queue** parks the job in **View → Render Queue** instead.",
      ],
    },
    {
      type: "callout",
      tone: "warn",
      label: "MP3 and OGG",
      text: `Those formats go through FFmpeg, bundled on Windows only. On macOS and Linux you need a system \`ffmpeg\` on your \`PATH\`. Stems, regions, and DDP are in [Rendering & export](${V2_PATHS.docs}/rendering-and-export).`,
    },

    { type: "h2", id: "where-next", text: "Where next" },
    {
      type: "ul",
      items: [
        `[Audio setup](${V2_PATHS.docs}/audio-setup) if monitoring felt late or you heard crackle.`,
        `[Plugins & scanning](${V2_PATHS.docs}/plugins-and-scanning) if an instrument did not show up in the browser.`,
        `[Keyboard shortcuts](${V2_PATHS.docs}/keyboard-shortcuts) to switch to a profile that matches the DAW you came from.`,
        `[Troubleshooting](${V2_PATHS.docs}/troubleshooting) for anything that did not behave as described here.`,
      ],
    },
  ],
};

export default doc;
