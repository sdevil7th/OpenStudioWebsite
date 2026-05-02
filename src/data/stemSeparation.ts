import { screenshots } from "@/data/screenshots";
import type { AccentTone, ActionLink, SeoMeta, StoryStep } from "@/data/marketing";

export const stemSeparationSeo: SeoMeta = {
  title: "OpenStudio AI | Free Stem Separation & Text-to-Audio in a DAW",
  description:
    "OpenStudio AI delivers free local stem separation (vocals, drums, bass, guitar, piano, other) and ACE-Step text-to-audio inside a free, open source DAW — no upload, no subscription.",
  path: "/ai",
  keywords: [
    "free stem separation software",
    "stem separation software",
    "vocal isolation",
    "ai music tools",
    "text to audio",
    "ai stem splitter",
    "daw with stem separation",
    "open source stem separation",
  ],
};

export const stemHero = {
  eyebrow: "OpenStudio AI",
  title: "Generate, separate, and keep producing in the same session.",
  description:
    "OpenStudio AI is built around practical production moves: split a mix into workable stems, or turn prompt and lyrics into a WAV render through the packaged ACE-Step path. The optional setup stays explicit, and the result stays close to the timeline.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
};

export const aiGenesisCopy = {
  eyebrow: "OpenStudio AI",
  headline: "An audio intelligence engine that lives inside the session.",
  subhead:
    "Pull mixes apart into editable stems. Compose new ideas from a single prompt. Every model, every render, every WAV — local, owned, and one keystroke from the timeline.",
  badge: "Local · Offline-capable · WAV-native",
  primaryCta: { label: "Download OpenStudio", to: "/download" } satisfies ActionLink,
  secondaryCta: { label: "See it in motion", to: "#ai-neural-lab" } satisfies ActionLink,
  ticker: ["BS Roformer", "ACE-Step", "Qwen", "Full VAE", "WAV", "Local runtime", "Seeded", "Offline"],
};

export const aiPillars = [
  {
    id: "stems",
    eyebrow: "Stem separation",
    title: "BS Roformer 6-stem extraction",
    description:
      "Hand the model any stereo mix and watch it bloom into vocals, drums, bass, guitar, piano, and other. Each lane stays in the project — ready for cuts, replacements, FX chains, or a new arrangement entirely.",
    details: ["Optional AI tools setup", "6-stem workflow", "Project-native export"],
  },
  {
    id: "text-audio",
    eyebrow: "Text to audio",
    title: "ACE-Step prompt and lyrics generation",
    description:
      "Type a prompt, drop in lyrics, choose a seed and duration. The packaged ACE graph runs end-to-end and writes a clean WAV straight onto the timeline — no graph apps, no glue scripts, no detours.",
    details: ["ACE-Step 1.5 XL Turbo", "Prompt + lyrics conditioning", "Offline after setup"],
  },
];

export const aiGenerationFacts = [
  "OpenStudio builds a known ACE graph internally instead of depending on a separate graph app.",
  "The packaged OpenStudio ACE runtime validates local model files before generation starts.",
  "Full VAE decode is treated as the quality path, with clear failure instead of silent lower-quality fallback.",
  "Generated audio is written as WAV output and can be brought back into the DAW workflow.",
];

export const aiHeroStats = [
  { label: "Stem lanes", value: "6", detail: "vocals, drums, bass, guitar, piano, other" },
  { label: "ACE profile", value: "1.5 XL", detail: "Turbo graph path with Qwen conditioning" },
  { label: "Output", value: "WAV", detail: "generated audio ready for the session" },
  { label: "Runtime", value: "Local", detail: "offline after optional setup and model validation" },
];

export interface AiNeuralStudioPhase {
  id: string;
  label: string;
  mode: "input" | "separate" | "generate" | "commit";
  headline: string;
  description: string;
  sceneBullets: string[];
  hudLines: string[];
  metrics: Array<{ label: string; value: string; detail: string }>;
  runtimeEvents: string[];
  accent: AccentTone;
  scrollRange: [number, number];
}

export const aiNeuralStudioPhases: AiNeuralStudioPhase[] = [
  {
    id: "input",
    label: "Input",
    mode: "input",
    headline: "A mixed signal gathers inside liquid glass.",
    description:
      "The AI lab opens on a black-glass field. One wide membrane carries the whole mix while six faint internal currents stay compressed inside it, waiting to separate.",
    sceneBullets: [
      "One thick glass waveform represents the full stereo mix.",
      "Six colored stem paths are still fused inside the signal.",
      "The local AI runtime is shown as the soft boundary around the scene.",
    ],
    hudLines: ["surface: liquid glass", "currents: six stems compressed", "boundary: local runtime field"],
    metrics: [
      { label: "Input", value: "Mix", detail: "one source carrying every musical part" },
      { label: "Layer", value: "6", detail: "stem currents still fused inside the signal" },
    ],
    runtimeEvents: [
      "The wide glass signal represents a full stereo clip entering the AI lab.",
      "Six colored currents are present from the start, but remain visually braided as one mix.",
      "The soft outer field marks the local runtime boundary around the session.",
    ],
    accent: "frost",
    scrollRange: [0, 0.2],
  },
  {
    id: "separate",
    label: "Separate",
    mode: "separate",
    headline: "The glass opens into six audio waveforms.",
    description:
      "The membrane unfolds into layered sheets while the internal currents become readable 3D waveform lanes for vocals, drums, bass, guitar, piano, and other.",
    sceneBullets: [
      "The single mix splits into six visible waveform silhouettes.",
      "Each waveform maps to a usable stem lane in the DAW.",
      "The original glass body stays behind them as context.",
    ],
    hudLines: ["analysis: band-split transformer", "waveforms: vocals drums bass guitar piano other", "state: stems separating"],
    metrics: [
      { label: "Stem lanes", value: "6", detail: "vocals, drums, bass, guitar, piano, other" },
      { label: "Motion", value: "Unfold", detail: "glass sheets opening around the currents" },
    ],
    runtimeEvents: [
      "The six currents stay abstract, but each maps to a practical stem lane.",
      "The outer glass keeps the scene unified while the inner lanes show separation taking shape.",
      "The result is useful for remix prep, cleanup, practice, arrangement changes, and processing.",
    ],
    accent: "emerald",
    scrollRange: [0.2, 0.44],
  },
  {
    id: "generate",
    label: "Generate",
    mode: "generate",
    headline: "ACE-Step transforms a prompt waveform.",
    description:
      "A single amber prompt waveform enters the scene. The ACE-Step orb catches prompt, lyrics, and seed as conditioning, then the signal exits in a new emerald-frost color as generated audio.",
    sceneBullets: [
      "One prompt waveform passes through the ACE-Step transform lens.",
      "The color shift marks new audio created from prompt, lyrics, and seed.",
      "The six separated stems stay quiet until the final sync timeline takes over.",
    ],
    hudLines: ["ace-step: prompt lyrics seed", "motion: waveform transform", "output: generated WAV signal"],
    metrics: [
      { label: "ACE profile", value: "1.5 XL", detail: "Turbo graph path with Qwen conditioning" },
      { label: "Creates", value: "WAV", detail: "new generated audio from prompt and lyrics" },
    ],
    runtimeEvents: [
      "Prompt, lyrics, and seed are represented by the amber waveform entering the ACE-Step orb.",
      "The generated waveform exits in a distinct color so it reads as newly created material.",
      "Full VAE decode remains the quality line before generated material becomes a WAV.",
    ],
    accent: "amber",
    scrollRange: [0.44, 0.68],
  },
  {
    id: "commit",
    label: "Commit",
    mode: "commit",
    headline: "Every waveform locks back into one session.",
    description:
      "The ending slows down into a visible sync pass. The six separated stems and generated waveform snap to one shared timeline, then a single playhead crosses every lane while their phase, rhythm, and peak envelope move together.",
    sceneBullets: [
      "Six stems and the generated waveform line up on the same x-domain.",
      "The shared playhead sweeps across every lane for multiple visible passes.",
      "The phase-locked waveforms behave as one session-ready song.",
    ],
    hudLines: ["view: timeline alignment", "sync: phase-locked playback", "playhead: shared across every lane"],
    metrics: [
      { label: "Runtime", value: "Local", detail: "offline after setup and model validation" },
      { label: "Result", value: "Session", detail: "edit, route, process, and render" },
    ],
    runtimeEvents: [
      "The local boundary remains visible as the packaged runner validates required model files.",
      "Separated stems and generated WAV files keep their identities while one playhead and phase clock keep them aligned peak-by-peak.",
      "The synchronized stack represents audio the producer can keep editing, routing, processing, and rendering.",
    ],
    accent: "emerald",
    scrollRange: [0.68, 1],
  },
];

export const musicGenerationExplainer = {
  eyebrow: "Text and lyrics to audio",
  title: "Turn a prompt, lyrics, and generation controls into a finished WAV.",
  paragraphs: [
    "OpenStudio's ACE-Step path is designed as an owned generation workflow: prompt and lyric conditioning, duration and seed control, graph execution, full VAE decode, and WAV output without asking the user to wire a separate graph app.",
    "The result is a creative sketch path that stays close to the project. Generate a coherent audio idea, review the output, and bring the WAV back into the same production flow where editing, arrangement, plugins, and mix decisions already live.",
  ],
};

export const musicGenerationControls = [
  {
    title: "Prompt and lyrics conditioning",
    description:
      "Tags and lyrics ride the ACE text encoder path. Language, key, time signature, BPM, duration — every dial that conditions the result stays visible and stays yours.",
    note: "Prompt + lyrics + metadata",
  },
  {
    title: "Seeded generation",
    description:
      "Seed, sampler, scheduler, steps, guidance, temperature, top-p, top-k, min-p. Repeat a take exactly. Branch a take deliberately. Generation feels like a take, not a roll of the dice.",
    note: "Duration, seed, sampler settings",
  },
  {
    title: "Graph execution owned by OpenStudio",
    description:
      "The ACE graph is built and run inside OpenStudio's executor. No separate graph app. No node soup. A fixed runtime boundary that behaves the same way every time you press render.",
    note: "Known graph, fixed runtime boundary",
  },
  {
    title: "Full decode as the quality line",
    description:
      "Full VAE decode is the normal path — never the silent fallback. If your machine can't carry the request, you get a clear failure instead of a quietly degraded WAV pretending everything was fine.",
    note: "No fake success path",
  },
];

export const musicGenerationWorkflowSteps: StoryStep[] = [
  {
    id: "write-prompt",
    eyebrow: "Prompt",
    title: "Describe the song idea and lyric shape.",
    description:
      "The generation surface starts with musical intent: tags for style and feel, lyrics when needed, and metadata such as BPM, duration, key, language, and time signature.",
    bullets: [
      "Prompt tags describe instrumentation, genre, energy, and production character.",
      "Lyrics can condition the generated result instead of being treated as an afterthought.",
      "Duration, seed, BPM, key, and language stay visible so the request is understandable.",
    ],
    screenshot: screenshots.arrangementOverviewWide,
  },
  {
    id: "validate-assets",
    eyebrow: "Validate",
    title: "Confirm the local ACE assets before generation.",
    description:
      "The packaged runner checks for the diffusion model, text encoders, and VAE before generation. Missing assets should point the user back to AI setup, not trigger surprise downloads.",
    bullets: [
      "Required model files are validated before offline guards are enabled.",
      "Generation runs locally after setup when the required assets are present.",
      "The base application can stay lean because large AI assets are optional.",
    ],
    screenshot: screenshots.channelStripCloseup,
  },
  {
    id: "execute-graph",
    eyebrow: "Execute",
    title: "Run the known ACE graph through the packaged executor.",
    description:
      "OpenStudio owns the graph path: text encoding, latent creation, sampling, decode, cache conventions, and output extraction are treated as runtime contract, not loose glue code.",
    bullets: [
      "ACE-Step 1.5 XL Turbo uses the OpenStudio packaged runtime profile.",
      "Qwen text encoders, ACE diffusion, and ACE VAE are loaded through known nodes.",
      "Executor output is validated before the final audio object is accepted.",
    ],
    screenshot: screenshots.pluginHostingPitchAra,
  },
  {
    id: "write-wav",
    eyebrow: "Render",
    title: "Decode the result and write a WAV for the session.",
    description:
      "After sampling, full VAE decode produces the audio object that OpenStudio writes directly as WAV output so the generated idea can become project material.",
    bullets: [
      "Full VAE decode is the intended quality path.",
      "The generation path writes WAV output without hiding quality-sensitive fallback behavior.",
      "The WAV can move back into the editing, routing, and mix story.",
    ],
    screenshot: screenshots.heroTimeline,
  },
];

export const aiRuntimePrinciples = [
  {
    title: "Optional by design",
    description:
      "The base download stays focused. The AI runtime — every model, every weight — lives behind a deliberate setup step, never bundled by surprise.",
  },
  {
    title: "Offline after setup",
    description:
      "Once the assets are in place, generation validates local files and runs behind offline guards. Your work doesn't depend on a server somewhere having a good day.",
  },
  {
    title: "Quality over quiet fallback",
    description:
      "Full VAE decode is the line. Cross it cleanly, or fail loudly. Nothing is more disrespectful than a silently degraded render pretending to be the real thing.",
  },
  {
    title: "Project material, not demos",
    description:
      "Whatever the AI produces — a separated stem, a generated WAV — lands in the project as a first-class clip. Editable, routable, mixable, finishable.",
  },
];

export const aiArchitectureNodes = [
  {
    id: "br",
    label: "BS Roformer",
    role: "Stem extractor",
    accent: "emerald" as AccentTone,
    description: "Band-split transformer that reads the spectrogram and lifts six discrete lanes from a single mix.",
  },
  {
    id: "ace",
    label: "ACE-Step 1.5 XL Turbo",
    role: "Generation graph",
    accent: "lavender" as AccentTone,
    description: "Diffusion graph that turns prompt, lyrics, and seed into latent audio — owned end to end.",
  },
  {
    id: "qwen",
    label: "Qwen encoders",
    role: "Text conditioning",
    accent: "frost" as AccentTone,
    description: "Multilingual text and lyric encoders that shape what the diffusion process actually hears.",
  },
  {
    id: "sampler",
    label: "Sampler · Scheduler",
    role: "Diffusion controls",
    accent: "amber" as AccentTone,
    description: "Seed, steps, guidance, top-p, top-k, min-p — all the dials, none of them hidden.",
  },
  {
    id: "vae",
    label: "Full VAE decode",
    role: "Quality path",
    accent: "lavender" as AccentTone,
    description: "Full decode is the normal route. There is no silent low-quality fallback path waiting in the wings.",
  },
  {
    id: "runtime",
    label: "Local runtime",
    role: "Owned execution",
    accent: "emerald" as AccentTone,
    description: "A managed Python environment provisioned in-app — validated, sandboxed, and offline after setup.",
  },
];

export const stemExplainer = {
  eyebrow: "What it does",
  title: "Pull a full source apart into workable parts.",
  paragraphs: [
    "Stem separation breaks a source into individual parts so you can work on the pieces instead of only reacting to the full mix. In OpenStudio, that means isolating vocals, drums, bass, guitar, piano, and other directly from the app once the optional AI tools are installed.",
    "That matters because the result does not stop at analysis. The new material can move straight into editing, arrangement changes, pitch work, FX choices, and mix decisions inside the same project.",
  ],
};

export const stemArchitectureCards = [
  {
    id: "vocals",
    label: "Vocals",
    color: "rgba(255, 92, 92, 0.9)",
    description: "Isolate lead lines, harmonies, and vocal phrasing when the session needs cleanup or a new arrangement decision.",
  },
  {
    id: "drums",
    label: "Drums",
    color: "rgba(245, 212, 68, 0.9)",
    description: "Pull the rhythm bed apart for groove studies, transient cleanup, or a different production direction.",
  },
  {
    id: "bass",
    label: "Bass",
    color: "rgba(86, 219, 109, 0.9)",
    description: "Give low-end material its own path when balance, tone, or replacement work needs more control.",
  },
  {
    id: "piano",
    label: "Piano",
    color: "rgba(58, 215, 255, 0.9)",
    description: "Break harmonic content into something you can mute, reshape, or process as part of a new arrangement.",
  },
  {
    id: "guitar",
    label: "Guitar",
    color: "rgba(111, 122, 255, 0.92)",
    description: "Separate guitars for re-amping, editing, texture changes, or creative resampling inside the same project.",
  },
  {
    id: "other",
    label: "Other",
    color: "rgba(246, 134, 255, 0.9)",
    description: "Everything else stays available as its own creative layer instead of disappearing into the original source.",
  },
];

export const stemWhyItMatters = [
  {
    title: "Stay in the project",
    description:
      "From separation to editing to mix work, the point is to keep momentum inside one session instead of round-tripping through another utility.",
  },
  {
    title: "Work on parts, not only full mixes",
    description:
      "When you can isolate a vocal, a rhythm section, or a harmonic layer, more arrangement and cleanup decisions become practical.",
  },
  {
    title: "Turn a special-purpose tool into a real workflow step",
    description:
      "Stem separation becomes more useful when it is integrated with the timeline, pitch tools, plugin chains, and mixer instead of living off to the side.",
  },
];

export const stemPerformanceNotes = [
  {
    title: "Zero round-trips",
    description: "Separate material, bring it back into the timeline, and keep moving inside the project instead of bouncing between utilities.",
  },
  {
    title: "Practical extraction",
    description: "The goal is not an abstract AI demo. The goal is to create workable parts that feed the next production decision.",
  },
  {
    title: "Local workflow value",
    description: "Once the optional tools are installed, the separation path becomes part of editing, pitch work, routing, and mix choices already happening in the DAW.",
  },
];

export const stemWorkspaceChannels = stemArchitectureCards.map((card, index) => ({
  ...card,
  level: ["78%", "62%", "54%", "48%", "40%", "66%"][index]!,
}));

export const stemUseCases = [
  {
    title: "Remix preparation",
    description: "Lift the parts you want, leave the rest behind, and rebuild the song around a new center of gravity.",
  },
  {
    title: "Vocal or instrument isolation",
    description: "Drop a clean lead into pitch tools, gates, or de-essers without dragging the rest of the mix along for the ride.",
  },
  {
    title: "Arrangement experiments",
    description: "Mute lanes, reshuffle sections, and audition alternate structures without rebuilding a project from scratch.",
  },
  {
    title: "Practice and reference work",
    description: "Strip a track to its essentials when you need to study a part, transcribe a line, or rehearse against a reduced source.",
  },
  {
    title: "Creative resampling",
    description: "Treat each separated lane as new raw material — chop it, layer it, pitch it, run it through anything in the rack.",
  },
  {
    title: "Mix cleanup",
    description: "Push a single lane into its own FX chain when the source needs more control than the printed mix can give you.",
  },
];

export const stemWorkflowIntro = {
  eyebrow: "Workflow",
  title: "From separation to editing to mix decisions in one place.",
  description:
    "The value is not just that separation exists. The value is that the result can stay connected to the rest of the production workflow.",
};

export const stemWorkflowSteps: StoryStep[] = [
  {
    id: "choose-and-separate",
    eyebrow: "Separate",
    title: "Choose the source and extract only the stems you need.",
    description:
      "OpenStudio's current stem workflow is designed to stay practical. You choose the clip, select the target stems, run the separation, and bring the results back into the session.",
    bullets: [
      "Current path targets vocals, drums, bass, guitar, piano, and other.",
      "The feature is available after the optional AI tools install inside the app.",
      "The base app stays smaller because the AI runtime is not bundled by default.",
    ],
    screenshot: screenshots.arrangementOverviewWide,
  },
  {
    id: "edit-and-arrange",
    eyebrow: "Edit",
    title: "Treat the separated stems like production material, not exports.",
    description:
      "Once the stems are back in the project, they can move through the timeline like the rest of the session. That means arrangement work can continue immediately instead of waiting on another app handoff.",
    bullets: [
      "Trim, split, move, mute, and rearrange the separated parts in the timeline.",
      "Try alternate arrangements by keeping or removing specific layers.",
      "Use the result as source material for a new section, bounce, or edit pass.",
    ],
    screenshot: screenshots.heroTimeline,
  },
  {
    id: "shape-and-process",
    eyebrow: "Process",
    title: "Push isolated parts through pitch tools, FX, and plugin chains.",
    description:
      "Isolation becomes more useful when you can immediately shape the result. OpenStudio keeps the separated material close to pitch editing, plugin windows, and effect chains.",
    bullets: [
      "Tune or reshape a separated vocal inside the same project.",
      "Route isolated material into dedicated FX chains and plugin windows.",
      "Use the result for correction, creative processing, or both.",
    ],
    screenshot: screenshots.pluginHostingPitchAra,
  },
  {
    id: "mix-and-deliver",
    eyebrow: "Finish",
    title: "Balance the result, make the mix decision, and render the project.",
    description:
      "Separated parts are most useful when they lead into the mix instead of stopping at a demo preview. OpenStudio keeps the mixer, routing, and export path right there when the session moves forward.",
    bullets: [
      "Balance new stems through the mixer and route them where they need to go.",
      "Use automation and FX choices to fit the parts back into the song.",
      "Render the project once the new arrangement or cleanup pass is ready.",
    ],
    screenshot: screenshots.channelStripCloseup,
  },
];

export const stemInstallFacts = [
  "Stem separation is optional and provisioned through an in-app AI tools install.",
  "The setup builds a managed local runtime for you — no separate Python environment to wire up.",
  "Once installed, the ACE assets run locally and offline after the required model files are validated.",
  "The base download stays small because the AI runtime is never bundled by default.",
];

export const stemPracticalNote =
  "This is an integrated production tool, not magic. Results depend on the source material, but the workflow value comes from keeping the outcome inside the project once separation is done.";

export const stemFinalCta = {
  eyebrow: "Keep going",
  title: "Separate the source, then keep producing in the same DAW.",
  description:
    "OpenStudio treats stem separation as one step in a larger workflow, not as an isolated trick that ends in another export folder.",
  primaryCta: {
    label: "Download OpenStudio",
    to: "/download",
  } satisfies ActionLink,
  secondaryCta: {
    label: "Explore Features",
    to: "/features",
  } satisfies ActionLink,
};

export const aiOutroCopy = {
  eyebrow: "Ship the take",
  headline: "Generate, separate, decide, finish.",
  body: "OpenStudio AI is not a demo loop and not a side panel. It is the same engine that drives the rest of your session — only now it can pull a mix apart and write a new one when the song asks for it.",
  primaryCta: { label: "Download OpenStudio", to: "/download" } satisfies ActionLink,
  secondaryCta: { label: "Explore Features", to: "/features" } satisfies ActionLink,
};
