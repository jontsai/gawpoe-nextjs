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
 assert.equal($('.wp-block-post-content a').attr('href'),'https://www.law360.com/california/articles/2543038');
 assert.doesNotMatch($('.wp-block-post-content').text(),/Randolph|Randy|Gaw|Poe/);
 assert.equal($('.blk-about-gaw-poe').length,1);
 for(const f of readdirSync('src/content/fragments').filter(f=>f.startsWith('latest-press'))){
  const html=readFileSync('src/content/fragments/'+f,'utf8');
  assert.ok(html.includes(route),f);
  assert.ok(html.indexOf(route)<html.indexOf('/9th-circ-wont-rehear'),f);
 }
 const press=load(readFileSync('out/press/index.html'));
 assert.equal(press(`a[href="${route}"]`).length,1);
});
