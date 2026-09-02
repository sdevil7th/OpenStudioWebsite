import { Clock, Download, Tag } from "lucide-react";
import { Fragment } from "react";
import PageSeo from "@/components/PageSeo";
import { DOWNLOAD_PATHS } from "@/constants/site";
import { V2_PATHS, VERSION_LABEL } from "../content";
import { Cta, Eyebrow, WarnCallout } from "../primitives";
import { useSpReveal } from "../useSpReveal";

type ChangeKind = "Added" | "Changed" | "Faster" | "Fixed";

const KIND_COLORS: Record<ChangeKind, string> = {
  Added: "var(--sp-good)",
  Changed: "var(--sp-mono-muted)",
  Faster: "var(--sp-accent)",
  Fixed: "var(--sp-bad)",
};

// Sample changelog copy — structure and tone only. Real entries come from the
// repo's release notes; versions, dates, and sizes are placeholders.
const RELEASES: {
  version: string;
  current?: boolean;
  meta: string;
  changes: [ChangeKind, string][];
}[] = [
  {
    version: VERSION_LABEL,
    current: true,
    meta: "00 Aug 2026 · 00 MB",
    changes: [
      ["Added", "NAM Rack preset library with A/B compare"],
      ["Added", "TONE3000 capture browser inside the rack"],
      ["Faster", "ACE-Step generation roughly 3× faster after decode-path changes"],
      ["Fixed", "Piano roll regressions caught by the new editor harness"],
    ],
  },
  {
    version: VERSION_LABEL,
    meta: "00 Jul 2026 · 00 MB",
    changes: [
      ["Added", "NAM Rack: cabinet IR stage and graphic EQ"],
      ["Changed", "Plugin scan now incremental"],
      ["Fixed", "Mixer snapshot recall on detached windows"],
    ],
  },
  {
    version: VERSION_LABEL,
    meta: "00 Jun 2026 · 00 MB",
    changes: [
      ["Added", "BS Roformer six-stem separation"],
      ["Added", "AI Runtime guided install"],
      ["Fixed", "ALSA device enumeration on Linux"],
    ],
  },
];

const ENDPOINTS: [string, string][] = [
  [DOWNLOAD_PATHS.releaseMetadataLatest, "Current version, size, and per-platform artifact URLs"],
  ["/download/{os}/latest", "Stable redirect to the newest artifact for an OS"],
  [DOWNLOAD_PATHS.macosStableAppcast, "Sparkle-style appcast consumed by shipped macOS builds"],
  [DOWNLOAD_PATHS.windowsStableAppcast, "Appcast consumed by shipped Windows builds"],
];

const CurrentBadge = () => (
  <span
    style={{
      font: "500 9px/1 'JetBrains Mono', monospace",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#fff",
      background: "var(--sp-cta)",
      padding: "6px 8px",
      borderRadius: 4,
    }}
  >
    current
  </span>
);

const V2ReleasesPage = () => {
  useSpReveal();

  return (
  <>
    <PageSeo
      description="Every release, what changed, and the public release metadata endpoints."
      path={V2_PATHS.releases}
      robots="noindex"
      title="Releases & Changelog | OpenStudio"
    />

    <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
      <Eyebrow icon={Tag}>Changelog · Release metadata</Eyebrow>
      <h1 className="sp-h1">Releases.</h1>
      <p className="sp-lede" style={{ maxWidth: 620 }}>
        Every release, what changed, and the public metadata endpoints the app reads for update checks.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Cta icon={Download} to={V2_PATHS.download}>
          Download the current build
        </Cta>
        <Cta href={DOWNLOAD_PATHS.macosStableAppcast} icon={Clock} variant="outline">
          Subscribe to the appcast
        </Cta>
      </div>
      <p
        className="sp-mono"
        style={{
          margin: "30px 0 0",
          lineHeight: 1.6,
          borderLeft: "2px solid rgba(80, 0, 255, 0.35)",
          paddingLeft: 12,
        }}
      >
        Sample changelog copy — structure and tone only. Real entries come from the repo&rsquo;s release notes;
        versions, dates, and sizes are placeholders.
      </p>
    </div>

    <div className="sp-container" style={{ paddingTop: 26 }}>
      <div className="sp-releases-layout">
        <aside data-sp-reveal="rise" style={{ borderRight: "1px solid var(--sp-hairline)", paddingRight: 22 }}>
          <div className="sp-kicker">Versions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RELEASES.map((release, index) => (
              <div
                key={index}
                className="sp-mono"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  fontSize: 12,
                  color: release.current ? "var(--sp-accent)" : undefined,
                }}
              >
                <span>{release.version}</span>
                {release.current ? <CurrentBadge /> : null}
              </div>
            ))}
          </div>
        </aside>
        <div style={{ paddingLeft: 30, display: "flex", flexDirection: "column", gap: 26 }}>
          {RELEASES.map((release, index) => (
            <div key={index} className="sp-card" data-sp-reveal="rise" style={{ padding: "26px 28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: "1px solid var(--sp-hairline)",
                }}
              >
                <span style={{ font: "700 24px/1 'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>
                  {release.version}
                </span>
                {release.current ? <CurrentBadge /> : null}
                <span className="sp-mono" style={{ marginLeft: "auto" }}>
                  {release.meta}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {release.changes.map(([kind, text], changeIndex) => (
                  <div key={changeIndex} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span
                      style={{
                        minWidth: 62,
                        font: "500 9.5px/1.6 'JetBrains Mono', monospace",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: KIND_COLORS[kind],
                      }}
                    >
                      {kind}
                    </span>
                    <span style={{ font: "400 13.5px/1.55 'Space Grotesk', sans-serif", color: "var(--sp-body)" }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 44 }}>
      <div className="sp-kicker">Release metadata endpoints</div>
      <div className="sp-card sp-card--tight sp-scroll-x" style={{ overflow: "hidden" }}>
        {ENDPOINTS.map(([endpoint, description], index) => (
          <Fragment key={endpoint}>
            <div
              className="sp-endpoint-row"
              style={{
                display: "grid",
                gridTemplateColumns: "250px 1fr",
                gap: 20,
                padding: "14px 18px",
                borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined,
              }}
            >
              <code style={{ font: "500 12.5px/1.5 'JetBrains Mono', monospace", color: "var(--sp-accent)" }}>
                {endpoint}
              </code>
              <span style={{ font: "400 13px/1.5 'Space Grotesk', sans-serif", color: "var(--sp-body)" }}>
                {description}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>

    <div className="sp-container" data-sp-reveal="rise" style={{ padding: "26px 34px 62px" }}>
      <WarnCallout label="A public contract">
        These endpoints and redirects are consumed by shipped app builds for update checks. Nothing in the
        redesign changes them.
      </WarnCallout>
    </div>
  </>
  );
};

export default V2ReleasesPage;
