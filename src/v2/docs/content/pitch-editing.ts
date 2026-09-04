import { REPO, SHOTS, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: `OpenStudio has two ways to fix pitch. The graphical **Pitch Editor** analyses a monophonic audio clip, shows its notes, and lets you reshape them before an offline correction is rendered back into the clip. The built-in real-time pitch corrector is an FX-chain effect for live or immediate corrective work. This page covers both, and is written from the upstream [implemented features list](${REPO.implementedFeatures}); where that source is thin, this page stays thin too.`,
    },

    { type: "h2", id: "what-it-is", text: "What the Pitch Editor is" },
    {
      type: "p",
      text: "Open the Pitch Editor for a selected audio clip. It lives inside the main window rather than in a detached view. The clip is analysed with a monophonic YIN pitch tracker and segmented into notes. Each note appears as a blob on a piano grid, with the detected pitch contour drawn through it, so you can see at a glance which notes sit on a grid line and which drift sharp or flat. The view zooms and scrolls so a long phrase and a single note are both workable.",
    },
    {
      type: "shot",
      src: SHOTS.pitchEditor,
      alt: "The OpenStudio Pitch Editor showing note blobs and a pitch contour on a piano grid",
      caption: "Note blobs on the piano grid with the detected contour. The scale and key controls decide where notes snap.",
    },
    {
      type: "p",
      text: `This is different from the clip-level **pitch shift** in the arrangement, which transposes a whole clip and, like time stretch, uses FFmpeg on macOS and Linux. The Pitch Editor works note by note. It is also separate from hosting a third-party pitch editor over ARA; see [Plugins & scanning](${V2_PATHS.docs}/plugins-and-scanning) for that path.`,
    },

    { type: "h2", id: "tools", text: "The tools" },
    {
      type: "p",
      text: "Six tools act on the selected notes. The names are the upstream feature list's; each changes one aspect of the contour and leaves the rest alone.",
    },
    {
      type: "table",
      head: ["Tool", "What it changes"],
      rows: [
        ["**Pitch**", "The note's centre pitch: moves the whole note."],
        ["**Drift**", "The slow pitch movement within a note, without touching its centre."],
        ["**Vibrato**", "The amount of periodic pitch movement within a note."],
        ["**Transition**", "How one note moves into the next: the shape and speed of the slide between them."],
        ["**Draw**", "Freehand editing of the contour itself."],
        ["**Split**", "Divides one detected note into two, for when segmentation merged two pitches or a phrase needs a cut."],
      ],
    },
    {
      type: "p",
      text: "Undo and redo cover every edit in the editor, and the editor keeps an A/B comparison state so you can flip between the analysed original and your edited version by ear before you commit. Keyboard bindings for the editor have their own **Pitch Editor** scope in **Help → Keyboard Shortcuts**, so a key that works on the timeline may do something else here.",
    },

    { type: "h2", id: "snapping", text: "Scale, key, and snapping" },
    {
      type: "p",
      text: "Set the key and scale, and dragged notes snap to scale degrees. Switch to chromatic snap to allow every semitone. The correct-pitch macro applies a correction to every selected note at once, pulling each blob to its nearest snap target, which is the fastest way to tidy a take before you go back and adjust individual notes by hand. Scale detection reads the analysed material and proposes a key and scale, so you do not have to know the key in advance.",
    },
    {
      type: "callout",
      tone: "note",
      label: "Snapping is a starting point",
      text: "A note snapped exactly to its centre is not always the musical answer. Snap first, then use Drift, Vibrato, and Transition to give the corrected notes back some movement.",
    },

    { type: "h2", id: "preview-and-render", text: "Preview, HQ render, and apply" },
    {
      type: "p",
      text: "While you edit, the editor previews the corrected result so you can hear an edit without a full render; scrub preview lets you hear a position under the cursor. Preview is the quick path. For an accurate check, the editor renders in HQ, either a single note or the full clip, and shows which state it is in so you know whether you are hearing the preview engine or the render.",
    },
    {
      type: "ol",
      items: [
        "Analyse the clip and confirm the notes are segmented the way you expect. Use Split where two notes were merged.",
        "Choose a key and scale, or accept the detected one, and run the correct-pitch macro if the take needs broad tidying.",
        "Adjust individual notes with the Pitch, Drift, Vibrato, and Transition tools, previewing as you go.",
        "Compare against the original with A/B at a matched level.",
        "Apply. The offline monophonic correction is rendered into the clip's audio and the result lands back on the timeline.",
      ],
    },
    {
      type: "p",
      text: "Applying is an offline render, not a live process; the preview and HQ states exist so you can hear the result before that render happens.",
    },

    { type: "h2", id: "real-time-corrector", text: "The real-time pitch corrector" },
    {
      type: "p",
      text: `For live use, or when you want correction to follow whatever is on the track without rendering, add the built-in real-time pitch corrector to the track's FX chain like any other built-in effect (click **FX** on the track header, then add it from the built-in list). It works in the auto-tune style: the incoming signal is tracked and pulled toward the nearest scale note as it plays. It has the same bypass, preset, and chain-order behaviour as the other built-in effects described in [Mixing & routing](${V2_PATHS.docs}/mixing-and-routing).`,
    },
    {
      type: "p",
      text: "Use the corrector when you need a result now or the vocal is still being tracked. Use the Pitch Editor when the performance is the final take and you want to decide each note yourself.",
    },

    { type: "h2", id: "limits", text: "What it does not do yet" },
    {
      type: "callout",
      tone: "warn",
      label: "Monophonic only",
      text: "The Pitch Editor's correction path is monophonic: one voice at a time. Polyphonic pitch detection and MIDI extraction exist through Basic Pitch, but polyphonic pitch correction and solo-note resynthesis are not shipped; the upstream feature list marks that component as still stub-like. Chords, double-tracked vocals, and full mixes are outside its scope.",
    },
    {
      type: "p",
      text: `Polyphonic detection is what drives **Audio to MIDI**, which creates an adjacent MIDI track from an audio clip with undo support. Basic Pitch inference only runs in ONNX-enabled builds, which today means the Windows and Linux release pipelines. The macOS release bundles the model file but does not provision ONNX Runtime, so audio-to-MIDI is unavailable there. See [AI Tools setup](${V2_PATHS.docs}/ai-runtime-setup) for the platform notes and [MIDI & piano roll](${V2_PATHS.docs}/midi-and-piano-roll) for what to do with the extracted notes.`,
    },
    {
      type: "p",
      text: "Upstream is explicit that pitch, formant, and correction quality are judged by listening, not automated diagnostics. Audition the exact build on your material and report artefacts with a short clip attached.",
    },
  ],
};

export default doc;
