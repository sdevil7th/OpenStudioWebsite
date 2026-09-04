import { Apple, Monitor, Terminal, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { DOWNLOAD_PATHS } from "@/constants/site";

export type PlatformId = "windows" | "macos" | "linux";

export interface PlatformInfo {
  id: PlatformId;
  label: string;
  icon: ComponentType<LucideProps>;
  /** Stable redirect endpoint that resolves to the newest artifact for the OS. */
  href: string;
  artifactType: string;
}

export const PLATFORMS: Record<PlatformId, PlatformInfo> = {
  windows: { id: "windows", label: "Windows", icon: Monitor, href: DOWNLOAD_PATHS.windowsLatest, artifactType: "Installer (.exe)" },
  macos: { id: "macos", label: "macOS", icon: Apple, href: DOWNLOAD_PATHS.macosLatest, artifactType: "Disk image (.dmg)" },
  linux: { id: "linux", label: "Linux", icon: Terminal, href: DOWNLOAD_PATHS.linuxLatest, artifactType: "AppImage" },
};

export const PLATFORM_ORDER: PlatformId[] = ["windows", "macos", "linux"];

/**
 * Same signal stack as the v1 download page: UA-CH platform first, then the
 * legacy `navigator.platform`, then the UA string. Returns null on phones and
 * anything else that cannot run the desktop app, so callers can fall back to a
 * neutral "Download" label instead of suggesting the wrong build.
 */
export const detectPlatform = (): PlatformId | null => {
  if (typeof navigator === "undefined") {
    return null;
  }

  const withUaData = navigator as Navigator & { userAgentData?: { platform?: string; mobile?: boolean } };
  const signal = [withUaData.userAgentData?.platform ?? "", navigator.platform ?? "", navigator.userAgent ?? ""]
    .join(" ")
    .toLowerCase();

  if (withUaData.userAgentData?.mobile || /iphone|ipad|ipod|android/.test(signal)) {
    return null;
  }

  if (signal.includes("mac")) {
    return "macos";
  }

  if (signal.includes("win")) {
    return "windows";
  }

  if (signal.includes("linux") || signal.includes("x11") || signal.includes("cros")) {
    return "linux";
  }

  return null;
};

/** Detected desktop platform, or null when the visitor is not on a supported desktop OS. */
export const usePlatform = () => {
  const [platform] = useState<PlatformId | null>(() => detectPlatform());
  return platform;
};

/** Detected platform first, then the rest in the canonical order. */
export const orderPlatforms = (detected: PlatformId | null): PlatformInfo[] => {
  const rest = PLATFORM_ORDER.filter((id) => id !== detected).map((id) => PLATFORMS[id]);
  return detected ? [PLATFORMS[detected], ...rest] : rest;
};
