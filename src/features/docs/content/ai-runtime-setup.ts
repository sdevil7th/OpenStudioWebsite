import { AI_MODEL_CATALOG, aiSetupDownloads, aiSetupNetworkNote } from "@/data/aiSetup";
import { REPO } from "@/data/siteContent";
import { SITE_PATHS } from "@/constants/routes";
import type { DocContent } from "../types";

const doc: DocContent = {
  updated: "2026-11-07",
  appReference: { commit: "4d468a471ffda9838e6e8c984433bba7d7f886b8", channel: "development" },
  blocks: [
    {
      type: "p",
      text: `Generation, stem separation, and the larger analysis models are optional in OpenStudio. They are never bundled with the base download and never block launch. This page covers what the **AI Tools** install actually puts on your disk, what each platform can run, and how to start each workflow. The rules it follows are the upstream [runtime dependency contract](${REPO.runtimeContractDoc}) and manual section 18. Shortcuts shown are the OpenStudio default keyboard profile.`,
    },

    { type: "h2", id: "model-versions", text: "Original and INT8 model versions" },
    {
      type: "p",
      text: "In development builds containing app commit `681fec8`, choose a model, then **Original** or **INT8** in **Model version**. A suggestion above the selector explains when lower memory use may help. **AI Tools Setup** lists separate Original and INT8 installation status for ACE-Step, Stable Audio 3 Medium, and MiniMax Music 3. These controls may not be present in an older installed release.",
    },
    {
      type: "p",
      text: "INT8 currently requires an **NVIDIA CUDA GPU**. **Download and Prepare INT8** reuses installed original weights or downloads the official originals, then prepares and verifies a separate INT8 copy. The first download is not smaller. Prepared OpenStudio INT8 folders can also be imported. Choose the installed version in the generation dialog; the AI track remembers it and supports undo/redo. Original and INT8 can coexist, and the prepared INT8 version can run offline without keeping the Original version installed.",
    },
    {
      type: "p",
      text: "ACE-Step and Stable Audio quantize the diffusion transformer; MiniMax quantizes its language model. Other audio components retain their normal inference precision. Less memory use does not guarantee faster rendering or identical sound. Other GPU backends and CPU-only systems should select Original, subject to that model's hardware requirements.",
    },
    {
      type: "callout",
      tone: "note",
      label: "MiniMax INT8 still needs a capable machine",
      text: "The app's [local qualification report](https://github.com/sdevil7th/OpenStudio/blob/681fec8/docs/ai-quantization-2026-09-16.md) records generation on an RTX 4080 with 16 GB VRAM and 32 GB system RAM. It does not establish support for every smaller GPU or equivalent audio quality. MiniMax can take minutes per song; its INT8 path also uses about 15 GiB of temporary disk cache for inactive stages and takes longer on first load. Run the app's **Hardware check** for your selected model version and request.",
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
      type: "callout",
      tone: "note",
      label: "Development candidate: repair stem separation",
      text: "In the 0.1.09 candidate, the first Windows or Linux launch after an update offers to check installed stem tools. **Open DAW** skips the offer for that version. **Check and repair** runs after all DAW sessions close. If a recording starts while the offer is open, it continues and the repair request is saved. To request repair later, choose **AI Tools Setup → Repair Stem Separation**, save your projects, close OpenStudio and reopen it. Repair keeps the downloaded models and activates the replacement after validation. The BS-RoFormer model uses CPU on the unsupported Windows DirectML path.",
    },
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
      text: aiSetupDownloads[1].description,
    },

    { type: "h2", id: "what-it-downloads", text: "What it downloads" },
    {
      type: "p",
      text: "The install has two parts: a managed Python runtime that OpenStudio provisions for you, so there is no separate environment to wire up, and the model files, which are downloaded on demand for the workflow you use. The runtime is published as its own release stream with per-platform entries.",
    },
    {
      type: "kv",
      rows: [
        [
          "Windows",
          "A base runtime package plus a backend install plan. Setup selects dependencies for your hardware and chosen feature. CUDA, DirectML and CPU support differ by model; a runtime backend does not make every model compatible with every GPU.",
        ],
        [
          "macOS",
          "The downloadable managed runtime requires Apple Silicon (arm64) and macOS 14 or later because of its bundled numerical-library wheels. The base app targets macOS 12 or later; the managed archive is not qualified for macOS 12/13. Intel Macs can run the base app, while AI Tools remain unavailable. Audio-to-MIDI is unavailable in the macOS app build.",
        ],
        [
          "Linux",
          "x64 and arm64 runtime entries exist in the manifest contract. FFmpeg-backed conversions still use the distribution's `ffmpeg`; the runtime does not bring its own.",
        ],
      ],
    },
    {
      type: "table",
      head: ["Model", "Used by", "How it arrives"],
      rows: AI_MODEL_CATALOG.map(({ model, does, status }) => [model, does, status]),
    },
    {
      type: "p",
      text: `ACE-Step runs through the Hugging Face Diffusers ACE-Step pipeline rather than a node-graph app. In the published ACE-Step benchmark, that change made generation almost three times faster and gave the UI real progress reporting; the [ACE-Step post](${SITE_PATHS.blog}/ace-step-diffusers-almost-3x-faster) explains what moved and what did not.`,
    },

    { type: "h2", id: "hardware", text: "Hardware notes" },
    {
      type: "p",
      text: "Availability and speed depend on your machine. The upstream feature list is explicit that the optional runtime, model licenses, local hardware, RAM, and VRAM decide whether a generation workflow is available and how it performs, and that the result still needs your ears. Use the model-specific hardware checks in AI Tools Setup for the requirements of your installed build.",
    },
    {
      type: "ul",
      items: [
        "The accelerated ACE-Step path uses CUDA with bfloat16 where supported. Backend and precision choices vary by model and hardware. First use includes model validation and process startup; MiniMax needs substantial system RAM, particularly with CPU offload.",
        "Full VAE decode is the quality path for generation. If your machine cannot carry a request, you get a clear failure rather than a silently degraded WAV.",
        "Setup and downloads run in the background and the main app thread stays responsive, but expect the machine to be busy while a generation or separation job is in flight.",
      ],
    },

    { type: "h2", id: "generation-memory", text: "Generation memory and execution options" },
    {
      type: "p",
      text: "In the unpublished 0.1.09 candidate, ACE-Step, Stable Audio and MiniMax adapt model placement to available memory. **Hardware check** is advisory; the live worker makes the final admission decision, including memory it can reuse. Offloading trades speed for memory and does not make every model practical on every machine. Longer MiniMax requests can require a new placement plan, and its maximum length is a cap rather than a guaranteed song duration.",
    },
    {
      type: "p",
      text: "**AI Tools Setup → Release idle AI memory** retires an idle generation worker. Busy requests cannot be released this way; cancel the active job first. Switching models retires the previous worker before loading the next, while repeated requests for the same model can reuse it. Automatic placement retains the selected model version and standard precision; it does not silently select INT8 or FP8.",
    },
    {
      type: "kv",
      rows: [
        ["Automatic — standard precision", "Default memory-aware placement. Hardware, runtime and requested length still determine whether a job fits."],
        ["ACE-Step: Lower memory — temporary disk", "Installed Original model on the qualified Windows RTX 4080 setup. Requires spare disk space and can be slower."],
        ["ACE-Step: Faster startup — qualified AMD", "Installed Original model on the reviewed Linux Radeon 8060S / gfx1151 runtime. Retains precision; audition the result."],
        ["Stable Audio: Lower GPU memory — FP8 storage", "Installed Original model on the qualified Windows RTX 4080 setup. Reduces selected weight-storage precision; output can differ."],
        ["Stable Audio: Compile repeated blocks — optional setup", "Qualified Windows RTX 4080 setup and Original model. **Prepare optional compilation** installs a separate runtime, requires 20 GiB free disk and validates two test generations. First generation takes longer; repeats can be faster."],
      ],
    },
    {
      type: "p",
      text: "These are local device preferences for the next generation, not portable project settings. Saved INT8 uses its own execution policy. Other configurations keep Automatic available; the additional options require their qualified runtime and model. See the [hardware qualification report](https://github.com/sdevil7th/OpenStudio/blob/1069786f2a55fdcf451b7d5b2327a73fe124fb83/docs/ai-optimization-qualification-2026-11-06.md) for measured scope rather than assuming universal speed or audio-quality improvements.",
    },

    { type: "h2", id: "stem-memory", text: "Stem separation devices and memory" },
    {
      type: "p",
      text: "In **Separate Stems**, **Processing device → Automatic (use GPU when available)** selects a supported GPU or explains why CPU is used. **CPU only** explicitly avoids GPU model execution. A confirmed GPU out-of-memory error in Automatic mode retires that worker and retries once on CPU with bounded output memory; other errors do not start repeated retries.",
    },
    {
      type: "ul",
      items: [
        "**Process in 30-second sections to reduce memory use** bounds host-memory use, but can change results at section boundaries.",
        "**Use rolling output buffers** requests the temporary-disk path qualified on supported Windows/Linux runtimes. It preserves model window boundaries, and disk requirements grow with input length. Automatic mode can select it when RAM is limited; unsupported configurations use the sectioned path instead.",
        "On Linux AMD, **AMD performance → Faster when qualified (FP16)** is opt-in and limited to the reviewed gfx1151/ROCm 7.2 recipe. Other configurations retain standard precision. Reduced precision can change audio.",
        "**Processing details** explains device and memory choices. Cancelled, unreadable or incomplete output adds no stem tracks. A complete import keeps source trim, start and length and is one undoable edit.",
      ],
    },
    {
      type: "p",
      text: "If separation fails, read the dialog's worker error, exit code or last phase; try **CPU only** to isolate a GPU-specific failure, then use **Repair Stem Separation** if the runtime is outdated. Full per-run logs and periodic memory samples require an explicitly launched qualification run. These controls describe the unpublished candidate, not every installed release.",
    },

    { type: "h2", id: "workflows", text: "The workflows" },
    {
      type: "table",
      head: ["Workflow", "What it does", "Start it from"],
      rows: [
        [
          "**Text to Music**",
          "Generates a fresh clip with ACE-Step from a style or arrangement prompt, optional lyrics, BPM, duration, time signature, language, key and scale, seed, and generation controls.",
          "An AI track: **Insert** menu, the Command Palette, or `Ctrl+Alt+T` (macOS: `Cmd+Ctrl+T`)",
        ],
        [
          "**Lyrics + Style**",
          "Generates a song with ACE-Step or MiniMax Music 3.",
          "An AI track",
        ],
        [
          "**Song Sections**",
          "MiniMax Music 3: structured verse, chorus and bridge lyrics and arrangement direction.",
          "An AI track",
        ],
        [
          "**Text to Audio**",
          "Generates audio from a prompt with Stable Audio 3 Medium when that runtime and model are installed.",
          "An AI track",
        ],
        [
          "**Create Variation**",
          "Generates a related version of the selected clip using the source and variation controls; how much it preserves varies with the model and settings.",
          "Right-click an audio clip → **AI Generation**",
        ],
        [
          "**Inpaint Selection**",
          "Regenerates the time selection that overlaps the clip using surrounding audio as context. Make a time selection first and audition the transition.",
          "Right-click an audio clip → **AI Generation**",
        ],
        [
          "**Continue Clip**",
          "Generates a continuation tail from the selected clip using the prompt and tail-length controls.",
          "Right-click an audio clip → **AI Generation**",
        ],
        [
          "**Stem separation**",
          "Splits a source clip into vocals, drums, bass, guitar, piano, and other, imported back as editable clips on their own tracks.",
          "The Stem Separation dialog",
        ],
        [
          "**Audio to MIDI**",
          "Extracts MIDI notes from an audio clip with Basic Pitch and creates an adjacent MIDI track, with undo.",
          "An audio clip; the new MIDI track is created beside it",
        ],
      ],
    },
    {
      type: "p",
      text: `Generated audio is written as WAV. Variation and inpainting return a full result on a new track, while continuation returns a tail; MiniMax supports lyrics and structured songs rather than source-audio edits. Results become ordinary session material, so the next step is editing, routing, and mixing rather than importing. For stems that means the usual [Mixing & routing](${SITE_PATHS.docs}/mixing-and-routing) tools; for extracted notes, the [piano roll](${SITE_PATHS.docs}/midi-and-piano-roll).`,
    },

    { type: "h2", id: "staying-offline", text: "Staying offline" },
    {
      type: "p",
      text: aiSetupNetworkNote,
    },
    {
      type: "p",
      text: `Two other features in the app do talk to the network, and neither is part of AI Tools: automatic update checks (also manual under **Help → Check for Updates…**), and the optional TONE3000 sign-in in the [NAM Rack](${SITE_PATHS.docs}/nam-rack-setup).`,
    },
    {
      type: "callout",
      tone: "note",
      label: "MiniMax Music 3",
      text: aiSetupDownloads[2].description,
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
