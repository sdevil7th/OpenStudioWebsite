/// <reference types="vite/client" />

interface Window {
  __openstudioAppReady?: boolean;
  __openstudioAppCssReady?: boolean;
  __openstudioIntroHidden?: boolean;
  __openstudioLoaderReady?: boolean;
  __openstudioFirstRouteReveal?: boolean;
  __openstudioMarkAppCssReady?: () => void;
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ENABLED?: "true" | "false";
  readonly VITE_CLARITY_PROJECT_ID?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
}
