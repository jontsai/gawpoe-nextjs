import { readFile, writeFile } from "node:fs/promises";
import { locations, checkSitemapParity } from "./check-sitemap-parity.mjs";
const source = "https://www.gawpoe.com/wp-sitemap.xml";
async function xml(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw Error(`${url}: HTTP ${r.status}`);
  return r.text();
}
const children = locations(await xml(source));
const live = [];
const sitemaps = [];
for (const url of children) {
  const urls = locations(await xml(url));
  sitemaps.push({ url, count: urls.length });
  live.push(...urls);
}
const generated = locations(await readFile("out/sitemap.xml", "utf8"));
const missing = live.filter((url) => !generated.includes(url));
const extra = generated.filter((url) => !live.includes(url));
const report = {
  checkedAt: new Date().toISOString(),
  source,
  sitemaps,
  sourceCount: live.length,
  generatedCount: generated.length,
  missing,
  extra,
  urls: [...live].sort(),
};
checkSitemapParity("out");
checkSitemapParity("docs");
await writeFile(
  "verification/sitemap-audit.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify({ ...report, urls: undefined }, null, 2));
if (missing.length || extra.length) process.exitCode = 1;
