// Shared guidance for the desktop release shipping with the website rebrand.
export const aiSetupIntro =
  "Open AI Tools in OpenStudio and choose the feature or model you need. Setup prepares the managed runtime and checks your hardware; AI packages and model weights are separate from the DAW installer. NAM Rack needs no AI runtime.";

export const aiSetupDownloads = [
  {
    title: "BS Roformer and ACE-Step",
    description:
      "Install stem separation or ACE-Step music generation from AI Tools. Setup downloads the selected dependencies and models. Installing one feature does not install every model.",
  },
  {
    title: "Stable Audio 3 Medium",
    description:
      "Request access on the Hugging Face model page and accept the Stability AI and Gemma licenses. Then choose Download and Set Up in the app, using a read token from your approved account or an existing Hugging Face login. OpenStudio downloads and converts the model automatically; local folder import remains optional. Allow extra disk space and time for conversion. This model supports text-to-audio, variation, selected-range replacement and continuation.",
  },
  {
    title: "MiniMax Music 3",
    description:
      "Accept the model license and choose Download and Set Up in the app. OpenStudio downloads the required Diffusers components from Hugging Face; a token is optional for this public model. Local folder import remains available. MiniMax supports lyrics and structured songs; source-audio editing uses another model. It needs substantial system RAM, and CPU offload trades GPU memory for more RAM and longer generation time.",
  },
];

export const aiSetupNetworkNote =
  "Internet access is needed for dependency downloads and to obtain model snapshots. Providers may require an account or license acceptance. Once setup and local model validation finish, generation runs locally without uploading your audio, prompts or lyrics. Available models and acceleration depend on your installed app version and hardware.";

interface AiModelSummary {
  model: string;
  family: string;
  does: string;
  status: string;
  tone: "good" | "warn" | "plain";
}

/** Shared by marketing and documentation; availability must follow desktop releases. */
export const AI_MODEL_CATALOG = [
  { model: "BS Roformer", family: "Stem separation", does: "Six-stem separation into new project tracks", status: "Guided setup", tone: "good" },
  { model: "ACE-Step", family: "Generation", does: "Text to Music, Lyrics + Style, variation, inpaint selection, continuation", status: "Guided setup · Diffusers", tone: "good" },
  { model: "Stable Audio 3 Medium", family: "Generation", does: "Text to Audio, variation, inpaint selection, continuation", status: "Guided setup · Diffusers", tone: "good" },
  { model: "MiniMax Music 3", family: "Generation", does: "Lyrics + Style and Song Sections (structured songs)", status: "Guided setup · Diffusers", tone: "good" },
  { model: "Basic Pitch", family: "Analysis", does: "Audio to MIDI", status: "Bundled model; inference in ONNX-enabled Windows and Linux builds", tone: "good" },
] satisfies AiModelSummary[];
