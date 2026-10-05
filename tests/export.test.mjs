import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { load } from "cheerio";
const capture = JSON.parse(
  readFileSync("src/content/generated/live-site.json", "utf8"),
);
const original = JSON.parse(
  readFileSync("tests/fixtures/legacy-routes.json", "utf8"),
);
const sitemap = JSON.parse(readFileSync("src/data/wp-sitemap.json", "utf8"));
const filename = (route) => `out${route}index.html`;
const normalize = (s) => s.replace(/\s+/g, " ").trim();
test("every crawled live route, live sitemap route and original snapshot route exists", () => {
  for (const route of new Set([
    ...capture.pages.map((p) => p.path),
    ...original,
    ...sitemap.routes.map((p) => p.path),
  ])) {
    assert.ok(existsSync(filename(route)), route);
    const $ = load(readFileSync(filename(route), "utf8"));
    assert.equal(
      $("link[rel=canonical]").attr("href"),
      "https://www.gawpoe.com" + route,
      route,
    );
  }
});
test("complete original main content and links survive on every captured page", () => {
  for (const page of capture.pages) {
    const $ = load(readFileSync(filename(page.path), "utf8"));
    assert.equal(
      normalize($("main").text()),
      page.sourceText,
      page.path + " text",
    );
    assert.equal($("title").text(), page.title, page.path + " title");
    const normalizeLink = (value) => {
      const u = new URL(value, "https://www.gawpoe.com" + page.path);
      return /^(www\.)?gawpoe\.com$/.test(u.hostname)
        ? u.pathname + u.search + u.hash
        : u.href;
    };
    const actual = $("main a[href]")
      .map((_, e) => normalizeLink($(e).attr("href")))
      .get();
    for (const href of page.sourceLinks) {
      const expected = normalizeLink(href);
      assert.ok(
        actual.includes(expected) || Object.hasOwn(capture.assets, href),
        `${page.path}: lost ${href}`,
      );
    }
  }
});
test("local links, images, responsive variants and font/image CSS URLs resolve", () => {
  const failures = [];
  function check(value, route) {
    if (!value || value.startsWith("data:") || value.startsWith("#")) return;
    const u = new URL(value, "https://www.gawpoe.com" + route);
    if (u.origin !== "https://www.gawpoe.com") return;
    const file = path.join("out", decodeURIComponent(u.pathname));
    if (!existsSync(file) && !existsSync(path.join(file, "index.html")))
      failures.push(`${route}: ${value}`);
  }
  for (const page of capture.pages) {
    const $ = load(readFileSync(filename(page.path), "utf8"));
    $("a[href],img[src],link[rel=stylesheet]").each((_, el) =>
      check($(el).attr(el.name === "img" ? "src" : "href"), page.path),
    );
    for (const el of $("[srcset]").toArray())
      for (const variant of $(el).attr("srcset").split(",")) {
        check(variant.trim().replace(/\s+\d+(?:\.\d+)?[wx]$/, ""), page.path);
      }
    const css = readFileSync("out" + page.cssPath, "utf8");
    for (const m of css.matchAll(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g))
      check(m[1], page.path);
    assert.doesNotMatch(
      page.html,
      /https?:\/\/(?:www\.)?gawpoe\.com\/(?:wp-content|wp-includes)/,
      page.path + " remote assets",
    );
  }
  assert.deepEqual(failures, []);
});
test("source theme, moving ticker and all eight reviews are preserved", () => {
  const home = capture.pages.find((p) => p.path === "/");
  const $ = load(home.html);
  const css = readFileSync("public" + home.cssPath, "utf8");
  assert.ok($(".ticker .ticker__item").length === 10);
  assert.equal($(".ti-review-item").length, 8);
  assert.equal($("template#trustindex-google-widget-html").length, 0);
  assert.match(css, /animation:\s*marquee 500s linear infinite/);
  assert.match(css, /font-family:Raleway/);
  assert.match(css, /font-family:["\']?Open Sans/);
  assert.match(css, /#232c61/i);
});
test("all discovered archive pagination pages are included, not just sitemap entries", () => {
  const pagination = capture.pages.filter((p) => /\/page\/\d+\//.test(p.path));
  assert.equal(pagination.length, 16);
  for (const page of pagination) {
    assert.ok(existsSync(filename(page.path)));
    assert.ok(page.sourceText.length > 100);
  }
});

test("entire public media library and responsive sizes are mirrored at original paths", () => {
  const catalog = JSON.parse(
    readFileSync("src/data/media-catalog.json", "utf8"),
  );
  const urls = [...new Set(catalog.flatMap((x) => [x.source, ...x.variants]))];
  assert.equal(catalog.length, 167);
  assert.equal(urls.length, 757);
  for (const url of urls)
    assert.ok(
      existsSync(path.join("out", decodeURIComponent(new URL(url).pathname))),
      url,
    );
  const media = JSON.parse(
    readFileSync("src/data/media-redirects.json", "utf8"),
  );
  assert.deepEqual(media.failures, []);
  for (const [from, to] of Object.entries(media.redirects).filter(
    ([key]) => !key.includes("?"),
  )) {
    assert.ok(existsSync(filename(from)), from);
    assert.ok(
      readFileSync("out/_redirects", "utf8").includes(`${from} ${to} 301`),
      from,
    );
  }
});
