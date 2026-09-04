import { AudioWaveform, Book, Cpu, Download, Music, Scissors, Sparkles, Wand2 } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { SHOTS, V2_PATHS, blogPostPath, docPath } from "../content";
import { ArrowLink, Cta, DownloadCta, Eyebrow, Frame, GradIcon, HonestCallout, Kicker, renderInline } from "../primitives";
import { useSpReveal } from "../useSpReveal";

// The two families of AI tools. Cards link to the matching section on this
// page, and the setup card to the docs — nothing points at a placeholder route.
const AI_CARDS = [
  {
    icon: AudioWaveform,
    title: "Stem separation",
    copy: "BS Roformer splits a mixed track into vocals, drums, bass, guitar, piano, and other. The results land as tracks in the project, ready to edit.",
    to: "#stem-separation",
    label: "How separation works",
  },
  {
    icon: Sparkles,
    title: "Generation, variation, continuation",
    copy: "ACE-Step and Stable Audio 3 generate a clip from a prompt, create a variation of one you already have, continue it, or regenerate a selection in place.",
    to: "#generation",
    label: "The generation workflows",
  },
  {
    icon: Cpu,
    title: "Setup & hardware",
    copy: "One guided install from inside the app prepares a managed local runtime. No manual Python environment. Here is what it downloads and what it needs to run.",
    to: docPath("ai-runtime-setup"),
    label: "AI Tools setup guide",
  },
];

const MODELS: { model: string; family: string; does: string; status: string; tone: "good" | "warn" | "plain" }[] = [
  { model: "BS Roformer", family: "Stem separation", does: "Six-stem split of a mixed track into new project tracks", status: "Installed by the guided setup", tone: "good" },
  { model: "ACE-Step", family: "Generation", does: "Text to music, lyrics + style, variation, continuation, inpaint", status: "Installed by the guided setup", tone: "good" },
  { model: "Stable Audio 3 Medium", family: "Generation", does: "Text to audio", status: "Separate gated snapshot import and license acknowledgement", tone: "warn" },
  { model: "MiniMax", family: "Generation", does: "Generation, variation, continuation", status: "Planned — not in the current build", tone: "plain" },
  { model: "Basic Pitch", family: "Analysis", does: "Audio to MIDI", status: "Bundled; inference in ONNX-enabled Windows and Linux builds", tone: "good" },
];

const WORKFLOWS = [
  { icon: Music, title: "Text to music", copy: "Style prompt, optional lyrics, BPM, duration, key, seed. ACE-Step writes a WAV into the session." },
  { icon: Wand2, title: "Create variation", copy: "Right-click a clip → **AI Generation**. A related version that keeps the source's identity." },
  { icon: Scissors, title: "Inpaint selection", copy: "Make a time selection over a clip and regenerate just that range to match what is around it." },
  { icon: Sparkles, title: "Continue clip", copy: "Generate a tail that follows on from the selected clip, with prompt and length controls." },
];

const PRINCIPLES = [
  { number: "01", title: "Optional by design", copy: "The base app stays lean. If you do not install the runtime, none of this is there." },
  { number: "02", title: "Offline after setup", copy: "Once the model files are on disk, generation and separation run without a connection." },
  { number: "03", title: "Quality over a quiet fallback", copy: "Full decode. If a model cannot run on your hardware, it says so instead of silently degrading." },
];

const STATUS_COLOR = { good: "var(--sp-good)", warn: "var(--sp-warn)", plain: "var(--sp-mono-muted)" } as const;

const V2AiPage = () => {
  useSpReveal();

  return (
    <>
      <PageSeo
        description="Optional, local AI in OpenStudio: BS Roformer six-stem separation, and ACE-Step and Stable Audio 3 generation, variation, and continuation. Runs on your machine after a guided setup. Never bundled, never sent to a server."
        path={V2_PATHS.ai}
        robots="noindex"
        title="AI Tools — Local Stem Separation, Generation & Variation | OpenStudio"
      />

      {/* Hero */}
      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <Eyebrow icon={Cpu}>Optional download · Local · Offline after setup</Eyebrow>
        <h1 className="sp-h1" style={{ fontSize: "clamp(38px, 4.4vw, 54px)" }}>
          AI that runs on your machine, or not at all.
        </h1>
        <p className="sp-lede" style={{ maxWidth: 680 }}>
          Two families of tools, one optional runtime. Pull a mix apart into stems, or generate, vary, and continue
          audio from a prompt — inside the project, with your files staying on your disk. None of it ships in the
          base installer.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Cta icon={Book} to={docPath("ai-runtime-setup")}>
            Set up the AI Tools
          </Cta>
          <Cta icon={Cpu} to={`${docPath("ai-runtime-setup")}#hardware`} variant="outline">
            See what it needs
          </Cta>
        </div>
      </div>

      {/* Three cards */}
      <div className="sp-container" style={{ paddingTop: 40 }}>
        <div className="sp-grid-3" data-sp-reveal="stagger">
          {AI_CARDS.map((card) => (
            <div key={card.title} className="sp-card" style={{ padding: "26px 26px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <GradIcon icon={card.icon} size={24} />
              </div>
              <div style={{ font: "700 21px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>{card.title}</div>
              <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.62, flex: 1 }}>
                {card.copy}
              </p>
              <span>
                {card.to.startsWith("#") ? (
                  <ArrowLink href={card.to}>{card.label}</ArrowLink>
                ) : (
                  <ArrowLink to={card.to}>{card.label}</ArrowLink>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Principles — a light row, so the page keeps one continuous ground */}
      <div className="sp-container" style={{ paddingTop: 52 }}>
        <Kicker>How it is built</Kicker>
        <div className="sp-grid-3" data-sp-reveal="stagger" style={{ gap: 30 }}>
          {PRINCIPLES.map((principle) => (
            <div key={principle.number} style={{ borderTop: "1px solid var(--sp-hairline)", paddingTop: 16 }}>
              <div className="sp-mono" style={{ fontSize: 11, lineHeight: 1, marginBottom: 10, color: "var(--sp-accent)" }}>
                {principle.number}
              </div>
              <div style={{ font: "700 19px/1.25 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 8 }}>
                {principle.title}
              </div>
              <p className="sp-body" style={{ fontSize: 13.5 }}>
                {principle.copy}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stem separation */}
      <div className="sp-container" id="stem-separation" style={{ paddingTop: 64 }}>
        <div className="sp-row" style={{ gridTemplateColumns: "1.1fr .9fr" }}>
          <Frame alt="Separated stems as tracks in the arrangement" reveal="media-left" src={SHOTS.arrangementOverviewWide} />
          <div data-sp-reveal="rise">
            <Kicker>Stem separation · BS Roformer</Kicker>
            <h2 className="sp-h2" style={{ fontSize: 30 }}>
              Separated parts arrive as tracks.
            </h2>
            <p className="sp-body" style={{ maxWidth: 440, marginBottom: 14 }}>
              Hand BS Roformer a stereo mix and choose which stems you want. Vocals, drums, bass, guitar, piano,
              and other land in the arrangement as ordinary tracks — editable, mixable, and rendered with the
              project. Use it for remixes, practice tracks, cleanup, or replacing a part.
            </p>
            <ArrowLink to={`${docPath("ai-runtime-setup")}#workflows`}>Start a separation</ArrowLink>
          </div>
        </div>
      </div>

      {/* Generation */}
      <div className="sp-container" id="generation" style={{ paddingTop: 64 }}>
        <div className="sp-row" style={{ gridTemplateColumns: ".9fr 1.1fr", alignItems: "start" }}>
          <div data-sp-reveal="rise">
            <Kicker>Generation · ACE-Step · Stable Audio 3</Kicker>
            <h2 className="sp-h2" style={{ fontSize: 30 }}>
              Generate, vary, and continue — from the timeline.
            </h2>
            <p className="sp-body" style={{ maxWidth: 440, marginBottom: 14 }}>
              An AI track takes a prompt and optional lyrics and writes a fully decoded WAV into the session. Any
              existing audio clip can be varied, continued, or regenerated in place from its context menu. Seeded
              generation makes results repeatable.
            </p>
            <p className="sp-body" style={{ maxWidth: 440, marginBottom: 16 }}>
              The models run through a diffusers pipeline. In our ACE-Step benchmark that path came in almost three
              times faster than the equivalent ComfyUI graph.
            </p>
            <ArrowLink to={blogPostPath("ace-step-diffusers-almost-3x-faster")}>Read the benchmark</ArrowLink>
          </div>
          <div className="sp-grid-2" data-sp-reveal="stagger" style={{ gap: 14 }}>
            {WORKFLOWS.map((workflow) => (
              <div key={workflow.title} className="sp-card sp-card--tight" style={{ padding: "18px 20px 20px" }}>
                <div style={{ marginBottom: 10 }}>
                  <GradIcon icon={workflow.icon} size={20} />
                </div>
                <div style={{ font: "700 15px/1.3 'Space Grotesk', sans-serif", letterSpacing: "-0.01em", marginBottom: 6 }}>
                  {workflow.title}
                </div>
                <p className="sp-body" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {renderInline(workflow.copy)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Models table */}
      <div className="sp-container" data-sp-reveal="rise" id="models" style={{ paddingTop: 52 }}>
        <Kicker>Models</Kicker>
        <div className="sp-card sp-card--tight sp-scroll-x">
          <table className="sp-doc-table" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>Model</th>
                <th>Family</th>
                <th>What it does</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((row) => (
                <tr key={row.model}>
                  <td>{row.model}</td>
                  <td>{row.family}</td>
                  <td>{row.does}</td>
                  <td style={{ color: STATUS_COLOR[row.tone] }}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Honest block */}
      <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 46 }}>
        <HonestCallout>
          The guided setup installs BS Roformer and ACE-Step. Stable Audio 3 Medium is not included — it needs a
          separate gated snapshot import and a license acknowledgement. The managed macOS runtime is Apple silicon
          only for now: Intel Macs run the base app, but AI Tools stay unavailable there. Local hardware, RAM, and
          VRAM decide what runs and how fast.
        </HonestCallout>
      </div>

      {/* CTA */}
      <div className="sp-container" data-sp-reveal="stagger" style={{ paddingTop: 46, paddingBottom: 62, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <DownloadCta />
        <Cta icon={Download} to={docPath("ai-runtime-setup")} variant="outline">
          Then install the AI Tools
        </Cta>
      </div>
    </>
  );
};

export default V2AiPage;
