# Home hero Aura lifecycle

The hero retains the original `pastel-abstract-background-soft-glowing-hd-web-designs`
embed at `aura.promad.design`, with `theme=light`. No renderer settings, effects,
colours, resolution or frame rate are overridden by the website.

The page renders its existing light fallback before JavaScript. Loading the iframe
is deferred until interaction or the quiet fallback, and only starts with a visible
hero in a visible document. Initial reduced motion does not mount the iframe.

## Readiness and failure

An iframe's load event cannot confirm that the asynchronous scene request or lazy
renderer succeeded, and is not used to trigger readiness. Active startup frames
remain renderable at zero opacity: `visibility:hidden` can suspend frame callbacks
in a visible browser and deadlock readiness. The host uses the provider's existing `promad-aura:capture`
message API and validates replies against the exact origin, iframe window and
request ID. This API was inspected and exercised against the live embed on
20 September 2026. It is an external, unversioned integration; it is not a web
standard or a provider-guaranteed readiness contract.

Readiness requires an actual PNG with the opaque, near-white upper centre of this
specific light scene, followed by another successful check after the original
3.5-second settling period. The current capture implementation returns black if
the lazy canvas is absent/unpainted, and an error if the scene container is absent.
Neither is revealed. Replies containing malformed, oversized, transparent or dark
images also leave the fallback in place. A 30-second foreground probe timeout
removes an unresponsive iframe. Unsupported/changed provider behaviour therefore
keeps the fallback instead of revealing a browser error or black background.

Captures use quarter-size output only for the startup check, never for the visible
animation. The PNG passes between frames inside the browser; the host does not
upload it or invoke a Netlify function. This adds the provider's capture helper download and a small amount of
startup work. Probes stop after readiness, while offscreen, in a hidden tab, on
reduced motion, and on unmount. The timeout restarts if an unfinished scene returns
to the viewport. It does not run indefinitely while offscreen.

## Pause and resume

Scrolling away retains the same iframe and its ready state; returning reveals the
same scene without a reload or repeated startup checks. The host tracks viewport
intersection and document visibility and hides the frame when inactive. The
current provider also observes intersection and reduced motion internally.
Chromium checks verify actual animation callbacks stop offscreen and resume on
return, not merely that the host's `data-playing` attribute changes. CSS visibility
alone is not a cross-browser pause API, so other engines require live verification.

Changing the OS reduced-motion preference removes the iframe. Re-enabling motion
creates a new component instance with fresh readiness and cancelled old probes.
This accessibility preference is separate from ordinary viewport pause/resume.

## Verification

`test/hero-aura-browser.test.mjs` exercises the cross-origin protocol with controlled
slow, dark, unresponsive and successful scenes, stale readiness after preference
changes, and iframe identity across scrolling. Run `npm run build`, `npm run lint`,
`npm test` and `npm run verify:perf`.

The initial-load performance gate ends before the deferred iframe starts. Inspect
the live scene after activation as well; passing that gate does not demonstrate
low ongoing CPU use. Preserve the approved scene when comparing visuals, including
phone, tablet, both sides of the 900 px navigation breakpoint, and desktop, and
test delayed uncached navigation and reduced motion. Never make CI depend on live
third-party availability.
