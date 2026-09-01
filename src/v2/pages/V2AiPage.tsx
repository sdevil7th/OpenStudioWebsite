import { AudioWaveform, Cpu, Download, Music } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { SHOTS, V2_PATHS } from "../content";
import { Cta, Eyebrow, Frame, GradIcon, HonestCallout, Kicker } from "../primitives";
import { ArrowLink } from "../primitives";

const AI_CARDS = [
  {
    icon: AudioWaveform,
    title: "Stem separation",
    copy: "BS Roformer splits a source into vocals, drums, bass, guitar, piano, and other. The results land as tracks in the project, ready to edit.",
    path: "/ai/stem-separation",
  },
  {
    icon: Music,
    title: "Text to music",
    copy: "ACE-Step generates from a prompt and lyrics, decodes fully, and writes a WAV into the session. Seeded generation makes results repeatable.",
    path: "/ai/generation",
  },
  {
    icon: Cpu,
    title: "Setup & hardware",
    copy: "One guided install prepares a managed local runtime. No manual Python environment. Here is what it downloads and what it needs to run.",
    path: "/ai/setup",
  },
];

const PRINCIPLES = [
  {
    number: "01",
    title: "Optional by design",
    copy: "The base app stays lean. If you do not install it, it is not there.",
  },
  {
    number: "02",
    title: "Offline after setup",
    copy: "Once the model files are on disk, nothing leaves your machine.",
  },
  {
    number: "03",
    title: "Quality over a quiet fallback",
    copy: "Full decode. If a model cannot run, it says so instead of silently degrading.",
  },
];

const V2AiPage = () => (
  <>
    <PageSeo
      description="Optional, local AI in OpenStudio: BS Roformer 6-stem separation, ACE-Step text-to-music, and Stable Audio 3 import. Runs offline after setup. Never bundled, never sent to a server."
      path={V2_PATHS.ai}
      robots="noindex"
      title="AI Tools — Local Stem Separation & Music Generation | OpenStudio"
    />

    {/* Hero */}
    <div className="sp-container" style={{ paddingTop: 64 }}>
      <Eyebrow icon={Cpu}>Optional download · Local · Offline after setup</Eyebrow>
      <h1 className="sp-h1" style={{ fontSize: "clamp(38px, 4.4vw, 54px)" }}>
        AI that runs on your machine, or not at all.
      </h1>
      <p className="sp-lede" style={{ maxWidth: 680 }}>
        None of this ships in the base installer. Install the AI Runtime once and separation and generation run
        locally, offline, with your files staying on your disk.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Cta icon={Download} to={V2_PATHS.download}>
          Set up the AI Runtime
        </Cta>
        <Cta icon={Cpu} to={`${V2_PATHS.download}#requirements`} variant="outline">
          See what it needs
        </Cta>
      </div>
    </div>

    {/* Three child cards */}
    <div className="sp-container" style={{ paddingTop: 40 }}>
      <div className="sp-grid-3">
        {AI_CARDS.map((card) => (
          <div key={card.title} className="sp-card" style={{ padding: "26px 26px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <GradIcon icon={card.icon} size={24} />
            </div>
            <div style={{ font: "700 21px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em" }}>{card.title}</div>
            <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.62, flex: 1 }}>
              {card.copy}
            </p>
            <code className="sp-mono" style={{ fontSize: 11, lineHeight: 1 }}>
              {card.path}
            </code>
            <span>
              <ArrowLink to={V2_PATHS.ai}>Open</ArrowLink>
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Principles (dark, full bleed) */}
    <section className="sp-dark-panel" style={{ marginTop: 52 }}>
      <div className="sp-container" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <Kicker style={{ color: "var(--sp-teal-bright)" }}>How it is built</Kicker>
        <div className="sp-grid-3" style={{ gap: 30 }}>
          {PRINCIPLES.map((principle) => (
            <div key={principle.number} style={{ borderTop: "1px solid rgba(255,255,255,.2)", paddingTop: 16 }}>
              <div style={{ font: "400 11px/1 'JetBrains Mono', monospace", color: "var(--sp-teal-bright)", marginBottom: 10 }}>
                {principle.number}
              </div>
              <div style={{ font: "700 19px/1.25 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 8 }}>
                {principle.title}
              </div>
              <p className="sp-body" style={{ fontSize: 13.5, color: "var(--sp-dark-body)" }}>
                {principle.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Six stems */}
    <div className="sp-container" style={{ paddingTop: 46 }}>
      <div className="sp-row" style={{ gridTemplateColumns: "1.1fr .9fr" }}>
        <Frame alt="Separated stems as tracks in the arrangement" src={SHOTS.arrangementOverviewWide} />
        <div>
          <Kicker>Six stems</Kicker>
          <h2 className="sp-h2" style={{ fontSize: 30 }}>
            Separated parts arrive as tracks.
          </h2>
          <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
            Vocals, drums, bass, guitar, piano, and other land in the arrangement as ordinary tracks — editable,
            mixable, and rendered with the project.
          </p>
        </div>
      </div>
    </div>

    {/* Honest block */}
    <div className="sp-container" style={{ padding: "46px 34px 62px" }}>
      <HonestCallout>
        The guided setup installs BS Roformer and ACE-Step. Stable Audio 3 is not included — it needs a separate
        gated snapshot import and its own runtime setup.
      </HonestCallout>
    </div>
  </>
);

export default V2AiPage;
