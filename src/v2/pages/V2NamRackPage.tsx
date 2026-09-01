import { AudioWaveform, Book, Download, Folder, Key, Speaker, Zap } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { SHOTS, V2_PATHS, VERSION_LABEL, SIZE_LABEL } from "../content";
import { ArrowLink, Cta, Eyebrow, Frame, GradIcon, HonestCallout, Kicker } from "../primitives";

const CHAIN_STAGES = [
  { label: "01 Tuner", shot: SHOTS.namRackTuner, alt: "Tuner" },
  { label: "02 Pre-FX pedalboard", shot: SHOTS.namRackPreFx, alt: "Pre-FX pedalboard" },
  { label: "03 NAM amp · A1/A2", shot: SHOTS.namRackOverview, alt: "NAM amp · A1/A2" },
  { label: "04 Cabinet IR", shot: SHOTS.namRackCabinetIr, alt: "Cabinet IR" },
  { label: "05 Graphic EQ", shot: SHOTS.namRackGraphicEq, alt: "Graphic EQ" },
  { label: "06 Post-FX", shot: SHOTS.namRackPostFx, alt: "Post-FX" },
];

const RACK_BLOCKS = [
  {
    icon: Folder,
    title: "Bring your own captures",
    copy: (
      <>
        Any <code className="sp-code" style={{ fontSize: 12.5 }}>.nam</code> file loads. TONE3000 discovery is
        built in; a connected account is optional.
      </>
    ),
  },
  {
    icon: Speaker,
    title: "Cabinet IRs",
    copy: "Load standard impulse responses, or run the amp captures cab-less when the capture already has the cab in it.",
  },
  {
    icon: Key,
    title: "Presets and A/B",
    copy: "Save chains, compare two instantly, and recall them with the project.",
  },
  {
    icon: AudioWaveform,
    title: "Renders with the mix",
    copy: "Not a monitoring-only effect. It prints, offline, with everything else.",
  },
];

const BLOG_CARDS = [
  {
    title: "Building the OpenStudio NAM Rack",
    date: "26 Jul 2026",
    shot: SHOTS.namRackSignalChain,
    slug: "/blogs/building-openstudio-nam-rack",
  },
  {
    title: "Build better guitar tones with the NAM Rack",
    date: "28 Aug 2026",
    shot: SHOTS.namRackGraphicEq,
    slug: "/blogs/build-guitar-tones-with-openstudio-nam-rack",
  },
];

const V2NamRackPage = () => (
  <>
    <PageSeo
      description="OpenStudio ships a full Neural Amp Modeler rack — NAM A1/A2 captures, native pedals, cabinet IRs, graphic EQ, tuner, presets, and offline render. Free, built in, no add-on runtime."
      path={V2_PATHS.namRack}
      robots="noindex"
      title="NAM Rack — Free Neural Amp Modeler Guitar Rig Inside a DAW | OpenStudio"
    />

    {/* Hero */}
    <div className="sp-container">
      <div className="sp-split" style={{ gridTemplateColumns: "1.05fr .95fr", paddingTop: 64 }}>
        <div>
          <Eyebrow icon={Zap}>Included in the base app</Eyebrow>
          <h1 className="sp-h1">A full amp rig, inside the DAW.</h1>
          <p className="sp-lede" style={{ maxWidth: 540 }}>
            Most free DAWs send you to a plugin for tone. OpenStudio ships the rack: Neural Amp Modeler captures,
            pedals in front, a cabinet IR behind, EQ and effects after, and a tuner where you need it. It recalls
            with the project and renders with the mix.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
            <Cta icon={Download} to={V2_PATHS.download}>
              Download OpenStudio
            </Cta>
            <ArrowLink to={V2_PATHS.docs}>Set up your first tone</ArrowLink>
          </div>
          <div className="sp-mono">
            {VERSION_LABEL} · {SIZE_LABEL} · Windows · macOS · Linux
          </div>
        </div>
        <Frame alt="The OpenStudio NAM Rack amp page" hero src={SHOTS.namRackOverview} />
      </div>
    </div>

    {/* Signal chain */}
    <div className="sp-container" style={{ paddingTop: 52 }}>
      <Kicker>Signal chain · left to right</Kicker>
      <h2 className="sp-h2">Tuner → Pre-FX → NAM amp → Cabinet IR → EQ → Post-FX</h2>
      <p className="sp-body" style={{ maxWidth: 700, marginBottom: 14 }}>
        Every stage is native. Nothing here is a hosted third-party plugin.
      </p>
    </div>
    <div className="sp-container" style={{ paddingTop: 26 }}>
      <div className="sp-chain-grid">
        {CHAIN_STAGES.map((stage) => (
          <div key={stage.label} className="sp-card sp-card--tight" style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "9px 11px",
                font: "500 9.5px/1.3 'JetBrains Mono', monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--sp-accent)",
                borderBottom: "1px solid var(--sp-hairline)",
              }}
            >
              {stage.label}
            </div>
            <img
              alt={stage.alt}
              loading="lazy"
              src={stage.shot}
              style={{ display: "block", width: "100%", height: 104, objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </div>

    {/* Capability blocks */}
    <div className="sp-container" style={{ paddingTop: 46 }}>
      <div className="sp-grid-4">
        {RACK_BLOCKS.map((block) => (
          <div key={block.title} className="sp-card sp-card--tight" style={{ padding: "22px 22px 24px" }}>
            <div style={{ marginBottom: 12 }}>
              <GradIcon icon={block.icon} size={22} />
            </div>
            <div style={{ font: "700 17px/1.25 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 8 }}>
              {block.title}
            </div>
            <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
              {block.copy}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Preset library */}
    <div className="sp-container" style={{ paddingTop: 46 }}>
      <div className="sp-row" style={{ gridTemplateColumns: "1.15fr .85fr" }}>
        <Frame alt="The NAM Rack preset library" src={SHOTS.namRackPresetLibrary} />
        <div>
          <Kicker>Preset library</Kicker>
          <h2 className="sp-h2" style={{ fontSize: 30 }}>
            Your tones, recalled with the project.
          </h2>
          <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
            Save a whole chain — capture, pedals, cab, EQ, post-FX — and pull it back on the next session. Two
            chains can sit side by side for an instant A/B.
          </p>
        </div>
      </div>
    </div>

    {/* TONE3000 */}
    <div className="sp-container" style={{ paddingTop: 46 }}>
      <div className="sp-row" style={{ gridTemplateColumns: ".9fr 1.1fr" }}>
        <div>
          <Kicker>TONE3000</Kicker>
          <h2 className="sp-h2" style={{ fontSize: 30 }}>
            Find captures without leaving the rack.
          </h2>
          <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
            Browse and pull captures from TONE3000 in-app. A connected account is optional and only needed for
            authenticated delivery.
          </p>
        </div>
        <Frame alt="The TONE3000 capture browser inside OpenStudio" src={SHOTS.tone3000Browser} />
      </div>
    </div>

    {/* Honest block */}
    <div className="sp-container" style={{ paddingTop: 46 }}>
      <HonestCallout>
        There is no paid NAM Rack tier and no separate runtime to install. Third-party captures and IRs are
        distributed by their creators and keep their own licenses. Authenticated TONE3000 delivery requires a
        TONE3000 account.
      </HonestCallout>
    </div>

    {/* From the blog */}
    <div className="sp-container" style={{ paddingTop: 46 }}>
      <Kicker>From the blog</Kicker>
      <div className="sp-grid-2" style={{ gap: 18 }}>
        {BLOG_CARDS.map((card) => (
          <a key={card.slug} className="sp-card sp-card--tight" href={card.slug} style={{ overflow: "hidden", display: "flex" }}>
            <img
              alt={card.title}
              loading="lazy"
              src={card.shot}
              style={{ width: 150, height: 100, objectFit: "cover", display: "block", flex: "none" }}
            />
            <div style={{ padding: "16px 18px" }}>
              <div style={{ font: "700 15px/1.3 'Space Grotesk', sans-serif", letterSpacing: "-0.01em", marginBottom: 6 }}>
                {card.title}
              </div>
              <div className="sp-mono">{card.date}</div>
            </div>
          </a>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="sp-container" style={{ padding: "52px 34px 62px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <Cta icon={Download} to={V2_PATHS.download}>
        Download OpenStudio
      </Cta>
      <Cta icon={Book} to={V2_PATHS.docs} variant="outline">
        NAM Rack setup guide
      </Cta>
    </div>
  </>
);

export default V2NamRackPage;
