import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { normalizeBlogMarkdown, renderBlogArticleHtml } from '../scripts/blog-markdown-renderer.mjs';
import { selectVariantWidths } from '../scripts/generate-image-assets.mjs';
import { generatedImagePath, intrinsicImageDimensions, withVersionQuery } from '../shared/asset-image-plan.ts';

test('responsive variants never upscale and retain a useful terminal width',()=>{
 assert.deepEqual(selectVariantWidths([320,640,1280],900),[320,640,900]);
 assert.deepEqual(selectVariantWidths([320,640,1280],200),[200]);
 assert.deepEqual(intrinsicImageDimensions(640,16/9),{width:640,height:360});
 assert.equal(generatedImagePath('/assets/blogs/demo.webp',640),'/assets/openstudio/generated/blogs/demo-webp-640.webp');
 assert.equal(withVersionQuery('/image.webp?v=old#part','new'),'/image.webp?v=new#part');
});

test('every published responsive image points at a real generated file',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/assets/openstudio/generated/image-manifest.json',import.meta.url),'utf8'));
 assert.ok(Object.keys(manifest).length>=25);
 for(const [source,entry] of Object.entries(manifest)){
  assert.ok(existsSync(new URL('../public'+source,import.meta.url)),source);
  for(const variant of entry.variants){
   assert.ok(variant.width<=entry.width);
   assert.ok(existsSync(new URL('../public'+variant.src,import.meta.url)),variant.src);
   assert.equal(generatedImagePath(source,variant.width),variant.src);
  }
 }
});

test('blog rendering normalizes source line endings and preserves responsive image paths',()=>{
 assert.equal(normalizeBlogMarkdown('# Title\r\nText\rMore'),'# Title\nText\nMore');
 const src='/assets/blogs/demo.webp';
 const html=renderBlogArticleHtml('![Demo]('+src+')',{[src]:{width:640,height:360,aspectRatio:16/9,variants:[{src:generatedImagePath(src,640),width:640}]}});
 assert.ok(html.includes('srcSet=')||html.includes('srcset='));
 assert.ok(html.includes('/assets/openstudio/generated/blogs/demo-webp-640.webp'));
 assert.ok(html.includes('width="640"'));
});
