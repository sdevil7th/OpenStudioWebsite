import { generatedImageSeoIndex } from "@/lib/generatedImageSeoIndex";
import { withVersionQuery } from "../../shared/asset-image-plan";

export const SITE_NAME = "OpenStudio";
export const SITE_URL = "https://openstudio.org.in";
export const SITE_DESCRIPTION =
  "Free, open source DAW for Windows, macOS, and Linux — music production software with stem separation, pitch editing, MIDI instruments, plugin hosting, audio editing, and mixing.";
export const SITE_TAGLINE = "The synthetic atmosphere for serious production workflows.";
export const SITE_THEME_COLOR = "#050813";
const OG_IMAGE_PATH = "/assets/openstudio/branding/og-image.png";
export const SITE_OG_IMAGE = withVersionQuery(OG_IMAGE_PATH, generatedImageSeoIndex[OG_IMAGE_PATH]?.[2]);

export const BRANDING_ASSETS = {
  mark: "/assets/openstudio/branding/android-chrome-192x192.png?v=20260915",
  favicon16: "/assets/openstudio/branding/favicon-16x16.png?v=20260915",
  favicon32: "/assets/openstudio/branding/favicon-32x32.png?v=20260915",
  appleTouch: "/assets/openstudio/branding/apple-touch-icon.png?v=20260915",
  android192: "/assets/openstudio/branding/android-chrome-192x192.png?v=20260915",
  android512: "/assets/openstudio/branding/android-chrome-512x512.png?v=20260915",
  manifest: "/assets/openstudio/branding/site.webmanifest?v=20260915",
  ogImage: SITE_OG_IMAGE,
};

export const DOWNLOAD_PATHS = {
  windowsLatest: "/download/windows/latest",
  macosLatest: "/download/macos/latest",
  linuxLatest: "/download/linux/latest",
  aiRuntimeWindowsLatest: "/download/ai-runtime/windows/latest",
  aiRuntimeMacosLatest: "/download/ai-runtime/macos/latest",
  aiRuntimeMacosArm64Latest: "/download/ai-runtime/macos/arm64/latest",
  aiRuntimeMacosX64Latest: "/download/ai-runtime/macos/x64/latest",
  aiRuntimeLinuxLatest: "/download/ai-runtime/linux/latest",
  aiRuntimeLinuxX64Latest: "/download/ai-runtime/linux/x64/latest",
  aiRuntimeLinuxArm64Latest: "/download/ai-runtime/linux/arm64/latest",
  releaseMetadataLatest: "/releases/latest.json",
  releaseMetadataStableLatest: "/releases/stable/latest.json",
  aiRuntimeMetadataLatest: "/releases/ai-runtime/latest.json",
  aiRuntimeMetadataStableLatest: "/releases/ai-runtime/stable/latest.json",
  windowsStableAppcast: "/appcast/windows-stable.xml",
  macosStableAppcast: "/appcast/macos-stable.xml",
  linuxStableAppcast: "/appcast/linux-stable.xml",
};

export const APP_REPOSITORY_URL = "https://github.com/sdevil7th/OpenStudio";
