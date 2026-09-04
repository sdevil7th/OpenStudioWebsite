import { AudioWaveform, Book, Download, Key, SlidersHorizontal, Speaker, Zap } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { blogPosts } from "@/data/blogs";
import { REPO, SHOTS, TONE3000_URL, V2_PATHS, blogPostPath, docPath } from "../content";
import { LiveStage } from "../daw/stage/LiveStage";
import { formatBytes, formatDate } from "../format";
import { ArrowLink, Cta, DownloadCta, Eyebrow, Frame, GradIcon, HonestCallout, Kicker, renderInline } from "../primitives";
import { usePlatform } from "../usePlatform";
import { useReleaseInfo } from "../useReleaseInfo";
import { useSpReveal } from "../useSpReveal";

// Each tile is the real rack, cropped to its hardware page.
const CHAIN_STAGES = [
  { label: "01 Tuner", shot: SHOTS.namRackTuner, alt: "Tuner", variant: "amp+tuner" },
  { label: "02 Pre-FX pedalboard", shot: SHOTS.namRackPreFx, alt: "Pre-FX pedalboard", variant: "pre" },
  { label: "03 NAM amp · A1/A2", shot: SHOTS.namRackOverview, alt: "NAM amp · A1/A2", variant: "amp" },
  { label: "04 Cabinet IR", shot: SHOTS.namRackCabinetIr, alt: "Cabinet IR", variant: "cab" },
  { label: "05 Graphic EQ", shot: SHOTS.namRackGraphicEq, alt: "Graphic EQ", variant: "eq" },
  { label: "06 Post-FX", shot: SHOTS.namRackPostFx, alt: "Post-FX", variant: "post" },
];

// One card for the captures themselves (NAM + TONE3000); the other three are
// the stages OpenStudio builds around them.
const RACK_BLOCKS = [
  {
    icon: Download,
    title: "Download captures",
    copy: `Browse TONE3000 tone packs inside the rack, audition a capture through your live input, then **Use** it. Any local \`.nam\` file loads too — NAM A1 and A2 pedal, amp, and full-rig captures. A [TONE3000](${TONE3000_URL}) account is optional and only needed for its catalog.`,
  },
  {
    icon: SlidersHorizontal,
    title: "Native pedalboard",
    copy: "A gate, Compressor, Stereo Poly Octaver, PRE EQ, Precision Drive, and Distortion sit in front of the amp, with Guitar and Bass voicings that follow the instrument without rewriting your settings.",
  },
  {
    icon: Speaker,
    title: "Cabinet IR & Cabinet Space",
    copy: "Load any impulse response behind an amp-only capture. Full-rig captures bypass the cab stage automatically and keep your IR for later. Cabinet Space adds an early room and a doubler after the cab.",
  },
  {
    icon: Key,
    title: "EQ, effects, tuner, presets",
    copy: "A nine-band Graphic EQ, reorderable modulation, delay, and reverb (Studio, Plate, Hall, Room), a tuner that stays off the audible path, and presets with A/B that recall with the project.",
  },
];

const BLOG_SLUGS = ["building-openstudio-nam-rack", "build-guitar-tones-with-openstudio-nam-rack"];

const V2NamRackPage = () => {
  const platform = usePlatform();
  const release = useReleaseInfo();

  useSpReveal();

  const size = platform ? formatBytes(release?.platforms[platform].size) : null;
  const meta = [release ? `v${release.version}` : null, size, "Windows · macOS · Linux"].filter(Boolean).join(" · ");
  const posts = BLOG_SLUGS.map((slug) => blogPosts.find((post) => post.slug === slug)).filter(
    (post): post is (typeof blogPosts)[number] => Boolean(post),
  );

  return (
    <>
      <PageSeo
        description="OpenStudio ships a full Neural Amp Modeler rack — NAM A1/A2 captures, TONE3000 browsing, a native pedalboard, cabinet IRs, graphic EQ, effects, tuner, presets, and offline render. Free, built in, no add-on runtime."
        path={V2_PATHS.namRack}
        robots="noindex"
        title="NAM Rack — Free Neural Amp Modeler Guitar Rig Inside a DAW | OpenStudio"
      />

      {/* Hero */}
      <div className="sp-container">
        <div className="sp-split" style={{ gridTemplateColumns: "1.05fr .95fr", paddingTop: 64 }}>
          <div data-sp-reveal="hero">
            <Eyebrow icon={Zap}>Included in the base app</Eyebrow>
            <h1 className="sp-h1">A full amp rig, inside the DAW.</h1>
            <p className="sp-lede" style={{ maxWidth: 540 }}>
              Most free DAWs send you to a plugin for tone. OpenStudio ships the rack: Neural Amp Modeler captures,
              a native pedalboard in front, a cabinet IR behind, EQ and effects after, and a tuner where you need
              it. It recalls with the project and renders with the mix.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
              <DownloadCta />
              <ArrowLink to={docPath("nam-rack-setup")}>Set up your first tone</ArrowLink>
            </div>
            <div className="sp-mono">{meta}</div>
          </div>
          <Frame hero reveal="media-right">
            <LiveStage alt="The OpenStudio NAM Rack amp page" eager id="nam-rack" poster={SHOTS.namRackOverview} priority={1} variant="amp+tour" />
          </Frame>
        </div>
      </div>

      {/* Signal chain */}
      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 52 }}>
        <Kicker>Signal chain · left to right</Kicker>
        <h2 className="sp-h2">Tuner → Pre-FX → NAM amp → Cabinet IR → EQ → Post-FX</h2>
        <p className="sp-body" style={{ maxWidth: 700, marginBottom: 14 }}>
          Every stage is native. Nothing here is a hosted third-party plugin.
        </p>
      </div>
      <div className="sp-container" style={{ paddingTop: 26 }}>
        <div className="sp-chain-grid" data-sp-reveal="flow">
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
              <LiveStage alt={stage.alt} className="sp-chain-grid__stage" id="nam-rack" poster={stage.shot} variant={stage.variant} />
            </div>
          ))}
        </div>
      </div>

      {/* Capability blocks */}
      <div className="sp-container" style={{ paddingTop: 46 }}>
        <div className="sp-grid-4" data-sp-reveal="stagger">
          {RACK_BLOCKS.map((block) => (
            <div key={block.title} className="sp-card sp-card--tight" style={{ padding: "22px 22px 24px" }}>
              <div style={{ marginBottom: 12 }}>
                <GradIcon icon={block.icon} size={22} />
              </div>
              <div style={{ font: "700 17px/1.25 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 8 }}>
                {block.title}
              </div>
              <p className="sp-body" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
                {renderInline(block.copy)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Preset library */}
      <div className="sp-container" style={{ paddingTop: 46 }}>
        <div className="sp-row" style={{ gridTemplateColumns: "1.15fr .85fr" }}>
          <Frame alt="The NAM Rack preset library" reveal="media-left" src={SHOTS.namRackPresetLibrary} />
          <div>
            <Kicker>Preset library</Kicker>
            <h2 className="sp-h2" style={{ fontSize: 30 }}>
              Your tones, recalled with the project.
            </h2>
            <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
              Save a whole chain — capture, pedals, cab, EQ, post-FX — and pull it back on the next session. Two
              chains can sit side by side for an instant A/B. Presets reference your capture and IR files rather
              than embedding them, so a library stays small.
            </p>
            <ArrowLink to={`${docPath("nam-rack-setup")}#presets`}>Presets, A/B, and recall</ArrowLink>
          </div>
        </div>
      </div>

      {/* TONE3000 */}
      <div className="sp-container" style={{ paddingTop: 46 }}>
        <div className="sp-row" style={{ gridTemplateColumns: ".9fr 1.1fr" }}>
          <div data-sp-reveal="rise">
            <Kicker>TONE3000</Kicker>
            <h2 className="sp-h2" style={{ fontSize: 30 }}>
              Find captures without leaving the rack.
            </h2>
            <p className="sp-body" style={{ maxWidth: 420, marginBottom: 14 }}>
              Search TONE3000 tone packs in-app, open a pack to see each capture and whether it is amp-only or has
              the cab embedded, audition through your live input, and commit the one you like. Sign-in happens in
              your browser; local <code className="sp-inline-code">.nam</code> files never need it.
            </p>
            <ArrowLink href={TONE3000_URL}>About TONE3000</ArrowLink>
          </div>
          <Frame alt="The TONE3000 capture browser inside OpenStudio" reveal="media-right" src={SHOTS.tone3000Browser} />
        </div>
      </div>

      {/* Honest block */}
      <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 46 }}>
        <HonestCallout>
          There is no paid NAM Rack tier and no separate runtime to install. Third-party captures and IRs are
          distributed by their creators and keep their own licenses; OpenStudio bundles none. Public availability
          of the connected TONE3000 catalog depends on partner approval for each release — local captures always
          work. Full engineering detail is in the{" "}
          <a className="sp-text-link" href={REPO.namRackDoc} rel="noreferrer" target="_blank">
            NAM Rack guide on GitHub
          </a>
          .
        </HonestCallout>
      </div>

      {/* From the blog */}
      {posts.length > 0 ? (
        <div className="sp-container" style={{ paddingTop: 46 }}>
          <Kicker>From the blog</Kicker>
          <div className="sp-grid-2" data-sp-reveal="stagger" style={{ gap: 18 }}>
            {posts.map((post) => (
              <a key={post.slug} className="sp-card sp-card--tight sp-blog-mini" href={blogPostPath(post.slug)}>
                {post.image ? (
                  <img alt={post.imageAlt ?? post.title} className="sp-blog-mini__shot" loading="lazy" src={post.image} />
                ) : null}
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ font: "700 15px/1.3 'Space Grotesk', sans-serif", letterSpacing: "-0.01em", marginBottom: 6 }}>
                    {post.title}
                  </div>
                  <div className="sp-mono">
                    {formatDate(post.date) ?? post.dateLabel} · {post.readTimeMinutes} min read
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* CTA */}
      <div className="sp-container" data-sp-reveal="stagger" style={{ paddingTop: 52, paddingBottom: 62, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <DownloadCta />
        <Cta icon={Book} to={docPath("nam-rack-setup")} variant="outline">
          NAM Rack setup guide
        </Cta>
        <Cta icon={AudioWaveform} to={V2_PATHS.features} variant="outline">
          Everything else in the DAW
        </Cta>
      </div>
    </>
  );
};

export default V2NamRackPage;
