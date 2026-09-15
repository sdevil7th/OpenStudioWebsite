import { AI_MODEL_CATALOG, aiSetupDownloads } from "@/data/aiSetup";
import { AudioWaveform, Book, Cpu, Download, Music, Scissors, Sparkles, Wand2 } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { SHOTS } from "@/data/siteContent";
import { SITE_PATHS, blogPostPath, docPath } from "@/constants/routes";
import { LiveStage } from "@/features/daw-preview/stage/LiveStage";
import {
  ArrowLink,
  Cta,
  DownloadCta,
  Eyebrow,
  Frame,
  GradIcon,
  HonestCallout,
  Kicker,
  renderInline,
} from "@/components/ui/primitives";
import { useSpReveal } from "@/hooks/useSpReveal";

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
    copy: "ACE-Step and Stable Audio 3 generate a clip from a prompt, create a variation of one you already have, continue it, or regenerate a selected range into a new result track.",
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

const MODELS = AI_MODEL_CATALOG;

const WORKFLOWS = [
  {
    icon: Music,
    title: "Text to music",
    copy: "Style prompt, optional lyrics, BPM, duration, key, seed. ACE-Step writes a WAV into the session.",
  },
  {
    icon: Wand2,
    title: "Create variation",
    copy: "Right-click a clip → **AI Generation**. A related version that keeps the source's identity.",
  },
  {
    icon: Scissors,
    title: "Inpaint selection",
    copy: "Make a time selection over a clip and regenerate just that range to match what is around it.",
  },
  {
    icon: Sparkles,
    title: "Continue clip",
    copy: "Generate a tail that follows on from the selected clip, with prompt and length controls.",
  },
];

const PRINCIPLES = [
  {
    number: "01",
    title: "Optional",
    copy: "The base app stays lean. If you do not install the runtime, none of this is there.",
  },
  {
    number: "02",
    title: "Offline after setup",
    copy: "Once the model files are on disk, generation and separation run without a connection.",
  },
  {
    number: "03",
    title: "No silent fallbacks",
    copy: "Everything is decoded in full. If a model cannot run on your hardware, the app tells you rather than quietly producing something worse.",
  },
];

const STATUS_COLOR = { good: "var(--sp-good)", warn: "var(--sp-warn)", plain: "var(--sp-mono-muted)" } as const;

const AiPage = () => {
  useSpReveal();

  return (
    <>
      <PageSeo
        description="Local stem separation and music generation in OpenStudio. Setup and availability for BS Roformer, ACE-Step, MiniMax Music 3 and Stable Audio 3 Medium."
        path={SITE_PATHS.ai}
        title="AI Tools: Local Stem Separation, Generation & Variation | OpenStudio"
      />

      {/* Hero */}
      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <Eyebrow icon={Cpu}>Optional download · Local · Offline after setup</Eyebrow>
        <h1 className="sp-h1 text-[clamp(38px,_4.4vw,_54px)]">
          AI that runs on your own machine, and only if you install it.
        </h1>
        <p className="sp-lede max-w-[680px]">
          Two families of tools that share one optional runtime. Pull a mix apart into stems, or generate, vary, and
          continue audio from a prompt, all inside the project and with your files staying on your disk. None of it
          ships in the base installer.
        </p>
        <div className="flex items-center gap-[16px] flex-wrap">
          <Cta icon={Book} to={docPath("ai-runtime-setup")}>
            Set up the AI Tools
          </Cta>
          <Cta icon={Cpu} to={`${docPath("ai-runtime-setup")}#hardware`} variant="outline">
            See what it needs
          </Cta>
        </div>
      </div>

      {/* Three cards */}
      <div className="sp-container pt-[40px]">
        <div className="sp-grid-3" data-sp-reveal="stagger">
          {AI_CARDS.map((card) => (
            <div key={card.title} className="sp-card p-[26px_26px_28px] flex flex-col gap-[10px]">
              <div>
                <GradIcon icon={card.icon} size={24} />
              </div>
              <div className="[font:700_21px/1.2_'Space_Grotesk',_sans-serif] tracking-[-0.02em]">{card.title}</div>
              <p className="sp-body text-[13.5px] leading-[1.62] flex-1">{card.copy}</p>
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
      <div className="sp-container pt-[52px]">
        <Kicker>How it is built</Kicker>
        <div className="sp-grid-3 gap-[30px]" data-sp-reveal="stagger">
          {PRINCIPLES.map((principle) => (
            <div className="[border-top:1px_solid_var(--sp-hairline)] pt-[16px]" key={principle.number}>
              <div className="sp-mono text-[11px] leading-[1] mb-[10px] text-[var(--sp-accent)]">
                {principle.number}
              </div>
              <div className="[font:700_19px/1.25_'Space_Grotesk',_sans-serif] tracking-[-0.02em] mb-[8px]">
                {principle.title}
              </div>
              <p className="sp-body text-[13.5px]">{principle.copy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stem separation */}
      <div className="sp-container pt-[64px]" id="stem-separation">
        <div className="sp-row min-[901px]:grid-cols-[1.1fr_.9fr]">
          <Frame reveal="media-left">
            <LiveStage
              alt="Separated stems as tracks in the arrangement"
              id="arrangement"
              poster={SHOTS.arrangementOverviewWide}
              variant="stems"
            />
          </Frame>
          <div data-sp-reveal="rise">
            <Kicker>Stem separation · BS Roformer</Kicker>
            <h2 className="sp-h2 text-[30px]">Separated parts arrive as tracks.</h2>
            <p className="sp-body max-w-[440px] mb-[14px]">
              Hand BS Roformer a stereo mix and choose which stems you want. Vocals, drums, bass, guitar, piano, and
              other land in the arrangement as ordinary tracks that you can edit, mix, and render with the project. Use
              it for remixes, practice tracks, cleanup, or replacing a part.
            </p>
            <ArrowLink to={`${docPath("ai-runtime-setup")}#workflows`}>Start a separation</ArrowLink>
          </div>
        </div>
      </div>

      {/* Generation */}
      <div className="sp-container pt-[64px]" id="generation">
        <div className="sp-row min-[901px]:grid-cols-[.9fr_1.1fr] items-start">
          <div data-sp-reveal="rise">
            <Kicker>Generation · ACE-Step · Stable Audio 3 · MiniMax Music 3</Kicker>
            <h2 className="sp-h2 text-[30px]">Generate, vary, and continue from the timeline.</h2>
            <p className="sp-body max-w-[440px] mb-[14px]">
              An AI track takes a prompt and optional lyrics and writes a fully decoded WAV into the session. Any
              existing audio clip can use variation, continuation or inpainting with a compatible model. Variation and
              inpainting create a new result track; continuation generates a tail. MiniMax Music 3 adds Lyrics + Style
              and Song Sections in the next desktop release.
            </p>
            <p className="sp-body max-w-[440px] mb-[16px]">
              The models run through a diffusers pipeline. In our ACE-Step benchmark that path came in almost three
              times faster than the equivalent ComfyUI graph.
            </p>
            <ArrowLink to={blogPostPath("ace-step-diffusers-almost-3x-faster")}>Read the benchmark</ArrowLink>
          </div>
          <div className="sp-grid-2 gap-[14px]" data-sp-reveal="stagger">
            {WORKFLOWS.map((workflow) => (
              <div key={workflow.title} className="sp-card sp-card--tight p-[18px_20px_20px]">
                <div className="mb-[10px]">
                  <GradIcon icon={workflow.icon} size={20} />
                </div>
                <div className="[font:700_15px/1.3_'Space_Grotesk',_sans-serif] tracking-[-0.01em] mb-[6px]">
                  {workflow.title}
                </div>
                <p className="sp-body text-[13px] leading-[1.6]">{renderInline(workflow.copy)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Models table */}
      <div className="sp-container pt-[52px]" data-sp-reveal="rise" id="models">
        <Kicker>Models</Kicker>
        <div className="sp-card sp-card--tight sp-scroll-x">
          <table className="sp-doc-table min-w-[760px]">
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
      <div className="sp-container pt-[46px]" data-sp-reveal="rise">
        <HonestCallout>
          The guided setup installs BS Roformer and ACE-Step. The next desktop release adds guided setup for Stable
          Audio 3 Medium and MiniMax Music 3. Licence access and hardware support depend on the model. Intel Macs can
          run the base app, but the managed AI runtime currently targets Apple silicon.
        </HonestCallout>
      </div>

      <div className="sp-container mt-6 grid gap-4 md:grid-cols-2">
        {aiSetupDownloads.slice(1).map((setup) => (
          <section key={setup.title} className="sp-card sp-card--tight">
            <h2 className="sp-h3">{setup.title}</h2>
            <p className="sp-body mt-3">{setup.description}</p>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="sp-container pt-[46px] pb-[62px] flex items-center gap-[16px] flex-wrap" data-sp-reveal="stagger">
        <DownloadCta />
        <Cta icon={Download} to={docPath("ai-runtime-setup")} variant="outline">
          Then install the AI Tools
        </Cta>
      </div>
    </>
  );
};

export default AiPage;
