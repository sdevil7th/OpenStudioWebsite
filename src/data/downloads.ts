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
    minimum: "Windows 10+, macOS 12+, or Ubuntu 22.04+ with ALSA or JACK",
    recommended: "A low-latency audio interface with current drivers",
  },
];

export const downloadUpgradeNote =
  "Before upgrading, back up projects, recordings, presets, NAM models, and cabinet IRs. Projects and presets using retired formats require conversion; renaming a file does not convert it, and automatic migration is not included. Keep the older app for unconverted sessions.";
