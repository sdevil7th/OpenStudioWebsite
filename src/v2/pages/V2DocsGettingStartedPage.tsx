import { ArrowRight, GitFork } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { SHOTS, V2_PATHS, VERSION_LABEL } from "../content";
import { Frame, Kicker, WarnCallout } from "../primitives";
import { useSpReveal } from "../useSpReveal";

const SIDEBAR_DOCS = [
  "Getting Started",
  "Your First Session",
  "Audio Setup",
  "Plugins & Scanning",
  "NAM Rack Setup",
  "AI Runtime Setup",
  "Pitch Editing",
  "Lua Scripting",
  "Keyboard Shortcuts",
  "Troubleshooting",
  "FAQ",
];

const ON_THIS_PAGE = [
  "Download and install",
  "First launch",
  "Audio device and buffer size",
  "Scan your plugins",
  "Create a project and arm a track",
  "Next: your first session",
];

const StepHeading = ({ number, children }: { number: string; children: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
    <span
      style={{
        font: "600 12px/1 'JetBrains Mono', monospace",
        color: "#fff",
        background: "var(--sp-cta)",
        borderRadius: 4,
        padding: "6px 9px",
      }}
    >
      {number}
    </span>
    <h2 style={{ font: "700 24px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.025em", margin: 0 }}>
      {children}
    </h2>
  </div>
);

const StepBody = ({ children }: { children: ReactNode }) => (
  <p className="sp-body" style={{ marginBottom: 14 }}>
    {children}
  </p>
);

const V2DocsGettingStartedPage = () => {
  useSpReveal();

  return (
  <>
    <PageSeo
      description="Install OpenStudio, set up your audio device, scan plugins, and create your first project."
      path={V2_PATHS.docsGettingStarted}
      robots="noindex"
      title="Getting Started with OpenStudio — Install & First Launch"
    />

    <div className="sp-container" style={{ paddingLeft: 0, paddingRight: 0, maxWidth: 1240 }}>
      <div className="sp-docs-layout" style={{ borderBottom: "1px solid var(--sp-hairline)" }}>
        <aside className="sp-docs-sidebar" data-sp-reveal="rise">
          <Kicker>Documentation</Kicker>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 26 }}>
            {SIDEBAR_DOCS.map((doc, index) => (
              <Link
                key={doc}
                style={{
                  font: `${index === 0 ? "600" : "400"} 13px/1.4 'Space Grotesk', sans-serif`,
                  color: index === 0 ? "var(--sp-accent)" : "var(--sp-body)",
                }}
                to={index === 0 ? V2_PATHS.docsGettingStarted : V2_PATHS.docs}
              >
                {doc}
              </Link>
            ))}
          </div>
          <Kicker>On this page</Kicker>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              borderLeft: "1px solid var(--sp-hairline)",
              paddingLeft: 14,
            }}
          >
            {ON_THIS_PAGE.map((entry, index) => (
              <span
                key={entry}
                style={{
                  font: "400 12.5px/1.4 'Space Grotesk', sans-serif",
                  color: index === 0 ? "var(--sp-accent)" : "var(--sp-mono-muted)",
                }}
              >
                {entry}
              </span>
            ))}
          </div>
        </aside>
        <article style={{ padding: "44px 44px 52px", maxWidth: 760 }}>
          <header data-sp-reveal="hero">
          <Kicker>Docs · Start here</Kicker>
          <h1 style={{ font: "700 42px/1.08 'Space Grotesk', sans-serif", letterSpacing: "-0.035em", margin: "0 0 14px" }}>
            Getting started
          </h1>
          <p className="sp-lede" style={{ maxWidth: 620 }}>
            Install OpenStudio, set up your audio device, scan your plugins, and create your first project. About
            ten minutes.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              padding: "14px 0 22px",
              borderTop: "1px solid var(--sp-hairline)",
              borderBottom: "1px solid var(--sp-hairline)",
              marginBottom: 32,
              alignItems: "center",
            }}
          >
            <div className="sp-mono">Last updated 00 Aug 2026</div>
            <span style={{ color: "var(--sp-hairline)" }}>·</span>
            <div className="sp-mono">Applies to {VERSION_LABEL}</div>
            <span style={{ color: "var(--sp-hairline)" }}>·</span>
            <a
              className="sp-mono"
              href="https://github.com/sdevil7th/OpenStudio"
              rel="noreferrer"
              style={{ color: "var(--sp-accent)", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <GitFork aria-hidden="true" size={12} strokeWidth={1.8} />
              Edit on GitHub
            </a>
          </div>
          </header>

          <section data-sp-reveal="rise" style={{ marginBottom: 34 }}>
            <StepHeading number="01">Download and install</StepHeading>
            <StepBody>
              Grab the build for your platform from the download page. Builds are currently unsigned, so your OS
              will likely warn you on first launch — that is expected, and the steps below are the full
              workaround.
            </StepBody>
            <WarnCallout label="Unsigned builds">
              On <strong>macOS</strong>, right-click the app and choose <strong>Open</strong>, then allow it in
              System Settings → Privacy &amp; Security. On <strong>Windows</strong>, choose{" "}
              <strong>More info</strong> → <strong>Run anyway</strong> in SmartScreen. On <strong>Linux</strong>,{" "}
              <code className="sp-code">chmod +x</code> the AppImage.
            </WarnCallout>
          </section>

          <section data-sp-reveal="rise" style={{ marginBottom: 34 }}>
            <StepHeading number="02">First launch</StepHeading>
            <StepBody>
              OpenStudio opens on an empty arrangement. The timeline is the centre, the mixer docks below or
              detaches to a second screen, and the browser sits on the left.
            </StepBody>
            <div style={{ margin: "16px 0 0" }}>
              <Frame alt="The default OpenStudio layout on first launch" src={SHOTS.arrangementOverviewWide} />
              <p className="sp-mono" style={{ fontSize: 12, lineHeight: 1.6, margin: "10px 0 0" }}>
                The default layout: browser left, arrangement centre, mixer docked below.
              </p>
            </div>
          </section>

          <section data-sp-reveal="rise" style={{ marginBottom: 34 }}>
            <StepHeading number="03">Audio device and buffer size</StepHeading>
            <StepBody>
              Open <strong>Settings → Audio</strong> and pick your interface. Start at a 256-sample buffer, then
              drop to 128 once you know the machine keeps up. Lower buffers mean lower latency and more CPU.
            </StepBody>
            <div className="sp-card sp-card--tight" style={{ overflow: "hidden", marginTop: 14 }}>
              {[
                ["macOS", "CoreAudio · your interface or Built-in Output"],
                ["Windows", "ASIO if your interface ships a driver, otherwise WASAPI"],
                ["Linux", "JACK for low latency, ALSA for simplicity"],
              ].map(([os, value], index) => (
                <div
                  key={os}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "12px 18px",
                    borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined,
                    font: "400 13px/1.5 'Space Grotesk', sans-serif",
                  }}
                >
                  <span style={{ minWidth: 78, fontWeight: 600 }}>{os}</span>
                  <span style={{ color: "var(--sp-body)" }}>{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section data-sp-reveal="rise" style={{ marginBottom: 34 }}>
            <StepHeading number="04">Scan your plugins</StepHeading>
            <StepBody>
              Point OpenStudio at your plugin folders in <strong>Settings → Plugins</strong> and run a scan.
              VST3, CLAP, and LV2 are supported.
            </StepBody>
            <div style={{ background: "var(--sp-frame)", borderRadius: 10, padding: "16px 18px", marginTop: 14 }}>
              <div style={{ font: "400 12px/1.75 'JetBrains Mono', monospace", color: "#cfd8e6" }}>
                <span style={{ color: "var(--sp-dark-muted)" }}>~/Library/Audio/Plug-Ins/VST3</span>
                <br />
                <span style={{ color: "var(--sp-dark-muted)" }}>C:\Program Files\Common Files\VST3</span>
                <br />
                <span style={{ color: "var(--sp-dark-muted)" }}>/usr/lib/lv2</span>
              </div>
            </div>
            <p className="sp-body" style={{ fontSize: 13, lineHeight: 1.6, margin: "12px 0 0" }}>
              Nothing showing up? See{" "}
              <Link style={{ color: "var(--sp-accent)", borderBottom: "1px solid var(--sp-accent)" }} to={V2_PATHS.docs}>
                Plugins &amp; Scanning
              </Link>
              .
            </p>
          </section>

          <section data-sp-reveal="rise" style={{ marginBottom: 34 }}>
            <StepHeading number="05">Create a project and arm a track</StepHeading>
            <StepBody>
              New project, add an audio track, choose the input, and arm it. Input monitoring lets you hear the
              NAM Rack while you play — add it to the track FX chain before you record.
            </StepBody>
          </section>

          <div
            className="sp-card"
            data-sp-reveal="rise"
            style={{
              padding: "26px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <Kicker>Next</Kicker>
              <div style={{ font: "700 22px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 6 }}>
                Your first session
              </div>
              <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.6, maxWidth: 400 }}>
                Record a guitar part through the NAM Rack, add MIDI drums, mix it, and render it — one continuous
                path.
              </p>
            </div>
            <Link className="sp-btn" to={V2_PATHS.docs}>
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
              Open the guide
            </Link>
          </div>
        </article>
      </div>
    </div>
  </>
  );
};

export default V2DocsGettingStartedPage;
