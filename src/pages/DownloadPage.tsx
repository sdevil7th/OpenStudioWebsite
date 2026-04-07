import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Code2, Cpu, Download, Monitor, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
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

const DownloadPage = () => {
  const windows = platformDownloads.find((item) => item.id === "windows")!;
  const macos = platformDownloads.find((item) => item.id === "macos")!;
  const linux = platformDownloads.find((item) => item.id === "linux")!;
  const { snapshot } = useGithubRepoSnapshot();
  const [browserPlatform, setBrowserPlatform] = useState<BrowserPlatform>(() => detectBrowserPlatform());
  const prefersMacLayout = browserPlatform === "macos";
  const windowsCardSpan = prefersMacLayout ? "md:col-span-4" : "md:col-span-8";
  const macosCardSpan = prefersMacLayout ? "md:col-span-8" : "md:col-span-4";

  useEffect(() => {
    setBrowserPlatform(detectBrowserPlatform());
  }, []);

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
          <SectionReveal className={cn("design-panel group relative overflow-hidden rounded-[2.5rem] p-8", windowsCardSpan)}>
            <div className="mb-12 flex items-start justify-between gap-6">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <Monitor className="h-10 w-10 text-primary" />
                  <h2 className="font-headline text-3xl font-bold text-white">Windows</h2>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/48">x64 architecture • installer (.exe)</p>
              </div>
              <div className="rounded-lg bg-primary/20 px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                Recommended
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {["ASIO support", "WASAPI low latency", "DirectSound"].map((item) => (
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5" key={item}>
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    <span className="font-mono text-[0.68rem] text-white/58">{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="h-auto w-full rounded-2xl px-8 py-5 text-xl font-bold">
                <a href={windows.href}>
                  <Download className="h-5 w-5" />
                  Download for Windows
                </a>
              </Button>
            </div>
            <div className="pointer-events-none absolute -bottom-20 -right-20 text-white/5 transition group-hover:text-white/10">
              <Cpu className="h-56 w-56" />
            </div>
          </SectionReveal>

          <SectionReveal className={cn("design-panel rounded-[2.5rem] p-8", macosCardSpan)} delay={0.06}>
            <div className="mb-12">
              <div className="mb-2 flex items-center gap-3">
                <Monitor className="h-10 w-10 text-white" />
                <h2 className="font-headline text-3xl font-bold text-white">macOS</h2>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/48">Universal DMG</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm italic leading-7 text-white/60">Supports Intel and Apple Silicon with the current manual trust notes kept visible.</p>
              <Button asChild className="h-auto w-full rounded-2xl px-8 py-5 text-lg font-bold" variant="outline">
                <a href={macos.href}>
                  <Download className="h-5 w-5" />
                  Get macOS app
                </a>
              </Button>
            </div>
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
