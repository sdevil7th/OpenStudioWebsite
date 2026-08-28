# OpenStudio web fonts

`google-fonts-20260815.css` is a self-hosted snapshot of the Google Fonts
stylesheet previously requested by `index.html`. Its 23 WOFF2 files are stored
unchanged under `google/<family>/<upstream-version>/`, including every language
subset returned for these families and weights:

- Fraunces 300–700, normal and italic, with optical sizing
- Inter 300–800
- JetBrains Mono 400–700
- Orbitron 500–900
- Space Grotesk 400, 500, and 700

`google-fonts-20260815.json` records the source URL and SHA-256 digest for every
file. The SIL Open Font License for each family is in `licenses/`.

Run `node scripts/vendor-google-fonts.mjs` only to reproduce this dated
snapshot. If the pinned upstream stylesheet changes, create a newly dated
snapshot and update `index.html`; do not overwrite an already deployed URL.
