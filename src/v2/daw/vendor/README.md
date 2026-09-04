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
| `NAMRackStage.css` | its two `font-family` declarations → `inherit` (the stage sets the family) |
| `NAMDesignAssets.ts` | the `import.meta.glob` lookups → `/assets/openstudio/nam/design/{bodies,controls}/…` public paths |
| `NAMToneCapturePicker.tsx` | `utils/namCaptureType` → `stubs/namCaptureType` (type only) |
| design artwork | 26 bodies capped at 1024 px wide and 22 controls at 256 px via sharp (~1.6 MB total); the backdrop at 1280 px |

Upstream is React 19 + Tailwind 4; the website is React 18 + Tailwind 3. The Tailwind
`daw-*` / `meter-*` colour tokens these files use are declared in `tailwind.config.ts`, and
the base `.nam-rack-control-knob` / `.vertical-fader` rules (which upstream keeps in
`FXChainPanel.css` and `index.css`) live in `src/styles/daw.css`.

The store-bound components (`ChannelStrip`, `MainToolbar`, `BigClock`, `TimelineRuler`,
`Playhead`) are **not** vendored — they are re-implemented as props-only forks one level up
in `src/v2/daw/*Lite.tsx`. The piano roll and pitch editor (Konva/store-bound upstream) are
rebuilt as small SVG stages in `src/v2/daw/stages/`.

The NAM Rack design port and its six stylesheets are chunked separately (`nam-design-port`
in `vite.config.ts`) so only the NAM page loads them; everything else shared by the stages
lands in `daw-core`.
