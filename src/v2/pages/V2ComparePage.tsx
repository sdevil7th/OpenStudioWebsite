import { Check, Scale, TriangleAlert, X } from "lucide-react";
import { Fragment, type CSSProperties } from "react";
import PageSeo from "@/components/PageSeo";
import { V2_PATHS } from "../content";
import { Cta, Eyebrow } from "../primitives";

type Verdict = "good" | "bad" | "warn" | "plain";

interface Cell {
  text: string;
  verdict?: Verdict;
}

const plain = (text: string): Cell => ({ text, verdict: "plain" });
const good = (text: string): Cell => ({ text, verdict: "good" });
const bad = (text: string): Cell => ({ text, verdict: "bad" });
const warn = (text: string): Cell => ({ text, verdict: "warn" });

const COLUMNS = ["OpenStudio", "Reaper", "Ardour", "LMMS"];

const ROWS: { label: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { label: "Price", cells: [plain("Free"), plain("$60 personal"), plain("Free (paid builds)"), plain("Free")] },
  { label: "License", cells: [plain("AGPLv3"), plain("Proprietary"), plain("GPLv2"), plain("GPLv2")] },
  {
    label: "Platforms",
    cells: [
      plain("Win · macOS · Linux"),
      plain("Win · macOS · Linux"),
      plain("Win · macOS · Linux"),
      plain("Win · macOS · Linux"),
    ],
  },
  {
    label: "Plugin formats",
    cells: [
      plain("VST3 · CLAP · LV2 · ARA2"),
      plain("VST3 · CLAP · LV2"),
      plain("VST3 · LV2"),
      plain("VST3 · LV2"),
    ],
  },
  {
    label: "Built-in amp sim",
    cells: [good("Full NAM Rack"), bad("None"), bad("None"), bad("None")],
  },
  {
    label: "Stem separation",
    cells: [good("Local, 6 stems"), bad("Via plugin"), bad("None"), bad("None")],
  },
  {
    label: "Pitch editing",
    cells: [good("Graphical, built in"), warn("Via plugin"), warn("Via plugin"), bad("None")],
  },
  { label: "Scripting", cells: [plain("Lua"), plain("Lua · EEL · Python"), plain("Lua"), plain("Python")] },
  {
    label: "Signed installers",
    cells: [bad("Unsigned"), good("Signed"), good("Signed"), good("Signed")],
  },
  {
    label: "Maturity",
    cells: [warn("Young project"), good("20+ years"), good("20+ years"), good("Mature")],
  },
];

const VERDICT_COLOR: Record<Verdict, string> = {
  good: "var(--sp-good)",
  bad: "var(--sp-bad)",
  warn: "var(--sp-warn)",
  plain: "var(--sp-body)",
};

const VerdictIcon = ({ verdict }: { verdict?: Verdict }) => {
  if (verdict === "good") return <Check aria-hidden="true" size={14} strokeWidth={2.2} />;
  if (verdict === "bad") return <X aria-hidden="true" size={14} strokeWidth={2.2} />;
  if (verdict === "warn") return <TriangleAlert aria-hidden="true" size={13} strokeWidth={2} />;
  return null;
};

const NOT_FOR_YOU: { title: string; copy: string }[] = [
  {
    title: "It is a young project.",
    copy: "Reaper and Ardour have two decades of edge cases handled. We do not.",
  },
  {
    title: "Builds are unsigned.",
    copy: "If your studio policy or IT requires signed installers, this is a blocker today.",
  },
  {
    title: "No proprietary project import.",
    copy: "You can bring audio and MIDI, but not a .rpp or .als session.",
  },
  { title: "No notation editor.", copy: "If you write score, use something else." },
];

const RIGHT_CALL: { title: string; copy: string }[] = [
  { title: "You play guitar.", copy: "No other free DAW ships a NAM rack that renders with the mix." },
  {
    title: "You want local stem separation.",
    copy: "Six stems, offline, inside the project — no upload, no subscription.",
  },
  { title: "You need pitch editing without a plugin.", copy: "Graphical, polyphonic, on the take." },
  { title: "You want the source.", copy: "AGPLv3, developed in the open, patches welcome." },
];

const OPENSTUDIO_TINT = "linear-gradient(160deg, rgba(80,0,255,.07), rgba(0,177,143,.05))";

const ProsConsCard = ({
  entries,
  label,
  tone,
}: {
  entries: { title: string; copy: string }[];
  label: string;
  tone: "good" | "bad";
}) => (
  <div className="sp-card" style={{ padding: "28px 30px" }}>
    <div
      className="sp-eyebrow"
      style={{ color: tone === "good" ? "var(--sp-good)" : "var(--sp-warn)" }}
    >
      {tone === "good" ? (
        <Check aria-hidden="true" size={14} strokeWidth={1.8} />
      ) : (
        <TriangleAlert aria-hidden="true" size={14} strokeWidth={1.8} />
      )}
      {label}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {entries.map((entry) => (
        <div key={entry.title} style={{ display: "flex", gap: 10 }}>
          <span style={{ color: tone === "good" ? "var(--sp-good)" : "var(--sp-bad)", paddingTop: 2 }}>
            {tone === "good" ? (
              <Check aria-hidden="true" size={14} strokeWidth={2.2} />
            ) : (
              <X aria-hidden="true" size={14} strokeWidth={2.2} />
            )}
          </span>
          <div>
            <div style={{ font: "600 13.5px/1.4 'Space Grotesk', sans-serif", marginBottom: 3 }}>{entry.title}</div>
            <p className="sp-body" style={{ fontSize: 13, lineHeight: 1.55 }}>
              {entry.copy}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const cellStyle = (options: { header?: boolean; first?: boolean; withBorderRight?: boolean }): CSSProperties => ({
  padding: options.header ? "15px 16px" : "13px 16px",
  borderTop: options.header ? undefined : "1px solid var(--sp-hairline)",
  borderRight: options.withBorderRight ? "1px solid var(--sp-hairline)" : undefined,
});

const V2ComparePage = () => (
  <>
    <PageSeo
      description="An honest side-by-side, including where OpenStudio isn't the right choice."
      path={V2_PATHS.compare}
      robots="noindex"
      title="OpenStudio vs Reaper, Ardour & Other Free DAWs"
    />

    <div className="sp-container" style={{ paddingTop: 64 }}>
      <Eyebrow icon={Scale}>Including where we lose</Eyebrow>
      <h1 className="sp-h1">How OpenStudio compares.</h1>
      <p className="sp-lede" style={{ maxWidth: 680 }}>
        Straight answers. If another DAW fits your work better, we would rather you find that out here than after
        a week of frustration.
      </p>
    </div>

    {/* Comparison table */}
    <div className="sp-container" style={{ paddingTop: 38 }}>
      <div className="sp-card sp-card--tight sp-scroll-x">
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr repeat(4, 1fr)", minWidth: 880 }}>
          <div style={cellStyle({ header: true })} />
          {COLUMNS.map((column, index) => (
            <div
              key={column}
              style={{
                ...cellStyle({ header: true }),
                font: "700 14px/1.3 'Space Grotesk', sans-serif",
                color: index === 0 ? "var(--sp-accent)" : "var(--sp-ink)",
                background: index === 0 ? OPENSTUDIO_TINT : undefined,
              }}
            >
              {column}
            </div>
          ))}
          {ROWS.map((row) => (
            <Fragment key={row.label}>
              <div
                style={{
                  ...cellStyle({}),
                  font: "600 13px/1.4 'Space Grotesk', sans-serif",
                }}
              >
                {row.label}
              </div>
              {row.cells.map((cell, cellIndex) => (
                <div key={cellIndex} style={{ background: cellIndex === 0 ? OPENSTUDIO_TINT : undefined }}>
                  <div
                    style={{
                      ...cellStyle({}),
                      font: "400 13px/1.45 'Space Grotesk', sans-serif",
                      color: VERDICT_COLOR[cell.verdict ?? "plain"],
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <VerdictIcon verdict={cell.verdict === "plain" ? undefined : cell.verdict} />
                    {cell.text}
                  </div>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>

    {/* When not / when yes */}
    <div className="sp-container" style={{ paddingTop: 44 }}>
      <div className="sp-grid-2">
        <ProsConsCard entries={NOT_FOR_YOU} label="When not to use OpenStudio" tone="bad" />
        <ProsConsCard entries={RIGHT_CALL} label="When it is the right call" tone="good" />
      </div>
    </div>

    {/* Child page chips */}
    <div className="sp-container" style={{ padding: "44px 34px 62px", display: "flex", gap: 14, flexWrap: "wrap" }}>
      {["vs Reaper", "vs Ardour", "vs LMMS", "Free DAW roundup"].map((label) => (
        <Cta key={label} icon={Scale} to={V2_PATHS.compare} variant="outline">
          {label}
        </Cta>
      ))}
    </div>
  </>
);

export default V2ComparePage;
