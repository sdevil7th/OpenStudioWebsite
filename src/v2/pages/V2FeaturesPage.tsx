import {
  AudioWaveform,
  Cpu,
  Download,
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
import { SHOTS, V2_PATHS } from "../content";
import { ArrowLink, Cta, Eyebrow, GradIcon } from "../primitives";

const FEATURE_CARDS = [
  {
    icon: Mic,
    title: "Recording & timeline editing",
    copy: "Arm tracks, monitor inputs, punch in, comp takes, and edit clips on the timeline with markers, regions, ripple, razor, and fades.",
    shot: SHOTS.recordingSession,
    alt: "Recording and timeline editing",
  },
  {
    icon: Music,
    title: "MIDI, piano roll & instruments",
    copy: "A docked or detached piano roll, hardware MIDI input, an on-screen keyboard, quantize and transforms, and audio-to-MIDI.",
    shot: SHOTS.pianoRoll,
    alt: "MIDI, piano roll and instruments",
  },
  {
    icon: SlidersHorizontal,
    title: "Mixer, routing & automation",
    copy: "Channel strips, sends, buses, a routing matrix, metering, channel EQ, mixer snapshots, and automation lanes.",
    shot: SHOTS.mixerMeters,
    alt: "Mixer, routing and automation",
  },
  {
    icon: Plug,
    title: "Plugins: VST3 / CLAP / LV2 / ARA2",
    copy: "Native plugin windows, input / track / master FX chains, optional ARA2 hosting, and built-in processors.",
    shot: SHOTS.pluginHosting,
    alt: "Plugins: VST3 / CLAP / LV2 / ARA2",
  },
  {
    icon: AudioWaveform,
    title: "Graphical pitch editing",
    copy: "Note-level editing, polyphonic detection, and real-time correction on the take, inside the arrangement.",
    shot: SHOTS.pitchEditor,
    alt: "Graphical pitch editing",
  },
  {
    icon: Terminal,
    title: "Lua scripting & extensibility",
    copy: "Script the parts of your workflow that repeat, and extend the built-in processors with Lua.",
    shot: SHOTS.fxChainBrowser,
    alt: "Lua scripting and extensibility",
  },
  {
    icon: File,
    title: "Render, formats & project files",
    copy: "Stem and master render, the formats you need for delivery, and an inspectable project file on disk.",
    shot: SHOTS.exportDialog,
    alt: "Render, formats and project files",
  },
];

const SPOTLIGHTS = [
  {
    icon: Zap,
    eyebrow: "The differentiator",
    title: "NAM Rack",
    copy: "A full Neural Amp Modeler rig — captures, pedals, cabinet IRs, EQ, tuner, presets — built into the base app. No add-on, no paid tier.",
    linkLabel: "Explore the NAM Rack",
    to: V2_PATHS.namRack,
  },
  {
    icon: Cpu,
    eyebrow: "Optional · Local",
    title: "AI Tools",
    copy: "Six-stem separation and text-to-music that run on your machine, offline after setup — or never download them at all.",
    linkLabel: "How the AI tools work",
    to: V2_PATHS.ai,
  },
];

const V2FeaturesPage = () => (
  <>
    <PageSeo
      description="Every feature in OpenStudio: multitrack recording, piano roll and instruments, a full mixer, VST3/CLAP/LV2 hosting, pitch editing, Lua scripting, and export."
      path={V2_PATHS.features}
      robots="noindex"
      title="Features — Recording, MIDI, Mixing & Plugins | OpenStudio"
    />

    <div className="sp-container" style={{ paddingTop: 64 }}>
      <Eyebrow icon={Map}>Eleven categories, seven doors</Eyebrow>
      <h1 className="sp-h1">Every feature in OpenStudio.</h1>
      <p className="sp-lede" style={{ maxWidth: 680 }}>
        The full map of what ships in the base app — free, on Windows, macOS, and Linux. Each area links to its
        own page with screenshots and the exact capability list.
      </p>
    </div>

    <div className="sp-container" style={{ paddingTop: 38 }}>
      <div className="sp-grid-2">
        {FEATURE_CARDS.map((card) => (
          <div key={card.title} className="sp-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "var(--sp-frame)", padding: "10px 10px 0" }}>
              <img
                alt={card.alt}
                loading="lazy"
                src={card.shot}
                style={{ display: "block", width: "100%", borderRadius: "10px 10px 0 0" }}
              />
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
                <ArrowLink to={V2_PATHS.features}>Read more</ArrowLink>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="sp-container" style={{ paddingTop: 34 }}>
      <div className="sp-grid-2">
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

    <div className="sp-container" style={{ padding: "52px 34px 62px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <Cta icon={Download} to={V2_PATHS.download}>
        Download for macOS
      </Cta>
      <Cta icon={Scale} to={V2_PATHS.compare} variant="outline">
        Compare with other DAWs
      </Cta>
    </div>
  </>
);

export default V2FeaturesPage;
