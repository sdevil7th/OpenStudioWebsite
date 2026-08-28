import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMeasurementCases,
  DEFAULT_BUDGETS,
  DEFAULT_HERO_SELECTOR,
  DESKTOP_BUDGETS,
  evaluateResult,
  MATRIX_ROUTES,
  normalizeLocalPreviewRoute,
  parseOptions,
  PROFILE_DEFINITIONS,
  resolveProfileOptions,
} from "../scripts/verify-mobile-load-perf.mjs";

const passingResult = () => ({
  errors: {
    console: [],
    page: [],
    requests: [],
    responses: [],
  },
  metrics: {
    appReadyMs: 2_000,
    cls: 0.03,
    content: {
      heroFound: true,
      heroIsStaticFallback: false,
      loaderPresent: false,
      mainFound: true,
      mainIsStaticFallback: false,
    },
    contentVisibleMs: 4_200,
    introAfterReadyMs: 500,
    introHiddenMs: 4_100,
    lcpMs: 3_000,
    longTaskCount: 4,
    longTaskMaxMs: 220,
    longTaskTotalMs: 510,
    observerSupport: {
      cls: true,
      lcp: true,
      longTask: true,
    },
  },
  navigationStatus: 200,
  network: {
    redirectCount: 0,
    requestCount: 24,
    transferKb: 330,
  },
});

test("mobile performance options support environment and CLI overrides", () => {
  const options = parseOptions(
    [
      "--max-app-ready-ms",
      "2800",
      "--max-intro-after-ready-ms",
      "650",
      "--max-cls=0.08",
      "--max-lcp-ms=3800",
      "--route",
      "features",
    ],
    {
      MOBILE_PERF_MAX_APP_READY_MS: "3000",
      MOBILE_PERF_MAX_REQUESTS: "32",
      MOBILE_PERF_URL: "https://example.com",
    },
  );

  assert.equal(options.appReadyMs, 2_800);
  assert.equal(options.cls, 0.08);
  assert.equal(options.introAfterReadyMs, 650);
  assert.equal(options.lcpMs, 3_800);
  assert.equal(options.requestCount, 32);
  assert.equal(options.route, "/features");
  assert.equal(options.url, "https://example.com/");
  assert.equal(options.profile, "mobile");
  assert.equal(options.heroSelector, DEFAULT_HERO_SELECTOR);
});

test("mobile performance options reject unknown and malformed values", () => {
  assert.throws(() => parseOptions(["--unknown"], {}), /Unknown option/);
  assert.throws(() => parseOptions(["--max-requests", "3.5"], {}), /non-negative integer/);
  assert.throws(() => parseOptions(["--profile", "tablet"], {}), /mobile or desktop/);
  assert.throws(() => parseOptions(["--url", "file:\/\/\/tmp\/site"], {}), /http:\/\/ or https:\/\//);
});

test("desktop profile selects realistic viewport, network, and budget defaults", () => {
  const options = parseOptions(["--profile", "desktop"], {});

  assert.equal(options.profile, "desktop");
  assert.equal(options.cpuRate, 2);
  assert.equal(options.downloadKbps, 10_000);
  assert.equal(options.lcpMs, DESKTOP_BUDGETS.lcpMs);
  assert.deepEqual(PROFILE_DEFINITIONS.desktop.viewport, { height: 900, width: 1_440 });
});

test("matrix covers every core route on mobile and desktop in stable sequence", () => {
  const options = parseOptions(["--matrix", "--max-lcp-ms", "3900"], {});
  const cases = buildMeasurementCases(options);

  assert.equal(cases.length, MATRIX_ROUTES.length * 2);
  assert.deepEqual(
    cases.map(({ profile, route }) => `${profile}:${route}`),
    [
      ...MATRIX_ROUTES.map((route) => `mobile:${route}`),
      ...MATRIX_ROUTES.map((route) => `desktop:${route}`),
    ],
  );
  assert.equal(cases.find(({ profile }) => profile === "desktop").options.lcpMs, 3_900);
  assert.match(cases.find(({ route }) => route === "/download").options.heroSelector, /data-brand-logo-construct/);
});

test("an explicit profile narrows matrix runs and keeps explicit budget overrides", () => {
  const options = parseOptions(
    ["--matrix", "--profile", "desktop", "--max-transfer-kb", "850"],
    {},
  );
  const resolved = resolveProfileOptions(options, "desktop");
  const cases = buildMeasurementCases(options);

  assert.equal(cases.length, MATRIX_ROUTES.length);
  assert.ok(cases.every(({ profile }) => profile === "desktop"));
  assert.equal(resolved.transferKb, 850);
  assert.equal(resolved.requestCount, DESKTOP_BUDGETS.requestCount);
});

test("local preview routes resolve to their generated prerender directories", () => {
  assert.equal(normalizeLocalPreviewRoute("/"), "/");
  assert.equal(normalizeLocalPreviewRoute("/features"), "/features/");
  assert.equal(normalizeLocalPreviewRoute("/blogs/nam-audio"), "/blogs/nam-audio/");
  assert.equal(normalizeLocalPreviewRoute("/assets/icon.svg?v=2"), "/assets/icon.svg?v=2");
});

test("a healthy real-content load passes every default budget", () => {
  assert.deepEqual(evaluateResult(passingResult(), DEFAULT_BUDGETS), []);
});

test("the gate requires supported, observed LCP within budget", () => {
  const missing = passingResult();
  missing.metrics.lcpMs = null;
  assert.match(evaluateResult(missing, DEFAULT_BUDGETS).join("\n"), /LCP was never observed/);

  const unsupported = passingResult();
  unsupported.metrics.observerSupport.lcp = false;
  assert.match(
    evaluateResult(unsupported, DEFAULT_BUDGETS).join("\n"),
    /did not support Largest Contentful Paint/,
  );

  const slow = passingResult();
  slow.metrics.lcpMs = DEFAULT_BUDGETS.lcpMs + 1;
  assert.match(evaluateResult(slow, DEFAULT_BUDGETS).join("\n"), /LCP 4001 ms exceeds 4000 ms/);
});

test("the gate rejects loader-only success, instability, payload regressions, and runtime errors", () => {
  const result = passingResult();
  result.metrics.contentVisibleMs = null;
  result.metrics.introAfterReadyMs = 2_100;
  result.metrics.content.heroFound = false;
  result.metrics.content.loaderPresent = true;
  result.metrics.cls = 0.22;
  result.metrics.longTaskMaxMs = 700;
  result.navigationStatus = 302;
  result.network.redirectCount = 1;
  result.network.requestCount = 60;
  result.network.transferKb = 1_200;
  result.errors.page.push("render failed");

  const violations = evaluateResult(result, DEFAULT_BUDGETS).join("\n");

  assert.match(violations, /Real main\/hero visible was never observed/);
  assert.match(violations, /Post-ready intro 2100 ms exceeds/);
  assert.match(violations, /real hero element was not rendered/i);
  assert.match(violations, /loader was still present/i);
  assert.match(violations, /HTTP 302 instead of 200/);
  assert.match(violations, /1 unexpected redirect/);
  assert.match(violations, /CLS 0\.220 exceeds/);
  assert.match(violations, /Longest task 700 ms exceeds/);
  assert.match(violations, /Request count 60 exceeds/);
  assert.match(violations, /Encoded transfer 1200\.0 KiB exceeds/);
  assert.match(violations, /uncaught page error/);
});
