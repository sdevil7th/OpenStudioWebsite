import { Clock, Download, ExternalLink, Tag } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import PageSeo from "@/components/PageSeo";
import { DOWNLOAD_PATHS } from "@/constants/site";
import type { GithubReleaseSummary } from "@/data/marketing";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { REPO, V2_PATHS } from "../content";
import { formatBytes, formatCount, formatDate, stripVersionPrefix } from "../format";
import { Cta, DownloadCta, Eyebrow, WarnCallout, renderInline } from "../primitives";
import { PLATFORMS, PLATFORM_ORDER } from "../usePlatform";
import { useSpReveal } from "../useSpReveal";

const isDesktopRelease = (release: GithubReleaseSummary) => /^v\d/.test(release.tagName);

// The release template ships with prompts the maintainer fills in; a release
// that still carries them should not show them to visitors.
const TEMPLATE_LINES = [
  /^summarize the biggest/i,
  /^list the important/i,
  /^document any other/i,
  /^call out any additional/i,
  /\{\{\s*version\s*\}\}/,
];

interface NotesSection {
  heading: string | null;
  items: string[];
  paragraphs: string[];
}

/** GitHub release bodies are simple markdown: `## Heading`, `- bullet`, paragraphs. */
const parseNotes = (body: string | undefined): NotesSection[] => {
  if (!body) {
    return [];
  }

  const sections: NotesSection[] = [];
  let current: NotesSection = { heading: null, items: [], paragraphs: [] };
  const push = () => {
    if (current.items.length > 0 || current.paragraphs.length > 0) {
      sections.push(current);
    }
  };

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("# ") || TEMPLATE_LINES.some((pattern) => pattern.test(line.replace(/^[-*]\s*/, "")))) {
      continue;
    }

    if (/^#{2,4}\s/.test(line)) {
      push();
      current = { heading: line.replace(/^#+\s*/, ""), items: [], paragraphs: [] };
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      current.items.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    current.paragraphs.push(line);
  }

  push();
  return sections;
};

const ReleaseNotes = ({ body }: { body: string | undefined }) => {
  const sections = parseNotes(body);

  if (sections.length === 0) {
    return (
      <p className="sp-body" style={{ fontSize: 13.5 }}>
        No release notes were published for this build.
      </p>
    );
  }

  return (
    <div className="sp-release-notes">
      {sections.map((section, index) => (
        <div key={index}>
          {section.heading ? <h3>{section.heading}</h3> : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex} className="sp-body" style={{ fontSize: 13.5, marginBottom: 8 }}>
              {renderInline(paragraph)}
            </p>
          ))}
          {section.items.length > 0 ? (
            <ul className="sp-doc-list" style={{ marginBottom: 6 }}>
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const CurrentBadge = ({ children = "current" }: { children?: ReactNode }) => (
  <span
    style={{
      font: "500 9px/1 'JetBrains Mono', monospace",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#fff",
      background: "var(--sp-cta)",
      padding: "6px 8px",
      borderRadius: 4,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

const pickAsset = (release: GithubReleaseSummary, platform: (typeof PLATFORM_ORDER)[number]) => {
  const extensions = platform === "windows" ? [".exe", ".msi"] : platform === "macos" ? [".dmg", ".pkg"] : [".appimage", ".deb"];
  return release.assets.find((asset) => extensions.some((extension) => asset.name.toLowerCase().endsWith(extension)));
};

const ENDPOINTS: [string, string][] = [
  [DOWNLOAD_PATHS.releaseMetadataLatest, "Current version, size, and per-platform artifact URLs"],
  ["/download/{os}/latest", "Stable redirect to the newest artifact for an OS (windows, macos, linux)"],
  [DOWNLOAD_PATHS.macosStableAppcast, "Sparkle-style appcast consumed by shipped macOS builds"],
  [DOWNLOAD_PATHS.windowsStableAppcast, "Appcast consumed by shipped Windows builds"],
  [DOWNLOAD_PATHS.linuxStableAppcast, "Appcast for Linux builds, when the stable manifest includes Linux"],
  [DOWNLOAD_PATHS.aiRuntimeMetadataLatest, "AI Tools runtime manifest the app reads for optional installs"],
];

const V2ReleasesPage = () => {
  const { snapshot, status } = useGithubRepoSnapshot();

  useSpReveal();

  const all = snapshot.releases ?? (snapshot.latestRelease ? [snapshot.latestRelease] : []);
  const desktop = all.filter(isDesktopRelease);
  const runtimes = all.filter((release) => !isDesktopRelease(release));
  const current = desktop[0];

  return (
    <>
      <PageSeo
        description="Every OpenStudio release with its notes and artifacts, plus the public release metadata endpoints the app reads for update checks."
        path={V2_PATHS.releases}
        robots="noindex"
        title="Releases & Changelog | OpenStudio"
      />

      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <Eyebrow icon={Tag}>Changelog · Release metadata</Eyebrow>
        <h1 className="sp-h1">Releases.</h1>
        <p className="sp-lede" style={{ maxWidth: 620 }}>
          Every published build, what changed, and the public metadata endpoints the app reads for update checks.
          {current ? ` Current: ${current.tagName}, ${formatDate(current.publishedAt)}.` : ""}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <DownloadCta withSize />
          <Cta href={REPO.releases} icon={ExternalLink} variant="outline">
            All releases on GitHub
          </Cta>
        </div>
        <p className="sp-mono" style={{ margin: "18px 0 0" }}>
          {status === "ready" ? "Live from GitHub" : `Snapshot from ${formatDate(snapshot.fetchedAt)}`} ·{" "}
          {formatCount(snapshot.releaseCount ?? desktop.length)} desktop releases
        </p>
      </div>

      <div className="sp-container" style={{ paddingTop: 26 }}>
        <div className="sp-releases-layout">
          <aside data-sp-reveal="rise" style={{ borderRight: "1px solid var(--sp-hairline)", paddingRight: 22 }}>
            <div className="sp-kicker">Versions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {desktop.map((release, index) => (
                <a
                  key={release.id}
                  className="sp-mono"
                  href={`#${release.tagName}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    fontSize: 12,
                    color: index === 0 ? "var(--sp-accent)" : undefined,
                  }}
                >
                  <span>{release.tagName}</span>
                  {index === 0 ? <CurrentBadge /> : null}
                </a>
              ))}
            </div>
          </aside>
          <div style={{ paddingLeft: 30, display: "flex", flexDirection: "column", gap: 26 }}>
            {desktop.map((release, index) => {
              const downloads = release.assets.reduce((sum, asset) => sum + asset.downloadCount, 0);

              return (
                <div key={release.id} className="sp-card" data-sp-reveal="rise" id={release.tagName} style={{ padding: "26px 28px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 16,
                      paddingBottom: 14,
                      borderBottom: "1px solid var(--sp-hairline)",
                    }}
                  >
                    <span style={{ font: "700 24px/1 'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>
                      {stripVersionPrefix(release.tagName)}
                    </span>
                    {index === 0 ? <CurrentBadge /> : null}
                    {release.isPrerelease ? <CurrentBadge>pre-release</CurrentBadge> : null}
                    <span className="sp-mono" style={{ marginLeft: "auto" }}>
                      {formatDate(release.publishedAt)} · {formatCount(downloads)} downloads
                    </span>
                  </div>
                  <div className="sp-grid-2" style={{ gap: 24, alignItems: "start" }}>
                    <ReleaseNotes body={release.body} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {PLATFORM_ORDER.map((platform) => {
                        const asset = pickAsset(release, platform);
                        if (!asset) {
                          return null;
                        }

                        return (
                          <a
                            key={platform}
                            className="sp-mono"
                            href={asset.downloadUrl}
                            rel="noreferrer"
                            style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "var(--sp-body)" }}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <Download aria-hidden="true" size={11} strokeWidth={1.8} />
                              {PLATFORMS[platform].label}
                            </span>
                            <span>{formatBytes(asset.size) ?? "—"}</span>
                          </a>
                        );
                      })}
                      <a
                        className="sp-mono"
                        href={release.htmlUrl}
                        rel="noreferrer"
                        style={{ color: "var(--sp-accent)", display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6 }}
                        target="_blank"
                      >
                        <ExternalLink aria-hidden="true" size={11} strokeWidth={1.8} />
                        Checksums and all assets on GitHub
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
            {desktop.length === 0 ? (
              <p className="sp-body">No desktop releases could be loaded. The full list is on GitHub.</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Runtimes */}
      {runtimes.length > 0 ? (
        <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 44 }}>
          <div className="sp-kicker">Optional runtimes</div>
          <div className="sp-card sp-card--tight">
            {runtimes.map((release, index) => (
              <div
                key={release.id}
                className="sp-endpoint-row"
                style={{ padding: "14px 18px", borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined }}
              >
                <a className="sp-mono" href={release.htmlUrl} rel="noreferrer" style={{ color: "var(--sp-accent)" }} target="_blank">
                  {release.tagName}
                </a>
                <span style={{ font: "400 13px/1.5 'Space Grotesk', sans-serif", color: "var(--sp-body)" }}>
                  {release.name} · {formatDate(release.publishedAt)} · installed on demand from inside the app
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Endpoints */}
      <div className="sp-container" data-sp-reveal="rise" id="endpoints" style={{ paddingTop: 44 }}>
        <div className="sp-kicker">Release metadata endpoints</div>
        <div className="sp-card sp-card--tight">
          {ENDPOINTS.map(([endpoint, description], index) => (
            <Fragment key={endpoint}>
              <div
                className="sp-endpoint-row"
                style={{
                  padding: "14px 18px",
                  borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined,
                }}
              >
                <code style={{ font: "500 12.5px/1.5 'JetBrains Mono', monospace", color: "var(--sp-accent)" }}>
                  {endpoint.includes("{") ? endpoint : <a href={endpoint}>{endpoint}</a>}
                </code>
                <span style={{ font: "400 13px/1.5 'Space Grotesk', sans-serif", color: "var(--sp-body)" }}>
                  {description}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Cta href={DOWNLOAD_PATHS.macosStableAppcast} icon={Clock} variant="outline">
            macOS appcast
          </Cta>{" "}
          <Cta href={DOWNLOAD_PATHS.windowsStableAppcast} icon={Clock} variant="outline">
            Windows appcast
          </Cta>
        </div>
      </div>

      <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 26, paddingBottom: 62 }}>
        <WarnCallout label="A public contract">
          These endpoints and redirects are consumed by shipped app builds for update checks. Nothing in the
          redesign changes them.
        </WarnCallout>
      </div>
    </>
  );
};

export default V2ReleasesPage;
