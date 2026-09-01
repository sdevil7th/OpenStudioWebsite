// Shared constants for the Studio Paper (v2) preview subtree.
// Version / size / date figures are deliberate placeholders — the comps ship
// with mono placeholders until real release numbers are wired in.

export const V2_PATHS = {
  home: "/v2",
  features: "/v2/features",
  namRack: "/v2/nam-rack",
  ai: "/v2/ai",
  download: "/v2/download",
  docs: "/v2/docs",
  docsGettingStarted: "/v2/docs/getting-started",
  compare: "/v2/compare",
  community: "/v2/community",
  blog: "/v2/blog",
  releases: "/v2/releases",
} as const;

export const VERSION_LABEL = "v0.x.x";
export const SIZE_LABEL = "00 MB";
export const VERSION_META = `${VERSION_LABEL} · ${SIZE_LABEL}`;
export const BUILT_LABEL = "built 00 Aug 2026";

const SCREENSHOTS = "/assets/openstudio/screenshots";
const BLOG_ASSETS = "/assets/blogs";

export const SHOTS = {
  heroTimeline: `${SCREENSHOTS}/hero-timeline.webp`,
  recordingSession: `${SCREENSHOTS}/recording-session.webp`,
  pianoRoll: `${SCREENSHOTS}/piano-roll.webp`,
  mixerMeters: `${SCREENSHOTS}/mixer-meters.webp`,
  pluginHosting: `${SCREENSHOTS}/plugin-hosting-1.webp`,
  pitchEditor: `${SCREENSHOTS}/pitch-editor.webp`,
  fxChainBrowser: `${SCREENSHOTS}/fx-chain-browser.webp`,
  exportDialog: `${SCREENSHOTS}/export-dialog.webp`,
  arrangementOverviewWide: `${SCREENSHOTS}/arrangement-overview-wide.webp`,
  tone3000Browser: `${SCREENSHOTS}/tone3000-browser.webp`,
  namRackOverview: `${BLOG_ASSETS}/nam-rack-overview.webp`,
  namRackTuner: `${BLOG_ASSETS}/nam-rack-tuner.webp`,
  namRackPreFx: `${BLOG_ASSETS}/nam-rack-pre-fx.webp`,
  namRackCabinetIr: `${BLOG_ASSETS}/nam-rack-cabinet-ir.webp`,
  namRackGraphicEq: `${BLOG_ASSETS}/nam-rack-graphic-eq.webp`,
  namRackPostFx: `${BLOG_ASSETS}/nam-rack-post-fx.webp`,
  namRackPresetLibrary: `${BLOG_ASSETS}/nam-rack-preset-library.webp`,
  namRackSignalChain: `${BLOG_ASSETS}/nam-rack-signal-chain.webp`,
} as const;

export const VISMAY_MARK = "/assets/openstudio/branding/vismay-mark.png";
