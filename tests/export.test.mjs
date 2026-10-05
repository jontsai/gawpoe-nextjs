import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { load } from "cheerio";
const wp = JSON.parse(
  readFileSync("src/content/generated/wordpress.json", "utf8"),
);
const sitemap = JSON.parse(readFileSync("src/data/wp-sitemap.json", "utf8"));
const routes = [
  ...new Set([
    "/",
    ...wp.content.map((p) => (p.path ? `/${p.path}/` : "/")),
    ...sitemap.routes.map((p) => p.path),
  ]),
];
const filename = (route) => `out${route}index.html`;
test("all imported and sitemap URLs export real content with correct canonicals", () => {
  for (const route of routes) {
    assert.ok(existsSync(filename(route)), route);
    const $ = load(readFileSync(filename(route), "utf8"));
    assert.equal($("h1").length, 1, route);
    assert.equal(
      $("link[rel=canonical]").attr("href"),
      `https://www.gawpoe.com${route}`,
      route,
    );
    assert.doesNotMatch(
      $("main").text(),
      /Its final migrated content|included in the static Next.js build|This URL is part/,
    );
    assert.ok($("main").text().trim().length > 90, route);
  }
});
test("internal links and all embedded images resolve without WordPress", () => {
  const failures = [];
  for (const route of routes) {
    const $ = load(readFileSync(filename(route), "utf8"));
    for (const el of $("a[href],img[src]").toArray()) {
      const key = el.name === "img" ? "src" : "href",
        href = $(el).attr(key);
      if (!href || href.startsWith("#")) continue;
      const u = new URL(href, `https://www.gawpoe.com${route}`);
      if (el.name === "img" && u.origin !== "https://www.gawpoe.com")
        failures.push(`${route}: remote image ${href}`);
      if (u.origin !== "https://www.gawpoe.com") continue;
      const file = path.join("out", decodeURIComponent(u.pathname));
      if (!existsSync(file) && !existsSync(path.join(file, "index.html")))
        failures.push(`${route}: missing ${href}`);
    }
  }
  assert.deepEqual(failures, []);
});
test("archives contain exactly the matching imported posts", () => {
  for (const record of [
    ...wp.categories.map((c) => ({ ...c, type: "category" })),
    ...wp.authors.map((a) => ({ ...a, type: "author" })),
  ]) {
    if (!routes.includes(`/${record.path}/`)) continue;
    const $ = load(readFileSync(filename(`/${record.path}/`), "utf8"));
    const expected = wp.content.filter(
      (p) =>
        p.kind === "post" &&
        (record.type === "category"
          ? p.categories.includes(record.id)
          : p.author === record.id),
    );
    assert.equal($(".news-list article").length, expected.length, record.path);
  }
});
test("current team, press and practice directories are complete", () => {
  assert.equal(
    load(readFileSync(filename("/team/"), "utf8"))(".team-card").length,
    wp.team.length,
  );
  assert.equal(
    load(readFileSync(filename("/press/"), "utf8"))(".news-list article")
      .length,
    wp.content.filter((p) => p.kind === "post").length,
  );
  assert.equal(
    load(readFileSync(filename("/practice-areas/"), "utf8"))(".practice-list>a")
      .length,
    5,
  );
});

test("every original migration URL remains reachable", () => {
  for (const route of JSON.parse(
    readFileSync("tests/fixtures/legacy-routes.json", "utf8"),
  ))
    assert.ok(existsSync(filename(route)), route);
});
