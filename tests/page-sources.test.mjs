import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { readSiteContent } from "../src/lib/page-sources.mjs";

test("every page has a separate HTML and metadata source; no jumbo duplicate", () => {
  const site = readSiteContent();
  assert.equal(site.pages.length, 132);
  assert.equal(new Set(site.pages.map(p => p.path)).size, site.pages.length);
  assert.ok(!existsSync("src/content/generated/live-site.json"));
  assert.ok(!("pages" in JSON.parse(readFileSync("src/content/site.json"))));
  for (const page of site.pages) {
    const directory = path.join("src/content/pages", page.path);
    assert.equal(readFileSync(path.join(directory, "index.html"), "utf8"), page.html);
    assert.ok(!("html" in JSON.parse(readFileSync(path.join(directory, "page.json")))));
  }
});

test("loader discovers nested sources and rejects incomplete/mismatched pages", () => {
  const root = mkdtempSync(path.join(tmpdir(), "gawpoe-pages-"));
  try {
    const directory = path.join(root, "src/content/pages/news/page/2");
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(root, "src/content/site.json"), '{"redirects":[]}');
    const metadata = { path: "/news/page/2/", title: "Test", description: "Test", bodyClass: "", cssPath: "/test.css" };
    writeFileSync(path.join(directory, "page.json"), JSON.stringify(metadata));
    assert.throws(() => readSiteContent(root), /Incomplete/);
    writeFileSync(path.join(directory, "index.html"), "<p>Editable HTML</p>\n");
    assert.equal(readSiteContent(root).pages[0].html, "<p>Editable HTML</p>\n");
    writeFileSync(path.join(directory, "page.json"), JSON.stringify({ ...metadata, path: "/wrong/" }));
    assert.throws(() => readSiteContent(root), /match directory/);
    writeFileSync(path.join(directory, "page.json"), JSON.stringify({ ...metadata, html: "duplicate" }));
    assert.throws(() => readSiteContent(root), /belongs in index.html/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("all retired import entry points fail before running their pipelines", () => {
  for (const script of ["retired-import", "capture-live-site", "capture-head-and-feeds", "extract-fragments", "capture-media", "sync-wp-sitemap"]) {
    const result = spawnSync(process.execPath, [`scripts/${script}.mjs`], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /capture\/refresh pipeline is retired/);
  }
});
