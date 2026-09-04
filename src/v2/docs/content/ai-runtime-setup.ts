import { REPO, V2_PATHS } from "../../content";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-09-04",
  blocks: [
    {
      type: "p",
      text: `Generation, stem separation, and the larger analysis models are optional in OpenStudio. They are never bundled with the base download and never block launch. This page covers what the **AI Tools** install actually puts on your disk, what each platform can run, and how to start each workflow. The rules it follows are the upstream [runtime dependency contract](${REPO.runtimeContractDoc}) and manual section 18. Shortcuts shown are the OpenStudio default keyboard profile.`,
    },

    { type: "h2", id: "what-is-optional", text: "What is optional, and why" },
    {
      type: "p",
      text: "The base app is a complete DAW on its own. Python, the AI helper runtime, and every generation or separation model are classed as optional prerequisites: if they are missing, the feature that needs them shows guidance, setup runs in the background when you ask for it, and the main app thread stays responsive. Keeping large model assets out of the installer is what keeps the base download small.",
    },
    {
      type: "p",
      text: "One small model does ship with the app: Basic Pitch, used for audio-to-MIDI. It is bundled for provenance, but running it needs ONNX Runtime, which only the Windows and Linux release pipelines provision today. That has nothing to do with the AI Tools install and is covered under platforms below.",
    },

    { type: "h2", id: "install", text: "Installing from inside the app" },
    {
      type: "ol",
      items: [
        "Click the **AI Tools** button in the main toolbar, beside the Settings gear, or click **Install AI Tools** inside the Stem Separation dialog. A generation or stem workflow that finds its runtime missing also points you to **AI Tools Setup**.",
        "A small popup confirms that setup is running in the background. You can keep working; the top-right AI button is the persistent progress surface.",
        "If a download stalls or you change your mind, open the setup modal and use **Cancel**, **Reset**, or **Retry**.",
        "When setup finishes, rerun the workflow you started from. Generated and separated audio comes back into the project as ordinary clips and tracks.",
      ],
    },
    {
      type: "p",
      text: `Stable Audio 3 Medium is the exception to the one-click path. It is license-gated, so the AI Tools installer does not fetch it. You accept the license on Hugging Face, import the accepted snapshot yourself, and OpenStudio then prepares its own Stable Audio runtime. Details are on the [AI page](${V2_PATHS.ai}).`,
    },

    { type: "h2", id: "what-it-downloads", text: "What it downloads" },
    {
      type: "p",
      text: "The install has two parts: a managed Python runtime that OpenStudio provisions for you, so there is no separate environment to wire up, and the model files, which are downloaded on demand for the workflow you use. The runtime is published as its own release stream with per-platform entries.",
    },
    {
      type: "kv",
      rows: [
        ["Windows", "A base runtime package plus a backend install plan. The plan detects your hardware and installs either the **CUDA** runtime for NVIDIA GPUs or the **DirectML** runtime for other GPUs."],
        ["macOS", "An Apple Silicon (arm64) runtime. The manifest contract also carries an x64 entry, but the GitHub release notes state that Intel Macs run the base app while AI Tools are unavailable. macOS does not provision ONNX Runtime, so audio-to-MIDI is unavailable there as well."],
        ["Linux", "x64 and arm64 runtime entries exist in the manifest contract. FFmpeg-backed conversions still use the distribution's `ffmpeg`; the runtime does not bring its own."],
      ],
    },
    {
      type: "table",
      head: ["Model", "Used by", "How it arrives"],
      rows: [
        ["BS Roformer", "Stem separation", "AI Tools install"],
        ["ACE-Step 1.5 XL Turbo (Diffusers layout) with Qwen text encoders", "Text to Music, Lyrics + Style, Create Variation, Inpaint Selection, Continue Clip", "AI Tools install through the Audio Generation path"],
        ["Stable Audio 3 Medium", "Text to Audio and its source-conditioned workflows", "Manual Hugging Face snapshot import plus license acknowledgement"],
        ["Basic Pitch", "Audio to MIDI", "Bundled with the base app; needs ONNX Runtime"],
      ],
    },
    {
      type: "p",
      text: `ACE-Step runs through the Hugging Face Diffusers ACE-Step pipeline rather than a node-graph app. That change made generation in OpenStudio almost three times faster in practice and gave the UI real progress reporting; the [ACE-Step post](${V2_PATHS.blog}/ace-step-diffusers-almost-3x-faster) explains what moved and what did not.`,
    },

    { type: "h2", id: "hardware", text: "Hardware notes" },
    {
      type: "p",
      text: "Availability and speed depend on your machine. The upstream feature list is explicit that the optional runtime, model licenses, local hardware, RAM, and VRAM decide whether a generation workflow is available and how it performs, and that the result still needs your ears. Neither the manual nor the contract publishes minimum figures, so this page does not either.",
    },
    {
      type: "ul",
      items: [
        "The accelerated ACE-Step path is CUDA with bfloat16; on Windows the DirectML backend is the other install plan. Either way, first launch has real work to do: models must exist locally, dependencies must be right, and a cold process has startup cost.",
        "Full VAE decode is the quality path for generation. If your machine cannot carry a request, you get a clear failure rather than a silently degraded WAV.",
        "Setup and downloads run in the background and the main app thread stays responsive, but expect the machine to be busy while a generation or separation job is in flight.",
      ],
    },

    { type: "h2", id: "workflows", text: "The workflows" },
    {
      type: "table",
      head: ["Workflow", "What it does", "Start it from"],
      rows: [
        ["**Text to Music**", "Generates a fresh clip with ACE-Step from a style or arrangement prompt, optional lyrics, BPM, duration, time signature, language, key and scale, seed, and generation controls.", "An AI track: **Insert** menu, the Command Palette, or `Ctrl+Alt+T`"],
        ["**Lyrics + Style**", "Generates a song guided by structured lyrics and a musical prompt.", "An AI track"],
        ["**Text to Audio**", "Generates audio from a prompt with Stable Audio 3 Medium when that runtime and model are installed.", "An AI track"],
        ["**Create Variation**", "Generates a related version of the selected clip while keeping its identity, per the source and variation controls.", "Right-click an audio clip → **AI Generation**"],
        ["**Inpaint Selection**", "Regenerates the time selection that overlaps the clip and matches the surrounding audio. Make a time selection first.", "Right-click an audio clip → **AI Generation**"],
        ["**Continue Clip**", "Generates a continuation tail from the selected clip using the prompt and tail-length controls.", "Right-click an audio clip → **AI Generation**"],
        ["**Stem separation**", "Splits a source clip into vocals, drums, bass, guitar, piano, and other, imported back as editable clips on their own tracks.", "The Stem Separation dialog"],
        ["**Audio to MIDI**", "Extracts MIDI notes from an audio clip with Basic Pitch and creates an adjacent MIDI track, with undo.", "An audio clip; the new MIDI track is created beside it"],
      ],
    },
    {
      type: "p",
      text: `Everything the models produce is written as WAV and placed in the session as normal material, so the next step is editing, routing, and mixing rather than importing. For stems that means the usual [Mixing & routing](${V2_PATHS.docs}/mixing-and-routing) tools; for extracted notes, the [piano roll](${V2_PATHS.docs}/midi-and-piano-roll).`,
    },

    { type: "h2", id: "staying-offline", text: "Staying offline" },
    {
      type: "p",
      text: "Installing the runtime and downloading models needs a connection. After that, the packaged runner validates the required model files on disk before a job starts and then runs locally; the project describes the runtime as offline after setup and model validation, and your work does not depend on a remote service being up. If a model file is missing, the workflow points you back to AI Tools Setup rather than downloading behind your back.",
    },
    {
      type: "p",
      text: `Two other features in the app do talk to the network, and neither is part of AI Tools: automatic update checks (also manual under **Help → Check for Updates…**), and the optional TONE3000 sign-in in the [NAM Rack](${V2_PATHS.docs}/nam-rack-setup).`,
    },
    {
      type: "callout",
      tone: "note",
      label: "Planned: MiniMax",
      text: "The maintainer has said MiniMax support is planned. It is roadmap, not a shipped feature; nothing on this page changes until it lands in a release.",
    },
    {
      type: "callout",
      tone: "warn",
      label: "Quality is an audition item",
      text: "Generated and separated audio is judged by listening. The upstream project does not treat automated diagnostics as proof that a result sounds right, and results vary with the source material and the model.",
    },
  ],
};

export default doc;
