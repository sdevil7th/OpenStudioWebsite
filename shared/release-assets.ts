export type DesktopPlatform = "windows" | "macos" | "linux";

const EXTENSIONS: Record<DesktopPlatform, readonly string[]> = {
  windows: [".exe", ".msi"],
  macos: [".dmg", ".pkg"],
  linux: [".deb", ".appimage", ".rpm"],
};

/** Prefer native installers; platform words alone must never select metadata or checksums. */
export function selectReleaseAsset<T extends { name: string }>(
  assets: readonly T[],
  platform: DesktopPlatform,
): T | undefined {
  const extensions = EXTENSIONS[platform];
  return assets
    .map((asset) => {
      const name = asset.name.toLowerCase();
      const extension = extensions.findIndex((suffix) => name.endsWith(suffix));
      if (extension < 0 || /(?:^|[-_])(?:source|symbols|debug)(?:[-_.]|$)/.test(name)) return { asset, score: 0 };
      const architecture = platform === "macos" ? /universal|arm64|apple/ : /x86_64|x64|amd64/;
      return {
        asset,
        score: 100 - extension * 10 + (architecture.test(name) ? 2 : 0) + (name.includes("setup") ? 1 : 0),
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.asset;
}

/** Keep native installation choices separate from the AppImage updater package. */
export function selectLinuxReleaseAsset<T extends { name: string }>(
  assets: readonly T[],
  format: "deb" | "appimage",
): T | undefined {
  return selectReleaseAsset(assets.filter(({ name }) => name.toLowerCase().endsWith(`.${format}`)), "linux");
}
