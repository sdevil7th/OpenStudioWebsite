import assert from "node:assert/strict";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { chromium, devices } from "playwright";

const providerPattern = /^https:\/\/([^/]+\.)?(googletagmanager\.com|google-analytics\.com|clarity\.ms|bing\.com|doubleclick\.net|googleadservices\.com|google\.com)\//;
const scriptPattern = /googletagmanager\.com\/gtag\/js|clarity\.ms\/tag\/|scripts\.clarity\.ms\//;

/** GA batches several events into newline-separated POST bodies with shared URL fields. */
export function decodeGoogleEvents(url, body) {
  const parsed = new URL(url);
  if (!/(^|\.)google-analytics\.com$/.test(parsed.hostname) || !parsed.pathname.endsWith("/collect")) return [];
  const shared = Object.fromEntries(parsed.searchParams);
  return (body?.trim().split(/\r?\n/) ?? [""]).map(line => {
    const fields = { ...shared, ...Object.fromEntries(new URLSearchParams(line)) };
    // Do not persist visitor IDs, cookies, device fingerprints or raw replay payloads.
    return {
      name: fields.en,
      location: fields.dl,
      referrer: fields.dr ?? "",
      title: fields.dt,
      path: fields.dp,
      link: fields["ep.link_url"],
    };
  }).filter(event => event.name);
}

export function assertPageViews(events, expected) {
  const views = events.filter(event => event.name === "page_view");
  assert.deepEqual(views.map(event => event.location), expected,
    'Expected one page_view per navigation. Check GA Enhanced measurement → Page views → "Page changes based on browser history events" is OFF.');
  for (let index = 1; index < views.length; index++) {
    assert.equal(views[index].referrer, expected[index - 1], "The manual page view must retain its previous page as referrer");
  }
}

export async function verifyAnalytics({ url, mobile = false, settleMs = 8000 }) {
  const origin = new URL(url).origin;
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...(mobile ? devices["Pixel 5"] : { viewport: { width: 1440, height: 900 } }),
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const events = [];
  const scripts = new Set();
  const errors = [];
  let providerRequests = 0;
  let clarityUploads = 0;
  try {
    // Real provider scripts; intercept EVERY measurement request before upload.
    // This checks provider behavior without adding synthetic traffic to reports.
    await context.route(providerPattern, async route => {
      const request = route.request();
      providerRequests++;
      if (request.resourceType() === "script" && scriptPattern.test(request.url())) {
        scripts.add(request.url());
        return route.continue();
      }
      events.push(...decodeGoogleEvents(request.url(), request.url().includes("google-analytics.com/") ? request.postData() : null));
      if (/clarity\.ms\/collect/.test(request.url())) clarityUploads++;
      return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" }, body: "" });
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    const ready = () => page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
    const settle = () => page.waitForTimeout(settleMs);
    await page.goto(`${origin}/privacy`);
    await ready();
    await page.waitForTimeout(2200);
    assert.equal(providerRequests, 0, "No analytics provider may load before consent");
    await page.getByRole("button", { name: "Accept analytics", exact: true }).click();
    await settle();
    assert.ok([...scripts].some(url => url.includes("googletagmanager.com/gtag/js")), "GA is missing/disabled or its script is blocked");
    assert.ok([...scripts].some(url => url.includes("clarity.ms/tag/")), "Clarity is missing/disabled or its script is blocked");
    assert.ok(clarityUploads > 0, "The real Clarity runtime did not generate an upload");

    // Use client navigation, including back navigation. Full reloads cannot expose
    // duplicate history measurement or the old/new page-context mix-up.
    if (mobile) await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await page.getByRole("navigation", { name: mobile ? "Primary mobile" : "Primary", exact: true })
      .getByRole("link", { name: "Docs", exact: true }).click();
    await page.waitForURL(`${origin}/docs`);
    await settle();
    await page.locator(".sp-nav__download").click();
    await page.waitForURL(`${origin}/download`);
    await settle();

    const links = await page.locator('main a[href*="github.com/"][href*="/releases/download/"]')
      .evaluateAll(anchors => [...new Set(anchors.map(anchor => anchor.href))]);
    const installers = links.filter(href => /\.(exe|dmg|appimage)$/i.test(href));
    assert.equal(installers.length, 3, "Expected current GitHub installers for all three platforms");
    // Retain the site's real click handlers but prevent binary downloads.
    await page.evaluate(() => document.addEventListener("click", event => {
      if (event.target instanceof Element && event.target.closest("a")?.href.includes("/releases/download/")) event.preventDefault();
    }, true));
    for (const platform of ["Windows", "macOS", "Linux"]) {
      await page.locator("main").getByRole("link", { name: new RegExp(`^Download for ${platform}`) }).first().click();
    }
    await settle();
    for (const href of installers) assert.equal(events.filter(event => event.name === "file_download_clicked" && event.link === href).length, 1, `Missing or duplicate installer click: ${href}`);

    await page.goBack();
    await page.waitForURL(`${origin}/docs`);
    await settle();
    assertPageViews(events, ["/privacy", "/docs", "/download", "/docs"].map(path => origin + path));
    const engagement = events.filter(event => event.name === "page_engagement_time");
    assert.deepEqual(engagement.map(event => event.location), ["/privacy", "/docs", "/download"].map(path => origin + path));
    for (const event of engagement) assert.equal(event.path, new URL(event.location).pathname);
    assert.deepEqual(errors, []);
    return { origin, mobile, result: "passed", pageViews: 4, installerClicks: installers.length, clarityGeneratedUploads: true };
  } finally {
    await context.close();
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: {
    url: { type: "string", default: "https://openstudio.org.in" },
    mobile: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  } });
  if (values.help) console.log("Usage: npm run verify:analytics -- [--url https://openstudio.org.in] [--mobile]\nUses real Google/Clarity scripts and intercepts uploads. Allow about one minute. Requires analytics enabled on the target.");
  else {
    try { console.log(JSON.stringify(await verifyAnalytics(values), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
