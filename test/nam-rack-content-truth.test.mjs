import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const contract = JSON.parse(
  readFileSync(
    new URL("./fixtures/openstudio-nam-rack-contract.json", import.meta.url),
    "utf8",
  ),
);
const blog = readFileSync(
  new URL("../blogs/2026-07-26-building-openstudio-nam-rack.md", import.meta.url),
  "utf8",
);
const features = readFileSync(
  new URL("../src/data/features.ts", import.meta.url),
  "utf8",
);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("NAM Rack content contract records independently auditable app provenance", () => {
  assert.equal(contract.schemaVersion, 1);
  assert.equal(contract.provenance.repository, "https://github.com/sdevil7th/OpenStudio");
  assert.match(contract.provenance.baseCommit, /^[a-f0-9]{40}$/);
  assert.equal(contract.provenance.sources.length, 2);

  contract.provenance.sources.forEach((source) => {
    assert.match(source.path, /^(frontend|Source)\//);
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
  });
});

test("NAM Rack copy matches the app-derived five-pedal pre-effect chain", () => {
  assert.equal(contract.preEffects.length, 5);

  contract.preEffects.forEach(({ label, parameterId }) => {
    assert.match(label, /\S/);
    assert.match(parameterId, /Enabled$/);
    assert.match(blog, new RegExp(`\\*\\*${escapeRegExp(label)}\\*\\*`));
    assert.match(features, new RegExp(escapeRegExp(label), "i"));
  });

  assert.match(blog, /Pedals page now shows Compressor, Stereo Poly Octaver, PRE EQ, Precision Drive, and Distortion/);

  const preEffectOrder = contract.preEffects
    .map(({ label }) => `->\\s*${escapeRegExp(label)}`)
    .join("[\\s\\S]*");
  assert.match(blog, new RegExp(`${preEffectOrder}[\\s\\S]*->\\s*A1/A2 amp`, "i"));

  assert.match(features, /Compressor, Stereo Poly Octaver, PRE EQ, Precision Drive, and Distortion/);
  assert.match(features, /Precision Drive → distortion → optional Pedal NAM → A1\/A2 amp or full-rig capture/);
});

test("NAM Rack post-effect copy matches the app-derived reorderable stages", () => {
  assert.deepEqual(
    contract.postEffects.map(({ id }) => id),
    ["eq", "mod", "delay", "reverb"],
  );

  contract.postEffects.forEach(({ label, parameterId }) => {
    assert.match(parameterId, /Enabled$/);
    assert.match(blog, new RegExp(escapeRegExp(label), "i"));
  });

  assert.match(blog, /four reorderable post effects/);
});

test("NAM Rack copy excludes the removed Laser stage and retired UI claims", () => {
  contract.retiredEffects.forEach(({ label }) => {
    const retiredEffect = new RegExp(`\\b${escapeRegExp(label)}\\b`, "i");
    assert.doesNotMatch(blog, retiredEffect);
    assert.doesNotMatch(features, retiredEffect);
  });

  assert.doesNotMatch(
    blog,
    /Rectifier|Low Sweep|Sweep Ring|Ring Drive|Laser Steps|Faux Vibe/,
  );
  assert.doesNotMatch(blog, /Intensity, Speed, Sensitivity, Envelope, and Latch/);
  assert.doesNotMatch(blog, /equal-power mixing avoids a level dip/);
});
