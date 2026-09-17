import assert from "node:assert/strict";
import { test } from "node:test";
import { assertPageViews, decodeGoogleEvents } from "../scripts/verify-analytics.mjs";

test("analytics verification decodes batched GA events without retaining identifiers", () => {
  const events = decodeGoogleEvents("https://www.google-analytics.com/g/collect?cid=private&dl=https%3A%2F%2Fexample.org%2Fdocs&dt=Docs", "en=page_engagement_time&dl=https%3A%2F%2Fexample.org%2Fprivacy&dp=%2Fprivacy\r\nen=page_view&dr=https%3A%2F%2Fexample.org%2Fprivacy");
  assert.equal(events.length, 2);
  assert.equal(events[0].location, "https://example.org/privacy");
  assert.equal(events[1].location, "https://example.org/docs");
  assert.equal(events[1].referrer, "https://example.org/privacy");
  assert.ok(!JSON.stringify(events).includes("private"));
  assert.deepEqual(decodeGoogleEvents("https://e.clarity.ms/collect", "replay"), []);
});

test("analytics verification fails for duplicate history page views and missing referrers", () => {
  const events = [
    { name: "page_view", location: "https://example.org/privacy", referrer: "" },
    { name: "page_view", location: "https://example.org/docs", referrer: "https://example.org/privacy" },
  ];
  const expected = events.map(event => event.location);
  assert.doesNotThrow(() => assertPageViews(events, expected));
  assert.throws(() => assertPageViews([...events, events[1]], expected), /one page_view/);
  assert.throws(() => assertPageViews([events[0], { ...events[1], referrer: "" }], expected), /previous page/);
});
