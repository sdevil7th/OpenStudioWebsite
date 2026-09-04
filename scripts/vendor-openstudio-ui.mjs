#!/usr/bin/env node
/**
 * Re-syncs the OpenStudio UI sources vendored under src/v2/daw/vendor/ from a
 * pinned commit of sdevil7th/OpenStudio, applying the small deterministic
 * patches that make them build inside this site (import paths, asset URLs).
 *
 *   node scripts/vendor-openstudio-ui.mjs            # sync at OPENSTUDIO_SHA
 *   node scripts/vendor-openstudio-ui.mjs <sha>      # sync at another commit
 *   node scripts/vendor-openstudio-ui.mjs --files-only  # skip the artwork
 *
 * Every written file gets a "Source:" header naming the upstream path and
 * commit. Hand-written forks live next to vendor/ and are never touched here.
 * The knob sprite atlases are downscaled to 96 px frames (from 192 px); the
 * knob renders at 46–58 px, so that is still 2× crisp and ~8× smaller.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const OPENSTUDIO_SHA = "d2056151222fefcede123ef614ec38c6893cbfd5";
const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const sha = args[0] ?? OPENSTUDIO_SHA;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RAW = `https://raw.githubusercontent.com/sdevil7th/OpenStudio/${sha}/frontend/src`;
const VENDOR_DIR = "src/v2/daw/vendor";
const ATLAS_DIR = "public/assets/openstudio/nam/controls";
const ATLAS_FRAME_PX = 96;
const ATLAS_COLUMNS = 11;

/** @type {{ from: string; to: string; patches?: [string, string][] }[]} */
const FILES = [
  { from: "components/meterConfig.ts", to: "meterConfig.ts" },
  { from: "components/PeakMeter.tsx", to: "PeakMeter.tsx" },
  { from: "components/MasterPeakMeterCluster.tsx", to: "MasterPeakMeterCluster.tsx" },
  {
    from: "components/NAMRackControlAssets.ts",
    to: "NAMRackControlAssets.ts",
    patches: [
      ["export const NAM_KNOB_FRAME_SIZE = 192;", `export const NAM_KNOB_FRAME_SIZE = ${ATLAS_FRAME_PX};`],
      [
        'new URL("../assets/nam/controls/knob-black-atlas.webp", import.meta.url).href',
        '"/assets/openstudio/nam/controls/knob-black-atlas.webp"',
      ],
      [
        'new URL("../assets/nam/controls/knob-metal-atlas.webp", import.meta.url).href',
        '"/assets/openstudio/nam/controls/knob-metal-atlas.webp"',
      ],
      [
        'new URL("../assets/nam/controls/knob-cream-atlas.webp", import.meta.url).href',
        '"/assets/openstudio/nam/controls/knob-cream-atlas.webp"',
      ],
    ],
  },
  { from: "components/NAMRackControlTooltip.tsx", to: "NAMRackControlTooltip.tsx" },
  { from: "components/NAMRackControlTooltip.css", to: "NAMRackControlTooltip.css" },
  { from: "components/NAMRackKnob.css", to: "NAMRackKnob.css" },
  {
    from: "components/NAMRackKnob.tsx",
    to: "NAMRackKnob.tsx",
    patches: [
      ['from "../services/NativeBridge"', 'from "./stubs/nativeBridgeTypes"'],
      ['from "../utils/builtInParamValue"', 'from "./stubs/builtInParamValue"'],
      ['from "../utils/parameterWheel"', 'from "./stubs/parameterWheel"'],
    ],
  },
  {
    from: "utils/builtInParamValue.ts",
    to: "stubs/builtInParamValue.ts",
    patches: [['from "../services/NativeBridge"', 'from "./nativeBridgeTypes"']],
  },
  // NAM signal-chain rail and module tile (pure presentation, no patches).
  { from: "components/NAMSignalChainTypes.ts", to: "NAMSignalChainTypes.ts" },
  { from: "components/NAMCompactChain.tsx", to: "NAMCompactChain.tsx" },
  { from: "components/NAMCompactChain.css", to: "NAMCompactChain.css" },
  { from: "components/NAMRackChainModule.tsx", to: "NAMRackChainModule.tsx" },
  { from: "components/NAMRackChainModule.css", to: "NAMRackChainModule.css" },
  // Built-in effect graphs (EQ, compressor, …): SVG/DOM only.
  {
    from: "components/ParametricGraph/ParametricGraph.tsx",
    to: "ParametricGraph/ParametricGraph.tsx",
    patches: [['from "../../utils/parameterWheel"', 'from "../stubs/parameterWheel"']],
  },
  { from: "components/ParametricGraph/ParametricGraph.types.ts", to: "ParametricGraph/ParametricGraph.types.ts" },
  { from: "components/ParametricGraph/eqResponseCurve.ts", to: "ParametricGraph/eqResponseCurve.ts" },
  { from: "components/ParametricGraph/EQGraph.tsx", to: "ParametricGraph/EQGraph.tsx" },
  { from: "components/ParametricGraph/CompressorGraph.tsx", to: "ParametricGraph/CompressorGraph.tsx" },
  // The photoreal NAM Rack (design port) and everything it imports.
  { from: "components/NAMCabPresentation.ts", to: "NAMCabPresentation.ts" },
  { from: "components/namRackFaceplateGeometry.ts", to: "namRackFaceplateGeometry.ts" },
  { from: "utils/namMeterLevel.ts", to: "namMeterLevel.ts" },
  { from: "utils/namInstrumentProfile.ts", to: "namInstrumentProfile.ts" },
  { from: "utils/tone3000InfiniteAppend.ts", to: "tone3000InfiniteAppend.ts" },
  { from: "components/NAMToneCapturePicker.css", to: "NAMToneCapturePicker.css" },
  {
    from: "components/NAMToneCapturePicker.tsx",
    to: "NAMToneCapturePicker.tsx",
    patches: [['from "../utils/namCaptureType"', 'from "./stubs/namCaptureType"']],
  },
  {
    from: "components/NAMDesignAssets.ts",
    to: "NAMDesignAssets.ts",
    patches: [
      ['/// <reference types="vite/client" />\n', ""],
      // Upstream resolves the artwork through import.meta.glob; the website
      // serves the downscaled copies from public/ instead.
      [
        `const designBodyHrefs = import.meta.glob([
  "../assets/nam/design/bodies/*.webp",
  // Generator intermediates stay available to the asset-preparation tools,
  // but only the approved faceplates belong in the runtime bundle.
  "!../assets/nam/design/bodies/amp-head-body-v4.webp",
  "!../assets/nam/design/bodies/graphic-eq-body-v3.webp",
], {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const designControlHrefs = import.meta.glob("../assets/nam/design/controls/*.webp", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const designAssetHref = (assets: Record<string, string>, directory: "bodies" | "controls", fileName: string) => {
  const key = \`../assets/nam/design/\${directory}/\${fileName}\`;
  const href = assets[key];
  if (!href) throw new Error(\`Missing NAM design asset: \${key}\`);
  return href;
};`,
        `const designBodyHrefs: Record<string, string> = {};
const designControlHrefs: Record<string, string> = {};

const designAssetHref = (_assets: Record<string, string>, directory: "bodies" | "controls", fileName: string) =>
  \`/assets/openstudio/nam/design/\${directory}/\${fileName}\`;`,
      ],
    ],
  },
  { from: "components/NAMRackDesignPort.css", to: "NAMRackDesignPort.css" },
  {
    from: "components/NAMRackStage.css",
    to: "NAMRackStage.css",
    patches: [
      ['font-family: Inter, "Segoe UI", Arial, sans-serif;', "font-family: inherit;"],
      ['font-family: Inter, "Segoe UI Variable", "Segoe UI", Arial, sans-serif;', "font-family: inherit;"],
    ],
  },
  { from: "components/NAMRackHardware.css", to: "NAMRackHardware.css" },
  { from: "components/NAMRackDesignPortSourceFlow.css", to: "NAMRackDesignPortSourceFlow.css" },
  { from: "components/NAMRackFooter.css", to: "NAMRackFooter.css" },
  { from: "components/NAMRackHeader.css", to: "NAMRackHeader.css" },
  {
    from: "components/NAMRackDesignPort.tsx",
    to: "NAMRackDesignPort.tsx",
    patches: [
      ['from "../services/NativeBridge"', 'from "./stubs/nativeBridgeTypes"'],
      ['from "../utils/builtInParamValue"', 'from "./stubs/builtInParamValue"'],
      ['from "./NAMRackMixer"', 'from "./stubs/namRackMixerTypes"'],
      ['from "../utils/namMeterLevel"', 'from "./namMeterLevel"'],
      ['from "../utils/tone3000InfiniteAppend"', 'from "./tone3000InfiniteAppend"'],
      ['from "../utils/parameterWheel"', 'from "./stubs/parameterWheel"'],
      ['from "../utils/namInstrumentProfile"', 'from "./namInstrumentProfile"'],
      // The site scales the port with a CSS transform; getBoundingClientRect
      // would report the transformed box while layout runs in untransformed
      // pixels. Measure the layout size instead so both agree.
      [
        `      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      });`,
        `      setSize({
        width: Math.max(1, node.offsetWidth),
        height: Math.max(1, node.offsetHeight),
      });`,
      ],
      [
        `const STUDIO_BACKDROP_URL = new URL(
  "../assets/nam/rack-studio-backdrop-v2.webp",
  import.meta.url,
).href;`,
        'const STUDIO_BACKDROP_URL = "/assets/openstudio/nam/rack-studio-backdrop-v2.webp";',
      ],
    ],
  },
  { from: "components/ParametricGraph/index.ts", to: "ParametricGraph/index.ts",
    patches: [
      ['export { GateGraph } from "./GateGraph";\n', ""],
      ['export { DelayGraph } from "./DelayGraph";\n', ""],
      ['export { ReverbGraph } from "./ReverbGraph";\n', ""],
      ['export { SaturationGraph } from "./SaturationGraph";\n', ""],
      ['export { ChorusGraph } from "./ChorusGraph";\n', ""],
    ],
  },
];

const ATLASES = ["knob-black-atlas.webp", "knob-metal-atlas.webp", "knob-cream-atlas.webp"];

/**
 * Design-port artwork. The port's artboard is 768 px wide and the site shows
 * it at ≤ 960 px, so bodies are capped at 1024 px wide and controls (which
 * render ≤ 60 px) at 256 px. Only the mounted section's images ever load.
 */
const DESIGN_DIR = "public/assets/openstudio/nam/design";
const DESIGN_BODIES = [
  "amp-head-body", "amp-head-body-wide", "amp-head-body-v5", "cabinet-body", "cab-room-integrated-body",
  "graphic-eq-body-v6", "ir-shaper-panel-body", "mic-panel-body", "stompbox-body-blue", "stompbox-body-blue-wide",
  "stompbox-body-dark", "stompbox-body-dark-wide", "stompbox-body-olive", "stompbox-body-red", "stompbox-body-red-wide",
  "stompbox-body-stone", "stompbox-body-white-wide", "wide-pedal-body-copper", "wide-pedal-body-copper-deep",
  "wide-pedal-body-copper-tall", "wide-pedal-body-dark", "wide-pedal-body-dark-deep", "wide-pedal-body-dark-tall",
  "wide-pedal-body-navy", "wide-pedal-body-navy-deep", "wide-pedal-body-navy-tall",
];
const DESIGN_CONTROLS = [
  "button-black-top", "footswitch-chrome-off-top", "footswitch-chrome-on-top", "footswitch-chrome-pressed-top",
  "knob-black-top", "knob-black-panel-v4", "knob-blue-steel-top", "knob-blue-steel-panel-v4", "knob-cream-top",
  "knob-metal-top", "led-amber-off-top", "led-amber-off-panel-v4", "led-amber-on-top", "led-amber-on-panel-v4",
  "mic-dynamic-57", "mic-ribbon-121", "screw-phillips-top", "slider-metal-top", "slider-metal-cap-v4",
  "toggle-chrome-top", "toggle-chrome-panel-v4", "washer-chrome-top",
];
const DESIGN_ASSETS = [
  ...DESIGN_BODIES.map((name) => ({ from: `assets/nam/design/bodies/${name}.webp`, to: `${DESIGN_DIR}/bodies/${name}.webp`, maxWidth: 1024, quality: 78 })),
  ...DESIGN_CONTROLS.map((name) => ({ from: `assets/nam/design/controls/${name}.webp`, to: `${DESIGN_DIR}/controls/${name}.webp`, maxWidth: 256, quality: 82 })),
  { from: "assets/nam/rack-studio-backdrop-v2.webp", to: "public/assets/openstudio/nam/rack-studio-backdrop-v2.webp", maxWidth: 1280, quality: 74 },
];

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.text();
};

const fetchBuffer = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
};

const header = (from, css) => {
  const line = `Source: OpenStudio frontend/src/${from} @ ${sha}`;
  const note = "Vendored by scripts/vendor-openstudio-ui.mjs — do not edit by hand, re-run the script.";
  return css ? `/* ${line}\n   ${note} */\n` : `// ${line}\n// ${note}\n`;
};

const syncFile = async ({ from, to, patches = [] }) => {
  let text = await fetchText(`${RAW}/${from}`);
  for (const [search, replacement] of patches) {
    if (!text.includes(search)) throw new Error(`Patch target not found in ${from}: ${search}`);
    text = text.split(search).join(replacement);
  }
  const target = path.join(root, VENDOR_DIR, to);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, header(from, to.endsWith(".css")) + text);
  console.log(`vendored ${VENDOR_DIR}/${to}`);
};

const syncAtlas = async (name) => {
  const source = await fetchBuffer(`${RAW}/assets/nam/controls/${name}`);
  const size = ATLAS_FRAME_PX * ATLAS_COLUMNS;
  const target = path.join(root, ATLAS_DIR, name);
  await mkdir(path.dirname(target), { recursive: true });
  await sharp(source).resize(size, size, { kernel: "lanczos3" }).webp({ quality: 88, alphaQuality: 95 }).toFile(target);
  console.log(`vendored ${ATLAS_DIR}/${name} (${size}×${size})`);
};

const syncDesignAsset = async ({ from, to, maxWidth, quality }) => {
  const source = await fetchBuffer(`${RAW}/${from}`);
  const target = path.join(root, to);
  await mkdir(path.dirname(target), { recursive: true });
  const info = await sharp(source)
    .resize({ width: maxWidth, withoutEnlargement: true, kernel: "lanczos3" })
    .webp({ quality, alphaQuality: 95 })
    .toFile(target);
  console.log(`vendored ${to} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`);
};

const only = process.argv.includes("--files-only");
for (const file of FILES) await syncFile(file);
if (!only) {
  for (const atlas of ATLASES) await syncAtlas(atlas);
  for (const asset of DESIGN_ASSETS) await syncDesignAsset(asset);
}
console.log(`done @ ${sha}`);
