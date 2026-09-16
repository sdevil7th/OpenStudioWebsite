import { Book, Clock, Cpu, Download, Rocket, type LucideProps } from "lucide-react";
import { Fragment, type ComponentType, type ReactNode } from "react";
import PageSeo from "@/components/PageSeo";
import { downloadUpgradeNote, systemRequirementMatrix } from "@/data/downloads";
import { REPO } from "@/data/siteContent";
import { SITE_PATHS, docPath } from "@/constants/routes";
import { abbreviateDigest, formatBytes, formatLongDate } from "@/lib/format";
import { ArrowLink, Cta, DownloadCta, Eyebrow, GradIcon, WarnCallout } from "@/components/ui/primitives";
import { orderPlatforms, usePlatform, type PlatformId } from "@/hooks/usePlatform";
import { useReleaseInfo, type PlatformArtifact } from "@/hooks/useReleaseInfo";
import { useSpReveal } from "@/hooks/useSpReveal";

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
        Run <code className="sp-code text-[12px]">chmod +x OpenStudio-*.AppImage</code>.
      </>,
      "Launch it, and select JACK or ALSA in audio settings.",
    ],
  },
};

const Spec = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="sp-mono flex justify-between gap-[12px]">
    <span>{label}</span>
    <span className="text-[var(--sp-ink)] text-right [overflow-wrap:anywhere]">{children}</span>
  </div>
);

const DownloadPage = () => {
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
        path={SITE_PATHS.download}
        title="Download OpenStudio: Free DAW for Windows, macOS & Linux"
      />

      {/* Hero */}
      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <h1 className="sp-h1">Download OpenStudio.</h1>
        <p className="sp-lede max-w-[640px]">
          Free, open source, AGPLv3.
          {release ? (
            <>
              {" "}
              Version <code className="sp-code text-[15px] font-[600] text-[var(--sp-accent)]">{release.version}</code>
              {released ? `, released ${released}.` : "."}
            </>
          ) : null}
        </p>
        <div className="flex items-center gap-[16px] flex-wrap mb-[12px]">
          {detected ? (
            <DownloadCta direct withSize />
          ) : (
            <Cta href={artifactFor(primary.id)?.directUrl ?? primary.href} icon={Download}>
              Download for {primary.label}
            </Cta>
          )}
          {others.map((entry) => (
            <Cta
              key={entry.id}
              href={artifactFor(entry.id)?.directUrl ?? entry.href}
              icon={entry.icon}
              variant="outline"
            >
              {entry.label}
            </Cta>
          ))}
        </div>
        <div className="sp-mono">
          {detected ? `Detected ${primary.label}. ` : "Pick your platform. "}
          Every button downloads the release shown above from GitHub · SHA-256 checksums below · release metadata at{" "}
          <a href="/releases/latest.json">/releases/latest.json</a>
        </div>
      </div>

      {/* Platform cards, detected OS first */}
      <div className="sp-container pt-[40px]">
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
                className={`p-[24px_24px_26px] ${`sp-card${isDetected ? " sp-platform-card--detected" : ""}`}`}
                id={entry.id}
              >
                <div className="flex items-center gap-[10px] [font:700_20px/1.2_'Space_Grotesk',_sans-serif] tracking-[-0.02em] mb-[16px]">
                  <GradIcon icon={entry.icon} size={21} />
                  {entry.label}
                  {isDetected ? <span className="sp-platform-card__badge">Your OS</span> : null}
                </div>
                <div className="flex flex-col gap-[7px] pb-[16px] [border-bottom:1px_solid_var(--sp-hairline)] mb-[16px]">
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
                <ol className="m-[0_0_18px] pl-[18px] flex flex-col gap-[8px] [font:400_13px/1.55_'Space_Grotesk',_sans-serif] text-[var(--sp-body)]">
                  {copy.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                <Cta
                  href={artifactFor(entry.id)?.directUrl ?? entry.href}
                  icon={Download}
                  variant={isDetected ? "primary" : "outline"}
                >
                  Download for {entry.label}
                </Cta>
              </div>
            );
          })}
        </div>
      </div>

      {/* Before you install */}
      <div className="sp-container pt-[38px]" data-sp-reveal="rise" id="before-you-install">
        <WarnCallout label="Before you install">
          Builds are unsigned. On Windows, SmartScreen may warn on first run. On macOS, right-click OpenStudio and
          choose <strong>Open</strong>, then allow it in System Settings → Privacy &amp; Security if prompted. The Linux
          AppImage needs <code className="sp-code">chmod +x</code>. Code signing costs money the project currently
          spends elsewhere. If you want certainty, verify the checksum above.
          <span className="block mt-3">{downloadUpgradeNote}</span>
        </WarnCallout>
      </div>

      {/* System requirements */}
      <div className="sp-container pt-[46px]" data-sp-reveal="rise" id="requirements">
        <div className="sp-kicker">System requirements</div>
        <div className="sp-card sp-card--tight sp-scroll-x">
          <div className="grid [grid-template-columns:1.1fr_1fr_1fr] min-w-[640px]">
            <div className="sp-matrix__sticky p-[13px_18px] [border-right:1px_solid_var(--sp-hairline)]" />
            {["Minimum", "Recommended"].map((heading, index) => (
              <div
                className="p-[13px_18px] [font:500_10px/1.4_'JetBrains_Mono',_monospace] tracking-[0.14em] uppercase text-[var(--sp-mono-muted)]"
                key={heading}
                style={{ borderRight: index === 0 ? "1px solid var(--sp-hairline)" : undefined }}
              >
                {heading}
              </div>
            ))}
            {systemRequirementMatrix.map((row) => (
              <Fragment key={row.component}>
                <div className="sp-matrix__sticky p-[13px_18px] [border-top:1px_solid_var(--sp-hairline)] [border-right:1px_solid_var(--sp-hairline)] [font:600_13px/1.4_'Space_Grotesk',_sans-serif]">
                  {row.component}
                </div>
                <div className="p-[13px_18px] [border-top:1px_solid_var(--sp-hairline)] [border-right:1px_solid_var(--sp-hairline)] [font:400_13px/1.5_'Space_Grotesk',_sans-serif] text-[var(--sp-body)]">
                  {row.minimum}
                </div>
                <div className="p-[13px_18px] [border-top:1px_solid_var(--sp-hairline)] [font:400_13px/1.5_'Space_Grotesk',_sans-serif] text-[var(--sp-body)]">
                  {row.recommended}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <p className="sp-mono m-[12px_0_0] leading-[1.6]">
          The optional AI Tools have their own hardware notes:{" "}
          <ArrowLink to={`${docPath("ai-runtime-setup")}#hardware`}>what the runtime needs</ArrowLink>
        </p>
      </div>

      {/* AI Runtime + Updates */}
      <div className="sp-container pt-[34px]">
        <div className="sp-grid-2 gap-[18px]" data-sp-reveal="stagger">
          <div className="sp-card p-[26px_28px]">
            <Eyebrow icon={Cpu}>Optional · Installed from inside the app</Eyebrow>
            <h2 className="sp-h2 text-[26px]">AI Tools</h2>
            <p className="sp-body max-w-[420px] mb-[14px]">
              Stem separation and generation need the AI Tools runtime, installed once from the AI Tools button inside
              OpenStudio. It is never bundled into the base installer.
            </p>
            <ArrowLink to={docPath("ai-runtime-setup")}>AI Tools setup</ArrowLink>
          </div>
          <div className="sp-card p-[26px_28px]">
            <Eyebrow icon={Clock}>Updates</Eyebrow>
            <h2 className="sp-h2 text-[26px]">How update checks work</h2>
            <p className="sp-body max-w-[420px] mb-[14px]">
              The app reads public release metadata to tell you a newer build exists, and you can check manually from
              Help → Check for Updates. It only reads metadata to discover new versions. It does not sign, download, or
              apply patches silently in the background.
            </p>
            <ArrowLink to={`${SITE_PATHS.releases}#endpoints`}>Release endpoints</ArrowLink>
          </div>
        </div>
      </div>

      {/* Next step */}
      <div
        className="sp-container mt-[52px] pt-[44px] pb-[62px] [border-top:1px_solid_var(--sp-hairline)] flex items-center gap-[16px] flex-wrap"
        data-sp-reveal="stagger"
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

export default DownloadPage;
