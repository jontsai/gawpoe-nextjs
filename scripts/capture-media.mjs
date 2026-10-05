import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
const origin = "https://www.gawpoe.com";
const all = [];
for (let page = 1, total = 1; page <= total; page++) {
  const r = await fetch(
    `${origin}/wp-json/wp/v2/media?per_page=100&page=${page}`,
    { signal: AbortSignal.timeout(30000) },
  );
  if (!r.ok) throw Error(`Media catalog ${r.status}`);
  total = Number(r.headers.get("x-wp-totalpages"));
  all.push(...(await r.json()));
}
const catalog = all.map((p) => ({
  id: p.id,
  link: p.link,
  source: p.source_url,
  variants: Object.values(p.media_details?.sizes || {})
    .map((x) => x.source_url)
    .filter(Boolean),
}));
const redirects = {},
  attachmentPages = [],
  queryPages = {},
  failures = [];
const assets = [...new Set(catalog.flatMap((p) => [p.source, ...p.variants]))];
async function concurrent(items, fn) {
  let index = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (index < items.length) {
        const item = items[index++];
        await fn(item);
      }
    }),
  );
}
await concurrent(assets, async (url) => {
  const u = new URL(url);
  if (!["www.gawpoe.com", "gawpoe.com"].includes(u.hostname))
    throw Error("Unexpected media source");
  const file = path.resolve("public", "." + decodeURIComponent(u.pathname));
  if (!file.startsWith(path.resolve("public") + path.sep))
    throw Error("Invalid path");
  try {
    await access(file);
    return;
  } catch {}
  const r = await fetch(u, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) {
    failures.push({ url, status: r.status });
    return;
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(await r.arrayBuffer()));
});
await concurrent(catalog, async (media) => {
  for (const url of new Set([
    media.link,
    `${origin}/?attachment_id=${media.id}`,
  ])) {
    const r = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
    });
    const location = r.headers.get("location");
    const u = new URL(url);
    const from = u.pathname + u.search;
    if (r.status >= 300 && r.status < 400 && location) {
      const to = new URL(location, origin);
      if (!["www.gawpoe.com", "gawpoe.com"].includes(to.hostname))
        throw Error("Unexpected attachment redirect");
      redirects[from] = to.pathname + to.search;
    } else if (r.ok) {
      if (u.search) {
        const destination = `/attachment/${media.id}/`;
        queryPages[from] = destination;
        redirects[from] = destination;
      } else attachmentPages.push(from);
    } else failures.push({ url, status: r.status });
    await r.body?.cancel();
  }
});
await writeFile(
  "src/data/media-catalog.json",
  JSON.stringify(catalog, null, 2) + "\n",
);
await writeFile(
  "src/data/media-redirects.json",
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      redirects,
      attachmentPages,
      queryPages,
      failures,
      assetCount: assets.length,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    items: catalog.length,
    assets: assets.length,
    redirects: Object.keys(redirects).length,
    attachmentPages,
    failures,
  }),
);
if (failures.length) process.exitCode = 1;
