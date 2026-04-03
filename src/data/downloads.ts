import { DOWNLOAD_PATHS } from "@/constants/site";

export interface PlatformDownload {
  id: "windows" | "macos" | "linux";
  label: string;
  artifactType: string;
  href?: string;
  status?: string;
  note?: string;
  notes?: string[];
}

export const platformDownloads: PlatformDownload[] = [
  {
    id: "windows",
    label: "Windows",
    artifactType: "Installer",
    href: DOWNLOAD_PATHS.windowsLatest,
    note: "Unsigned installer may show a SmartScreen warning on first run.",
    notes: [
      "Best path for everyday desktop installs.",
      "The button points to the stable redirect endpoint for the current Windows build.",
    ],
  },
  {
    id: "macos",
    label: "macOS",
    artifactType: "Unsigned DMG",
    href: DOWNLOAD_PATHS.macosLatest,
    notes: [
      "Drag OpenStudio to Applications.",
      "If macOS blocks launch, right-click OpenStudio and choose Open.",
      "If needed, allow it in System Settings > Privacy & Security.",
    ],
  },
  {
    id: "linux",
    label: "Linux",
    artifactType: "Package status",
    status: "Coming later",
    notes: [
      "Linux builds are planned, but they are not part of the current public release.",
    ],
  },
];

export const downloadHero = {
  eyebrow: "Download OpenStudio",
  title: "Start the session fast, with the release caveats still visible.",
  description:
    "Choose the current Windows or macOS build, keep the install steps readable, and understand where optional AI tooling fits into the product instead of being surprised later.",
};

export const downloadHeroSignals = [
  "Stable redirect endpoints",
  "Manual trust notes kept visible",
  "Optional AI install stays separate",
];

export const systemRequirements = [
  "64-bit Windows 10 or later, or macOS 12 Monterey or later.",
  "A modern multi-core CPU and at least 8 GB RAM for comfortable multitrack work.",
  "Audio interface or built-in device with current drivers for low-latency recording.",
  "Extra storage space if you later install optional AI tools for stem separation.",
];

export const systemRequirementMatrix = [
  {
    component: "Processor",
    minimum: "Modern 64-bit multi-core CPU",
    recommended: "Higher-core desktop CPU for dense sessions and optional AI tools",
  },
  {
    component: "Memory",
    minimum: "8 GB RAM",
    recommended: "16 GB or more for large projects and better headroom",
  },
  {
    component: "Storage",
    minimum: "2 GB free space for the base app",
    recommended: "Extra SSD space for sessions, plugins, and optional AI runtime files",
  },
  {
    component: "OS / Audio",
    minimum: "Windows 10+ or macOS 12+ with a current audio device driver",
    recommended: "A low-latency audio interface with current drivers",
  },
];

export const installInstructions = {
  windows: [
    "Download the latest Windows installer.",
    "Run the installer and follow the setup flow.",
    "If SmartScreen warns on first run, review the source and continue if you trust the release.",
  ],
  macos: [
    "Download the latest macOS DMG.",
    "Open the DMG and drag OpenStudio to Applications.",
    "If Gatekeeper blocks the app, right-click OpenStudio, choose Open, and allow it in Privacy & Security if needed.",
  ],
};

export const releaseNotes = [
  "Stable download redirects live at /download/windows/latest and /download/macos/latest.",
  "The base app stays lean by keeping optional AI runtime components outside the default installer.",
  "Distribution is currently optimized for a zero-cost release path, so unsigned installs may require manual trust steps.",
];

export const autoUpdateNotes = [
  "OpenStudio checks release metadata from openstudio.org.in to discover newer builds.",
  "That metadata-driven flow helps point users to updates without implying fully signed, one-click background patching on every platform.",
  "macOS especially should be presented honestly: it is an unsigned DMG release with manual Gatekeeper override guidance.",
];

export const knownLimitations = [
  "Linux is not shipping as a public download yet.",
  "Unsigned builds can trigger SmartScreen on Windows or Gatekeeper on macOS during first launch.",
  "Optional AI tooling requires a separate in-app install and a working Python environment.",
];
