import { Book, Clock, Cpu, Download, Rocket, type LucideProps } from "lucide-react";
import { Fragment, type ComponentType, type ReactNode } from "react";
import PageSeo from "@/components/PageSeo";
import { systemRequirementMatrix } from "@/data/downloads";
import { REPO, V2_PATHS, docPath } from "../content";
import { abbreviateDigest, formatBytes, formatLongDate } from "../format";
import { ArrowLink, Cta, DownloadCta, Eyebrow, GradIcon, WarnCallout } from "../primitives";
import { orderPlatforms, usePlatform, type PlatformId } from "../usePlatform";
import { useReleaseInfo, type PlatformArtifact } from "../useReleaseInfo";
import { useSpReveal } from "../useSpReveal";

interface PlatformCopy {
  icon: ComponentType<LucideProps>;
  requires: string;
  steps: ReactNode[];
}

const PLATFORM_COPY: Record<PlatformId, Omit<PlatformCopy, "icon">> = {
  macos: {
    requires: "macOS 12 or later · Apple silicon & Intel",
    steps: [
      "Open the .dmg and drag OpenStudio to Applications.",
      <>
        Right-click the app and choose <strong>Open</strong> (builds are unsigned).
      </>,
      "Allow it in System Settings → Privacy & Security if prompted.",
    ],
  },
  windows: {
    requires: "Windows 10 and 11 · x64",
    steps: [
      "Run the installer. It sets up the WebView2 and VC++ prerequisites.",
      <>
        If SmartScreen warns, choose <strong>More info</strong> → <strong>Run anyway</strong>.
      </>,
      "Launch OpenStudio and pick your audio device.",
    ],
  },
  linux: {
    requires: "AppImage · x86-64 · tested on Ubuntu 22.04+",
    steps: [
      "Download the AppImage.",
      <>
        Run <code className="sp-code" style={{ fontSize: 12 }}>chmod +x OpenStudio-*.AppImage</code>.
      </>,
      "Launch it, and select JACK or ALSA in audio settings.",
    ],
  },
};

const Spec = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="sp-mono" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
    <span>{label}</span>
    <span style={{ color: "var(--sp-ink)", textAlign: "right", overflowWrap: "anywhere" }}>{children}</span>
  </div>
);

const V2DownloadPage = () => {
  const detected = usePlatform();
  const release = useReleaseInfo();

  useSpReveal();

  const platforms = orderPlatforms(detected);
  const [primary, ...others] = platforms;
  const released = formatLongDate(release?.publishedAt);
  const artifactFor = (id: PlatformId): PlatformArtifact | undefined => release?.platforms[id];
  const checksumsUrl = release?.notesUrl ?? REPO.releases;

  return (
    <>
      <PageSeo
        description="Download the current OpenStudio build free for Windows, macOS, or Linux. Installers, checksums, system requirements, and honest notes on unsigned builds."
        path={V2_PATHS.download}
        robots="noindex"
        title="Download OpenStudio — Free DAW for Windows, macOS & Linux"
      />

      {/* Hero */}
      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <h1 className="sp-h1">Download OpenStudio.</h1>
        <p className="sp-lede" style={{ maxWidth: 640 }}>
          Free, open source, AGPLv3.
          {release ? (
            <>
              {" "}
              Version{" "}
              <code className="sp-code" style={{ fontSize: 15, fontWeight: 600, color: "var(--sp-accent)" }}>
                {release.version}
              </code>
              {released ? `, released ${released}.` : "."}
            </>
          ) : null}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
          {detected ? (
            <DownloadCta direct withSize />
          ) : (
            <Cta href={primary.href} icon={Download}>
              Download for {primary.label}
            </Cta>
          )}
          {others.map((entry) => (
            <Cta key={entry.id} href={entry.href} icon={entry.icon} variant="outline">
              {entry.label}
            </Cta>
          ))}
        </div>
        <div className="sp-mono">
          {detected ? `Detected ${primary.label}. ` : "Pick your platform. "}
          Every button resolves to the newest build through a stable redirect · SHA-256 checksums below · release
          metadata at <a href="/releases/latest.json">/releases/latest.json</a>
        </div>
      </div>

      {/* Platform cards, detected OS first */}
      <div className="sp-container" style={{ paddingTop: 40 }}>
        <div className="sp-grid-3" data-sp-reveal="stagger">
          {platforms.map((entry) => {
            const copy = PLATFORM_COPY[entry.id];
            const artifact = artifactFor(entry.id);
            const isDetected = entry.id === detected;
            const size = formatBytes(artifact?.size);
            const digest = abbreviateDigest(artifact?.sha256);

            return (
              <div
                key={entry.id}
                className={`sp-card${isDetected ? " sp-platform-card--detected" : ""}`}
                id={entry.id}
                style={{ padding: "24px 24px 26px" }}
              >
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
                  <GradIcon icon={entry.icon} size={21} />
                  {entry.label}
                  {isDetected ? <span className="sp-platform-card__badge">Your OS</span> : null}
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
                  <Spec label="Artifact">{artifact?.fileName ?? entry.artifactType}</Spec>
                  <Spec label="Size">{size ?? "—"}</Spec>
                  <Spec label="Requires">{copy.requires}</Spec>
                  <Spec label="SHA-256">
                    {digest ? (
                      <span title={artifact?.sha256 ?? undefined}>{digest}</span>
                    ) : (
                      <a className="sp-text-link" href={checksumsUrl} rel="noreferrer" target="_blank">
                        checksums.txt on the release
                      </a>
                    )}
                  </Spec>
                </div>
                <ol
                  style={{
                    margin: "0 0 18px",
                    paddingLeft: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    font: "400 13px/1.55 'Space Grotesk', sans-serif",
                    color: "var(--sp-body)",
                  }}
                >
                  {copy.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                <Cta href={entry.href} icon={Download} variant={isDetected ? "primary" : "outline"}>
                  Download for {entry.label}
                </Cta>
              </div>
            );
          })}
        </div>
      </div>

      {/* Before you install */}
      <div className="sp-container" data-sp-reveal="rise" id="before-you-install" style={{ paddingTop: 38 }}>
        <WarnCallout label="Before you install">
          Builds are unsigned. On Windows, SmartScreen may warn on first run. On macOS, right-click OpenStudio and
          choose <strong>Open</strong>, then allow it in System Settings → Privacy &amp; Security if prompted. The
          Linux AppImage needs <code className="sp-code">chmod +x</code>. Code signing costs money the project
          currently spends elsewhere — verify the checksum above if you want certainty.
        </WarnCallout>
      </div>

      {/* System requirements */}
      <div className="sp-container" data-sp-reveal="rise" id="requirements" style={{ paddingTop: 46 }}>
        <div className="sp-kicker">System requirements</div>
        <div className="sp-card sp-card--tight sp-scroll-x">
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr", minWidth: 640 }}>
            <div className="sp-matrix__sticky" style={{ padding: "13px 18px", borderRight: "1px solid var(--sp-hairline)" }} />
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
                  className="sp-matrix__sticky"
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
          The optional AI Tools have their own hardware notes —{" "}
          <ArrowLink to={`${docPath("ai-runtime-setup")}#hardware`}>what the runtime needs</ArrowLink>
        </p>
      </div>

      {/* AI Runtime + Updates */}
      <div className="sp-container" style={{ paddingTop: 34 }}>
        <div className="sp-grid-2" data-sp-reveal="stagger" style={{ gap: 18 }}>
          <div className="sp-card" style={{ padding: "26px 28px" }}>
            <Eyebrow icon={Cpu}>Optional · Installed from inside the app</Eyebrow>
            <h2 className="sp-h2" style={{ fontSize: 26 }}>
              AI Tools
            </h2>
            <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
              Stem separation and generation need the AI Tools runtime, installed once from the AI Tools button
              inside OpenStudio. It is never bundled into the base installer.
            </p>
            <ArrowLink to={docPath("ai-runtime-setup")}>AI Tools setup</ArrowLink>
          </div>
          <div className="sp-card" style={{ padding: "26px 28px" }}>
            <Eyebrow icon={Clock}>Updates</Eyebrow>
            <h2 className="sp-h2" style={{ fontSize: 26 }}>
              How update checks work
            </h2>
            <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
              The app reads public release metadata to tell you a newer build exists, and you can check manually from
              Help → Check for Updates. That is metadata-driven update discovery — not signed, silent background
              patching.
            </p>
            <ArrowLink to={`${V2_PATHS.releases}#endpoints`}>Release endpoints</ArrowLink>
          </div>
        </div>
      </div>

      {/* Next step */}
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
        <Cta icon={Book} to={docPath("getting-started")}>
          Getting started guide
        </Cta>
        <Cta icon={Rocket} to={docPath("first-session")} variant="outline">
          Your first session
        </Cta>
      </div>
    </>
  );
};

export default V2DownloadPage;
