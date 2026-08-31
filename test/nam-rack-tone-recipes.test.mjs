import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const blog = readFileSync(
  new URL(
    "../blogs/2026-08-28-build-guitar-tones-with-openstudio-nam-rack.md",
    import.meta.url,
  ),
  "utf8",
);

test("NAM Rack recipes record the guitars and input-dependent result", () => {
  assert.match(blog, /Kramer Baretta Special and a Fender Telecaster/);
  assert.match(blog, /depends on the output and voicing of the pickups/);
  assert.match(blog, /\*\*Bestest clean!\*\* and \*\*good highgain riff\*\* were tested/);
  assert.doesNotMatch(blog, /translated well across both guitars/);
});

test("high-gain recipe matches the current saved preset", () => {
  assert.match(blog, /Gate \| −54\.4 dB, 80 ms Release/);
  assert.match(
    blog,
    /EQ Boost \(PRE EQ\) \| On; 120 Hz \+4\.2 dB,[^\n]+2\.5 kHz \+4\.5 dB,[^\n]+12 kHz \+4\.0 dB; HPF\/LPF off/,
  );
  assert.match(
    blog,
    /Full-rig capture \| Peavey 5150 \+ Maxon\/OD808 \+ Mesa OS \+ SM57; Amp Quality Full/,
  );
  assert.match(
    blog,
    /Amp wrapper \| Gain −4\.2 dB; Tight Boost on; Bright Voice off; Bass \+4\.9 dB; Mid −3\.3 dB; Treble \+2\.6 dB; Presence 0 dB; Mix 100%; Output −1\.4 dB/,
  );
  assert.match(blog, /Cabinet Room \| Off/);
  assert.match(
    blog,
    /Graphic EQ \| On; HPF 50 Hz; 65 Hz \+0\.6 dB,[^\n]+LPF 19\.1 kHz; Level −2\.0 dB/,
  );
  assert.match(blog, /Output \| −2\.8 dB/);
});

test("clean recipe records its saved amp quality and voice state", () => {
  assert.match(blog, /Amp capture \| Fender TwinVerb Vibrato Bright; Amp Quality Economy/);
  assert.match(blog, /Amp wrapper \| Gain \+7\.5 dB; Bright Voice off;/);
});

test("high-gain recipe explains why no additional overdrive is used", () => {
  assert.match(blog, /capture already has a Maxon\/OD808 baked into it/);
  assert.match(blog, /mild EQ Boost shaping rather than stacking another drive or overdrive/);
  assert.doesNotMatch(blog, /Gate \| −59\.8 dB/);
  assert.doesNotMatch(blog, /12 kHz \+7\.0 dB/);
});
