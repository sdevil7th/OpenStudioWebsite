import { SHOTS, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: "Rendering runs your project offline through the same playback and FX engine you hear during playback, and writes the result to disk. This page covers the Render dialog top to bottom, the queue and delivery tools, and the project-level export and cleanup commands. Shortcuts are from the default OpenStudio keyboard profile; `Ctrl` is `Cmd` on macOS.",
    },

    { type: "h2", id: "render-dialog", text: "The Render dialog" },
    {
      type: "p",
      text: "Open it with **File → Render…** or `Ctrl+Alt+R`. Work down the dialog: pick a source, set the bounds, choose where the file goes and what it is called, pick a format, then decide on processing and what happens afterwards. **Add to Queue** defers the job instead of rendering now.",
    },
    {
      type: "shot",
      src: SHOTS.exportDialog,
      alt: "The OpenStudio Render dialog",
      caption: "Source and bounds at the top, output and format in the middle, processing options below.",
    },

    { type: "h2", id: "source-and-bounds", text: "Source and bounds" },
    {
      type: "table",
      head: ["Source", "Current status"],
      rows: [
        ["Master mix", "Full mix of all tracks through the master bus"],
        ["Selected tracks (stems)", "One file per selected track"],
        ["Master mix + all stems", "The master mix plus a stem for every track"],
        ["Selected media items", "UI choice only; selected-clip filtering is pending"],
        ["Selected items via master", "UI choice only; selected-clip filtering is pending"],
        ["Razor edit areas", "Each razor-area time range rendered as a separate stem from the track that owns it"],
      ],
    },
    {
      type: "callout",
      tone: "warn",
      label: "Selected-item sources",
      text: "The two selected-item choices appear in the dialog, but the backend does not yet filter the render to the selected clips. Use a time selection or razor areas for partial renders until that lands.",
    },
    {
      type: "table",
      head: ["Bounds", "Range rendered"],
      rows: [
        ["Entire project", "First clip start to last clip end"],
        ["Custom range", "Start and end times you enter"],
        ["Time selection", "The current time selection"],
        ["Project regions", "Each region as a separate file"],
        ["Selected regions", "Each selected region as a separate file"],
      ],
    },
    {
      type: "p",
      text: "**Tail** adds a number of milliseconds after the end time so reverb and delay tails are not cut off. An include-metronome option is available if you want the click in the file.",
    },

    { type: "h2", id: "output-settings", text: "Output directory and file names" },
    {
      type: "p",
      text: "Browse to an output **Directory**, then type a **File name**. Wildcards are replaced per file, which matters for stem and region renders where one job writes many files.",
    },
    {
      type: "table",
      head: ["Wildcard", "Replaced with"],
      rows: [
        ["`$project`", "Project name"],
        ["`$track`", "Track name (stem renders)"],
        ["`$region`", "Region name (region renders)"],
        ["`$date`", "Current date, YYYY-MM-DD"],
        ["`$time`", "Current time, HH-MM-SS"],
        ["`$index`", "Zero-padded sequential index"],
      ],
    },

    { type: "h2", id: "formats", text: "Formats, sample rate, and channels" },
    {
      type: "table",
      head: ["Format", "Notes"],
      rows: [
        ["WAV", "Uncompressed, with bit-depth selection"],
        ["AIFF", "Uncompressed, with bit-depth selection"],
        ["FLAC", "Lossless compressed, with bit-depth selection"],
        ["MP3", "FFmpeg-encoded at the selected bitrate"],
        ["OGG Vorbis", "FFmpeg-encoded at the selected quality"],
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "FFmpeg",
      text: "MP3 and OGG use FFmpeg as a separate process. On Windows an audited FFmpeg runtime is bundled with the installer. On macOS and Linux OpenStudio uses a system `ffmpeg` on your `PATH`; if it is missing only the FFmpeg-backed operation fails, and WAV, AIFF, and FLAC still render.",
    },
    {
      type: "p",
      text: "Choose the **Sample rate** the file should have; the offline engine renders at that rate and converts source files as needed. **Channels** is stereo or mono.",
    },

    { type: "h2", id: "processing-and-post", text: "Processing, secondary output, and post-render" },
    {
      type: "table",
      head: ["Option", "What it does"],
      rows: [
        ["Normalize", "Peak-normalizes the output to 0 dBFS"],
        ["Dither", "Applies TPDF or first-order noise-shaped dither before integer bit-depth output"],
        ["Secondary output", "Runs a second pass in another format after each primary file, with its own bit depth or codec quality"],
        ["Add to project after render", "Imports the rendered files back into the project as new clips"],
      ],
    },
    {
      type: "callout",
      tone: "warn",
      label: "Placeholders in the current build",
      text: "Three controls are visible but not wired up yet: **Resample Quality** (backend support pending), the **Metadata** section (title, artist, album, genre, year, description, ISRC are shown disabled and not written to the file), and **Online render (1x speed)** (disabled). Nothing you enter in them affects the output.",
    },
    {
      type: "p",
      text: `Render in place and consolidate track are also available, alongside track freeze; see [Mixing & routing](${V2_PATHS.docs}/mixing-and-routing) for freeze.`,
    },

    { type: "h2", id: "queue-matrix-and-ddp", text: "Render queue, region matrix, and DDP" },
    {
      type: "ul",
      items: [
        "**Add to Queue** in the Render dialog stores the job instead of running it. Open **View → Render Queue** to manage and batch-process queued jobs.",
        "**File → Region Render Matrix…** is a grid of regions against formats for multi-region, multi-format delivery.",
        "**File → DDP Disc Image Export…** writes a DDP disc image for CD replication.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "Delivery workflows need real-world validation",
      text: "The region matrix, DDP export, and batch conversion have code and UI, but the project's own feature audit lists them as needing focused release smoke tests and hardware validation before strong claims are made. Check the output before sending it to a plant.",
    },

    { type: "h2", id: "project-tools", text: "Archive, MIDI export, batch conversion, and cleanup" },
    {
      type: "kv",
      rows: [
        ["Session archive", "**File → Archive Session…** copies the project file and every referenced media file into one destination so the session moves between machines intact. Unarchive is supported."],
        ["Export MIDI", "**File → Export Project MIDI…** writes one standard MIDI file containing all MIDI clips in the project."],
        ["Batch converter", "**File → Batch File Converter…** converts a set of audio files to a chosen output format in one pass."],
        ["Clean project directory", "**File → Clean Project Directory…** lists files in the project folder that nothing references and lets you delete them."],
        ["Interchange", "RPP import and RPP/EDL export are available for moving sessions to and from other hosts."],
      ],
    },
    {
      type: "p",
      text: "Live capture of the master output (**File → Capture Output**) is an experimental plumbing path in the current build and is not part of the stable workflow.",
    },

    { type: "h2", id: "format-support", text: "Import and export format support" },
    {
      type: "table",
      head: ["Direction", "Formats"],
      rows: [
        ["Import", "WAV, AIFF, FLAC, MP3, OGG Vorbis, MIDI, and audio extracted from video where FFmpeg is available"],
        ["Export", "WAV, AIFF, FLAC, MP3, OGG Vorbis, MIDI, and DDP"],
      ],
    },
    {
      type: "p",
      text: `MP3, OGG, video extraction, and other FFmpeg conversions need the bundled Windows runtime or a system \`ffmpeg\` on macOS and Linux. If a render comes out silent, check the bounds cover the clips, the source is what you meant, and no track or clip is muted; the full checklist is in [Troubleshooting](${V2_PATHS.docs}/troubleshooting).`,
    },
  ],
};

export default doc;
