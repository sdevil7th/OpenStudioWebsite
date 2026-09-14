import { SHOTS, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: "OpenStudio is a desktop DAW with a JUCE C++ audio engine and a React front end. This page takes you from the download to a saved project with one track on it. Budget about ten minutes.",
    },

    { type: "h2", id: "download-and-install", text: "Download and install" },
    {
      type: "p",
      text: `Grab the build for your platform from the [download page](${V2_PATHS.download}). Builds are currently unsigned, so your OS will warn on first launch. That is expected, and the steps below are the whole workaround.`,
    },
    {
      type: "kv",
      rows: [
        ["Windows", "Run the installer. If SmartScreen appears, choose **More info** → **Run anyway**. The installer owns the WebView2 and VC++ prerequisites."],
        ["macOS", "Open the .dmg and drag OpenStudio to Applications. Right-click the app, choose **Open**, then allow it under **System Settings → Privacy & Security** if asked."],
        ["Linux", "Make the AppImage executable with `chmod +x OpenStudio-*.AppImage` and launch it. MP3/OGG export and other FFmpeg-backed features use a system `ffmpeg` on your PATH."],
      ],
    },
    {
      type: "callout",
      tone: "warn",
      label: "Unsigned builds",
      text: "Code signing costs money the project currently spends elsewhere. The first-launch approval path is documented, not warning-free. Verify the SHA-256 on the download page if you want certainty.",
    },
    {
      type: "p",
      text: "On first launch OpenStudio creates its configuration files, scans your audio devices and drivers, and opens an empty project. Updates are announced in-app; you can also check manually from **Help → Check for Updates…**.",
    },

    { type: "h2", id: "first-launch", text: "First launch" },
    {
      type: "p",
      text: "The layout follows the usual DAW pattern: menu bar and main toolbar on top, the track control panel on the left, the timeline in the centre, the mixer below when you toggle it with `Ctrl+M`, and the transport bar along the bottom with the time display, BPM, and time signature.",
    },
    {
      type: "shot",
      src: SHOTS.arrangementOverviewWide,
      alt: "The default OpenStudio layout on first launch",
      caption: "The default layout: track headers left, arrangement centre, mixer docked below.",
    },
    {
      type: "p",
      text: "Press `F1` at any time for the searchable Help Reference, and `Ctrl+Shift+P` for the Command Palette, which fuzzy-finds every action in the app without you having to remember a menu location.",
    },

    { type: "h2", id: "audio-device", text: "Audio device and buffer size" },
    {
      type: "p",
      text: "Open **View → Audio Settings…** or click the gear icon in the main toolbar. Pick your audio system and device, choose a sample rate (44.1 or 48 kHz are standard), and start with a 256-sample buffer. Drop to 128 once you know the machine keeps up; lower buffers mean less latency and more CPU.",
    },
    {
      type: "kv",
      rows: [
        ["macOS", "CoreAudio, using your interface or the built-in output."],
        ["Windows", "ASIO if your interface ships a driver, otherwise WASAPI. DirectSound works but adds latency."],
        ["Linux", "JACK for the lowest latency, ALSA for simplicity."],
      ],
    },
    {
      type: "p",
      text: `Latency, crackle, and driver choice get their own page: [Audio setup](${V2_PATHS.docs}/audio-setup).`,
    },

    { type: "h2", id: "scan-plugins", text: "Scan your plugins" },
    {
      type: "p",
      text: "Open the FX chain panel on any track (the **FX** button on the track header) or the Plugin Browser and click **Scan**. Standard VST3, CLAP, and LV2 directories are scanned and the results are grouped by manufacturer and category.",
    },
    {
      type: "code",
      code: "~/Library/Audio/Plug-Ins/VST3\nC:\\Program Files\\Common Files\\VST3\n/usr/lib/lv2",
    },
    {
      type: "p",
      text: `VST3 is the most mature path; CLAP and LV2 compatibility varies more by plugin. Nothing showing up? See [Plugins & scanning](${V2_PATHS.docs}/plugins-and-scanning).`,
    },

    { type: "h2", id: "first-project", text: "Create a project and arm a track" },
    {
      type: "ol",
      items: [
        "Press `Ctrl+T` to add an audio track, or `Ctrl+Shift+T` for a MIDI track.",
        "Pick the input on the track header and choose stereo or mono.",
        "Click the record-arm circle. Toggle **Monitor** to hear the live input through the track's FX chain.",
        "Add **OpenStudio NAM Rack** to the FX chain if you are recording guitar or bass, so you hear the tone while you play.",
        "Press `Ctrl+R` to record and `Space` to stop. The take lands as a clip on the timeline.",
        "Save with `Ctrl+S`. Projects use the `.osproj` extension; legacy `.s13` sessions still open.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "Importing instead",
      text: "Prefer to start from a file? **Insert → Media file…** (or the `Insert` key) places WAV, AIFF, FLAC, MP3, or OGG audio at the playhead on the selected track.",
    },
  ],
};

export default doc;
