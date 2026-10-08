import assert from "node:assert/strict";
import { test } from "node:test";
import { selectLinuxReleaseAsset, selectReleaseAsset } from "../shared/release-assets.ts";

test("desktop downloads choose installers, never metadata or debug archives", () => {
  const assets = [
    "windows-appcast.xml",
    "windows-runtime.json",
    "OpenStudio-Windows-symbols.zip",
    "OpenStudio-Setup-x64.exe",
    "OpenStudio-macOS.dmg",
    "OpenStudio-linux-x86_64.AppImage",
  ].map((name) => ({ name }));
  assert.equal(selectReleaseAsset(assets, "windows")?.name, "OpenStudio-Setup-x64.exe");
  assert.equal(selectReleaseAsset(assets, "macos")?.name, "OpenStudio-macOS.dmg");
  assert.equal(selectReleaseAsset(assets, "linux")?.name, "OpenStudio-linux-x86_64.AppImage");
  assert.equal(selectReleaseAsset(assets.slice(0, 3), "windows"), undefined);
  assert.equal(selectReleaseAsset([], "linux"), undefined);
});

test("Linux prefers the native DEB and retains AppImage for earlier releases", () => {
  const assets = [
    "OpenStudio-linux-x86_64.AppImage",
    "OpenStudio-linux-x86_64.rpm",
    "OpenStudio-source-amd64.deb",
    "OpenStudio-debug-amd64.deb",
    "OpenStudio-1.2.3-1-ubuntu-22.04-arm64.deb",
    "OpenStudio-1.2.3-1-ubuntu-22.04-amd64.deb",
  ].map((name) => ({ name }));
  assert.equal(selectReleaseAsset(assets, "linux")?.name, assets[5].name);
  assert.equal(selectLinuxReleaseAsset(assets, "appimage")?.name, assets[0].name);
  assert.equal(selectLinuxReleaseAsset(assets, "deb")?.name, assets[5].name);
  assert.equal(selectReleaseAsset(assets.slice(0, 4), "linux")?.name, assets[0].name);
  assert.equal(selectLinuxReleaseAsset(assets.slice(0, 4), "deb"), undefined);
});
