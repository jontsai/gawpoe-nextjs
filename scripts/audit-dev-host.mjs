import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { load } from "cheerio";
import { primaryContract } from "./content-contract.mjs";
import { locations } from "./check-sitemap-parity.mjs";
const base = process.env.BASE_URL || "https://gawpoe.dev.upinthe.xyz";
const readJson = async (p) => JSON.parse(await readFile(p, "utf8"));
const pages = (await readJson("src/content/generated/live-site.json")).pages;
const assets = (await readJson("verification/media-audit.json")).assets;
const redirects = await readJson("public/legacy-redirects.json");
const feeds = (await readJson("public/feed-manifest.json")).feeds;
const rows = [];
async function get(route) {
  const r = await fetch(new URL(route, base), {
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  assert.match(
    r.headers.get("x-robots-tag") || "",
    /noindex/,
    "Missing noindex: " + route,
  );
  return r;
}
const tasks = [
  ...pages.map((p) => ({
    kind: "page",
    path: p.path,
    check: async () => {
      const r = await get(p.path);
      assert.equal(r.status, 200);
      const $ = load(await r.text());
      assert.equal(primaryContract($).sourceTextHash, p.sourceTextHash);
      assert.equal(
        $("link[rel=canonical]").attr("href"),
        "https://www.gawpoe.com" + p.path,
      );
    },
  })),
  ...assets.map((a) => ({
    kind: "asset",
    path: a.local,
    check: async () => {
      const r = await get(a.local);
      assert.equal(r.status, 200);
      const hash = createHash("sha256")
        .update(Buffer.from(await r.arrayBuffer()))
        .digest("hex");
      assert.equal(hash, a.sha256);
    },
  })),
  ...Object.entries(redirects).map(([from, to]) => ({
    kind: "redirect",
    path: from,
    check: async () => {
      const r = await get(from);
      assert.equal(r.status, 301);
      const target = new URL(r.headers.get("location"), base);
      assert.equal(target.origin, new URL(base).origin);
      assert.equal(target.pathname + target.search, to);
      await r.body?.cancel();
    },
  })),
  ...feeds.map((f) => ({
    kind: "feed",
    path: f.path,
    check: async () => {
      const r = await get(f.path);
      assert.equal(r.status, 200);
      assert.match(r.headers.get("content-type"), /application\/rss\+xml/);
      assert.equal(
        createHash("sha256")
          .update(Buffer.from(await r.arrayBuffer()))
          .digest("hex"),
        f.sha256,
      );
    },
  })),
  {
    kind: "missing",
    path: "/nonexistent-gawpoe-verification-page/",
    check: async () => {
      const r = await get("/nonexistent-gawpoe-verification-page/");
      assert.equal(r.status, 404);
      assert.match(await r.text(), /Page not found/);
    },
  },
  {
    kind: "sitemap",
    path: "/sitemap.xml",
    check: async () => {
      const expected = (await readJson("src/data/wp-sitemap.json")).routes
        .map((r) => r.sourceUrl)
        .sort();
      const r = await get("/sitemap.xml");
      assert.equal(r.status, 200);
      assert.match(r.headers.get("content-type"), /xml/);
      assert.deepEqual(locations(await r.text()).sort(), expected);
      const i = await get("/wp-sitemap.xml");
      const children = locations(await i.text());
      let urls = [];
      for (const url of children) {
        const c = await get(new URL(url).pathname);
        assert.equal(c.status, 200);
        urls.push(...locations(await c.text()));
      }
      assert.deepEqual(urls.sort(), expected);
    },
  },
];
let cursor = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        await task.check();
        rows.push({ kind: task.kind, path: task.path, status: "pass" });
      } catch (e) {
        rows.push({
          kind: task.kind,
          path: task.path,
          status: "fail",
          error: String(e),
        });
      }
      if (rows.length % 200 === 0)
        console.log(`Checked ${rows.length}/${tasks.length}`);
    }
  }),
);
rows.sort((a, b) => (a.kind + a.path).localeCompare(b.kind + b.path));
const report = {
  checkedAt: new Date().toISOString(),
  base,
  counts: {
    pages: pages.length,
    assets: assets.length,
    redirects: Object.keys(redirects).length,
    feeds: feeds.length,
  },
  failures: rows.filter((r) => r.status === "fail"),
  checks: rows,
};
await writeFile(
  "verification/dev-host-audit.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify({ ...report, checks: undefined }, null, 2));
if (report.failures.length) process.exitCode = 1;
