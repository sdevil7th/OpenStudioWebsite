import { scheduleAfterInitialLoad } from "@/lib/initialLoad";
import { readAnalyticsConsent, subscribeToAnalyticsConsent } from "@/lib/analyticsConsent";

const GOOGLE_ANALYTICS_SCRIPT_ID = "openstudio-google-analytics";
const MICROSOFT_CLARITY_SCRIPT_ID = "openstudio-microsoft-clarity";
const PRODUCTION_HOSTS = new Set(["openstudio.org.in", "www.openstudio.org.in"]);
const PAGE_ENGAGEMENT_MINIMUM_MS = 1000;
const ANALYTICS_IDLE_DELAY_MS = 1800;
const ANALYTICS_IDLE_TIMEOUT_MS = 3200;
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

interface AnalyticsDestinations {
  googleAnalytics: boolean;
  microsoftClarity: boolean;
}

type PendingAnalyticsCommand =
  | {
      eventName: string;
      params: Record<string, AnalyticsParamValue>;
      type: "event";
    }
  | {
      location: string;
      path: string;
      title: string;
      type: "page_view";
    };

interface PageSession {
  path: string;
  startedAt: number;
  title: string;
  maxScrollDepth: number;
  reportedScrollDepths: Set<number>;
}

let lifecycleTrackingInstalled = false;
let activePageSession: PageSession | null = null;
let analyticsInitializationScheduled = false;
let analyticsProvidersInitialized = false;
let analyticsProvidersStopped = false;
let cancelAnalyticsInitialization: (() => void) | null = null;
let initializedDestinations: AnalyticsDestinations = {
  googleAnalytics: false,
  microsoftClarity: false,
};
const pendingAnalyticsCommands: PendingAnalyticsCommand[] = [];

const getGoogleAnalyticsId = () => import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";

const getMicrosoftClarityId = () => import.meta.env.VITE_CLARITY_PROJECT_ID?.trim() ?? "";

const googleConsent = (accepted: boolean) => ({
  analytics_storage: accepted ? "granted" : "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});

const clarityConsent = (accepted: boolean) => ({
  analytics_Storage: accepted ? "granted" : "denied",
  ad_Storage: "denied",
});

const setGoogleAnalyticsDisabled = (disabled: boolean) => {
  (window as unknown as Record<string, unknown>)[`ga-disable-${getGoogleAnalyticsId()}`] = disabled;
};

const clearAnalyticsCookies = () => {
  try {
    const domains = new Set(["", window.location.hostname, `.${window.location.hostname}`, ".openstudio.org.in"]);
    for (const item of document.cookie.split(";")) {
      const name = item.split("=", 1)[0].trim();
      if (!/^(_ga(?:_|$)|_gid$|_gat|_clck$|_clsk$)/.test(name)) continue;

      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ""} SameSite=Lax`;
      }
    }
  } catch {
    // Browsers that block cookie access must still allow a session-only decision.
  }
};

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

const getConfiguredDestinations = (): AnalyticsDestinations => {
  if (!isAnalyticsEnabled() || readAnalyticsConsent() !== "accepted") {
    return {
      googleAnalytics: false,
      microsoftClarity: false,
    };
  }

  return {
    googleAnalytics: Boolean(getGoogleAnalyticsId()),
    microsoftClarity: Boolean(getMicrosoftClarityId()),
  };
};

const hasAnalyticsDestination = ({
  googleAnalytics,
  microsoftClarity,
}: AnalyticsDestinations) => googleAnalytics || microsoftClarity;

const getCurrentPagePath = () => window.location.pathname;

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

    if (!activePageSession && readAnalyticsConsent() === "accepted") {
      startPageSession(getCurrentPagePath());
    }
  });
};

const initializeGoogleAnalytics = () => {
  const measurementId = getGoogleAnalyticsId();

  if (!measurementId) {
    return false;
  }

  setGoogleAnalyticsDisabled(false);
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtagCommand() {
      // Google Tag's bootstrap API intentionally queues its arguments object.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };

  if (!document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.async = true;
    script.id = GOOGLE_ANALYTICS_SCRIPT_ID;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      measurementId,
    )}`;
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("consent", "default", googleConsent(true));
    window.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
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
  window.clarity("consentv2", clarityConsent(true));

  if (!document.getElementById(MICROSOFT_CLARITY_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.async = true;
    script.id = MICROSOFT_CLARITY_SCRIPT_ID;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
    document.head.appendChild(script);
  }

  return true;
};

const dispatchAnalyticsCommand = (
  command: PendingAnalyticsCommand,
  destinations: AnalyticsDestinations,
) => {
  if (readAnalyticsConsent() !== "accepted") return;
  if (command.type === "event") {
    if (destinations.googleAnalytics) {
      window.gtag?.("event", command.eventName, {
        ...command.params,
        send_to: getGoogleAnalyticsId(),
      });
    }

    if (destinations.microsoftClarity) {
      window.clarity?.("event", command.eventName);
    }

    return;
  }

  if (destinations.googleAnalytics) {
    window.gtag?.("event", "page_view", {
      page_location: command.location,
      page_path: command.path,
      page_title: command.title,
      send_to: getGoogleAnalyticsId(),
    });
  }
};

const initializeAnalyticsProviders = () => {
  cancelAnalyticsInitialization = null;
  analyticsInitializationScheduled = false;

  if (readAnalyticsConsent() !== "accepted") {
    pendingAnalyticsCommands.splice(0);
    return { googleAnalytics: false, microsoftClarity: false };
  }
  if (analyticsProvidersInitialized) {
    return initializedDestinations;
  }

  const configuredDestinations = getConfiguredDestinations();

  initializedDestinations = {
    googleAnalytics:
      configuredDestinations.googleAnalytics && initializeGoogleAnalytics(),
    microsoftClarity:
      configuredDestinations.microsoftClarity && initializeMicrosoftClarity(),
  };
  analyticsProvidersInitialized = true;

  const queuedCommands = pendingAnalyticsCommands.splice(0);
  queuedCommands.forEach((command) =>
    dispatchAnalyticsCommand(command, initializedDestinations),
  );

  return initializedDestinations;
};

const scheduleAnalyticsInitialization = () => {
  if (analyticsProvidersInitialized || analyticsInitializationScheduled) {
    return;
  }

  analyticsInitializationScheduled = true;
  cancelAnalyticsInitialization = scheduleAfterInitialLoad(
    initializeAnalyticsProviders,
    {
      delay: ANALYTICS_IDLE_DELAY_MS,
      runOnInput: true,
      timeout: ANALYTICS_IDLE_TIMEOUT_MS,
    },
  );
};

export const initializeAnalytics = () => {
  const configuredDestinations = getConfiguredDestinations();

  if (!hasAnalyticsDestination(configuredDestinations)) {
    return configuredDestinations;
  }

  installLifecycleTracking();
  scheduleAnalyticsInitialization();

  return configuredDestinations;
};

export const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  const configuredDestinations = initializeAnalytics();

  if (!hasAnalyticsDestination(configuredDestinations)) {
    return false;
  }

  const command: PendingAnalyticsCommand = {
    eventName,
    params: normalizeAnalyticsParams(params),
    type: "event",
  };

  if (analyticsProvidersInitialized) {
    dispatchAnalyticsCommand(command, initializedDestinations);
  } else {
    pendingAnalyticsCommands.push(command);
  }

  return true;
};

export const trackPageView = (path: string) => {
  path = path.split(/[?#]/, 1)[0];
  if (path.startsWith("/og-card")) {
    return;
  }

  const configuredDestinations = initializeAnalytics();

  if (!hasAnalyticsDestination(configuredDestinations)) {
    return;
  }

  flushPageSession("route_change");
  startPageSession(path);

  const command: PendingAnalyticsCommand = {
    location: `${window.location.origin}${path}`,
    path,
    title: document.title,
    type: "page_view",
  };

  if (analyticsProvidersInitialized) {
    dispatchAnalyticsCommand(command, initializedDestinations);
  } else {
    pendingAnalyticsCommands.push(command);
  }
};

// Both analytics and the banner observe local decisions, other tabs and expiry.
// Stop/restart the existing providers without reloading or losing the user's place.
if (typeof window !== "undefined") {
  const consentChanged = () => {
    if (readAnalyticsConsent() === "accepted") {
      if (analyticsProvidersStopped) {
        if (initializedDestinations.googleAnalytics) {
          setGoogleAnalyticsDisabled(false);
          window.gtag?.("consent", "update", googleConsent(true));
        }
        if (initializedDestinations.microsoftClarity) {
          window.clarity?.("consentv2", clarityConsent(true));
          // Clarity queues commands after stop; start resumes with its existing config.
          window.clarity?.("start");
        }
        analyticsProvidersStopped = false;
      }
      trackPageView(window.location.pathname);
      return;
    }

    cancelAnalyticsInitialization?.();
    cancelAnalyticsInitialization = null;
    analyticsInitializationScheduled = false;
    pendingAnalyticsCommands.splice(0);
    activePageSession = null;
    if (analyticsProvidersInitialized && !analyticsProvidersStopped) {
      if (initializedDestinations.googleAnalytics) {
        setGoogleAnalyticsDisabled(true);
        window.gtag?.("consent", "update", googleConsent(false));
      }
      if (initializedDestinations.microsoftClarity) {
        window.clarity?.("consentv2", clarityConsent(false));
        window.clarity?.("stop");
      }
      analyticsProvidersStopped = true;
    }
    clearAnalyticsCookies();
  };

  if (readAnalyticsConsent() !== "accepted") clearAnalyticsCookies();
  const unsubscribe = subscribeToAnalyticsConsent(consentChanged);
  import.meta.hot?.dispose(() => {
    unsubscribe();
    cancelAnalyticsInitialization?.();
  });
}
