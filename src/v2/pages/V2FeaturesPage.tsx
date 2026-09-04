import {
  AudioWaveform,
  Cpu,
  File,
  Map,
  Mic,
  Music,
  Plug,
  Scale,
  SlidersHorizontal,
  Terminal,
  Zap,
} from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { REPO, SHOTS, V2_PATHS, docPath } from "../content";
import { LiveStage, type StageId } from "../daw/stage/LiveStage";
import { ArrowLink, Cta, DownloadCta, Eyebrow, GradIcon } from "../primitives";
import { useSpReveal } from "../useSpReveal";

// Each card carries the anchor the footer links to and the doc page that
// actually goes deeper — "Read more" never loops back to this page.
const FEATURE_CARDS = [
  {
    id: "recording",
    stage: { id: "arrangement" as StageId, variant: "recording" },
    icon: Mic,
    title: "Recording & timeline editing",
    copy: "Arm tracks, monitor inputs, punch in, comp takes, and edit clips on the timeline with markers, regions, ripple, razor, and fades.",
    shot: SHOTS.recordingSession,
    alt: "Recording and timeline editing",
    to: docPath("recording-and-editing"),
  },
  {
    id: "midi",
    stage: { id: "piano-roll" as StageId },
    icon: Music,
    title: "MIDI, piano roll & instruments",
    copy: "A docked or detached piano roll, hardware MIDI input, an on-screen keyboard, step input, quantize and transforms, and audio-to-MIDI.",
    shot: SHOTS.pianoRoll,
    alt: "MIDI, piano roll and instruments",
    to: docPath("midi-and-piano-roll"),
  },
  {
    id: "mixing",
    stage: { id: "mixer" as StageId },
    icon: SlidersHorizontal,
    title: "Mixer, routing & automation",
    copy: "Channel strips, sends, buses, a routing matrix, metering, channel EQ, mixer snapshots, and automation lanes with read, write, touch, and latch.",
    shot: SHOTS.mixerMeters,
    alt: "Mixer, routing and automation",
    to: docPath("mixing-and-routing"),
  },
  {
    id: "plugins",
    icon: Plug,
    title: "Plugins: VST3 / CLAP / LV2 / ARA2",
    copy: "Native plugin windows, input / track / master FX chains, presets and A/B, sidechain routing, optional ARA2 hosting, and built-in processors.",
    shot: SHOTS.pluginHosting,
    alt: "Plugins: VST3 / CLAP / LV2 / ARA2",
    to: docPath("plugins-and-scanning"),
  },
  {
    id: "pitch",
    icon: AudioWaveform,
    title: "Graphical pitch editing",
    copy: "Note-level editing with a contour and blobs, scale and chromatic snapping, offline correction on the take, and a real-time corrector effect.",
    shot: SHOTS.pitchEditor,
    alt: "Graphical pitch editing",
    to: docPath("pitch-editing"),
  },
  {
    id: "scripting",
    icon: Terminal,
    title: "Lua scripting & extensibility",
    copy: "Script the parts of your workflow that repeat from the built-in editor, and extend the built-in processors with JSFX-style script effects.",
    shot: SHOTS.fxChainBrowser,
    alt: "Lua scripting and extensibility",
    to: docPath("lua-scripting"),
  },
  {
    id: "export",
    stage: { id: "render-dialog" as StageId },
    icon: File,
    title: "Render, formats & project files",
    copy: "Master and stem renders, region and razor bounds, WAV, AIFF, FLAC, MP3, and OGG, a render queue, DDP export, and an inspectable project file on disk.",
    shot: SHOTS.exportDialog,
    alt: "Render, formats and project files",
    to: docPath("rendering-and-export"),
  },
];

const SPOTLIGHTS = [
  {
    icon: Cpu,
    eyebrow: "Optional · Local",
    title: "AI Tools",
    copy: "Six-stem separation, and generation, variation, and continuation from a prompt — running on your machine after a guided setup, or never installed at all.",
    linkLabel: "How the AI tools work",
    to: V2_PATHS.ai,
  },
  {
    icon: Zap,
    eyebrow: "Built in · No paid tier",
    title: "NAM Rack",
    copy: "A full Neural Amp Modeler rig — captures, a native pedalboard, cabinet IRs, EQ, effects, tuner, presets — in the base app. No add-on, no paid tier.",
    linkLabel: "Explore the NAM Rack",
    to: V2_PATHS.namRack,
  },
];

const V2FeaturesPage = () => {
  useSpReveal();

  return (
    <>
      <PageSeo
        description="Every feature in OpenStudio: multitrack recording, piano roll and instruments, a full mixer, VST3/CLAP/LV2 hosting, pitch editing, Lua scripting, export, local AI tools, and the NAM Rack."
        path={V2_PATHS.features}
        robots="noindex"
        title="Features — Recording, MIDI, Mixing & Plugins | OpenStudio"
      />

      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <Eyebrow icon={Map}>What ships in the base app</Eyebrow>
        <h1 className="sp-h1">Every feature in OpenStudio.</h1>
        <p className="sp-lede" style={{ maxWidth: 680 }}>
          The map of what you get for free on Windows, macOS, and Linux. Each area links to the guide that walks
          through it, and the full inventory — including what is still partial — is public in the repository.
        </p>
        <ArrowLink href={REPO.implementedFeatures}>The complete feature inventory on GitHub</ArrowLink>
      </div>

      <div className="sp-container" style={{ paddingTop: 38 }}>
        <div className="sp-grid-2 sp-grid-2--start" data-sp-reveal="stagger">
          {FEATURE_CARDS.map((card) => (
            <div key={card.id} className="sp-card" id={card.id} style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ background: "var(--sp-frame)", padding: "10px 10px 0" }}>
                {"stage" in card && card.stage ? (
                  <LiveStage alt={card.alt} className="sp-feature-card__media" id={card.stage.id} poster={card.shot} variant={card.stage.variant} />
                ) : (
                  <img
                    alt={card.alt}
                    loading="lazy"
                    src={card.shot}
                    style={{
                      display: "block",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      objectFit: "cover",
                      objectPosition: "top left",
                      borderRadius: "10px 10px 0 0",
                    }}
                  />
                )}
              </div>
              <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    font: "700 19px/1.25 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  <GradIcon icon={card.icon} size={20} />
                  {card.title}
                </div>
                <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.6, flex: 1 }}>
                  {card.copy}
                </p>
                <span>
                  <ArrowLink to={card.to}>Read the guide</ArrowLink>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-container" style={{ paddingTop: 34 }}>
        <div className="sp-grid-2" data-sp-reveal="stagger">
          {SPOTLIGHTS.map((spotlight) => (
            <div key={spotlight.title} className="sp-card sp-card--dark" style={{ padding: "30px 32px" }}>
              <Eyebrow icon={spotlight.icon} tone="teal">
                {spotlight.eyebrow}
              </Eyebrow>
              <h2 className="sp-h2" style={{ fontSize: 28 }}>
                {spotlight.title}
              </h2>
              <p className="sp-body" style={{ fontSize: 14, color: "var(--sp-dark-body)", marginBottom: 18 }}>
                {spotlight.copy}
              </p>
              <ArrowLink to={spotlight.to} tone="teal">
                {spotlight.linkLabel}
              </ArrowLink>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-container" data-sp-reveal="stagger" style={{ paddingTop: 52, paddingBottom: 62, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <DownloadCta />
        <Cta icon={Scale} to={V2_PATHS.compare} variant="outline">
          Compare with other DAWs
        </Cta>
      </div>
    </>
  );
};

export default V2FeaturesPage;
