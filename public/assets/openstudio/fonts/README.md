# OpenStudio web fonts

`google-fonts-20260915.css` is the redesign's retained subset of the pinned
August 15 Google Fonts snapshot. Its 17 WOFF2 files are stored unchanged under
`google/<family>/<upstream-version>/`, including the language subsets for these
four families and weights (80 face declarations):

- Inter 300–800
- JetBrains Mono 400–700
- Orbitron 500–900
- Space Grotesk 400, 500, and 700

`google-fonts-20260915.json` records the original source date, retained-subset
date, source URLs and SHA-256 digests. The SIL Open Font License for each retained
family is in `licenses/`. Fraunces and its unused binaries were removed.

Run `node scripts/vendor-google-fonts.mjs` from the repository root only to
reproduce this subset. It verifies the pinned upstream stylesheet before removing
Fraunces. If that stylesheet changes, create a newly dated snapshot and update
`index.html` and the integrity tests; do not overwrite an already deployed URL.
