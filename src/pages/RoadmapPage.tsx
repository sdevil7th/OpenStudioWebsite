import { Compass, GitFork, Map, ShieldOff, Sparkles, Tag } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { REPO } from "@/data/siteContent";
import { SITE_PATHS, docPath } from "@/constants/routes";
import { ArrowLink, Cta, Eyebrow, GradIcon, HonestCallout, renderInline } from "@/components/ui/primitives";
import { useSpReveal } from "@/hooks/useSpReveal";

// Mirrors docs/roadmap.md in the OpenStudio repository (checked 4 Sep 2026).
// Keep the wording close to the source; the source link at the top is the
// authority if the two ever drift.
const HORIZONS = [
  {
    icon: Tag,
    kicker: "Now",
    title: "Release quality",
    items: [
      "Complete release qualification for the NAM Rack and optional TONE3000 workflow, including multi-capture selection, Guitar/Bass profiles, project and preset recovery, accessibility, and real-interface listening tests.",
      "Keep Windows, macOS, and Linux installation, startup, updates, and optional AI Tools setup reliable on clean systems.",
      "Preserve old projects and presets while strengthening audio-thread safety, deterministic state migration, and failure recovery.",
    ],
  },
  {
    icon: Compass,
    kicker: "Next",
    title: "DAW foundations",
    items: [
      "Finish the remaining MIDI playback, routing, note-lifecycle, hardware-output, and plug-in-generated MIDI workflows across live playback and offline render.",
      "Bring CLAP instrument/event handling and state restoration to the same product standard as the reference VST3 path.",
      "Unify menus and contextual commands around the action registry so shortcuts, enablement, undo, and visible actions remain consistent.",
      "Complete and test the render/export options that OpenStudio advertises, including presets, queue behavior, metadata, failure cleanup, and project round trips.",
      "Improve project-wide media, FX, track/group, navigation, and floating-window management.",
    ],
  },
  {
    icon: Sparkles,
    kicker: "Exploring",
    title: "Under consideration",
    items: [
      "An optional local DAW assistant that selects a model appropriate for the user's hardware, keeps project context local and bounded, previews every mutating action, and uses OpenStudio's normal undo-aware commands.",
      "Wider hybrid-precision processing where it produces measurable value without compromising plug-in compatibility or the default float32 workflow.",
      "More portable tone/library workflows, including cross-device metadata and safe shared-asset management.",
      "Future pitch-rendering or restoration research when a materially stronger, testable approach becomes available.",
      "A native extension SDK if demand justifies a stable ABI and long-term compatibility commitment; Lua and JSFX remain the supported extension paths today.",
    ],
  },
];

const GUARDRAILS = [
  "OpenStudio will not bundle third-party NAM captures or cabinet IRs without clear redistribution permission.",
  "Automated measurements will not be presented as proof of subjective tone, naturalness, or commercial-product parity.",
  "Experimental controls will not be exposed as working product features before their complete signal path, persistence, and tests exist.",
  "Retired NAM Rack controls and misleading decorative routing will not return without a new product decision and full QA.",
];

const RoadmapPage = () => {
  useSpReveal();

  return (
    <>
      <PageSeo
        description="Where OpenStudio is heading: release quality now, DAW foundations next, what is being explored, and the product guardrails that will not move."
        path={SITE_PATHS.roadmap}
        title="Roadmap | OpenStudio"
      />

      <div className="sp-container pt-[64px]" data-sp-reveal="hero">
        <Eyebrow icon={Map}>Where the project is heading</Eyebrow>
        <h1 className="sp-h1">Roadmap.</h1>
        <p className="sp-lede max-w-[680px]">
          This describes product direction, not fixed delivery dates or a promise that every exploratory item will ship.
          Current capabilities and caveats live in the feature inventory; release qualification lives in the testing
          docs.
        </p>
        <div className="flex items-center gap-[14px] flex-wrap">
          <Cta href={REPO.roadmapDoc} icon={GitFork} variant="outline">
            Source on GitHub
          </Cta>
          <ArrowLink href={REPO.implementedFeatures}>Implemented features and caveats</ArrowLink>
        </div>
      </div>

      <div className="sp-container pt-[40px]">
        <div className="sp-grid-3 items-start" data-sp-reveal="stagger">
          {HORIZONS.map((horizon) => (
            <div key={horizon.kicker} className="sp-card p-[26px_26px_24px]">
              <div className="sp-kicker flex items-center gap-[8px]">
                <GradIcon icon={horizon.icon} size={14} />
                {horizon.kicker}
              </div>
              <div className="[font:700_20px/1.2_'Space_Grotesk',_sans-serif] tracking-[-0.02em] mb-[14px]">
                {horizon.title}
              </div>
              <ul className="sp-doc-list m-[0px] text-[13.5px]">
                {horizon.items.map((item) => (
                  <li key={item}>{renderInline(item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-container pt-[34px]">
        <div className="sp-card sp-card--dark p-[28px_30px]" data-sp-reveal="panel">
          <Eyebrow icon={ShieldOff} tone="teal">
            Product guardrails
          </Eyebrow>
          <ul className="sp-doc-list m-[0px] text-[var(--sp-dark-body)] text-[14px]">
            {GUARDRAILS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sp-container pt-[34px] pb-[62px]" data-sp-reveal="rise">
        <HonestCallout>
          Want something on here? Open an issue that describes the use case rather than only naming the feature. The
          reasoning behind priorities is public, and a concrete workflow is what moves an item from
          &ldquo;exploring&rdquo; to &ldquo;next&rdquo;. <ArrowLink href={REPO.newIssue}>Open an issue</ArrowLink>{" "}
          <ArrowLink to={docPath("faq")}>What is explicitly not planned</ArrowLink>
        </HonestCallout>
      </div>
    </>
  );
};

export default RoadmapPage;
