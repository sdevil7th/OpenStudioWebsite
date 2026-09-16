// Shared app references and media for the Studio Paper website.
// Release figures come from GitHub, with a GitHub-derived build snapshot for prerendering/offline use.

import { projectEmails } from "@/data/siteLinks";
import { APP_REPOSITORY_URL } from "@/constants/site";

const REPO_URL = APP_REPOSITORY_URL;

/** Every outbound GitHub destination the website links to, so nothing points at the repo root by accident. */
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
  apiDoc: `${REPO_URL}/blob/main/Source/ScriptEngine.cpp`,
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

export const OPENSTUDIO_MARK = "/assets/openstudio/branding/openstudio-mark-78.webp";
