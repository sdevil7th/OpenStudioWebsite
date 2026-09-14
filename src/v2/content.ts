// Shared constants for the Studio Paper (v2) preview subtree.
// Version / size / date figures come from `useReleaseInfo` (release manifest →
// GitHub → refreshed fallback), never from hand-typed placeholders.

import { projectEmails } from "@/data/siteLinks";
import { githubFallbackSnapshot } from "@/lib/github";

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
  roadmap: "/v2/roadmap",
  privacy: "/v2/privacy",
  terms: "/v2/terms",
  security: "/v2/security",
} as const;

export const docPath = (slug: string) => `${V2_PATHS.docs}/${slug}`;
export const blogPostPath = (slug: string) => `${V2_PATHS.blog}/${slug}`;

const REPO_URL = githubFallbackSnapshot.repositoryUrl;

/** Every outbound GitHub destination the preview links to, so nothing points at the repo root by accident. */
export const REPO = {
  url: REPO_URL,
  issues: `${REPO_URL}/issues`,
  newIssue: `${REPO_URL}/issues/new/choose`,
  goodFirstIssues: `${REPO_URL}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`,
  pulls: `${REPO_URL}/pulls`,
  releases: `${REPO_URL}/releases`,
  license: `${REPO_URL}/blob/main/LICENSE`,
  docs: `${REPO_URL}/tree/main/docs`,
  manual: `${REPO_URL}/blob/main/docs/USER_MANUAL.md`,
  namRackDoc: `${REPO_URL}/blob/main/docs/nam-rack.md`,
  roadmapDoc: `${REPO_URL}/blob/main/docs/roadmap.md`,
  apiDoc: `${REPO_URL}/blob/main/docs/API.md`,
  inputProfilesDoc: `${REPO_URL}/blob/main/docs/input-profiles.md`,
  runtimeContractDoc: `${REPO_URL}/blob/main/docs/runtime-dependency-contract.md`,
  implementedFeatures: `${REPO_URL}/blob/main/docs/implemented_features.md`,
  readme: `${REPO_URL}#readme`,
} as const;

export const CONTACT_EMAIL = projectEmails.contact;
export const SUPPORT_EMAIL = projectEmails.support;
export const TONE3000_URL = "https://www.tone3000.com";

const SCREENSHOTS = "/assets/openstudio/screenshots";
const BLOG_ASSETS = "/assets/blogs";

export const SHOTS = {
  heroTimeline: `${SCREENSHOTS}/hero-timeline.webp`,
  recordingSession: `${SCREENSHOTS}/recording-session.webp`,
  pianoRoll: `${SCREENSHOTS}/piano-roll.webp`,
  mixerMeters: `${SCREENSHOTS}/mixer-meters.webp`,
  channelStrip: `${SCREENSHOTS}/channel-strip-closeup.webp`,
  automationLanes: `${SCREENSHOTS}/automation-lanes.webp`,
  pluginHosting: `${SCREENSHOTS}/plugin-hosting-1.webp`,
  pluginHosting2: `${SCREENSHOTS}/plugin-hosting-2.webp`,
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
  aceStep: `${BLOG_ASSETS}/ace-step-diffusers-almost-3x-faster.webp`,
} as const;

export const VISMAY_MARK = "/assets/openstudio/branding/vismay-mark.png";
