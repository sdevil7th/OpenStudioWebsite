import { Bug, ChevronRight, Cpu, GitFork, Hash, Rocket, SlidersHorizontal, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import PageSeo from "@/components/PageSeo";
import { V2_PATHS } from "../content";
import { Cta, GradIcon } from "../primitives";
import { useSpReveal } from "../useSpReveal";

interface DocEntry {
  title: string;
  copy: string;
  to: string;
}

interface DocGroup {
  icon: ComponentType<LucideProps>;
  heading: string;
  entries: DocEntry[];
}

const DOC_GROUPS: DocGroup[] = [
  {
    icon: Rocket,
    heading: "Start here",
    entries: [
      { title: "Getting Started", copy: "Install, first launch, audio device, plugin scan.", to: V2_PATHS.docsGettingStarted },
      { title: "Your First Session", copy: "Record, tune, mix, and render in one pass.", to: V2_PATHS.docs },
      { title: "Audio Setup", copy: "Interfaces, buffer size, latency, ASIO / CoreAudio / JACK.", to: V2_PATHS.docs },
    ],
  },
  {
    icon: SlidersHorizontal,
    heading: "Working",
    entries: [
      {
        title: "Plugins & Scanning",
        copy: "Formats, scan paths, ARA2, and what to do when a plugin will not show up.",
        to: V2_PATHS.docs,
      },
      { title: "NAM Rack Setup", copy: "Loading captures and IRs, TONE3000, presets.", to: V2_PATHS.docs },
      { title: "Pitch Editing", copy: "The pitch editor workflow, start to finish.", to: V2_PATHS.docs },
      { title: "Mixing & Routing", copy: "Buses, sends, the routing matrix, snapshots.", to: V2_PATHS.docs },
    ],
  },
  {
    icon: Cpu,
    heading: "Optional",
    entries: [
      { title: "AI Runtime Setup", copy: "What it installs, what it needs, and how to keep it offline.", to: V2_PATHS.docs },
      { title: "Lua Scripting", copy: "The scripting API and a first script.", to: V2_PATHS.docs },
    ],
  },
  {
    icon: Hash,
    heading: "Reference",
    entries: [
      { title: "Keyboard Shortcuts", copy: "Per-OS reference, printable.", to: V2_PATHS.docs },
      { title: "Troubleshooting", copy: "Indexed by symptom, not by subsystem.", to: V2_PATHS.docs },
      { title: "FAQ", copy: "Licensing, platforms, plugin formats, AI, commercial use.", to: V2_PATHS.docs },
    ],
  },
];

const V2DocsPage = () => {
  useSpReveal();

  return (
  <>
    <PageSeo
      description="Setup guides, workflow walkthroughs, keyboard shortcuts, scripting reference, and troubleshooting."
      path={V2_PATHS.docs}
      robots="noindex"
      title="Documentation | OpenStudio"
    />

    <div className="sp-container" data-sp-reveal="hero" style={{ paddingTop: 64 }}>
      <h1 className="sp-h1">Documentation.</h1>
      <p className="sp-lede" style={{ maxWidth: 640 }}>
        Everything from installing to scripting. If something is missing or wrong, open an issue or edit the page
        on GitHub.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <Cta href="https://github.com/sdevil7th/OpenStudio/issues" icon={Bug} variant="outline">
          Open an issue
        </Cta>
        <Cta href="https://github.com/sdevil7th/OpenStudio" icon={GitFork} variant="outline">
          Edit on GitHub
        </Cta>
      </div>
    </div>

    <div className="sp-container" style={{ padding: "44px 34px 62px" }}>
      <div className="sp-grid-2" data-sp-reveal="stagger">
        {DOC_GROUPS.map((group) => (
          <div key={group.heading} className="sp-card" style={{ padding: "26px 28px 22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                font: "700 19px/1.2 'Space Grotesk', sans-serif",
                letterSpacing: "-0.02em",
                marginBottom: 18,
              }}
            >
              <GradIcon icon={group.icon} size={20} />
              {group.heading}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {group.entries.map((entry, index) => (
                <Link
                  key={entry.title}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "13px 0",
                    borderTop: index > 0 ? "1px solid var(--sp-hairline)" : undefined,
                  }}
                  to={entry.to}
                >
                  <span style={{ color: "var(--sp-accent)", paddingTop: 2 }}>
                    <ChevronRight aria-hidden="true" size={14} strokeWidth={2} />
                  </span>
                  <span>
                    <span
                      style={{
                        display: "block",
                        font: "600 14px/1.35 'Space Grotesk', sans-serif",
                        marginBottom: 3,
                      }}
                    >
                      {entry.title}
                    </span>
                    <span className="sp-body" style={{ display: "block", fontSize: 12.5, lineHeight: 1.55 }}>
                      {entry.copy}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
  );
};

export default V2DocsPage;
