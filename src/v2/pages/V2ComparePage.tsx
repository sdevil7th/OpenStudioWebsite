import { Check, Minus, Scale, Sparkles, SlidersHorizontal, Zap } from "lucide-react";
import { Fragment, type CSSProperties } from "react";
import PageSeo from "@/components/PageSeo";
import { V2_PATHS } from "../content";
import { Cta, DownloadCta, Eyebrow, HonestCallout, Kicker } from "../primitives";
import { useSpReveal } from "../useSpReveal";

// Sourced from the OpenStudio positioning deck (August 2026). Each cell
// describes how the capability is offered, not a quality judgement.
type Verdict = "included" | "paid" | "limited" | "none";

interface Cell {
  text: string;
  verdict: Verdict;
}

const included = (text = "Included free"): Cell => ({ text, verdict: "included" });
const paid = (text: string): Cell => ({ text, verdict: "paid" });
const limited = (text: string): Cell => ({ text, verdict: "limited" });
const none = (text = "Not core"): Cell => ({ text, verdict: "none" });

const COLUMNS = ["OpenStudio", "Cubase", "Pro Tools", "REAPER", "Suno", "Udio"];

const ROWS: { label: string; cells: [Cell, Cell, Cell, Cell, Cell, Cell] }[] = [
  {
    label: "Basic DAW + recording",
    cells: [included(), paid("Paid"), limited("Free / 8 tracks"), limited("60-day eval"), limited("Browser Studio / paid"), none()],
  },
  {
    label: "MIDI note editing",
    cells: [included(), paid("Paid"), limited("Free / limited"), limited("Included in eval"), limited("Export only / Premier"), none()],
  },
  {
    label: "Graphical pitch workflow",
    cells: [included(), paid("VariAudio / paid"), paid("Melodyne separate"), limited("Basic ReaTune"), limited("Basic Studio tools / paid"), none()],
  },
  {
    label: "AI music generation",
    cells: [included("Free / optional"), none(), none(), none(), limited("Free / credit-limited"), limited("Free / credit-limited")],
  },
  {
    label: "Integrated guitar rig",
    cells: [included(), paid("Paid suite"), limited("Limited amps"), paid("Plugins separate"), none(), none()],
  },
  {
    label: "VST3 / CLAP / LV2 / ARA2 hosting",
    cells: [included(), paid("VST3 / paid"), paid("AAX / paid"), limited("Included in eval"), none("No"), none("No")],
  },
];

const VERDICT_COLOR: Record<Verdict, string> = {
  included: "var(--sp-good)",
  paid: "var(--sp-warn)",
  limited: "var(--sp-body)",
  none: "var(--sp-mono-muted)",
};

const VerdictIcon = ({ verdict }: { verdict: Verdict }) => {
  if (verdict === "included") return <Check aria-hidden="true" size={14} strokeWidth={2.2} />;
  if (verdict === "none") return <Minus aria-hidden="true" size={13} strokeWidth={2} />;
  return null;
};

const PARADIGMS = [
  {
    icon: SlidersHorizontal,
    eyebrow: "Legacy DAWs",
    title: "Pro Tools, Cubase, REAPER",
    pro: "Professional control over recording, editing, plugins, and finishing.",
    con: "Premium multitrack recording, pitch editing, MIDI editing, plugin support, and a guitar rig often sit behind paid editions or separate purchases.",
  },
  {
    icon: Sparkles,
    eyebrow: "AI generators",
    title: "Suno, Udio",
    pro: "Instant ideation. A prompt becomes a track in seconds.",
    con: "Shallow production control. Recording, deep editing, plugins, and finishing still move into a proper DAW.",
  },
];

const STACK: [string, string][] = [
  ["DAW", "Pro Tools"],
  ["Pitch editing", "Melodyne"],
  ["Guitar rig", "Neural DSP"],
  ["Generation", "Suno"],
];

const SOURCES: [string, string][] = [
  ["Cubase editions", "https://www.steinberg.net/cubase/compare-editions/"],
  ["Pro Tools Intro FAQ", "https://kb.avid.com/pkb/articles/en_US/Knowledge/Pro-Tools-Intro-FAQ"],
  ["REAPER purchase", "https://www.cockos.com/reaper/purchase.php"],
  ["Suno pricing", "https://suno.com/pricing"],
  ["Suno Studio", "https://suno.com/release-notes/introducing-suno-studio"],
  ["Udio subscriptions", "https://help.udio.com/en/articles/10739199-changing-or-canceling-your-subscription"],
];

const cellStyle = (options: { header?: boolean; withBorderRight?: boolean }): CSSProperties => ({
  padding: options.header ? "15px 16px" : "13px 16px",
  borderTop: options.header ? undefined : "1px solid var(--sp-hairline)",
  borderRight: options.withBorderRight ? "1px solid var(--sp-hairline)" : undefined,
});

const V2ComparePage = () => {
  useSpReveal();

  return (
    <>
      <PageSeo
        description="How OpenStudio compares with Cubase, Pro Tools, REAPER, Suno, and Udio on recording, MIDI, pitch editing, AI generation, guitar rig, and plugin hosting — and what it costs."
        path={V2_PATHS.compare}
        robots="noindex"
        title="OpenStudio vs Cubase, Pro Tools, REAPER, Suno & Udio"
      />

      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <Eyebrow icon={Scale}>Both paradigms, one tool</Eyebrow>
        <h1 className="sp-h1">How OpenStudio compares.</h1>
        <p className="sp-lede" style={{ maxWidth: 680 }}>
          Music creation has split into two workflows: legacy DAWs with professional control behind paywalls, and
          AI generators with instant ideas and shallow production. OpenStudio wraps the whole path from creation to
          production in one free tool.
        </p>
      </div>

      {/* Two paradigms and the gap */}
      <div className="sp-container" style={{ paddingTop: 38 }}>
        <div className="sp-grid-3" data-sp-reveal="stagger">
          {PARADIGMS.map((paradigm) => (
            <div key={paradigm.title} className="sp-card" style={{ padding: "26px 28px" }}>
              <Eyebrow icon={paradigm.icon}>{paradigm.eyebrow}</Eyebrow>
              <div style={{ font: "700 20px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 14 }}>
                {paradigm.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--sp-good)", paddingTop: 2 }}>
                    <Check aria-hidden="true" size={14} strokeWidth={2.2} />
                  </span>
                  <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    {paradigm.pro}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--sp-warn)", paddingTop: 2 }}>
                    <Minus aria-hidden="true" size={14} strokeWidth={2.2} />
                  </span>
                  <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                    {paradigm.con}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="sp-card sp-card--dark" style={{ padding: "26px 28px" }}>
            <Eyebrow icon={Zap} tone="teal">
              The gap
            </Eyebrow>
            <div style={{ font: "700 20px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 12 }}>
              One tool for the full creation-to-production workflow. Free.
            </div>
            <p className="sp-body" style={{ fontSize: 13.5, color: "var(--sp-dark-body)" }}>
              Multitrack recording, MIDI and graphical pitch editing, VST3 / CLAP / LV2 / ARA2 hosting, local AI
              generation, variation, and stem separation, and a NAM guitar rig with pedals, cab, EQ, and effects —
              in the same project, with no paid edition.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="sp-container" style={{ paddingTop: 44 }}>
        <Kicker>Capability, by how it is offered</Kicker>
        <div className="sp-card sp-card--tight sp-scroll-x" data-sp-reveal="rise">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr repeat(6, 1fr)", minWidth: 1060 }}>
            <div className="sp-matrix__sticky" style={cellStyle({ header: true })} />
            {COLUMNS.map((column, index) => (
              <div
                key={column}
                className={index === 0 ? "sp-compare__cell--us" : undefined}
                style={{
                  ...cellStyle({ header: true }),
                  font: "700 14px/1.3 'Space Grotesk', sans-serif",
                  color: index === 0 ? "var(--sp-accent)" : "var(--sp-ink)",
                }}
              >
                {column}
              </div>
            ))}
            {ROWS.map((row) => (
              <Fragment key={row.label}>
                <div
                  className="sp-matrix__sticky"
                  style={{
                    ...cellStyle({}),
                    font: "600 13px/1.4 'Space Grotesk', sans-serif",
                  }}
                >
                  {row.label}
                </div>
                {row.cells.map((cell, cellIndex) => (
                  <div key={cellIndex} className={cellIndex === 0 ? "sp-compare__cell--us" : undefined}>
                    <div
                      style={{
                        ...cellStyle({}),
                        font: `${cellIndex === 0 ? 600 : 400} 13px/1.45 'Space Grotesk', sans-serif`,
                        color: VERDICT_COLOR[cell.verdict],
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <VerdictIcon verdict={cell.verdict} />
                      {cell.text}
                    </div>
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
        <div className="sp-compare__legend sp-mono">
          <span style={{ color: "var(--sp-good)" }}>
            <Check aria-hidden="true" size={12} strokeWidth={2.2} /> included in the free build
          </span>
          <span style={{ color: "var(--sp-warn)" }}>paid edition or separate purchase</span>
          <span>limited, trial, or credit-gated</span>
          <span style={{ color: "var(--sp-mono-muted)" }}>
            <Minus aria-hidden="true" size={12} strokeWidth={2} /> not part of the product
          </span>
        </div>
      </div>

      {/* Cost illustration */}
      <div className="sp-container" style={{ paddingTop: 44 }}>
        <div className="sp-row" data-sp-reveal="stagger" style={{ gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <div>
            <Kicker>The first-year studio</Kicker>
            <h2 className="sp-h2" style={{ fontSize: 30 }}>
              $0, against an illustrative ~$830 stack.
            </h2>
            <p className="sp-body" style={{ maxWidth: 460, marginBottom: 14 }}>
              To cover the same ground with separate products you would typically buy a DAW, a pitch editor, a
              guitar rig, and a generation subscription. OpenStudio ships all four in the base app.
            </p>
            <p className="sp-mono" style={{ margin: 0, lineHeight: 1.6 }}>
              List-price illustration only; not a claim of feature or quality equivalence.
            </p>
          </div>
          <div className="sp-card sp-card--tight" style={{ overflow: "hidden" }}>
            {STACK.map(([role, product], index) => (
              <div
                key={role}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  padding: "13px 18px",
                  borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined,
                  font: "400 13px/1.5 'Space Grotesk', sans-serif",
                  color: "var(--sp-body)",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--sp-ink)" }}>{role}</span>
                <span>{product}</span>
                <span style={{ color: "var(--sp-good)", fontWeight: 600, textAlign: "right" }}>OpenStudio · $0</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Honest note, kept short */}
      <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 44 }}>
        <HonestCallout>
          OpenStudio is a young project and its builds are unsigned today. If your studio needs signed installers,
          notation, or import of proprietary session formats, check the FAQ before you commit a session to it.
        </HonestCallout>
      </div>

      {/* Sources */}
      <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 30 }}>
        <div className="sp-mono" style={{ lineHeight: 1.8 }}>
          Sources:{" "}
          {SOURCES.map(([label, href], index) => (
            <Fragment key={href}>
              {index > 0 ? " · " : null}
              <a className="sp-text-link" href={href} rel="noreferrer" target="_blank">
                {label}
              </a>
            </Fragment>
          ))}
          . OpenStudio feature access is based on the current source tree.
        </div>
      </div>

      {/* CTA */}
      <div className="sp-container" data-sp-reveal="stagger" style={{ paddingTop: 44, paddingBottom: 62, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <DownloadCta />
        <Cta icon={Scale} to={V2_PATHS.features} variant="outline">
          Every feature
        </Cta>
      </div>
    </>
  );
};

export default V2ComparePage;
