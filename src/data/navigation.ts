export interface NavigationItem {
  label: string;
  to: string;
  shortLabel?: string;
}

export const mainNavigation: NavigationItem[] = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "AI", to: "/ai" },
  { label: "GitHub", to: "/github" },
  { label: "Releases", to: "/releases" },
  { label: "Blogs", to: "/blogs" },
  { label: "Download", to: "/download" },
  { label: "Contact", to: "/contact" },
];

export const footerNavigation: NavigationItem[] = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "AI", to: "/ai" },
  { label: "GitHub", to: "/github" },
  { label: "Releases", to: "/releases" },
  { label: "Blogs", to: "/blogs" },
  { label: "Download", to: "/download" },
  { label: "Contact", to: "/contact" },
];
