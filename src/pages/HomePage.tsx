import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { StaticRenderContext } from "@/lib/staticRender";
import {
  AudioWaveform,
  Cpu,
  Mic,
  Music,
  Pause,
  Play,
  Plug,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Tag,
  TriangleAlert,
  Users,
  Zap,
  type LucideProps,
} from "lucide-react";
import { Suspense, lazy, useContext, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import PageSeo from "@/components/PageSeo";
import { getHomeJsonLd } from "@/lib/structuredData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getPrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { REPO, SHOTS } from "@/data/siteContent";
import { SITE_PATHS, docPath } from "@/constants/routes";
import { formatBytes, formatCount, formatDate } from "@/lib/format";
import { ArrowLink, Cta, DownloadCta, Eyebrow, Frame, GradIcon, Kicker } from "@/components/ui/primitives";
import { LiveStage, preloadStage, type StageSelection } from "@/features/daw-preview/stage/LiveStage";
import { useFooterLead } from "@/components/layout/footerLeadContext";
import { orderPlatforms, usePlatform } from "@/hooks/usePlatform";
import { useReleaseInfo } from "@/hooks/useReleaseInfo";
import { useSpReveal } from "@/hooks/useSpReveal";

const LiveSession = lazy(() => import("@/features/daw-preview/LiveSession"));
const HERO_IMAGE_SIZES = "(max-width: 640px) calc(100vw - 60px), (max-width: 1188px) calc(100vw - 88px), 1100px";
const SHOWCASE_IMAGE_SIZES = "(max-width: 640px) calc(100vw - 42px), (max-width: 900px) calc(100vw - 70px), (max-width: 1240px) calc((100vw - 120px) * 0.575 - 2px), 642px";

/* ---------- showcase carousel ---------- */

interface Slide {
  id: string;
  icon: ComponentType<LucideProps>;
  tab: string;
  eyebrow: string;
  title: string;
  copy: string;
  chips: string[];
  shot: string;
  alt: string;
  linkLabel: string;
  to: string;
  /** Live stage that replaces the screenshot once loaded. */
  stage?: StageSelection;
}

const SLIDES: Slide[] = [
  {
    id: "ai",
    icon: Cpu,
    tab: "Local AI",
    eyebrow: "Optional · Local · Offline after setup",
    title: "Generate, separate, and vary audio without leaving the project.",
    copy: "ACE-Step and Stable Audio 3 turn a prompt into a clip, extend or vary what is already on the timeline, and BS Roformer pulls a mix apart into six stems. MiniMax Music 3 adds lyrics and structured songs in the next desktop release. Processing runs locally after setup.",
    chips: [
      "BS Roformer stems",
      "ACE-Step",
      "Stable Audio 3",
      "MiniMax Music 3 · next release",
      "Continue clip",
      "Inpaint",
    ],
    shot: SHOTS.arrangementOverviewWide,
    alt: "Separated stems arriving as tracks in the arrangement",
    linkLabel: "How the AI tools work",
    to: SITE_PATHS.ai,
    stage: { id: "arrangement", variant: "stems" },
  },
  {
    id: "nam",
    icon: Zap,
    tab: "NAM Rack",
    eyebrow: "Built in · No add-on · No paid tier",
    title: "Plug in and the rig is already there.",
    copy: "Load any Neural Amp Modeler capture, stack native pedals in front of it, drop a cabinet IR behind it, and A/B two chains against each other. Presets recall with the project, and it renders offline with the rest of the mix.",
    chips: ["NAM A1 / A2", "Pre-FX pedalboard", "Cabinet IR", "Graphic EQ", "Tuner", "TONE3000", "Offline render"],
    shot: SHOTS.namRackSignalChain,
    alt: "NAM Rack signal chain",
    linkLabel: "Explore the NAM Rack",
    to: SITE_PATHS.namRack,
    stage: { id: "nam-chain" },
  },
  {
    id: "pitch",
    icon: AudioWaveform,
    tab: "Pitch editing",
    eyebrow: "Graphical · On the take · In the arrangement",
    title: "Fix the take right where it sits in the arrangement.",
    copy: "A graphical pitch editor with note blobs and a contour, scale and chromatic snapping, a correct-pitch macro, and an offline render path. There is also a real-time pitch corrector effect for when you would rather work live.",
    chips: ["Note editor", "Scale snap", "Drift · Vibrato · Transition", "Correct-pitch macro", "Real-time corrector"],
    shot: SHOTS.pitchEditor,
    alt: "The graphical pitch editor",
    linkLabel: "Pitch editing in the docs",
    to: docPath("pitch-editing"),
    stage: { id: "pitch-editor" },
  },
  {
    id: "plugins",
    icon: Plug,
    tab: "Plugin hosting",
    eyebrow: "VST3 · CLAP · LV2 · ARA2",
    title: "Your plugins, hosted natively.",
    copy: "Native editor windows, input, track, and master FX chains, presets and A/B, sidechain routing, and a set of built-in processors (EQ, compressor, gate, delay, reverb, saturator, chorus) that cover the rest.",
    chips: ["Native editors", "Input / track / master FX", "Presets & A/B", "Sidechain", "Built-in FX", "Safe mode"],
    shot: SHOTS.pluginHosting,
    alt: "Plugin hosting inside OpenStudio",
    linkLabel: "Every feature",
    to: `${SITE_PATHS.features}#plugins`,
    stage: { id: "plugin-window" },
  },
];

const SLIDE_INTERVAL = 6500;

const Showcase = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => getPrefersReducedMotion());
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const playing = !paused && !hovering && visible;
  const slide = SLIDES[index];

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timer = window.setInterval(() => setIndex((value) => (value + 1) % SLIDES.length), SLIDE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [playing, index]);

  // Warm the next slide's stage chunk so the auto-advance never shows a poster.
  useEffect(() => {
    const next = SLIDES[(index + 1) % SLIDES.length].stage;
    if (
      !next ||
      !visible ||
      paused ||
      getPrefersReducedMotion() ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    )
      return;
    const idle =
      window.requestIdleCallback?.(() => void preloadStage(next.id).catch(() => undefined)) ??
      window.setTimeout(() => void preloadStage(next.id), 800);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle));
  }, [index, visible, paused]);

  // Stop the clock while the band is off screen so a long page never spins it for nothing.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="sp-showcase"
      data-playing={playing}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHovering(false);
        }
      }}
      onFocus={() => setHovering(true)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ ["--sp-showcase-interval" as string]: `${SLIDE_INTERVAL}ms` }}
    >
      <div>
        <Kicker className="text-[var(--sp-teal-bright)]">What makes it different</Kicker>
        <ul aria-label="Highlights" className="sp-showcase__tabs" role="tablist">
          {SLIDES.map((entry, slideIndex) => (
            <li key={entry.id} role="presentation">
              <button
                aria-controls="sp-showcase-panel"
                tabIndex={slideIndex === index ? 0 : -1}
                onKeyDown={(event) => {
                  const next =
                    event.key === "ArrowRight"
                      ? (index + 1) % SLIDES.length
                      : event.key === "ArrowLeft"
                        ? (index + SLIDES.length - 1) % SLIDES.length
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? SLIDES.length - 1
                            : null;
                  if (next === null) return;
                  event.preventDefault();
                  setIndex(next);
                  document.getElementById(`sp-showcase-tab-${SLIDES[next].id}`)?.focus();
                }}
                aria-selected={slideIndex === index}
                className="sp-showcase__tab"
                id={`sp-showcase-tab-${entry.id}`}
                onClick={() => setIndex(slideIndex)}
                role="tab"
                type="button"
              >
                <span className="sp-showcase__tab-index">0{slideIndex + 1}</span>
                <entry.icon aria-hidden="true" size={15} strokeWidth={1.8} />
                {entry.tab}
              </button>
            </li>
          ))}
        </ul>
        <div
          key={slide.id}
          aria-labelledby={`sp-showcase-tab-${slide.id}`}
          className="sp-showcase__panel sp-showcase__copy"
          id="sp-showcase-panel"
          role="tabpanel"
        >
          <Eyebrow icon={slide.icon} tone="teal">
            {slide.eyebrow}
          </Eyebrow>
          <h2 className="sp-h2 sp-h2--large leading-[1.08] mb-[14px]">{slide.title}</h2>
          <p className="sp-body text-[15.5px] text-[var(--sp-dark-body)] mb-[22px]">{slide.copy}</p>
          <div className="sp-showcase__chips">
            {slide.chips.map((chip) => (
              <span key={chip} className="sp-showcase__chip">
                {chip}
              </span>
            ))}
          </div>
          <Cta to={slide.to}>{slide.linkLabel}</Cta>
        </div>
      </div>
      <div>
        <div className="sp-card sp-card--dark sp-showcase__media">
          {slide.stage ? (
            <LiveStage key={slide.id} alt={slide.alt} eager {...slide.stage} poster={slide.shot} priority={1} sizes={SHOWCASE_IMAGE_SIZES} />
          ) : (
            <ResponsiveImage key={slide.id} alt={slide.alt} loading="lazy" src={slide.shot} sizes={SHOWCASE_IMAGE_SIZES} />
          )}
        </div>
        <div className="sp-showcase__controls">
          {SLIDES.map((entry, slideIndex) => (
            <button
              key={entry.id}
              aria-label={`Show ${entry.tab}`}
              aria-pressed={slideIndex === index}
              className="sp-showcase__dot"
              onClick={() => setIndex(slideIndex)}
              type="button"
            />
          ))}
          <button
            aria-label={paused ? "Resume auto-advance" : "Pause auto-advance"}
            className="sp-showcase__pause"
            onClick={() => setPaused((value) => !value)}
            type="button"
          >
            {paused ? <Play aria-hidden="true" size={11} /> : <Pause aria-hidden="true" size={11} />}
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- the rest of the page ---------- */

const SESSION_ROWS = [
  {
    number: "01",
    icon: Mic,
    title: "Record & arrange",
    copy: "Arm tracks, monitor inputs, punch in, and edit clips on the same timeline. Markers, regions, ripple, razor, takes, and fades.",
    shot: SHOTS.recordingSession,
    alt: "Recording session",
    imageFirst: false,
    to: docPath("recording-and-editing"),
    stage: { id: "arrangement" as const, variant: "recording" as const },
  },
  {
    number: "02",
    icon: Music,
    title: "MIDI & instruments",
    copy: "A docked or detached piano roll, hardware MIDI input, an on-screen keyboard, quantize and transforms, and audio-to-MIDI when an idea needs it.",
    shot: SHOTS.pianoRoll,
    alt: "Piano roll",
    imageFirst: true,
    to: docPath("midi-and-piano-roll"),
    stage: { id: "piano-roll" as const },
  },
  {
    number: "03",
    icon: SlidersHorizontal,
    title: "Mix & route",
    copy: "Channel strips, sends, buses, a routing matrix, metering, channel EQ, and mixer snapshots. Detach the mixer onto a second screen.",
    shot: SHOTS.mixerMeters,
    alt: "Mixer",
    imageFirst: false,
    to: docPath("mixing-and-routing"),
    stage: { id: "mixer" as const },
  },
  {
    number: "04",
    icon: AudioWaveform,
    title: "Render & deliver",
    copy: "Master and stem renders, region and razor bounds, WAV, AIFF, FLAC, MP3, and OGG, a render queue, and DDP export for CD mastering.",
    shot: SHOTS.exportDialog,
    alt: "Render dialog",
    imageFirst: true,
    to: docPath("rendering-and-export"),
    stage: { id: "render-dialog" as const },
  },
];

const GetStartedLead = () => {
  const platform = usePlatform();
  const others = orderPlatforms(platform).filter((entry) => entry.id !== platform);

  return (
    <div className="sp-container">
      <div className="sp-row min-[901px]:grid-cols-[1fr_1fr] gap-[52px]">
        <div>
          <h2 className="sp-h2 sp-h2--medium leading-[1.1] mb-[20px]">Download, then open the first-session guide.</h2>
          <div className="flex items-center gap-[12px] flex-wrap mb-[14px]">
            <DownloadCta variant="paper" withSize />
            {others.map((entry) => (
              <Cta key={entry.id} icon={entry.icon} to={SITE_PATHS.download} variant="ghost-dark">
                {entry.label}
              </Cta>
            ))}
          </div>
          <div className="flex gap-[20px] flex-wrap [font:500_13px/1_'Space_Grotesk',_sans-serif] text-[var(--sp-dark-body)]">
            <ArrowLink to={docPath("getting-started")} tone="teal">
              Getting started guide
            </ArrowLink>
            <ArrowLink to={`${SITE_PATHS.download}#requirements`} tone="teal">
              System requirements
            </ArrowLink>
          </div>
        </div>
        <div className="[border:1px_solid_rgba(253,199,0,.3)] [border-left:2px_solid_#fdc700] rounded-[10px] [background:linear-gradient(100deg,_rgba(253,199,0,.09),_rgba(253,199,0,0)_62%)] p-[20px_22px] [align-self:center]">
          <div className="sp-callout-label text-[#fdc700]">
            <TriangleAlert aria-hidden="true" size={13} strokeWidth={1.8} />
            Before you install
          </div>
          <p className="[font:400_13.5px/1.65_'Space_Grotesk',_sans-serif] text-[#d7dfe9] m-[0px]">
            Builds are currently unsigned, so Windows SmartScreen or macOS Gatekeeper may warn on first launch.{" "}
            <ArrowLink to={`${SITE_PATHS.download}#before-you-install`} tone="teal">
              Here&rsquo;s exactly what to expect and why
            </ArrowLink>
          </p>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const staticRender = useContext(StaticRenderContext);
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => scheduleAfterInitialLoad(() => setHeroReady(true), { delay: 400, timeout: 2000 }), []);
  const platform = usePlatform();
  const release = useReleaseInfo();
  const { snapshot } = useGithubRepoSnapshot();

  useSpReveal();
  useFooterLead(useMemo(() => <GetStartedLead />, []));

  const size = platform ? formatBytes(release?.platforms[platform].size) : null;
  const released = formatDate(release?.publishedAt);
  const otherPlatforms = orderPlatforms(platform)
    .filter((entry) => entry.id !== platform)
    .map((entry) => entry.label);
  const heroMeta = [
    release ? `v${release.version}` : null,
    size,
    released ? `released ${released}` : null,
    platform ? `also ${otherPlatforms.join(" and ")}` : "Windows · macOS · Linux",
  ]
    .filter(Boolean)
    .join(" · ");

  const statTiles = [
    { value: formatCount(snapshot.stats.stars), label: "GitHub stars", icon: Star },
    { value: formatCount(snapshot.releaseCount ?? null), label: "Releases", icon: Tag },
    { value: snapshot.license.replace("-3.0", "v3"), label: "License", icon: Scale },
    { value: formatCount(snapshot.stats.contributorCount), label: "Contributors", icon: Users },
  ];

  return (
    <>
      <PageSeo
        description="A free, open-source DAW for Windows, macOS, and Linux: multitrack recording, MIDI, plugin hosting, graphical pitch editing, local AI generation and stem separation, and a built-in Neural Amp Modeler guitar rig. AGPLv3."
        path={SITE_PATHS.home}
        jsonLd={getHomeJsonLd()}
        title="OpenStudio: Free Open-Source DAW for Windows, macOS & Linux"
      />

      {/* Hero */}
      <div className="sp-container">
        <div className="sp-hero-stack">
          <div data-sp-reveal="hero">
            <h1 className="sp-h1 sp-h1--hero">
              <span className="sp-hero-stack__line">Record, edit, mix, and generate.</span>{" "}
              <span className="sp-hero-stack__line">One free DAW.</span>
            </h1>
            <Eyebrow icon={ShieldCheck}>Free · Open source · AGPLv3</Eyebrow>
          </div>
          <Frame hero className="sp-home-session" reveal="rise">
            <ErrorBoundary
              fallback={<ResponsiveImage alt="OpenStudio timeline" loading="eager" src={SHOTS.heroTimeline} sizes={HERO_IMAGE_SIZES} />}
            >
              <Suspense
                fallback={<ResponsiveImage alt="OpenStudio timeline" loading="eager" src={SHOTS.heroTimeline} sizes={HERO_IMAGE_SIZES} />}
              >
                {staticRender || !heroReady ? (
                  <ResponsiveImage alt="OpenStudio timeline" loading="eager" src={SHOTS.heroTimeline} sizes={HERO_IMAGE_SIZES} />
                ) : (
                  <LiveSession />
                )}
              </Suspense>
            </ErrorBoundary>
          </Frame>
          <div className="sp-hero-stack__copy" data-sp-reveal="hero">
            <div className="flex items-center justify-center gap-[16px] flex-wrap mb-[12px]">
              <DownloadCta />
              <ArrowLink to={SITE_PATHS.features} tone="plain">
                See all features
              </ArrowLink>
            </div>
            <div className="sp-mono leading-[1.5] mb-[22px]">{heroMeta}</div>
            <p className="sp-lede text-[17px] leading-[1.6] max-w-[640px] mb-[16px]">
              Multitrack recording, MIDI, a full mixer, VST3/CLAP/LV2 hosting, graphical pitch editing, local AI
              generation and stem separation, and a Neural Amp Modeler guitar rig. All of it is in the base app, on
              Windows, macOS, and Linux.
            </p>
          </div>
        </div>
      </div>

      {/* Showcase (dark) */}
      <section className="sp-dark-panel" data-sp-reveal="band">
        <div className="sp-container pt-[72px] pb-[72px]">
          <Showcase />
        </div>
      </section>

      {/* The full session */}
      <div className="sp-container pt-[78px]">
        <div data-sp-reveal="hero">
          <h2 className="sp-h2 sp-h2--display leading-[1.05] max-w-[620px]">
            One project, from first take to final render.
          </h2>
          <p className="sp-lede text-[16px] max-w-[560px] mb-[40px]">
            Recording, MIDI, editing, pitch work, mixing, and export live in the same window, so you never have to
            export a clip to another tool and bring it back.
          </p>
        </div>
        <div className="flex flex-col gap-[34px] pb-[78px]">
          {SESSION_ROWS.map((row) => {
            const copyBlock = (
              <div key="copy" data-sp-reveal="rise">
                <div className="sp-mono text-[11px] leading-[1] mb-[12px]">{row.number}</div>
                <div className="[font:700_24px/1.2_'Space_Grotesk',_sans-serif] tracking-[-0.02em] mb-[10px] flex items-center gap-[10px]">
                  <GradIcon icon={row.icon} size={21} />
                  {row.title}
                </div>
                <p className="sp-body mb-[14px]">{row.copy}</p>
                <ArrowLink to={row.to}>In the docs</ArrowLink>
              </div>
            );
            const imageBlock = (
              <Frame key="image" reveal={row.imageFirst ? "media-left" : "media-right"}>
                <LiveStage alt={row.alt} {...row.stage} poster={row.shot}
                  sizes="(max-width: 640px) calc(100vw - 58px), (max-width: 900px) calc(100vw - 86px), (max-width: 1240px) calc((100vw - 102px) * 0.58 - 18px), 643px" />
              </Frame>
            );

            return (
              <div
                key={row.number}
                className={`sp-row [border-top:1px_solid_var(--sp-hairline)] pt-[34px] ${row.imageFirst ? "min-[901px]:grid-cols-[.58fr_.42fr]" : "min-[901px]:grid-cols-[.42fr_.58fr]"}`}
              >
                {row.imageFirst ? [imageBlock, copyBlock] : [copyBlock, imageBlock]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plugins / AI split */}
      <div className="sp-container">
        <div
          className="sp-row sp-split-cols min-[901px]:grid-cols-[1fr_1fr] gap-[0px] [border-top:1px_solid_var(--sp-hairline)] pb-[78px] items-start"
          data-sp-reveal="stagger"
        >
          <div className="sp-split-cols__a">
            <Eyebrow icon={Plug}>VST3 · CLAP · LV2 · ARA2</Eyebrow>
            <h2 className="sp-h2 leading-[1.12]">Your plugins, hosted natively.</h2>
            <p className="sp-body mb-[16px]">
              VST3, CLAP, and LV2 in their own native windows, with input FX, track FX, and master FX chains, plus
              optional ARA2 hosting. Built-in processors and Lua-scriptable ones cover the rest.
            </p>
            <ArrowLink to={docPath("plugins-and-scanning")}>Plugins & scanning</ArrowLink>
          </div>
          <div className="sp-split-cols__b">
            <Eyebrow icon={Cpu}>Optional · Local · Offline after setup</Eyebrow>
            <h2 className="sp-h2 leading-[1.12]">Generate, separate, and vary, all on your machine.</h2>
            <p className="sp-body mb-[14px]">
              Set up each model from AI Tools inside the app. ACE-Step and Stable Audio 3 generate, extend, and vary
              audio from a prompt; BS Roformer separates vocals, drums, bass, guitar, piano, and other.
            </p>
            <p className="sp-body mb-[16px]">
              Nothing is bundled into the base installer and nothing is sent to a server.
            </p>
            <ArrowLink to={SITE_PATHS.ai}>How the AI tools work</ArrowLink>
          </div>
        </div>
      </div>

      {/* Open source */}
      <div className="sp-container">
        <div
          className="sp-row min-[901px]:grid-cols-[1fr_1fr] gap-[52px] [border-top:1px_solid_var(--sp-hairline)] p-[64px_0_78px]"
          data-sp-reveal="stagger"
        >
          <div>
            <h2 className="sp-h2 sp-h2--large leading-[1.08]">Free under AGPLv3. All of it.</h2>
            <p className="sp-body text-[15.5px] mb-[22px]">
              There is no trial, no paid tier, and no account. The full source is public, so you can read it, build it,
              fork it, and send patches back.
            </p>
            <div className="flex gap-[22px] flex-wrap">
              <ArrowLink href={REPO.url}>Browse the source</ArrowLink>
              <ArrowLink to={SITE_PATHS.community}>Contribute</ArrowLink>
              <ArrowLink to={SITE_PATHS.roadmap}>Roadmap</ArrowLink>
            </div>
          </div>
          <div className="grid [grid-template-columns:1fr_1fr] gap-[1px] [background:linear-gradient(135deg,_rgba(80,0,255,.35),_rgba(0,215,182,.3))] [border:1px_solid_transparent] rounded-[10px] overflow-hidden">
            {statTiles.map((tile) => (
              <div className="[background:var(--sp-honest)] p-[22px]" key={tile.label}>
                <div className="[font:700_26px/1_'JetBrains_Mono',_monospace] mb-[6px]">{tile.value}</div>
                <div className="sp-mono text-[11px] leading-[1] tracking-[0.1em] uppercase flex items-center gap-[6px]">
                  <tile.icon aria-hidden="true" size={12} strokeWidth={1.7} />
                  {tile.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
