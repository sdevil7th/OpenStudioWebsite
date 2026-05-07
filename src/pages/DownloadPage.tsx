import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  HardDrive,
  Monitor,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  type LucideIcon,
} from "lucide-react";
import { lazy, Suspense, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import PageSeo from "@/components/PageSeo";
import BrandLogoConstructScene from "@/components/brand/BrandLogoConstructScene";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { designMedia } from "@/data/designMedia";
import {
  downloadHero,
  downloadHeroSignals,
  downloadSeo,
  platformDownloads,
  systemRequirementMatrix,
} from "@/data/downloads";
import { externalLinks } from "@/data/siteLinks";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { useScrollScene } from "@/lib/gsap";
import { formatGithubDate } from "@/lib/github";
import { cn } from "@/lib/utils";

type BrowserPlatform = "windows" | "macos" | "linux" | "other";
type DownloadPlatform = "windows" | "macos" | "linux";
type CopyState = "idle" | "copied" | "error";

interface PlatformStudioCopy {
  architecture: string;
  driver: string;
  highlights: string[];
  icon: LucideIcon;
  surface: string;
  trust: string;
}

const platformStudioCopy: Record<DownloadPlatform, PlatformStudioCopy> = {
  windows: {
    architecture: "x64 installer",
    driver: "ASIO / WASAPI / DirectSound",
    highlights: ["Stable redirect", "Desktop installer", "SmartScreen note"],
    icon: Monitor,
    surface:
      "Best for everyday desktop sessions, plugin hosting, and low-latency recording on Windows machines.",
    trust: "Unsigned installer may show SmartScreen on first launch.",
  },
  macos: {
    architecture: "Universal DMG",
    driver: "Apple Silicon / Intel",
    highlights: ["Universal build", "DMG install", "Gatekeeper guidance"],
    icon: HardDrive,
    surface:
      "A single macOS build for Apple Silicon and Intel setups, with first-open trust guidance kept visible.",
    trust: "Unsigned DMG can require manual Gatekeeper approval.",
  },
  linux: {
    architecture: "AppImage",
    driver: "Ubuntu 22.04+ tested",
    highlights: [
      "Self-contained",
      "Executable AppImage",
      "Desktop integration optional",
    ],
    icon: Terminal,
    surface:
      "A portable Linux build for direct launch, useful for studio machines that avoid package manager lock-in.",
    trust: "Most distros run the AppImage after chmod.",
  },
};

const platformOrder: DownloadPlatform[] = ["windows", "macos", "linux"];
const LOGO_SCROLL_TARGET_PROGRESS = 0.66;
const DownloadCinematicStory = lazy(() => import("@/components/scene/DownloadCinematicStory"));

const detectBrowserPlatform = (): BrowserPlatform => {
  if (typeof navigator === "undefined") {
    return "other";
  }

  const navigatorWithUserAgentData = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
    };
  };
  const platformSignal = [
    navigatorWithUserAgentData.userAgentData?.platform ?? "",
    navigator.platform ?? "",
    navigator.userAgent ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (platformSignal.includes("mac")) {
    return "macos";
  }

  if (platformSignal.includes("win")) {
    return "windows";
  }

  if (platformSignal.includes("linux") || platformSignal.includes("x11")) {
    return "linux";
  }

  return "other";
};

const browserToDownloadPlatform = (
  platform: BrowserPlatform,
): DownloadPlatform => (platform === "macos" || platform === "linux" ? platform : "windows");

const copyText = async (value: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard unavailable");
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
};

const DownloadPage = () => {
  const pageRef = useRef<HTMLElement | null>(null);
  const [logoProgress, setLogoProgress] = useState(0);
  const downloadsById = useMemo(
    () =>
      Object.fromEntries(platformDownloads.map((item) => [item.id, item])) as Record<
        DownloadPlatform,
        (typeof platformDownloads)[number]
      >,
    [],
  );
  const { snapshot } = useGithubRepoSnapshot();
  const [browserPlatform, setBrowserPlatform] = useState<BrowserPlatform>(() =>
    detectBrowserPlatform(),
  );
  const [activePlatform, setActivePlatform] = useState<DownloadPlatform>(() =>
    browserToDownloadPlatform(detectBrowserPlatform()),
  );
  const [pendingDownload, setPendingDownload] =
    useState<DownloadPlatform | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const recommendedPlatform = browserToDownloadPlatform(browserPlatform);
  const activeDownloadItem = downloadsById[activePlatform];

  useScrollScene(pageRef, ({ prefersReducedMotion, isDesktop, gsap, ScrollTrigger }) => {
    if (prefersReducedMotion) {
      setLogoProgress(0.5);
      return;
    }

    const cleanups: Array<() => void> = [];

    if (isDesktop) {
      setLogoProgress(0);
      const logoScrollTrigger = ScrollTrigger.create({
        trigger: "[data-download-studio-hero]",
        start: "top top+=96",
        endTrigger: "[data-download-panel-stack]",
        end: "bottom bottom-=96",
        pin: "[data-download-logo-pin-stage]",
        pinSpacing: false,
        anticipatePin: 1,
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setLogoProgress(
            Number((self.progress * LOGO_SCROLL_TARGET_PROGRESS).toFixed(3)),
          );
        },
      });

      cleanups.push(() => logoScrollTrigger.kill());
    } else {
      setLogoProgress(0.5);
    }

    const cardIntro = gsap.from("[data-download-hero-card]", {
      y: 34,
      opacity: 0,
      duration: 0.78,
      stagger: 0.08,
      ease: "power3.out",
    });

    cleanups.push(() => {
      cardIntro.kill();
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  });

  const downloadInstructions: Record<
    DownloadPlatform,
    {
      href: string;
      title: string;
      eyebrow: string;
      summary: ReactNode;
      confirmLabel: string;
      steps: ReactNode[];
      command?: string;
      commandLabel?: string;
    }
  > = {
    windows: {
      href: downloadsById.windows.href!,
      title: "Windows trust step required",
      eyebrow: "Before you open the installer",
      summary: (
        <>
          When Windows warns that OpenStudio is from an untrusted publisher, click{" "}
          <span className="rounded-md border border-amber-300/40 bg-amber-300/18 px-2 py-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-amber-100">
            More info
          </span>{" "}
          and then{" "}
          <span className="rounded-md border border-rose-300/40 bg-rose-300/18 px-2 py-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-rose-100">
            Run anyway
          </span>{" "}
          to continue.
        </>
      ),
      confirmLabel: "I understand, download for Windows",
      steps: [
        "Download the latest Windows installer.",
        "Run the .exe after the download completes.",
        <>
          If SmartScreen appears, click{" "}
          <span className="rounded-md border border-amber-300/40 bg-amber-300/18 px-2 py-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-amber-100">
            More info
          </span>
          .
        </>,
        <>
          Click{" "}
          <span className="rounded-md border border-rose-300/40 bg-rose-300/18 px-2 py-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-rose-100">
            Run anyway
          </span>{" "}
          to continue with the install.
        </>,
      ],
    },
    macos: {
      href: downloadsById.macos.href!,
      title: "macOS trust step required",
      eyebrow: "Before you open the app",
      summary: (
        <>
          If macOS marks OpenStudio as{" "}
          <span className="rounded-md border border-orange-300/40 bg-orange-300/18 px-2 py-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-orange-100">
            damaged
          </span>{" "}
          or{" "}
          <span className="rounded-md border border-orange-300/40 bg-orange-300/18 px-2 py-0.5 font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-orange-100">
            broken
          </span>
          , remove the quarantine flag with the command below and then launch the app again.
        </>
      ),
      confirmLabel: "I understand, download for macOS",
      steps: [
        "Download the latest macOS DMG.",
        "Move OpenStudio.app into /Applications.",
        "Open Terminal and run the quarantine-removal command below.",
        "Launch OpenStudio again from Applications.",
      ],
      command: "xattr -dr com.apple.quarantine /Applications/OpenStudio.app",
      commandLabel: "Run in Terminal",
    },
    linux: {
      href: downloadsById.linux.href!,
      title: "Linux AppImage download",
      eyebrow: "Before you launch the app",
      summary: (
        <>
          Linux downloads ship as a self-contained AppImage tested on Ubuntu 22.04+. Make the file
          executable, run it directly, and use the optional install flag if you want desktop
          integration.
        </>
      ),
      confirmLabel: "Download AppImage",
      steps: [
        "Download the Linux AppImage.",
        "Make it executable: chmod +x OpenStudio-*.AppImage",
        "Run it directly: ./OpenStudio-*.AppImage",
        "Optional: ./OpenStudio-*.AppImage --install for desktop integration.",
      ],
      command: "chmod +x OpenStudio-*.AppImage",
      commandLabel: "Run in Terminal first",
    },
  };

  const activeInstruction = pendingDownload
    ? downloadInstructions[pendingDownload]
    : null;

  useEffect(() => {
    const detected = detectBrowserPlatform();
    setBrowserPlatform(detected);
    setActivePlatform(browserToDownloadPlatform(detected));
  }, []);

  useEffect(() => {
    if (pendingDownload == null) {
      setCopyState("idle");
    }
  }, [pendingDownload]);

  useEffect(() => {
    if (copyState !== "copied") {
      return;
    }

    const timeout = window.setTimeout(() => setCopyState("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const handleConfirmDownload = () => {
    if (!activeInstruction || typeof window === "undefined") {
      return;
    }

    setPendingDownload(null);
    window.location.assign(activeInstruction.href);
  };

  const handleCopyCommand = async () => {
    if (!activeInstruction?.command) {
      return;
    }

    try {
      await copyText(activeInstruction.command);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <motion.main
      ref={pageRef}
      animate={{ opacity: 1, y: 0 }}
      className="design-page-main download-page"
      id="main-content"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageSeo {...downloadSeo} />

      <div className="download-page__backdrop" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-5 pb-24 md:px-10">
        <section
          className="download-studio-hero"
          data-download-studio-hero
        >
          <div className="download-home-logo-stage" data-download-logo-pin-stage>
            <div data-download-logo-stage>
              <BrandLogoConstructScene
                label="OpenStudio logo construction for download preview"
                progress={logoProgress}
                showWordmark
                size="intro"
              />
            </div>
          </div>

          <div className="download-studio-hero__panel-stack" data-download-panel-stack>
            <div className="download-studio-hero__copy">
              <div className="design-badge download-studio-hero__badge w-fit">
                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                <span>{downloadHero.eyebrow}</span>
              </div>

              <div>
                <p className="download-studio-hero__kicker">
                  {downloadHero.title}
                </p>
                <h1>Download OpenStudio. Start the session clean.</h1>
                <p className="download-studio-hero__lede">
                  {downloadHero.description}
                </p>
              </div>

              <div
                className="download-studio-signals"
                aria-label="Download release signals"
              >
                {downloadHeroSignals.map((signal) => (
                  <span key={signal}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {signal}
                  </span>
                ))}
              </div>

              <div className="download-hero-platform-grid" data-download-platforms>
                {platformOrder.map((platform) => {
                  const item = downloadsById[platform];
                  const copy = platformStudioCopy[platform];
                  const Icon = copy.icon;
                  const isActive = activePlatform === platform;
                  const isRecommended = recommendedPlatform === platform;

                  return (
                    <article
                      className={cn(
                        "download-platform-card download-platform-card--hero",
                        isActive && "download-platform-card--active",
                      )}
                      data-download-hero-card
                      data-platform={platform}
                      key={platform}
                    >
                      <div className="download-platform-card__top">
                        <div className="download-platform-card__icon">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span>{copy.architecture}</span>
                          <h2>{item.label}</h2>
                        </div>
                        {isRecommended ? (
                          <strong>
                            {browserPlatform === platform
                              ? "This device"
                              : "Recommended"}
                          </strong>
                        ) : null}
                      </div>
                      <p>{copy.surface}</p>
                      <div className="download-platform-card__chips">
                        {copy.highlights.map((highlight) => (
                          <span key={highlight}>{highlight}</span>
                        ))}
                      </div>
                      {item.notes ? (
                        <ul className="download-platform-card__notes">
                          {item.notes.slice(0, 2).map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="download-platform-card__actions">
                        <Button
                          className="h-auto flex-1 px-6 py-4 font-bold"
                          onClick={() => setPendingDownload(platform)}
                          type="button"
                          variant={isActive ? "default" : "outline"}
                        >
                          {platform === "linux" ? (
                            <Terminal className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          {platform === "linux"
                            ? "Download AppImage"
                            : `Download ${item.label}`}
                        </Button>
                        <Button
                          aria-label={`Focus ${item.label} release path`}
                          className="h-12 w-12 rounded-2xl p-0"
                          onClick={() => setActivePlatform(platform)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <SectionReveal
          className="download-source-strip download-source-strip--studio"
          data-download-trust-dock
          delay={0.12}
        >
          <div className="download-source-strip__main">
            <div className="download-source-strip__identity">
              <div className="download-source-strip__icon">
                <Code2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold text-white">
                  Open source release path
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-white/64">
                  Stable buttons resolve through download endpoints while the public repository and release status stay visible.
                </p>
              </div>
            </div>
            <div className="download-source-strip__meta">
              <div>
                <span>License</span>
                <strong>{snapshot.license}</strong>
              </div>
              <div>
                <span>Latest release</span>
                <strong>
                  {snapshot.latestRelease
                    ? snapshot.latestRelease.tagName
                    : "Pending"}
                </strong>
              </div>
              <div>
                <span>Redirects</span>
                <strong>Windows / macOS / Linux</strong>
              </div>
            </div>
            <div className="download-source-strip__action">
              {externalLinks.repository ? (
                <Button
                  asChild
                  className="h-auto flex-1 px-8 py-4 font-bold md:flex-none"
                  variant="outline"
                >
                  <a
                    href={externalLinks.repository}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View GitHub
                  </a>
                </Button>
              ) : (
                <Button
                  asChild
                  className="h-auto flex-1 px-8 py-4 font-bold md:flex-none"
                  variant="outline"
                >
                  <a href="/github">View GitHub</a>
                </Button>
              )}
            </div>
          </div>
        </SectionReveal>

        <Suspense
          fallback={
            <section className="download-cinematic download-cinematic--loading" data-download-cinema data-download-cinematic-story>
              <div className="download-cinematic__loading">
                <div className="design-badge design-badge-secondary w-fit">Studio workflow</div>
                <h2>Preparing the studio filmstrip.</h2>
              </div>
            </section>
          }
        >
          <DownloadCinematicStory
            activePlatformLabel={activeDownloadItem.label}
            onDownload={() => setPendingDownload(activePlatform)}
          />
        </Suspense>

        <section className="download-requirements" data-download-requirements>
          <div className="download-section-header">
            <div className="design-badge design-badge-secondary w-fit">
              System requirements
            </div>
            <h2>Built for the session you actually run.</h2>
            <p>
              The base app stays lean, but dense sessions, plugin chains, and optional local AI tools benefit from extra CPU,
              memory, and SSD headroom.
            </p>
          </div>
          <div className="download-requirements__table-wrap" data-download-requirements-table>
            <div className="download-requirements__table-meta">
              <span>System Requirements</span>
              <strong>REV 2026.04 · Desktop</strong>
            </div>
            <table className="download-requirements__table">
              <caption>OpenStudio desktop system requirements</caption>
              <thead>
                <tr>
                  <th scope="col">Component</th>
                  <th scope="col">Minimum</th>
                  <th scope="col">Recommended</th>
                </tr>
              </thead>
              <tbody>
                {systemRequirementMatrix.map((item) => (
                  <tr key={item.component}>
                    <th scope="row">{item.component}</th>
                    <td>
                      <span className="download-requirements__mobile-label">Minimum</span>
                      {item.minimum}
                    </td>
                    <td>
                      <span className="download-requirements__mobile-label">Recommended</span>
                      <strong>{item.recommended}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <SectionReveal className="download-ai-callout" data-download-outro>
          <img
            alt={designMedia.downloadWorkspace.alt}
            className="download-ai-callout__image"
            decoding="async"
            loading="lazy"
            src={designMedia.downloadWorkspace.src}
          />
          <div className="download-ai-callout__content">
            <div className="design-badge design-badge-secondary w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Optional AI tooling
            </div>
            <h2>Base installer first. AI runtime only when you ask for it.</h2>
            <p>
              {snapshot.latestRelease
                ? `GitHub release ${snapshot.latestRelease.tagName} was published ${formatGithubDate(snapshot.latestRelease.publishedAt)}. The base installer stays honest, and optional AI tooling remains a separate setup step for stem and generation workflows.`
                : "The base installer stays honest, Windows, macOS, and Linux ship through stable endpoints, and optional AI tooling remains a clearly separate step while GitHub Releases prepares for its first asset-backed publish."}
            </p>
            <div className="download-ai-callout__signals">
              <span>
                <Sparkline />
                Optional AI tools separate
              </span>
              <span>
                <ArrowRight className="h-3.5 w-3.5" />
                {snapshot.latestRelease
                  ? "GitHub release path active"
                  : "GitHub release path warming up"}
              </span>
            </div>
          </div>
        </SectionReveal>
      </div>

      <Dialog.Root
        onOpenChange={(open) => !open && setPendingDownload(null)}
        open={pendingDownload !== null}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(3,5,12,0.82)] backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[#0b0d14]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
            <Dialog.Title className="font-headline text-2xl font-bold text-white">
              {activeInstruction?.title}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-7 text-white/64">
              {activeInstruction?.summary}
            </Dialog.Description>

            <button
              aria-label="Close download instructions"
              className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/55 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              onClick={() => setPendingDownload(null)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-secondary">
                {activeInstruction?.eyebrow}
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-white/78">
                {activeInstruction?.steps.map((step, index) => (
                  <li
                    className="flex gap-3"
                    key={`${pendingDownload ?? "download"}-step-${index}`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] font-mono text-[0.68rem] text-secondary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {activeInstruction?.command ? (
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">
                      {activeInstruction.commandLabel}
                    </div>
                    <Button
                      className="h-10 rounded-xl px-4 text-xs"
                      onClick={handleCopyCommand}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {copyState === "copied" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copyState === "copied"
                        ? "Copied"
                        : copyState === "error"
                          ? "Copy failed"
                          : "Copy command"}
                    </Button>
                  </div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-6 text-white">
                    <code>{activeInstruction.command}</code>
                  </pre>
                </div>
              ) : null}
            </div>

            <p className="mt-5 text-sm leading-7 text-white/58">
              Confirming means you understand that OpenStudio may require these manual trust steps before it opens normally on your platform.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => setPendingDownload(null)}
                type="button"
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                className="h-auto px-6 py-3 text-base"
                onClick={handleConfirmDownload}
                type="button"
              >
                <Download className="h-4 w-4" />
                {activeInstruction?.confirmLabel}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </motion.main>
  );
};

const Sparkline = () => (
  <div className="flex h-4 items-end gap-1">
    {[45, 80, 60, 100].map((height, index) => (
      <span
        className="eq-bar w-1 rounded-full bg-secondary"
        key={height}
        style={{ animationDelay: `${index * 0.08}s`, height: `${height}%` }}
      />
    ))}
  </div>
);

export default DownloadPage;
