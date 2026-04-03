# OpenStudio Website

Static marketing site for the first public OpenStudio release.

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Netlify

- Netlify config lives in [netlify.toml](./netlify.toml).
- `/download/windows/latest` and `/download/macos/latest` are real redirects, not React routes.
- All other paths fall back to `/index.html` so direct refresh works for React Router pages like `/features` and `/download`.

## Update Release Redirects

- `/download/windows/latest`
- `/download/macos/latest`

Both routes now resolve through a Netlify function that checks the latest GitHub Release for the right asset and falls back to the release surfaces when no matching asset exists yet.

## Assets

- Branding assets live in `public/assets/openstudio/branding/`
- Screenshot assets live in `public/assets/openstudio/screenshots/`
- Share image contract lives at `public/assets/openstudio/branding/og-image.png`

The screenshot model is defined in `src/data/screenshots.ts`. Missing screenshots intentionally fall back to labeled placeholders in the UI.

## First Release URLs

- `https://openstudio.org.in/`
- `https://openstudio.org.in/features`
- `https://openstudio.org.in/download`
- `https://openstudio.org.in/download/windows/latest`
- `https://openstudio.org.in/download/macos/latest`
