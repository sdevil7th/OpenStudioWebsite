const GOOGLE_ANALYTICS_SCRIPT_ID = "openstudio-google-analytics";
const MICROSOFT_CLARITY_SCRIPT_ID = "openstudio-microsoft-clarity";
const PRODUCTION_HOSTS = new Set(["openstudio.org.in", "www.openstudio.org.in"]);
const PAGE_ENGAGEMENT_MINIMUM_MS = 1000;
const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 90] as const;
const DOWNLOAD_FILE_EXTENSIONS = new Set([
  "appimage",
  "deb",
  "dmg",
  "exe",
  "msi",
  "pkg",
  "rar",
  "rpm",
  "tar",
  "gz",
  "zip",
]);

type AnalyticsParamValue = boolean | number | string | null | undefined;
type AnalyticsParams = Record<string, AnalyticsParamValue>;

interface PageSession {
  path: string;
  startedAt: number;
  title: string;
  maxScrollDepth: number;
  reportedScrollDepths: Set<number>;
}

let lifecycleTrackingInstalled = false;
let activePageSession: PageSession | null = null;

const getGoogleAnalyticsId = () => import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";

const getMicrosoftClarityId = () => import.meta.env.VITE_CLARITY_PROJECT_ID?.trim() ?? "";

const isAnalyticsEnabled = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const configuredState = import.meta.env.VITE_ANALYTICS_ENABLED;

  if (configuredState === "false") {
    return false;
  }

  if (configuredState === "true") {
    return true;
  }

  return !import.meta.env.DEV && PRODUCTION_HOSTS.has(window.location.hostname);
};

const getCurrentPagePath = () =>
  `${window.location.pathname}${window.location.search}`;

const getScrollDepth = () => {
  const scrollableHeight = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  return Math.max(
    0,
    Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100)),
  );
};

const getDurationBucket = (durationMs: number) => {
  const durationSeconds = durationMs / 1000;

  if (durationSeconds < 10) return "0-10s";
  if (durationSeconds < 30) return "10-30s";
  if (durationSeconds < 60) return "30-60s";
  if (durationSeconds < 180) return "1-3m";
  if (durationSeconds < 600) return "3-10m";
  return "10m+";
};

const normalizeAnalyticsParams = (params: AnalyticsParams = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

const getLinkLabel = (link: HTMLAnchorElement) =>
  (
    link.getAttribute("aria-label") ??
    link.textContent ??
    link.getAttribute("title") ??
    ""
  )
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);

const getSafeLinkUrl = (url: URL) => {
  if (url.protocol === "mailto:") {
    return `mailto:${url.pathname}`;
  }

  return `${url.origin}${url.pathname}`;
};

const getDownloadExtension = (url: URL) => {
  const extension = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();

  if (!extension || !DOWNLOAD_FILE_EXTENSIONS.has(extension)) {
    return null;
  }

  return extension;
};

const startPageSession = (path: string) => {
  activePageSession = {
    path,
    startedAt: window.performance?.now?.() ?? Date.now(),
    title: document.title,
    maxScrollDepth: getScrollDepth(),
    reportedScrollDepths: new Set(),
  };
};

const flushPageSession = (exitReason: string) => {
  if (!activePageSession) {
    return;
  }

  const finishedAt = window.performance?.now?.() ?? Date.now();
  const durationMs = Math.max(0, Math.round(finishedAt - activePageSession.startedAt));
  const session = activePageSession;

  activePageSession = null;

  if (durationMs < PAGE_ENGAGEMENT_MINIMUM_MS) {
    return;
  }

  trackEvent("page_engagement_time", {
    duration_bucket: getDurationBucket(durationMs),
    duration_ms: durationMs,
    duration_seconds: Math.round(durationMs / 1000),
    engagement_time_msec: durationMs,
    exit_reason: exitReason,
    page_path: session.path,
    page_title: session.title,
    scroll_depth_percent: session.maxScrollDepth,
    transport_type: "beacon",
  });
};

const trackScrollDepth = () => {
  if (!activePageSession) {
    return;
  }

  activePageSession.maxScrollDepth = Math.max(
    activePageSession.maxScrollDepth,
    getScrollDepth(),
  );

  for (const threshold of SCROLL_DEPTH_THRESHOLDS) {
    if (
      activePageSession.maxScrollDepth >= threshold &&
      !activePageSession.reportedScrollDepths.has(threshold)
    ) {
      activePageSession.reportedScrollDepths.add(threshold);
      trackEvent("scroll_depth_reached", {
        page_path: activePageSession.path,
        scroll_depth_percent: threshold,
      });
    }
  }
};

const trackLinkClick = (event: MouseEvent) => {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const link = target.closest<HTMLAnchorElement>("a[href]");

  if (!link) {
    return;
  }

  const rawHref = link.getAttribute("href")?.trim();

  if (!rawHref || rawHref.startsWith("#")) {
    return;
  }

  let url: URL;

  try {
    url = new URL(link.href, window.location.href);
  } catch {
    return;
  }

  const linkProtocol = url.protocol;
  const linkLabel = getLinkLabel(link);
  const commonParams = {
    link_text: linkLabel,
    link_url: getSafeLinkUrl(url),
    page_path: getCurrentPagePath(),
    transport_type: "beacon",
  };

  if (linkProtocol === "mailto:") {
    trackEvent("mailto_link_clicked", commonParams);
    return;
  }

  if (linkProtocol !== "http:" && linkProtocol !== "https:") {
    return;
  }

  const isExternal = url.origin !== window.location.origin;
  const downloadExtension = getDownloadExtension(url);

  if (downloadExtension || link.hasAttribute("download")) {
    trackEvent("file_download_clicked", {
      ...commonParams,
      file_extension: downloadExtension,
      link_domain: url.hostname,
    });
  }

  if (isExternal) {
    trackEvent("outbound_link_clicked", {
      ...commonParams,
      link_domain: url.hostname,
    });
  }
};

const installLifecycleTracking = () => {
  if (lifecycleTrackingInstalled || typeof window === "undefined") {
    return;
  }

  lifecycleTrackingInstalled = true;
  document.addEventListener("click", trackLinkClick, { capture: true });
  window.addEventListener("scroll", trackScrollDepth, { passive: true });
  window.addEventListener("pagehide", () => flushPageSession("pagehide"));
  window.addEventListener("beforeunload", () => flushPageSession("beforeunload"));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushPageSession("visibility_hidden");
      return;
    }

    if (!activePageSession) {
      startPageSession(getCurrentPagePath());
    }
  });
};

const initializeGoogleAnalytics = () => {
  const measurementId = getGoogleAnalyticsId();

  if (!measurementId) {
    return false;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });

  if (!document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.async = true;
    script.id = GOOGLE_ANALYTICS_SCRIPT_ID;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      measurementId,
    )}`;
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", measurementId, { send_page_view: false });
  }

  return true;
};

const initializeMicrosoftClarity = () => {
  const projectId = getMicrosoftClarityId();

  if (!projectId) {
    return false;
  }

  if (!window.clarity) {
    const clarity = ((...args: unknown[]) => {
      clarity.q = clarity.q ?? [];
      clarity.q.push(args);
    }) as NonNullable<Window["clarity"]>;

    clarity.q = [];
    window.clarity = clarity;
  }

  if (!document.getElementById(MICROSOFT_CLARITY_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.async = true;
    script.id = MICROSOFT_CLARITY_SCRIPT_ID;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
    document.head.appendChild(script);
  }

  return true;
};

export const initializeAnalytics = () => {
  if (!isAnalyticsEnabled()) {
    return {
      googleAnalytics: false,
      microsoftClarity: false,
    };
  }

  installLifecycleTracking();

  return {
    googleAnalytics: initializeGoogleAnalytics(),
    microsoftClarity: initializeMicrosoftClarity(),
  };
};

export const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  const { googleAnalytics, microsoftClarity } = initializeAnalytics();
  const normalizedParams = normalizeAnalyticsParams(params);

  if (googleAnalytics) {
    const measurementId = getGoogleAnalyticsId();

    window.gtag?.("event", eventName, {
      ...normalizedParams,
      send_to: measurementId,
    });
  }

  if (microsoftClarity) {
    window.clarity?.("event", eventName);
  }

  return googleAnalytics || microsoftClarity;
};

export const trackPageView = (path: string) => {
  if (path.startsWith("/og-card")) {
    return;
  }

  const { googleAnalytics, microsoftClarity } = initializeAnalytics();

  if (!googleAnalytics && !microsoftClarity) {
    return;
  }

  flushPageSession("route_change");
  startPageSession(path);

  if (!googleAnalytics) {
    return;
  }

  const measurementId = getGoogleAnalyticsId();

  window.gtag?.("event", "page_view", {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
    send_to: measurementId,
  });
};
