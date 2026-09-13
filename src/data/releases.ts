import type { ReleaseEntry, SeoMeta } from "@/data/marketing";

export const releasesSeo: SeoMeta = {
  title: "OpenStudio Releases | Free Open Source DAW Updates",
  description:
    "Track the OpenStudio release timeline — update notes, distribution status, and Windows, macOS, and Linux build details for the free, open source DAW.",
  path: "/releases",
};

export const releasesHero = {
  eyebrow: "Release timeline",
  title: "Updates move in deliberate public steps.",
  description:
    "OpenStudio is shipping as a careful public rollout: stable download redirects, honest platform notes, and updates that are easy to understand before they are heavily automated.",
};

export const releaseTimeline: ReleaseEntry[] = [
  {
    id: "first-public-release",
    label: "Current track",
    version: "Public release",
    title: "Windows, macOS, and Linux downloads are live through stable redirect endpoints.",
    summary:
      "The current public release keeps distribution straightforward: browser-first downloads, platform notes kept visible, and the release path centered on clarity rather than overpromising background update magic.",
    status: "Live now",
    dateLabel: "Current release path",
    accent: "lavender",
    bullets: [
      "Stable redirect endpoints back the Windows, macOS, and Linux download buttons.",
      "Unsigned install guidance stays explicit for both platforms.",
      "The base app remains lean while optional AI tooling stays separate.",
    ],
  },
  {
    id: "metadata-awareness",
    label: "Update awareness",
    version: "Metadata-driven",
    title: "Release metadata points the app toward newer builds without pretending to be a fully silent updater.",
    summary:
      "Update discovery is already part of the product story, but the site should frame it as metadata awareness and guided upgrade flow, not as a completely signed and invisible patch pipeline.",
    status: "In production",
    dateLabel: "Current release behavior",
    accent: "emerald",
    bullets: [
      "Release metadata is checked from openstudio.org.in.",
      "The messaging stays conservative around background patching.",
      "The install trust story remains visible during the first public cycle.",
    ],
  },
  {
    id: "next-release-shape",
    label: "In preparation",
    version: "0.1.02 candidate",
    title: "Recovery, plugin-window cleanup, and clearer update controls are being prepared for the next desktop release.",
    summary:
      "Development changes cover interrupted-work recovery, click-only metronome practice, guided update downloads, and detached editors that close when their FX is removed. These changes are not part of the current download until a matching desktop release is published.",
    status: "Not yet published",
    dateLabel: "Release qualification in progress",
    accent: "amber",
    bullets: [
      "Recovery can use saved project snapshots, recorded samples already on disk, and retained AI requests; periodic project backup remains optional.",
      "Plugin removal closes affected built-in editor windows and cancels queued reopens.",
      "NAM Rack retains loaded capture details when reopening a pack, with clearer cabinet controls and preset readback.",
      "Supported external plugins can optionally run in a separate process. Compatibility still depends on the plugin and platform.",
      "Back up projects and presets before upgrading. Retired serialized formats are unsupported; renaming a file does not convert it.",
    ],
  },
];

export const releaseChannels = [
  {
    title: "Windows stable redirect",
    description: "The public Windows button points to a stable redirect endpoint rather than a hardcoded binary URL in the UI.",
  },
  {
    title: "macOS stable redirect",
    description: "The macOS path uses the same stable redirect approach, with manual trust notes kept visible.",
  },
  {
    title: "Honest AI tooling story",
    description: "Optional AI runtimes stay separate from the default installer so the base product story stays truthful.",
  },
];

export const releasePrinciples = [
  "Prefer visible release notes over hidden assumptions.",
  "Keep platform caveats obvious at the point of download.",
  "Treat update discovery and update automation as different claims.",
  "Let the public release path get more polished without becoming vague.",
];

export const releaseSyncPanel = {
  eyebrow: "Stay synchronized",
  title: "Follow the release arc without guessing what changed.",
  description:
    "The release surface should make the current state legible: what is shipping, how updates are discovered, and which parts of the install story still need manual trust steps.",
};
