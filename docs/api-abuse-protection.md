# Protecting Netlify function usage

Implementation reviewed on 2026-09-17. This is protection against unnecessary
compute and repeated requests, not a guarantee against distributed denial of service.

## Request paths

| Surface | Delivery | Runtime upstream requests |
| --- | --- | --- |
| Repository and release JSON | Static `/github/repository.json` and `/github/latest-release.json` | 0 |
| Old raw `/.netlify/functions/*` URLs | Same protected resolver; old GitHub URLs redirect to static JSON | 0 |
| App downloads, Windows runtime, explicit runtime architectures | Build-generated CDN 302 redirects to GitHub | 0 |
| macOS/Linux runtime architecture detection and old app `?platform=` URL | One `download-resolver` function, using bundled manifests | 0 |
| Appcasts and release manifests | Existing static documents, unchanged | 0 |

`scripts/generate-download-routing.mjs` runs after staging and validation, before
TypeScript/build. It creates ignored `shared/generatedDownloadCatalog.ts`; prerendering
uses the same catalog to emit `dist/_redirects`. Never hand-edit either output.
Prerendering also saves app destinations in `dist/.vite/download-routing.json`.
Local production preview reads the built redirects, this snapshot and the runtime
manifest in `dist`; running development data generation afterward does not alter
the preview's downloads. Rebuild to update them. Legacy download paths accept
mixed-case platform names and trailing slashes in the resolver, dev and preview.
Published manifests remain the first source for stable download destinations;
the fetched GitHub snapshot supplies the existing app-platform fallback.
The release-publish workflow must deploy functions as well as `dist`, keeping the
bundled resolver and static redirects in the same atomic deployment.

GitHub statistics and release snapshots refresh on website builds, not per visitor.
The desktop release dispatch should trigger a website deployment, as described in
[RELEASE_SYNC.md](../RELEASE_SYNC.md). A standalone GitHub release without a website
deployment does not update the published website snapshot. To refresh manually,
run the normal build and deploy. Do not add a public refresh endpoint.

The browser shares in-flight/successful data requests. Failed reads have a 30-second
cooldown, doubling after repeated failures to a five-minute maximum. Build-time
fallbacks remain available. This improves client behavior; bots can bypass it.

## Native rate limit

`netlify/functions/download-resolver.ts` configures 60 requests per 60 seconds,
aggregated by IP and domain. Its explicit paths include the public dynamic URLs
and all retained raw function aliases. Netlify disables its implicit `/.netlify/functions/download-resolver`
URL when custom paths are configured. Netlify rejects `/.netlify/*` as a CDN
redirect source, so old raw function aliases run through this same protected function. Public fixed `/download/*`
URLs are static rules. The old GitHub aliases return cacheable 302s to the
static JSON documents; standard fetch clients follow them automatically. Unknown
paths never invoke the resolver. Non-GET/HEAD requests to the resolver return 405 without reading bodies or contacting upstream services.

All methods remain included in the native rule, so POST floods are also counted.
The handler's 405 alone is not quota protection: it still runs code for allowed
requests. Header-dependent redirects use `Cache-Control: no-store` so an ARM
response cannot be replayed to an Intel client.

Netlify Free supports two code-defined rules; this uses one function rule. The
advanced dashboard rule editor is an Enterprise feature. Enforcement occurs before
function execution, but can lag by up to ten seconds. Per-IP rules do not impose
a global spending or invocation cap. Shared-IP users share a limit; different
domains have separate counters. Static requests still consume applicable bandwidth
and request quotas. See [Netlify rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/),
[function configuration](https://docs.netlify.com/build/functions/configuration/) and
[request processing order](https://docs.netlify.com/resources/troubleshooting/request-chain/).

## Verification

Run `npm run build`, `npm run lint`, `npm test` and `npm run verify:perf`.
`node --test test/download-routing.test.mjs` includes a bounded 5,000-call local
handler test with all upstream fetches forbidden. It tests legacy URLs, query/header/UA
architecture precedence, HEAD, unsupported methods and generated static rules.
This verifies zero upstream amplification; it does not emulate Netlify's limiter.

To inspect Netlify's actual bundle metadata without deploying:

```sh
npx @netlify/zip-it-and-ship-it netlify/functions output/review/function-bundle --manifest output/review/function-manifest.json
```

Expect one function, the explicit compatibility routes and a `trafficRules` entry
with `windowLimit: 60`, `windowSize: 60`, and IP/domain aggregation. Store local
logs in ignored `output/review/`.

After deployment:

1. Check deploy post-processing logs for acceptance of the rate-limit rule. Confirm
   only `download-resolver` is deployed; old functions must not remain exposed.
2. Smoke-test static JSON, the legacy JSON redirects and all download URLs with redirects disabled
   (do not download installers). Check manifest versions against redirect targets.
3. On a deploy preview, make a capped single-IP test of 61 HEAD requests to a dynamic
   URL over about 30 seconds, allow 10 seconds for enforcement, then make at most
   three probes. Expect 429; stop immediately on 429 or service errors. Do not
   use rotating IPs, prolonged loops or production load tests. Check recovery after
   the window expires and inspect function usage. The initial requests can count
   against quota, and this cap cannot prove behavior under distributed load.
4. If Netlify rejects the rule or returns no 429 in that bounded check, investigate
   the deployment configuration rather than increasing traffic.

These rules apply to deployments containing this code. Previously published immutable
deploy URLs can still expose their original functions; restrict unpublished deploy
access where available and account for those URLs when investigating continued usage.

Production remains unprotected by these changes until this code is deployed.
Dashboard traffic totals alone do not prove code-rule enforcement.
