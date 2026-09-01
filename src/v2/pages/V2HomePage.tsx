import {
  AudioWaveform,
  Cpu,
  Download,
  Mic,
  Monitor,
  Music,
  Plug,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Tag,
  Terminal,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { SHOTS, V2_PATHS, VERSION_LABEL, SIZE_LABEL } from "../content";
import { ArrowLink, Cta, Eyebrow, Frame, GradIcon } from "../primitives";

const NAM_CHIPS = [
  "NAM A1 / A2",
  "Pre-FX pedalboard",
  "Cabinet IR",
  "Graphic EQ",
  "Tuner",
  "TONE3000",
  "Offline render",
];

const SESSION_ROWS = [
  {
    number: "01",
    icon: Mic,
    title: "Record & arrange",
    copy: "Arm tracks, monitor inputs, punch in, and edit clips on the same timeline. Markers, regions, ripple, razor, takes, and fades.",
    shot: SHOTS.recordingSession,
    alt: "Recording session",
    imageFirst: false,
  },
  {
    number: "02",
    icon: Music,
    title: "MIDI & instruments",
    copy: "A docked or detached piano roll, hardware MIDI input, an on-screen keyboard, quantize and transforms, and audio-to-MIDI when an idea needs it.",
    shot: SHOTS.pianoRoll,
    alt: "Piano roll",
    imageFirst: true,
  },
  {
    number: "03",
    icon: SlidersHorizontal,
    title: "Mix & route",
    copy: "Channel strips, sends, buses, a routing matrix, metering, channel EQ, and mixer snapshots. Detach the mixer onto a second screen.",
    shot: SHOTS.mixerMeters,
    alt: "Mixer",
    imageFirst: false,
  },
  {
    number: "04",
    icon: AudioWaveform,
    title: "Pitch editing",
    copy: "Graphical note editing, polyphonic detection, and real-time correction on the take, in the arrangement — not in a separate app.",
    shot: SHOTS.pitchEditor,
    alt: "Pitch editor",
    imageFirst: true,
  },
];

const STAT_TILES = [
  { value: "0,000", label: "GitHub stars", icon: Star },
  { value: "00", label: "Releases", icon: Tag },
  { value: "AGPLv3", label: "License", icon: Scale },
  { value: "00", label: "Contributors", icon: Users },
];

const V2HomePage = () => (
  <>
    <PageSeo
      description="A free, open-source DAW with a built-in Neural Amp Modeler guitar rig, multitrack recording, MIDI, plugin hosting, pitch editing, and optional local AI stem separation. AGPLv3."
      path={V2_PATHS.home}
      robots="noindex"
      title="OpenStudio — Free Open-Source DAW for Windows, macOS & Linux"
    />

    {/* Hero */}
    <div className="sp-container">
      <div className="sp-split" style={{ gridTemplateColumns: "1.05fr .95fr", paddingTop: 72 }}>
        <div>
          <Eyebrow icon={ShieldCheck}>
            Free · Open source · AGPLv3
          </Eyebrow>
          <h1 className="sp-h1 sp-h1--hero">A free DAW with a real amp rig built in.</h1>
          <p className="sp-lede" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 520, marginBottom: 28 }}>
            Record, sequence, edit, mix, and render — plus a Neural Amp Modeler guitar rack, graphical pitch
            editing, and optional local AI, all inside the project.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
            <Cta icon={Download} to={V2_PATHS.download}>
              Download for macOS
            </Cta>
            <ArrowLink to={V2_PATHS.features} tone="plain">
              See all features
            </ArrowLink>
          </div>
          <div className="sp-mono" style={{ lineHeight: 1 }}>
            {VERSION_LABEL} · {SIZE_LABEL} · released 00 Aug 2026 · also Windows and Linux
          </div>
        </div>
        <Frame alt="OpenStudio timeline" hero src={SHOTS.heroTimeline} />
      </div>
    </div>

    {/* Proof strip */}
    <div
      className="sp-grid-4"
      style={{
        gap: 0,
        borderTop: "1px solid var(--sp-hairline)",
        borderBottom: "1px solid var(--sp-hairline)",
        marginTop: 52,
      }}
    >
      {[
        { icon: Mic, label: "Multitrack recording", accent: false },
        { icon: Plug, label: "VST3 / CLAP / LV2", accent: false },
        { icon: Zap, label: "Built-in NAM Rack", accent: true },
        { icon: Cpu, label: "Local AI stem separation", accent: false },
      ].map((item, index) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "20px 34px",
            font: "500 13px/1 'Space Grotesk', sans-serif",
            borderRight: index < 3 ? "1px solid var(--sp-hairline)" : undefined,
            color: item.accent ? "var(--sp-accent)" : undefined,
          }}
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

    {/* NAM Rack set piece (dark) */}
    <section className="sp-dark-panel">
      <div className="sp-container" style={{ paddingTop: 78, paddingBottom: 78 }}>
        <div className="sp-row" style={{ gridTemplateColumns: ".85fr 1.15fr", gap: 52 }}>
          <div>
            <Eyebrow icon={Zap} tone="teal">
              Built in · No add-on · No paid tier
            </Eyebrow>
            <h2 className="sp-h2" style={{ fontSize: 42, lineHeight: 1.08, marginBottom: 16 }}>
              Plug in and the rig is already there.
            </h2>
            <p className="sp-body" style={{ fontSize: 15.5, color: "var(--sp-dark-body)", marginBottom: 26 }}>
              Load any Neural Amp Modeler capture, stack native pedals in front of it, drop a cabinet IR behind
              it, and A/B two chains against each other. Presets recall with the project, and it renders offline
              with the rest of the mix.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
              {NAM_CHIPS.map((chip) => (
                <span
                  key={chip}
                  style={{
                    font: "400 11.5px/1 'JetBrains Mono', monospace",
                    color: "#d4d8e0",
                    border: "1px solid rgba(255,255,255,.18)",
                    borderRadius: 4,
                    padding: "8px 11px",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
            <Cta to={V2_PATHS.namRack}>Explore the NAM Rack</Cta>
          </div>
          <div className="sp-card sp-card--dark" style={{ overflow: "hidden" }}>
            <img alt="NAM Rack signal chain" loading="lazy" src={SHOTS.namRackSignalChain} style={{ display: "block", width: "100%" }} />
          </div>
        </div>
        <p
          style={{
            font: "400 12px/1.65 'JetBrains Mono', monospace",
            color: "var(--sp-dark-muted)",
            margin: "26px 0 0",
            maxWidth: 720,
          }}
        >
          No paid NAM Rack tier and no separate runtime. Third-party captures and IRs are distributed by their
          creators and keep their own licenses. Authenticated TONE3000 delivery requires a TONE3000 account.
        </p>
      </div>
    </section>

    {/* The full session */}
    <div className="sp-container" style={{ paddingTop: 78 }}>
      <h2 className="sp-h2" style={{ fontSize: 44, lineHeight: 1.05, maxWidth: 620 }}>
        One project, from first take to final render.
      </h2>
      <p className="sp-lede" style={{ fontSize: 16, maxWidth: 560, marginBottom: 40 }}>
        Recording, MIDI, editing, pitch work, mixing, and export live in the same window. No round trips, no
        exporting a clip to a separate tool and importing it back.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 34, paddingBottom: 78 }}>
        {SESSION_ROWS.map((row) => {
          const copyBlock = (
            <div key="copy">
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
              <p className="sp-body">{row.copy}</p>
            </div>
          );
          const imageBlock = <Frame key="image" alt={row.alt} src={row.shot} />;

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
      <div className="sp-row" style={{ gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--sp-hairline)", paddingBottom: 78, alignItems: "start" }}>
        <div style={{ padding: "44px 40px 0 0", borderRight: "1px solid var(--sp-hairline)" }}>
          <h2 className="sp-h2" style={{ lineHeight: 1.12 }}>
            Your plugins, hosted natively.
          </h2>
          <p className="sp-body">
            VST3, CLAP, and LV2 in their own native windows, with input FX, track FX, and master FX chains, plus
            optional ARA2 hosting. Built-in processors and Lua-scriptable ones cover the rest.
          </p>
        </div>
        <div style={{ padding: "44px 0 0 40px" }}>
          <Eyebrow icon={Cpu}>
            Optional · Local · Offline after setup
          </Eyebrow>
          <h2 className="sp-h2" style={{ lineHeight: 1.12 }}>
            Six stems, without leaving the project.
          </h2>
          <p className="sp-body" style={{ marginBottom: 14 }}>
            Install the AI Runtime once and BS Roformer separates vocals, drums, bass, guitar, piano, and other
            locally. ACE-Step generates from a prompt and lyrics.
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
        style={{ gridTemplateColumns: "1fr 1fr", gap: 52, borderTop: "1px solid var(--sp-hairline)", padding: "64px 0" }}
      >
        <div>
          <h2 className="sp-h2" style={{ fontSize: 40, lineHeight: 1.08 }}>
            Free under AGPLv3. All of it.
          </h2>
          <p className="sp-body" style={{ fontSize: 15.5, marginBottom: 22 }}>
            No trial, no tiers, no account. The full source is public — read it, build it, fork it, ship patches
            back.
          </p>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <ArrowLink href="https://github.com/sdevil7th/OpenStudio">Browse the source</ArrowLink>
            <ArrowLink to={V2_PATHS.community}>Contribute</ArrowLink>
            <ArrowLink to={V2_PATHS.community}>Roadmap</ArrowLink>
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
          {STAT_TILES.map((tile) => (
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

    {/* Get started (dark) */}
    <section style={{ background: "linear-gradient(120deg, #120157 0%, #131b26 52%, #002b1e 100%)", color: "#f7f8fa" }}>
      <div className="sp-container" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div className="sp-row" style={{ gridTemplateColumns: "1fr 1fr", gap: 52 }}>
          <div>
            <h2 className="sp-h2" style={{ fontSize: 36, lineHeight: 1.1, marginBottom: 20 }}>
              Download, then open the first-session guide.
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <Cta icon={Download} to={V2_PATHS.download} variant="paper">
                Download for macOS
              </Cta>
              <Cta icon={Monitor} to={V2_PATHS.download} variant="ghost-dark">
                Windows
              </Cta>
              <Cta icon={Terminal} to={V2_PATHS.download} variant="ghost-dark">
                Linux
              </Cta>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", font: "500 13px/1 'Space Grotesk', sans-serif", color: "var(--sp-dark-body)" }}>
              <ArrowLink to={V2_PATHS.docsGettingStarted} tone="teal">
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
              <ArrowLink to={V2_PATHS.download} tone="teal">
                Here&rsquo;s exactly what to expect and why
              </ArrowLink>
            </p>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default V2HomePage;
