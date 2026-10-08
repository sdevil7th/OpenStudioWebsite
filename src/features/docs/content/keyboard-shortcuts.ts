import { REPO } from "@/data/siteContent";
import { SITE_PATHS } from "@/constants/routes";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-10-05",
  appReference: { commit: "52cbd7c", channel: "development" },
  blocks: [
    {
      type: "p",
      text: "Cubase automation update: the unshipped working tree reviewed on top of app commit `7f59cff` maps `F6` to the envelope panel, `Alt/Option+R` to all-track Read and `Alt/Option+W` to all-track Write. These are Cubase-profile bindings; the default OpenStudio tables below are unchanged. Write also enables Read, and switching Write off leaves Read on. Master R/W is controlled separately.",
    },
    {
      type: "p",
      text: "The default OpenStudio keyboard profile, its mouse and scroll gestures, and the profile system that lets you borrow another DAW's conventions or build your own.",
    },

    { type: "h2", id: "how-to-read-this-page", text: "How to read this page" },
    {
      type: "p",
      text: "The keyboard tables show the **OpenStudio** profile active on a fresh install, with separate Windows/Linux and macOS columns checked against the development checkout on October 5. The app's portable keyboard `Ctrl` maps to Cmd on macOS, and its legacy keyboard `Alt` maps to physical Ctrl on macOS. Mouse gestures use `Primary` for Ctrl/Cmd and `Alt/Option` for physical Alt/Option.",
    },
    {
      type: "p",
      text: "Other built-in profiles, per-platform bindings, custom overrides, and the active editor scope can change or deliberately unassign any of these keys. Open **Help → Keyboard, Mouse & Trackpad** for the effective map on your machine; the action list there is searchable and shows each binding's scope.",
    },
    {
      type: "callout",
      tone: "note",
      label: "F1 is not the key map",
      text: "`F1` opens the **Help Reference**, a searchable guide to the app. The shortcut list and profile selectors live in a separate window under **Help → Keyboard, Mouse & Trackpad**. **Help → Getting Started Guide** walks through navigation gestures and the first-session hotkeys.",
    },

    { type: "h2", id: "default-profile", text: "Default keyboard profile" },
    {
      type: "p",
      text: "The first-session set is small: `Space`, `Ctrl+R`, `Ctrl+T`, `Ctrl+M`, `S`, `B`, `Delete`, `Ctrl+S`, `F1`, and `Ctrl+Shift+P`. Everything else in the tables is there when you want it, and `Ctrl+Shift+P` opens the Command Palette, which finds any action by name whether or not it has a key.",
    },

    { type: "h3", text: "Transport" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["Play / Stop", "`Space`", "`Space`"],
        ["Stop", "No separate default", "No separate default"],
        ["Record", "`Ctrl+R`", "`Cmd+R`"],
        ["Go to Start", "`Home`", "`Home`"],
        ["Toggle Loop", "`L`", "`L`"],
        ["Toggle Metronome Enable", "`K`", "`K`"],
        ["Start / Stop Click-Only Metronome", "`Ctrl+Shift+Space`", "`Cmd+Shift+Space`"],
        ["Set Loop to Selection", "`Ctrl+L`", "`Cmd+L`"],
        ["Tap Tempo", "`T`", "`T`"],
      ],
    },

    {
      type: "callout",
      tone: "note",
      label: "Development checkout: click-only shortcut",
      text: "Unreleased October 5 working-tree addition after app commit 52cbd7c: Ctrl+Shift+Space (Cmd+Shift+Space on macOS) mirrors Play click only / Stop click only in Metronome Settings, including with the dialog closed. It is assigned in all 19 built-in profiles and can be customized or disabled. It changes standalone practice only: transport, recording and Enable remain unchanged. If Enable is on during playback or recording, Stop click only can leave the transport-driven click sounding. Plain Space continues to start/stop transport, including an active recording; the Play/Pause button can pause separately.",
    },

    { type: "h3", text: "File" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["New Project", "`Ctrl+N`", "`Cmd+N`"],
        ["Open Project", "`Ctrl+O`", "`Cmd+O`"],
        ["Open (Safe Mode)", "`Ctrl+Shift+O`", "`Cmd+Shift+O`"],
        ["Import Audio", "`Ctrl+I`", "`Cmd+I`"],
        ["Import MIDI", "`Ctrl+Alt+I`", "`Cmd+Ctrl+I`"],
        ["Save Project", "`Ctrl+S`", "`Cmd+S`"],
        ["Save As", "`Ctrl+Shift+S`", "`Cmd+Shift+S`"],
        ["Close Project", "`Ctrl+F4`", "`Cmd+F4`"],
        ["Render / Export", "`Ctrl+Alt+R`", "`Cmd+Ctrl+R`"],
        ["Project Settings", "`Alt+Enter`", "`Ctrl+Enter`"],
        ["Quit", "`Ctrl+Q`", "`Cmd+Q`"],
      ],
    },

    { type: "h3", text: "Edit" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["Undo", "`Ctrl+Z`", "`Cmd+Z`"],
        ["Redo", "`Ctrl+Shift+Z`", "`Cmd+Shift+Z`"],
        ["Cut", "`Ctrl+X`", "`Cmd+X`"],
        ["Copy", "`Ctrl+C`", "`Cmd+C`"],
        ["Paste", "`Ctrl+V`", "`Cmd+V`"],
        ["Duplicate", "`Ctrl+D`", "`Cmd+D`"],
        ["Delete Selected", "`Delete`", "`Delete`"],
        ["Select All Tracks", "`Ctrl+A`", "`Cmd+A`"],
        ["Select All Clips", "`Ctrl+Shift+A`", "`Cmd+Shift+A`"],
        ["Deselect All", "`Esc`", "`Esc`"],
        ["Split at Cursor", "`S`", "`S`"],
        ["Group Selected Clips", "`Ctrl+G`", "`Cmd+G`"],
        ["Ungroup Selected Clips", "`Ctrl+Shift+G`", "`Cmd+Shift+G`"],
        ["Toggle Clip Mute", "`U`", "`U`"],
        ["Nudge Left", "`Left`", "`Left`"],
        ["Nudge Right", "`Right`", "`Right`"],
        ["Nudge Left (Fine)", "`Ctrl+Left`", "`Cmd+Left`"],
        ["Nudge Right (Fine)", "`Ctrl+Right`", "`Cmd+Right`"],
      ],
    },

    { type: "h3", text: "Tools" },
    {
      type: "table",
      head: ["Tool", "Windows / Linux", "macOS"],
      rows: [
        ["Select Tool", "`V`", "`V`"],
        ["Split Tool", "`B`", "`B`"],
        ["Mute Tool", "`X`", "`X`"],
        ["Smart Tool", "`Y`", "`Y`"],
      ],
    },

    { type: "h3", text: "Insert" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["New Audio Track", "`Ctrl+T`", "`Cmd+T`"],
        ["New AI Track", "`Ctrl+Alt+T`", "`Cmd+Ctrl+T`"],
        ["New MIDI Track", "`Ctrl+Shift+T`", "`Cmd+Shift+T`"],
        ["Quick Add Instrument Track", "`Ctrl+Shift+I`", "`Cmd+Shift+I`"],
        ["Import Media File", "`Insert`", "`Insert`"],
        ["Add Marker", "`M`", "`M`"],
        ["Add Named Marker", "`Shift+M`", "`Shift+M`"],
        ["Add Region from Selection", "`Shift+R`", "`Shift+R`"],
      ],
    },

    { type: "h3", text: "View" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["Toggle Mixer", "`Ctrl+M`", "`Cmd+M`"],
        ["Toggle Virtual MIDI Keyboard", "`Alt+B`", "`Ctrl+B`"],
        ["Toggle Undo History", "`Ctrl+Alt+Z`", "`Cmd+Ctrl+Z`"],
        ["Clip Properties", "`F2`", "`F2`"],
        ["Edit Pitch", "`P`", "`P`"],
        ["Help Reference", "`F1`", "`F1`"],
        ["Keyboard, Mouse & Trackpad", "Help menu", "Help menu"],
        ["Zoom to Time Selection", "`Ctrl+Shift+E`", "`Cmd+Shift+E`"],
        ["Zoom In", "`Ctrl++`", "`Cmd++`"],
        ["Zoom Out", "`Ctrl+-`", "`Cmd+-`"],
        ["Zoom to Fit", "`Ctrl+0`", "`Cmd+0`"],
        ["Save Screenset 1", "`Ctrl+Shift+1`", "`Cmd+Shift+1`"],
        ["Save Screenset 2", "`Ctrl+Shift+2`", "`Cmd+Shift+2`"],
        ["Save Screenset 3", "`Ctrl+Shift+3`", "`Cmd+Shift+3`"],
        ["Load Screenset 1", "`Ctrl+1`", "`Cmd+1`"],
        ["Load Screenset 2", "`Ctrl+2`", "`Cmd+2`"],
        ["Load Screenset 3", "`Ctrl+3`", "`Cmd+3`"],
        ["Command Palette", "`Ctrl+Shift+P`", "`Cmd+Shift+P`"],
      ],
    },
    {
      type: "p",
      text: "Screensets store which panels are visible and how they are laid out, so the three save and load pairs give you quick switches between, say, an editing view, a mixing view, and a mastering view.",
    },

    { type: "h3", text: "Navigation" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["Next Transient", "`Tab`", "`Tab`"],
        ["Previous Transient", "`Shift+Tab`", "`Shift+Tab`"],
      ],
    },

    { type: "h3", text: "Options" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["Preferences", "`Ctrl+,`", "`Cmd+,`"],
        ["Tap Tempo", "`T`", "`T`"],
      ],
    },

    { type: "h3", text: "MIDI" },
    {
      type: "table",
      head: ["Action", "Windows / Linux", "macOS"],
      rows: [
        ["Quantize Notes Using Last Settings", "`Q`", "`Q`"],
        ["Transpose +1 Semitone", "via menu or command palette", "via menu or command palette"],
        ["Transpose -1 Semitone", "via menu or command palette", "via menu or command palette"],
        ["Transpose Octave Up (+12)", "via menu or command palette", "via menu or command palette"],
        ["Transpose Octave Down (-12)", "via menu or command palette", "via menu or command palette"],
        ["Velocity +10%", "via menu or command palette", "via menu or command palette"],
        ["Velocity -10%", "via menu or command palette", "via menu or command palette"],
        ["Reverse MIDI Notes", "via menu or command palette", "via menu or command palette"],
        ["Invert MIDI Note Pitches", "via menu or command palette", "via menu or command palette"],
        ["Select All Notes", "`Ctrl+A`", "`Cmd+A`"],
        ["MIDI Panic", "`Ctrl+Alt+P`", "`Cmd+Ctrl+P`"],
      ],
    },
    {
      type: "p",
      text: `The named global MIDI transform commands above are unassigned by default. Inside the Piano Roll, use Up/Down for semitone transposition and Shift+Up/Down for octave transposition. Scope matters: M adds a marker globally but mutes a focused track; S splits clips but solos a focused track. Open Help → Keyboard, Mouse & Trackpad to inspect the effective scope and bindings. See [MIDI & piano roll](${SITE_PATHS.docs}/midi-and-piano-roll).`,
    },

    { type: "h2", id: "mouse-and-scroll-gestures", text: "Mouse and scroll gestures" },
    {
      type: "p",
      text: "Most gestures live on the timeline. `Primary+Scroll` zooms around the pointer, from 1 to 1000 pixels per second; the rest are in the table.",
    },
    {
      type: "table",
      head: ["Surface / action", "OpenStudio mouse gesture"],
      rows: [
        ["Vertical workspace scroll", "Scroll"],
        ["Timeline zoom", "Primary+Scroll"],
        ["Horizontal timeline scroll", "Shift+Scroll"],
        ["Resize track height", "Alt/Option+Scroll"],
        ["Zoom waveform height", "Primary+Shift+Scroll"],
        ["Move / copy clip", "Drag / Primary+Drag"],
        ["Slip-edit clip contents", "Primary+Shift+Drag"],
        ["Axis-lock clip move", "Shift+Drag; locks to the first axis that crosses the threshold"],
        ["Move clip without snap", "Alt/Option+Drag"],
        ["Resize / fine resize clip edge", "Drag / Primary+Drag edge"],
        ["Symmetric resize / stretch clip", "Shift+Drag / Alt/Option+Drag edge"],
        ["Seek on empty timeline", "Click"],
        ["Select range / extend selection", "Primary+Click-drag / Shift+Click-drag"],
        ["Create a razor edit", "Alt/Option+Drag empty timeline"],
        ["Select / toggle / range-select track", "Click / Primary+Click / Shift+Click track header"],
        ["Solo track", "Alt/Option+Click track header"],
        ["Move / fine-move automation point", "Drag / Primary+Drag"],
        ["Constrain automation point vertically / delete", "Shift+Drag / Alt/Option+Click point"],
        ["Adjust / fine-adjust fade handle", "Drag / Primary+Drag"],
        ["Symmetric fade / cycle fade shape", "Shift+Drag / Alt/Option+Click handle"],
        ["Seek from ruler", "Click ruler"],
        ["Set loop / time selection / zoom range", "Primary+Drag / Shift+Drag / Alt/Option+Drag ruler"],
        ["Context menu", "Right-click"],
      ],
    },
    {
      type: "p",
      text: "Time selections come from `Primary+Drag` on the timeline background or `Shift+Drag` on the ruler. Razor edits come from `Alt/Option+Drag` on the background and show as semi-transparent areas. Preferences shows the current mouse behaviour and the exact modifier overrides in force.",
    },

    { type: "h2", id: "input-profiles", text: "Input profiles" },
    {
      type: "p",
      text: "OpenStudio can adopt another DAW's input conventions without changing the project or the audio engine. Keyboard and mouse/scroll behaviour are separate choices, so Cubase-style keys with REAPER-style timeline scrolling is a valid combination.",
    },
    {
      type: "ol",
      items: [
        "Open **Options → Keyboard, Mouse & Trackpad** (also available in **Help**).",
        "Choose a **Keyboard profile**.",
        "Choose a separate **Mouse & scroll profile**.",
        "Search the action list to see the effective keys and their active scope.",
      ],
    },
    {
      type: "p",
      text: "The first-run profile card exposes both selectors too. There are 19 built-in profile families:",
    },
    {
      type: "table",
      head: ["Built-in profile families", "", "", ""],
      rows: [
        ["OpenStudio", "Pro Tools", "Cubase / Nuendo", "REAPER"],
        ["Audacity", "Logic Pro", "FL Studio", "Ableton Live"],
        ["Studio One", "Bitwig Studio", "Reason", "Cakewalk / Sonar"],
        ["GarageBand", "Digital Performer", "Ardour", "Adobe Audition"],
        ["Mixcraft", "Waveform", "Renoise", ""],
      ],
    },
    {
      type: "p",
      text: "A profile maps documented source-DAW conventions onto equivalent OpenStudio actions. It does not claim to reproduce commands OpenStudio has no match for. Most profiles keep the OpenStudio binding where the source defines no override; explicit empty mappings prevent known collisions. Digital Performer, Waveform, and Renoise use a strict policy, so commands without a verified mapping stay unassigned. `Esc` for closing an active modal and the OpenStudio-specific click-only metronome shortcut are deliberately bound everywhere.",
    },
    {
      type: "p",
      text: "Every profile is selectable on every platform. When the source DAW is not native to your operating system, the selector labels it as **cross-platform emulation**. Printed key names are normalised for the current platform, including the Command/Control and Option/Alt distinctions.",
    },
    {
      type: "callout",
      tone: "note",
      label: "Published defaults only",
      text: `Profiles follow each vendor's published default shortcut sheets, last validated on 2026-08-21. They do not reproduce a customised map you built in the other DAW. Source links are listed in the [upstream profiles document](${REPO.inputProfilesDoc}).`,
    },

    { type: "h2", id: "custom-profiles", text: "Custom keyboard profiles" },
    {
      type: "p",
      text: "The Keyboard, Mouse & Trackpad window creates named profiles on top of any built-in base. A custom profile can be created, duplicated, renamed, deleted, exported to JSON, and imported again. Custom shortcut editing lives here, not in Preferences, and named profiles currently apply to the keyboard only; mouse overrides are per-gesture settings on the selected mouse base.",
    },
    {
      type: "p",
      text: "For each action you can:",
    },
    {
      type: "ul",
      items: [
        "add more than one key combination;",
        "create an all-platform binding or a macOS, Windows, Linux, or fallback override;",
        "intentionally disable the action for the selected target;",
        "remove an override and inherit the built-in base again;",
        "review conflicts before an overlapping binding is accepted.",
      ],
    },
    {
      type: "p",
      text: "Bindings resolve by scope, so the same key can mean different things in different editors. The scopes are global, Timeline/ruler, track controls, Mixer, Piano Roll, Pitch Editor, automation, browser, plug-in, modal, and contextual surfaces. Ordinary typing, native text-editing shortcuts, input-method composition and active shortcut capture take precedence. Recognized global modifier shortcuts can still run while a text field is focused; focus does not disable every command.",
    },
    {
      type: "p",
      text: "An imported profile is schema-checked, size-limited, and normalised, and it is rejected if it names unknown actions or unreachable key combinations. Imports land as a copy with a fresh local identity rather than silently overwriting an existing profile.",
    },
    { type: "h2", id: "printing-a-cheat-sheet", text: "Printing a cheat sheet" },
    {
      type: "p",
      text: "In **Help → Keyboard, Mouse & Trackpad**, click **Print** to generate a cheat sheet for the current profile and platform. It reflects your custom overrides and unassignments, which the static tables on this page do not.",
    },
    {
      type: "p",
      text: `If a key stops working, check which window and editor have focus first (ordinary typing belongs to text fields, and native plug-in editors may consume their own keys), then confirm the selected profile, the platform override, and the action's scope in the shortcut window. The full checklist is in [Troubleshooting](${SITE_PATHS.docs}/troubleshooting).`,
    },
  ],
};

export default doc;
