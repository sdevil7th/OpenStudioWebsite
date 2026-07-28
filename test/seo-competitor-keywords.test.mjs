import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import sharp from "sharp";

const files = {
  blogs: readFileSync(new URL("../src/data/blogs.ts", import.meta.url), "utf8"),
  downloads: readFileSync(new URL("../src/data/downloads.ts", import.meta.url), "utf8"),
  features: readFileSync(new URL("../src/data/features.ts", import.meta.url), "utf8"),
  home: readFileSync(new URL("../src/data/home.ts", import.meta.url), "utf8"),
  index: readFileSync(new URL("../index.html", import.meta.url), "utf8"),
  pageSeo: readFileSync(new URL("../src/components/PageSeo.tsx", import.meta.url), "utf8"),
  prerender: readFileSync(
    new URL("../scripts/prerender-route-metadata.mjs", import.meta.url),
    "utf8",
  ),
  stemSeparation: readFileSync(
    new URL("../src/data/stemSeparation.ts", import.meta.url),
    "utf8",
  ),
};

const allSeoSource = Object.values(files).join("\n");

test("seo competitor keywords cover popular DAW alternatives", () => {
  [
    "alternative to Cubase",
    "alternative to Pro Tools",
    "alternative to Reaper",
    "alternative to Ableton Live",
    "alternative to FL Studio",
    "alternative to Logic Pro",
    "Studio One alternative",
    "Bitwig Studio alternative",
    "Reason alternative",
    "GarageBand alternative",
    "Audacity alternative",
    "Cakewalk alternative",
    "Waveform alternative",
    "Mixcraft alternative",
  ].forEach((phrase) => assert.match(allSeoSource, new RegExp(phrase)));
});

test("seo competitor keywords cover popular AI music alternatives", () => {
  [
    "Suno AI killer",
    "Suno AI alternative",
    "alternative to Suno AI",
    "Udio alternative",
    "ElevenLabs Music alternative",
    "Eleven Music alternative",
    "Stable Audio 3 alternative",
    "Google MusicFX alternative",
    "Google Lyria alternative",
    "MiniMax Music alternative",
    "Mureka alternative",
    "Sonauto alternative",
    "AIVA alternative",
    "Beatoven.ai alternative",
    "Mubert alternative",
    "Soundraw alternative",
    "Boomy alternative",
  ].forEach((phrase) => assert.match(allSeoSource, new RegExp(phrase.replace(".", "\\."))));
});

test("critical static and prerender metadata include the Suno positioning", () => {
  assert.match(files.index, /Suno AI killer/);
  assert.match(files.prerender, /Suno AI killer/);
  assert.match(files.home, /Suno AI killer/);
  assert.match(files.stemSeparation, /local Suno AI killer/);
});

test("NAM Rack search language is synchronized across runtime and static metadata", () => {
  const namPhrases = [
    "free guitar amp simulator",
    "free guitar rig",
    "open-source amp simulator",
    "NAM A2 player",
    "Neural Amp Modeler DAW",
    "AmpliTube alternative",
    "Guitar Rig alternative",
    "Neural DSP alternative",
    "free amp capture software",
    "TONE3000 integration",
  ];

  ["home", "features", "index", "prerender"].forEach((fileKey) => {
    namPhrases.forEach((phrase) =>
      assert.match(
        files[fileKey],
        new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        `${fileKey} should include ${phrase}`,
      ),
    );
  });

  assert.match(files.home, /Built-in Neural Amp Modeler A1\/A2 guitar rack/);
  assert.match(files.prerender, /Built-in Neural Amp Modeler A1\/A2 guitar rack/);
  assert.match(files.pageSeo, /twitter:image:alt/);
  assert.match(files.blogs, /building-openstudio-nam-rack/);
});

test("static and runtime social metadata use the fingerprinted NAM master dimensions", async () => {
  const heroPath = new URL(
    "../public/assets/blogs/building-openstudio-nam-rack.webp",
    import.meta.url,
  );
  const heroBytes = readFileSync(heroPath);
  const heroHash = createHash("sha256")
    .update(heroBytes)
    .digest("hex")
    .slice(0, 14);
  const heroMetadata = await sharp(heroBytes).metadata();

  assert.ok(heroMetadata.width);
  assert.ok(heroMetadata.height);
  assert.ok(
    files.index.includes(
      `building-openstudio-nam-rack.webp?v=${heroHash}`,
    ),
  );
  assert.ok(
    files.index.includes(
      `property="og:image:width" content="${heroMetadata.width}"`,
    ),
  );
  assert.ok(
    files.index.includes(
      `property="og:image:height" content="${heroMetadata.height}"`,
    ),
  );
  assert.match(files.pageSeo, /withVersionQuery/);
  assert.match(files.pageSeo, /intrinsicImageDimensions/);
  assert.match(files.prerender, /readPublicImageMetadata/);
  assert.match(files.prerender, /\["property", "og:image:width"\]/);
  assert.match(files.prerender, /\["property", "og:image:height"\]/);
});

test("home and features publish an explicit deterministic sitemap update date", () => {
  assert.match(files.prerender, /const namRackContentLastmod = "2026-07-27"/);
  assert.match(
    files.prerender,
    /path: "\/"[\s\S]*lastmod: namRackContentLastmod/,
  );
  assert.match(
    files.prerender,
    /path: "\/features"[\s\S]*lastmod: namRackContentLastmod/,
  );
});
