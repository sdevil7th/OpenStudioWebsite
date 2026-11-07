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

/** This archive is a separate download and only exists on releases that publish it. */
export function selectLinuxSupportBundle<T extends { name: string; downloadUrl: string }>(
  release: { tagName: string; htmlUrl: string; assets: readonly T[] },
): T | undefined {
  const name = `OpenStudio-${release.tagName.slice(1)}-linux-x86_64-with-support.tar.gz`;
  const tagPath = `/releases/tag/${release.tagName}`;
  if (!release.htmlUrl.endsWith(tagPath)) return undefined;
  const url = `${release.htmlUrl.slice(0, -tagPath.length)}/releases/download/${release.tagName}/${name}`;
  return release.assets.find((asset) => asset.name === name && asset.downloadUrl === url);
}

/** Keep native installation choices separate from the AppImage updater package. */
export function selectLinuxReleaseAsset<T extends { name: string }>(
  assets: readonly T[],
  format: "deb" | "appimage",
): T | undefined {
  return selectReleaseAsset(assets.filter(({ name }) => name.toLowerCase().endsWith(`.${format}`)), "linux");
}

/** The compact download snapshot retains the standalone AppImage for existing clients. */
export function websiteReleaseAssets<T extends { name: string; downloadUrl: string }>(
  release: { tagName: string; htmlUrl: string; assets: readonly T[] },
): T[] {
  const assets = release.assets;
  const choices = [
    selectReleaseAsset(assets, "windows"),
    selectReleaseAsset(assets, "macos"),
    selectLinuxReleaseAsset(assets, "appimage") ?? selectReleaseAsset(assets, "linux"),
    selectLinuxReleaseAsset(assets, "deb"),
    selectLinuxSupportBundle(release),
  ];
  return [...new Set(choices.filter((asset): asset is T => asset !== undefined))];
}
