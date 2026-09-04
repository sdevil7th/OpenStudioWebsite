import { Compass, GitFork, Map, ShieldOff, Sparkles, Tag } from "lucide-react";
import PageSeo from "@/components/PageSeo";
import { REPO, V2_PATHS, docPath } from "../content";
import { ArrowLink, Cta, Eyebrow, GradIcon, HonestCallout, renderInline } from "../primitives";
import { useSpReveal } from "../useSpReveal";

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
    title: "Not promised, being looked at",
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

const V2RoadmapPage = () => {
  useSpReveal();

  return (
    <>
      <PageSeo
        description="Where OpenStudio is heading: release quality now, DAW foundations next, what is being explored, and the product guardrails that will not move."
        path={V2_PATHS.roadmap}
        robots="noindex"
        title="Roadmap | OpenStudio"
      />

      <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
        <Eyebrow icon={Map}>Direction, not dates</Eyebrow>
        <h1 className="sp-h1">Roadmap.</h1>
        <p className="sp-lede" style={{ maxWidth: 680 }}>
          This describes product direction, not fixed delivery dates or a promise that every exploratory item will
          ship. Current capabilities and caveats live in the feature inventory; release qualification lives in the
          testing docs.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Cta href={REPO.roadmapDoc} icon={GitFork} variant="outline">
            Source on GitHub
          </Cta>
          <ArrowLink href={REPO.implementedFeatures}>Implemented features and caveats</ArrowLink>
        </div>
      </div>

      <div className="sp-container" style={{ paddingTop: 40 }}>
        <div className="sp-grid-3" data-sp-reveal="stagger" style={{ alignItems: "start" }}>
          {HORIZONS.map((horizon) => (
            <div key={horizon.kicker} className="sp-card" style={{ padding: "26px 26px 24px" }}>
              <div className="sp-kicker" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <GradIcon icon={horizon.icon} size={14} />
                {horizon.kicker}
              </div>
              <div style={{ font: "700 20px/1.2 'Space Grotesk', sans-serif", letterSpacing: "-0.02em", marginBottom: 14 }}>
                {horizon.title}
              </div>
              <ul className="sp-doc-list" style={{ margin: 0, fontSize: 13.5 }}>
                {horizon.items.map((item) => (
                  <li key={item}>{renderInline(item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-container" style={{ paddingTop: 34 }}>
        <div className="sp-card sp-card--dark" data-sp-reveal="panel" style={{ padding: "28px 30px" }}>
          <Eyebrow icon={ShieldOff} tone="teal">
            Product guardrails
          </Eyebrow>
          <ul className="sp-doc-list" style={{ margin: 0, color: "var(--sp-dark-body)", fontSize: 14 }}>
            {GUARDRAILS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sp-container" data-sp-reveal="rise" style={{ paddingTop: 34, paddingBottom: 62 }}>
        <HonestCallout>
          Want something on here? Open an issue with the use case, not just the feature name — the reasoning behind
          priorities is public and a concrete workflow is what moves an item from &ldquo;exploring&rdquo; to
          &ldquo;next&rdquo;.{" "}
          <ArrowLink href={REPO.newIssue}>Open an issue</ArrowLink>{" "}
          <ArrowLink to={docPath("faq")}>What is explicitly not planned</ArrowLink>
        </HonestCallout>
      </div>
    </>
  );
};

export default V2RoadmapPage;
