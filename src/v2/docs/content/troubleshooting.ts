import { REPO, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: `Find the symptom, work through the list in order. Shortcuts are the OpenStudio default keyboard profile (\`Ctrl\` is \`Cmd\` on macOS). Background for each group is in [Audio setup](${V2_PATHS.docs}/audio-setup), [Plugins & scanning](${V2_PATHS.docs}/plugins-and-scanning), and [Keyboard shortcuts](${V2_PATHS.docs}/keyboard-shortcuts). If nothing fits, search the [issue tracker](${REPO.issues}) before opening a new one.`,
    },

    { type: "h2", id: "install-and-launch", text: "Install and first launch" },
    { type: "h3", text: "The OS warns that the build is unsigned" },
    {
      type: "p",
      text: "Expected. Builds are not code-signed yet, so each platform warns once on first launch.",
    },
    {
      type: "ol",
      items: [
        "Windows: when SmartScreen appears, choose **More info** → **Run anyway**.",
        "macOS: right-click the app, choose **Open**, then allow it under **System Settings → Privacy & Security** if asked.",
        "Linux: run `chmod +x OpenStudio-*.AppImage` before launching.",
        `Verify the SHA-256 on the [download page](${V2_PATHS.download}) if you want certainty.`,
      ],
    },
    { type: "h3", text: "AI Tools are missing, or a generation dialog says the runtime is absent" },
    {
      type: "p",
      text: "AI Tools are optional runtimes installed separately so the base download stays small. Only stem separation and generation need them.",
    },
    {
      type: "ol",
      items: [
        "Click the **AI Tools** button beside the Settings button, or **Install AI Tools** inside the Stem Separation dialog.",
        "Let the setup modal finish; it can be cancelled, reset, or retried from there.",
        `See [AI Tools setup](${V2_PATHS.docs}/ai-runtime-setup) for what is installed and how to keep it offline.`,
      ],
    },

    { type: "h2", id: "sound-and-performance", text: "No sound, latency, crackle, high CPU" },
    { type: "h3", text: "Transport says Playing but there is no sound" },
    {
      type: "ol",
      items: [
        "Open **View → Audio Settings…** and confirm the output device.",
        "Check the interface is powered on and connected.",
        "Check no track is muted and the master fader is up.",
        "Check for a stray solo; solo mutes every other track.",
        "On ASIO, make sure no other application holds the driver exclusively.",
      ],
    },
    { type: "h3", text: "Noticeable delay between playing and hearing it" },
    {
      type: "ol",
      items: [
        "On Windows, switch to **ASIO**.",
        "Lower the **Buffer Size** to 128 or 256.",
        "Close other audio applications competing for the device.",
        "If the smaller buffer crackles, raise it one step until stable.",
      ],
    },
    { type: "h3", text: "Pops, clicks, or crackle during playback or recording" },
    {
      type: "ol",
      items: [
        "Raise the **Buffer Size** to 512 or 1024.",
        "Freeze CPU-heavy tracks: right-click the track → **Freeze Track**.",
        "Reduce the number of active plugins.",
        "Close unnecessary background applications.",
        "Update your audio interface driver.",
      ],
    },
    { type: "h3", text: "CPU usage stays high" },
    {
      type: "ol",
      items: [
        "Freeze tracks with heavy plugins.",
        "Increase the buffer size.",
        "Remove or bypass plugins you are not using.",
        "Reduce the number of simultaneous tracks.",
        "Close the Mixer, Spectrum Analyzer, and Loudness Meter when not in use; their real-time displays cost CPU.",
      ],
    },

    { type: "h2", id: "plugins", text: "Plugins" },
    { type: "h3", text: "An installed plugin does not appear in the list" },
    {
      type: "ol",
      items: [
        "Check it is installed in a standard VST3 directory.",
        "Open the FX Chain panel and click **Scan** to rescan.",
        "Confirm it is a 64-bit plugin. VST3 is the most mature path; CLAP and LV2 compatibility varies by plugin and build.",
        "Check the plugin file is not corrupted; reinstall it if in doubt.",
      ],
    },
    { type: "h3", text: "A plugin crashes, hangs, or makes noise" },
    {
      type: "ol",
      items: [
        "Open the project in Safe Mode with `Ctrl+Shift+O`; every plugin loads bypassed.",
        "Enable plugins one at a time to find the culprit.",
        "Check the plugin's documentation for channel configuration requirements.",
        "Update the plugin to its latest version.",
        "Remove and re-add the plugin to reset its state.",
      ],
    },

    { type: "h2", id: "recording-and-midi", text: "Recording and MIDI" },
    { type: "h3", text: "Record is greyed out, or the recorded clip is empty" },
    {
      type: "ol",
      items: [
        "Arm at least one track; the transport Record button is disabled otherwise.",
        "Confirm the **Input Device** in Audio Settings.",
        "Check the input channel chosen on the armed track's header.",
        "Watch the track header's activity meter to confirm signal is arriving.",
        "Make sure **Record Safe** is off on the track.",
      ],
    },
    { type: "h3", text: "macOS: the input shows in Audio Settings but records silence" },
    {
      type: "p",
      text: "macOS gates every audio input, interfaces included, behind the **Microphone** permission.",
    },
    {
      type: "ol",
      items: [
        "Quit OpenStudio.",
        "Enable OpenStudio under **System Settings → Privacy & Security → Microphone**.",
        "Relaunch, reselect the input, arm a track, and check the meter.",
        `If OpenStudio is not in the list, reset the permission for the app bundle only; the command is in [Audio setup](${V2_PATHS.docs}/audio-setup).`,
      ],
    },
    { type: "h3", text: "A MIDI controller is not in the input selector" },
    {
      type: "ol",
      items: [
        "Connect and power the controller before launching OpenStudio.",
        "Install the device's driver if it needs one.",
        "Restart OpenStudio after connecting.",
        "On Windows, confirm the device shows in Device Manager under Sound, video, and game controllers.",
      ],
    },

    { type: "h2", id: "projects-and-media", text: "Projects and media" },
    { type: "h3", text: "Clips are empty or show a missing file warning" },
    {
      type: "p",
      text: "Audio is referenced by path, not embedded, so moving or deleting source files breaks the link. The Missing Media dialog is the recovery path; the full Media Pool panel is not mounted in the current build.",
    },
    {
      type: "ol",
      items: [
        "When prompted on load, browse to the moved files in the Missing Media dialog.",
        "Resolve each referenced path; resolved paths are saved with the project.",
        "If the originals are gone, re-record or re-import.",
      ],
    },
    { type: "h3", text: "The project will not save" },
    {
      type: "ol",
      items: [
        "Check the target directory is writable.",
        "Try **Save As** (`Ctrl+Shift+S`) to a different location.",
        "Check free disk space.",
        "Check antivirus software is not blocking writes.",
      ],
    },
    { type: "h3", text: "Audio clips have no waveform" },
    {
      type: "ol",
      items: [
        "Wait a moment on first load; the peak cache is being built.",
        "Waveforms come from `.ospeaks` sidecar files. Legacy `.s13peaks` files still work and are regenerated when needed; deleting a sidecar is safe.",
        "Check the referenced audio file exists and is readable.",
        "Zoom in or out to force a refresh.",
      ],
    },

    { type: "h2", id: "rendering", text: "Rendering" },
    { type: "h3", text: "The rendered file is silent" },
    {
      type: "ol",
      items: [
        "Check the Start and End times cover where the clips are.",
        "Check **Source**: Master mix for the whole song, specific tracks for stems.",
        "Check no track or clip is muted.",
        "Confirm the project plays back audibly before rendering.",
        "Render once with **Entire project** bounds to rule out a bounds problem.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "MP3, OGG, and placeholders",
      text: "MP3 and OGG need FFmpeg, bundled on Windows only; on macOS and Linux put a system `ffmpeg` on your `PATH`. **Resample Quality**, **Online render**, the **Metadata** fields, and the two **Selected items** sources are visible but not wired up in the current build.",
    },

    { type: "h2", id: "keyboard-shortcuts", text: "Keyboard shortcuts" },
    { type: "h3", text: "A shortcut does nothing" },
    {
      type: "ol",
      items: [
        "Click the timeline or a panel so the main window has focus.",
        "If a text field is focused, shortcuts are suspended. Press `Esc`.",
        "Open **Help → Keyboard Shortcuts** for the effective map. `F1` opens the Help Reference, not the key map.",
        "Check the selected profile, any platform override, and whether the action is intentionally unassigned.",
        "Check the action's scope. Timeline, Piano Roll, Pitch Editor, Mixer, automation, browser, plug-in, track-control, and modal bindings only fire in their own context.",
        "With a custom profile active, choose **Inherit** for the binding or reset the profile to compare against its base map.",
      ],
    },
  ],
};

export default doc;
