import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (file) => fs.readFileSync(file, "utf8");

const routes = [
  {
    css: "src/styles/ai.css",
    importPath: "@/styles/ai.css",
    page: "src/pages/StemSeparationPage.tsx",
    selector: ".ai-neural-page",
  },
  {
    css: "src/styles/features.css",
    importPath: "@/styles/features.css",
    page: "src/pages/FeaturesPage.tsx",
    selector: ".feature-story-page",
  },
  {
    css: "src/styles/download.css",
    importPath: "@/styles/download.css",
    page: "src/pages/DownloadPage.tsx",
    selector: ".download-page",
  },
];

test("large route styles remain outside the shared Home stylesheet", () => {
  const globalCss = read("src/index.css");

  for (const route of routes) {
    const routeCss = read(route.css);
    const pageSource = read(route.page);

    assert.doesNotMatch(globalCss, new RegExp(`\\${route.selector}\\b`));
    assert.match(routeCss, new RegExp(`\\${route.selector}\\b`));
    assert.match(pageSource, new RegExp(`import ["']${route.importPath.replaceAll("/", "\\/")}["'];`));
    assert.match(routeCss, /^@config "\.\.\/\.\.\/tailwind\.route\.config\.ts";/);
    assert.match(routeCss, /@tailwind utilities;/);
    assert.match(routeCss, /@layer utilities\s*\{/);
  }
});

test("the route-only Tailwind pass keeps authored selectors without regenerating core utilities", () => {
  const routeConfig = read("tailwind.route.config.ts");

  assert.match(routeConfig, /\.\/src\/\*\*\/\*\.\{ts,tsx,css\}/);
  assert.match(routeConfig, /corePlugins:\s*\[\]/);
  assert.match(routeConfig, /plugins:\s*\[\]/);
});
