import { SHOTS } from "@/data/siteContent";
import { SITE_PATHS } from "@/constants/routes";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-10-08",
  appReference: { commit: "b482852", channel: "development" },
  blocks: [
    {
      type: "p",
      text: "Every track has FX chains, the chains hold built-in effects and third-party plugins, and the plugins come from a scan of the standard directories on your machine. This page covers all three, plus presets, bypass, safe mode, and what to do when a plugin refuses to appear or behave. Shortcuts are from the default OpenStudio keyboard profile; `Ctrl` is `Cmd` on macOS.",
    },

    { type: "h2", id: "fx-chain-architecture", text: "FX chain positions" },
    {
      type: "table",
      head: ["Chain", "Where it sits", "Typical use"],
      rows: [
        ["Input FX", "Before the track fader", "Input conditioning: EQ, compression, gating"],
        ["Track FX", "Before the track fader", "Standard insert effects"],
        ["Master FX", "On the master bus output", "Mastering chain"],
      ],
    },
    {
      type: "p",
      text: "A monitoring FX chain also exists. To open a chain, click the **FX** button on a track header or channel strip; the FX Chain panel shows the current chain, and a chain type selector switches between Input FX and Track FX. The master chain opens from the FX button on the Master strip. Chain presets can be saved and loaded for track, input, and master chains.",
    },

    {"type": "h2", "id": "built-in-effects", "text": "Built-in effects"},
    {"type": "p", "text": "Built-in processors carry the OpenStudio prefix and are independently insertable and reorderable. Choose an effect in the FX browser, then open its editor from the chain. NAM Rack has its own editor and [setup guide](/docs/nam-rack-setup)."},
    {"type": "callout", "tone": "note", "label": "Free-plugin suite in development", "text": "The development checkout reviewed on October 4, based on app commit 52cbd7c, has fifteen dedicated effect/instrument layouts. Reverb, Delay and Chorus use the revised designs. Pitch Correct reuses the existing clip Edit Pitch session. These changes are unreleased. The [engineering article](/blog/building-openstudio-free-plugins) explains the research and implementation; its test results are dated evidence, not commercial sound-equivalence claims."},
    {"type": "table", "head": ["Processor", "Main use"], "rows": [["EQ / Graphic EQ", "24-band parametric editing and dynamics, or independent 10/31-band graphic banks"], ["Compressor / Gate / Limiter", "Compression characters, keyed gating/expansion and output limiting"], ["Preamp / Saturator / Gain Phase", "Tone and drive, nonlinear colour, or timing/polarity/phase alignment"], ["Reverb / Delay / Chorus", "41 reverb types including convolution; stereo delay; chorus/flanger/phaser"], ["Basic Synth / Piano / Clean Guitar / Drums", "Four synthesized instruments requiring no sample packs"], ["Pitch Correct", "Existing graphical clip editor entry and compatible realtime correction settings"]]},
    {"type": "h3", "text": "Controls, presets and history"},
    {"type": "p", "text": "Drag a knob vertically, hold Shift for fine adjustment, double-click to reset, or type a value and press Enter. Escape cancels typed entry. Keyboard and wheel behavior follow the active input profile. One continuous gesture creates one editor Undo step. Detail pages show controls relevant to the selected engine; hidden engine settings remain saved."},
    {"type": "p", "text": "The shared toolbar provides presets, Undo/Redo, complete-state A/B and Host bypass. Plugin options imports/exports complete .ospreset files and rejects files for another processor type. Complete state includes family memories, MIDI maps and embedded IR data. Presets and Compare can restore the processor's own bypass setting; clear it in Plugin options if needed. Host bypass belongs to the FX slot and has separate history. Editors follow their instance through reordering and reject writes to removed instances."},
    {"type": "h3", "text": "Parametric and graphic EQ"},
    {"type": "p", "text": "The standalone EQ has 24 bands, per-band Stereo/L/R/Mid/Side targets, extended cuts and tilt shapes. Select a band in the graph for its applicable frequency, gain, Q and dynamics controls. The default first/last bands are disabled HPF/LPF filters; their power buttons enable them. Dragging a cutoff handle changes frequency without changing gain. The embedded channel-strip EQ retains its separate eight-band scope."},
    {"type": "p", "text": "Choose Minimum, Linear or Minimum FIR processing above the graph. Ordinary band dynamics, opt-in Linear band dynamics and Spectral dynamics are distinct paths. Dynamics supports internal/external detector choices where applicable. Phase changes preserve supported active dynamics through a prepared transition. Processing changes can alter latency; the host aligns dry/wet and bypass accordingly."},
    {"type": "p", "text": "Use Group for linked selections and relative frequency/gain/Q offsets, or the selected-band menu for Copy, Duplicate, Reset and Remove. Draw and Match can audition a proposal before Apply; Cancel restores the saved sound. Match learns a current output and a reference from another EQ or an audio file. Saved spectrum references live on this device/browser profile and are separate from projects and presets. Grab freezes a spectrum for peak editing. Display controls resolution, source, range, tilt, Hold and Pause without changing audio."},
    {"type": "p", "text": "Instances opens another running EQ or a paged graph overview. References overlays spectra from up to two other instances. Files & startup in the preset library manages complete state and startup choices. MIDI programs stores up to 32 bank/program settings; edit the map while transport is stopped. Mixed processing configurations are prepared before recall, reserve the bank's largest latency and warm/crossfade the incoming setting. Disable recall before manually changing processing configuration; a MIDI target change does not make that audible transition instantaneous."},
    {"type": "p", "text": "Graphic EQ keeps separate 10-band and 31-band banks, with grouped gestures, relative offsets, cuts and channel targets. Wide windows expose the full bank; compact windows page through frequencies. Flat resets the active response. The graph and analyzer are native data, not a simulated response."},
    {"type": "h3", "text": "Dynamics and colour"},
    {"type": "p", "text": "Compressor provides Clean/Legacy, FET, two opto and two VCA profiles with contextual timing, detector and channel controls. Its meter can show gain reduction or input/output average; these digital displays are not calibrated hardware meters. Gate offers filtered internal/external keys, detector audition and envelope shaping. New standalone Gate instances use Transient response: Peak/Auto rise is immediate before Attack in Gate mode, while RMS integrates and Expansion keeps its continuous response. Old state and NAM retain Legacy. There is no lookahead guarantee for instantaneous pulses."},
    {"type": "p", "text": "Limiter offers eight original responses, audio oversampling, aligned bypass and reconstructed-peak/loudness history. Oversampling is a processing choice, not proof of a ceiling for every possible signal. Export dither and effective bit depth are separate final-output settings in [Rendering and export](/docs/rendering-and-export). Saturator provides original drive voices, mix and estimated compensation; judge the level-matched result by listening."},
    {"type": "p", "text": "Compressor and Preamp offer Audio stages > Original stages as an opt-in character. Legacy remains the default for new and older state. Original uses separate level- and history-dependent input/output stages with prepared 16x FIR processing. In Compressor they surround gain reduction; Clean/Legacy models stay linear. In Preamp, input colour precedes Tone EQ, Output drive follows it, and Output trim is linear. Headroom and Output drive are distinct controls. Character changes have complete-state Undo and declared latency: 78 filter samples for Original Preamp; 1038 total samples for Original Compressor at 48 kHz, including its 20 ms path. Original uses more CPU than Legacy. Aggressive combined settings can alias; commercial circuit fidelity and listening acceptance remain open."},
    {"type": "h3", "text": "Reverb, delay and modulation"},
    {"type": "p", "text": "Reverb offers 41 types across studio, vintage, plate/modal, spring, shimmer, nonlinear, spatial, ambient and convolution families. Start with Type, decay/space and mix, then open the contextual detail pages. Per-type memories retain settings when switching. Send/mix lock supports return-track use. Hold is engine-specific: Infinite may accept new excitation while Freeze rejects it; some topology changes wait for Hold to release. Supported wet-tail spillover preserves draining tails with bounded retirement."},
    {"type": "p", "text": "For Convolution, import a mono, stereo or four-path IR. Preparation reports progress and can be cancelled; a failed/cancelled preparation leaves the previous applied response usable. Apply/Revert separates source/shaping edits from the active sound. Original IR bytes travel in complete state. Shaping, source blend, synthetic tail enhancement, wet EQ/modulation and isolated audition are available in their detail pages. Declared room geometry and diagnostic decay plots are not measured venue reconstruction or certified acoustics."},
    {"type": "p", "text": "With a four-channel IR, Balance > Output layout > Four outputs splits diagonal paths to Main 1/2 and cross paths to auxiliary 3/4. Route the auxiliary pair through a track send; adding the pairs recovers the stereo matrix before independent destination processing. This is a matrix-path split, not arbitrary surround. Mono/stereo IRs keep stereo-sum behavior. The four-path channel-order selector remains separate."},
    {"type": "p", "text": "Delay separates Digital, Tape, Analog, Multi and Dual modes from left/right timing and sync. Effective milliseconds and host/fallback/retained tempo status come from the processor. Motion, tone/colour, ducking, diffusion and routing live on contextual pages. Diffusion currently adds span after the repeat; pitch, reverse and frequency-shift delay families are not implemented. Chorus switches between Chorus, Flanger and Phaser with applicable voices/stages, waveform, sync, feedback and tone. Ensemble reports its effective minimum voices and cutoff; inactive settings remain saved."},
    {"type": "h3", "text": "Gain, polarity and alignment"},
    {"type": "p", "text": "Gain Phase combines manual fractional timing, polarity, all-pass and saved spectral FIR with Align tracks. Capture a group of two to eight instances, review a proposal, audition it, then Apply with whole-group Undo. Short/fixed captures use declared sparse windows. To-project-end continuously analyzes the selected span for up to 30 minutes through a bounded queue. Changed routes, sources or latency and missing coverage invalidate Apply. A confidence threshold is a heuristic, not an acoustic correctness probability."},
    {"type": "h3", "text": "Synthesized instruments and audition"},
    {"type": "p", "text": "Basic Synth includes two selectable oscillators, sub/noise, filter/amplitude envelopes, shared or per-note LFO, an eight-route Matrix and four CC-learn macros. Matrix pages retain all routes. MPE lower/upper zones and member/master bend ranges are opt-in; keep track MIDI channel on All for member-channel expression. Live controller targets are shown separately from saved base knobs. Presets save mappings and base values, not transient performance positions."},
    {"type": "p", "text": "Piano and Clean Guitar provide expressive releases and pedals, with optional coupled-body resonance. Guitar adds a Plucked loop engine, pick/pickup position, damping, palm mute and nine articulations/keyswitches. Play > Performance shows actual native string allocations, latched articulation and held/pedal/releasing roles, plus next-note overrides. Note labels precede bend/slide and resonance tails are separate. Finished voices disappear; unavailable feedback is explicit."},
    {"type": "p", "text": "Drums has sixteen audition pads and eight shared piece inspectors. Select a pad or Drum piece to edit level, tuning, pan, voice/articulation and output. The 128-note map can redirect incoming MIDI or Ignore it; pad names reflect the effective mapping. Articulated voices and choke behavior are synthesized, with Legacy retained for older state. These instruments require no sample library."},
    {"type": "p", "text": "Hold an audition key/pad with the pointer or Enter; release it to stop. Space follows the transport shortcut profile. Audition uses an isolated voice outside recording/export, follows instrument controls and releases owned notes on cancel, blur, hide, close or heartbeat loss. Input-key/pedal feedback is separate from sounding voices. Export reserves rate-aware finite release tails and releases sustain/sostenuto at content end; intentionally infinite sounds still need a chosen export length."},
    {"type": "h3", "text": "Routing individual drum outputs"},
    {"type": "p", "text": "Drums > Piece > Piece output assigns each piece exclusively to Main 1/2 or one of eight auxiliary stereo pairs, 3/4 through 17/18. In Track routing, create a send to a destination track and select matching Source channels. Add effects or render a stem on that destination. An unassigned pair is silent. Following stereo effects process the main pair while retaining auxiliaries; send pre/post-fader choices apply to the selected pair. Old states restore every piece to Main 1/2."},
    {"type": "p", "text": "Projects, full state, Compare and Undo retain output routing. Isolated pad/keyboard audition folds its clone to stereo without changing the saved route. Stereo Freeze rejects tracks with enabled auxiliary sends; render destination buses as stems instead. Complete send restoration publishes the intended channels, gain and enabled state together. General bus and send workflows are in [Mixing and routing](/docs/mixing-and-routing)."},
    {"type": "h3", "text": "Pitch correction"},
    {"type": "p", "text": "Pitch Correct opens the existing Edit Pitch session for a chosen eligible audio clip. It checks for active realtime correction on the playback route without silently bypassing effects. The compatible realtime processor keeps Legacy Humanize and adds opt-in Sustained notes. Graphical Apply and realtime correction are different operations; there is no second pitch canvas or duplicated graphical Humanize control. See [Pitch editing](/docs/pitch-editing) for source selection, editing and docked/detached operation."},

    { type: "h2", id: "formats-and-scan-paths", text: "Formats and scan paths" },
    {
      type: "p",
      text: "OpenStudio hosts 64-bit plugins for effects and virtual instruments. VST3 is the stable, most mature path. CLAP and LV2 code paths are present and exposed where the format is available, but individual plugin compatibility varies more than it does for VST3.",
    },
    {
      type: "p",
      text: "Open the FX Chain panel or the Plugin Browser and click **Scan**. The standard directories are scanned and the results are grouped by manufacturer and category, filterable by name.",
    },
    {
      type: "kv",
      rows: [
        ["macOS", "`~/Library/Audio/Plug-Ins/VST3`"],
        ["Windows", "`C:\\Program Files\\Common Files\\VST3`"],
        ["Linux", "`/usr/lib/lv2`"],
      ],
    },
    {
      type: "shot",
      src: SHOTS.fxChainBrowser,
      alt: "The OpenStudio FX chain panel with the plugin browser open",
      caption: "Scanned plugins listed by manufacturer and category beside the track's chain.",
    },

    { type: "h2", id: "adding-and-editing", text: "Adding a plugin, editors, presets, and A/B" },
    {
      type: "ol",
      items: [
        "Open the FX Chain panel for the track.",
        "Click **+** or **Add Plugin**.",
        "Filter the list by name, manufacturer, or category and click the plugin.",
        "It is appended to the chain and its native editor window opens.",
      ],
    },
    {
      type: "p",
      text: "Native editors open in separate windows when provided. Parameters can also be changed from the FX Chain list, using buttons/choices for switches and enums. Eligible track, input, instrument, master and monitor FX parameters support envelopes; Show last touched reveals the last edited target. The October 6 development checkout adds stable JSFX slider IDs, dynamic CLAP metadata handling, ordered native capture and VST3/CLAP SDK sample-offset delivery where supported. Isolated VST3 transport preserves these offsets. A mode-dependent display name can refresh under the same SDK binding; changed IDs, normalized semantics or channel contracts require reload. GUI edits without SDK offsets use estimated native timestamps. Stop halts audio immediately and drains pending built-in editor writes before committing the pass; a stalled editor produces a warning after the bounded native wait. Vendor CLAP editor and macOS/Linux qualification remain pending. Track/input FX lists provide MIDI Learn for CCs. See Mixing & routing for Safe, Touch return, Cross-Over, Touch/Latch, realtime Trim and audible Preview/Capture.",
    },
    {
      type: "shot",
      src: SHOTS.pluginHosting,
      alt: "A third-party plugin editor hosted by OpenStudio",
      caption: "A hosted VST3 editor in its own native window.",
    },
    {
      type: "p",
      text: "In the October 6 development checkout, **Punch Preview** records auditioned audio/FX controls during playback until Stop or End Punch. **Writing & AutoJoin** provides write-to-start/end for controls already writing and can resume latched values at the previous stop point. Track sends also have separate Trim offsets and stopped coalescing policies. See [Mixing & routing](/docs/mixing-and-routing) for the workflow and limits. Offline hosted state/prepare/reset calls now run on the actual UI thread, but the installed authorized AmpliTube still has an unresolved first-export discrepancy; parameter/state checks do not qualify its audio parity or every preset.",
    },
    {
      type: "p",
      text: "To save a preset, set the parameters, click the preset save icon in the FX Chain panel, and name it. Load one from the plugin's preset browser. Plugin state is also stored in the project. For VST3 plugins, A/B comparison gives you two independent slots: set up A, switch to B, adjust, and toggle between them to compare by ear.",
    },

    { type: "h2", id: "bypass-reorder-safe-mode", text: "Bypass, reordering, and safe mode" },
    {
      type: "ul",
      items: [
        "**FX Bypass** on the track header bypasses the whole chain without removing anything. The FX button turns from green (active) to red (bypassed). Individual plugins bypass from inside the FX Chain panel.",
        "Drag a loaded FX row's grip handle onto another row in a track, input or master chain to reorder it; signal flows top to bottom. The order changes in native audio processing as well as the list. Focus the grip and press Up or Down to move an effect one position with the keyboard. Dropping outside or cancelling retains the order. Undo and Redo restore the processing order and envelopes remain attached to their plugin. Track/input MIDI Learn references follow reorder; removal Undo restores the saved mappings.",
        "**File → Open Project (Safe Mode)…** (`Ctrl+Shift+O`) skips loading saved instruments and FX. Use a copy for diagnosis and avoid overwriting the original project from this mode.",
      ],
    },
    {
      type: "callout",
      tone: "note",
      label: "Master FX order",
      text: "The October 8 development checkout at b482852 uses grip handles for track, input and master chain reordering. Master envelopes follow persistent plugin identities through reorder, Undo and Redo. This describes development behavior, not a shipped-release claim.",
    },

    { type: "h2", id: "bridges-ara-sidechain", text: "32-bit bridge, ARA2, and sidechain" },
    {
      type: "p",
      text: "Sidechain routing into plugins is supported for plugins that take a sidechain input. For an ARA-capable plugin in a track FX chain, the app attempts to initialize ARA, attach the track’s audio clips, and open its editor. This depends on an ARA-enabled build and a compatible plugin; compatibility is not guaranteed for every ARA editor.",
    },
    {
      type: "callout",
      tone: "warn",
      label: "Use 64-bit plugins",
      text: "A bridge action exists internally, but there is no supported 32-bit hosting workflow. Install the 64-bit version of the plugin.",
    },

    { type: "h2", id: "troubleshooting", text: "When a plugin will not show up or misbehaves" },
    { type: "h3", text: "Plugin not in the list" },
    {
      type: "ol",
      items: [
        "Confirm it is installed in one of the standard directories above.",
        "Open the FX Chain panel and click **Scan** again.",
        "Confirm it is a 64-bit plugin. VST3 is the reliable format; CLAP and LV2 depend on the plugin and the build.",
        "Check the plugin file is not corrupted, for example by reinstalling it.",
      ],
    },
    { type: "h3", text: "Plugin crashes, hangs, or makes noise" },
    {
      type: "ol",
      items: [
        "Open a copy in Safe Mode (`Ctrl+Shift+O`) to skip loading saved instruments and FX.",
        "Add plugins one at a time in the copy until the problem returns.",
        "Check the plugin's documentation for channel configuration requirements; some expect a specific layout.",
        "Update the plugin to its latest version.",
        "Remove the plugin from the chain and add it again to reset its state.",
      ],
    },
    {
      type: "p",
      text: `More symptoms, including audio dropouts caused by heavy plugins, are indexed in [Troubleshooting](${SITE_PATHS.docs}/troubleshooting).`,
    },
  ],
};

export default doc;
