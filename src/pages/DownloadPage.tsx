import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, Code2, Copy, Cpu, Download, Monitor, Terminal, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import PageSeo from "@/components/PageSeo";
import SectionReveal from "@/components/motion/SectionReveal";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/constants/site";
import { designMedia } from "@/data/designMedia";
import { downloadHero, platformDownloads, systemRequirementMatrix } from "@/data/downloads";
import { externalLinks } from "@/data/siteLinks";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { formatGithubDate } from "@/lib/github";
import { cn } from "@/lib/utils";

type BrowserPlatform = "windows" | "macos" | "other";
type DownloadPlatform = "windows" | "macos";
type CopyState = "idle" | "copied" | "error";

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

  return "other";
};

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
  const windows = platformDownloads.find((item) => item.id === "windows")!;
  const macos = platformDownloads.find((item) => item.id === "macos")!;
  const linux = platformDownloads.find((item) => item.id === "linux")!;
  const { snapshot } = useGithubRepoSnapshot();
  const [browserPlatform, setBrowserPlatform] = useState<BrowserPlatform>(() => detectBrowserPlatform());
  const [pendingDownload, setPendingDownload] = useState<DownloadPlatform | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const prefersMacLayout = browserPlatform === "macos";
  const featuredPlatform: DownloadPlatform = prefersMacLayout ? "macos" : "windows";
  const isWindowsFeatured = featuredPlatform === "windows";
  const isMacosFeatured = featuredPlatform === "macos";
  const windowsCardSpan = prefersMacLayout ? "md:col-span-4" : "md:col-span-8";
  const macosCardSpan = prefersMacLayout ? "md:col-span-8" : "md:col-span-4";

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
      href: windows.href!,
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
      href: macos.href!,
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
  };

  const activeDownload = pendingDownload ? downloadInstructions[pendingDownload] : null;

  useEffect(() => {
    setBrowserPlatform(detectBrowserPlatform());
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
    if (!activeDownload || typeof window === "undefined") {
      return;
    }

    setPendingDownload(null);
    window.location.assign(activeDownload.href);
  };

  const handleCopyCommand = async () => {
    if (!activeDownload?.command) {
      return;
    }

    try {
      await copyText(activeDownload.command);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="design-page-main"
      id="main-content"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <PageSeo
        description="Download OpenStudio free for Windows or macOS — a native, open source DAW with MIDI, pitch editing, stem separation, and plugin hosting."
        path="/download"
        title={`${SITE_NAME} Download | Free for Windows and macOS`}
      />

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 top-[-10%] h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -left-10 bottom-[-8%] h-[24rem] w-[24rem] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <header className="mb-20 text-center">
          <div className="design-badge mx-auto mb-6 w-fit">
            <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
            <span>Windows + macOS stable builds</span>
          </div>
          <h1 className="font-headline text-5xl font-bold tracking-[-0.06em] text-transparent bg-gradient-to-b from-white to-white/60 bg-clip-text md:text-7xl">
            Deploy Your Sound.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/64 md:text-xl">{downloadHero.description}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <SectionReveal
            className={cn(
              "design-panel relative overflow-hidden rounded-[2.5rem] p-8",
              isWindowsFeatured && "group border-primary/25 bg-[radial-gradient(circle_at_top_right,rgba(164,142,255,0.14),transparent_44%)]",
              !isWindowsFeatured && "border-white/10 bg-white/[0.03]",
              windowsCardSpan,
            )}
          >
            <div className="mb-12 flex items-start justify-between gap-6">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <Monitor className={cn("h-10 w-10", isWindowsFeatured ? "text-primary" : "text-white")} />
                  <h2 className="font-headline text-3xl font-bold text-white">Windows</h2>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/48">x64 architecture • installer (.exe)</p>
              </div>
              {isWindowsFeatured ? (
                <div className="rounded-lg bg-primary/20 px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                  {browserPlatform === "windows" ? "Recommended on this device" : "Recommended"}
                </div>
              ) : null}
            </div>
            <div className={cn("space-y-4", isWindowsFeatured && "space-y-6")}>
              {isWindowsFeatured ? (
                <div className="flex flex-wrap gap-4">
                  {["ASIO support", "WASAPI low latency", "DirectSound"].map((item) => (
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5" key={item}>
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      <span className="font-mono text-[0.68rem] text-white/58">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm italic leading-7 text-white/60">Best for ASIO and low-latency desktop audio setups with the current manual trust notes kept visible.</p>
              )}
              <Button
                className={cn("h-auto w-full rounded-2xl px-8 py-5 font-bold", isWindowsFeatured ? "text-xl" : "text-lg")}
                onClick={() => setPendingDownload("windows")}
                type="button"
                variant={isWindowsFeatured ? "default" : "outline"}
              >
                <Download className="h-5 w-5" />
                Download for Windows
              </Button>
            </div>
            {isWindowsFeatured ? (
              <div className="pointer-events-none absolute -bottom-20 -right-20 text-white/5 transition group-hover:text-white/10">
                <Cpu className="h-56 w-56" />
              </div>
            ) : null}
          </SectionReveal>

          <SectionReveal
            className={cn(
              "design-panel relative overflow-hidden rounded-[2.5rem] p-8",
              isMacosFeatured && "group border-secondary/25 bg-[radial-gradient(circle_at_top_right,rgba(123,255,171,0.16),transparent_44%)]",
              !isMacosFeatured && "border-white/10 bg-white/[0.03]",
              macosCardSpan,
            )}
            delay={0.06}
          >
            <div className="mb-12 flex items-start justify-between gap-6">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <Monitor className={cn("h-10 w-10", isMacosFeatured ? "text-secondary" : "text-white")} />
                  <h2 className="font-headline text-3xl font-bold text-white">macOS</h2>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/48">Universal DMG</p>
              </div>
              {isMacosFeatured ? (
                <div className="rounded-lg bg-secondary/20 px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-secondary">
                  {browserPlatform === "macos" ? "Recommended on this device" : "Recommended"}
                </div>
              ) : null}
            </div>
            <div className={cn("space-y-4", isMacosFeatured && "space-y-6")}>
              {isMacosFeatured ? (
                <div className="flex flex-wrap gap-4">
                  {["Apple Silicon", "Intel support", "DMG install"].map((item) => (
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5" key={item}>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="font-mono text-[0.68rem] text-white/58">{item}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="text-sm italic leading-7 text-white/60">Supports Intel and Apple Silicon with the current manual trust notes kept visible.</p>
              <Button
                className={cn("h-auto w-full rounded-2xl px-8 py-5 font-bold", isMacosFeatured ? "text-xl" : "text-lg")}
                onClick={() => setPendingDownload("macos")}
                type="button"
                variant={isMacosFeatured ? "default" : "outline"}
              >
                <Download className="h-5 w-5" />
                Get macOS app
              </Button>
            </div>
            {isMacosFeatured ? (
              <div className="pointer-events-none absolute -bottom-20 -right-20 text-white/5 transition group-hover:text-white/10">
                <Download className="h-56 w-56" />
              </div>
            ) : null}
          </SectionReveal>

          <SectionReveal className="design-panel cursor-not-allowed rounded-[2.5rem] p-8 grayscale opacity-55 md:col-span-4" delay={0.1}>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Terminal className="h-10 w-10" />
                <h2 className="font-headline text-3xl font-bold text-white">Linux</h2>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/48">AppImage / Flatpak</p>
            </div>
            <div className="mt-10">
              <div className="mb-4 rounded-lg bg-white/[0.06] py-2 text-center font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/44">{linux.status}</div>
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-5 font-headline text-lg font-bold text-white/45" disabled>
                <Terminal className="h-5 w-5" />
                Coming soon
              </button>
            </div>
          </SectionReveal>

          <SectionReveal className="design-glass-panel rounded-[2.5rem] p-8 md:col-span-8" delay={0.14}>
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black">
                  <Code2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-white">Open Source Core</h3>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/60">
                    Review the code, follow the release story, or inspect the public product surface without leaving the site.
                  </p>
                </div>
              </div>
              <div className="flex w-full items-center gap-4 md:w-auto">
                <div className="hidden flex-col items-end lg:flex">
                  <span className="font-mono text-sm font-bold text-secondary">{snapshot.license}</span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/38">
                    {snapshot.latestRelease ? `Latest release ${snapshot.latestRelease.tagName}` : "GitHub releases pending"}
                  </span>
                </div>
                {externalLinks.repository ? (
                  <a
                    className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-8 py-4 text-center font-headline font-bold text-white transition hover:bg-white/[0.1] md:flex-none"
                    href={externalLinks.repository}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View GitHub
                  </a>
                ) : (
                  <a className="flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-8 py-4 text-center font-headline font-bold text-white transition hover:bg-white/[0.1] md:flex-none" href="/github">
                    View GitHub
                  </a>
                )}
              </div>
            </div>
          </SectionReveal>
        </div>

        <section className="mb-24 mt-20">
          <h2 className="mb-10 text-center font-headline text-3xl font-bold text-white">System Requirements</h2>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0f1015]">
            <table className="w-full text-left font-mono text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-8 py-6 text-primary">Component</th>
                  <th className="px-8 py-6 text-primary">Minimum</th>
                  <th className="px-8 py-6 text-primary">Recommended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {systemRequirementMatrix.map((item) => (
                  <tr className="transition hover:bg-white/[0.03]" key={item.component}>
                    <td className="px-8 py-6 font-bold text-white">{item.component}</td>
                    <td className="px-8 py-6 text-white/62">{item.minimum}</td>
                    <td className="px-8 py-6 text-white/62">{item.recommended}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <SectionReveal className="design-panel relative overflow-hidden rounded-[2.5rem] border border-primary/20 p-12 text-center">
          <img alt={designMedia.downloadWorkspace.alt} className="absolute inset-0 h-full w-full object-cover opacity-10 mix-blend-screen" src={designMedia.downloadWorkspace.src} />
          <div className="relative z-10">
            <h3 className="font-headline text-2xl font-bold text-white">Unleash the Power of AI-Native Audio.</h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/62">
              {snapshot.latestRelease
                ? `GitHub release ${snapshot.latestRelease.tagName} was published ${formatGithubDate(snapshot.latestRelease.publishedAt)}. The base installer stays honest, Windows and macOS ship through stable endpoints, and optional AI tooling remains a separate step for the stem workflow.`
                : "The base installer stays honest, Windows and macOS ship through stable endpoints, and optional AI tooling remains a clearly separate step for the stem workflow while GitHub Releases is still preparing for its first asset-backed publish."}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <div className="flex items-center justify-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-secondary">
                <Sparkline />
                Optional AI tools separate
              </div>
              <div className="flex items-center justify-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-primary">
                <ArrowRight className="h-3.5 w-3.5" />
                {snapshot.latestRelease ? "GitHub release path active" : "GitHub release path warming up"}
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>

      <Dialog.Root onOpenChange={(open) => setPendingDownload(open ? pendingDownload : null)} open={pendingDownload !== null}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(3,5,12,0.82)] backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,40rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/10 bg-[#0b0d14]/95 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
            <Dialog.Title className="font-headline text-2xl font-bold text-white">{activeDownload?.title}</Dialog.Title>
            <Dialog.Description className="mt-3 text-sm leading-7 text-white/64">{activeDownload?.summary}</Dialog.Description>

            <button
              aria-label="Close download instructions"
              className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/55 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              onClick={() => setPendingDownload(null)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-secondary">{activeDownload?.eyebrow}</div>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-white/78">
                {activeDownload?.steps.map((step, index) => (
                  <li className="flex gap-3" key={`${pendingDownload ?? "download"}-step-${index}`}>
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] font-mono text-[0.68rem] text-secondary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {activeDownload?.command ? (
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary">{activeDownload.commandLabel}</div>
                    <Button
                      className="h-10 rounded-xl px-4 text-xs"
                      onClick={handleCopyCommand}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {copyState === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy command"}
                    </Button>
                  </div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-6 text-white">
                    <code>{activeDownload.command}</code>
                  </pre>
                </div>
              ) : null}
            </div>

            <p className="mt-5 text-sm leading-7 text-white/58">
              Confirming means you understand that OpenStudio may require these manual trust steps before it opens normally on your platform.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button onClick={() => setPendingDownload(null)} type="button" variant="ghost">
                Cancel
              </Button>
              <Button className="h-auto px-6 py-3 text-base" onClick={handleConfirmDownload} type="button">
                <Download className="h-4 w-4" />
                {activeDownload?.confirmLabel}
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
      <span className="eq-bar w-1 rounded-full bg-secondary" key={height} style={{ animationDelay: `${index * 0.08}s`, height: `${height}%` }} />
    ))}
  </div>
);

export default DownloadPage;
