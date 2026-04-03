export interface NavigationItem {
  label: string;
  to: string;
  shortLabel?: string;
}

export const mainNavigation: NavigationItem[] = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "Stem Separation", to: "/stem-separation", shortLabel: "AI" },
  { label: "GitHub", to: "/github" },
  { label: "Releases", to: "/releases" },
  { label: "Download", to: "/download" },
  { label: "Contact", to: "/contact" },
];

export const footerNavigation: NavigationItem[] = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "Stem Separation", to: "/stem-separation" },
  { label: "GitHub", to: "/github" },
  { label: "Releases", to: "/releases" },
  { label: "Download", to: "/download" },
  { label: "Contact", to: "/contact" },
];
