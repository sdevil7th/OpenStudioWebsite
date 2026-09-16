# Vendored OpenStudio UI

Files in this directory (except the hand-written `stubs/nativeBridgeTypes.ts`,
`stubs/parameterWheel.ts`, `stubs/namCaptureType.ts`, `stubs/namRackMixerTypes.ts` and this
README) are copied from
[sdevil7th/OpenStudio](https://github.com/sdevil7th/OpenStudio) `frontend/src/` at the
commit pinned in `scripts/vendor-openstudio-ui.mjs`. Do not edit them by hand — change the
patch list in the script and re-run it:

```sh
node scripts/vendor-openstudio-ui.mjs          # re-sync at the pinned commit
node scripts/vendor-openstudio-ui.mjs <sha>    # try a newer commit
node scripts/vendor-openstudio-ui.mjs --files-only   # skip the artwork downloads
```

What the script changes on the way in:

| File | Change |
|---|---|
| `NAMRackControlAssets.ts` | `new URL(../assets/…, import.meta.url)` → `/assets/openstudio/nam/controls/…` public paths; frame size 192 → 96 px |
| `NAMRackKnob.tsx` | store-bound imports (`services/NativeBridge`, `utils/builtInParamValue`, `utils/parameterWheel`) → `./stubs/*` |
| `stubs/builtInParamValue.ts` | same import rewrite |
| knob atlases | downscaled to 96 px frames (1056×1056) with sharp; the knob renders at ≤ 58 px |
| `NAMCompactChain.*`, `NAMRackChainModule.*`, `NAMSignalChainTypes.ts` | copied unchanged |
| `ParametricGraph/*` | `utils/parameterWheel` → `../stubs/parameterWheel`; only the EQ and compressor graphs are exported from `index.ts` |
| `NAMRackDesignPort.tsx` | store/util imports → `./stubs/*` and sibling vendored utils; `NAMRackMixer` type → `stubs/namRackMixerTypes`; studio backdrop → `/assets/openstudio/nam/…`; `useElementSize` measures `offsetWidth/Height` so a CSS-scaled host lays out consistently |
| `NAMRackDesignPort.tsx` initial canvas | optional `initialStageSize` seeds `useElementSize` for the website's fixed 960×540 stage; the tour uses a 668×248 inner canvas and hardware tiles 950×530, preventing cropped artwork before browser measurements |
| `NAMRackStage.css` | its two `font-family` declarations → `inherit` (the stage sets the family) |
| `NAMDesignAssets.ts` | the `import.meta.glob` lookups → `/assets/openstudio/nam/design/{bodies,controls}/…` public paths |
| `NAMToneCapturePicker.tsx` | `utils/namCaptureType` → `stubs/namCaptureType` (type only) |
| design artwork | 26 bodies capped at 1024 px wide and 22 controls at 256 px via sharp (~1.6 MB total); the backdrop at 1280 px |

Upstream is React 19 + Tailwind 4; the website is React 18 + Tailwind 3. The Tailwind
`daw-*` / `meter-*` colour tokens these files use are declared in `tailwind.config.ts`, and
the base `.nam-rack-control-knob` / `.vertical-fader` rules (which upstream keeps in
`FXChainPanel.css` and `index.css`) live in `src/styles/daw.css`.

The store-bound components (`ChannelStrip`, `MixerPanel` + `SortableTrack`, `TrackHeader` +
`MasterTrackHeader`, `MainToolbar`, `BigClock`, `TimelineRuler`, `Playhead`, `ui/Knob`,
`ui/Select`) are **not** vendored — they are re-implemented as props-only forks one level up
in `src/features/daw-preview/*Lite.tsx`. The Konva clip renderers in `Timeline.tsx` (audio waveform, MIDI
thumbnail, recording clip) are redrawn as SVG in `ClipLite.tsx`, with deterministic peaks and
notes from `clipArt.ts` standing in for the engine's waveform cache. The piano roll and pitch
editor (Konva/store-bound upstream) are rebuilt as small SVG stages in `src/features/daw-preview/stages/`.

The NAM Rack design port and its stylesheets follow the lazy NAM Rack page. That
page imports its renderer directly so it can show the real rest frame before
animation starts. Other pages import only their own renderers; the full design
port is not forced into the site entry or text/legal pages. GSAP remains deferred
until the initial load has settled and a timeline is eligible to play. See
[illustration loading](../../../../docs/illustration-loading.md).

Website integration patches also keep source-flow effects synchronized with their configuration. Eight upstream `!important` declarations remain in `NAMRackHardware.css` to preserve the control geometry; authored site CSS uses none. The no-JavaScript loader override is separately scoped in `index.html`.
