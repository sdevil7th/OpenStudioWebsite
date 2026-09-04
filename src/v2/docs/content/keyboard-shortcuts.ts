import { REPO, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: "The default OpenStudio keyboard profile, its mouse and scroll gestures, and the profile system that lets you borrow another DAW's conventions or build your own.",
    },

    { type: "h2", id: "how-to-read-this-page", text: "How to read this page" },
    {
      type: "p",
      text: "Every shortcut below belongs to the **OpenStudio** keyboard profile, the one active on a fresh install. `Ctrl` in the tables means `Primary`: Ctrl on Windows and Linux, Cmd on macOS. Where a gesture uses the physical Alt key, the tables say `Alt/Option`.",
    },
    {
      type: "p",
      text: "Other built-in profiles, per-platform bindings, custom overrides, and the active editor scope can change or deliberately unassign any of these keys. Open **Help → Keyboard Shortcuts** for the effective map on your machine; the action list there is searchable and shows each binding's scope.",
    },
    {
      type: "callout",
      tone: "note",
      label: "F1 is not the key map",
      text: "`F1` opens the **Help Reference**, a searchable guide to the app. The shortcut list and profile selectors live in a separate window under **Help → Keyboard Shortcuts**. **Help → Getting Started Guide** walks through navigation gestures and the first-session hotkeys.",
    },

    { type: "h2", id: "default-profile", text: "Default keyboard profile" },
    {
      type: "p",
      text: "The first-session set is small: `Space`, `Ctrl+R`, `Ctrl+T`, `Ctrl+M`, `S`, `B`, `Delete`, `Ctrl+S`, `F1`, and `Ctrl+Shift+P`. Everything else in the tables is there when you want it, and `Ctrl+Shift+P` opens the Command Palette, which finds any action by name whether or not it has a key.",
    },

    { type: "h3", text: "Transport" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["Play / Pause", "`Space`"],
        ["Stop", "No separate default"],
        ["Record", "`Ctrl+R`"],
        ["Go to Start", "`Home`"],
        ["Toggle Loop", "`L`"],
        ["Set Loop to Selection", "`Ctrl+L`"],
        ["Tap Tempo", "`T`"],
      ],
    },

    { type: "h3", text: "File" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["New Project", "`Ctrl+N`"],
        ["Open Project", "`Ctrl+O`"],
        ["Open (Safe Mode)", "`Ctrl+Shift+O`"],
        ["Save Project", "`Ctrl+S`"],
        ["Save As", "`Ctrl+Shift+S`"],
        ["Close Project", "`Ctrl+F4`"],
        ["Render / Export", "`Ctrl+Alt+R`"],
        ["Project Settings", "`Alt+Enter`"],
        ["Quit", "`Ctrl+Q`"],
      ],
    },

    { type: "h3", text: "Edit" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["Undo", "`Ctrl+Z`"],
        ["Redo", "`Ctrl+Shift+Z`"],
        ["Cut", "`Ctrl+X`"],
        ["Copy", "`Ctrl+C`"],
        ["Paste", "`Ctrl+V`"],
        ["Delete Selected", "`Delete`"],
        ["Select All Tracks", "`Ctrl+A`"],
        ["Select All Clips", "`Ctrl+Shift+A`"],
        ["Deselect All", "`Esc`"],
        ["Split at Cursor", "`S`"],
        ["Group Selected Clips", "`Ctrl+G`"],
        ["Ungroup Selected Clips", "`Ctrl+Shift+G`"],
        ["Toggle Clip Mute", "`U`"],
        ["Nudge Left", "`Left`"],
        ["Nudge Right", "`Right`"],
        ["Nudge Left (Fine)", "`Ctrl+Left`"],
        ["Nudge Right (Fine)", "`Ctrl+Right`"],
      ],
    },

    { type: "h3", text: "Tools" },
    {
      type: "table",
      head: ["Tool", "Shortcut"],
      rows: [
        ["Select Tool", "`V`"],
        ["Split Tool", "`B`"],
        ["Mute Tool", "`X`"],
        ["Smart Tool", "`Y`"],
      ],
    },

    { type: "h3", text: "Insert" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["New Audio Track", "`Ctrl+T`"],
        ["New MIDI Track", "`Ctrl+Shift+T`"],
        ["Quick Add Instrument Track", "`Ctrl+Shift+I`"],
        ["Import Media File", "`Insert`"],
        ["Add Marker", "`M`"],
        ["Add Named Marker", "`Shift+M`"],
        ["Add Region from Selection", "`Shift+R`"],
      ],
    },

    { type: "h3", text: "View" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["Toggle Mixer", "`Ctrl+M`"],
        ["Toggle Virtual MIDI Keyboard", "`Alt+B`"],
        ["Toggle Undo History", "`Ctrl+Alt+Z`"],
        ["Clip Properties", "`F2`"],
        ["Help Reference", "`F1`"],
        ["Keyboard Shortcuts", "Help menu"],
        ["Zoom to Time Selection", "`Ctrl+Shift+E`"],
        ["Zoom In", "`Ctrl++`"],
        ["Zoom Out", "`Ctrl+-`"],
        ["Zoom to Fit", "`Ctrl+0`"],
        ["Save Screenset 1", "`Ctrl+Shift+1`"],
        ["Save Screenset 2", "`Ctrl+Shift+2`"],
        ["Save Screenset 3", "`Ctrl+Shift+3`"],
        ["Load Screenset 1", "`Ctrl+1`"],
        ["Load Screenset 2", "`Ctrl+2`"],
        ["Load Screenset 3", "`Ctrl+3`"],
        ["Command Palette", "`Ctrl+Shift+P`"],
      ],
    },
    {
      type: "p",
      text: "Screensets store which panels are visible and how they are laid out, so the three save and load pairs give you quick switches between, say, an editing view, a mixing view, and a mastering view.",
    },

    { type: "h3", text: "Navigation" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["Next Transient", "`Tab`"],
        ["Previous Transient", "`Shift+Tab`"],
      ],
    },

    { type: "h3", text: "Options" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["Preferences", "`Ctrl+,`"],
        ["Tap Tempo", "`T`"],
      ],
    },

    { type: "h3", text: "MIDI" },
    {
      type: "table",
      head: ["Action", "Shortcut"],
      rows: [
        ["Quantize Notes Using Last Settings", "`Q`"],
        ["Transpose +1 Semitone", "via menu or command palette"],
        ["Transpose -1 Semitone", "via menu or command palette"],
        ["Transpose Octave Up (+12)", "via menu or command palette"],
        ["Transpose Octave Down (-12)", "via menu or command palette"],
        ["Velocity +10%", "via menu or command palette"],
        ["Velocity -10%", "via menu or command palette"],
        ["Reverse MIDI Notes", "via menu or command palette"],
        ["Invert MIDI Note Pitches", "via menu or command palette"],
        ["Select All Notes", "`Ctrl+A`"],
      ],
    },
    {
      type: "p",
      text: `The MIDI transforms have no default key. Bind them in a custom profile if you use them often. Editing inside the piano roll is covered in [MIDI & piano roll](${V2_PATHS.docs}/midi-and-piano-roll).`,
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
        "Open **Help → Keyboard Shortcuts**.",
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
      text: "A profile maps documented source-DAW conventions onto equivalent OpenStudio actions. It does not claim to reproduce commands OpenStudio has no match for. Most profiles keep the OpenStudio binding where the source defines no override; explicit empty mappings prevent known collisions. Digital Performer, Waveform, and Renoise use a strict policy, so commands without a verified mapping stay unassigned. `Esc` for closing an active modal is the one deliberate exception and stays bound everywhere.",
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
      text: "The Keyboard Shortcuts window creates named profiles on top of any built-in base. A custom profile can be created, duplicated, renamed, deleted, exported to JSON, and imported again. Custom shortcut editing lives here, not in Preferences, and named profiles currently apply to the keyboard only; mouse overrides are per-gesture settings on the selected mouse base.",
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
      text: "Bindings resolve by scope, so the same key can mean different things in different editors. The scopes are global, Timeline/ruler, track controls, Mixer, Piano Roll, Pitch Editor, automation, browser, plug-in, modal, and contextual surfaces. Text entry and active shortcut capture take precedence, so typing in a field never fires a DAW command.",
    },
    {
      type: "p",
      text: "An imported profile is schema-checked, size-limited, and normalised, and it is rejected if it names unknown actions or unreachable key combinations. Imports land as a copy with a fresh local identity rather than silently overwriting an existing profile.",
    },
    { type: "h2", id: "printing-a-cheat-sheet", text: "Printing a cheat sheet" },
    {
      type: "p",
      text: "In **Help → Keyboard Shortcuts**, click **Print** to generate a cheat sheet for the current profile and platform. It reflects your custom overrides and unassignments, which the static tables on this page do not.",
    },
    {
      type: "p",
      text: `If a key stops working, check focus first (a focused text field disables shortcuts until you press \`Esc\`), then confirm the selected profile, the platform override, and the action's scope in the shortcut window. The full checklist is in [Troubleshooting](${V2_PATHS.docs}/troubleshooting).`,
    },
  ],
};

export default doc;
