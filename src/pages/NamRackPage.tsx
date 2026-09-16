import { ResponsiveImage } from "@/components/ResponsiveImage";
import { AudioWaveform, Book, Download, Key, SlidersHorizontal, Speaker, Zap } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { blogPosts } from "@/data/blogs";
import { REPO, SHOTS, TONE3000_URL } from "@/data/siteContent";
import { SITE_PATHS, blogPostPath, docPath } from "@/constants/routes";
import { LiveStage } from "@/features/daw-preview/stage/LiveStage";
import { formatBytes, formatDate } from "@/lib/format";
import {
  ArrowLink,
  Cta,
  DownloadCta,
  Eyebrow,
  Frame,
  GradIcon,
  HonestCallout,
  Kicker,
  renderInline,
} from "@/components/ui/primitives";
import { usePlatform } from "@/hooks/usePlatform";
import { useReleaseInfo } from "@/hooks/useReleaseInfo";
import { useSpReveal } from "@/hooks/useSpReveal";

// Each tile is the real rack, cropped to its hardware page.
const CHAIN_STAGES = [
  { label: "01 Tuner", shot: SHOTS.namRackTuner, alt: "Tuner", variant: "amp+tuner" as const },
  { label: "02 Pre-FX pedalboard", shot: SHOTS.namRackPreFx, alt: "Pre-FX pedalboard", variant: "pre" as const },
  { label: "03 NAM amp · A1/A2", shot: SHOTS.namRackOverview, alt: "NAM amp · A1/A2", variant: "amp" as const },
  { label: "04 Cabinet IR", shot: SHOTS.namRackCabinetIr, alt: "Cabinet IR", variant: "cab" as const },
  { label: "05 Graphic EQ", shot: SHOTS.namRackGraphicEq, alt: "Graphic EQ", variant: "eq" as const },
  { label: "06 Post-FX", shot: SHOTS.namRackPostFx, alt: "Post-FX", variant: "post" as const },
];

// One card for the captures themselves (NAM + TONE3000); the other three are
// the stages OpenStudio builds around them.
const RACK_BLOCKS = [
  {
    icon: Download,
    title: "Download captures",
    copy: `Browse TONE3000 tone packs inside the rack, audition a capture through your live input, then **Use** it. Any local \`.nam\` file loads too, including NAM A1 and A2 pedal, amp, and full-rig captures. A [TONE3000](${TONE3000_URL}) account is optional and only needed for its catalog.`,
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

const NamRackPage = () => {
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
        description="OpenStudio ships a full Neural Amp Modeler rack: NAM A1/A2 captures, TONE3000 browsing, a native pedalboard, cabinet IRs, graphic EQ, effects, tuner, presets, and offline render. Free, built in, no add-on runtime."
        path={SITE_PATHS.namRack}
        title="NAM Rack: Free Neural Amp Modeler Guitar Rig Inside a DAW | OpenStudio"
      />

      {/* Hero */}
      <div className="sp-container">
        <div className="sp-split min-[901px]:grid-cols-[1.05fr_.95fr] pt-[64px]">
          <div data-sp-reveal="hero">
            <Eyebrow icon={Zap}>Included in the base app</Eyebrow>
            <h1 className="sp-h1">A full amp rig, inside the DAW.</h1>
            <p className="sp-lede max-w-[540px]">
              Most free DAWs send you to a plugin for tone. OpenStudio ships the rack: Neural Amp Modeler captures, a
              native pedalboard in front, a cabinet IR behind, EQ and effects after, and a tuner where you need it. It
              recalls with the project and renders with the mix.
            </p>
            <div className="flex items-center gap-[16px] flex-wrap mb-[10px]">
              <DownloadCta />
              <ArrowLink to={docPath("nam-rack-setup")}>Set up your first tone</ArrowLink>
            </div>
            <div className="sp-mono">{meta}</div>
          </div>
          <Frame hero reveal="media-right">
            <LiveStage
              alt="The OpenStudio NAM Rack amp page"
              eager
              id="nam-rack"
              poster={SHOTS.namRackOverview}
              sizes="(max-width: 640px) calc(100vw - 60px), (max-width: 900px) calc(100vw - 88px), (max-width: 1240px) calc((100vw - 116px) * 0.475 - 20px), 514px"
              priority={1}
              variant="amp+tour"
            />
          </Frame>
        </div>
      </div>

      {/* Signal chain */}
      <div className="sp-container pt-[52px]" data-sp-reveal="hero">
        <Kicker>Signal chain · left to right</Kicker>
        <h2 className="sp-h2">Tuner → Pre-FX → NAM amp → Cabinet IR → EQ → Post-FX</h2>
        <p className="sp-body max-w-[700px] mb-[14px]">
          Every stage is native. None of it relies on a hosted third-party plugin.
        </p>
      </div>
      <div className="sp-container pt-[26px]">
        <div className="sp-chain-grid" data-sp-reveal="flow">
          {CHAIN_STAGES.map((stage) => (
            <div key={stage.label} className="sp-card sp-card--tight overflow-hidden">
              <div className="p-[9px_11px] [font:500_9.5px/1.3_'JetBrains_Mono',_monospace] tracking-[0.1em] uppercase text-[var(--sp-accent)] [border-bottom:1px_solid_var(--sp-hairline)]">
                {stage.label}
              </div>
              <LiveStage
                alt={stage.alt}
                className="sp-chain-grid__stage"
                id="nam-rack"
                poster={stage.shot}
                sizes="(max-width: 640px) calc((100vw - 58px) / 2), (max-width: 1240px) calc((100vw - 102px) / 3), 380px"
                variant={stage.variant}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Capability blocks */}
      <div className="sp-container pt-[46px]">
        <div className="sp-grid-4" data-sp-reveal="stagger">
          {RACK_BLOCKS.map((block) => (
            <div key={block.title} className="sp-card sp-card--tight p-[22px_22px_24px]">
              <div className="mb-[12px]">
                <GradIcon icon={block.icon} size={22} />
              </div>
              <div className="[font:700_17px/1.25_'Space_Grotesk',_sans-serif] tracking-[-0.02em] mb-[8px]">
                {block.title}
              </div>
              <p className="sp-body text-[13.5px] leading-[1.6]">{renderInline(block.copy)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preset library */}
      <div className="sp-container pt-[46px]">
        <div className="sp-row min-[901px]:grid-cols-[1.15fr_.85fr]">
          <Frame alt="The NAM Rack preset library" reveal="media-left" src={SHOTS.namRackPresetLibrary}
            sizes="(max-width: 640px) calc(100vw - 58px), (max-width: 900px) calc(100vw - 86px), (max-width: 1240px) calc((100vw - 102px) * 0.575 - 18px), 637px" />
          <div>
            <Kicker>Preset library</Kicker>
            <h2 className="sp-h2 text-[30px]">Your tones, recalled with the project.</h2>
            <p className="sp-body max-w-[420px] mb-[14px]">
              Save a whole chain, from the capture and pedals through the cab, EQ, and post-FX, and pull it back in the
              next session. Two chains can sit side by side for an instant A/B. Presets reference your capture and IR
              files rather than embedding them, so a library stays small.
            </p>
            <ArrowLink to={`${docPath("nam-rack-setup")}#presets-and-recall`}>Presets, A/B, and recall</ArrowLink>
          </div>
        </div>
      </div>

      {/* TONE3000 */}
      <div className="sp-container pt-[46px]">
        <div className="sp-row min-[901px]:grid-cols-[.9fr_1.1fr]">
          <div data-sp-reveal="rise">
            <Kicker>TONE3000</Kicker>
            <h2 className="sp-h2 text-[30px]">Find captures without leaving the rack.</h2>
            <p className="sp-body max-w-[420px] mb-[14px]">
              Search TONE3000 tone packs in-app, open a pack to see each capture and whether it is amp-only or has the
              cab embedded, audition through your live input, and commit the one you like. Sign-in happens in your
              browser; local <code className="sp-inline-code">.nam</code> files never need it.
            </p>
            <ArrowLink href={TONE3000_URL}>About TONE3000</ArrowLink>
          </div>
          <Frame
            alt="The TONE3000 capture browser inside OpenStudio"
            reveal="media-right"
            src={SHOTS.tone3000Browser}
            sizes="(max-width: 640px) calc(100vw - 58px), (max-width: 900px) calc(100vw - 86px), (max-width: 1240px) calc((100vw - 102px) * 0.55 - 18px), 608px"
          />
        </div>
      </div>

      {/* Honest block */}
      <div className="sp-container pt-[46px]" data-sp-reveal="rise">
        <HonestCallout>
          There is no paid NAM Rack tier and no separate runtime to install. Third-party captures and IRs are
          distributed by their creators and keep their own licenses; OpenStudio bundles none. Public availability of the
          connected TONE3000 catalog depends on partner approval for each release. Local captures always work. Full
          engineering detail is in the{" "}
          <a className="sp-text-link" href={REPO.namRackDoc} rel="noreferrer" target="_blank">
            NAM Rack guide on GitHub
          </a>
          .
        </HonestCallout>
      </div>

      {/* From the blog */}
      {posts.length > 0 ? (
        <div className="sp-container pt-[46px]">
          <Kicker>From the blog</Kicker>
          <div className="sp-grid-2 gap-[18px]" data-sp-reveal="stagger">
            {posts.map((post) => (
              <a key={post.slug} className="sp-card sp-card--tight sp-blog-mini" href={blogPostPath(post.slug)}>
                {post.image ? (
                  <ResponsiveImage
                    alt={post.imageAlt ?? post.title}
                    className="sp-blog-mini__shot"
                    sizes="(max-width: 640px) calc(100vw - 42px), 150px"
                    loading="lazy"
                    src={post.image}
                  />
                ) : null}
                <div className="p-[16px_18px]">
                  <div className="[font:700_15px/1.3_'Space_Grotesk',_sans-serif] tracking-[-0.01em] mb-[6px]">
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
      <div className="sp-container pt-[52px] pb-[62px] flex items-center gap-[16px] flex-wrap" data-sp-reveal="stagger">
        <DownloadCta />
        <Cta icon={Book} to={docPath("nam-rack-setup")} variant="outline">
          NAM Rack setup guide
        </Cta>
        <Cta icon={AudioWaveform} to={SITE_PATHS.features} variant="outline">
          Everything else in the DAW
        </Cta>
      </div>
    </>
  );
};

export default NamRackPage;
