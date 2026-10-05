import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { load } from "cheerio";
export const locations = (xml) =>
  load(xml, { xml: true })("loc")
    .toArray()
    .map((el) => load(el, { xml: true }).text());
export function checkSitemapParity(root = "docs") {
  const inventory = JSON.parse(
    readFileSync("src/data/wp-sitemap.json", "utf8"),
  );
  const expected = inventory.routes.map((route) => route.sourceUrl).sort();
  const actual = locations(readFileSync(`${root}/sitemap.xml`, "utf8")).sort();
  assert.equal(new Set(actual).size, actual.length, "Duplicate sitemap URLs");
  assert.deepEqual(
    actual,
    expected,
    "Generated sitemap must exactly match WordPress inventory",
  );
  const children = locations(readFileSync(`${root}/wp-sitemap.xml`, "utf8"));
  assert.deepEqual(
    children.sort(),
    [...inventory.childSitemaps].sort(),
    "WordPress index parity",
  );
  const mirrored = children
    .flatMap((url) =>
      locations(readFileSync(root + new URL(url).pathname, "utf8")),
    )
    .sort();
  assert.deepEqual(
    mirrored,
    expected,
    "Mirrored WordPress child sitemap parity",
  );
  return actual.length;
}
