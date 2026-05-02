import { screenshots, type ScreenshotAsset } from "@/data/screenshots";

export type DownloadCinematicSceneId = "room" | "sources" | "bridge" | "openstudio" | "ready";
export type DownloadCinematicPlateId = "studioWide" | "signalCloseup" | "screenReveal";

export interface DownloadCinematicScene {
  id: DownloadCinematicSceneId;
  eyebrow: string;
  headline: string;
  description: string;
  metric: string;
}

export interface DownloadCinematicPlate {
  id: DownloadCinematicPlateId;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface DownloadCinematicScreenshot extends ScreenshotAsset {
  webpSrc: string;
}

export const downloadCinematicScenes: DownloadCinematicScene[] = [
  {
    id: "room",
    eyebrow: "Scene I",
    headline: "The studio powers on.",
    description:
      "The room opens in darkness: treated walls, a real desk, correct monitors, and instruments placed where a session can actually happen.",
    metric: "room tone",
  },
  {
    id: "sources",
    eyebrow: "Scene II",
    headline: "Sources come into focus.",
    description:
      "Mic, guitar, bass, and keys are framed as a believable capture chain, with callouts following the gear instead of pretending to model it.",
    metric: "4 sources armed",
  },
  {
    id: "bridge",
    eyebrow: "Scene III",
    headline: "Signal reaches the interface.",
    description:
      "The camera pushes into a compact interface, real cables, measured knobs, live metering, and clean routing graphics.",
    metric: "input bridge",
  },
  {
    id: "openstudio",
    eyebrow: "Scene IV",
    headline: "OpenStudio takes the screen.",
    description:
      "The workstation plate clears for one real recording session, revealing the actual app inside the monitor composition.",
    metric: "session revealed",
  },
  {
    id: "ready",
    eyebrow: "Scene V",
    headline: "Ready for the next take.",
    description:
      "The filmstrip resolves into the same platform-specific download action, so the story ends with a concrete next step.",
    metric: "download ready",
  },
];

export const downloadCinematicPlates: Record<DownloadCinematicPlateId, DownloadCinematicPlate> = {
  studioWide: {
    id: "studioWide",
    src: "/assets/openstudio/download-cinematic/studio-wide.webp",
    alt: "Realistic dark home studio with treated wall panels, desk, speakers, microphone, laptop, MIDI keyboard, and guitars on stands.",
    width: 1672,
    height: 941,
  },
  signalCloseup: {
    id: "signalCloseup",
    src: "/assets/openstudio/download-cinematic/signal-closeup.webp",
    alt: "Close-up of a compact audio interface with connected cables, gain knobs, meters, and a small MIDI keyboard on a studio desk.",
    width: 1672,
    height: 941,
  },
  screenReveal: {
    id: "screenReveal",
    src: "/assets/openstudio/download-cinematic/screen-reveal-plate.webp",
    alt: "Professional studio workstation with a blank widescreen monitor, speakers, audio interface, and MIDI keyboard.",
    width: 1672,
    height: 941,
  },
};

export const downloadCinematicScenePlateMap: Record<
  DownloadCinematicSceneId,
  DownloadCinematicPlateId
> = {
  room: "studioWide",
  sources: "studioWide",
  bridge: "signalCloseup",
  openstudio: "screenReveal",
  ready: "screenReveal",
};

export const downloadCinematicSourceLabels = [
  "Voice mic",
  "Electric guitar",
  "Bass DI",
  "Keys",
] as const;

export const downloadCinematicScreenshot: DownloadCinematicScreenshot = {
  ...screenshots.recordingSession,
  webpSrc: "/assets/openstudio/screenshots/recording-session.webp",
};
