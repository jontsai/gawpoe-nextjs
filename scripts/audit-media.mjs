// Read-only public-source audit: compare original bytes, not merely HTTP status.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
const json = async (p) => JSON.parse(await readFile(p, "utf8"));
const catalog = await json("src/data/media-catalog.json");
const capture = await json("src/content/generated/live-site.json");
const mediaUrls = [
  ...new Set(catalog.flatMap((p) => [p.source, ...p.variants])),
];
const source = "https://www.gawpoe.com";
const liveCatalog = [];
for (let page = 1, total = 1; page <= total; page++) {
  const r = await fetch(
    `${source}/wp-json/wp/v2/media?per_page=100&page=${page}`,
    { signal: AbortSignal.timeout(30000) },
  );
  if (!r.ok) throw Error(`Media API: ${r.status}`);
  total = Number(r.headers.get("x-wp-totalpages"));
  liveCatalog.push(...(await r.json()));
}
const liveUrls = [
  ...new Set(
    liveCatalog.flatMap((p) => [
      p.source_url,
      ...Object.values(p.media_details?.sizes || {})
        .map((s) => s.source_url)
        .filter(Boolean),
      ...(p.media_details?.original_image
        ? [new URL(p.media_details.original_image, p.source_url).href]
        : []),
    ]),
  ),
];
const missing = liveUrls.filter((u) => !mediaUrls.includes(u));
const extra = mediaUrls.filter((u) => !liveUrls.includes(u));
const assets = new Map(
  mediaUrls.map((url) => [url, decodeURIComponent(new URL(url).pathname)]),
);
// Include images referenced outside the media catalog (theme, icons, reviews).
for (const [url, local] of Object.entries(capture.assets)) {
  if (/\.(?:png|jpe?g|gif|webp|avif|svg|ico)(?:\?|$)/i.test(url))
    assets.set(url, local);
}
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const rows = [];
let cursor = 0;
const entries = [...assets];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < entries.length) {
      const [url, local] = entries[cursor++];
      try {
        let r;
        for (let attempt = 0; attempt < 3; attempt++) {
          r = await fetch(url, { signal: AbortSignal.timeout(30000) });
          if (r.ok) break;
          await r.body?.cancel();
        }
        if (!r.ok) throw Error(`HTTP ${r.status}`);
        const remote = Buffer.from(await r.arrayBuffer());
        const files = await Promise.all(
          ["public", "out", "docs"].map((root) => readFile(root + local)),
        );
        const hash = digest(remote);
        const hashes = files.map(digest);
        if (hashes.some((h) => h !== hash))
          throw Error("Source/public/out/docs byte mismatch");
        let dimensions = null;
        if (/\.(?:png|jpe?g|gif|webp|avif)$/i.test(new URL(url).pathname)) {
          const image = sharp(files[0], { failOn: "error" });
          const m = await image.metadata();
          await image.stats(); // Full decode, not just a header/existence check.
          dimensions = { width: m.width, height: m.height, format: m.format };
        }
        rows.push({
          url,
          local,
          bytes: remote.length,
          sha256: hash,
          dimensions,
          status: "pass",
        });
      } catch (error) {
        rows.push({ url, local, status: "fail", error: String(error) });
      }
      if (rows.length % 100 === 0)
        console.log(`Audited ${rows.length}/${entries.length}`);
    }
  }),
);
rows.sort((a, b) => a.url.localeCompare(b.url));
const report = {
  checkedAt: new Date().toISOString(),
  liveCatalogCount: liveCatalog.length,
  capturedCatalogCount: catalog.length,
  mediaFileCount: mediaUrls.length,
  missing,
  extra,
  auditedAssets: rows.length,
  failures: rows.filter((r) => r.status !== "pass"),
  assets: rows,
};
await writeFile(
  "verification/media-audit.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify({ ...report, assets: undefined }, null, 2));
if (missing.length || extra.length || report.failures.length)
  process.exitCode = 1;
