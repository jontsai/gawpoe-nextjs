import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { load } from 'cheerio';
const route='/5-hour-energy-sellers-ask-9th-circ-to-revive-antitrust-fight/';
const title='5-Hour Energy Sellers Ask 9th Circ. To Revive Antitrust Fight';
test('Law360 2543038 has one route, verified copy, metadata and press links',()=>{
 const capture=JSON.parse(readFileSync('src/content/generated/live-site.json'));
 assert.equal(capture.pages.filter(p=>p.path===route).length,1);
 const $=load(readFileSync(`out${route}index.html`));
 assert.equal($('.wp-block-post-title').text(),title);
 assert.match($('.wp-block-post-content').text(),/October 27, 2026/);
 assert.equal($('.wp-block-post-content a').filter((_,el)=>$(el).text()==='Read more').attr('href'),'https://www.law360.com/california/articles/2543038');
 assert.doesNotMatch($('.wp-block-post-content').text(),/Randolph|Randy|Gaw|Poe/);
 const image=$('.wp-block-post-content img');
 assert.equal(image.attr('src'),'/images/press/james-r-browning-courthouse.webp');
 assert.equal(image.attr('width'),'1844');
 assert.equal(image.attr('height'),'930');
 assert.match(image.attr('alt'),/James R. Browning/);
 assert.match($('figcaption').text(),/Sanfranman59 \/ Mike Hofmann/);
 assert.equal($('figcaption a').last().attr('href'),'https://creativecommons.org/licenses/by-sa/4.0/');
 assert.match($('figcaption').text(),/Converted to WebP; no crop/);
 assert.equal($('.blk-about-gaw-poe').length,1);
 for(const f of readdirSync('src/content/fragments').filter(f=>f.startsWith('latest-press'))){
  const html=readFileSync('src/content/fragments/'+f,'utf8');
  const fragment=load(html);
  assert.equal(fragment('.wp-block-latest-posts__list > li').first().find('img').attr('src'),'/images/press/james-r-browning-courthouse.webp',f);
  assert.ok(html.includes(route),f);
  assert.ok(html.indexOf(route)<html.indexOf('/9th-circ-wont-rehear'),f);
 }
 const press=load(readFileSync('out/press/index.html'));
 assert.equal(press(`a.wp-block-latest-posts__post-title[href="${route}"]`).length,1);
 const item=press('.wp-block-latest-posts__list > li').first();
 assert.equal(item.find('.wp-block-latest-posts__featured-image img').attr('src'),'/images/press/james-r-browning-courthouse.webp');
 assert.equal(item.find('.wp-block-latest-posts__featured-image a').attr('href'),route);
});
