/// <reference types="vite/client" />

interface Window {
  __openstudioAppReady?: boolean;
  __openstudioAppCssReady?: boolean;
  __openstudioIntroHidden?: boolean;
  __openstudioLoaderReady?: boolean;
  __openstudioFirstRouteReveal?: boolean;
  __openstudioMarkAppCssReady?: () => void;
}
