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

Both routes now rewrite to path-based Netlify function endpoints:

- `/.netlify/functions/download-latest-windows`
- `/.netlify/functions/download-latest-macos`

These dedicated functions check the latest GitHub Release for `sdevil7th/OpenStudio`, find the best matching asset for the requested platform, and fall back to the release surfaces when no matching asset exists yet.

## Environment Variables

- `GITHUB_TOKEN`

`GITHUB_TOKEN` is optional for local testing, but recommended for Netlify production deploys to reduce the risk of GitHub API rate limits. If it is not set, the download lookup and GitHub snapshot functions fall back to unauthenticated GitHub API requests.

## Local Redirect Testing

Start the local dev server:

```bash
npm install
npm run dev
```

Then verify these URLs locally:

```bash
curl -I http://localhost:8080/download/windows/latest
curl -I http://localhost:8080/download/macos/latest
curl -I http://localhost:8080/.netlify/functions/download-latest-windows
curl -I http://localhost:8080/.netlify/functions/download-latest-macos
curl http://localhost:8080/.netlify/functions/github-repo
```

The two download URLs should respond with `302` and a `Location` header pointing to the latest matching GitHub release asset, or to the release page fallback if no matching asset exists.

## Netlify Deployment

1. Connect the repo to Netlify or push the branch already connected to the Netlify site.
2. In the Netlify site settings, set:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variable: `GITHUB_TOKEN` (recommended)
3. Deploy the updated branch.

## Post-Deploy Verification

After Netlify finishes deploying, verify:

```bash
curl -I https://openstudiowebsite.netlify.app/download/windows/latest
curl -I https://openstudiowebsite.netlify.app/download/macos/latest
curl -I https://openstudiowebsite.netlify.app/.netlify/functions/download-latest-windows
curl -I https://openstudiowebsite.netlify.app/.netlify/functions/download-latest-macos
curl https://openstudiowebsite.netlify.app/.netlify/functions/github-repo
```

Check that:

- `/download/windows/latest` returns `302`
- `/download/macos/latest` returns `302`
- the `Location` header points to the latest GitHub release asset for the matching platform
- the GitHub snapshot function returns JSON successfully

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
