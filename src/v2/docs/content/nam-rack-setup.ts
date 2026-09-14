import { REPO, SHOTS, TONE3000_URL, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: `**OpenStudio NAM Rack** is the built-in guitar and bass workspace: Neural Amp Modeler A1 and A2 pedal, amp, and full-rig captures in the track's FX chain, a native pedalboard in front, a cabinet IR and studio effects behind, and the whole tone saved as a preset or with the project. There is no paid tier; third-party captures and IRs keep their creators' licenses. The engineering contract is the [upstream NAM Rack guide](${REPO.namRackDoc}); this page is the setup path.`,
    },
    {
      type: "shot",
      src: SHOTS.namRackOverview,
      alt: "OpenStudio NAM Rack amp view with an A2 capture loaded and the installed capture library open",
      caption: "The Amp page with a capture loaded. Input, pedals, cabinet, EQ, and post effects each have their own page.",
    },

    { type: "h2", id: "add-the-rack", text: "Add the rack and pick Guitar or Bass" },
    {
      type: "ol",
      items: [
        "Click **FX** on the guitar track and add **OpenStudio NAM Rack** from the built-in effects list.",
        "Select the live instrument input on the track header and enable **Monitor** or arm the track.",
        "Choose **Guitar** or **Bass**.",
        "Set the interface gain once so it never clips, set input trim, and tune.",
      ],
    },
    {
      type: "p",
      text: "The profile is a voicing selector, not a preset. It changes only hidden tracking and frequency behaviour: EQ Boost band centres (120 Hz to 12 kHz for Guitar, 50 Hz to 10 kHz for Bass), Octaver tracking down to B0/E1, the drive stages' low-end handling, and the Graphic EQ's 65 Hz band, which becomes a low shelf. It never rewrites a visible control value or swaps a capture or IR.",
    },
    {
      type: "p",
      text: "The tuner observes the dry hardware input without joining the audible chain, so it adds no latency and needs neither record arm nor monitoring. It covers 27.5 to 1320 Hz, B0/E1 bass through upper guitar.",
    },

    { type: "h2", id: "load-a-capture", text: "Load a capture" },
    {
      type: "p",
      text: `A capture is either a local \`.nam\` file or a tone pack from [TONE3000](${TONE3000_URL}). Local loading never needs an account or a network connection. For a TONE3000 pack:`,
    },
    {
      type: "ol",
      items: [
        "Connect TONE3000 from the rack. Sign-in opens the TONE3000 authorize page in your default browser, where you can also sign up. The app never asks you to paste a token.",
        "Search. Results are tone packs, each reporting how many captures it contains.",
        "Open **View Captures** on a pack to list its children with name, NAM architecture, and a topology badge.",
        "Select the exact child. Selecting only changes the pending choice; the rack still sounds the same.",
        "Click **Audition** to download that child and route it through your live input. Audition another to compare. **Stop** or Cancel restores everything loaded before, cabinet and mix values included.",
        "Click **Use** to commit it. The capture is recalled with the project.",
      ],
    },
    {
      type: "table",
      head: ["Badge", "What it means for your chain"],
      rows: [
        ["**RAW / AMP ONLY**", "Amp without a speaker. Load a cabinet IR in the Cab stage or it will sound fizzy and direct."],
        ["**CAB EMBEDDED**", "A full rig with the cabinet already captured. The external Cab stage is bypassed automatically, and your chosen IR is kept for later."],
        ["**PEDAL**, **PREAMP**, **STUDIO**", "Other topologies the browser labels. A pedal-only capture is not a complete tone by itself; it normally needs an amp or full-rig capture after it."],
      ],
    },
    {
      type: "shot",
      src: SHOTS.tone3000Browser,
      alt: "The TONE3000 browser inside OpenStudio showing tone packs with capture counts",
      caption: "Packs with more than one capture require you to pick a child before Audition and Use become available.",
    },
    {
      type: "p",
      text: "To replace a capture, reopen the selector and use another child. The Amp power control bypasses it without unloading; **Unload** clears the slot.",
    },
    {
      type: "kv",
      rows: [
        ["Windows", "TONE3000 tokens are stored with DPAPI."],
        ["macOS", "Tokens are stored in the Keychain."],
        ["Linux", "Tokens go to the Secret Service keyring through `secret-tool`, usually installed by the `libsecret-tools` package. Without it, sign-in fails; local `.nam` loading is unaffected."],
      ],
    },
    {
      type: "callout",
      tone: "warn",
      label: "TONE3000 availability",
      text: "Whether the connected catalog is enabled in a public build depends on TONE3000's partner approval and the release configuration. Every build stays usable with local captures and IRs.",
    },

    { type: "h2", id: "cabinet", text: "Cabinet IR and Cabinet Space" },
    {
      type: "p",
      text: "With an amp-only capture, the Cab stage convolves a WAV impulse response and shapes it with Level, HPF, LPF, Edge, Damp, Blend, Low Bloom, and a phase switch. Try several IRs before reaching for EQ. With a full-rig capture the external Cab stage is off automatically, since a second IR would double-filter the captured speaker.",
    },
    {
      type: "p",
      text: "**Cabinet Space** sits after the cabinet and before the post effects. **Room** (Amount, Width) adds an early-reflection field so the cab feels less close-miked. **Doubler** (Mix, Spread, Delay 3 to 20 ms) adds two drifting short-delay voices and only generates stereo from a mono source. Room needs a cab source; with an amp-only capture and the external Cab off, the UI reports **No cab source**. Check both in mono.",
    },

    { type: "h2", id: "pedalboard", text: "The pedalboard, before the amp" },
    {
      type: "p",
      text: "Everything on the Pedals page changes what reaches the capture, so it shapes the distortion itself, not just the final balance. The order is fixed:",
    },
    {
      type: "code",
      code: "Input trim -> Gate -> Compressor -> Stereo Poly Octaver\n  -> EQ Boost (PRE EQ) -> Precision Drive -> Distortion\n  -> optional Pedal NAM capture -> Amp or Full-Rig NAM capture",
    },
    {
      type: "table",
      head: ["Stage", "Controls and use"],
      rows: [
        ["**Gate**", "Threshold and Release before gain raises the noise floor. Set Threshold during a noisy pause, then lower it until sustained notes end naturally."],
        ["**Compressor**", "Comp, Attack, Release, Tone, an Intensity switch (8:1 or 16:1), parallel Mix, Level, and a detector HPF (Off, 80, or 240 Hz) so low strings do not pump the whole signal."],
        ["**Stereo Poly Octaver**", "Octave-down and octave-up voices that track chords and stereo material. Keep Direct high for a recognisable attack."],
        ["**EQ Boost (PRE EQ)**", "Eight bands plus HPF/LPF before the gain stages. Cut lows here to stop palm mutes overwhelming a high-gain capture."],
        ["**Precision Drive**", "A full-wet overdrive: Drive, Attack, Bright, Volume (default +9 dB), and its own gate. Low Drive with high Volume is the classic tightening boost."],
        ["**Distortion**", "A separate gain voice with Heavy, Extreme, and Crunch ranges, Weight (Tight to Thick), Tone, Mix, Level, and a dedicated Dist Gate."],
        ["**Pedal NAM**", "An optional captured pedal after the native pedals. Pedal Mix sets its dry/wet balance and acts as its bypass."],
      ],
    },
    {
      type: "p",
      text: `Start with every pedal off, get the capture and cabinet right, then enable one stage at a time. The [tone-building guide](${V2_PATHS.blog}/build-guitar-tones-with-openstudio-nam-rack) walks through a clean and a high-gain preset stage by stage.`,
    },

    { type: "h2", id: "after-the-amp", text: "After the amp" },
    {
      type: "p",
      text: "After Cabinet Space the post section is reorderable: **Graphic EQ**, **Modulator**, **Stereo Delay**, and **Reverb** in the order you choose, then output trim, a safety guard, and the meters.",
    },
    {
      type: "p",
      text: "The Graphic EQ has nine bands at 65, 125, 250, and 500 Hz and 1, 2, 4, 8, and 16 kHz, plus or minus 12 dB each, an HPF (20 to 500 Hz), an LPF (3 to 20 kHz), and a Level trim. Double-click a filter to set it Off. The delay has time, feedback, mix, modulation, ducking, ping-pong, sync, and a Tape mode.",
    },
    {
      type: "table",
      head: ["Reverb voice", "Macros shown on the panel"],
      rows: [
        ["**Studio**", "DECAY, TONE, AIR"],
        ["**Plate**", "DECAY, DAMP, SHIMMER"],
        ["**Hall**", "DECAY, DAMP, MOTION"],
        ["**Room**", "SIZE, TONE, EARLY"],
      ],
    },
    {
      type: "p",
      text: "Every voice also has Mix, Pre-delay, Low cut, and a default-off **Pad** texture. Decay runs 0.2 to 12 seconds; Room treats it as Size.",
    },

    { type: "h2", id: "presets-and-recall", text: "Presets, A/B, and recall" },
    {
      type: "p",
      text: "A rack preset (`.ospreset`) is the complete creative tone. The library supports notes, tags, folders, A/B, and export. For A/B, keep the untouched tone in A, edit in B, and match output level before deciding.",
    },
    {
      type: "ul",
      items: [
        "Presets reference local NAM and IR files; they do not embed them. On another machine the rack offers **Locate**, **Search in Folder**, or TONE3000 re-download where the source metadata allows.",
        "Factory effect templates contain control settings only, no capture or IR; they shape whatever capture is already loaded.",
        "Device calibration (**CAL**) describes your interface and the capture's reference level. It does not travel inside a preset; the Input knob is the creative trim.",
        "The project stores the exact child capture, its source identity, and every rack parameter. If an asset is missing at load, the in-rack recovery card offers **Locate**, **Replace**, and **Bypass**.",
      ],
    },

    { type: "h2", id: "rendering", text: "Rendering with the mix" },
    {
      type: "p",
      text: `The rack is a built-in effect in the track's FX chain, so it prints through the normal offline render like any other insert, whether you render the master or the track as a stem. See [Rendering & export](${V2_PATHS.docs}/rendering-and-export). Record the DI dry and keep the rack on the track, so the tone can change later without replaying the part.`,
    },
  ],
};

export default doc;
