import { selectReleaseAsset } from "../../shared/release-assets";
import { Clock, Download, ExternalLink, Tag } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import PageSeo from "@/components/PageSeo";
import { DOWNLOAD_PATHS } from "@/constants/site";
import type { GithubReleaseSummary } from "@/data/marketing";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { REPO } from "@/data/siteContent";
import { SITE_PATHS } from "@/constants/routes";
import { formatBytes, formatCount, formatDate, stripVersionPrefix } from "@/lib/format";
import { Cta, DownloadCta, Eyebrow, WarnCallout, renderInline } from "@/components/ui/primitives";
import { PLATFORMS, PLATFORM_ORDER } from "@/hooks/usePlatform";
import { useSpReveal } from "@/hooks/useSpReveal";

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
    if (
      !line ||
      line.startsWith("# ") ||
      TEMPLATE_LINES.some((pattern) => pattern.test(line.replace(/^[-*]\s*/, "")))
    ) {
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
    return <p className="sp-body text-[13.5px]">No release notes were published for this build.</p>;
  }

  return (
    <div className="sp-release-notes">
      {sections.map((section, index) => (
        <div key={index}>
          {section.heading ? <h3>{section.heading}</h3> : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex} className="sp-body text-[13.5px] mb-[8px]">
              {renderInline(paragraph)}
            </p>
          ))}
          {section.items.length > 0 ? (
            <ul className="sp-doc-list mb-[6px]">
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
  <span className="[font:500_9px/1_'JetBrains_Mono',_monospace] tracking-[0.12em] uppercase text-[#fff] [background:var(--sp-cta)] p-[6px_8px] rounded-[4px] [white-space:nowrap]">
    {children}
  </span>
);

const pickAsset = (release: GithubReleaseSummary, platform: (typeof PLATFORM_ORDER)[number]) =>
  selectReleaseAsset(release.assets, platform);

const ENDPOINTS: [string, string][] = [
  [DOWNLOAD_PATHS.releaseMetadataLatest, "Current version, size, and per-platform artifact URLs"],
  ["/download/{os}/latest", "Stable redirect to the newest artifact for an OS (windows, macos, linux)"],
  [DOWNLOAD_PATHS.macosStableAppcast, "Sparkle-style appcast consumed by shipped macOS builds"],
  [DOWNLOAD_PATHS.windowsStableAppcast, "Appcast consumed by shipped Windows builds"],
  [DOWNLOAD_PATHS.linuxStableAppcast, "Appcast for Linux builds, when the stable manifest includes Linux"],
  [DOWNLOAD_PATHS.aiRuntimeMetadataLatest, "AI Tools runtime manifest the app reads for optional installs"],
];

const ReleasesPage = () => {
  const { snapshot, status } = useGithubRepoSnapshot();

  useSpReveal();

  const all = snapshot.releases ?? (snapshot.latestRelease ? [snapshot.latestRelease] : []);
  const desktop = all.filter(isDesktopRelease);
  const runtimes = all.filter((release) => !isDesktopRelease(release));
  const current = desktop.find((release) => !release.isPrerelease);

  return (
    <>
      <PageSeo
        description="Every OpenStudio release with its notes and artifacts, plus the public release metadata endpoints the app reads for update checks."
        path={SITE_PATHS.releases}
        title="Releases & Changelog | OpenStudio"
      />

      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <Eyebrow icon={Tag}>Changelog · Release metadata</Eyebrow>
        <h1 className="sp-h1">Releases.</h1>
        <p className="sp-lede max-w-[620px]">
          Every published build, what changed, and the public metadata endpoints the app reads for update checks.
          {current ? ` Current: ${current.tagName}, ${formatDate(current.publishedAt)}.` : ""}
        </p>
        <div className="flex items-center gap-[16px] flex-wrap">
          <DownloadCta withSize />
          <Cta href={REPO.releases} icon={ExternalLink} variant="outline">
            All releases on GitHub
          </Cta>
        </div>
        <p className="sp-mono m-[18px_0_0]">
          {status === "ready" ? "Live from GitHub" : `Snapshot from ${formatDate(snapshot.fetchedAt)}`} ·{" "}
          {formatCount(snapshot.releaseCount ?? desktop.length)} desktop releases
        </p>
      </div>

      <div className="sp-container pt-[26px]">
        <div className="sp-releases-layout">
          <aside className="[border-right:1px_solid_var(--sp-hairline)] pr-[22px]" data-sp-reveal="rise">
            <div className="sp-kicker">Versions</div>
            <div className="flex flex-col gap-[10px]">
              {desktop.map((release, index) => (
                <a
                  key={release.id}
                  className="sp-mono flex items-center justify-between gap-[8px] text-[12px]"
                  href={`#${release.tagName}`}
                  style={{ color: index === 0 ? "var(--sp-accent)" : undefined }}
                >
                  <span>{release.tagName}</span>
                  {index === 0 ? <CurrentBadge /> : null}
                </a>
              ))}
            </div>
          </aside>
          <div className="max-[900px]:pl-0 pl-[30px] flex flex-col gap-[26px]">
            {desktop.map((release, index) => {
              const downloads = release.assets.reduce((sum, asset) => sum + asset.downloadCount, 0);

              return (
                <div key={release.id} className="sp-card p-[26px_28px]" data-sp-reveal="rise" id={release.tagName}>
                  <div className="flex items-center gap-[12px] flex-wrap mb-[16px] pb-[14px] [border-bottom:1px_solid_var(--sp-hairline)]">
                    <span className="[font:700_24px/1_'JetBrains_Mono',_monospace] tracking-[-0.02em]">
                      {stripVersionPrefix(release.tagName)}
                    </span>
                    {index === 0 ? <CurrentBadge /> : null}
                    {release.isPrerelease ? <CurrentBadge>pre-release</CurrentBadge> : null}
                    <span className="sp-mono ml-[auto]">
                      {formatDate(release.publishedAt)} · {formatCount(downloads)} downloads
                    </span>
                  </div>
                  <div className="sp-grid-2 gap-[24px] items-start">
                    <ReleaseNotes body={release.body} />
                    <div className="flex flex-col gap-[8px]">
                      {PLATFORM_ORDER.map((platform) => {
                        const asset = pickAsset(release, platform);
                        if (!asset) {
                          return null;
                        }

                        return (
                          <a
                            key={platform}
                            className="sp-mono flex justify-between gap-[12px] text-[var(--sp-body)]"
                            href={asset.downloadUrl}
                            rel="noreferrer"
                          >
                            <span className="inline-flex items-center gap-[6px]">
                              <Download aria-hidden="true" size={11} strokeWidth={1.8} />
                              {PLATFORMS[platform].label}
                            </span>
                            <span>{formatBytes(asset.size) ?? "—"}</span>
                          </a>
                        );
                      })}
                      <a
                        className="sp-mono text-[var(--sp-accent)] inline-flex items-center gap-[6px] mt-[6px]"
                        href={release.htmlUrl}
                        rel="noreferrer"
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
        <div className="sp-container pt-[44px]" data-sp-reveal="rise">
          <div className="sp-kicker">Optional runtimes</div>
          <div className="sp-card sp-card--tight">
            {runtimes.map((release, index) => (
              <div
                key={release.id}
                className="sp-endpoint-row p-[14px_18px]"
                style={{ borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined }}
              >
                <a className="sp-mono text-[var(--sp-accent)]" href={release.htmlUrl} rel="noreferrer" target="_blank">
                  {release.tagName}
                </a>
                <span className="[font:400_13px/1.5_'Space_Grotesk',_sans-serif] text-[var(--sp-body)]">
                  {release.name} · {formatDate(release.publishedAt)} · installed on demand from inside the app
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Endpoints */}
      <div className="sp-container pt-[44px]" data-sp-reveal="rise" id="endpoints">
        <div className="sp-kicker">Release metadata endpoints</div>
        <div className="sp-card sp-card--tight">
          {ENDPOINTS.map(([endpoint, description], index) => (
            <Fragment key={endpoint}>
              <div
                className="sp-endpoint-row p-[14px_18px]"
                style={{ borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined }}
              >
                <code className="[font:500_12.5px/1.5_'JetBrains_Mono',_monospace] text-[var(--sp-accent)]">
                  {endpoint.includes("{") ? endpoint : <a href={endpoint}>{endpoint}</a>}
                </code>
                <span className="[font:400_13px/1.5_'Space_Grotesk',_sans-serif] text-[var(--sp-body)]">
                  {description}
                </span>
              </div>
            </Fragment>
          ))}
        </div>
        <div className="mt-[16px]">
          <Cta href={DOWNLOAD_PATHS.macosStableAppcast} icon={Clock} variant="outline">
            macOS appcast
          </Cta>{" "}
          <Cta href={DOWNLOAD_PATHS.windowsStableAppcast} icon={Clock} variant="outline">
            Windows appcast
          </Cta>
        </div>
      </div>

      <div className="sp-container pt-[26px] pb-[62px]" data-sp-reveal="rise">
        <WarnCallout label="A public contract">
          These endpoints and redirects are consumed by shipped app builds for update checks. Nothing in the redesign
          changes them.
        </WarnCallout>
      </div>
    </>
  );
};

export default ReleasesPage;
