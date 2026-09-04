#!/usr/bin/env node
/**
 * Re-syncs the OpenStudio UI sources vendored under src/v2/daw/vendor/ from a
 * pinned commit of sdevil7th/OpenStudio, applying the small deterministic
 * patches that make them build inside this site (import paths, asset URLs).
 *
 *   node scripts/vendor-openstudio-ui.mjs            # sync at OPENSTUDIO_SHA
 *   node scripts/vendor-openstudio-ui.mjs <sha>      # sync at another commit
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
const sha = process.argv[2] ?? OPENSTUDIO_SHA;
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
];

const ATLASES = ["knob-black-atlas.webp", "knob-metal-atlas.webp", "knob-cream-atlas.webp"];

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

for (const file of FILES) await syncFile(file);
for (const atlas of ATLASES) await syncAtlas(atlas);
console.log(`done @ ${sha}`);
