import { ResponsiveImage } from "@/components/ResponsiveImage";
import { AudioWaveform, Cpu, File, Map, Mic, Music, Plug, Scale, SlidersHorizontal, Terminal, Zap } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { REPO, SHOTS } from "@/data/siteContent";
import { SITE_PATHS, docPath } from "@/constants/routes";
import { LiveStage } from "@/features/daw-preview/stage/LiveStage";
import { ArrowLink, Cta, DownloadCta, Eyebrow, GradIcon } from "@/components/ui/primitives";
import { useSpReveal } from "@/hooks/useSpReveal";

// Each card carries the anchor the footer links to and the doc page that
// actually goes deeper — "Read more" never loops back to this page.
const FEATURE_CARDS = [
  {
    id: "recording",
    stage: { id: "arrangement" as const, variant: "recording" as const },
    icon: Mic,
    title: "Recording & timeline editing",
    copy: "Arm tracks, monitor inputs, punch in, comp takes, and edit clips on the timeline with markers, regions, ripple, razor, and fades.",
    shot: SHOTS.recordingSession,
    alt: "Recording and timeline editing",
    to: docPath("recording-and-editing"),
  },
  {
    id: "midi",
    stage: { id: "piano-roll" as const },
    icon: Music,
    title: "MIDI, piano roll & instruments",
    copy: "A docked or detached piano roll, hardware MIDI input, an on-screen keyboard, step input, quantize and transforms, and audio-to-MIDI.",
    shot: SHOTS.pianoRoll,
    alt: "MIDI, piano roll and instruments",
    to: docPath("midi-and-piano-roll"),
  },
  {
    id: "mixing",
    stage: { id: "mixer" as const },
    icon: SlidersHorizontal,
    title: "Mixer, routing & automation",
    copy: "Channel strips, sends, buses, a routing matrix, metering, channel EQ, mixer snapshots, and automation lanes with read, write, touch, and latch.",
    shot: SHOTS.mixerMeters,
    alt: "Mixer, routing and automation",
    to: docPath("mixing-and-routing"),
  },
  {
    id: "plugins",
    stage: { id: "plugin-window" as const },
    icon: Plug,
    title: "Plugins: VST3 / CLAP / LV2 / ARA2",
    copy: "Native plugin windows, input / track / master FX chains, presets and A/B, sidechain routing, optional ARA2 hosting, and built-in processors.",
    shot: SHOTS.pluginHosting,
    alt: "Plugins: VST3 / CLAP / LV2 / ARA2",
    to: docPath("plugins-and-scanning"),
  },
  {
    id: "pitch",
    stage: { id: "pitch-editor" as const },
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
    stage: { id: "render-dialog" as const },
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
    copy: "Six-stem separation, plus generation, variation, and continuation from a prompt. It runs on your machine after a guided setup, or you simply never install it.",
    linkLabel: "How the AI tools work",
    to: SITE_PATHS.ai,
  },
  {
    icon: Zap,
    eyebrow: "Built in · No paid tier",
    title: "NAM Rack",
    copy: "A full Neural Amp Modeler rig in the base app: captures, a native pedalboard, cabinet IRs, EQ, effects, a tuner, and presets. There is no add-on and no paid tier.",
    linkLabel: "Explore the NAM Rack",
    to: SITE_PATHS.namRack,
  },
];

const FeaturesPage = () => {
  useSpReveal();

  return (
    <>
      <PageSeo
        description="Every feature in OpenStudio: multitrack recording, piano roll and instruments, a full mixer, VST3/CLAP/LV2 hosting, pitch editing, Lua scripting, export, local AI tools, and the NAM Rack."
        path={SITE_PATHS.features}
        title="Features: Recording, MIDI, Mixing & Plugins | OpenStudio"
      />

      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <Eyebrow icon={Map}>What ships in the base app</Eyebrow>
        <h1 className="sp-h1">Every feature in OpenStudio.</h1>
        <p className="sp-lede max-w-[680px]">
          The map of what you get for free on Windows, macOS, and Linux. Each area links to the guide that walks through
          it, and the full inventory, including what is still partial, is public in the repository.
        </p>
        <ArrowLink href={REPO.implementedFeatures}>The complete feature inventory on GitHub</ArrowLink>
      </div>

      <div className="sp-container pt-[38px]">
        <div className="sp-grid-2 sp-grid-2--start" data-sp-reveal="stagger">
          {FEATURE_CARDS.map((card) => (
            <div key={card.id} className="sp-card overflow-hidden flex flex-col" id={card.id}>
              <div className="[background:var(--sp-frame)] p-[10px_10px_0]">
                {"stage" in card && card.stage ? (
                  <LiveStage alt={card.alt} className="sp-feature-card__media" {...card.stage} poster={card.shot} />
                ) : (
                  <ResponsiveImage
                    className="block w-full [aspect-ratio:16_/_9] object-cover [object-position:top_left] rounded-[10px_10px_0_0]"
                    alt={card.alt}
                    loading="lazy"
                    src={card.shot}
                  />
                )}
              </div>
              <div className="p-[20px_22px_22px] flex flex-col gap-[9px] flex-1">
                <div className="flex items-center gap-[10px] [font:700_19px/1.25_'Space_Grotesk',_sans-serif] tracking-[-0.02em]">
                  <GradIcon icon={card.icon} size={20} />
                  {card.title}
                </div>
                <p className="sp-body text-[13.5px] leading-[1.6] flex-1">{card.copy}</p>
                <span>
                  <ArrowLink to={card.to}>Read the guide</ArrowLink>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-container pt-[34px]">
        <div className="sp-grid-2" data-sp-reveal="stagger">
          {SPOTLIGHTS.map((spotlight) => (
            <div
              key={spotlight.title}
              id={spotlight.title === "NAM Rack" ? "nam-rack" : "ai-tools"}
              className="sp-card sp-card--dark p-[30px_32px]"
            >
              <Eyebrow icon={spotlight.icon} tone="teal">
                {spotlight.eyebrow}
              </Eyebrow>
              <h2 className="sp-h2 text-[28px]">{spotlight.title}</h2>
              <p className="sp-body text-[14px] text-[var(--sp-dark-body)] mb-[18px]">{spotlight.copy}</p>
              <ArrowLink to={spotlight.to} tone="teal">
                {spotlight.linkLabel}
              </ArrowLink>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-container pt-[52px] pb-[62px] flex items-center gap-[16px] flex-wrap" data-sp-reveal="stagger">
        <DownloadCta />
        <Cta icon={Scale} to={SITE_PATHS.compare} variant="outline">
          Compare with other DAWs
        </Cta>
      </div>
    </>
  );
};

export default FeaturesPage;
