import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRouteHtml, buildSitemapXml, routeDependencies } from '../scripts/prerender-site.mjs';

test('route preloads include static dependencies without eager loading optional illustrations', () => {
 const manifest={ page:{file:'page.js',imports:['shared'],dynamicImports:['art']}, shared:{file:'shared.js',css:['shared.css']}, art:{file:'art.js'} };
 assert.deepEqual(routeDependencies(manifest,['page']),{files:['/page.js','/shared.js'],styles:['/shared.css']});
 assert.throws(()=>routeDependencies(manifest,['missing']),/Missing built route module/);
});

test('sitemaps include only indexable routes and verified modification dates', () => {
 const sitemap=buildSitemapXml([
  {path:'/',seo:{}},
  {path:'/docs/keys',updated:'2026-09-16',seo:{}},
  {path:'/blog/post',seo:{publishedTime:'2026-08-01',modifiedTime:'2026-09-10'}},
  {path:'/404',seo:{}},
  {path:'/private-tool',seo:{robots:'NOINDEX, FOLLOW'}},
 ]);
 assert.match(sitemap, /<loc>https:\/\/openstudio.org.in\/<\/loc><\/url>/);
 assert.match(sitemap, /\/docs\/keys<\/loc><lastmod>2026-09-16<\/lastmod>/);
 assert.match(sitemap, /\/blog\/post<\/loc><lastmod>2026-09-10<\/lastmod>/);
 assert.doesNotMatch(sitemap, /404|private-tool/);
});

test('nonindexable HTML has no canonical or rich-result schema', () => {
 const route={path:'/private-tool',moduleSource:'page',html:'<h1>Tool</h1>',seo:{title:'Tool',description:'Internal tool',robots:'NOINDEX, FOLLOW',jsonLd:{'@type':'WebPage'}}};
 const html=buildRouteHtml('<html><head></head><body><div id="root"></div></body></html>',route,{manifest:{page:{file:'page.js'}}});
 assert.doesNotMatch(html, /rel="canonical"|application\/ld\+json/);
 assert.match(html, /name="robots" content="NOINDEX, FOLLOW"/);
});

test('route SEO escapes metadata and replaces stale head data', () => {
 const route={path:'/docs',moduleSource:'page',html:'<h1>Docs</h1>',seo:{title:'Docs & <tools>',description:'Use "quoted" labels'}};
 const html=buildRouteHtml('<html lang="en"><head><title>Old</title><meta name="description" content="Old" /></head><body><div id="root"></div></body></html>',route,{manifest:{page:{file:'page.js'}}});
 assert.ok(html.includes('<title>Docs &amp; &lt;tools&gt;</title>'));
 assert.ok(html.includes('Use &quot;quoted&quot; labels'));
 assert.ok(html.includes('data-static-route-content><h1>Docs</h1>'));
 assert.ok(!html.includes('Old'));
});
