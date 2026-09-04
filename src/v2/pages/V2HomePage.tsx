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
import { Suspense, lazy, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import PageSeo from "@/components/PageSeo";
import { getPrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useGithubRepoSnapshot } from "@/hooks/useGithubRepoSnapshot";
import { REPO, SHOTS, V2_PATHS, docPath } from "../content";
import { formatBytes, formatCount, formatDate } from "../format";
import { ArrowLink, Cta, DownloadCta, Eyebrow, Frame, GradIcon, Kicker } from "../primitives";
import { LiveStage, preloadStage, type StageId } from "../daw/stage/LiveStage";
import { useFooterLead } from "../shellContext";
import { orderPlatforms, usePlatform } from "../usePlatform";
import { useReleaseInfo } from "../useReleaseInfo";
import { useSpReveal } from "../useSpReveal";

const LiveSession = lazy(() => import("../daw/LiveSession"));

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
  stage?: { id: StageId; variant?: string };
}

const SLIDES: Slide[] = [
  {
    id: "ai",
    icon: Cpu,
    tab: "Local AI",
    eyebrow: "Optional · Local · Offline after setup",
    title: "Generate, separate, and vary audio without leaving the project.",
    copy: "ACE-Step and Stable Audio 3 turn a prompt into a clip, extend or vary what is already on the timeline, and BS Roformer pulls a mix apart into six stems. Everything runs on your machine through a managed runtime you install once.",
    chips: ["BS Roformer stems", "ACE-Step", "Stable Audio 3", "Variation", "Continue clip", "Inpaint"],
    shot: SHOTS.arrangementOverviewWide,
    alt: "Separated stems arriving as tracks in the arrangement",
    linkLabel: "How the AI tools work",
    to: V2_PATHS.ai,
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
    to: V2_PATHS.namRack,
    stage: { id: "nam-chain" },
  },
  {
    id: "pitch",
    icon: AudioWaveform,
    tab: "Pitch editing",
    eyebrow: "Graphical · On the take · In the arrangement",
    title: "Fix the take where it sits, not in a separate app.",
    copy: "A graphical pitch editor with note blobs and a contour, scale and chromatic snapping, a correct-pitch macro, and an offline render path — plus a real-time pitch corrector effect when you would rather work live.",
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
    copy: "Native editor windows, input, track, and master FX chains, presets and A/B, sidechain routing, and a set of built-in processors — EQ, compressor, gate, delay, reverb, saturator, chorus — that cover the rest.",
    chips: ["Native editors", "Input / track / master FX", "Presets & A/B", "Sidechain", "Built-in FX", "Safe mode"],
    shot: SHOTS.pluginHosting,
    alt: "Plugin hosting inside OpenStudio",
    linkLabel: "Every feature",
    to: `${V2_PATHS.features}#plugins`,
    stage: { id: "plugin-window" },
  },
];

const SLIDE_INTERVAL = 6500;

const Showcase = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(() => getPrefersReducedMotion());
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(true);
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
    if (!next) return;
    const idle = window.requestIdleCallback?.(() => void preloadStage(next.id)) ?? window.setTimeout(() => void preloadStage(next.id), 800);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle));
  }, [index]);

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
        <Kicker style={{ color: "var(--sp-teal-bright)" }}>What makes it different</Kicker>
        <ul aria-label="Highlights" className="sp-showcase__tabs" role="tablist">
          {SLIDES.map((entry, slideIndex) => (
            <li key={entry.id} role="presentation">
              <button
                aria-controls={`sp-showcase-panel-${entry.id}`}
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
          id={`sp-showcase-panel-${slide.id}`}
          role="tabpanel"
        >
          <Eyebrow icon={slide.icon} tone="teal">
            {slide.eyebrow}
          </Eyebrow>
          <h2 className="sp-h2 sp-h2--large" style={{ lineHeight: 1.08, marginBottom: 14 }}>
            {slide.title}
          </h2>
          <p className="sp-body" style={{ fontSize: 15.5, color: "var(--sp-dark-body)", marginBottom: 22 }}>
            {slide.copy}
          </p>
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
            <LiveStage key={slide.id} alt={slide.alt} eager id={slide.stage.id} poster={slide.shot} priority={1} variant={slide.stage.variant} />
          ) : (
            <img key={slide.id} alt={slide.alt} loading="lazy" src={slide.shot} />
          )}
        </div>
        <div className="sp-showcase__controls">
          {SLIDES.map((entry, slideIndex) => (
            <button
              key={entry.id}
              aria-label={`Show ${entry.tab}`}
              aria-selected={slideIndex === index}
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
    stage: { id: "arrangement" as StageId, variant: "recording" },
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
    stage: { id: "piano-roll" as StageId },
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
    stage: { id: "mixer" as StageId },
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
    stage: { id: "render-dialog" as StageId },
  },
];

const GetStartedLead = () => {
  const platform = usePlatform();
  const others = orderPlatforms(platform).filter((entry) => entry.id !== platform);

  return (
    <div className="sp-container">
      <div className="sp-row" style={{ gridTemplateColumns: "1fr 1fr", gap: 52 }}>
        <div>
          <h2 className="sp-h2 sp-h2--medium" style={{ lineHeight: 1.1, marginBottom: 20 }}>
            Download, then open the first-session guide.
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <DownloadCta variant="paper" withSize />
            {others.map((entry) => (
              <Cta key={entry.id} icon={entry.icon} to={V2_PATHS.download} variant="ghost-dark">
                {entry.label}
              </Cta>
            ))}
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", font: "500 13px/1 'Space Grotesk', sans-serif", color: "var(--sp-dark-body)" }}>
            <ArrowLink to={docPath("getting-started")} tone="teal">
              Getting started guide
            </ArrowLink>
            <ArrowLink to={`${V2_PATHS.download}#requirements`} tone="teal">
              System requirements
            </ArrowLink>
          </div>
        </div>
        <div
          style={{
            border: "1px solid rgba(253,199,0,.3)",
            borderLeft: "2px solid #fdc700",
            borderRadius: 10,
            background: "linear-gradient(100deg, rgba(253,199,0,.09), rgba(253,199,0,0) 62%)",
            padding: "20px 22px",
            alignSelf: "center",
          }}
        >
          <div className="sp-callout-label" style={{ color: "#fdc700" }}>
            <TriangleAlert aria-hidden="true" size={13} strokeWidth={1.8} />
            Before you install
          </div>
          <p style={{ font: "400 13.5px/1.65 'Space Grotesk', sans-serif", color: "#d7dfe9", margin: 0 }}>
            Builds are currently unsigned, so Windows SmartScreen or macOS Gatekeeper may warn on first launch.{" "}
            <ArrowLink to={`${V2_PATHS.download}#before-you-install`} tone="teal">
              Here&rsquo;s exactly what to expect and why
            </ArrowLink>
          </p>
        </div>
      </div>
    </div>
  );
};

const V2HomePage = () => {
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
        path={V2_PATHS.home}
        robots="noindex"
        title="OpenStudio — Free Open-Source DAW for Windows, macOS & Linux"
      />

      {/* Hero */}
      <div className="sp-container">
        <div className="sp-split" style={{ gridTemplateColumns: "1.05fr .95fr", paddingTop: 72 }}>
          <div data-sp-reveal="hero">
            <Eyebrow icon={ShieldCheck}>Free · Open source · AGPLv3</Eyebrow>
            <h1 className="sp-h1 sp-h1--hero">Record, edit, mix, and generate. One free DAW.</h1>
            <p className="sp-lede" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 540, marginBottom: 28 }}>
              Multitrack recording, MIDI, a full mixer, VST3/CLAP/LV2 hosting, graphical pitch editing, local AI
              generation and stem separation, and a Neural Amp Modeler guitar rig — all in the base app, on
              Windows, macOS, and Linux.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
              <DownloadCta />
              <ArrowLink to={V2_PATHS.features} tone="plain">
                See all features
              </ArrowLink>
            </div>
            <div className="sp-mono" style={{ lineHeight: 1.5 }}>
              {heroMeta}
            </div>
          </div>
          <Frame hero reveal="media-right">
            <Suspense fallback={<img alt="OpenStudio timeline" loading="eager" src={SHOTS.heroTimeline} />}>
              <LiveSession />
            </Suspense>
          </Frame>
        </div>
      </div>

      {/* Proof strip */}
      <div
        className="sp-grid-4 sp-proof-strip"
        data-sp-reveal="stagger"
        style={{
          gap: 0,
          borderTop: "1px solid var(--sp-hairline)",
          borderBottom: "1px solid var(--sp-hairline)",
          marginTop: 52,
        }}
      >
        {[
          { icon: Mic, label: "Multitrack recording", accent: false },
          { icon: Plug, label: "VST3 / CLAP / LV2 / ARA2", accent: false },
          { icon: Cpu, label: "Local AI generation & stems", accent: true },
          { icon: Zap, label: "Built-in NAM Rack", accent: false },
        ].map((item) => (
          <div
            key={item.label}
            className="sp-proof-strip__item"
            style={{ color: item.accent ? "var(--sp-accent)" : undefined }}
          >
            {item.accent ? (
              <item.icon aria-hidden="true" size={17} strokeWidth={1.7} />
            ) : (
              <GradIcon icon={item.icon} size={17} />
            )}
            {item.label}
          </div>
        ))}
      </div>

      {/* Showcase (dark) */}
      <section className="sp-dark-panel" data-sp-reveal="band">
        <div className="sp-container" style={{ paddingTop: 72, paddingBottom: 72 }}>
          <Showcase />
        </div>
      </section>

      {/* The full session */}
      <div className="sp-container" style={{ paddingTop: 78 }}>
        <div data-sp-reveal="hero">
          <h2 className="sp-h2 sp-h2--display" style={{ lineHeight: 1.05, maxWidth: 620 }}>
            One project, from first take to final render.
          </h2>
          <p className="sp-lede" style={{ fontSize: 16, maxWidth: 560, marginBottom: 40 }}>
            Recording, MIDI, editing, pitch work, mixing, and export live in the same window. No round trips, no
            exporting a clip to a separate tool and importing it back.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 34, paddingBottom: 78 }}>
          {SESSION_ROWS.map((row) => {
            const copyBlock = (
              <div key="copy" data-sp-reveal="rise">
                <div className="sp-mono" style={{ fontSize: 11, lineHeight: 1, marginBottom: 12 }}>
                  {row.number}
                </div>
                <div
                  style={{
                    font: "700 24px/1.2 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <GradIcon icon={row.icon} size={21} />
                  {row.title}
                </div>
                <p className="sp-body" style={{ marginBottom: 14 }}>
                  {row.copy}
                </p>
                <ArrowLink to={row.to}>In the docs</ArrowLink>
              </div>
            );
            const imageBlock = (
              <Frame key="image" reveal={row.imageFirst ? "media-left" : "media-right"}>
                <LiveStage alt={row.alt} id={row.stage.id} poster={row.shot} variant={row.stage.variant} />
              </Frame>
            );

            return (
              <div
                key={row.number}
                className="sp-row"
                style={{
                  gridTemplateColumns: row.imageFirst ? ".58fr .42fr" : ".42fr .58fr",
                  borderTop: "1px solid var(--sp-hairline)",
                  paddingTop: 34,
                }}
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
          className="sp-row sp-split-cols"
          data-sp-reveal="stagger"
          style={{ gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--sp-hairline)", paddingBottom: 78, alignItems: "start" }}
        >
          <div className="sp-split-cols__a">
            <Eyebrow icon={Plug}>VST3 · CLAP · LV2 · ARA2</Eyebrow>
            <h2 className="sp-h2" style={{ lineHeight: 1.12 }}>
              Your plugins, hosted natively.
            </h2>
            <p className="sp-body" style={{ marginBottom: 16 }}>
              VST3, CLAP, and LV2 in their own native windows, with input FX, track FX, and master FX chains, plus
              optional ARA2 hosting. Built-in processors and Lua-scriptable ones cover the rest.
            </p>
            <ArrowLink to={docPath("plugins-and-scanning")}>Plugins & scanning</ArrowLink>
          </div>
          <div className="sp-split-cols__b">
            <Eyebrow icon={Cpu}>Optional · Local · Offline after setup</Eyebrow>
            <h2 className="sp-h2" style={{ lineHeight: 1.12 }}>
              Generate, separate, and vary — on your machine.
            </h2>
            <p className="sp-body" style={{ marginBottom: 14 }}>
              Install the AI Tools runtime once from inside the app. ACE-Step and Stable Audio 3 generate, extend,
              and vary audio from a prompt; BS Roformer separates vocals, drums, bass, guitar, piano, and other.
            </p>
            <p className="sp-body" style={{ marginBottom: 16 }}>
              Nothing is bundled into the base installer and nothing is sent to a server.
            </p>
            <ArrowLink to={V2_PATHS.ai}>How the AI tools work</ArrowLink>
          </div>
        </div>
      </div>

      {/* Open source */}
      <div className="sp-container">
        <div
          className="sp-row"
          data-sp-reveal="stagger"
          style={{ gridTemplateColumns: "1fr 1fr", gap: 52, borderTop: "1px solid var(--sp-hairline)", padding: "64px 0 78px" }}
        >
          <div>
            <h2 className="sp-h2 sp-h2--large" style={{ lineHeight: 1.08 }}>
              Free under AGPLv3. All of it.
            </h2>
            <p className="sp-body" style={{ fontSize: 15.5, marginBottom: 22 }}>
              No trial, no tiers, no account. The full source is public — read it, build it, fork it, ship patches
              back.
            </p>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              <ArrowLink href={REPO.url}>Browse the source</ArrowLink>
              <ArrowLink to={V2_PATHS.community}>Contribute</ArrowLink>
              <ArrowLink to={V2_PATHS.roadmap}>Roadmap</ArrowLink>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              background: "linear-gradient(135deg, rgba(80,0,255,.35), rgba(0,215,182,.3))",
              border: "1px solid transparent",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {statTiles.map((tile) => (
              <div key={tile.label} style={{ background: "var(--sp-honest)", padding: 22 }}>
                <div style={{ font: "700 26px/1 'JetBrains Mono', monospace", marginBottom: 6 }}>{tile.value}</div>
                <div
                  className="sp-mono"
                  style={{
                    fontSize: 11,
                    lineHeight: 1,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
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

export default V2HomePage;
