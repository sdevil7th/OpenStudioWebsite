import { Cpu, Hash, Rocket, SlidersHorizontal, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { REPO } from "../content";
import type { DocContent, DocGroupId, DocMeta } from "./types";

export interface DocGroup {
  id: DocGroupId;
  heading: string;
  icon: ComponentType<LucideProps>;
}

export const DOC_GROUPS: DocGroup[] = [
  { id: "start", heading: "Start here", icon: Rocket },
  { id: "working", heading: "Working", icon: SlidersHorizontal },
  { id: "optional", heading: "Optional", icon: Cpu },
  { id: "reference", heading: "Reference", icon: Hash },
];

/** Reading order. The sidebar, landing page, and prev/next all follow it. */
export const DOCS: DocMeta[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    summary: "Install, first launch, audio device, plugin scan, first project.",
    group: "start",
    sourceUrl: REPO.manual,
  },
  {
    slug: "first-session",
    title: "Your first session",
    summary: "Record a guitar through the NAM Rack, add MIDI drums, mix it, render it.",
    group: "start",
    sourceUrl: REPO.manual,
  },
  {
    slug: "audio-setup",
    title: "Audio setup",
    summary: "Interfaces, drivers, sample rate, buffer size, and latency on each OS.",
    group: "start",
    sourceUrl: REPO.manual,
  },
  {
    slug: "recording-and-editing",
    title: "Recording & editing",
    summary: "Inputs, arming, monitoring, record modes, takes, and the timeline editing tools.",
    group: "working",
    sourceUrl: REPO.manual,
  },
  {
    slug: "midi-and-piano-roll",
    title: "MIDI & piano roll",
    summary: "MIDI devices, recording, step input, the piano roll, quantize, and transforms.",
    group: "working",
    sourceUrl: REPO.manual,
  },
  {
    slug: "mixing-and-routing",
    title: "Mixing & routing",
    summary: "Channel strips, sends, buses, the routing matrix, snapshots, and automation.",
    group: "working",
    sourceUrl: REPO.manual,
  },
  {
    slug: "plugins-and-scanning",
    title: "Plugins & scanning",
    summary: "Formats, scan paths, FX chains, presets, ARA2, and what to do when a plugin will not show up.",
    group: "working",
    sourceUrl: REPO.manual,
  },
  {
    slug: "nam-rack-setup",
    title: "NAM Rack setup",
    summary: "Loading captures and IRs, TONE3000 packs, the pedalboard, presets, and A/B.",
    group: "working",
    sourceUrl: REPO.namRackDoc,
  },
  {
    slug: "pitch-editing",
    title: "Pitch editing",
    summary: "The graphical pitch editor, scale snapping, correction, and the real-time corrector.",
    group: "working",
    sourceUrl: REPO.implementedFeatures,
  },
  {
    slug: "rendering-and-export",
    title: "Rendering & export",
    summary: "Sources, bounds, formats, stems, the render queue, and project archiving.",
    group: "working",
    sourceUrl: REPO.manual,
  },
  {
    slug: "ai-runtime-setup",
    title: "AI Tools setup",
    summary: "What the optional runtime installs, what it needs, and how to keep it offline.",
    group: "optional",
    sourceUrl: REPO.runtimeContractDoc,
  },
  {
    slug: "lua-scripting",
    title: "Lua scripting",
    summary: "The script editor, the s13 API, and a first script.",
    group: "optional",
    sourceUrl: REPO.apiDoc,
  },
  {
    slug: "keyboard-shortcuts",
    title: "Keyboard shortcuts",
    summary: "The default profile, mouse gestures, and the 19 DAW input profiles.",
    group: "reference",
    sourceUrl: REPO.inputProfilesDoc,
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    summary: "Indexed by symptom: no audio, latency, crackle, plugins, media, rendering.",
    group: "reference",
    sourceUrl: REPO.manual,
  },
  {
    slug: "faq",
    title: "FAQ",
    summary: "Licensing, platforms, plugin formats, AI, commercial use.",
    group: "reference",
    sourceUrl: REPO.readme,
  },
];

export const getDoc = (slug: string | undefined) => DOCS.find((doc) => doc.slug === slug);

export const docsInGroup = (group: DocGroupId) => DOCS.filter((doc) => doc.group === group);

export const adjacentDocs = (slug: string) => {
  const index = DOCS.findIndex((doc) => doc.slug === slug);
  return {
    previous: index > 0 ? DOCS[index - 1] : undefined,
    next: index >= 0 && index < DOCS.length - 1 ? DOCS[index + 1] : undefined,
  };
};

// One chunk per doc so the docs landing page never pulls every article down.
const contentLoaders = import.meta.glob<DocContent>("./content/*.ts", { import: "default" });

export const loadDocContent = (slug: string) => {
  const loader = contentLoaders[`./content/${slug}.ts`];
  return loader ? loader() : Promise.reject(new Error(`No doc content for "${slug}".`));
};

export const hasDocContent = (slug: string) => Boolean(contentLoaders[`./content/${slug}.ts`]);
