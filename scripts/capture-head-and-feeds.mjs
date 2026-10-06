import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { load } from "cheerio";
const origin = "https://www.gawpoe.com";
const capture = JSON.parse(
  await readFile("src/content/generated/live-site.json", "utf8"),
);
const sharedMeta = new Map();
const feeds = [],
  pageFeeds = {},
  icons = [];
for (const page of capture.pages.filter((p) => !p.legacy)) {
  const $ = load(
    await readFile("artifacts/live-source/" + page.sourceFile, "utf8"),
  );
  for (const name of ["robots", "msapplication-TileImage"]) {
    const value = $("head meta")
      .filter((_, el) => $(el).attr("name") === name)
      .attr("content");
    if (!value) continue;
    const imageUrl =
      name === "msapplication-TileImage" ? new URL(value, origin) : null;
    if (imageUrl && imageUrl.origin !== origin)
      throw Error("Unreviewed tile icon origin");
    const content = imageUrl ? imageUrl.pathname : value;
    if (sharedMeta.has(name) && sharedMeta.get(name) !== content)
      throw Error(`Page-specific ${name} needs explicit capture mapping`);
    sharedMeta.set(name, content);
  }
  const references = [];
  $('head link[rel=alternate][type="application/rss+xml"]').each((_, el) => {
    const e = $(el),
      url = new URL(e.attr("href"), origin);
    if (url.origin !== origin) throw Error("Unreviewed feed origin");
    let id = feeds.findIndex((f) => f.path === url.pathname);
    if (id < 0) {
      id = feeds.length;
      feeds.push({
        path: url.pathname,
        title: e.attr("title") || "Gaw Poe feed",
        type: "application/rss+xml",
      });
    }
    references.push(id);
  });
  pageFeeds[page.path] = references;
  $("head link[rel=icon],head link[rel=apple-touch-icon]").each((_, el) => {
    const e = $(el),
      url = new URL(e.attr("href"), origin);
    if (url.origin !== origin) throw Error("Unreviewed icon origin");
    const icon = {
      rel: e.attr("rel"),
      url: url.pathname,
      ...(e.attr("sizes") ? { sizes: e.attr("sizes") } : {}),
    };
    if (!icons.some((i) => JSON.stringify(i) === JSON.stringify(icon)))
      icons.push(icon);
  });
}
for (const page of capture.pages.filter((p) => p.legacy))
  pageFeeds[page.path] = pageFeeds["/"] || [];
for (const icon of icons)
  await access(path.join("public", decodeURIComponent(icon.url)));
// Validate every response before publishing any new feed/metadata snapshot.
const documents = [];
for (const feed of feeds) {
  const response = await fetch(origin + feed.path, {
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw Error(`Feed ${feed.path}: HTTP ${response.status}`);
  const xml = await response.text();
  const $ = load(xml, { xml: true });
  if (!$("rss > channel").length || /<html[\s>]/i.test(xml))
    throw Error(`Invalid RSS: ${feed.path}`);
  const filename = feed.path + "index.xml";
  documents.push({ filename, xml });
  Object.assign(feed, {
    file: filename,
    sha256: createHash("sha256").update(xml).digest("hex"),
    items: $("channel > item").length,
  });
}
for (const { filename, xml } of documents) {
  const target = path.resolve("public", "." + filename);
  if (!target.startsWith(path.resolve("public") + path.sep))
    throw Error("Invalid feed path");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, xml);
  await writeFile(path.join(path.dirname(target), "index.html"), xml);
}
const manifest = { capturedAt: new Date().toISOString(), feeds };
await writeFile(
  "public/feed-manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await writeFile(
  "src/data/head-metadata.json",
  JSON.stringify(
    {
      icons,
      meta: [...sharedMeta].map(([name, content]) => ({ name, content })),
      feeds: feeds.map(({ path, title, type }) => ({ path, title, type })),
      pageFeeds,
    },
    null,
    2,
  ) + "\n",
);
// Supported by header-aware static hosts; configuring the selected production host remains a cutover task.
await writeFile(
  "public/_headers",
  feeds
    .flatMap((f) => [f.path, f.file, f.path + "index.html"])
    .map((url) => `${url}\n  Content-Type: application/rss+xml; charset=utf-8`)
    .join("\n\n") + "\n",
);
console.log(
  JSON.stringify({
    feeds: feeds.length,
    icons: icons.length,
    feedItems: feeds.map((f) => ({ path: f.path, items: f.items })),
  }),
);
