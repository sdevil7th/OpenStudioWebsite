import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
  downloads: readFileSync(new URL("../src/data/downloads.ts", import.meta.url), "utf8"),
  features: readFileSync(new URL("../src/data/features.ts", import.meta.url), "utf8"),
  home: readFileSync(new URL("../src/data/home.ts", import.meta.url), "utf8"),
  index: readFileSync(new URL("../index.html", import.meta.url), "utf8"),
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
