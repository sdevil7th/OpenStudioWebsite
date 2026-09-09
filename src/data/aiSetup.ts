// Shared guidance keeps availability explicit when the website deploys first.
export const aiSetupIntro =
  "Open AI Tools in OpenStudio and choose the feature or model you need. Setup prepares the managed runtime and checks your hardware; AI packages and model weights are separate from the DAW installer. NAM Rack needs no AI runtime.";

export const aiSetupDownloads = [
  {
    title: "BS Roformer and ACE-Step",
    description:
      "Install stem separation or ACE-Step music generation from AI Tools. Setup downloads the selected dependencies and models. Installing one feature does not install every model.",
  },
  {
    title: "Stable Audio 3 Medium — next desktop release",
    description:
      "Import a complete local snapshot after accepting the model and Gemma licenses. The updated setup accepts Diffusers folders or converts the original checkpoint while retaining your source files. Allow extra disk space and time for conversion. This model supports text-to-audio, variation, selected-range replacement and continuation.",
  },
  {
    title: "MiniMax Music 3 — next desktop release",
    description:
      "Import the complete Modular Diffusers snapshot and accept its model license. MiniMax supports lyrics and structured songs; source-audio editing uses another model. It needs substantial system RAM, and CPU offload trades GPU memory for more RAM and longer generation time.",
  },
];

export const aiSetupNetworkNote =
  "Internet access is needed for dependency downloads and to obtain model snapshots. Providers may require an account or license acceptance. Once setup and local model validation finish, generation runs locally without uploading your audio, prompts or lyrics. Available models and acceleration depend on your installed app version and hardware.";
