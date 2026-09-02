import { Apple, Book, Clock, Cpu, Download, Monitor, Rocket, Terminal, type LucideProps } from "lucide-react";
import { Fragment, type ComponentType, type ReactNode } from "react";
import PageSeo from "@/components/PageSeo";
import { DOWNLOAD_PATHS } from "@/constants/site";
import { systemRequirementMatrix } from "@/data/downloads";
import { SIZE_LABEL, V2_PATHS } from "../content";
import { ArrowLink, Cta, Eyebrow, GradIcon, WarnCallout } from "../primitives";
import { useSpReveal } from "../useSpReveal";

interface PlatformCard {
  icon: ComponentType<LucideProps>;
  title: string;
  href: string;
  specs: [string, ReactNode][];
  steps: ReactNode[];
}

const PLATFORM_CARDS: PlatformCard[] = [
  {
    icon: Apple,
    title: "macOS",
    href: DOWNLOAD_PATHS.macosLatest,
    specs: [
      ["Artifact", "OpenStudio-0.x.x.dmg"],
      ["Size", SIZE_LABEL],
      ["Requires", "macOS 12 or later · Apple silicon & Intel"],
      ["SHA-256", "0000…0000"],
    ],
    steps: [
      "Open the .dmg and drag OpenStudio to Applications.",
      <>
        Right-click the app and choose <strong>Open</strong> (builds are unsigned).
      </>,
      "Allow it in System Settings → Privacy & Security if prompted.",
    ],
  },
  {
    icon: Monitor,
    title: "Windows",
    href: DOWNLOAD_PATHS.windowsLatest,
    specs: [
      ["Artifact", "OpenStudio-0.x.x-setup.exe"],
      ["Size", SIZE_LABEL],
      ["Requires", "Windows 10 and 11 · x64"],
      ["SHA-256", "0000…0000"],
    ],
    steps: [
      "Run the installer.",
      <>
        If SmartScreen warns, choose <strong>More info</strong> → <strong>Run anyway</strong>.
      </>,
      "Launch OpenStudio and pick your audio device.",
    ],
  },
  {
    icon: Terminal,
    title: "Linux",
    href: DOWNLOAD_PATHS.linuxLatest,
    specs: [
      ["Artifact", "OpenStudio-0.x.x.AppImage"],
      ["Size", SIZE_LABEL],
      ["Requires", "AppImage · tested on Ubuntu 22.04+"],
      ["SHA-256", "0000…0000"],
    ],
    steps: [
      "Download the AppImage.",
      <>
        Run <code className="sp-code" style={{ fontSize: 12 }}>chmod +x OpenStudio-*.AppImage</code>.
      </>,
      "Launch it, and select JACK or ALSA in audio settings.",
    ],
  },
];

const V2DownloadPage = () => {
  useSpReveal();

  return (
  <>
    <PageSeo
      description="Download the current build free. Installers, checksums, system requirements, and honest notes on unsigned builds."
      path={V2_PATHS.download}
      robots="noindex"
      title="Download OpenStudio — Free DAW for Windows, macOS & Linux"
    />

    {/* Hero */}
    <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
      <h1 className="sp-h1">Download OpenStudio.</h1>
      <p className="sp-lede" style={{ maxWidth: 640 }}>
        Free, open source, AGPLv3. Version{" "}
        <code className="sp-code" style={{ fontSize: 15, fontWeight: 600, color: "var(--sp-accent)" }}>
          0.x.x
        </code>
        , released 00 August 2026.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <Cta href={DOWNLOAD_PATHS.macosLatest} icon={Download}>
          Download for macOS · {SIZE_LABEL}
        </Cta>
        <Cta href={DOWNLOAD_PATHS.windowsLatest} icon={Monitor} variant="outline">
          Windows
        </Cta>
        <Cta href={DOWNLOAD_PATHS.linuxLatest} icon={Terminal} variant="outline">
          Linux
        </Cta>
      </div>
      <div className="sp-mono">SHA-256 checksums below · release metadata at /releases/latest.json</div>
    </div>

    {/* Platform cards */}
    <div className="sp-container" style={{ paddingTop: 40 }}>
      <div className="sp-grid-3" data-sp-reveal="stagger">
        {PLATFORM_CARDS.map((card) => (
          <div key={card.title} className="sp-card" style={{ padding: "24px 24px 26px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                font: "700 20px/1.2 'Space Grotesk', sans-serif",
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}
            >
              <GradIcon icon={card.icon} size={21} />
              {card.title}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 7,
                paddingBottom: 16,
                borderBottom: "1px solid var(--sp-hairline)",
                marginBottom: 16,
              }}
            >
              {card.specs.map(([label, value]) => (
                <div
                  key={label}
                  className="sp-mono"
                  style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
                >
                  <span>{label}</span>
                  <span style={{ color: "var(--sp-ink)", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
            <ol
              style={{
                margin: 0,
                paddingLeft: 18,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                font: "400 13px/1.55 'Space Grotesk', sans-serif",
                color: "var(--sp-body)",
              }}
            >
              {card.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>

    {/* Before you install */}
    <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 38 }}>
      <WarnCallout label="Before you install">
        Builds are unsigned. On Windows, SmartScreen may warn on first run. On macOS, right-click OpenStudio and
        choose <strong>Open</strong>, then allow it in System Settings → Privacy &amp; Security if prompted. The
        Linux AppImage needs <code className="sp-code">chmod +x</code>. Code signing costs money the project
        currently spends elsewhere — verify the checksum above if you want certainty.
      </WarnCallout>
    </div>

    {/* System requirements — lifted verbatim from systemRequirementMatrix */}
    <div className="sp-container" data-sp-reveal="rise" id="requirements" style={{ paddingTop: 46 }}>
      <div className="sp-kicker">System requirements</div>
      <div className="sp-card sp-card--tight sp-scroll-x" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", minWidth: 640 }}>
          <div style={{ padding: "13px 18px", borderRight: "1px solid var(--sp-hairline)" }} />
          {["Minimum", "Recommended"].map((heading, index) => (
            <div
              key={heading}
              style={{
                padding: "13px 18px",
                borderRight: index === 0 ? "1px solid var(--sp-hairline)" : undefined,
                font: "500 10px/1.4 'JetBrains Mono', monospace",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--sp-mono-muted)",
              }}
            >
              {heading}
            </div>
          ))}
          {systemRequirementMatrix.map((row) => (
            <Fragment key={row.component}>
              <div
                style={{
                  padding: "13px 18px",
                  borderTop: "1px solid var(--sp-hairline)",
                  borderRight: "1px solid var(--sp-hairline)",
                  font: "600 13px/1.4 'Space Grotesk', sans-serif",
                }}
              >
                {row.component}
              </div>
              <div
                style={{
                  padding: "13px 18px",
                  borderTop: "1px solid var(--sp-hairline)",
                  borderRight: "1px solid var(--sp-hairline)",
                  font: "400 13px/1.5 'Space Grotesk', sans-serif",
                  color: "var(--sp-body)",
                }}
              >
                {row.minimum}
              </div>
              <div
                style={{
                  padding: "13px 18px",
                  borderTop: "1px solid var(--sp-hairline)",
                  font: "400 13px/1.5 'Space Grotesk', sans-serif",
                  color: "var(--sp-body)",
                }}
              >
                {row.recommended}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
      <p className="sp-mono" style={{ margin: "12px 0 0", lineHeight: 1.6 }}>
        Matrix sourced from <code style={{ color: "var(--sp-accent)" }}>src/data/downloads.ts</code> →{" "}
        <code style={{ color: "var(--sp-accent)" }}>systemRequirementMatrix</code>.
      </p>
    </div>

    {/* AI Runtime + Updates */}
    <div className="sp-container" style={{ paddingTop: 34 }}>
      <div className="sp-grid-2" data-sp-reveal="stagger" style={{ gap: 18 }}>
        <div className="sp-card" style={{ padding: "26px 28px" }}>
          <Eyebrow icon={Cpu}>Optional · Separate download</Eyebrow>
          <h2 className="sp-h2" style={{ fontSize: 26 }}>
            AI Runtime
          </h2>
          <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
            Stem separation and generation need the AI Runtime, installed once from inside the app. It is never
            bundled into the base installer.
          </p>
          <ArrowLink to={V2_PATHS.ai}>AI Runtime setup</ArrowLink>
        </div>
        <div className="sp-card" style={{ padding: "26px 28px" }}>
          <Eyebrow icon={Clock}>Updates</Eyebrow>
          <h2 className="sp-h2" style={{ fontSize: 26 }}>
            How update checks work
          </h2>
          <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
            The app reads public release metadata to tell you a newer build exists. That is metadata-driven update
            discovery — not signed one-click background patching.
          </p>
          <ArrowLink to={V2_PATHS.releases}>Release endpoints</ArrowLink>
        </div>
      </div>
    </div>

    {/* Next step — never end a download page on a caveat */}
    <div
      className="sp-container"
      data-sp-reveal="stagger"
      style={{
        marginTop: 52,
        paddingTop: 44,
        paddingBottom: 62,
        borderTop: "1px solid var(--sp-hairline)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <Cta icon={Book} to={V2_PATHS.docsGettingStarted}>
        Getting started guide
      </Cta>
      <Cta icon={Rocket} to={V2_PATHS.docs} variant="outline">
        Your first session
      </Cta>
    </div>
  </>
  );
};

export default V2DownloadPage;
