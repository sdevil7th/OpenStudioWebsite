import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "playwright";
import { preview } from "vite";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..");

export const DEFAULT_BUDGETS = Object.freeze({
  appReadyMs: 3_200,
  cls: 0.1,
  contentVisibleMs: 5_750,
  introAfterReadyMs: 700,
  introHiddenMs: 5_500,
  lcpMs: 4_000,
  longTaskCount: 10,
  longTaskMaxMs: 450,
  longTaskTotalMs: 1_000,
  requestCount: 35,
  transferKb: 700,
});

export const DEFAULT_PROFILE = Object.freeze({
  cpuRate: 4,
  downloadKbps: 1_600,
  latencyMs: 150,
  settleMs: 1_200,
  timeoutMs: 20_000,
  uploadKbps: 600,
});

export const DESKTOP_BUDGETS = Object.freeze({
  appReadyMs: 2_750,
  cls: 0.1,
  contentVisibleMs: 4_500,
  introAfterReadyMs: 2_700,
  introHiddenMs: 4_500,
  lcpMs: 3_600,
  longTaskCount: 10,
  longTaskMaxMs: 350,
  longTaskTotalMs: 800,
  requestCount: 45,
  transferKb: 1_000,
});

export const DESKTOP_PROFILE = Object.freeze({
  cpuRate: 2,
  downloadKbps: 10_000,
  latencyMs: 40,
  settleMs: 1_500,
  timeoutMs: 20_000,
  uploadKbps: 5_000,
});

export const DEFAULT_HERO_SELECTOR =
  "[data-home-hero-title], [data-download-logo-stage] [data-brand-logo-construct], h1";

export const MATRIX_ROUTES = Object.freeze(["/", "/features", "/download", "/ai", "/blogs"]);

export const PROFILE_DEFINITIONS = Object.freeze({
  desktop: Object.freeze({
    budgets: DESKTOP_BUDGETS,
    connectionType: "wifi",
    context: "desktop",
    profile: DESKTOP_PROFILE,
    viewport: Object.freeze({ height: 900, width: 1_440 }),
  }),
  mobile: Object.freeze({
    budgets: DEFAULT_BUDGETS,
    connectionType: "cellular4g",
    context: "pixel5",
    profile: DEFAULT_PROFILE,
    viewport: Object.freeze({ height: 844, width: 390 }),
  }),
});

const PROFILE_NAMES = new Set(Object.keys(PROFILE_DEFINITIONS));
const PROFILE_OVERRIDE_KEYS = new Set([
  ...Object.keys(DEFAULT_BUDGETS),
  ...Object.keys(DEFAULT_PROFILE),
]);

const VALUE_OPTIONS = new Map([
  ["--url", "url"],
  ["--route", "route"],
  ["--hero-selector", "heroSelector"],
  ["--profile", "profile"],
  ["--json", "jsonPath"],
  ["--max-app-ready-ms", "appReadyMs"],
  ["--max-intro-after-ready-ms", "introAfterReadyMs"],
  ["--max-intro-hidden-ms", "introHiddenMs"],
  ["--max-content-visible-ms", "contentVisibleMs"],
  ["--max-lcp-ms", "lcpMs"],
  ["--max-cls", "cls"],
  ["--max-long-task-count", "longTaskCount"],
  ["--max-long-task-ms", "longTaskMaxMs"],
  ["--max-long-task-total-ms", "longTaskTotalMs"],
  ["--max-requests", "requestCount"],
  ["--max-transfer-kb", "transferKb"],
  ["--cpu-rate", "cpuRate"],
  ["--download-kbps", "downloadKbps"],
  ["--upload-kbps", "uploadKbps"],
  ["--latency-ms", "latencyMs"],
  ["--settle-ms", "settleMs"],
  ["--timeout-ms", "timeoutMs"],
]);

const ENV_OPTIONS = Object.freeze({
  appReadyMs: "MOBILE_PERF_MAX_APP_READY_MS",
  cls: "MOBILE_PERF_MAX_CLS",
  contentVisibleMs: "MOBILE_PERF_MAX_CONTENT_VISIBLE_MS",
  cpuRate: "MOBILE_PERF_CPU_RATE",
  downloadKbps: "MOBILE_PERF_DOWNLOAD_KBPS",
  heroSelector: "MOBILE_PERF_HERO_SELECTOR",
  introAfterReadyMs: "MOBILE_PERF_MAX_INTRO_AFTER_READY_MS",
  introHiddenMs: "MOBILE_PERF_MAX_INTRO_HIDDEN_MS",
  jsonPath: "MOBILE_PERF_JSON",
  latencyMs: "MOBILE_PERF_LATENCY_MS",
  lcpMs: "MOBILE_PERF_MAX_LCP_MS",
  longTaskCount: "MOBILE_PERF_MAX_LONG_TASK_COUNT",
  longTaskMaxMs: "MOBILE_PERF_MAX_LONG_TASK_MS",
  longTaskTotalMs: "MOBILE_PERF_MAX_LONG_TASK_TOTAL_MS",
  requestCount: "MOBILE_PERF_MAX_REQUESTS",
  profile: "MOBILE_PERF_PROFILE",
  route: "MOBILE_PERF_ROUTE",
  settleMs: "MOBILE_PERF_SETTLE_MS",
  timeoutMs: "MOBILE_PERF_TIMEOUT_MS",
  transferKb: "MOBILE_PERF_MAX_TRANSFER_KB",
  uploadKbps: "MOBILE_PERF_UPLOAD_KBPS",
  url: "MOBILE_PERF_URL",
});

const NUMERIC_OPTION_KEYS = new Set([
  "appReadyMs",
  "cls",
  "contentVisibleMs",
  "cpuRate",
  "downloadKbps",
  "introAfterReadyMs",
  "introHiddenMs",
  "latencyMs",
  "lcpMs",
  "longTaskCount",
  "longTaskMaxMs",
  "longTaskTotalMs",
  "requestCount",
  "settleMs",
  "timeoutMs",
  "transferKb",
  "uploadKbps",
]);

const INTEGER_OPTION_KEYS = new Set([
  "longTaskCount",
  "requestCount",
  "settleMs",
  "timeoutMs",
]);

const HELP = `
Loading performance regression gate

Usage:
  npm run verify:mobile-perf
  npm run verify:mobile-perf -- --url https://openstudio.org.in --route /
  npm run verify:perf

The default command serves the existing dist/ directory with Vite preview. Run
npm run build first. An explicit --url skips the local preview server.

Options:
  --url <base-url>                  Test an already-hosted build
  --route <path>                    Route to test (default: /)
  --hero-selector <selector>        Real hero selector
  --profile <mobile|desktop>        Device/network profile (default: mobile)
  --matrix                           Test the core route matrix on both profiles
  --json <path>                     Write the complete result as JSON
  --headed                          Show Chromium
  --max-app-ready-ms <number>       App-ready budget
  --max-intro-after-ready-ms <n>    Loader time after app-ready
  --max-intro-hidden-ms <number>    Loader removal budget
  --max-content-visible-ms <number> Real main/hero visibility budget
  --max-lcp-ms <number>             Largest Contentful Paint budget
  --max-cls <number>                Web Vitals CLS budget
  --max-long-task-count <number>    Long-task count budget
  --max-long-task-ms <number>       Largest long-task budget
  --max-long-task-total-ms <number> Total long-task duration budget
  --max-requests <number>           HTTP(S) request budget
  --max-transfer-kb <number>        Encoded transfer budget (KiB)
  --cpu-rate <number>               CPU slowdown multiplier
  --download-kbps <number>          Download speed in kilobits/s
  --upload-kbps <number>            Upload speed in kilobits/s
  --latency-ms <number>             Network latency
  --settle-ms <number>              Observation time after content appears
  --timeout-ms <number>             Navigation/content timeout
  --help                             Show this help

Every value option also has an environment-variable form documented in README.md.
`;

const parsePositiveNumber = (value, optionName, { integer = false } = {}) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || (integer && !Number.isInteger(parsed))) {
    throw new Error(`${optionName} must be a ${integer ? "non-negative integer" : "non-negative number"}.`);
  }

  return parsed;
};

const readOptionValue = (args, index) => {
  const argument = args[index];
  const equalsIndex = argument.indexOf("=");

  if (equalsIndex !== -1) {
    return {
      option: argument.slice(0, equalsIndex),
      value: argument.slice(equalsIndex + 1),
      consumed: 1,
    };
  }

  return {
    option: argument,
    value: args[index + 1],
    consumed: 2,
  };
};

const requestedProfile = (args, env) => {
  let profile = env.MOBILE_PERF_PROFILE || "mobile";
  let explicit = Boolean(env.MOBILE_PERF_PROFILE);

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--profile") {
      profile = args[index + 1];
      explicit = true;
      index += 1;
    } else if (argument.startsWith("--profile=")) {
      profile = argument.slice("--profile=".length);
      explicit = true;
    }
  }

  if (!PROFILE_NAMES.has(profile)) {
    throw new Error("--profile must be either mobile or desktop.");
  }

  return { explicit, profile };
};

export const parseOptions = (args = [], env = process.env) => {
  const profileSelection = requestedProfile(args, env);
  const definition = PROFILE_DEFINITIONS[profileSelection.profile];
  const explicitOverrides = new Set();
  const values = {
    ...definition.budgets,
    ...definition.profile,
    headed: false,
    help: false,
    heroSelector: DEFAULT_HERO_SELECTOR,
    jsonPath: undefined,
    matrix: false,
    profile: profileSelection.profile,
    profileExplicit: profileSelection.explicit,
    route: "/",
    url: undefined,
  };

  for (const [key, environmentName] of Object.entries(ENV_OPTIONS)) {
    const value = env[environmentName];

    if (value === undefined || value === "") {
      continue;
    }

    values[key] = NUMERIC_OPTION_KEYS.has(key)
      ? parsePositiveNumber(value, environmentName, { integer: INTEGER_OPTION_KEYS.has(key) })
      : value;
    if (PROFILE_OVERRIDE_KEYS.has(key)) {
      explicitOverrides.add(key);
    }
  }

  for (let index = 0; index < args.length; ) {
    const argument = args[index];

    if (argument === "--headed") {
      values.headed = true;
      index += 1;
      continue;
    }

    if (argument === "--matrix") {
      values.matrix = true;
      index += 1;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      values.help = true;
      index += 1;
      continue;
    }

    const { option, value, consumed } = readOptionValue(args, index);
    const key = VALUE_OPTIONS.get(option);

    if (!key) {
      throw new Error(`Unknown option: ${option}`);
    }

    if (value === undefined || value.startsWith("--")) {
      throw new Error(`${option} requires a value.`);
    }

    values[key] = NUMERIC_OPTION_KEYS.has(key)
      ? parsePositiveNumber(value, option, { integer: INTEGER_OPTION_KEYS.has(key) })
      : value;
    if (PROFILE_OVERRIDE_KEYS.has(key)) {
      explicitOverrides.add(key);
    }
    index += consumed;
  }

  if (!PROFILE_NAMES.has(values.profile)) {
    throw new Error("--profile must be either mobile or desktop.");
  }

  if (!String(values.route).startsWith("/")) {
    values.route = `/${values.route}`;
  }

  if (!String(values.heroSelector).trim()) {
    throw new Error("--hero-selector cannot be empty.");
  }

  if (values.url) {
    const parsedUrl = new URL(values.url);

    if (!new Set(["http:", "https:"]).has(parsedUrl.protocol)) {
      throw new Error("--url must use http:// or https://.");
    }

    values.url = parsedUrl.toString();
  }

  values.explicitOverrides = [...explicitOverrides];

  return values;
};

export const resolveProfileOptions = (options, profileName) => {
  const definition = PROFILE_DEFINITIONS[profileName];

  if (!definition) {
    throw new Error(`Unknown performance profile: ${profileName}`);
  }

  const resolved = {
    ...options,
    ...definition.budgets,
    ...definition.profile,
    profile: profileName,
  };

  for (const key of options.explicitOverrides ?? []) {
    resolved[key] = options[key];
  }

  return resolved;
};

export const buildMeasurementCases = (options) => {
  if (!options.matrix) {
    return [
      {
        options,
        profile: options.profile,
        route: options.route,
      },
    ];
  }

  const profiles = options.profileExplicit ? [options.profile] : ["mobile", "desktop"];

  return profiles.flatMap((profile) => {
    const profileOptions = resolveProfileOptions(options, profile);
    return MATRIX_ROUTES.map((route) => ({ options: profileOptions, profile, route }));
  });
};

const startLocalPreview = async () => {
  const indexPath = path.join(PROJECT_ROOT, "dist", "index.html");

  try {
    await access(indexPath);
  } catch {
    throw new Error("dist/index.html is missing. Run `npm run build` before the mobile performance gate.");
  }

  const server = await preview({
    root: PROJECT_ROOT,
    logLevel: "silent",
    preview: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: false,
    },
  });
  const address = server.httpServer.address();

  if (!address || typeof address === "string") {
    server.httpServer.close();
    throw new Error("Vite preview did not expose a TCP address.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}/`,
    close: () =>
      new Promise((resolve, reject) => {
        server.httpServer.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};

export const normalizeLocalPreviewRoute = (route) => {
  const parsedRoute = new URL(route, "https://preview.openstudio.invalid");
  const finalSegment = parsedRoute.pathname.split("/").at(-1) ?? "";

  if (
    parsedRoute.pathname !== "/" &&
    !parsedRoute.pathname.endsWith("/") &&
    !finalSegment.includes(".")
  ) {
    parsedRoute.pathname = `${parsedRoute.pathname}/`;
  }

  return `${parsedRoute.pathname}${parsedRoute.search}${parsedRoute.hash}`;
};

const makeTargetUrl = (baseUrl, route) => {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(route.replace(/^\/+/, ""), normalizedBaseUrl).toString();
};

const installPerformanceObservers = async (context, heroSelector) => {
  await context.addInitScript(
    ({ selector }) => {
      if (window.top !== window) {
        return;
      }

      const state = {
        appReadyMs: null,
        cls: 0,
        clsTotal: 0,
        contentVisibleMs: null,
        introHiddenMs: null,
        layoutShifts: [],
        lcp: null,
        longTasks: [],
        observerSupport: {
          cls: false,
          lcp: false,
          longTask: false,
        },
      };
      window.__openstudioMobilePerfGate = state;

      window.addEventListener(
        "openstudio:app-ready",
        () => {
          state.appReadyMs ??= performance.now();
        },
        { once: true },
      );
      window.addEventListener(
        "openstudio:intro-hidden",
        () => {
          state.introHiddenMs ??= performance.now();
        },
        { once: true },
      );

      try {
        let currentSessionValue = 0;
        let firstSessionEntry;
        let previousSessionEntry;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) {
              continue;
            }

            state.clsTotal += entry.value;
            state.layoutShifts.push({
              startTime: entry.startTime,
              value: entry.value,
            });

            if (
              previousSessionEntry &&
              firstSessionEntry &&
              entry.startTime - previousSessionEntry.startTime < 1_000 &&
              entry.startTime - firstSessionEntry.startTime < 5_000
            ) {
              currentSessionValue += entry.value;
            } else {
              currentSessionValue = entry.value;
              firstSessionEntry = entry;
            }

            previousSessionEntry = entry;
            state.cls = Math.max(state.cls, currentSessionValue);
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        state.observerSupport.cls = true;
      } catch {
        state.observerSupport.cls = false;
      }

      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const element = entry.element;
            state.lcp = {
              elementId: element instanceof Element ? element.id || null : null,
              elementTag: element instanceof Element ? element.tagName.toLowerCase() : null,
              loadTime: entry.loadTime ?? null,
              renderTime: entry.renderTime ?? null,
              size: entry.size ?? null,
              startTime: entry.startTime,
              url: entry.url || null,
            };
          }
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
        state.observerSupport.lcp = true;
      } catch {
        state.observerSupport.lcp = false;
      }

      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            state.longTasks.push({
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });
        observer.observe({ type: "longtask", buffered: true });
        state.observerSupport.longTask = true;
      } catch {
        state.observerSupport.longTask = false;
      }

      const visiblyRendered = (element, { inViewport = false } = {}) => {
        if (!(element instanceof HTMLElement) || element.closest("[data-static-route-content]")) {
          return false;
        }

        const style = getComputedStyle(element);
        const bounds = element.getBoundingClientRect();
        const opacity = Number.parseFloat(style.opacity || "1");

        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          opacity <= 0.05 ||
          bounds.width < 20 ||
          bounds.height < 10
        ) {
          return false;
        }

        return !inViewport || (bounds.bottom > 0 && bounds.top < window.innerHeight);
      };

      const checkContentVisibility = () => {
        const loader = document.querySelector("[data-openstudio-loader]");
        const main = document.querySelector("#root main#main-content");
        const hero = main?.querySelector(selector) ?? document.querySelector(selector);

        if (
          !loader &&
          state.introHiddenMs !== null &&
          visiblyRendered(main) &&
          visiblyRendered(hero, { inViewport: true })
        ) {
          state.contentVisibleMs ??= performance.now();
          return;
        }

        requestAnimationFrame(checkContentVisibility);
      };

      requestAnimationFrame(checkContentVisibility);
    },
    { selector: heroSelector },
  );
};

const summarizeBrowserMetrics = async (page, heroSelector) =>
  page.evaluate((selector) => {
    const state = window.__openstudioMobilePerfGate ?? {};
    const marks = Object.fromEntries(
      performance
        .getEntriesByType("mark")
        .map((entry) => [entry.name, entry.startTime]),
    );
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const main = document.querySelector("#root main#main-content");
    const hero = main?.querySelector(selector) ?? document.querySelector(selector);
    const longTasks = state.longTasks ?? [];

    const appReadyMs = state.appReadyMs ?? marks["openstudio:app-ready"] ?? null;
    const contentVisibleMs = state.contentVisibleMs ?? null;
    const introHiddenMs = state.introHiddenMs ?? marks["openstudio:intro-hidden"] ?? null;
    const nativeLcpMs = state.lcp?.startTime ?? null;
    // Prerendered route content can paint behind the full-screen intro. Keep the
    // native candidate for diagnostics, but never report LCP before users could
    // see the hydrated route.
    const lcpMs = Number.isFinite(nativeLcpMs) && Number.isFinite(contentVisibleMs)
      ? Math.max(nativeLcpMs, contentVisibleMs)
      : nativeLcpMs;

    return {
      appReadyMs,
      cls: state.cls ?? null,
      clsTotal: state.clsTotal ?? null,
      content: {
        heroBounds: hero
          ? (() => {
              const bounds = hero.getBoundingClientRect();
              return {
                height: bounds.height,
                top: bounds.top,
                width: bounds.width,
              };
            })()
          : null,
        heroFound: Boolean(hero),
        heroIsStaticFallback: Boolean(hero?.closest("[data-static-route-content]")),
        loaderPresent: Boolean(document.querySelector("[data-openstudio-loader]")),
        mainFound: Boolean(main),
        mainIsStaticFallback: Boolean(main?.closest("[data-static-route-content]")),
      },
      contentVisibleMs,
      introAfterReadyMs:
        Number.isFinite(appReadyMs) && Number.isFinite(introHiddenMs)
          ? Math.max(0, introHiddenMs - appReadyMs)
          : null,
      introHiddenMs,
      layoutShifts: (state.layoutShifts ?? []).slice(-10),
      lcp: state.lcp ?? null,
      lcpMs,
      lcpNativeMs: nativeLcpMs,
      longTaskCount: longTasks.length,
      longTaskMaxMs: longTasks.reduce((maximum, entry) => Math.max(maximum, entry.duration), 0),
      longTaskTotalMs: longTasks.reduce((total, entry) => total + entry.duration, 0),
      longestTasks: [...longTasks]
        .sort((left, right) => right.duration - left.duration)
        .slice(0, 10),
      navigation: navigation
        ? {
            domContentLoadedMs: navigation.domContentLoadedEventEnd,
            loadMs: navigation.loadEventEnd,
            responseStartMs: navigation.responseStart,
          }
        : null,
      observerSupport: state.observerSupport ?? {},
      performanceResourceCount: resources.length,
    };
  }, heroSelector);

export const evaluateResult = (result, budgets) => {
  const violations = [];
  const requireTiming = (key, label, maximum) => {
    const value = result.metrics[key];

    if (!Number.isFinite(value)) {
      violations.push(`${label} was never observed.`);
    } else if (value > maximum) {
      violations.push(`${label} ${Math.round(value)} ms exceeds ${maximum} ms.`);
    }
  };

  requireTiming("appReadyMs", "App ready", budgets.appReadyMs);
  requireTiming("introAfterReadyMs", "Post-ready intro", budgets.introAfterReadyMs);
  requireTiming("introHiddenMs", "Intro hidden", budgets.introHiddenMs);
  requireTiming("contentVisibleMs", "Real main/hero visible", budgets.contentVisibleMs);

  if (!result.metrics.content.mainFound || result.metrics.content.mainIsStaticFallback) {
    violations.push("A real React main#main-content element was not rendered.");
  }

  if (!result.metrics.content.heroFound || result.metrics.content.heroIsStaticFallback) {
    violations.push("A real hero element was not rendered.");
  }

  if (result.metrics.content.loaderPresent) {
    violations.push("The initial loader was still present at the end of the measurement.");
  }

  if (result.navigationStatus !== 200) {
    violations.push(`Navigation returned HTTP ${result.navigationStatus ?? "no response"} instead of 200.`);
  }

  if (result.network.redirectCount > 0) {
    violations.push(
      `Navigation followed ${result.network.redirectCount} unexpected redirect(s).`,
    );
  }

  if (!result.metrics.observerSupport.cls) {
    violations.push("The browser did not support layout-shift observation.");
  } else if (result.metrics.cls > budgets.cls) {
    violations.push(`CLS ${result.metrics.cls.toFixed(3)} exceeds ${budgets.cls}.`);
  }

  if (!result.metrics.observerSupport.lcp) {
    violations.push("The browser did not support Largest Contentful Paint observation.");
  } else {
    requireTiming("lcpMs", "LCP", budgets.lcpMs);
  }

  if (!result.metrics.observerSupport.longTask) {
    violations.push("The browser did not support long-task observation.");
  } else {
    if (result.metrics.longTaskCount > budgets.longTaskCount) {
      violations.push(`Long-task count ${result.metrics.longTaskCount} exceeds ${budgets.longTaskCount}.`);
    }
    if (result.metrics.longTaskMaxMs > budgets.longTaskMaxMs) {
      violations.push(
        `Longest task ${Math.round(result.metrics.longTaskMaxMs)} ms exceeds ${budgets.longTaskMaxMs} ms.`,
      );
    }
    if (result.metrics.longTaskTotalMs > budgets.longTaskTotalMs) {
      violations.push(
        `Long-task total ${Math.round(result.metrics.longTaskTotalMs)} ms exceeds ${budgets.longTaskTotalMs} ms.`,
      );
    }
  }

  if (result.network.requestCount > budgets.requestCount) {
    violations.push(`Request count ${result.network.requestCount} exceeds ${budgets.requestCount}.`);
  }

  if (result.network.transferKb > budgets.transferKb) {
    violations.push(
      `Encoded transfer ${result.network.transferKb.toFixed(1)} KiB exceeds ${budgets.transferKb} KiB.`,
    );
  }

  if (result.errors.console.length > 0) {
    violations.push(`${result.errors.console.length} console error(s) occurred.`);
  }
  if (result.errors.page.length > 0) {
    violations.push(`${result.errors.page.length} uncaught page error(s) occurred.`);
  }
  if (result.errors.requests.length > 0) {
    violations.push(`${result.errors.requests.length} request failure(s) occurred.`);
  }
  if (result.errors.responses.length > 0) {
    violations.push(`${result.errors.responses.length} HTTP error response(s) occurred.`);
  }

  return violations;
};

const runMeasurement = async (targetUrl, options) => {
  const browser = await chromium.launch({ headless: !options.headed });
  let context;

  try {
    const definition = PROFILE_DEFINITIONS[options.profile ?? "mobile"];
    const deviceOptions = definition.context === "pixel5" ? devices["Pixel 5"] : {};

    context = await browser.newContext({
      ...deviceOptions,
      locale: "en-US",
      serviceWorkers: "block",
      viewport: definition.viewport,
    });
    await installPerformanceObservers(context, options.heroSelector);

    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    const errors = {
      console: [],
      page: [],
      requests: [],
      responses: [],
    };
    const requests = [];
    let encodedTransferBytes = 0;

    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.console.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.page.push(error.message));
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) {
        requests.push({ resourceType: request.resourceType(), url: request.url() });
      }
    });
    page.on("requestfailed", (request) => {
      if (/^https?:/.test(request.url())) {
        errors.requests.push({
          error: request.failure()?.errorText ?? "unknown request error",
          url: request.url(),
        });
      }
    });
    page.on("response", (response) => {
      if (response.status() >= 400 && /^https?:/.test(response.url())) {
        errors.responses.push({ status: response.status(), url: response.url() });
      }
    });

    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });
    await client.send("Network.clearBrowserCache");
    await client.send("Network.emulateNetworkConditions", {
      connectionType: definition.connectionType,
      downloadThroughput: (options.downloadKbps * 1024) / 8,
      latency: options.latencyMs,
      offline: false,
      uploadThroughput: (options.uploadKbps * 1024) / 8,
    });
    await client.send("Emulation.setCPUThrottlingRate", { rate: options.cpuRate });
    client.on("Network.loadingFinished", (event) => {
      encodedTransferBytes += event.encodedDataLength ?? 0;
    });

    const navigationResponse = await page.goto(targetUrl, {
      timeout: options.timeoutMs,
      waitUntil: "domcontentloaded",
    });
    const redirectChain = [];
    let redirectedRequest = navigationResponse?.request();

    while (redirectedRequest?.redirectedFrom()) {
      const previousRequest = redirectedRequest.redirectedFrom();
      redirectChain.unshift({
        from: previousRequest.url(),
        to: redirectedRequest.url(),
      });
      redirectedRequest = previousRequest;
    }
    let readinessTimeout;

    try {
      await page.waitForFunction(
        () => {
          const state = window.__openstudioMobilePerfGate;
          return Boolean(
            state?.appReadyMs !== null &&
              state?.introHiddenMs !== null &&
              state?.contentVisibleMs !== null,
          );
        },
        undefined,
        { timeout: options.timeoutMs },
      );
    } catch (error) {
      readinessTimeout = error instanceof Error ? error.message : String(error);
    }

    await page.waitForTimeout(options.settleMs);
    const metrics = await summarizeBrowserMetrics(page, options.heroSelector);
    const result = {
      budgets: Object.fromEntries(Object.keys(DEFAULT_BUDGETS).map((key) => [key, options[key]])),
      errors,
      measuredAt: new Date().toISOString(),
      metrics,
      navigationStatus: navigationResponse?.status() ?? null,
      network: {
        redirectCount: redirectChain.length,
        redirects: redirectChain,
        requestCount: requests.length,
        requestsByType: Object.fromEntries(
          Object.entries(
            requests.reduce((counts, request) => {
              counts[request.resourceType] = (counts[request.resourceType] ?? 0) + 1;
              return counts;
            }, {}),
          ).sort(([left], [right]) => left.localeCompare(right)),
        ),
        transferBytes: encodedTransferBytes,
        transferKb: encodedTransferBytes / 1024,
      },
      profile: {
        cpuRate: options.cpuRate,
        downloadKbps: options.downloadKbps,
        latencyMs: options.latencyMs,
        settleMs: options.settleMs,
        uploadKbps: options.uploadKbps,
        viewport: `${definition.viewport.width}x${definition.viewport.height}`,
      },
      readinessTimeout,
      targetUrl,
    };

    result.violations = evaluateResult(result, result.budgets);
    return result;
  } finally {
    await context?.close();
    await browser.close();
  }
};

const formatMs = (value) => (Number.isFinite(value) ? `${Math.round(value)} ms` : "not observed");

const printResult = (result, profileName = "mobile") => {
  const outcome = result.violations.length === 0 ? "PASS" : "FAIL";
  const profileLabel = `${profileName[0].toUpperCase()}${profileName.slice(1)}`;

  console.log(`\n${profileLabel} performance gate: ${outcome}`);
  console.log(`URL: ${result.targetUrl}`);
  console.log(
    `Profile: ${result.profile.viewport}, ${result.profile.cpuRate}x CPU, ${result.profile.downloadKbps} kbps down, ${result.profile.latencyMs} ms latency`,
  );
  console.log(`App ready: ${formatMs(result.metrics.appReadyMs)} / ${result.budgets.appReadyMs} ms`);
  console.log(
    `Post-ready intro: ${formatMs(result.metrics.introAfterReadyMs)} / ${result.budgets.introAfterReadyMs} ms`,
  );
  console.log(`Intro hidden: ${formatMs(result.metrics.introHiddenMs)} / ${result.budgets.introHiddenMs} ms`);
  console.log(
    `Real content visible: ${formatMs(result.metrics.contentVisibleMs)} / ${result.budgets.contentVisibleMs} ms`,
  );
  console.log(
    `LCP (reveal-adjusted): ${formatMs(result.metrics.lcpMs)} / ${result.budgets.lcpMs} ms`,
  );
  console.log(
    `CLS: ${Number.isFinite(result.metrics.cls) ? result.metrics.cls.toFixed(3) : "not observed"} / ${result.budgets.cls}`,
  );
  console.log(
    `Long tasks: ${result.metrics.longTaskCount} (${Math.round(result.metrics.longTaskTotalMs)} ms total, ${Math.round(result.metrics.longTaskMaxMs)} ms max)`,
  );
  console.log(
    `Network: ${result.network.requestCount} requests, ${result.network.transferKb.toFixed(1)} KiB encoded, ${result.network.redirectCount} redirects`,
  );

  if (result.violations.length > 0) {
    console.error("\nBudget violations:");
    result.violations.forEach((violation) => console.error(`- ${violation}`));

    for (const [category, entries] of Object.entries(result.errors)) {
      if (entries.length === 0) {
        continue;
      }

      console.error(`\n${category} details:`);
      entries.slice(0, 10).forEach((entry) =>
        console.error(`- ${typeof entry === "string" ? entry : JSON.stringify(entry)}`),
      );
    }
  }
};

const main = async () => {
  let options;

  try {
    options = parseOptions(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.error("Run with --help for usage.");
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(HELP.trim());
    return;
  }

  let localPreview;

  try {
    localPreview = options.url ? undefined : await startLocalPreview();
    const cases = buildMeasurementCases(options);
    const matrixResults = [];

    for (const measurementCase of cases) {
      // Vite preview does not apply Netlify's slashless-route rewrites. Point
      // local runs at generated route directories so they include route HTML.
      const measuredRoute = localPreview
        ? normalizeLocalPreviewRoute(measurementCase.route)
        : measurementCase.route;
      const targetUrl = makeTargetUrl(options.url ?? localPreview.baseUrl, measuredRoute);
      const result = await runMeasurement(targetUrl, measurementCase.options);

      printResult(result, measurementCase.profile);
      matrixResults.push({
        profile: measurementCase.profile,
        result,
        route: measurementCase.route,
      });
    }

    const output = options.matrix
      ? {
          matrix: true,
          measuredAt: new Date().toISOString(),
          results: matrixResults,
        }
      : matrixResults[0].result;

    if (options.jsonPath) {
      const outputPath = path.resolve(PROJECT_ROOT, options.jsonPath);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
      console.log(`Result JSON: ${path.relative(PROJECT_ROOT, outputPath)}`);
    }

    if (matrixResults.some(({ result }) => result.violations.length > 0)) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Performance gate could not run: ${error instanceof Error ? error.stack : error}`);
    process.exitCode = 2;
  } finally {
    await localPreview?.close();
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  await main();
}
