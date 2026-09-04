import { REPO, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: "OpenStudio ships a Lua scripting engine with access to most DAW functions: tracks, transport, FX chains, sends, automation, audio analysis, freeze, and offline render. Scripts automate repetitive setup work and build custom workflows without touching the C++ engine. This page covers the editor, the namespace, a compact API reference, and a few working scripts.",
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
        "Use `s13.print(...)` anywhere in the script to write your own messages to the console.",
      ],
    },
    {
      type: "p",
      text: "Scripts act on the open project. Save the project first if a script adds or removes tracks or FX, and keep the scripts you reuse as files on disk so they carry across projects.",
    },

    { type: "h2", id: "the-s13-namespace", text: "The s13 namespace" },
    {
      type: "p",
      text: "Every scripting function lives under `s13.*`. That prefix is a legacy name, kept so existing scripts keep working. Functions that add built-in effects carry the same history: `s13.addTrackS13FX` adds an OpenStudio effect by name, and the older `S13` effect names still resolve.",
    },
    {
      type: "p",
      text: "Track functions take a `trackId` string returned by `s13.addTrack`. Volume is in dB, pan runs from `-1.0` (left) to `1.0` (right), and times are in seconds. Master volume is linear (`0.0` to `2.0`) rather than dB. Read the argument column in the tables below before assuming a range.",
    },
    {
      type: "callout",
      tone: "note",
      label: "Scope of the API",
      text: `The tables below match the upstream reference at the time of writing. Functions that are not listed are not exposed to Lua. The canonical, versioned reference is [API.md in the repository](${REPO.apiDoc}).`,
    },

    { type: "h2", id: "a-first-script", text: "A first script" },
    {
      type: "p",
      text: "The script below builds a four-track band template: it adds tracks, sets levels and a pan, adds the built-in EQ to each track, and sets the tempo. Paste it into the editor and click **Run** on an empty project.",
    },
    {
      type: "code",
      lang: "lua",
      code: `-- Create tracks for a band recording
local drums = s13.addTrack("Drums OH")
local bass = s13.addTrack("Bass DI")
local guitar = s13.addTrack("Guitar")
local vocal = s13.addTrack("Vocal")

-- Set levels
s13.setTrackVolume(drums, -3.0)
s13.setTrackVolume(bass, -6.0)
s13.setTrackVolume(guitar, -6.0)
s13.setTrackVolume(vocal, 0.0)

-- Pan instruments
s13.setTrackPan(guitar, -0.3)

-- Add EQ to all tracks
for _, id in ipairs({ drums, bass, guitar, vocal }) do
    s13.addTrackS13FX(id, "OpenStudio EQ")
end

s13.setTempo(120)
s13.print("Band template ready!")`,
    },
    {
      type: "p",
      text: "Each `s13.addTrack` call returns the new track's id, which the later calls use. The `ipairs` loop is ordinary Lua; nothing in the API needs special iteration.",
    },

    { type: "h2", id: "api-reference", text: "API reference" },
    {
      type: "p",
      text: "Signatures are copied from the upstream reference. `none` in the Returns column means the function returns nothing; `table` means a Lua table whose fields are described in the last column.",
    },

    { type: "h3", text: "Track operations" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.getTrackCount()`", "none", "`number`", "Returns total number of tracks"],
        ["`s13.addTrack(name)`", "`name: string`", "`trackId: string`", "Creates a new audio track"],
        ["`s13.removeTrack(trackId)`", "`trackId: string`", "`boolean`", "Removes a track"],
        ["`s13.setTrackVolume(trackId, dB)`", "`trackId: string, dB: number`", "none", "Set track volume (-60 to +12 dB)"],
        ["`s13.setTrackPan(trackId, pan)`", "`trackId: string, pan: number`", "none", "Set track pan (-1.0 L to +1.0 R)"],
        ["`s13.setTrackMute(trackId, muted)`", "`trackId: string, muted: boolean`", "none", "Set track mute state"],
        ["`s13.setTrackSolo(trackId, soloed)`", "`trackId: string, soloed: boolean`", "none", "Set track solo state"],
        ["`s13.setTrackArm(trackId, armed)`", "`trackId: string, armed: boolean`", "none", "Set track record arm"],
        ["`s13.reorderTrack(fromIdx, toIdx)`", "`from: number, to: number`", "none", "Move track position"],
      ],
    },

    { type: "h3", text: "Transport" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.play()`", "none", "none", "Start playback"],
        ["`s13.stop()`", "none", "none", "Stop playback"],
        ["`s13.record()`", "none", "none", "Start recording (arms must be set)"],
        ["`s13.isPlaying()`", "none", "`boolean`", "Check if transport is playing"],
        ["`s13.isRecording()`", "none", "`boolean`", "Check if transport is recording"],
        ["`s13.getPlayhead()`", "none", "`number`", "Get playhead position in seconds"],
        ["`s13.setPlayhead(time)`", "`time: number`", "none", "Set playhead position in seconds"],
        ["`s13.getTempo()`", "none", "`number`", "Get current BPM"],
        ["`s13.setTempo(bpm)`", "`bpm: number`", "none", "Set tempo (20-999 BPM)"],
        ["`s13.getTimeSignature()`", "none", "`num, den`", "Get time signature (two return values)"],
        ["`s13.setTimeSignature(num, den)`", "`num: number, den: number`", "none", "Set time signature"],
        ["`s13.setLoop(enabled, start, end)`", "`enabled: boolean, start: number, end: number`", "none", "Set loop region"],
      ],
    },

    { type: "h3", text: "FX chain" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.getTrackFX(trackId)`", "`trackId: string`", "`table`", "Get list of track FX plugins"],
        ["`s13.getTrackInputFX(trackId)`", "`trackId: string`", "`table`", "Get list of input FX plugins"],
        ["`s13.addTrackFX(trackId, pluginId)`", "`trackId: string, pluginId: string`", "`boolean`", "Add FX plugin to track"],
        ["`s13.removeTrackFX(trackId, index)`", "`trackId: string, index: number`", "`boolean`", "Remove FX at index"],
        ["`s13.bypassTrackFX(trackId, index, bypassed)`", "`trackId: string, index: number, bypassed: boolean`", "none", "Toggle FX bypass"],
        ["`s13.addTrackS13FX(trackId, effectName)`", "`trackId: string, name: string`", "`boolean`", "Add a built-in OpenStudio effect (legacy `S13` names still work)"],
        ["`s13.getAvailableS13FX()`", "none", "`table`", "List available built-in OpenStudio effects"],
      ],
    },

    { type: "h3", text: "Master bus" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.setMasterVolume(volume)`", "`volume: number`", "none", "Set master volume (0.0 to 2.0 linear)"],
        ["`s13.getMasterVolume()`", "none", "`number`", "Get master volume"],
        ["`s13.setMasterPan(pan)`", "`pan: number`", "none", "Set master pan (-1.0 to +1.0)"],
        ["`s13.getMasterPan()`", "none", "`number`", "Get master pan"],
      ],
    },

    { type: "h3", text: "Sends" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.addTrackSend(trackId, destTrackId)`", "`trackId, destTrackId: string`", "`number`", "Add send, returns send index"],
        ["`s13.removeTrackSend(trackId, index)`", "`trackId: string, index: number`", "none", "Remove send at index"],
        ["`s13.setTrackSendLevel(trackId, index, level)`", "`trackId: string, index: number, level: number`", "none", "Set send level (0.0 to 1.0)"],
        ["`s13.getTrackSends(trackId)`", "`trackId: string`", "`table`", "Get all sends for a track"],
      ],
    },

    { type: "h3", text: "Playback clips" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.addPlaybackClip(file, start, duration, trackId, offset, volumeDB)`", "see args", "none", "Add audio clip for playback"],
        ["`s13.removePlaybackClip(trackId, file, start)`", "`trackId, file: string, start: number`", "none", "Remove a playback clip"],
        ["`s13.clearPlaybackClips()`", "none", "none", "Remove all playback clips"],
      ],
    },

    { type: "h3", text: "Automation" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.setAutomationPoints(trackId, param, points)`", "`trackId: string, param: string, points: table`", "none", "Set automation points (table of {time, value})"],
        ["`s13.setAutomationMode(trackId, param, mode)`", "`trackId: string, param: string, mode: string`", "none", "Set automation mode (\"read\", \"write\", \"touch\", \"latch\")"],
        ["`s13.getAutomationMode(trackId, param)`", "`trackId: string, param: string`", "`string`", "Get automation mode"],
        ["`s13.clearAutomation(trackId, param)`", "`trackId: string, param: string`", "none", "Clear all automation points"],
      ],
    },

    { type: "h3", text: "Audio analysis" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.measureLUFS(filePath)`", "`filePath: string`", "`table`", "Measure loudness (integrated, shortTerm, momentary, truePeak, range)"],
        ["`s13.detectTransients(filePath, threshold)`", "`filePath: string, threshold: number`", "`table`", "Detect transient positions in seconds"],
        ["`s13.reverseAudioFile(filePath, outputPath)`", "`filePath, outputPath: string`", "`boolean`", "Reverse an audio file"],
        ["`s13.detectSilentRegions(filePath, thresholdDB, minDuration)`", "`filePath: string, thresholdDB: number, minDuration: number`", "`table`", "Detect silent regions"],
      ],
    },

    { type: "h3", text: "Track freeze" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.freezeTrack(trackId)`", "`trackId: string`", "`boolean`", "Freeze track (render FX to audio)"],
        ["`s13.unfreezeTrack(trackId)`", "`trackId: string`", "`boolean`", "Unfreeze track (restore original)"],
      ],
    },

    { type: "h3", text: "Render" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.renderProject(filePath, format, bitDepth, sampleRate, startTime, endTime)`", "see args", "`boolean`", "Offline render project to file"],
      ],
    },

    { type: "h3", text: "MIDI" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [["`s13.getMIDIDevices()`", "none", "`table`", "List available MIDI input devices"]],
    },

    { type: "h3", text: "Metronome" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.setMetronomeEnabled(enabled)`", "`enabled: boolean`", "none", "Enable/disable metronome"],
        ["`s13.isMetronomeEnabled()`", "none", "`boolean`", "Check if metronome is enabled"],
      ],
    },

    { type: "h3", text: "Plugins" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.scanForPlugins()`", "none", "none", "Trigger VST3 plugin scan"],
        ["`s13.getAvailablePlugins()`", "none", "`table`", "List all scanned plugins"],
      ],
    },

    { type: "h3", text: "Utility" },
    {
      type: "table",
      head: ["Function", "Arguments", "Returns", "Description"],
      rows: [
        ["`s13.print(...)`", "any values", "none", "Print to script console"],
        ["`s13.getAppVersion()`", "none", "`string`", "Get OpenStudio version string"],
        ["`s13.showMessage(title, message)`", "`title, message: string`", "none", "Show a message dialog"],
        ["`s13.fileDialog(title, filters)`", "`title, filters: string`", "`string`", "Open file picker dialog"],
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
    local stats = s13.measureLUFS(file)
    s13.print(file .. ": " .. stats.integrated .. " LUFS, peak " .. stats.truePeak .. " dBTP")
end`,
    },
    {
      type: "p",
      text: "The upstream reference also shows adding the built-in EQ to every existing track by walking the track count. It passes the loop index as a string id, exactly as written in the reference.",
    },
    {
      type: "code",
      lang: "lua",
      code: `for i = 1, s13.getTrackCount() do
    -- Add built-in EQ to every track
    s13.addTrackS13FX(tostring(i), "OpenStudio EQ")
end`,
    },
    {
      type: "p",
      text: `Rendering from a script uses the same offline engine as the Render dialog: \`s13.renderProject("C:/output/mix.wav", "wav", 24, 44100, 0, 60)\` writes the first sixty seconds as 24-bit WAV at 44.1 kHz. The dialog's options are described in [Rendering & export](${V2_PATHS.docs}/rendering-and-export).`,
    },

    { type: "h2", id: "tips", text: "Tips" },
    {
      type: "ul",
      items: [
        "Use scripts for the jobs you repeat: adding the same FX chain to every vocal track, building a session template, or batch-measuring loudness.",
        "`s13.print()` is the debugging tool. Print ids and return values as you go; the console is the only place a script talks back.",
        "Scripts can reach all track, transport, FX, and automation functions, so a script can do anything those panels can do, including destructive changes. Save before running one you have not tested.",
        "Save commonly used scripts as files so you can reuse them across projects.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "Other extension paths",
      text: `Lua is one of two supported extension paths; the other is JSFX-style script effects (S13FX) that run inside an FX chain. A native extension SDK is listed under Exploring on the [roadmap](${V2_PATHS.roadmap}), conditional on demand for a stable ABI.`,
    },
  ],
};

export default doc;
