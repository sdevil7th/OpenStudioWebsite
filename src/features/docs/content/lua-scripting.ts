import { SITE_PATHS } from "@/constants/routes";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-16",
  appReference: { commit: "7f59cff", channel: "development" },
  blocks: [
    {
      type: "p",
      text: "OpenStudio ships a Lua scripting engine with native bindings for tracks, transport, FX chains, sends, automation, audio analysis, freeze, and offline render. This page covers the editor, the namespace, a compact API reference, and examples. Project-editing scripts have the synchronization limits described below.",
    },

    { type: "h2", id: "the-script-editor", text: "The script editor" },
    {
      type: "p",
      text: "Open **View → Script Editor**. The window has two panes: the editor on top, where you write Lua, and the console below, where output lands.",
    },
    {
      type: "ol",
      items: [
        "Type or paste a script into the editor pane.",
        "Click **Run**. The script executes against the open project.",
        "Read results and errors in the console pane.",
        "Use `openstudio.print(...)` anywhere in the script to write your own messages to the console.",
      ],
    },
    {
      type: "p",
      text: "Scripts call the native audio engine directly. Track, clip, mixer, and automation edits are not synchronized back into the frontend project state or its undo history, so they may not appear in the UI or survive saving. Use the UI for persistent project edits; keep reusable analysis scripts as files on disk.",
    },

    { type: "h2", id: "the-s13-namespace", text: "The OpenStudio namespace" },
    {
      type: "p",
      text: "DAW functions are registered under `openstudio.*`. Older examples using `s13.*` do not work in this app revision. Use `openstudio.addTrackJSFX(trackId, scriptPath, isInputFX)` for a JSFX file and `openstudio.getAvailableJSFX()` to inspect available effects.",
    },
    {
      type: "p",
      text: "Track functions take a `trackId` string returned by `openstudio.addTrack`. Volume is in dB, pan runs from `-1.0` (left) to `1.0` (right), and times are in seconds. Master volume is linear, from `0.0` to about `3.98` (+12 dB). Read the argument column in the tables below before assuming a range.",
    },
    {
      type: "callout",
      tone: "note",
      label: "Scope of the API",
      text: "These signatures were checked against the app scripting bindings at the revision shown above. This compact reference covers common DAW operations; the engine also exposes deferred callbacks and a separate `gfx` drawing API.",
    },

    { type: "h2", id: "a-first-script", text: "A first script" },
    {
      type: "p",
      text: "This read-only script prints the engine’s tempo, time signature, and track count. Paste it into the editor and click **Run**.",
    },
    {
      type: "code",
      lang: "lua",
      code: `local signature = openstudio.getTimeSignature()
openstudio.print("Tempo: " .. openstudio.getTempo() .. " BPM")
openstudio.print("Time signature: " .. signature.num .. "/" .. signature.den)
openstudio.print("Native tracks: " .. openstudio.getTrackCount())`,
    },
    {
      type: "p",
      text: "`getTimeSignature()` returns a table with `num` and `den` fields. A native track count does not provide the IDs of the tracks in the project.",
    },

    { type: "h2", id: "api-reference", text: "API reference" },
    {
      type: "p",
      text: "Signatures below describe the native Lua bindings. Optional arguments have a `?` suffix. `none` means no return value. Track IDs are UUID strings, not numbered positions; keep the IDs returned by `addTrack()`. FX and send indices are zero-based.",
    },

    { type: "h3", text: "Track operations" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`openstudio.getTrackCount()`", "none", "`number`", "Returns total number of tracks"],
        ["`openstudio.addTrack()`", "none", "`trackId: string or nil`", "Creates an audio track; no name argument"],
        ["`openstudio.removeTrack(trackId)`", "`trackId: string`", "`boolean`", "Removes a track"],
        [
          "`openstudio.setTrackVolume(trackId, dB)`",
          "`trackId: string, dB: number`",
          "none",
          "Set track volume (-60 to +12 dB)",
        ],
        [
          "`openstudio.setTrackPan(trackId, pan)`",
          "`trackId: string, pan: number`",
          "none",
          "Set track pan (-1.0 L to +1.0 R)",
        ],
        [
          "`openstudio.setTrackMute(trackId, muted)`",
          "`trackId: string, muted: boolean`",
          "none",
          "Set track mute state",
        ],
        [
          "`openstudio.setTrackSolo(trackId, soloed)`",
          "`trackId: string, soloed: boolean`",
          "none",
          "Set track solo state",
        ],
        [
          "`openstudio.setTrackArm(trackId, armed)`",
          "`trackId: string, armed: boolean`",
          "none",
          "Set track record arm",
        ],
        [
          "`openstudio.reorderTrack(trackId, newIndex)`",
          "`trackId: string, newIndex: number`",
          "`boolean`",
          "Moves a track to a zero-based position",
        ],
      ],
    },

    { type: "h3", text: "Transport" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`openstudio.play()`", "none", "none", "Start playback"],
        ["`openstudio.stop()`", "none", "none", "Stop playback"],
        ["`openstudio.record()`", "none", "none", "Start recording (arms must be set)"],
        ["`openstudio.isPlaying()`", "none", "`boolean`", "Check if transport is playing"],
        ["`openstudio.isRecording()`", "none", "`boolean`", "Check if transport is recording"],
        ["`openstudio.getPlayhead()`", "none", "`number`", "Get playhead position in seconds"],
        ["`openstudio.setPlayhead(time)`", "`time: number`", "none", "Set playhead position in seconds"],
        ["`openstudio.getTempo()`", "none", "`number`", "Get current BPM"],
        ["`openstudio.setTempo(bpm)`", "`bpm: number`", "none", "Set tempo (20-999 BPM)"],
        ["`openstudio.getTimeSignature()`", "none", "`table`", "Returns {num, den}, not two return values"],
        ["`openstudio.setTimeSignature(num, den)`", "`num: number, den: number`", "none", "Set time signature"],
        ["`openstudio.setLoop(enabled)`", "`enabled: boolean`", "none", "Enables or disables the existing loop range"],
      ],
    },

    { type: "h3", text: "FX chain" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`openstudio.getTrackFX(trackId)`", "`trackId: string`", "`table`", "Get list of track FX plugins"],
        ["`openstudio.getTrackInputFX(trackId)`", "`trackId: string`", "`table`", "Get list of input FX plugins"],
        [
          "`openstudio.addTrackFX(trackId, pluginPath)`",
          "`trackId: string, pluginPath: string`",
          "`boolean`",
          "Adds a plugin by its path",
        ],
        [
          "`openstudio.removeTrackFX(trackId, index)`",
          "`trackId: string, index: number`",
          "none",
          "Removes the zero-based FX slot",
        ],
        [
          "`openstudio.bypassTrackFX(trackId, index, bypassed)`",
          "`trackId: string, index: number, bypassed: boolean`",
          "none",
          "Toggle FX bypass",
        ],
        [
          "`openstudio.addTrackJSFX(trackId, scriptPath, isInputFX?)`",
          "`trackId: string, scriptPath: string, isInputFX: boolean`",
          "`boolean`",
          "Adds a JSFX file to the track or input chain",
        ],
        ["`openstudio.getAvailableJSFX()`", "none", "`table or nil`", "Lists available JSFX effects"],
      ],
    },

    { type: "h3", text: "Master bus" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`openstudio.setMasterVolume(volume)`", "`volume: number`", "none", "Set master volume (0.0 to about 3.98 linear, +12 dB)"],
        ["`openstudio.getMasterVolume()`", "none", "`number`", "Get master volume"],
        ["`openstudio.setMasterPan(pan)`", "`pan: number`", "none", "Set master pan (-1.0 to +1.0)"],
        ["`openstudio.getMasterPan()`", "none", "`number`", "Get master pan"],
      ],
    },

    { type: "h3", text: "Sends" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        [
          "`openstudio.addTrackSend(trackId, destTrackId)`",
          "`trackId, destTrackId: string`",
          "`number`",
          "Add send, returns send index",
        ],
        [
          "`openstudio.removeTrackSend(trackId, index)`",
          "`trackId: string, index: number`",
          "none",
          "Remove send at index",
        ],
        [
          "`openstudio.setTrackSendLevel(trackId, index, level)`",
          "`trackId: string, index: number, level: number`",
          "none",
          "Set send level (0.0 to 1.0)",
        ],
        ["`openstudio.getTrackSends(trackId)`", "`trackId: string`", "`table`", "Get all sends for a track"],
      ],
    },

    { type: "h3", text: "Playback clips" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        [
          "`openstudio.addPlaybackClip(trackId, file, start, duration, offset?, volumeDB?, fadeIn?, fadeOut?)`",
          "`trackId/file: string; times and gain: number`",
          "none",
          "Adds an audio playback clip; optional times/gain default to zero",
        ],
        [
          "`openstudio.removePlaybackClip(trackId, file)`",
          "`trackId: string, file: string`",
          "none",
          "Removes playback material by track and path",
        ],
        ["`openstudio.clearPlaybackClips()`", "none", "none", "Remove all playback clips"],
      ],
    },

    { type: "h3", text: "Automation" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        [
          "`openstudio.setAutomationPoints(trackId, param, pointsJSON)`",
          "`trackId: string, param: string, pointsJSON: string`",
          "none",
          "Points are encoded as a JSON string, not a Lua table",
        ],
        [
          "`openstudio.setAutomationMode(trackId, param, mode)`",
          "`trackId: string, param: string, mode: string`",
          "none",
          'Set automation mode ("read", "write", "touch", "latch")',
        ],
        [
          "`openstudio.getAutomationMode(trackId, param)`",
          "`trackId: string, param: string`",
          "`string`",
          "Get automation mode",
        ],
        [
          "`openstudio.clearAutomation(trackId, param)`",
          "`trackId: string, param: string`",
          "none",
          "Clear all automation points",
        ],
      ],
    },

    { type: "h3", text: "Audio analysis" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        [
          "`openstudio.measureLUFS(filePath, startTime?, endTime?)`",
          "`filePath: string; times: number`",
          "`table or nil`",
          "Fields: integrated, shortTerm, momentary, truePeak, range",
        ],
        [
          "`openstudio.detectTransients(filePath, sensitivity?, minGapMs?)`",
          "`filePath: string; defaults: 0.5 and 50 ms`",
          "`table`",
          "Returns detected transient positions",
        ],
        [
          "`openstudio.reverseAudioFile(filePath)`",
          "`filePath: string`",
          "`string or nil`",
          "Returns the generated output path, or nil on failure",
        ],
        [
          "`openstudio.detectSilentRegions(filePath, thresholdDb?, minSilenceMs?, minSoundMs?, preAttackMs?, postReleaseMs?)`",
          "`Defaults: -48 dB, 200 ms, 100 ms, 10 ms, 50 ms`",
          "`table`",
          "Detects silent regions with timing controls in milliseconds",
        ],
      ],
    },

    { type: "h3", text: "Track freeze" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        [
          "`openstudio.freezeTrack(trackId)`",
          "`trackId: string`",
          "`table or nil`",
          "Returns the engine freeze result; inspect its fields",
        ],
        ["`openstudio.unfreezeTrack(trackId)`", "`trackId: string`", "`boolean`", "Unfreeze track (restore original)"],
      ],
    },

    { type: "h3", text: "Render" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        [
          "`openstudio.renderProject(source, startTime, endTime, filePath, format?, sampleRate?, bitDepth?, numChannels?, normalize?, addTail?, tailMs?)`",
          "`Required source/path: string; start/end: seconds`",
          "`boolean`",
          "Defaults: wav, 44100 Hz, 24 bit, stereo, no normalization or tail",
        ],
      ],
    },

    { type: "h3", text: "MIDI" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [["`openstudio.getMIDIDevices()`", "none", "`table`", "List available MIDI input devices"]],
    },

    { type: "h3", text: "Metronome" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`openstudio.setMetronomeEnabled(enabled)`", "`enabled: boolean`", "none", "Enable/disable metronome"],
        ["`openstudio.isMetronomeEnabled()`", "none", "`boolean`", "Check if metronome is enabled"],
      ],
    },

    { type: "h3", text: "Plugins" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`openstudio.scanForPlugins()`", "none", "none", "Trigger VST3 plugin scan"],
        ["`openstudio.getAvailablePlugins()`", "none", "`table`", "List all scanned plugins"],
      ],
    },

    { type: "h3", text: "Utility" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`openstudio.print(...)`", "any values", "none", "Print to script console"],
        ["`openstudio.getAppVersion()`", "none", "`string`", "Get OpenStudio version string"],
        ["`openstudio.showMessage(title, message)`", "`title, message: string`", "none", "Show a message dialog"],
        [
          "`openstudio.fileDialog(...)`",
          "`unavailable`",
          "`raises error`",
          "Select a file before running Lua and supply its explicit path",
        ],
      ],
    },

    { type: "h2", id: "more-examples", text: "More examples" },
    {
      type: "p",
      text: "Analysis functions take file paths, not track ids, so they work on any audio on disk. This script measures three files and prints integrated loudness and true peak for each. Adjust the paths for your OS.",
    },
    {
      type: "code",
      lang: "lua",
      code: `local files = { "C:/audio/verse.wav", "C:/audio/chorus.wav", "C:/audio/bridge.wav" }
for _, file in ipairs(files) do
    local stats = openstudio.measureLUFS(file)
    openstudio.print(file .. ": " .. stats.integrated .. " LUFS, peak " .. stats.truePeak .. " dBTP")
end`,
    },
    {
      type: "p",
      text: "Use returned values to inspect the engine without changing the project. For example, list the plugin names returned by the current scan:",
    },
    {
      type: "code",
      lang: "lua",
      code: `for _, plugin in ipairs(openstudio.getAvailablePlugins() or {}) do
    openstudio.print(plugin.name)
end`,
    },
    {
      type: "p",
      text: 'For a stereo master render of the first sixty seconds, call `openstudio.renderProject("master", 0, 60, "C:/output/mix.wav", "wav", 44100, 24, 2, false, false, 0)`. This returns a success boolean. Choose an explicit writable output path before running the script.',
    },

    { type: "h2", id: "tips", text: "Tips" },
    {
      type: "ul",
      items: [
        "Start with read-only tasks such as inspecting engine state or batch-measuring audio files.",
        "`openstudio.print()` is the debugging tool. Print ids and return values as you go; inspect returned values before continuing.",
        "Native mutation bindings are available, but do not provide the UI’s project synchronization or undo guarantees. Experiment in a disposable session.",
        "Save commonly used scripts as files so you can reuse them across projects.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "Other extension paths",
      text: `Lua is one of two supported extension paths; the other is JSFX-style script effects (S13FX) that run inside an FX chain. A native extension SDK is listed under Exploring on the [roadmap](${SITE_PATHS.roadmap}), conditional on demand for a stable ABI.`,
    },
  ],
};

export default doc;
