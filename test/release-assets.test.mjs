import assert from "node:assert/strict";
import { test } from "node:test";
import { selectReleaseAsset } from "../shared/release-assets.ts";

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
