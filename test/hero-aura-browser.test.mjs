import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { preview } from "vite";

const origin = "https://aura.promad.design";
const embed = `${origin}/embed/**`;
const selector = ".sp-hero-aura__frame";
// Exercise the existing cross-origin capture protocol, including actual PNG
// decoding. The live-service smoke check is documented separately.
const fixture = `<!doctype html><body><canvas width="64" height="64"></canvas><script>
window.allowed = false;
window.captures = 0;
window.firstRequest = null;
window.fill = '#fff';
addEventListener('message', async event => {
  if (event.data?.type !== 'promad-aura:capture') return;
  window.firstRequest ||= event.data.requestId;
  window.captures++;
  if (!window.allowed) return;
  await new Promise(resolve => requestAnimationFrame(resolve));
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = window.fill; ctx.fillRect(0, 0, 64, 64);
  event.source.postMessage({ type:'promad-aura:capture-result', requestId:event.data.requestId,
    dataUrl:canvas.toDataURL('image/png') }, event.origin);
});
</script>`;

test("Aura only reveals a verified frame and preserves its viewport lifecycle", { timeout: 150_000 }, async (t) => {
  const server = await preview({ logLevel: "error", preview: { host: "127.0.0.1", port: 0, strictPort: true } });
  const browser = await chromium.launch();
  const base = server.resolvedUrls.local[0];
  const open = async (options = {}) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
    await context.route("https://**/*", route => route.abort());
    await context.route(embed, route => route.fulfill({ contentType: "text/html", body: fixture }));
    await context.addInitScript(() => {
      if (window.top === window) localStorage.setItem("openstudio.analytics-consent.v1", JSON.stringify({ choice: "rejected", time: Date.now() }));
    });
    const page = await context.newPage();
    await page.goto(base);
    await page.waitForFunction(() => window.__openstudioAppReady && window.__openstudioIntroHidden);
    return { context, page };
  };
  const activate = async page => {
    // The idle gate can arm after the initial reveal.
    await page.waitForTimeout(600);
    await page.mouse.move(100, 100);
    await page.locator(selector).waitFor({ state: "attached" });
    const frame = await (await page.locator(selector).elementHandle()).contentFrame();
    await frame.waitForFunction(() => typeof window.allowed === "boolean");
    return frame;
  };
  const ready = page => page.locator(`${selector}[data-ready="true"]`).waitFor({ state: "attached", timeout: 18_000 });
  try {
    await t.test("slow, dark and forged responses keep the fallback; real light frames reveal", async () => {
      const { context, page } = await open();
      try {
        const frame = await activate(page);
        assert.deepEqual(await page.locator(selector).evaluate(e=>({visibility:getComputedStyle(e).visibility,opacity:getComputedStyle(e).opacity})),
          {visibility:"visible",opacity:"0"}, "startup stays renderable but transparent until a frame is verified");
        await frame.waitForFunction(() => window.firstRequest !== null);
        const id = await frame.evaluate(() => window.firstRequest);
        await page.evaluate(({id, origin}) => window.dispatchEvent(new MessageEvent("message", {
          origin, source: window, data: {type:"promad-aura:capture-result", requestId:id, dataUrl:"data:image/png;base64,AAAA"},
        })), {id, origin});
        await page.waitForTimeout(4200);
        assert.equal(await page.locator(selector).getAttribute("data-ready"), "false", "iframe load alone never reveals it");
        await frame.evaluate(() => {window.allowed=true; window.fill="#000";});
        await page.waitForTimeout(5000);
        assert.equal(await page.locator(selector).getAttribute("data-ready"), "false", "a successfully captured black frame is not ready");
        await frame.evaluate(() => {window.fill="#fff";});
        await ready(page);
        const count = await frame.evaluate(() => window.captures);
        await page.waitForTimeout(1200);
        assert.equal(await frame.evaluate(() => window.captures), count, "startup probes stop after readiness");
      } finally { await context.close(); }
    });

    await t.test("scrolling preserves the iframe; reduced-motion remounts start unready", async () => {
      const { context, page } = await open({ viewport: {width:390,height:844}, isMobile:true, hasTouch:true });
      try {
        const frame = await activate(page);
        await frame.evaluate(() => {window.allowed=true; window.instance="original";});
        await ready(page);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForFunction(() => document.querySelector('.sp-hero-aura__bg').dataset.playing === 'false');
        await page.waitForTimeout(2600);
        assert.equal(await page.locator(selector).evaluate(e=>getComputedStyle(e).visibility), "hidden");
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForFunction(() => document.querySelector('.sp-hero-aura__bg').dataset.playing === 'true');
        assert.equal(await frame.evaluate(() => window.instance), "original", "scrolling never reloads the scene");
        assert.equal(await page.locator(selector).getAttribute("data-ready"), "true");
        await page.emulateMedia({ reducedMotion:"reduce" });
        await page.locator(selector).waitFor({state:"detached"});
        await page.emulateMedia({ reducedMotion:"no-preference" });
        await page.locator(selector).waitFor({state:"attached"});
        await page.waitForTimeout(4500);
        assert.equal(await page.locator(selector).getAttribute("data-ready"), "false", "replacement has not proved readiness");
        const replacement=await (await page.locator(selector).elementHandle()).contentFrame();
        await replacement.evaluate(()=>{window.allowed=true;});
        await ready(page);
      } finally { await context.close(); }
    });

    await t.test("an unresponsive embed times out to the fallback", async () => {
      const { context, page } = await open();
      try {
        await activate(page);
        await page.locator(selector).waitFor({state:"detached", timeout:35_000});
        assert.equal(await page.locator('.sp-hero-aura__bg').isVisible(), true);
        assert.equal(await page.locator('h1').isVisible(), true);
      } finally { await context.close(); }
    });

    await t.test("initial reduced motion does not request an iframe", async () => {
      const { context, page } = await open({reducedMotion:"reduce"});
      try {
        await page.mouse.move(100,100);
        await page.waitForTimeout(1200);
        assert.equal(await page.locator(selector).count(),0);
      } finally { await context.close(); }
    });
  } finally {
    await browser.close();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
});
